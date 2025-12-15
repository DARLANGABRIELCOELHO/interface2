// modules/serviceCatalog.js

/**
 * Módulo de Catálogo de Serviços - Sistema completo de gestão de serviços e preços
 * Gerencia o catálogo de serviços, modelos e tabela de preços da assistência técnica
 */
class ServiceCatalogModule {
    constructor() {
        this.currentService = null;
        this.editingIndex = null;
        this.filter = {
            category: 'all',
            search: ''
        };
        this.sortConfig = {
            field: 'service',
            direction: 'asc'
        };
        
        // Configurações
        this.config = {
            categories: [
                'Tela',
                'Bateria', 
                'Placa',
                'Software',
                'Conectividade',
                'Áudio',
                'Câmera',
                'Estrutural',
                'Preventivo',
                'Outros'
            ],
            defaultPrices: {
                avista: 0,
                parcelado: 0
            }
        };
        
        this.elements = {};
        this.services = [];
    }

    /**
     * Inicializa o módulo
     */
    async init() {
        this.cacheElements();
        await this.loadData();
        this.setupEventListeners();
        this.render();
        console.log('✅ ServiceCatalogModule inicializado');
    }

    /**
     * Cache de elementos DOM
     */
    cacheElements() {
        this.elements.container = document.getElementById('catalog-view');
    }

    /**
     * Carrega dados do catálogo
     */
    async loadData() {
        try {
            if (window.Catalog_DB && typeof Catalog_DB.getData === 'function') {
                const data = Catalog_DB.getData();
                this.services = this.transformCatalogData(data);
            } else {
                console.warn('Catalog_DB não encontrado, usando dados de exemplo');
                this.services = this.getSampleData();
            }
        } catch (error) {
            console.error('Erro ao carregar dados do catálogo:', error);
            this.services = this.getSampleData();
        }
    }

    /**
     * Transforma dados do formato Catalog_DB para o formato interno
     */
    transformCatalogData(catalogData) {
        const services = [];
        
        // Extrair todos os modelos e serviços
        const models = catalogData.models || [];
        const serviceTypes = catalogData.services || [];
        const prices = catalogData.prices || {};
        
        // Converter estrutura de preços para array de serviços
        for (const model of models) {
            const modelPrices = prices[model] || {};
            
            for (const serviceType of serviceTypes) {
                const priceInfo = modelPrices[serviceType];
                if (priceInfo) {
                    services.push({
                        id: `${model}_${serviceType}`.replace(/\s+/g, '_'),
                        model,
                        service: serviceType,
                        category: this.detectCategory(serviceType),
                        avista: parseFloat(priceInfo.avista) || 0,
                        parcelado: parseFloat(priceInfo.parcelado) || 0,
                        estimatedTime: this.getEstimatedTime(serviceType),
                        partsRequired: this.getPartsRequired(serviceType),
                        warranty: '90 dias',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    });
                }
            }
        }
        
        return services;
    }

    /**
     * Detecta categoria baseada no tipo de serviço
     */
    detectCategory(serviceType) {
        const serviceLower = serviceType.toLowerCase();
        
        if (serviceLower.includes('tela') || serviceLower.includes('display')) return 'Tela';
        if (serviceLower.includes('bateria')) return 'Bateria';
        if (serviceLower.includes('placa') || serviceLower.includes('circuito')) return 'Placa';
        if (serviceLower.includes('software') || serviceLower.includes('sistema')) return 'Software';
        if (serviceLower.includes('wifi') || serviceLower.includes('bluetooth') || serviceLower.includes('conectividade')) return 'Conectividade';
        if (serviceLower.includes('áudio') || serviceLower.includes('microfone') || serviceLower.includes('auto-falante')) return 'Áudio';
        if (serviceLower.includes('câmera') || serviceLower.includes('camera')) return 'Câmera';
        if (serviceLower.includes('carcaça') || serviceLower.includes('estrutura') || serviceLower.includes('trinca')) return 'Estrutural';
        
        return 'Outros';
    }

    /**
     * Estima tempo de reparo baseado no serviço
     */
    getEstimatedTime(serviceType) {
        const serviceLower = serviceType.toLowerCase();
        
        if (serviceLower.includes('tela')) return '1-2 horas';
        if (serviceLower.includes('bateria')) return '30-45 minutos';
        if (serviceLower.includes('placa')) return '2-3 dias';
        if (serviceLower.includes('software')) return '30-60 minutos';
        if (serviceLower.includes('limpeza')) return '30 minutos';
        if (serviceLower.includes('câmera')) return '1-2 horas';
        
        return '1 hora';
    }

