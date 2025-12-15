// modules/Customers.js
const CustomersModule = {
    // Estado interno do módulo
    currentView: 'table', // 'table' ou 'card'
    searchTerm: '',
    filterField: 'all',
    sortField: 'createdAt',
    sortOrder: 'desc',

    // Inicialização do módulo
    init() {
        this.render();
        this.setupEventListeners();
    },

    // Renderiza a interface completa
    render() {
        const container = document.getElementById('customers-view');
        const customers = this.getFilteredCustomers();

        container.innerHTML = `
            <!-- Cabeçalho com título e botões de ação -->
            <div class="module-header">
                <div class="header-left">
                    <h1><i class="fas fa-users"></i> Clientes (CRM)</h1>
                    <div class="subtitle">${customers.length} clientes cadastrados</div>
                </div>
                <div class="header-actions">
                    <button class="btn btn-icon" onclick="CustomersModule.toggleView()" title="Alternar visualização">
                        <i class="fas ${this.currentView === 'table' ? 'fa-th-large' : 'fa-list'}"></i>
                    </button>
                    <button class="btn btn-primary" onclick="CustomersModule.openCustomerModal(null)">
                        <i class="fas fa-plus"></i> Novo Cliente
                    </button>
                </div>
            </div>

            <!-- Barra de ferramentas (busca e filtros) -->
            <div class="toolbar">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" 
                           id="customer-search" 
                           placeholder="Buscar clientes..." 
                           value="${this.searchTerm}"
                           onkeyup="CustomersModule.handleSearch(event)">
                </div>
                
                <select id="filter-field" onchange="CustomersModule.handleFilterChange(event)" class="filter-select">
                    <option value="all" ${this.filterField === 'all' ? 'selected' : ''}>Todos os campos</option>
                    <option value="name" ${this.filterField === 'name' ? 'selected' : ''}>Nome</option>
                    <option value="phone" ${this.filterField === 'phone' ? 'selected' : ''}>Telefone</option>
                    <option value="email" ${this.filterField === 'email' ? 'selected' : ''}>Email</option>
                </select>

                <select id="sort-field" onchange="CustomersModule.handleSortChange(event)" class="sort-select">
                    <option value="createdAt" ${this.sortField === 'createdAt' ? 'selected' : ''}>Data de cadastro</option>
                    <option value="name" ${this.sortField === 'name' ? 'selected' : ''}>Nome A-Z</option>
                    <option value="totalSpent" ${this.sortField === 'totalSpent' ? 'selected' : ''}>Valor gasto</option>
                    <option value="lastService" ${this.sortField === 'lastService' ? 'selected' : ''}>Último serviço</option>
                </select>

                <button class="btn ${this.sortOrder === 'desc' ? 'btn-icon active' : 'btn-icon'}" 
                        onclick="CustomersModule.toggleSortOrder()"
                        title="${this.sortOrder === 'desc' ? 'Ordem decrescente' : 'Ordem crescente'}">
                    <i class="fas fa-sort-amount-${this.sortOrder === 'desc' ? 'down' : 'up'}"></i>
                </button>
            </div>

            <!-- Container para visualização (tabela ou cards) -->
            <div id="customers-container" class="customers-container ${this.currentView}-view">
                ${this.currentView === 'table' ? this.renderTableView(customers) : this.renderCardsView(customers)}
            </div>

            <!-- Modal de Cadastro/Edição -->
            <div id="customer-modal" class="modal">
                <div class="modal-content" style="max-width: 600px;">
                    <div class="modal-header">
                        <h2><span id="modal-title">Novo Cliente</span></h2>
                        <span class="close-modal" onclick="CustomersModule.closeCustomerModal()">&times;</span>
                    </div>
                    <form id="customer-form" onsubmit="CustomersModule.handleSubmit(event)">
                        <div class="form-row">
                            <div class="form-group">
                                <label><i class="fas fa-user"></i> Nome Completo *</label>
                                <input type="text" name="name" required placeholder="Ex: João Silva Santos">
                            </div>
                            <div class="form-group">
                                <label><i class="fas fa-phone"></i> Telefone Principal *</label>
                                <input type="tel" name="phone" required placeholder="(11) 99999-9999">
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label><i class="fas fa-phone-alt"></i> Telefone Alternativo</label>
                                <input type="tel" name="phone2" placeholder="(11) 3333-3333">
                            </div>
                            <div class="form-group">
                                <label><i class="fas fa-envelope"></i> Email</label>
                                <input type="email" name="email" placeholder="cliente@exemplo.com">
                            </div>
                        </div>

                        <div class="form-group">
                            <label><i class="fas fa-map-marker-alt"></i> Endereço</label>
                            <div class="address-fields">
                                <input type="text" name="street" placeholder="Rua, Número" style="margin-bottom: 8px;">
                                <input type="text" name="neighborhood" placeholder="Bairro" style="margin-bottom: 8px;">
                                <div style="display: flex; gap: 10px;">
                                    <input type="text" name="city" placeholder="Cidade" style="flex: 2;">
                                    <input type="text" name="state" placeholder="UF" maxlength="2" style="flex: 1;">
                                    <input type="text" name="zipCode" placeholder="CEP" style="flex: 2;">
                                </div>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label><i class="fas fa-id-card"></i> CPF/CNPJ</label>
                                <input type="text" name="document" placeholder="000.000.000-00">
                            </div>
                            <div class="form-group">
                                <label><i class="fas fa-birthday-cake"></i> Data de Nascimento</label>
                                <input type="date" name="birthDate">
                            </div>
                        </div>

                        <div class="form-group">
                            <label><i class="fas fa-tags"></i> Tags/Categorias</label>
                            <div class="tags-container" id="tags-container">
                                <!-- Tags serão adicionadas dinamicamente -->
                            </div>
                            <select id="tag-select" class="tag-select" onchange="CustomersModule.addTag(this.value)">
                                <option value="">Adicionar tag...</option>
                                <option value="vip">VIP</option>
                                <option value="frequent">Frequente</option>
                                <option value="corporate">Empresarial</option>
                                <option value="indicator">Indicador</option>
                                <option value="complain">Reclamante</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label><i class="fas fa-sticky-note"></i> Observações</label>
                            <textarea name="notes" rows="3" placeholder="Anotações importantes sobre o cliente..."></textarea>
                        </div>

                        <input type="hidden" name="id" value="">
                        
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" onclick="CustomersModule.closeCustomerModal()">Cancelar</button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Salvar Cliente
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Modal de Histórico -->
            <div id="history-modal" class="modal">
                <div class="modal-content" style="max-width: 800px;">
                    <div class="modal-header">
                        <h2><i class="fas fa-history"></i> Histórico Completo</h2>
                        <span class="close-modal" onclick="CustomersModule.closeHistoryModal()">&times;</span>
                    </div>
                    <div id="history-content">
                        <!-- Conteúdo carregado dinamicamente -->
                    </div>
                </div>
            </div>
        `;

        // Inicializar tags se houver
        this.initTags();
    },

    // Renderiza a visualização em tabela
    renderTableView(customers) {
        if (customers.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-user-slash"></i>
                    <h3>Nenhum cliente encontrado</h3>
                    <p>${this.searchTerm ? 'Tente ajustar sua busca' : 'Cadastre seu primeiro cliente'}</p>
                </div>
            `;
        }

        const rows = customers.map(customer => `
            <tr>
                <td>
                    <div class="customer-info">
                        <div class="avatar ${this.getCustomerStatus(customer)}">
                            ${customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <strong>${customer.name}</strong>
                            <div class="customer-tags">
                                ${customer.tags ? customer.tags.map(tag => 
                                    `<span class="tag tag-${tag}">${this.getTagLabel(tag)}</span>`
                                ).join('') : ''}
                            </div>
                        </div>
                    </div>
                </td>
                <td>
                    <div>${customer.phone}</div>
                    ${customer.phone2 ? `<div class="text-muted">${customer.phone2}</div>` : ''}
                </td>
                <td>${customer.email || '<span class="text-muted">—</span>'}</td>
                <td class="text-right">
                    R$ ${this.getTotalSpent(customer).toFixed(2)}
                </td>
                <td>${this.formatDate(customer.createdAt)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-sm" onclick="CustomersModule.openHistoryModal('${customer.id}')" 
                                title="Ver histórico">
                            <i class="fas fa-history"></i>
                        </button>
                        <button class="btn-icon btn-sm" onclick="CustomersModule.openCustomerModal('${customer.id}')" 
                                title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-sm btn-danger" onclick="CustomersModule.deleteCustomer('${customer.id}')" 
                                title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        return `
            <div class="card table-card">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Contato</th>
                            <th>Email</th>
                            <th>Total Gasto</th>
                            <th>Cadastro</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        `;
    },

    // Renderiza a visualização em cards
    renderCardsView(customers) {
        if (customers.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-user-slash"></i>
                    <h3>Nenhum cliente encontrado</h3>
                    <p>${this.searchTerm ? 'Tente ajustar sua busca' : 'Cadastre seu primeiro cliente'}</p>
                </div>
            `;
        }

        const cards = customers.map(customer => `
            <div class="customer-card">
                <div class="card-header">
                    <div class="avatar ${this.getCustomerStatus(customer)}">
                        ${customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3>${customer.name}</h3>
                        <div class="customer-tags">
                            ${customer.tags ? customer.tags.map(tag => 
                                `<span class="tag tag-${tag}">${this.getTagLabel(tag)}</span>`
                            ).join('') : ''}
                        </div>
                    </div>
                </div>
                
                <div class="card-body">
                    <div class="info-row">
                        <i class="fas fa-phone"></i>
                        <div>
                            <strong>${customer.phone}</strong>
                            ${customer.phone2 ? `<div class="text-muted">${customer.phone2}</div>` : ''}
                        </div>
                    </div>
                    
                    ${customer.email ? `
                    <div class="info-row">
                        <i class="fas fa-envelope"></i>
                        <div>${customer.email}</div>
                    </div>` : ''}
                    
                    ${customer.address ? `
                    <div class="info-row">
                        <i class="fas fa-map-marker-alt"></i>
                        <div>${customer.address}</div>
                    </div>` : ''}
                    
                    <div class="info-row">
                        <i class="fas fa-money-bill-wave"></i>
                        <div><strong>R$ ${this.getTotalSpent(customer).toFixed(2)}</strong> total gasto</div>
                    </div>
                    
                    <div class="info-row">
                        <i class="fas fa-calendar"></i>
                        <div>Cadastrado em ${this.formatDate(customer.createdAt)}</div>
                    </div>
                    
                    ${customer.notes ? `
                    <div class="notes">
                        <strong>Observações:</strong>
                        <p>${customer.notes}</p>
                    </div>` : ''}
                </div>
                
                <div class="card-footer">
                    <button class="btn btn-sm btn-outline" onclick="CustomersModule.openHistoryModal('${customer.id}')">
                        <i class="fas fa-history"></i> Histórico
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="CustomersModule.openCustomerModal('${customer.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                </div>
            </div>
        `).join('');

        return `<div class="cards-grid">${cards}</div>`;
    },

    // Configura event listeners
    setupEventListeners() {
        // Event delegation para tags
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag-remove')) {
                this.removeTag(e.target.dataset.tag);
            }
        });
    },

    // Lida com a busca
    handleSearch(event) {
        this.searchTerm = event.target.value.toLowerCase();
        this.render();
    },

    // Lida com mudança de filtro
    handleFilterChange(event) {
        this.filterField = event.target.value;
        this.render();
    },

    // Lida com mudança de ordenação
    handleSortChange(event) {
        this.sortField = event.target.value;
        this.render();
    },

    // Alterna ordem de ordenação
    toggleSortOrder() {
        this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc';
        this.render();
    },

    // Alterna entre visualização de tabela e cards
    toggleView() {
        this.currentView = this.currentView === 'table' ? 'card' : 'table';
        this.render();
    },

    // Obtém clientes filtrados e ordenados
    getFilteredCustomers() {
        let customers = Customers_DB.findAll();
        
        // Aplica filtro de busca
        if (this.searchTerm) {
            customers = customers.filter(customer => {
                const searchFields = this.filterField === 'all' 
                    ? ['name', 'phone', 'phone2', 'email', 'document', 'address', 'notes']
                    : [this.filterField];
                
                return searchFields.some(field => {
                    const value = customer[field] || '';
                    return value.toString().toLowerCase().includes(this.searchTerm);
                });
            });
        }
        
        // Aplica ordenação
        customers.sort((a, b) => {
            let valueA = a[this.sortField] || 0;
            let valueB = b[this.sortField] || 0;
            
            if (this.sortField === 'name') {
                valueA = valueA.toLowerCase();
                valueB = valueB.toLowerCase();
            }
            
            if (valueA < valueB) return this.sortOrder === 'asc' ? -1 : 1;
            if (valueA > valueB) return this.sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
        
        return customers;
    },

    // Abre modal de cliente (novo ou edição)
    openCustomerModal(customerId) {
        const modal = document.getElementById('customer-modal');
        const form = document.getElementById('customer-form');
        const title = document.getElementById('modal-title');
        
        if (customerId) {
            // Modo edição
            const customer = Customers_DB.findById(customerId);
            title.textContent = 'Editar Cliente';
            
            // Preenche formulário
            Object.keys(customer).forEach(key => {
                const input = form.elements[key];
                if (input) {
                    input.value = customer[key] || '';
                }
            });
            
            // Preenche campos de endereço se for objeto
            if (typeof customer.address === 'object') {
                const address = customer.address;
                form.elements.street.value = address.street || '';
                form.elements.neighborhood.value = address.neighborhood || '';
                form.elements.city.value = address.city || '';
                form.elements.state.value = address.state || '';
                form.elements.zipCode.value = address.zipCode || '';
            }
            
            // Carrega tags
            this.loadTags(customer.tags || []);
        } else {
            // Modo novo
            title.textContent = 'Novo Cliente';
            form.reset();
            form.elements.id.value = '';
            this.loadTags([]);
        }
        
        modal.style.display = 'flex';
    },

    // Fecha modal de cliente
    closeCustomerModal() {
        document.getElementById('customer-modal').style.display = 'none';
    },

    // Lida com envio do formulário
    handleSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Processa tags
        const tags = Array.from(document.querySelectorAll('.tag')).map(tag => tag.dataset.value);
        data.tags = tags;
        
        // Processa endereço como objeto
        data.address = {
            street: form.elements.street.value,
            neighborhood: form.elements.neighborhood.value,
            city: form.elements.city.value,
            state: form.elements.state.value,
            zipCode: form.elements.zipCode.value
        };
        
        // Adiciona data de criação se for novo
        if (!data.id) {
            data.createdAt = new Date().toISOString();
            data.id = 'cust_' + Date.now();
        }
        
        // Salva no banco de dados
        if (data.id && data.id.startsWith('cust_')) {
            Customers_DB.update(data.id, data);
        } else {
            Customers_DB.create(data);
        }
        
        // Fecha modal e atualiza
        this.closeCustomerModal();
        this.render();
        DashboardModule.refresh(); // Atualiza dashboard
    },

    // Exclui cliente com confirmação
    deleteCustomer(id) {
        if (confirm('Tem certeza que deseja excluir este cliente?\n\nEsta ação não pode ser desfeita.')) {
            // Verifica se cliente tem ordens de serviço
            const hasOrders = Orders_DB.findByCustomerId(id).length > 0;
            
            if (hasOrders) {
                if (!confirm('Este cliente possui ordens de serviço vinculadas.\n\nDeseja excluir mesmo assim? (As ordens não serão excluídas)')) {
                    return;
                }
            }
            
            Customers_DB.delete(id);
            this.render();
            DashboardModule.refresh();
        }
    },

    // Abre modal de histórico
    openHistoryModal(customerId) {
        const customer = Customers_DB.findById(customerId);
        const orders = Orders_DB.findByCustomerId(customerId);
        const modal = document.getElementById('history-modal');
        const content = document.getElementById('history-content');
        
        let ordersHtml = '';
        if (orders.length > 0) {
            ordersHtml = orders.map(order => `
                <div class="order-item ${order.status}">
                    <div class="order-header">
                        <strong>OS#${order.id}</strong>
                        <span class="order-date">${this.formatDate(order.createdAt)}</span>
                        <span class="order-status status-${order.status}">${this.getStatusLabel(order.status)}</span>
                    </div>
                    <div class="order-details">
                        <div><strong>Serviço:</strong> ${order.service}</div>
                        <div><strong>Modelo:</strong> ${order.model || '—'}</div>
                        <div><strong>Valor:</strong> R$ ${order.value || 0}</div>
                        ${order.description ? `<div><strong>Descrição:</strong> ${order.description}</div>` : ''}
                    </div>
                </div>
            `).join('');
        }
        
        const totalSpent = orders.reduce((sum, order) => sum + (parseFloat(order.value) || 0), 0);
        
        content.innerHTML = `
            <div class="customer-summary">
                <div class="summary-header">
                    <div class="avatar large ${this.getCustomerStatus(customer)}">
                        ${customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3>${customer.name}</h3>
                        <div class="customer-meta">
                            <span><i class="fas fa-phone"></i> ${customer.phone}</span>
                            ${customer.email ? `<span><i class="fas fa-envelope"></i> ${customer.email}</span>` : ''}
                            <span><i class="fas fa-calendar"></i> Cliente desde ${this.formatDate(customer.createdAt)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="summary-stats">
                    <div class="stat-card">
                        <div class="stat-value">${orders.length}</div>
                        <div class="stat-label">Serviços Realizados</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">R$ ${totalSpent.toFixed(2)}</div>
                        <div class="stat-label">Total Gasto</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">R$ ${orders.length > 0 ? (totalSpent / orders.length).toFixed(2) : '0.00'}</div>
                        <div class="stat-label">Ticket Médio</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${this.getLastServiceDate(orders)}</div>
                        <div class="stat-label">Último Serviço</div>
                    </div>
                </div>
            </div>
            
            <div class="orders-section">
                <h4><i class="fas fa-clipboard-list"></i> Histórico de Serviços (${orders.length})</h4>
                ${orders.length > 0 ? 
                    `<div class="orders-list">${ordersHtml}</div>` : 
                    `<div class="empty-state small">
                        <i class="fas fa-clipboard"></i>
                        <p>Nenhum serviço registrado para este cliente</p>
                    </div>`
                }
            </div>
            
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="CustomersModule.openCustomerModal('${customerId}')">
                    <i class="fas fa-edit"></i> Editar Cliente
                </button>
                <button class="btn btn-outline" onclick="CustomersModule.exportCustomerHistory('${customerId}')">
                    <i class="fas fa-download"></i> Exportar Histórico
                </button>
            </div>
        `;
        
        modal.style.display = 'flex';
    },

    // Fecha modal de histórico
    closeHistoryModal() {
        document.getElementById('history-modal').style.display = 'none';
    },

    // Gerenciamento de tags
    initTags() {
        this.loadTags([]);
    },

    loadTags(tags) {
        const container = document.getElementById('tags-container');
        container.innerHTML = tags.map(tag => `
            <span class="tag tag-${tag}">
                ${this.getTagLabel(tag)}
                <span class="tag-remove" data-tag="${tag}">&times;</span>
            </span>
        `).join('');
    },

    addTag(tag) {
        if (!tag) return;
        const tagsContainer = document.getElementById('tags-container');
        
        // Verifica se tag já existe
        if (document.querySelector(`.tag[data-value="${tag}"]`)) return;
        
        const tagElement = document.createElement('span');
        tagElement.className = `tag tag-${tag}`;
        tagElement.dataset.value = tag;
        tagElement.innerHTML = `
            ${this.getTagLabel(tag)}
            <span class="tag-remove" data-tag="${tag}">&times;</span>
        `;
        
        tagsContainer.appendChild(tagElement);
        
        // Reseta o select
        document.getElementById('tag-select').value = '';
    },

    removeTag(tag) {
        const tagElement = document.querySelector(`.tag[data-value="${tag}"]`);
        if (tagElement) {
            tagElement.remove();
        }
    },

    // Funções auxiliares
    getCustomerStatus(customer) {
        // Lógica para determinar status do cliente
        const orders = Orders_DB.findByCustomerId(customer.id);
        if (orders.length >= 10) return 'vip';
        if (orders.length >= 3) return 'active';
        return 'new';
    },

    getTotalSpent(customer) {
        const orders = Orders_DB.findByCustomerId(customer.id);
        return orders.reduce((sum, order) => sum + (parseFloat(order.value) || 0), 0);
    },

    getTagLabel(tag) {
        const labels = {
            'vip': 'VIP',
            'frequent': 'Frequente',
            'corporate': 'Empresarial',
            'indicator': 'Indicador',
            'complain': 'Reclamante'
        };
        return labels[tag] || tag;
    },

    getStatusLabel(status) {
        const labels = {
            'pending': 'Pendente',
            'in_progress': 'Em Andamento',
            'completed': 'Concluído',
            'cancelled': 'Cancelado'
        };
        return labels[status] || status;
    },

    getLastServiceDate(orders) {
        if (orders.length === 0) return '—';
        const lastOrder = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        return this.formatDate(lastOrder.createdAt);
    },

    formatDate(dateString) {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    },

    // Exporta histórico do cliente
    exportCustomerHistory(customerId) {
        const customer = Customers_DB.findById(customerId);
        const orders = Orders_DB.findByCustomerId(customerId);
        
        const data = {
            customer: customer,
            orders: orders,
            summary: {
                totalOrders: orders.length,
                totalSpent: orders.reduce((sum, order) => sum + (parseFloat(order.value) || 0), 0),
                exportDate: new Date().toISOString()
            }
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cliente_${customer.name.replace(/\s+/g, '_')}_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
};

// Inicializa o módulo quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    CustomersModule.init();
});