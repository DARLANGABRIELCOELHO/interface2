// data/connection_DB.js

class ConnectionDB {
    constructor(tableName) {
        this.tableName = `IFIX_${tableName}`;
        this.initTable();
        
        // Configurações
        this.config = {
            useEncryption: false,
            autoBackup: true,
            backupInterval: 300000, // 5 minutos
            maxItems: 10000,
            enableLogging: false
        };
        
        // Inicia backup automático se habilitado
        if (this.config.autoBackup) {
            this.startAutoBackup();
        }
    }

    // Inicializa a tabela com estrutura padrão
    initTable() {
        try {
            let data = localStorage.getItem(this.tableName);
            
            if (!data) {
                // Cria tabela com estrutura inicial
                const initialData = {
                    meta: {
                        created: new Date().toISOString(),
                        version: '1.0.0',
                        lastModified: new Date().toISOString(),
                        schema: {
                            fields: [],
                            indexes: ['id']
                        }
                    },
                    data: [],
                    indexes: {
                        byId: new Map(),
                        byDate: [],
                        byStatus: new Map()
                    },
                    stats: {
                        totalItems: 0,
                        lastInsertId: 0,
                        lastOperation: null,
                        operationCount: 0
                    }
                };
                this.saveToStorage(initialData);
            } else {
                // Migra tabelas antigas para nova estrutura
                const parsed = JSON.parse(data);
                if (Array.isArray(parsed)) {
                    this.migrateOldFormat(parsed);
                }
            }
            
            this.log(`Tabela ${this.tableName} inicializada`);
        } catch (error) {
            console.error(`Erro ao inicializar tabela ${this.tableName}:`, error);
            // Tenta criar uma estrutura limpa em caso de erro
            this.createCleanTable();
        }
    }

    // Cria uma tabela limpa em caso de erro
    createCleanTable() {
        const cleanData = {
            meta: {
                created: new Date().toISOString(),
                version: '1.0.0',
                lastModified: new Date().toISOString(),
                schema: { fields: [], indexes: ['id'] }
            },
            data: [],
            indexes: { byId: {}, byDate: [], byStatus: {} },
            stats: { totalItems: 0, lastInsertId: 0, lastOperation: 'clean_create', operationCount: 0 }
        };
        
        try {
            localStorage.setItem(this.tableName, JSON.stringify(cleanData));
            localStorage.setItem(`${this.tableName}_backup_${Date.now()}`, JSON.stringify(cleanData));
        } catch (error) {
            console.error('Erro crítico ao criar tabela limpa:', error);
            throw error;
        }
    }

    // Migra dados do formato antigo (array) para novo formato
    migrateOldFormat(oldData) {
        console.log(`Migrando dados antigos da tabela ${this.tableName}...`);
        
        const newStructure = {
            meta: {
                created: new Date().toISOString(),
                version: '1.0.0',
                lastModified: new Date().toISOString(),
                migratedFrom: 'array_format',
                migrationDate: new Date().toISOString()
            },
            data: oldData,
            indexes: {
                byId: {},
                byDate: [],
                byStatus: {}
            },
            stats: {
                totalItems: oldData.length,
                lastInsertId: Math.max(...oldData.map(item => parseInt(item.id) || 0)),
                lastOperation: 'migration',
                operationCount: 0
            }
        };

        // Reconstrui índices
        oldData.forEach((item, index) => {
            if (item.id) newStructure.indexes.byId[item.id] = index;
            if (item.created_at || item.createdAt) {
                newStructure.indexes.byDate.push({
                    id: item.id,
                    date: item.created_at || item.createdAt,
                    index: index
                });
            }
            if (item.status) {
                if (!newStructure.indexes.byStatus[item.status]) {
                    newStructure.indexes.byStatus[item.status] = [];
                }
                newStructure.indexes.byStatus[item.status].push(index);
            }
        });

        // Ordena por data
        newStructure.indexes.byDate.sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );

