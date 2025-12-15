// modules/serviceOrders.js

/**
 * Módulo de Ordens de Serviço - Sistema completo de gestão de OS
 * Gerencia o ciclo completo de ordens de serviço técnico
 */
class ServiceOrdersModule {
    constructor() {
        this.currentOrder = null;
        this.filters = {
            status: 'all',
            dateRange: 'all',
            search: ''
        };
        this.isLoading = false;
        this.sortConfig = {
            field: 'createdAt',
            direction: 'desc'
        };
        
        // Configurações
        this.config = {
            checklistItems: [
                { id: 'screen', label: 'Tela trincada/riscos', description: 'Verificar estado da tela' },
                { id: 'power', label: 'Liga normal', description: 'Testar ligamento do aparelho' },
                { id: 'faceid', label: 'FaceID/TouchID OK', description: 'Testar biometria' },
                { id: 'audio', label: 'Áudio OK', description: 'Testar alto-falante e microfone' },
                { id: 'camera', label: 'Câmeras funcionando', description: 'Testar câmeras frontal e traseira' },
                { id: 'buttons', label: 'Botões físicos OK', description: 'Testar volume, power, etc.' },
                { id: 'charge', label: 'Carrega normalmente', description: 'Testar porta de carregamento' },
                { id: 'housing', label: 'Carcaça sem danos', description: 'Verificar estado físico externo' },
                { id: 'moisture', label: 'Sem indício de umidade', description: 'Verificar indicador de umidade' },
                { id: 'battery', label: 'Bateria com saúde >80%', description: 'Verificar saúde da bateria' },
                { id: 'sensors', label: 'Sensores funcionando', description: 'Giroscópio, acelerômetro, etc.' },
                { id: 'display', label: 'Display sem falhas', description: 'Testar cores e toque' },
                { id: 'network', label: 'WiFi/Celular OK', description: 'Testar conectividade' },
                { id: 'accessories', label: 'Acessórios incluídos', description: 'Carregador, cabo, etc.' },
                { id: 'data_backup', label: 'Backup realizado', description: 'Dados do cliente salvos' }
            ],
            statusOptions: [
                { id: 'pending', label: 'Pendente', color: 'warning', icon: 'fas fa-clock' },
                { id: 'in_progress', label: 'Em Andamento', color: 'info', icon: 'fas fa-tools' },
                { id: 'waiting_parts', label: 'Aguardando Peças', color: 'warning', icon: 'fas fa-box-open' },
                { id: 'completed', label: 'Concluído', color: 'success', icon: 'fas fa-check-circle' },
                { id: 'delivered', label: 'Entregue', color: 'primary', icon: 'fas fa-truck' },
                { id: 'cancelled', label: 'Cancelado', color: 'danger', icon: 'fas fa-ban' }
            ],
            priorities: [
                { id: 'low', label: 'Baixa', color: 'info' },
                { id: 'medium', label: 'Média', color: 'warning' },
                { id: 'high', label: 'Alta', color: 'danger' },
                { id: 'urgent', label: 'Urgente', color: 'danger', icon: 'fas fa-exclamation-triangle' }
            ]
        };
        
        this.elements = {};
    }

    /**
     * Inicializa o módulo
     */
    async init() {
        this.cacheElements();
        await this.initializeData();
        this.setupEventListeners();
        this.render();
        console.log('✅ ServiceOrdersModule inicializado');
    }

    /**
     * Cache de elementos DOM
     */
    cacheElements() {
        // Elementos principais
        this.elements.container = document.getElementById('orders-view');
        
        // Criar elementos dinâmicos se não existirem
        if (!document.getElementById('orders-modal')) {
            this.createModalStructure();
        }
    }

