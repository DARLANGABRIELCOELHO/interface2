// data/Customers_DB.js

class CustomersDatabase extends ConnectionDB {
    constructor() {
        super('CUSTOMERS');
        this.initCustomersSchema();
    }

    // Inicializa schema e dados padrão
    initCustomersSchema() {
        // Verifica se já existe algum cliente
        const existingData = this.findAll();
        if (existingData.length === 0) {
            console.log('Inicializando banco de clientes...');
            this.createDefaultCustomers();
        }
        
        // Atualiza metadados do schema
        this.updateSchema();
    }

    // Atualiza schema com campos definidos
    updateSchema() {
        const meta = this.findById('customers_meta');
        const now = new Date().toISOString();
        
        const schema = {
            id: 'customers_meta',
            type: 'metadata',
            version: '2.0.0',
            tableName: 'CUSTOMERS',
            fields: {
                required: ['name', 'phone'],
                optional: [
                    'email', 'phone2', 'address', 'document', 
                    'birthDate', 'notes', 'tags', 'category', 
                    'totalSpent', 'servicesCount', 'lastService',
                    'createdAt', 'updatedAt', 'status'
                ]
            },
            indexes: ['id', 'name', 'phone', 'email', 'document', 'category', 'status'],
            lastModified: now,
            recordCount: this.count(),
            createdAt: meta ? meta.createdAt : now
        };
        
        if (meta) {
            this.update(meta.id, schema);
        } else {
            this.create(schema);
        }
    }

    // Cria alguns clientes de exemplo
    createDefaultCustomers() {
        const now = new Date().toISOString();
        const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const twoMonthsAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();

        const defaultCustomers = [
            {
                id: 'cust_001',
                name: 'João Silva Santos',
                phone: '(11) 99999-9999',
                phone2: '(11) 3333-4444',
                email: 'joao.silva@email.com',
                document: '123.456.789-00',
                birthDate: '1985-05-15',
                address: {
                    street: 'Rua das Flores, 123',
                    neighborhood: 'Centro',
                    city: 'São Paulo',
                    state: 'SP',
                    zipCode: '01234-567'
                },
                notes: 'Cliente VIP - Sempre paga pontualmente',
                tags: ['vip', 'frequent'],
                category: 'premium',
                totalSpent: 2850.50,
                servicesCount: 8,
                lastService: oneMonthAgo,
                status: 'active',
                createdAt: twoMonthsAgo,
                updatedAt: now
            },
            {
                id: 'cust_002',
                name: 'Maria Oliveira Costa',
                phone: '(21) 98888-8888',
                email: 'maria.oliveira@empresa.com',
                document: '987.654.321-00',
                birthDate: '1990-08-22',
                address: {
                    street: 'Av. Brasil, 1500',
                    neighborhood: 'Copacabana',
                    city: 'Rio de Janeiro',
                    state: 'RJ',
                    zipCode: '22021-000'
                },
                notes: 'Cliente corporativo - Empresa Tech Solutions',
                tags: ['corporate'],
                category: 'corporate',
                totalSpent: 4200.00,
                servicesCount: 5,
                lastService: twoMonthsAgo,
                status: 'active',
                createdAt: twoMonthsAgo,
                updatedAt: now
            },
            {
                id: 'cust_003',
                name: 'Carlos Eduardo Pereira',
                phone: '(31) 97777-7777',
                phone2: '(31) 3222-1111',
                email: 'carlos.pereira@gmail.com',
                document: '456.789.123-00',
                address: {
                    street: 'Rua Minas Gerais, 500',
                    neighborhood: 'Savassi',
                    city: 'Belo Horizonte',
                    state: 'MG',
                    zipCode: '30130-001'
                },
                notes: 'Cliente novo - Indicado por amigo',
                tags: ['new', 'indicator'],
                category: 'regular',
                totalSpent: 750.00,
                servicesCount: 2,
                lastService: oneMonthAgo,
                status: 'active',
                createdAt: oneMonthAgo,
                updatedAt: now
            },
            {
                id: 'cust_004',
                name: 'Ana Paula Rodrigues',
                phone: '(41) 96666-6666',
                email: 'ana.rodrigues@hotmail.com',
                birthDate: '1995-11-30',
                address: {
                    street: 'Rua das Palmeiras, 89',
                    neighborhood: 'Batel',
                    city: 'Curitiba',
                    state: 'PR',
                    zipCode: '80240-000'
                },
                tags: ['frequent'],
                category: 'regular',
                totalSpent: 1200.00,
                servicesCount: 4,
                lastService: twoMonthsAgo,
                status: 'inactive',
                createdAt: twoMonthsAgo,
                updatedAt: now
            },
            {
                id: 'cust_005',
                name: 'Roberto Almeida',
                phone: '(51) 95555-5555',
                phone2: '(51) 3111-2222',
                email: 'roberto.almeida@empresa.com',
                document: '789.123.456-00',
                address: {
                    street: 'Av. Assis Brasil, 2000',
                    neighborhood: 'Partenon',
                    city: 'Porto Alegre',
                    state: 'RS',
                    zipCode: '91000-000'
                },
                notes: 'Cliente reclamante - Exigente com prazos',
                tags: ['demanding'],
                category: 'regular',
                totalSpent: 900.00,
                servicesCount: 3,
                lastService: twoMonthsAgo,
                status: 'active',
                createdAt: twoMonthsAgo,
                updatedAt: now
            }
        ];

        defaultCustomers.forEach(customer => {
            this.create(customer);
        });

        console.log(`${defaultCustomers.length} clientes de exemplo criados`);
    }