        this.saveToStorage(newStructure);
        console.log(`Migração concluída: ${oldData.length} itens migrados`);
    }

    // SALVA NO STORAGE COM COMPRESSÃO E BACKUP
    saveToStorage(data) {
        try {
            // Atualiza metadados
            data.meta.lastModified = new Date().toISOString();
            data.meta.version = '1.0.0';
            
            // Atualiza estatísticas
            data.stats.totalItems = data.data.length;
            data.stats.lastOperation = 'save';
            data.stats.operationCount = (data.stats.operationCount || 0) + 1;
            
            // Verifica limite de armazenamento
            const dataSize = JSON.stringify(data).length;
            const maxSize = 4.5 * 1024 * 1024; // 4.5MB (deixando margem)
            
            if (dataSize > maxSize) {
                this.handleStorageLimit(dataSize);
                return false;
            }
            
            // Faz backup antes de salvar
            if (this.config.autoBackup) {
                this.createBackup();
            }
            
            // Salva no localStorage
            localStorage.setItem(this.tableName, JSON.stringify(data));
            
            // Atualiza índice de performance
            this.updatePerformanceIndex();
            
            this.log(`Dados salvos: ${data.data.length} itens, ${dataSize} bytes`);
            return true;
            
        } catch (error) {
            console.error(`Erro ao salvar na tabela ${this.tableName}:`, error);
            
            // Tenta limpar cache antigo
            if (error.name === 'QuotaExceededError') {
                this.clearOldBackups();
                this.optimizeStorage();
                // Tenta novamente
                try {
                    localStorage.setItem(this.tableName, JSON.stringify(data));
                    return true;
                } catch (retryError) {
                    throw new Error(`Espaço insuficiente mesmo após limpeza: ${retryError.message}`);
                }
            }
            throw error;
        }
    }

    // CARREGA DO STORAGE COM VALIDAÇÃO
    loadFromStorage() {
        try {
            const data = localStorage.getItem(this.tableName);
            
            if (!data) {
                throw new Error(`Tabela ${this.tableName} não encontrada`);
            }
            
            const parsed = JSON.parse(data);
            
            // Valida estrutura
            if (!parsed.meta || !parsed.data || !parsed.indexes) {
                console.warn(`Estrutura inválida na tabela ${this.tableName}, tentando recuperar...`);
                return this.recoverData(parsed);
            }
            
            // Verifica consistência
            const isValid = this.validateData(parsed);
            if (!isValid) {
                console.warn(`Dados inconsistentes na tabela ${this.tableName}, reconstruindo índices...`);
                return this.rebuildIndexes(parsed);
            }
            
            return parsed;
            
        } catch (error) {
            console.error(`Erro ao carregar tabela ${this.tableName}:`, error);
            
            // Tenta carregar do backup mais recente
            const backup = this.loadLatestBackup();
            if (backup) {
                console.log(`Carregando backup da tabela ${this.tableName}`);
                return backup;
            }
            
            // Se não houver backup, retorna estrutura vazia
            return {
                meta: {
                    created: new Date().toISOString(),
                    version: '1.0.0',
                    lastModified: new Date().toISOString(),
                    recovered: true
                },
                data: [],
                indexes: { byId: {}, byDate: [], byStatus: {} },
                stats: { totalItems: 0, lastInsertId: 0, lastOperation: 'error_recovery', operationCount: 0 }
            };
        }
    }

    // MÉTODOS CRUD MELHORADOS

    // SELECT * FROM table
    findAll(options = {}) {
        const { 
            sortBy = 'created_at', 
            sortOrder = 'desc', 
            limit = null, 
            offset = 0,
            filter = null 
        } = options;
        
        const storage = this.loadFromStorage();
        let results = [...storage.data];
        
        // Aplica filtro se fornecido
        if (filter && typeof filter === 'function') {
            results = results.filter(filter);
        }
        
        // Ordenação
        results.sort((a, b) => {
            const aVal = a[sortBy] || a.created_at || '';
            const bVal = b[sortBy] || b.created_at || '';
            
            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            } else {
                return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
            }
        });
        
        // Paginação
        if (limit) {
            results = results.slice(offset, offset + limit);
        }
        
        return results;
    }

    // SELECT * FROM table WHERE id = ?
    findById(id) {
        const storage = this.loadFromStorage();
        
        // Usa índice se disponível
        if (storage.indexes.byId && storage.indexes.byId[id] !== undefined) {
            const index = storage.indexes.byId[id];
            return storage.data[index] || null;
        }
        
        // Fallback: busca linear
        return storage.data.find(item => item.id === id) || null;
    }

    // SELECT * FROM table WHERE field = value
    findByField(field, value, options = {}) {
        const storage = this.loadFromStorage();
        let results = storage.data.filter(item => {
            const fieldValue = item[field];
            if (Array.isArray(fieldValue)) {
                return fieldValue.includes(value);
            }
            return fieldValue === value;
        });
        
        // Ordenação
        if (options.sortBy) {
            results.sort((a, b) => {
                const aVal = a[options.sortBy] || '';
                const bVal = b[options.sortBy] || '';
                return options.sortOrder === 'asc' ? 
                    aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            });
        }
        
        return results;
    }

    // SELECT * FROM table WHERE conditions (AND)
    findWhere(conditions, options = {}) {
        const storage = this.loadFromStorage();
        let results = storage.data.filter(item => {
            return Object.entries(conditions).every(([key, value]) => {
                if (typeof value === 'function') {
                    return value(item[key]);
                }
                return item[key] === value;
            });
        });
        
        // Limite e offset
        if (options.limit) {
            const offset = options.offset || 0;
            results = results.slice(offset, offset + options.limit);
        }
        
        return results;
    }

    // INSERT INTO table
    create(data) {
        const storage = this.loadFromStorage();
        
        // Valida dados
        if (!this.validateItem(data)) {
            throw new Error('Dados inválidos para criação');
        }
        
        // Gera ID
        const newId = this.generateId();
        const timestamp = new Date().toISOString();
        
        const newItem = {
            id: newId,
            created_at: timestamp,
            updated_at: timestamp,
            _version: 1,
            ...data
        };
        
        // Adiciona aos dados
        const newIndex = storage.data.length;
        storage.data.push(newItem);
        
        // Atualiza índices
        storage.indexes.byId[newId] = newIndex;
        storage.indexes.byDate.unshift({
            id: newId,
            date: timestamp,
            index: newIndex
        });
        
        // Índice por status se existir
        if (newItem.status) {
            if (!storage.indexes.byStatus[newItem.status]) {
                storage.indexes.byStatus[newItem.status] = [];
            }
            storage.indexes.byStatus[newItem.status].push(newIndex);
        }
        
        // Atualiza estatísticas
        storage.stats.lastInsertId = newId;
        storage.stats.totalItems = storage.data.length;
        
        // Salva
        this.saveToStorage(storage);
        
        this.log(`Item criado: ${newId}`);
        return newItem;
    }

    // BATCH INSERT
    createMany(items) {
        const results = [];
        const storage = this.loadFromStorage();
        
        items.forEach(data => {
            if (this.validateItem(data)) {
                const newId = this.generateId();
                const timestamp = new Date().toISOString();
                
                const newItem = {
                    id: newId,
                    created_at: timestamp,
                    updated_at: timestamp,
                    _version: 1,
                    ...data
                };
                
                const newIndex = storage.data.length;
                storage.data.push(newItem);
                storage.indexes.byId[newId] = newIndex;
                
                results.push(newItem);
            }
        });
        
        // Reconstroi índices de data
        this.rebuildIndexes(storage);
        this.saveToStorage(storage);
        
        return results;
    }

    // UPDATE table SET ... WHERE id = ?
    update(id, newData) {
        const storage = this.loadFromStorage();
        const index = storage.indexes.byId[id];
        
        if (index === undefined) {
            throw new Error(`Item com ID ${id} não encontrado`);
        }
        
        const oldItem = storage.data[index];
        
        // Preserva campos do sistema
        const updatedItem = {
            ...oldItem,
            ...newData,
            id: oldItem.id, // Garante que ID não seja alterado
            created_at: oldItem.created_at, // Preserva data criação
            updated_at: new Date().toISOString(),
            _version: (oldItem._version || 1) + 1,
            _previousVersion: oldItem._version || 1
        };
        
        // Atualiza dados
        storage.data[index] = updatedItem;
        
        // Atualiza índices de status se necessário
        if (oldItem.status !== updatedItem.status) {
            // Remove do índice antigo
            if (oldItem.status && storage.indexes.byStatus[oldItem.status]) {
                const oldStatusIndex = storage.indexes.byStatus[oldItem.status]
                    .indexOf(index);
                if (oldStatusIndex > -1) {
                    storage.indexes.byStatus[oldItem.status].splice(oldStatusIndex, 1);
                }
            }
            
            // Adiciona ao novo índice
            if (updatedItem.status) {
                if (!storage.indexes.byStatus[updatedItem.status]) {
                    storage.indexes.byStatus[updatedItem.status] = [];
                }
                storage.indexes.byStatus[updatedItem.status].push(index);
            }
        }
        
        this.saveToStorage(storage);
        this.log(`Item atualizado: ${id} (v${updatedItem._version})`);
        
        return updatedItem;
    }

    // UPSERT: Update se existir, Create se não existir
    upsert(id, data) {
        try {
            return this.update(id, data);
        } catch (error) {
            return this.create({ ...data, id });
        }
    }

    // DELETE FROM table WHERE id = ?
    delete(id) {
        const storage = this.loadFromStorage();
        const index = storage.indexes.byId[id];
        
        if (index === undefined) {
            return false;
        }
        
        // Remove dos dados
        const [deletedItem] = storage.data.splice(index, 1);
        
        // Remove dos índices
        delete storage.indexes.byId[id];
        
        // Remove do índice de data
        const dateIndex = storage.indexes.byDate.findIndex(item => item.id === id);
        if (dateIndex > -1) {
            storage.indexes.byDate.splice(dateIndex, 1);
        }
        
        // Remove do índice de status
        if (deletedItem.status && storage.indexes.byStatus[deletedItem.status]) {
            const statusIndex = storage.indexes.byStatus[deletedItem.status]
                .indexOf(index);
            if (statusIndex > -1) {
                storage.indexes.byStatus[deletedItem.status].splice(statusIndex, 1);
            }
        }
        
        // Ajusta índices após remoção
        this.reindexAfterDeletion(storage, index);
        
        // Atualiza estatísticas
        storage.stats.totalItems = storage.data.length;
        
        this.saveToStorage(storage);
        this.log(`Item deletado: ${id}`);
        
        return true;
    }

    // UTILITÁRIOS

    // Gera ID único
    generateId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `${timestamp}_${random}`;
    }

    // Conta total de itens
    count() {
        const storage = this.loadFromStorage();
        return storage.stats.totalItems || storage.data.length;
    }

    // Conta por campo
    countBy(field, value) {
        const storage = this.loadFromStorage();
        return storage.data.filter(item => item[field] === value).length;
    }

    // Obtém estatísticas
    getStats() {
        const storage = this.loadFromStorage();
        return {
            ...storage.stats,
            tableName: this.tableName,
            storageSize: JSON.stringify(storage).length,
            lastAccess: new Date().toISOString()
        };
    }

    // Exporta dados
    export(format = 'json') {
        const storage = this.loadFromStorage();
        
        switch (format.toLowerCase()) {
            case 'json':
                return JSON.stringify(storage.data, null, 2);
            case 'csv':
                return this.convertToCSV(storage.data);
            case 'array':
                return storage.data;
            default:
                return storage.data;
        }
    }

    // Importa dados
    import(data, options = { clearBeforeImport: false }) {
        let items = data;
        
        if (typeof data === 'string') {
            try {
                items = JSON.parse(data);
            } catch (error) {
                throw new Error('Formato de importação inválido');
            }
        }
        
        if (!Array.isArray(items)) {
            throw new Error('Dados de importação devem ser um array');
        }
        
        let storage;
        
        if (options.clearBeforeImport) {
            storage = {
                meta: {
                    created: new Date().toISOString(),
                    version: '1.0.0',
                    lastModified: new Date().toISOString(),
                    imported: true
                },
                data: [],
                indexes: { byId: {}, byDate: [], byStatus: {} },
                stats: { totalItems: 0, lastInsertId: 0, lastOperation: 'import', operationCount: 0 }
            };
        } else {
            storage = this.loadFromStorage();
        }
        
        // Adiciona itens
        items.forEach(item => {
            const newId = item.id || this.generateId();
            const timestamp = new Date().toISOString();
            
            const newItem = {
                ...item,
                id: newId,
                created_at: item.created_at || timestamp,
                updated_at: timestamp,
                _version: 1,
                _imported: true
            };
            
            const newIndex = storage.data.length;
            storage.data.push(newItem);
            storage.indexes.byId[newId] = newIndex;
        });
        
        // Reconstroi índices
        this.rebuildIndexes(storage);
        this.saveToStorage(storage);
        
        return items.length;
    }

    // Limpa a tabela (TRUNCATE)
    clear() {
        const emptyStructure = {
            meta: {
                created: new Date().toISOString(),
                version: '1.0.0',
                lastModified: new Date().toISOString(),
                cleared: true
            },
            data: [],
            indexes: { byId: {}, byDate: [], byStatus: {} },
            stats: { totalItems: 0, lastInsertId: 0, lastOperation: 'clear', operationCount: 0 }
        };
        
        this.saveToStorage(emptyStructure);
        this.log(`Tabela ${this.tableName} limpa`);
    }

    // BACKUP E RECUPERAÇÃO

    // Cria backup
    createBackup() {
        try {
            const storage = this.loadFromStorage();
            const backupKey = `${this.tableName}_backup_${Date.now()}`;
            localStorage.setItem(backupKey, JSON.stringify(storage));
            
            // Limita número de backups
            this.cleanupOldBackups();
            
            this.log(`Backup criado: ${backupKey}`);
            return backupKey;
        } catch (error) {
            console.error('Erro ao criar backup:', error);
            return null;
        }
    }

    // Carrega backup mais recente
    loadLatestBackup() {
        const backups = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(`${this.tableName}_backup_`)) {
                const timestamp = parseInt(key.split('_backup_')[1]);
                backups.push({ key, timestamp });
            }
        }
        
        if (backups.length === 0) return null;
        
        // Ordena por timestamp (mais recente primeiro)
        backups.sort((a, b) => b.timestamp - a.timestamp);
        
        try {
            const data = localStorage.getItem(backups[0].key);
            return JSON.parse(data);
        } catch (error) {
            console.error('Erro ao carregar backup:', error);
            return null;
        }
    }

    // Restaura do backup
    restoreFromBackup(backupKey = null) {
        let keyToRestore = backupKey;
        
        if (!keyToRestore) {
            const backup = this.loadLatestBackup();
            if (!backup) {
                throw new Error('Nenhum backup disponível');
            }
            // Obtém a chave do backup mais recente
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith(`${this.tableName}_backup_`)) {
                    const data = JSON.parse(localStorage.getItem(key));
                    if (JSON.stringify(data) === JSON.stringify(backup)) {
                        keyToRestore = key;
                        break;
                    }
                }
            }
        }
        
        if (!keyToRestore) {
            throw new Error('Backup não encontrado');
        }
        
        try {
            const backupData = localStorage.getItem(keyToRestore);
            const parsed = JSON.parse(backupData);
            
            // Restaura dados
            localStorage.setItem(this.tableName, backupData);
            this.log(`Sistema restaurado do backup: ${keyToRestore}`);
            
            return parsed;
        } catch (error) {
            throw new Error(`Falha ao restaurar backup: ${error.message}`);
        }
    }

    // Limpa backups antigos
    cleanupOldBackups() {
        const backups = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(`${this.tableName}_backup_`)) {
                const timestamp = parseInt(key.split('_backup_')[1]);
                backups.push({ key, timestamp });
            }
        }
        
        // Mantém apenas os 5 backups mais recentes
        if (backups.length > 5) {
            backups.sort((a, b) => b.timestamp - a.timestamp);
            const toDelete = backups.slice(5);
            
            toDelete.forEach(backup => {
                localStorage.removeItem(backup.key);
                this.log(`Backup antigo removido: ${backup.key}`);
            });
        }
    }

    // VALIDAÇÃO E INTEGRIDADE

    // Valida estrutura de dados
    validateData(storage) {
        if (!storage || typeof storage !== 'object') return false;
        if (!Array.isArray(storage.data)) return false;
        
        // Verifica consistência dos índices
        const ids = new Set();
        for (const item of storage.data) {
            if (!item.id) return false;
            if (ids.has(item.id)) return false;
            ids.add(item.id);
            
            if (storage.indexes.byId[item.id] === undefined) return false;
        }
        
        return true;
    }

    // Valida item individual
    validateItem(item) {
        if (!item || typeof item !== 'object') return false;
        
        // Valida campos obrigatórios baseados no schema
        const schema = this.loadFromStorage().meta.schema;
        if (schema && schema.requiredFields) {
            for (const field of schema.requiredFields) {
                if (!item.hasOwnProperty(field)) return false;
            }
        }
        
        return true;
    }

    // Reconstrói índices
    rebuildIndexes(storage) {
        storage.indexes = {
            byId: {},
            byDate: [],
            byStatus: {}
        };
        
        storage.data.forEach((item, index) => {
            // Índice por ID
            storage.indexes.byId[item.id] = index;
            
            // Índice por data
            storage.indexes.byDate.push({
                id: item.id,
                date: item.created_at || item.updated_at || new Date().toISOString(),
                index: index
            });
            
            // Índice por status
            if (item.status) {
                if (!storage.indexes.byStatus[item.status]) {
                    storage.indexes.byStatus[item.status] = [];
                }
                storage.indexes.byStatus[item.status].push(index);
            }
        });
        
        // Ordena índice por data (mais recente primeiro)
        storage.indexes.byDate.sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
        
        return storage;
    }

    // Reajusta índices após deleção
    reindexAfterDeletion(storage, deletedIndex) {
        // Atualiza índices que apontam para posições após o item deletado
        Object.keys(storage.indexes.byId).forEach(id => {
            const index = storage.indexes.byId[id];
            if (index > deletedIndex) {
                storage.indexes.byId[id] = index - 1;
            }
        });
        
        // Atualiza índice de data
        storage.indexes.byDate.forEach(entry => {
            if (entry.index > deletedIndex) {
                entry.index--;
            }
        });
        
        // Atualiza índices de status
        Object.keys(storage.indexes.byStatus).forEach(status => {
            storage.indexes.byStatus[status] = storage.indexes.byStatus[status]
                .map(idx => idx > deletedIndex ? idx - 1 : idx)
                .filter(idx => idx !== deletedIndex);
        });
    }

    // Recupera dados corrompidos
    recoverData(corruptedData) {
        console.log('Tentando recuperar dados corrompidos...');
        
        let recoveredData = [];
        
        if (Array.isArray(corruptedData)) {
            // Formato antigo de array
            recoveredData = corruptedData.filter(item => 
                item && typeof item === 'object' && item.id
            );
        } else if (corruptedData && typeof corruptedData === 'object') {
            // Tenta extrair dados de estrutura desconhecida
            for (const key in corruptedData) {
                if (Array.isArray(corruptedData[key])) {
                    const arrayData = corruptedData[key].filter(item => 
                        item && typeof item === 'object' && item.id
                    );
                    if (arrayData.length > recoveredData.length) {
                        recoveredData = arrayData;
                    }
                }
            }
        }
        
        // Cria nova estrutura com dados recuperados
        const newStorage = {
            meta: {
                created: new Date().toISOString(),
                version: '1.0.0',
                lastModified: new Date().toISOString(),
                recovered: true,
                recoveredItems: recoveredData.length
            },
            data: recoveredData,
            indexes: { byId: {}, byDate: [], byStatus: {} },
            stats: { 
                totalItems: recoveredData.length, 
                lastInsertId: 0, 
                lastOperation: 'recovery',
                operationCount: 0
            }
        };
        
        // Reconstroi índices
        this.rebuildIndexes(newStorage);
        this.saveToStorage(newStorage);
        
        console.log(`Recuperados ${recoveredData.length} itens`);
        return newStorage;
    }

    // OTIMIZAÇÃO E MANUTENÇÃO

    // Remove itens duplicados
    removeDuplicates(keyField = 'id') {
        const storage = this.loadFromStorage();
        const seen = new Set();
        const uniqueData = [];
        const duplicates = [];
        
        storage.data.forEach(item => {
            const key = item[keyField];
            if (!seen.has(key)) {
                seen.add(key);
                uniqueData.push(item);
            } else {
                duplicates.push(item);
            }
        });
        
        storage.data = uniqueData;
        this.rebuildIndexes(storage);
        this.saveToStorage(storage);
        
        return {
            removed: duplicates.length,
            kept: uniqueData.length,
            duplicates: duplicates
        };
    }

    // Compacta dados (remove campos vazios)
    compact() {
        const storage = this.loadFromStorage();
        
        storage.data = storage.data.map(item => {
            const compacted = {};
            Object.keys(item).forEach(key => {
                if (item[key] !== null && item[key] !== undefined && item[key] !== '') {
                    compacted[key] = item[key];
                }
            });
            return compacted;
        });
        
        this.saveToStorage(storage);
        return storage.data.length;
    }

    // Otimiza armazenamento
    optimizeStorage() {
        const storage = this.loadFromStorage();
        
        // Remove backups antigos
        this.cleanupOldBackups();
        
        // Compacta dados
        this.compact();
        
        // Atualiza índices
        this.rebuildIndexes(storage);
        
        this.log('Otimização de armazenamento concluída');
        return this.getStats();
    }

    // Gerencia limite de armazenamento
    handleStorageLimit(currentSize) {
        const maxSize = 4.5 * 1024 * 1024; // 4.5MB
        
        console.warn(`⚠️ Limite de armazenamento atingido: ${currentSize} bytes`);
        
        // Tenta compactar
        this.compact();
        
        // Remove backups antigos
        this.cleanupOldBackups();
        
        // Se ainda estiver grande, remove itens mais antigos
        const storage = this.loadFromStorage();
        if (storage.data.length > 1000) {
            const itemsToRemove = Math.floor(storage.data.length * 0.1); // Remove 10%
            storage.data = storage.data.slice(itemsToRemove);
            this.rebuildIndexes(storage);
            this.saveToStorage(storage);
            console.warn(`Removidos ${itemsToRemove} itens antigos para liberar espaço`);
        }
    }

    // Limpa backups antigos
    clearOldBackups() {
        const now = Date.now();
        const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.includes('_backup_')) {
                const timestamp = parseInt(key.split('_backup_')[1]);
                if (timestamp && timestamp < oneWeekAgo) {
                    localStorage.removeItem(key);
                }
            }
        }
    }

    // Atualiza índice de performance
    updatePerformanceIndex() {
        const perfKey = `${this.tableName}_performance`;
        const perfData = JSON.parse(localStorage.getItem(perfKey)) || {
            operations: [],
            averageTime: 0,
            lastUpdate: null
        };
        
        perfData.lastUpdate = new Date().toISOString();
        localStorage.setItem(perfKey, JSON.stringify(perfData));
    }

    // Inicia backup automático
    startAutoBackup() {
        if (this.backupInterval) {
            clearInterval(this.backupInterval);
        }
        
        this.backupInterval = setInterval(() => {
            this.createBackup();
        }, this.config.backupInterval);
    }

    // Para backup automático
    stopAutoBackup() {
        if (this.backupInterval) {
            clearInterval(this.backupInterval);
        }
    }

    // Logging
    log(message) {
        if (this.config.enableLogging) {
            console.log(`[${this.tableName}] ${message}`);
        }
    }

    // Converte para CSV
    convertToCSV(data) {
        if (data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header];
                    if (value === null || value === undefined) return '';
                    const stringValue = String(value);
                    return stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')
                        ? `"${stringValue.replace(/"/g, '""')}"`
                        : stringValue;
                }).join(',')
            )
        ];
        
        return csvRows.join('\n');
    }

    // Busca por texto completo (simples)
    searchText(searchTerm, fields = []) {
        const storage = this.loadFromStorage();
        const term = searchTerm.toLowerCase();
        
        return storage.data.filter(item => {
            const searchFields = fields.length > 0 ? fields : Object.keys(item);
            return searchFields.some(field => {
                const value = item[field];
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(term);
                }
                return false;
            });
        });
    }

    // Transação (simulada)
    transaction(operations) {
        const backup = this.createBackup();
        
        try {
            const results = operations.map(op => {
                const [method, ...args] = op;
                return this[method](...args);
            });
            
            this.log('Transação concluída com sucesso');
            return results;
        } catch (error) {
            // Rollback
            this.restoreFromBackup(backup);
            throw new Error(`Transação falhou: ${error.message}`);
        }
    }
}