    /**
     * Determina peças necessárias para o serviço
     */
    getPartsRequired(serviceType) {
        const serviceLower = serviceType.toLowerCase();
        
        if (serviceLower.includes('tela')) return 'Tela original/equivalente';
        if (serviceLower.includes('bateria')) return 'Bateria original';
        if (serviceLower.includes('placa')) return 'Componentes SMD';
        if (serviceLower.includes('conector')) return 'Conector de carga';
        if (serviceLower.includes('câmera')) return 'Módulo de câmera';
        
        return 'Varia conforme modelo';
    }

    /**
     * Dados de exemplo para desenvolvimento
     */
    getSampleData() {
        return [
            {
                id: 'iphone_12_troca_de_tela',
                model: 'iPhone 12',
                service: 'Troca de Tela',
                category: 'Tela',
                avista: 450.00,
                parcelado: 500.00,
                estimatedTime: '1-2 horas',
                partsRequired: 'Tela original',
                warranty: '90 dias',
                notes: 'Inclui teste de TouchID',
                createdAt: '2024-01-01T10:00:00Z',
                updatedAt: '2024-01-15T14:30:00Z'
            },
            {
                id: 'iphone_12_troca_de_bateria',
                model: 'iPhone 12',
                service: 'Troca de Bateria',
                category: 'Bateria',
                avista: 250.00,
                parcelado: 280.00,
                estimatedTime: '30-45 minutos',
                partsRequired: 'Bateria original',
                warranty: '6 meses',
                notes: 'Bateria com 100% de saúde',
                createdAt: '2024-01-01T10:00:00Z',
                updatedAt: '2024-01-10T09:15:00Z'
            },
            {
                id: 'samsung_galaxy_s21_troca_de_tela',
                model: 'Samsung Galaxy S21',
                service: 'Troca de Tela',
                category: 'Tela',
                avista: 400.00,
                parcelado: 450.00,
                estimatedTime: '1-2 horas',
                partsRequired: 'Tela AMOLED',
                warranty: '90 dias',
                notes: 'Com garantia de cores',
                createdAt: '2024-01-02T11:30:00Z',
                updatedAt: '2024-01-12T16:45:00Z'
            },
            {
                id: 'xiaomi_mi_11_reparo_na_placa',
                model: 'Xiaomi Mi 11',
                service: 'Reparo na Placa',
                category: 'Placa',
                avista: 350.00,
                parcelado: 400.00,
                estimatedTime: '2-3 dias',
                partsRequired: 'Componentes específicos',
                warranty: '120 dias',
                notes: 'Diagnóstico gratuito',
                createdAt: '2024-01-03T09:15:00Z',
                updatedAt: '2024-01-05T14:20:00Z'
            },
            {
                id: 'motorola_edge_limpeza_geral',
                model: 'Motorola Edge',
                service: 'Limpeza Geral',
                category: 'Preventivo',
                avista: 80.00,
                parcelado: 100.00,
                estimatedTime: '30 minutos',
                partsRequired: 'Nenhuma',
                warranty: '30 dias',
                notes: 'Inclui limpeza de conectores',
                createdAt: '2024-01-04T14:45:00Z',
                updatedAt: '2024-01-04T14:45:00Z'
            }
        ];
    }