    // MÉTODOS CRUD ESPECÍFICOS

    // Cria um novo cliente com validação
    createCustomer(customerData) {
        // Valida dados obrigatórios
        if (!customerData.name || !customerData.phone) {
            throw new Error('Nome e telefone são obrigatórios');
        }

        // Formata telefone
        if (customerData.phone) {
            customerData.phone = this.formatPhone(customerData.phone);
        }
        if (customerData.phone2) {
            customerData.phone2 = this.formatPhone(customerData.phone2);
        }

        // Valida email se fornecido
        if (customerData.email && !this.validateEmail(customerData.email)) {
            throw new Error('Email inválido');
        }

        // Valida documento se fornecido
        if (customerData.document && !this.validateDocument(customerData.document)) {
            throw new Error('Documento inválido');
        }

        // Gera ID único
        const customerId = `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();

        // Dados padrão
        const newCustomer = {
            id: customerId,
            name: customerData.name.trim(),
            phone: customerData.phone,
            phone2: customerData.phone2 || '',
            email: customerData.email || '',
            document: customerData.document || '',
            birthDate: customerData.birthDate || '',
            address: customerData.address || {},
            notes: customerData.notes || '',
            tags: customerData.tags || [],
            category: customerData.category || 'regular',
            totalSpent: 0,
            servicesCount: 0,
            lastService: null,
            status: 'active',
            createdAt: now,
            updatedAt: now,
            _version: 1
        };

        // Verifica se já existe cliente com mesmo telefone ou email
        const existing = this.findByPhoneOrEmail(customerData.phone, customerData.email);
        if (existing.length > 0) {
            // Atualiza cliente existente
            const existingCustomer = existing[0];
            return this.updateCustomer(existingCustomer.id, {
                ...customerData,
                updatedAt: now,
                _version: (existingCustomer._version || 1) + 1
            });
        }

        // Insere no banco
        const result = this.create(newCustomer);
        
        // Atualiza estatísticas
        this.updateStats();
        
        console.log(`Cliente criado: ${customerId} - ${customerData.name}`);
        return result;
    }

    // Atualiza cliente existente
    updateCustomer(id, customerData) {
        const existingCustomer = this.findById(id);
        if (!existingCustomer) {
            throw new Error(`Cliente com ID ${id} não encontrado`);
        }

        // Formata telefones se fornecidos
        if (customerData.phone) {
            customerData.phone = this.formatPhone(customerData.phone);
        }
        if (customerData.phone2) {
            customerData.phone2 = this.formatPhone(customerData.phone2);
        }

        // Validações
        if (customerData.email && !this.validateEmail(customerData.email)) {
            throw new Error('Email inválido');
        }
        if (customerData.document && !this.validateDocument(customerData.document)) {
            throw new Error('Documento inválido');
        }

        // Atualiza dados
        const updatedData = {
            ...existingCustomer,
            ...customerData,
            id: existingCustomer.id, // Garante que ID não mude
            updatedAt: new Date().toISOString(),
            _version: (existingCustomer._version || 1) + 1
        };

        // Remove campos undefined
        Object.keys(updatedData).forEach(key => {
            if (updatedData[key] === undefined) {
                delete updatedData[key];
            }
        });

        const result = this.update(id, updatedData);
        console.log(`Cliente atualizado: ${id} - v${updatedData._version}`);
        return result;
    }

    // Busca avançada de clientes
    searchCustomers(searchTerm, options = {}) {
        const {
            field = 'all',
            status = 'all',
            category = 'all',
            minTotalSpent = 0,
            maxTotalSpent = Infinity,
            sortBy = 'name',
            sortOrder = 'asc',
            limit = 50,
            offset = 0
        } = options;

        let customers = this.findAll();

        // Filtro por status
        if (status !== 'all') {
            customers = customers.filter(c => c.status === status);
        }

        // Filtro por categoria
        if (category !== 'all') {
            customers = customers.filter(c => c.category === category);
        }

        // Filtro por valor gasto
        customers = customers.filter(c => {
            const total = c.totalSpent || 0;
            return total >= minTotalSpent && total <= maxTotalSpent;
        });

        // Busca por termo
        if (searchTerm && searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase().trim();
            customers = customers.filter(customer => {
                // Se campo específico for definido
                if (field !== 'all' && customer[field]) {
                    return customer[field].toString().toLowerCase().includes(term);
                }

                // Busca em todos os campos
                return Object.values(customer).some(value => {
                    if (value === null || value === undefined) return false;
                    if (typeof value === 'object') {
                        // Verifica objetos (como address)
                        return JSON.stringify(value).toLowerCase().includes(term);
                    }
                    return value.toString().toLowerCase().includes(term);
                });
            });
        }

        // Ordenação
        customers.sort((a, b) => {
            let aVal = a[sortBy] || '';
            let bVal = b[sortBy] || '';

            // Tratamento especial para alguns campos
            if (sortBy === 'name') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            } else {
                return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
            }
        });

        // Paginação
        return customers.slice(offset, offset + limit);
    }

    // Busca cliente por telefone ou email
    findByPhoneOrEmail(phone, email = '') {
        const customers = this.findAll();
        return customers.filter(customer => {
            const phoneMatch = customer.phone === phone || 
                              (customer.phone2 && customer.phone2 === phone);
            const emailMatch = email && customer.email && 
                              customer.email.toLowerCase() === email.toLowerCase();
            return phoneMatch || emailMatch;
        });
    }

    // Busca cliente por documento
    findByDocument(document) {
        return this.findWhere({ document: document }, { limit: 1 })[0] || null;
    }

    // Obtém clientes por categoria
    getByCategory(category) {
        return this.findWhere({ category: category, status: 'active' });
    }

    // Obtém clientes por status
    getByStatus(status) {
        return this.findWhere({ status: status });
    }

    // Obtém clientes VIP
    getVIPCustomers() {
        return this.findWhere({ 
            $or: [
                { tags: { $contains: 'vip' } },
                { category: 'premium' },
                { totalSpent: { $gt: 2000 } }
            ],
            status: 'active'
        }, { sortBy: 'totalSpent', sortOrder: 'desc' });
    }

    // Obtém clientes frequentes
    getFrequentCustomers(minServices = 3) {
        return this.findWhere({ 
            servicesCount: { $gte: minServices },
            status: 'active'
        }, { sortBy: 'servicesCount', sortOrder: 'desc' });
    }

    // Atualiza estatísticas do cliente após serviço
    updateCustomerStats(customerId, serviceValue) {
        const customer = this.findById(customerId);
        if (!customer) return null;

        const now = new Date().toISOString();
        const updatedData = {
            totalSpent: (customer.totalSpent || 0) + (serviceValue || 0),
            servicesCount: (customer.servicesCount || 0) + 1,
            lastService: now,
            updatedAt: now
        };

        // Atualiza categoria baseado no total gasto
        const newTotal = updatedData.totalSpent;
        if (newTotal >= 5000) {
            updatedData.category = 'premium';
            if (!customer.tags.includes('vip')) {
                updatedData.tags = [...(customer.tags || []), 'vip'];
            }
        } else if (newTotal >= 1000) {
            updatedData.category = 'regular';
        }

        return this.updateCustomer(customerId, updatedData);
    }

    // Adiciona tag a cliente
    addTag(customerId, tag) {
        const customer = this.findById(customerId);
        if (!customer) return null;

        const tags = customer.tags || [];
        if (!tags.includes(tag)) {
            tags.push(tag);
            return this.updateCustomer(customerId, { tags: tags });
        }
        return customer;
    }

    // Remove tag de cliente
    removeTag(customerId, tag) {
        const customer = this.findById(customerId);
        if (!customer) return null;

        const tags = customer.tags || [];
        const index = tags.indexOf(tag);
        if (index > -1) {
            tags.splice(index, 1);
            return this.updateCustomer(customerId, { tags: tags });
        }
        return customer;
    }

    // Exclui cliente (soft delete)
    deleteCustomer(id, permanent = false) {
        if (permanent) {
            // Exclusão permanente
            return this.delete(id);
        } else {
            // Soft delete - marca como inativo
            return this.updateCustomer(id, { 
                status: 'inactive',
                deletedAt: new Date().toISOString()
            });
        }
    }

    // Restaura cliente excluído
    restoreCustomer(id) {
        return this.updateCustomer(id, { 
            status: 'active',
            deletedAt: null
        });
    }

    // VALIDAÇÃO E FORMATAÇÃO

    // Valida email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Valida CPF/CNPJ (formato básico)
    validateDocument(document) {
        // Remove caracteres não numéricos
        const cleanDoc = document.replace(/\D/g, '');
        
        // CPF (11 dígitos) ou CNPJ (14 dígitos)
        if (cleanDoc.length === 11 || cleanDoc.length === 14) {
            return true;
        }
        
        return false;
    }

    // Formata telefone
    formatPhone(phone) {
        // Remove caracteres não numéricos
        const numbers = phone.replace(/\D/g, '');
        
        if (numbers.length === 11) {
            // Formato: (11) 99999-9999
            return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 7)}-${numbers.substring(7)}`;
        } else if (numbers.length === 10) {
            // Formato: (11) 9999-9999
            return `(${numbers.substring(0, 2)}) ${numbers.substring(2, 6)}-${numbers.substring(6)}`;
        } else {
            // Retorna original se não conseguir formatar
            return phone;
        }
    }

    // ESTATÍSTICAS E RELATÓRIOS

    // Obtém estatísticas gerais
    getStats() {
        const customers = this.findAll();
        const activeCustomers = customers.filter(c => c.status === 'active');
        const inactiveCustomers = customers.filter(c => c.status === 'inactive');
        
        const totalSpent = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
        const totalServices = customers.reduce((sum, c) => sum + (c.servicesCount || 0), 0);
        
        // Agrupa por categoria
        const byCategory = {};
        customers.forEach(c => {
            const category = c.category || 'regular';
            byCategory[category] = (byCategory[category] || 0) + 1;
        });

        // Clientes por mês (últimos 6 meses)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const recentCustomers = customers.filter(c => {
            const created = new Date(c.createdAt);
            return created >= sixMonthsAgo;
        });

        // Agrupa por mês
        const byMonth = {};
        recentCustomers.forEach(c => {
            const date = new Date(c.createdAt);
            const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
            byMonth[monthYear] = (byMonth[monthYear] || 0) + 1;
        });

        return {
            total: customers.length,
            active: activeCustomers.length,
            inactive: inactiveCustomers.length,
            totalSpent: totalSpent,
            averageSpent: customers.length > 0 ? totalSpent / customers.length : 0,
            totalServices: totalServices,
            averageServices: customers.length > 0 ? totalServices / customers.length : 0,
            byCategory: byCategory,
            byMonth: byMonth,
            vipCount: customers.filter(c => c.tags && c.tags.includes('vip')).length,
            frequentCount: customers.filter(c => (c.servicesCount || 0) >= 3).length
        };
    }

    // Obtém top clientes por gasto
    getTopCustomersBySpent(limit = 10) {
        return this.findAll()
            .filter(c => c.status === 'active')
            .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
            .slice(0, limit)
            .map(c => ({
                id: c.id,
                name: c.name,
                totalSpent: c.totalSpent || 0,
                servicesCount: c.servicesCount || 0,
                lastService: c.lastService,
                category: c.category
            }));
    }

    // Obtém clientes inativos há mais de X meses
    getInactiveCustomers(months = 3) {
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - months);
        
        return this.findAll()
            .filter(c => c.status === 'active' && c.lastService)
            .filter(c => {
                const lastService = new Date(c.lastService);
                return lastService < cutoffDate;
            })
            .sort((a, b) => new Date(a.lastService) - new Date(b.lastService));
    }

    // Atualiza estatísticas do banco
    updateStats() {
        const stats = this.getStats();
        const meta = this.findById('customers_stats');
        const now = new Date().toISOString();

        const statsData = {
            id: 'customers_stats',
            type: 'statistics',
            data: stats,
            updatedAt: now,
            createdAt: meta ? meta.createdAt : now
        };

        if (meta) {
            this.update(meta.id, statsData);
        } else {
            this.create(statsData);
        }

        return stats;
    }

    // EXPORTAÇÃO E IMPORTACAO

    // Exporta clientes para CSV
    exportToCSV(customers = null) {
        const data = customers || this.findAll();
        if (data.length === 0) return '';
        
        // Define cabeçalhos
        const headers = [
            'ID', 'Nome', 'Telefone', 'Telefone 2', 'Email', 'Documento',
            'Data Nascimento', 'Endereço', 'Observações', 'Tags',
            'Categoria', 'Total Gasto', 'Qtd Serviços', 'Último Serviço',
            'Status', 'Data Cadastro', 'Data Atualização'
        ];
        
        // Converte dados
        const rows = data.map(customer => {
            const address = customer.address ? 
                `${customer.address.street || ''}, ${customer.address.neighborhood || ''}, ${customer.address.city || ''} - ${customer.address.state || ''}` : 
                '';
            
            return [
                customer.id,
                `"${customer.name || ''}"`,
                customer.phone || '',
                customer.phone2 || '',
                customer.email || '',
                customer.document || '',
                customer.birthDate || '',
                `"${address}"`,
                `"${customer.notes || ''}"`,
                customer.tags ? customer.tags.join(';') : '',
                customer.category || '',
                customer.totalSpent || 0,
                customer.servicesCount || 0,
                customer.lastService || '',
                customer.status || '',
                customer.createdAt || '',
                customer.updatedAt || ''
            ].join(',');
        });
        
        return [headers.join(','), ...rows].join('\n');
    }

    // Importa clientes de CSV
    importFromCSV(csvData, options = { clearBeforeImport: false }) {
        const lines = csvData.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) return 0; // Cabeçalho + pelo menos uma linha
        
        const headers = lines[0].split(',').map(h => h.trim());
        const imported = [];
        const errors = [];
        
        // Se for para limpar antes
        if (options.clearBeforeImport) {
            this.clear();
        }
        
        // Processa cada linha
        for (let i = 1; i < lines.length; i++) {
            try {
                const line = lines[i];
                const values = this.parseCSVLine(line);
                
                if (values.length !== headers.length) {
                    errors.push(`Linha ${i + 1}: Número de colunas incorreto`);
                    continue;
                }
                
                // Converte para objeto
                const customerData = {};
                headers.forEach((header, index) => {
                    let value = values[index];
                    
                    // Remove aspas se houver
                    if (typeof value === 'string') {
                        value = value.replace(/^"|"$/g, '').trim();
                    }
                    
                    // Converte campos numéricos
                    if (header === 'Total Gasto' || header === 'Qtd Serviços') {
                        value = parseFloat(value) || 0;
                    }
                    
                    // Converte array de tags
                    if (header === 'Tags' && value) {
                        value = value.split(';').filter(tag => tag.trim() !== '');
                    }
                    
                    // Mapeia cabeçalho para propriedade
                    const propertyMap = {
                        'ID': 'id',
                        'Nome': 'name',
                        'Telefone': 'phone',
                        'Telefone 2': 'phone2',
                        'Email': 'email',
                        'Documento': 'document',
                        'Data Nascimento': 'birthDate',
                        'Endereço': 'address',
                        'Observações': 'notes',
                        'Tags': 'tags',
                        'Categoria': 'category',
                        'Total Gasto': 'totalSpent',
                        'Qtd Serviços': 'servicesCount',
                        'Último Serviço': 'lastService',
                        'Status': 'status',
                        'Data Cadastro': 'createdAt',
                        'Data Atualização': 'updatedAt'
                    };
                    
                    if (propertyMap[header]) {
                        customerData[propertyMap[header]] = value;
                    }
                });
                
                // Valida dados mínimos
                if (!customerData.name || !customerData.phone) {
                    errors.push(`Linha ${i + 1}: Nome e telefone são obrigatórios`);
                    continue;
                }
                
                // Se não tem ID, gera um novo
                if (!customerData.id) {
                    customerData.id = `cust_import_${Date.now()}_${i}`;
                }
                
                // Adiciona timestamps se não existirem
                if (!customerData.createdAt) {
                    customerData.createdAt = new Date().toISOString();
                }
                if (!customerData.updatedAt) {
                    customerData.updatedAt = customerData.createdAt;
                }
                
                // Adiciona ao banco
                const result = this.create(customerData);
                imported.push(result);
                
            } catch (error) {
                errors.push(`Linha ${i + 1}: ${error.message}`);
            }
        }
        
        console.log(`Importação concluída: ${imported.length} clientes importados, ${errors.length} erros`);
        
        if (errors.length > 0) {
            console.warn('Erros na importação:', errors);
        }
        
        return {
            imported: imported.length,
            errors: errors.length,
            errorDetails: errors
        };
    }

    // Helper para parse de linha CSV
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"' && !inQuotes) {
                inQuotes = true;
            } else if (char === '"' && inQuotes && nextChar === '"') {
                // Aspas duplas dentro de aspas
                current += '"';
                i++; // Pula próxima aspas
            } else if (char === '"' && inQuotes) {
                inQuotes = false;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current);
        return result;
    }

    // Backup específico para clientes
    backupCustomers() {
        const backupKey = `${this.tableName}_backup_customers_${Date.now()}`;
        const customers = this.findAll();
        const backupData = {
            timestamp: new Date().toISOString(),
            count: customers.length,
            data: customers
        };
        
        localStorage.setItem(backupKey, JSON.stringify(backupData));
        console.log(`Backup de clientes criado: ${backupKey} (${customers.length} clientes)`);
        return backupKey;
    }

    // Restaura backup específico
    restoreCustomers(backupKey) {
        const backupData = localStorage.getItem(backupKey);
        if (!backupData) {
            throw new Error('Backup não encontrado');
        }
        
        const parsed = JSON.parse(backupData);
        if (!parsed.data || !Array.isArray(parsed.data)) {
            throw new Error('Formato de backup inválido');
        }
        
        // Limpa dados atuais
        this.clear();
        
        // Restaura dados
        parsed.data.forEach(customer => {
            this.create(customer);
        });
        
        console.log(`Backup restaurado: ${parsed.data.length} clientes`);
        return parsed.data.length;
    }
}

// Cria instância global
const Customers_DB = new CustomersDatabase();

// Expõe globalmente se estiver no navegador
if (typeof window !== 'undefined') {
    window.Customers_DB = Customers_DB;
}

// Exporta para módulos (se suportado)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Customers_DB;
}