// Métodos estáticos para gerenciamento global
ConnectionDB.getAllTables = () => {
    const tables = new Set();
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('IFIX_') && !key.includes('_backup_') && !key.includes('_performance')) {
            tables.add(key);
        }
    }
    
    return Array.from(tables);
};

ConnectionDB.getDatabaseStats = () => {
    const tables = ConnectionDB.getAllTables();
    const stats = {
        totalTables: tables.length,
        tables: {},
        totalSize: 0
    };
    
    tables.forEach(tableName => {
        try {
            const data = localStorage.getItem(tableName);
            const size = data ? data.length : 0;
            stats.tables[tableName] = {
                size: size,
                sizeKB: (size / 1024).toFixed(2)
            };
            stats.totalSize += size;
        } catch (error) {
            console.error(`Erro ao analisar tabela ${tableName}:`, error);
        }
    });
    
    stats.totalSizeKB = (stats.totalSize / 1024).toFixed(2);
    stats.totalSizeMB = (stats.totalSize / (1024 * 1024)).toFixed(2);
    
    return stats;
};

ConnectionDB.clearAllBackups = () => {
    const backups = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.includes('_backup_')) {
            backups.push(key);
        }
    }
    
    backups.forEach(key => localStorage.removeItem(key));
    return backups.length;
};

ConnectionDB.exportAll = () => {
    const tables = ConnectionDB.getAllTables();
    const exportData = {};
    
    tables.forEach(tableName => {
        try {
            const data = localStorage.getItem(tableName);
            exportData[tableName] = JSON.parse(data);
        } catch (error) {
            console.error(`Erro ao exportar ${tableName}:`, error);
        }
    });
    
    return exportData;
};

ConnectionDB.importAll = (data, options = { clearBeforeImport: false }) => {
    if (options.clearBeforeImport) {
        localStorage.clear();
    }
    
    Object.entries(data).forEach(([tableName, tableData]) => {
        localStorage.setItem(tableName, JSON.stringify(tableData));
    });
    
    return Object.keys(data).length;
};

// Exporta a classe
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConnectionDB;
}