    /**
     * Cria estrutura do modal
     */
    createModalStructure() {
        const modalHTML = `
            <div id="orders-modal" class="modal" role="dialog" aria-labelledby="modal-title" aria-hidden="true">
                <div class="modal-content" style="max-width: 800px;">
                    <div class="modal-header">
                        <h3 id="modal-title" class="modal-title"></h3>
                        <button class="modal-close" aria-label="Fechar modal">×</button>
                    </div>
                    <div class="modal-body"></div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-action="cancel">Cancelar</button>
                        <button type="button" class="btn btn-primary" data-action="save">Salvar OS</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    /**
     * Inicializa dados
     */
    async initializeData() {
        try {
            // Verificar se o banco de dados está disponível
            if (!window.Orders_DB) {
                console.warn('Orders_DB não encontrado, usando dados mock');
                await this.initializeMockData();
            }
            
            // Carregar dados iniciais
            this.orders = await this.loadOrders();
            this.customers = await this.loadCustomers();
            this.services = await this.loadServices();
            
        } catch (error) {
            console.error('Erro ao inicializar dados:', error);
            throw error;
        }
    }

    /**
     * Carrega ordens de serviço
     */
    async loadOrders() {
        try {
            if (window.Orders_DB && typeof Orders_DB.findAll === 'function') {
                const orders = Orders_DB.findAll();
                return orders.map(order => ({
                    ...order,
                    createdAt: order.createdAt || new Date().toISOString(),
                    updatedAt: order.updatedAt || new Date().toISOString()
                }));
            } else {
                // Dados mock para desenvolvimento
                return this.getMockOrders();
            }
        } catch (error) {
            console.error('Erro ao carregar ordens:', error);
            return [];
        }
    }

    /**
     * Carrega clientes
     */
    async loadCustomers() {
        try {
            if (window.Customers_DB && typeof Customers_DB.findAll === 'function') {
                return Customers_DB.findAll();
            } else {
                return [];
            }
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
            return [];
        }
    }

    /**
     * Carrega serviços
     */
    async loadServices() {
        try {
            if (window.Catalog_DB && typeof Catalog_DB.getData === 'function') {
                const data = Catalog_DB.getData();
                return {
                    models: data.models || [],
                    services: data.services || [],
                    prices: data.prices || {}
                };
            } else {
                return { models: [], services: [], prices: {} };
            }
        } catch (error) {
            console.error('Erro ao carregar serviços:', error);
            return { models: [], services: [], prices: {} };
        }
    }

    /**
     * Dados mock para desenvolvimento
     */
    getMockOrders() {
        return [
            {
                id: 'OS-001',
                customerId: '1',
                customerName: 'João Silva',
                deviceModel: 'iPhone 12',
                serviceType: 'Troca de Tela',
                description: 'Tela trincada após queda',
                totalValue: 450.00,
                status: 'completed',
                priority: 'high',
                technicianNotes: 'Tela original substituída. Testes realizados.',
                checklist: { screen: true, power: true, faceid: false, audio: true },
                createdAt: '2024-01-15T10:30:00Z',
                updatedAt: '2024-01-16T14:45:00Z',
                estimatedDelivery: '2024-01-17T18:00:00Z'
            },
            {
                id: 'OS-002',
                customerId: '2',
                customerName: 'Maria Santos',
                deviceModel: 'Samsung Galaxy S21',
                serviceType: 'Troca de Bateria',
                description: 'Bateria não segura carga',
                totalValue: 250.00,
                status: 'in_progress',
                priority: 'medium',
                technicianNotes: 'Aguardando chegada da bateria original.',
                checklist: { power: true, charge: true, battery: false },
                createdAt: '2024-01-16T09:15:00Z',
                updatedAt: '2024-01-16T09:15:00Z',
                estimatedDelivery: '2024-01-18T17:00:00Z'
            },
            {
                id: 'OS-003',
                customerId: '3',
                customerName: 'Carlos Oliveira',
                deviceModel: 'Xiaomi Mi 11',
                serviceType: 'Reparo na Placa',
                description: 'Não liga após contato com água',
                totalValue: 350.00,
                status: 'pending',
                priority: 'urgent',
                checklist: { power: false, moisture: true },
                createdAt: '2024-01-16T14:20:00Z',
                updatedAt: '2024-01-16T14:20:00Z',
                estimatedDelivery: '2024-01-19T16:00:00Z'
            }
        ];
    }

    /**
     * Configura listeners de eventos
     */
    setupEventListeners() {
        // Delegation pattern para tabela dinâmica
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-action="edit-order"]')) {
                const orderId = e.target.closest('[data-order-id]').getAttribute('data-order-id');
                this.editOrder(orderId);
            }
            
            if (e.target.closest('[data-action="delete-order"]')) {
                const orderId = e.target.closest('[data-order-id]').getAttribute('data-order-id');
                this.confirmDelete(orderId);
            }
            
            if (e.target.closest('[data-action="change-status"]')) {
                const orderId = e.target.closest('[data-order-id]').getAttribute('data-order-id');
                const status = e.target.getAttribute('data-status');
                this.changeStatus(orderId, status);
            }
            
            if (e.target.closest('[data-action="print-order"]')) {
                const orderId = e.target.closest('[data-order-id]').getAttribute('data-order-id');
                this.printOrder(orderId);
            }
        });

        // Filtros
        document.addEventListener('change', (e) => {
            if (e.target.matches('#status-filter')) {
                this.filters.status = e.target.value;
                this.render();
            }
            
            if (e.target.matches('#search-filter')) {
                this.filters.search = e.target.value;
                // Debounce para pesquisa
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => this.render(), 300);
            }
        });

        // Modal events
        const modal = document.getElementById('orders-modal');
        if (modal) {
            modal.querySelector('.modal-close').addEventListener('click', () => this.closeModal());
            modal.querySelector('[data-action="cancel"]').addEventListener('click', () => this.closeModal());
            modal.querySelector('[data-action="save"]').addEventListener('click', () => this.saveOrder());
            
            // Fechar modal com ESC
            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') this.closeModal();
            });
        }
    }

    /**
     * Renderiza o módulo principal
     */
    async render() {
        if (!this.elements.container) return;

        try {
            this.isLoading = true;
            this.showLoading();
            
            // Carregar dados atualizados
            this.orders = await this.loadOrders();
            this.customers = await this.loadCustomers();
            
            // Aplicar filtros
            const filteredOrders = this.applyFilters(this.orders);
            
            // Ordenar
            const sortedOrders = this.sortOrders(filteredOrders);
            
            // Renderizar
            this.elements.container.innerHTML = this.getTemplate(sortedOrders);
            
            // Configurar eventos após renderização
            this.setupTableEvents();
            
            this.isLoading = false;
            
        } catch (error) {
            console.error('Erro ao renderizar módulo:', error);
            this.showError('Não foi possível carregar as ordens de serviço');
            this.isLoading = false;
        }
    }

    /**
     * Template principal
     */
    getTemplate(orders) {
        return `
            <div class="module-header">
                <div class="header-content">
                    <h1><i class="fas fa-clipboard-list"></i> Ordens de Serviço</h1>
                    <p class="subtitle">Gerencie todas as ordens de serviço da sua assistência técnica</p>
                </div>
                
                <div class="header-actions">
                    <button class="btn btn-primary" onclick="ServiceOrdersModule.openModal()">
                        <i class="fas fa-plus"></i> Nova OS
                    </button>
                </div>
            </div>
            
            <div class="card">
                <div class="filters-container">
                    <div class="filter-group">
                        <label for="status-filter" class="filter-label">Status:</label>
                        <select id="status-filter" class="form-select" style="width: 150px;">
                            <option value="all">Todos os Status</option>
                            ${this.config.statusOptions.map(status => `
                                <option value="${status.id}" ${this.filters.status === status.id ? 'selected' : ''}>
                                    ${status.label}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label for="search-filter" class="filter-label">Buscar:</label>
                        <div class="search-box">
                            <i class="fas fa-search"></i>
                            <input type="text" 
                                   id="search-filter" 
                                   class="form-control" 
                                   placeholder="Cliente, modelo, serviço..."
                                   value="${this.filters.search}">
                        </div>
                    </div>
                    
                    <div class="filter-stats">
                        <span class="stat-item">
                            <i class="fas fa-list"></i>
                            ${orders.length} ordens
                        </span>
                        <span class="stat-item">
                            <i class="fas fa-clock"></i>
                            ${orders.filter(o => o.status === 'pending').length} pendentes
                        </span>
                    </div>
                </div>
                
                <div class="table-responsive">
                    <table class="table orders-table">
                        <thead>
                            <tr>
                                <th><a href="#" data-sort="id">OS #</a></th>
                                <th><a href="#" data-sort="customerName">Cliente</a></th>
                                <th><a href="#" data-sort="deviceModel">Aparelho / Serviço</a></th>
                                <th><a href="#" data-sort="status">Status</a></th>
                                <th><a href="#" data-sort="priority">Prioridade</a></th>
                                <th><a href="#" data-sort="totalValue">Valor</a></th>
                                <th><a href="#" data-sort="createdAt">Data</a></th>
                                <th class="text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orders.length > 0 ? 
                                orders.map(order => this.getOrderRowTemplate(order)).join('') : 
                                this.getEmptyStateTemplate()
                            }
                        </tbody>
                    </table>
                </div>
                
                <div class="table-footer">
                    <div class="pagination-info">
                        Mostrando ${orders.length} de ${this.orders.length} ordens
                    </div>
                </div>
            </div>
            
            <div class="quick-stats">
                <div class="stat-card">
                    <div class="stat-icon bg-warning">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-content">
                        <span class="stat-value">${orders.filter(o => o.status === 'pending').length}</span>
                        <span class="stat-label">Pendentes</span>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon bg-info">
                        <i class="fas fa-tools"></i>
                    </div>
                    <div class="stat-content">
                        <span class="stat-value">${orders.filter(o => o.status === 'in_progress').length}</span>
                        <span class="stat-label">Em Andamento</span>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon bg-success">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-content">
                        <span class="stat-value">${orders.filter(o => o.status === 'completed').length}</span>
                        <span class="stat-label">Concluídas</span>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon bg-primary">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                    <div class="stat-content">
                        <span class="stat-value">R$ ${this.calculateTotalValue(orders).toFixed(2)}</span>
                        <span class="stat-label">Valor Total</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Template para linha da tabela
     */
    getOrderRowTemplate(order) {
        const status = this.config.statusOptions.find(s => s.id === order.status) || this.config.statusOptions[0];
        const priority = this.config.priorities.find(p => p.id === order.priority) || this.config.priorities[1];
        const customer = this.customers.find(c => c.id === order.customerId) || { name: 'Cliente não encontrado' };
        
        return `
            <tr data-order-id="${order.id}">
                <td>
                    <div class="order-id">
                        <strong>${order.id}</strong>
                        <small class="text-muted">${this.formatDate(order.createdAt)}</small>
                    </div>
                </td>
                <td>
                    <div class="customer-info">
                        <strong>${customer.name}</strong>
                        ${customer.phone ? `<small class="text-muted">${customer.phone}</small>` : ''}
                    </div>
                </td>
                <td>
                    <div class="device-info">
                        <div class="device-model">${order.deviceModel}</div>
                        <div class="service-type">${order.serviceType}</div>
                        ${order.description ? `<small class="text-muted">${order.description.substring(0, 50)}...</small>` : ''}
                    </div>
                </td>
                <td>
                    <span class="badge badge-${status.color}">
                        <i class="${status.icon}"></i> ${status.label}
                    </span>
                </td>
                <td>
                    <span class="badge badge-${priority.color}">
                        ${priority.icon ? `<i class="${priority.icon}"></i> ` : ''}${priority.label}
                    </span>
                </td>
                <td>
                    <div class="price-display">
                        <strong>R$ ${parseFloat(order.totalValue || 0).toFixed(2)}</strong>
                    </div>
                </td>
                <td>
                    <div class="date-display">
                        <div>${this.formatDate(order.createdAt, 'short')}</div>
                        ${order.estimatedDelivery ? 
                            `<small class="text-muted">Entrega: ${this.formatDate(order.estimatedDelivery, 'short')}</small>` : 
                            ''
                        }
                    </div>
                </td>
                <td class="actions-cell">
                    <div class="btn-group">
                        <button class="btn btn-icon btn-sm" data-action="edit-order" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        
                        <div class="dropdown">
                            <button class="btn btn-icon btn-sm dropdown-toggle" data-bs-toggle="dropdown" title="Mais ações">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <li>
                                    <a class="dropdown-item" href="#" data-action="change-status" data-status="completed">
                                        <i class="fas fa-check"></i> Concluir OS
                                    </a>
                                </li>
                                <li>
                                    <a class="dropdown-item" href="#" data-action="print-order">
                                        <i class="fas fa-print"></i> Imprimir
                                    </a>
                                </li>
                                <li><hr class="dropdown-divider"></li>
                                <li>
                                    <a class="dropdown-item text-danger" href="#" data-action="delete-order">
                                        <i class="fas fa-trash"></i> Excluir
                                    </a>
                                </li>
                            </ul>
                        </div>
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
                            <i class="fas fa-clipboard"></i>
                        </div>
                        <h3>Nenhuma ordem de serviço</h3>
                        <p>Comece criando sua primeira ordem de serviço</p>
                        <button class="btn btn-primary" onclick="ServiceOrdersModule.openModal()">
                            <i class="fas fa-plus"></i> Criar Primeira OS
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * Aplica filtros às ordens
     */
    applyFilters(orders) {
        let filtered = [...orders];
        
        // Filtro por status
        if (this.filters.status !== 'all') {
            filtered = filtered.filter(order => order.status === this.filters.status);
        }
        
        // Filtro por busca
        if (this.filters.search) {
            const searchTerm = this.filters.search.toLowerCase();
            filtered = filtered.filter(order => 
                (order.customerName && order.customerName.toLowerCase().includes(searchTerm)) ||
                (order.deviceModel && order.deviceModel.toLowerCase().includes(searchTerm)) ||
                (order.serviceType && order.serviceType.toLowerCase().includes(searchTerm)) ||
                (order.id && order.id.toLowerCase().includes(searchTerm))
            );
        }
        
        return filtered;
    }

    /**
     * Ordena as ordens
     */
    sortOrders(orders) {
        const { field, direction } = this.sortConfig;
        
        return [...orders].sort((a, b) => {
            let aValue = a[field];
            let bValue = b[field];
            
            // Tratamento para datas
            if (field.includes('At') || field.includes('Date')) {
                aValue = new Date(aValue).getTime();
                bValue = new Date(bValue).getTime();
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
     * Configura eventos da tabela
     */
    setupTableEvents() {
        // Ordenação
        const sortLinks = this.elements.container.querySelectorAll('[data-sort]');
        sortLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const field = link.getAttribute('data-sort');
                this.sortTable(field);
            });
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
     * Abre modal para nova/edição de OS
     */
    openModal(orderId = null) {
        this.currentOrder = orderId ? 
            this.orders.find(o => o.id === orderId) : 
            this.getDefaultOrder();
        
        const modal = document.getElementById('orders-modal');
        const modalTitle = modal.querySelector('.modal-title');
        const modalBody = modal.querySelector('.modal-body');
        
        modalTitle.textContent = orderId ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço';
        modalBody.innerHTML = this.getModalTemplate();
        
        this.setupModalEvents();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Template do modal
     */
    getModalTemplate() {
        const isEditing = !!this.currentOrder.id;
        
        return `
            <form id="order-form" class="order-form">
                <div class="form-row">
                    <div class="form-group">
                        <label for="customer-select" class="form-label required">Cliente</label>
                        <select id="customer-select" class="form-select" required>
                            <option value="">Selecione um cliente...</option>
                            ${this.customers.map(customer => `
                                <option value="${customer.id}" 
                                        ${this.currentOrder.customerId === customer.id ? 'selected' : ''}>
                                    ${customer.name} - ${customer.phone || 'Sem telefone'}
                                </option>
                            `).join('')}
                        </select>
                        <small class="form-text">
                            Não encontrou? <a href="#" onclick="SidebarModule.navigateTo('customers')">Cadastrar novo cliente</a>
                        </small>
                    </div>
                    
                    <div class="form-group">
                        <label for="order-status" class="form-label required">Status</label>
                        <select id="order-status" class="form-select" required>
                            ${this.config.statusOptions.map(status => `
                                <option value="${status.id}" 
                                        ${this.currentOrder.status === status.id ? 'selected' : ''}>
                                    <i class="${status.icon}"></i> ${status.label}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="device-model" class="form-label required">Modelo do Aparelho</label>
                        <input type="text" 
                               id="device-model" 
                               class="form-control" 
                               value="${this.currentOrder.deviceModel || ''}"
                               placeholder="Ex: iPhone 12 Pro Max"
                               required>
                    </div>
                    
                    <div class="form-group">
                        <label for="service-type" class="form-label required">Tipo de Serviço</label>
                        <input type="text" 
                               id="service-type" 
                               class="form-control" 
                               value="${this.currentOrder.serviceType || ''}"
                               placeholder="Ex: Troca de tela, reparo na placa"
                               required>
                        <small class="form-text">
                            Sugestões: Troca de tela, Troca de bateria, Reparo na placa, Limpeza geral
                        </small>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="order-description" class="form-label">Descrição do Problema</label>
                    <textarea id="order-description" 
                              class="form-control" 
                              rows="3"
                              placeholder="Descreva o problema relatado pelo cliente...">${this.currentOrder.description || ''}</textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="order-value" class="form-label required">Valor (R$)</label>
                        <input type="number" 
                               id="order-value" 
                               class="form-control" 
                               value="${this.currentOrder.totalValue || ''}"
                               step="0.01"
                               min="0"
                               required>
                    </div>
                    
                    <div class="form-group">
                        <label for="order-priority" class="form-label">Prioridade</label>
                        <select id="order-priority" class="form-select">
                            ${this.config.priorities.map(priority => `
                                <option value="${priority.id}" 
                                        ${this.currentOrder.priority === priority.id ? 'selected' : ''}>
                                    ${priority.label}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="technician-notes" class="form-label">Anotações Técnicas</label>
                    <textarea id="technician-notes" 
                              class="form-control" 
                              rows="2"
                              placeholder="Anotações do técnico durante a análise...">${this.currentOrder.technicianNotes || ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Checklist de Verificação</label>
                    <div class="checklist-grid">
                        ${this.config.checklistItems.map(item => `
                            <div class="checklist-item">
                                <input type="checkbox" 
                                       id="check-${item.id}" 
                                       ${this.currentOrder.checklist && this.currentOrder.checklist[item.id] ? 'checked' : ''}>
                                <label for="check-${item.id}">
                                    <span class="checklist-label">${item.label}</span>
                                    <small class="checklist-description">${item.description}</small>
                                </label>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                ${isEditing ? `
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Data de Criação</label>
                            <input type="text" 
                                   class="form-control" 
                                   value="${this.formatDate(this.currentOrder.createdAt, 'full')}"
                                   disabled>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Última Atualização</label>
                            <input type="text" 
                                   class="form-control" 
                                   value="${this.formatDate(this.currentOrder.updatedAt, 'full')}"
                                   disabled>
                        </div>
                    </div>
                ` : ''}
            </form>
        `;
    }

    /**
     * Retorna ordem padrão para novo cadastro
     */
    getDefaultOrder() {
        const orderId = `OS-${Date.now().toString().slice(-6)}`;
        
        return {
            id: orderId,
            customerId: '',
            deviceModel: '',
            serviceType: '',
            description: '',
            totalValue: 0,
            status: 'pending',
            priority: 'medium',
            technicianNotes: '',
            checklist: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // +3 dias
        };
    }

    /**
     * Configura eventos do modal
     */
    setupModalEvents() {
        // Preencher automaticamente com dados do catálogo
        const deviceModelInput = document.getElementById('device-model');
        const serviceTypeInput = document.getElementById('service-type');
        
        if (this.services.models && this.services.models.length > 0) {
            this.setupAutocomplete(deviceModelInput, this.services.models);
        }
        
        if (this.services.services && this.services.services.length > 0) {
            this.setupAutocomplete(serviceTypeInput, this.services.services);
        }
    }

    /**
     * Configura autocomplete para um input
     */
    setupAutocomplete(input, suggestions) {
        let currentFocus;
        
        input.addEventListener('input', function() {
            const val = this.value;
            closeAllLists();
            
            if (!val) return false;
            currentFocus = -1;
            
            const list = document.createElement('div');
            list.id = this.id + '-autocomplete-list';
            list.className = 'autocomplete-items';
            this.parentNode.appendChild(list);
            
            suggestions
                .filter(item => item.toLowerCase().includes(val.toLowerCase()))
                .slice(0, 5)
                .forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.innerHTML = `<strong>${item.substring(0, val.length)}</strong>${item.substring(val.length)}`;
                    itemDiv.innerHTML += `<input type='hidden' value='${item}'>`;
                    itemDiv.addEventListener('click', function() {
                        input.value = this.getElementsByTagName('input')[0].value;
                        closeAllLists();
                    });
                    list.appendChild(itemDiv);
                });
        });
        
        input.addEventListener('keydown', function(e) {
            let items = document.getElementById(this.id + '-autocomplete-list');
            if (items) items = items.getElementsByTagName('div');
            
            if (e.key === 'ArrowDown') {
                currentFocus++;
                addActive(items);
            } else if (e.key === 'ArrowUp') {
                currentFocus--;
                addActive(items);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (currentFocus > -1 && items) {
                    items[currentFocus].click();
                }
            }
        });
        
        function addActive(items) {
            if (!items) return false;
            removeActive(items);
            if (currentFocus >= items.length) currentFocus = 0;
            if (currentFocus < 0) currentFocus = items.length - 1;
            items[currentFocus].classList.add('autocomplete-active');
        }
        
        function removeActive(items) {
            for (let i = 0; i < items.length; i++) {
                items[i].classList.remove('autocomplete-active');
            }
        }
        
        function closeAllLists(elmnt) {
            const items = document.getElementsByClassName('autocomplete-items');
            for (let i = 0; i < items.length; i++) {
                if (elmnt !== items[i] && elmnt !== input) {
                    items[i].parentNode.removeChild(items[i]);
                }
            }
        }
        
        document.addEventListener('click', function(e) {
            closeAllLists(e.target);
        });
    }

    /**
     * Salva ordem de serviço
     */
    async saveOrder() {
        try {
            const form = document.getElementById('order-form');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            
            const orderData = this.collectFormData();
            
            if (window.Orders_DB) {
                if (this.currentOrder.id && this.currentOrder.id.startsWith('OS-')) {
                    // Atualizar ordem existente
                    Orders_DB.update(this.currentOrder.id, orderData);
                } else {
                    // Criar nova ordem
                    orderData.id = `OS-${Date.now().toString().slice(-6)}`;
                    Orders_DB.create(orderData);
                }
            }
            
            // Atualizar dashboard se disponível
            if (window.DashboardModule && typeof DashboardModule.render === 'function') {
                DashboardModule.render();
            }
            
            this.closeModal();
            await this.render();
            
            this.showNotification(
                `Ordem de serviço ${this.currentOrder.id ? 'atualizada' : 'criada'} com sucesso!`,
                'success'
            );
            
        } catch (error) {
            console.error('Erro ao salvar ordem:', error);
            this.showNotification('Erro ao salvar ordem de serviço', 'error');
        }
    }

    /**
     * Coleta dados do formulário
     */
    collectFormData() {
        const checklist = {};
        this.config.checklistItems.forEach(item => {
            const checkbox = document.getElementById(`check-${item.id}`);
            checklist[item.id] = checkbox ? checkbox.checked : false;
        });
        
        return {
            customerId: document.getElementById('customer-select').value,
            deviceModel: document.getElementById('device-model').value,
            serviceType: document.getElementById('service-type').value,
            description: document.getElementById('order-description').value,
            totalValue: parseFloat(document.getElementById('order-value').value) || 0,
            status: document.getElementById('order-status').value,
            priority: document.getElementById('order-priority').value,
            technicianNotes: document.getElementById('technician-notes').value,
            checklist,
            updatedAt: new Date().toISOString()
        };
    }

    /**
     * Fecha modal
     */
    closeModal() {
        const modal = document.getElementById('orders-modal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        this.currentOrder = null;
    }

    /**
     * Edita ordem existente
     */
    editOrder(orderId) {
        this.openModal(orderId);
    }

    /**
     * Confirma exclusão de ordem
     */
    async confirmDelete(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;
        
        if (confirm(`Tem certeza que deseja excluir a ordem ${orderId}?\nEsta ação não pode ser desfeita.`)) {
            try {
                if (window.Orders_DB && typeof Orders_DB.delete === 'function') {
                    Orders_DB.delete(orderId);
                }
                
                await this.render();
                
                if (window.DashboardModule && typeof DashboardModule.render === 'function') {
                    DashboardModule.render();
                }
                
                this.showNotification('Ordem de serviço excluída com sucesso', 'success');
            } catch (error) {
                console.error('Erro ao excluir ordem:', error);
                this.showNotification('Erro ao excluir ordem de serviço', 'error');
            }
        }
    }

    /**
     * Altera status da ordem
     */
    async changeStatus(orderId, newStatus) {
        try {
            const order = this.orders.find(o => o.id === orderId);
            if (!order) return;
            
            if (window.Orders_DB && typeof Orders_DB.update === 'function') {
                Orders_DB.update(orderId, {
                    status: newStatus,
                    updatedAt: new Date().toISOString()
                });
            }
            
            await this.render();
            
            if (window.DashboardModule && typeof DashboardModule.render === 'function') {
                DashboardModule.render();
            }
            
            this.showNotification('Status atualizado com sucesso', 'success');
        } catch (error) {
            console.error('Erro ao alterar status:', error);
            this.showNotification('Erro ao alterar status', 'error');
        }
    }

    /**
     * Imprime ordem de serviço
     */
    printOrder(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;
        
        // Em produção, isso geraria um PDF
        console.log('Imprimindo ordem:', order);
        alert(`Gerando PDF para ordem ${orderId}...\n\nEsta funcionalidade será implementada na próxima versão.`);
    }

    /**
     * Calcula valor total das ordens
     */
    calculateTotalValue(orders) {
        return orders.reduce((total, order) => total + parseFloat(order.totalValue || 0), 0);
    }

    /**
     * Formata data para exibição
     */
    formatDate(dateString, format = 'short') {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        
        if (format === 'short') {
            return date.toLocaleDateString('pt-BR');
        } else if (format === 'full') {
            return date.toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        return date.toLocaleDateString('pt-BR');
    }

    /**
     * Mostra estado de carregamento
     */
    showLoading() {
        if (this.elements.container && this.isLoading) {
            this.elements.container.innerHTML = `
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Carregando ordens de serviço...</p>
                </div>
            `;
        }
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
                    <h3>Erro ao carregar</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="ServiceOrdersModule.render()">
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
        if (window.ServiceOrdersModule && window.ServiceOrdersModule.render) {
            return window.ServiceOrdersModule.render();
        }
    }
    
    static openModal(orderId = null) {
        if (window.ServiceOrdersModule && window.ServiceOrdersModule.openModal) {
            window.ServiceOrdersModule.openModal(orderId);
        }
    }
    
    static editOrder(orderId) {
        if (window.ServiceOrdersModule && window.ServiceOrdersModule.editOrder) {
            window.ServiceOrdersModule.editOrder(orderId);
        }
    }
}

// Criar instância única
const ordersInstance = new ServiceOrdersModule();

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ordersInstance.init());
} else {
    ordersInstance.init();
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.OrdersModule = ordersInstance;
    window.ServiceOrdersModule = ordersInstance;
}

// Exportação para módulos ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ServiceOrdersModule: ordersInstance };
}

console.log('✅ serviceOrders.js carregado com sucesso');