    /**
     * Configura listeners de eventos
     */
    setupEventListeners() {
        // Delegation pattern para tabela dinâmica
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-action="edit-service"]')) {
                const serviceId = e.target.closest('[data-service-id]').getAttribute('data-service-id');
                this.editService(serviceId);
            }
            
            if (e.target.closest('[data-action="delete-service"]')) {
                const serviceId = e.target.closest('[data-service-id]').getAttribute('data-service-id');
                this.confirmDelete(serviceId);
            }
            
            if (e.target.closest('[data-action="duplicate-service"]')) {
                const serviceId = e.target.closest('[data-service-id]').getAttribute('data-service-id');
                this.duplicateService(serviceId);
            }
        });

        // Filtros
        document.addEventListener('change', (e) => {
            if (e.target.matches('#category-filter')) {
                this.filter.category = e.target.value;
                this.render();
            }
            
            if (e.target.matches('#search-catalog')) {
                this.filter.search = e.target.value;
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => this.render(), 300);
            }
        });

        // Ordenação
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-sort]')) {
                e.preventDefault();
                const field = e.target.closest('[data-sort]').getAttribute('data-sort');
                this.sortTable(field);
            }
        });
    }

    /**
     * Renderiza o módulo principal
     */
    async render() {
        if (!this.elements.container) return;

        try {
            // Aplicar filtros e ordenação
            const filteredServices = this.applyFilters(this.services);
            const sortedServices = this.sortServices(filteredServices);
            
            this.elements.container.innerHTML = this.getTemplate(sortedServices);
            
            // Configurar eventos após renderização
            this.setupFormEvents();
            
        } catch (error) {
            console.error('Erro ao renderizar catálogo:', error);
            this.showError('Não foi possível carregar o catálogo de serviços');
        }
    }

    /**
     * Template principal
     */
    getTemplate(services) {
        const stats = this.calculateStats(services);
        
        return `
            <div class="module-header">
                <div class="header-content">
                    <h1><i class="fas fa-book"></i> Catálogo de Serviços</h1>
                    <p class="subtitle">Gerencie todos os serviços, modelos e preços da sua assistência técnica</p>
                </div>
                
                <div class="header-actions">
                    <button class="btn btn-primary" onclick="ServiceCatalogModule.showServiceForm()">
                        <i class="fas fa-plus"></i> Novo Serviço
                    </button>
                    <button class="btn btn-secondary" onclick="ServiceCatalogModule.exportCatalog()">
                        <i class="fas fa-download"></i> Exportar
                    </button>
                </div>
            </div>
            
            <div class="catalog-stats">
                <div class="stat-card">
                    <div class="stat-icon bg-primary">
                        <i class="fas fa-mobile-alt"></i>
                    </div>
                    <div class="stat-content">
                        <span class="stat-value">${this.countUniqueModels()}</span>
                        <span class="stat-label">Modelos</span>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon bg-success">
                        <i class="fas fa-tools"></i>
                    </div>
                    <div class="stat-content">
                        <span class="stat-value">${this.countUniqueServices()}</span>
                        <span class="stat-label">Tipos de Serviço</span>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon bg-info">
                        <i class="fas fa-layer-group"></i>
                    </div>
                    <div class="stat-content">
                        <span class="stat-value">${services.length}</span>
                        <span class="stat-label">Combinações</span>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon bg-warning">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                    <div class="stat-content">
                        <span class="stat-value">${stats.avgPrice.toFixed(2)}</span>
                        <span class="stat-label">Preço Médio</span>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="filters-container">
                    <div class="filter-group">
                        <label for="category-filter" class="filter-label">Categoria:</label>
                        <select id="category-filter" class="form-select" style="width: 180px;">
                            <option value="all">Todas Categorias</option>
                            ${this.config.categories.map(cat => `
                                <option value="${cat}" ${this.filter.category === cat ? 'selected' : ''}>
                                    ${cat}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label for="search-catalog" class="filter-label">Buscar:</label>
                        <div class="search-box">
                            <i class="fas fa-search"></i>
                            <input type="text" 
                                   id="search-catalog" 
                                   class="form-control" 
                                   placeholder="Modelo, serviço, categoria..."
                                   value="${this.filter.search}">
                        </div>
                    </div>
                    
                    <div class="filter-actions">
                        <button class="btn btn-outline" onclick="ServiceCatalogModule.resetFilters()">
                            <i class="fas fa-redo"></i> Limpar Filtros
                        </button>
                    </div>
                </div>
                
                <div class="table-responsive">
                    <table class="table catalog-table">
                        <thead>
                            <tr>
                                <th><a href="#" data-sort="model">Modelo</a></th>
                                <th><a href="#" data-sort="service">Serviço</a></th>
                                <th><a href="#" data-sort="category">Categoria</a></th>
                                <th><a href="#" data-sort="avista">À Vista</a></th>
                                <th><a href="#" data-sort="parcelado">Parcelado</a></th>
                                <th><a href="#" data-sort="estimatedTime">Tempo</a></th>
                                <th><a href="#" data-sort="warranty">Garantia</a></th>
                                <th class="text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${services.length > 0 ? 
                                services.map(service => this.getServiceRowTemplate(service)).join('') : 
                                this.getEmptyStateTemplate()
                            }
                        </tbody>
                    </table>
                </div>
                
                <div class="table-footer">
                    <div class="pagination-info">
                        Mostrando ${services.length} de ${this.services.length} serviços
                    </div>
                    <div class="export-info">
                        <small class="text-muted">
                            Última atualização: ${this.getLastUpdate()}
                        </small>
                    </div>
                </div>
            </div>
            
            <div class="catalog-actions">
                <div class="action-card">
                    <div class="action-icon">
                        <i class="fas fa-file-import"></i>
                    </div>
                    <div class="action-content">
                        <h4>Importar em Massa</h4>
                        <p>Importe uma lista de serviços via CSV</p>
                        <input type="file" id="import-csv" accept=".csv" style="display: none;">
                        <button class="btn btn-outline btn-sm" onclick="document.getElementById('import-csv').click()">
                            Selecionar Arquivo
                        </button>
                    </div>
                </div>
                
                <div class="action-card">
                    <div class="action-icon">
                        <i class="fas fa-sync-alt"></i>
                    </div>
                    <div class="action-content">
                        <h4>Sincronizar Preços</h4>
                        <p>Atualize preços com base em percentual</p>
                        <button class="btn btn-outline btn-sm" onclick="ServiceCatalogModule.showPriceAdjustment()">
                            Ajustar Preços
                        </button>
                    </div>
                </div>
                
                <div class="action-card">
                    <div class="action-icon">
                        <i class="fas fa-chart-bar"></i>
                    </div>
                    <div class="action-content">
                        <h4>Relatórios</h4>
                        <p>Gere relatórios de serviços mais lucrativos</p>
                        <button class="btn btn-outline btn-sm" onclick="ServiceCatalogModule.generateReport()">
                            Gerar Relatório
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Modal de edição -->
            <div id="service-modal" class="modal">
                <div class="modal-content" style="max-width: 700px;">
                    <div class="modal-header">
                        <h3 id="modal-title" class="modal-title">Novo Serviço</h3>
                        <button class="modal-close" aria-label="Fechar modal">×</button>
                    </div>
                    <div class="modal-body" id="service-form-container"></div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="ServiceCatalogModule.closeModal()">Cancelar</button>
                        <button type="button" class="btn btn-primary" onclick="ServiceCatalogModule.saveService()">Salvar Serviço</button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Template para linha da tabela
     */
    getServiceRowTemplate(service) {
        const discount = ((service.parcelado - service.avista) / service.parcelado * 100).toFixed(0);
        
        return `
            <tr data-service-id="${service.id}">
                <td>
                    <div class="model-info">
                        <strong>${service.model}</strong>
                    </div>
                </td>
                <td>
                    <div class="service-info">
                        <strong>${service.service}</strong>
                        ${service.notes ? `<small class="text-muted">${service.notes}</small>` : ''}
                    </div>
                </td>
                <td>
                    <span class="badge badge-primary">${service.category}</span>
                </td>
                <td>
                    <div class="price-display">
                        <strong class="text-success">R$ ${service.avista.toFixed(2)}</strong>
                        <small class="text-muted">${discount}% de desconto</small>
                    </div>
                </td>
                <td>
                    <div class="price-display">
                        <strong>R$ ${service.parcelado.toFixed(2)}</strong>
                        <small class="text-muted">em até 12x</small>
                    </div>
                </td>
                <td>
                    <div class="time-display">
                        <i class="fas fa-clock"></i>
                        ${service.estimatedTime}
                    </div>
                </td>
                <td>
                    <div class="warranty-display">
                        <i class="fas fa-shield-alt"></i>
                        ${service.warranty}
                    </div>
                </td>
                <td class="actions-cell">
                    <div class="btn-group">
                        <button class="btn btn-icon btn-sm" data-action="edit-service" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        
                        <button class="btn btn-icon btn-sm" data-action="duplicate-service" title="Duplicar">
                            <i class="fas fa-copy"></i>
                        </button>
                        
                        <button class="btn btn-icon btn-sm text-danger" data-action="delete-service" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * Template para estado vazio
     */
    getEmptyStateTemplate() {
        return `
            <tr>
                <td colspan="8">
                    <div class="empty-state">
                        <div class="empty-state-icon">
                            <i class="fas fa-book"></i>
                        </div>
                        <h3>Nenhum serviço cadastrado</h3>
                        <p>Comece cadastrando seus primeiros serviços e preços</p>
                        <button class="btn btn-primary" onclick="ServiceCatalogModule.showServiceForm()">
                            <i class="fas fa-plus"></i> Cadastrar Primeiro Serviço
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * Template do formulário de serviço
     */
    getServiceFormTemplate(service = {}) {
        const isEditing = !!service.id;
        
        return `
            <form id="service-form" class="service-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="service-model" class="form-label required">Modelo do Aparelho</label>
                        <input type="text" 
                               id="service-model" 
                               class="form-control" 
                               value="${service.model || ''}"
                               placeholder="Ex: iPhone 12, Samsung Galaxy S21"
                               required
                               list="model-suggestions">
                        <datalist id="model-suggestions">
                            ${Array.from(new Set(this.services.map(s => s.model)))
                                .map(model => `<option value="${model}">`)
                                .join('')}
                        </datalist>
                    </div>
                    
                    <div class="form-group">
                        <label for="service-type" class="form-label required">Tipo de Serviço</label>
                        <input type="text" 
                               id="service-type" 
                               class="form-control" 
                               value="${service.service || ''}"
                               placeholder="Ex: Troca de tela, Troca de bateria"
                               required
                               list="service-suggestions">
                        <datalist id="service-suggestions">
                            ${Array.from(new Set(this.services.map(s => s.service)))
                                .map(serv => `<option value="${serv}">`)
                                .join('')}
                        </datalist>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="service-category" class="form-label required">Categoria</label>
                        <select id="service-category" class="form-select" required>
                            <option value="">Selecione uma categoria...</option>
                            ${this.config.categories.map(cat => `
                                <option value="${cat}" ${service.category === cat ? 'selected' : ''}>
                                    ${cat}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="service-warranty" class="form-label">Garantia</label>
                        <select id="service-warranty" class="form-select">
                            <option value="30 dias" ${service.warranty === '30 dias' ? 'selected' : ''}>30 dias</option>
                            <option value="60 dias" ${service.warranty === '60 dias' ? 'selected' : ''}>60 dias</option>
                            <option value="90 dias" ${service.warranty === '90 dias' ? 'selected' : ''}>90 dias</option>
                            <option value="6 meses" ${service.warranty === '6 meses' ? 'selected' : ''}>6 meses</option>
                            <option value="12 meses" ${service.warranty === '12 meses' ? 'selected' : ''}>12 meses</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="price-avista" class="form-label required">Preço à Vista (R$)</label>
                        <div class="input-group">
                            <span class="input-group-text">R$</span>
                            <input type="number" 
                                   id="price-avista" 
                                   class="form-control" 
                                   value="${service.avista || 0}"
                                   step="0.01"
                                   min="0"
                                   required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="price-parcelado" class="form-label required">Preço Parcelado (R$)</label>
                        <div class="input-group">
                            <span class="input-group-text">R$</span>
                            <input type="number" 
                                   id="price-parcelado" 
                                   class="form-control" 
                                   value="${service.parcelado || 0}"
                                   step="0.01"
                                   min="0"
                                   required>
                        </div>
                        <small class="form-text">Valor sugerido: R$ <span id="suggested-price">0.00</span></small>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="estimated-time" class="form-label">Tempo Estimado</label>
                        <select id="estimated-time" class="form-select">
                            <option value="15-30 minutos" ${service.estimatedTime === '15-30 minutos' ? 'selected' : ''}>15-30 minutos</option>
                            <option value="30-45 minutos" ${service.estimatedTime === '30-45 minutos' ? 'selected' : ''}>30-45 minutos</option>
                            <option value="1-2 horas" ${service.estimatedTime === '1-2 horas' ? 'selected' : ''}>1-2 horas</option>
                            <option value="2-3 horas" ${service.estimatedTime === '2-3 horas' ? 'selected' : ''}>2-3 horas</option>
                            <option value="1 dia" ${service.estimatedTime === '1 dia' ? 'selected' : ''}>1 dia</option>
                            <option value="2-3 dias" ${service.estimatedTime === '2-3 dias' ? 'selected' : ''}>2-3 dias</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="parts-required" class="form-label">Peças Necessárias</label>
                        <input type="text" 
                               id="parts-required" 
                               class="form-control" 
                               value="${service.partsRequired || ''}"
                               placeholder="Ex: Tela original, Bateria">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="service-notes" class="form-label">Observações</label>
                    <textarea id="service-notes" 
                              class="form-control" 
                              rows="3"
                              placeholder="Informações adicionais, restrições, detalhes...">${service.notes || ''}</textarea>
                </div>
                
                ${isEditing ? `
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Data de Criação</label>
                            <input type="text" 
                                   class="form-control" 
                                   value="${this.formatDate(service.createdAt)}"
                                   disabled>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Última Atualização</label>
                            <input type="text" 
                                   class="form-control" 
                                   value="${this.formatDate(service.updatedAt)}"
                                   disabled>
                        </div>
                    </div>
                ` : ''}
            </form>
            
            <script>
                // Script inline para cálculo automático de preço sugerido
                document.getElementById('price-avista').addEventListener('input', function() {
                    const avista = parseFloat(this.value) || 0;
                    const suggested = avista * 1.1; // 10% de acréscimo
                    document.getElementById('suggested-price').textContent = suggested.toFixed(2);
                });
            </script>
        `;
    }

    /**
     * Configura eventos do formulário
     */
    setupFormEvents() {
        const form = document.getElementById('service-form');
        if (form) {
            // Auto-calcular preço parcelado sugerido
            const avistaInput = document.getElementById('price-avista');
            const parceladoInput = document.getElementById('price-parcelado');
            
            if (avistaInput && parceladoInput) {
                avistaInput.addEventListener('input', () => {
                    const avista = parseFloat(avistaInput.value) || 0;
                    const suggested = avista * 1.1; // 10% de acréscimo
                    parceladoInput.value = suggested.toFixed(2);
                });
            }
        }
    }

    /**
     * Aplica filtros aos serviços
     */
    applyFilters(services) {
        let filtered = [...services];
        
        // Filtro por categoria
        if (this.filter.category !== 'all') {
            filtered = filtered.filter(service => service.category === this.filter.category);
        }
        
        // Filtro por busca
        if (this.filter.search) {
            const searchTerm = this.filter.search.toLowerCase();
            filtered = filtered.filter(service => 
                service.model.toLowerCase().includes(searchTerm) ||
                service.service.toLowerCase().includes(searchTerm) ||
                service.category.toLowerCase().includes(searchTerm) ||
                (service.notes && service.notes.toLowerCase().includes(searchTerm))
            );
        }
        
        return filtered;
    }

    /**
     * Ordena serviços
     */
    sortServices(services) {
        const { field, direction } = this.sortConfig;
        
        return [...services].sort((a, b) => {
            let aValue = a[field];
            let bValue = b[field];
            
            // Tratamento para números
            if (field === 'avista' || field === 'parcelado') {
                aValue = parseFloat(aValue) || 0;
                bValue = parseFloat(bValue) || 0;
            }
            
            // Tratamento para strings
            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            
            if (aValue < bValue) return direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }

    /**
     * Ordena tabela por campo
     */
    sortTable(field) {
        if (this.sortConfig.field === field) {
            this.sortConfig.direction = this.sortConfig.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortConfig.field = field;
            this.sortConfig.direction = 'asc';
        }
        this.render();
    }

    /**
     * Mostra formulário para novo/edição de serviço
     */
    showServiceForm(serviceId = null) {
        this.currentService = serviceId ? 
            this.services.find(s => s.id === serviceId) : 
            null;
        
        const modal = document.getElementById('service-modal');
        const modalTitle = document.getElementById('modal-title');
        const formContainer = document.getElementById('service-form-container');
        
        modalTitle.textContent = serviceId ? 'Editar Serviço' : 'Novo Serviço';
        formContainer.innerHTML = this.getServiceFormTemplate(this.currentService || {});
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Configurar eventos do formulário
        this.setupFormEvents();
    }

    /**
     * Fecha modal
     */
    closeModal() {
        const modal = document.getElementById('service-modal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        this.currentService = null;
    }

    /**
     * Salva serviço (criação ou edição)
     */
    async saveService() {
        try {
            const form = document.getElementById('service-form');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            
            const serviceData = this.collectFormData();
            
            if (this.currentService) {
                // Atualizar serviço existente
                const index = this.services.findIndex(s => s.id === this.currentService.id);
                if (index !== -1) {
                    this.services[index] = {
                        ...this.services[index],
                        ...serviceData,
                        updatedAt: new Date().toISOString()
                    };
                }
            } else {
                // Criar novo serviço
                const newService = {
                    id: `${serviceData.model}_${serviceData.service}`.replace(/\s+/g, '_'),
                    ...serviceData,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                this.services.push(newService);
            }
            
            // Salvar no Catalog_DB se disponível
            if (window.Catalog_DB && typeof Catalog_DB.updateData === 'function') {
                const catalogData = this.convertToCatalogFormat(this.services);
                Catalog_DB.updateData(catalogData);
            }
            
            this.closeModal();
            await this.render();
            
            this.showNotification(
                `Serviço ${this.currentService ? 'atualizado' : 'cadastrado'} com sucesso!`,
                'success'
            );
            
        } catch (error) {
            console.error('Erro ao salvar serviço:', error);
            this.showNotification('Erro ao salvar serviço', 'error');
        }
    }

    /**
     * Coleta dados do formulário
     */
    collectFormData() {
        return {
            model: document.getElementById('service-model').value.trim(),
            service: document.getElementById('service-type').value.trim(),
            category: document.getElementById('service-category').value,
            avista: parseFloat(document.getElementById('price-avista').value) || 0,
            parcelado: parseFloat(document.getElementById('price-parcelado').value) || 0,
            estimatedTime: document.getElementById('estimated-time').value,
            warranty: document.getElementById('service-warranty').value,
            partsRequired: document.getElementById('parts-required').value.trim(),
            notes: document.getElementById('service-notes').value.trim()
        };
    }

    /**
     * Converte dados para formato do Catalog_DB
     */
    convertToCatalogFormat(services) {
        const catalogData = {
            models: [],
            services: [],
            prices: {}
        };
        
        for (const service of services) {
            // Adicionar modelo se não existir
            if (!catalogData.models.includes(service.model)) {
                catalogData.models.push(service.model);
            }
            
            // Adicionar serviço se não existir
            if (!catalogData.services.includes(service.service)) {
                catalogData.services.push(service.service);
            }
            
            // Adicionar preço
            if (!catalogData.prices[service.model]) {
                catalogData.prices[service.model] = {};
            }
            
            catalogData.prices[service.model][service.service] = {
                avista: service.avista,
                parcelado: service.parcelado
            };
        }
        
        return catalogData;
    }

    /**
     * Edita serviço existente
     */
    editService(serviceId) {
        this.showServiceForm(serviceId);
    }

    /**
     * Duplica serviço
     */
    duplicateService(serviceId) {
        const service = this.services.find(s => s.id === serviceId);
        if (!service) return;
        
        const duplicatedService = {
            ...service,
            id: `${service.model}_${service.service}_copy_${Date.now()}`.replace(/\s+/g, '_'),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.services.push(duplicatedService);
        this.render();
        
        this.showNotification('Serviço duplicado com sucesso', 'success');
    }

    /**
     * Confirma exclusão de serviço
     */
    async confirmDelete(serviceId) {
        const service = this.services.find(s => s.id === serviceId);
        if (!service) return;
        
        if (confirm(`Tem certeza que deseja excluir o serviço "${service.service}" para ${service.model}?\nEsta ação não pode ser desfeita.`)) {
            try {
                this.services = this.services.filter(s => s.id !== serviceId);
                
                // Atualizar Catalog_DB
                if (window.Catalog_DB && typeof Catalog_DB.updateData === 'function') {
                    const catalogData = this.convertToCatalogFormat(this.services);
                    Catalog_DB.updateData(catalogData);
                }
                
                await this.render();
                
                this.showNotification('Serviço excluído com sucesso', 'success');
            } catch (error) {
                console.error('Erro ao excluir serviço:', error);
                this.showNotification('Erro ao excluir serviço', 'error');
            }
        }
    }

    /**
     * Reseta filtros
     */
    resetFilters() {
        this.filter = {
            category: 'all',
            search: ''
        };
        this.render();
    }

    /**
     * Exporta catálogo
     */
    exportCatalog() {
        const dataStr = JSON.stringify(this.convertToCatalogFormat(this.services), null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `catalogo_servicos_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.showNotification('Catálogo exportado com sucesso', 'success');
    }

    /**
     * Mostra diálogo de ajuste de preços
     */
    showPriceAdjustment() {
        const adjustment = prompt(
            'Digite a porcentagem de ajuste (ex: 10 para aumentar 10%, -5 para diminuir 5%):',
            '0'
        );
        
        if (adjustment === null) return;
        
        const percent = parseFloat(adjustment);
        if (isNaN(percent)) {
            alert('Porcentagem inválida');
            return;
        }
        
        if (confirm(`Ajustar todos os preços em ${percent}%?`)) {
            this.adjustAllPrices(percent);
        }
    }

    /**
     * Ajusta todos os preços por percentual
     */
    adjustAllPrices(percent) {
        const multiplier = 1 + (percent / 100);
        
        this.services = this.services.map(service => ({
            ...service,
            avista: parseFloat((service.avista * multiplier).toFixed(2)),
            parcelado: parseFloat((service.parcelado * multiplier).toFixed(2)),
            updatedAt: new Date().toISOString()
        }));
        
        // Atualizar Catalog_DB
        if (window.Catalog_DB && typeof Catalog_DB.updateData === 'function') {
            const catalogData = this.convertToCatalogFormat(this.services);
            Catalog_DB.updateData(catalogData);
        }
        
        this.render();
        this.showNotification(`Preços ajustados em ${percent}%`, 'success');
    }

    /**
     * Gera relatório
     */
    generateReport() {
        const report = this.calculateStats(this.services);
        const reportText = `
RELATÓRIO DO CATÁLOGO
=====================
Data: ${new Date().toLocaleDateString('pt-BR')}
Total de Serviços: ${this.services.length}
Modelos Cadastrados: ${this.countUniqueModels()}
Tipos de Serviço: ${this.countUniqueServices()}

ESTATÍSTICAS DE PREÇOS:
- Preço médio à vista: R$ ${report.avgAvista.toFixed(2)}
- Preço médio parcelado: R$ ${report.avgParcelado.toFixed(2)}
- Margem média: ${report.avgMargin.toFixed(1)}%
- Serviço mais caro: ${report.mostExpensive.service} (R$ ${report.mostExpensive.price.toFixed(2)})
- Serviço mais barato: ${report.cheapest.service} (R$ ${report.cheapest.price.toFixed(2)})

DISTRIBUIÇÃO POR CATEGORIA:
${report.categories.map(cat => `- ${cat.name}: ${cat.count} serviços (${cat.percentage}%)`).join('\n')}
        `.trim();
        
        alert(reportText);
    }

    /**
     * Calcula estatísticas
     */
    calculateStats(services) {
        const stats = {
            avgAvista: 0,
            avgParcelado: 0,
            avgPrice: 0,
            avgMargin: 0,
            mostExpensive: { service: 'Nenhum', price: 0 },
            cheapest: { service: 'Nenhum', price: Infinity },
            categories: []
        };
        
        if (services.length === 0) return stats;
        
        // Calcular médias
        const totalAvista = services.reduce((sum, s) => sum + s.avista, 0);
        const totalParcelado = services.reduce((sum, s) => sum + s.parcelado, 0);
        
        stats.avgAvista = totalAvista / services.length;
        stats.avgParcelado = totalParcelado / services.length;
        stats.avgPrice = (totalAvista + totalParcelado) / (2 * services.length);
        stats.avgMargin = services.reduce((sum, s) => {
            const margin = ((s.parcelado - s.avista) / s.avista * 100) || 0;
            return sum + margin;
        }, 0) / services.length;
        
        // Encontrar mais caro e mais barato
        services.forEach(service => {
            if (service.avista > stats.mostExpensive.price) {
                stats.mostExpensive = {
                    service: `${service.service} (${service.model})`,
                    price: service.avista
                };
            }
            
            if (service.avista < stats.cheapest.price) {
                stats.cheapest = {
                    service: `${service.service} (${service.model})`,
                    price: service.avista
                };
            }
        });
        
        // Calcular distribuição por categoria
        const categoryCounts = {};
        services.forEach(service => {
            categoryCounts[service.category] = (categoryCounts[service.category] || 0) + 1;
        });
        
        stats.categories = Object.entries(categoryCounts).map(([name, count]) => ({
            name,
            count,
            percentage: ((count / services.length) * 100).toFixed(1)
        }));
        
        return stats;
    }

    /**
     * Conta modelos únicos
     */
    countUniqueModels() {
        const models = new Set(this.services.map(s => s.model));
        return models.size;
    }

    /**
     * Conta serviços únicos
     */
    countUniqueServices() {
        const services = new Set(this.services.map(s => s.service));
        return services.size;
    }

    /**
     * Obtém última atualização
     */
    getLastUpdate() {
        if (this.services.length === 0) return 'Nunca';
        
        const latest = this.services.reduce((latest, service) => {
            const date = new Date(service.updatedAt);
            return date > new Date(latest) ? date : latest;
        }, new Date(0));
        
        return this.formatDate(latest);
    }

    /**
     * Formata data para exibição
     */
    formatDate(date) {
        if (!date) return 'N/A';
        
        const d = new Date(date);
        return d.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Mostra mensagem de erro
     */
    showError(message) {
        if (this.elements.container) {
            this.elements.container.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3>Erro ao carregar catálogo</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="ServiceCatalogModule.render()">
                        <i class="fas fa-redo"></i> Tentar Novamente
                    </button>
                </div>
            `;
        }
    }

    /**
     * Mostra notificação
     */
    showNotification(message, type = 'info') {
        if (window.App && typeof App.showNotification === 'function') {
            App.showNotification(message, type);
        } else {
            alert(message);
        }
    }

    /**
     * Métodos estáticos para acesso global
     */
    static async render() {
        if (window.ServiceCatalogModule && window.ServiceCatalogModule.render) {
            return window.ServiceCatalogModule.render();
        }
    }
    
    static showServiceForm(serviceId = null) {
        if (window.ServiceCatalogModule && window.ServiceCatalogModule.showServiceForm) {
            window.ServiceCatalogModule.showServiceForm(serviceId);
        }
    }
    
    static closeModal() {
        if (window.ServiceCatalogModule && window.ServiceCatalogModule.closeModal) {
            window.ServiceCatalogModule.closeModal();
        }
    }
    
    static saveService() {
        if (window.ServiceCatalogModule && window.ServiceCatalogModule.saveService) {
            window.ServiceCatalogModule.saveService();
        }
    }
    
    static resetFilters() {
        if (window.ServiceCatalogModule && window.ServiceCatalogModule.resetFilters) {
            window.ServiceCatalogModule.resetFilters();
        }
    }
    
    static exportCatalog() {
        if (window.ServiceCatalogModule && window.ServiceCatalogModule.exportCatalog) {
            window.ServiceCatalogModule.exportCatalog();
        }
    }
    
    static showPriceAdjustment() {
        if (window.ServiceCatalogModule && window.ServiceCatalogModule.showPriceAdjustment) {
            window.ServiceCatalogModule.showPriceAdjustment();
        }
    }
    
    static generateReport() {
        if (window.ServiceCatalogModule && window.ServiceCatalogModule.generateReport) {
            window.ServiceCatalogModule.generateReport();
        }
    }
}

// Criar instância única
const catalogInstance = new ServiceCatalogModule();

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => catalogInstance.init());
} else {
    catalogInstance.init();
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.CatalogModule = catalogInstance;
    window.ServiceCatalogModule = catalogInstance;
}

// Exportação para módulos ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ServiceCatalogModule: catalogInstance };
}

console.log('✅ serviceCatalog.js carregado com sucesso');