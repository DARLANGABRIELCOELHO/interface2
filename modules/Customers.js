// modules/Customers.js

// Verifica dependências
if (typeof Customers_DB === 'undefined') {
    console.error('Customers_DB não carregado! Certifique-se de que data/Customers_DB.js foi carregado antes.');
}

// Registra o módulo no ModuleManager
const CustomersModule = {
    name: 'Customers',
    
    init() {
        console.log('Inicializando módulo Customers...');
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        // Event listeners específicos do módulo
        document.addEventListener('customer:added', () => this.refresh());
        document.addEventListener('customer:updated', () => this.refresh());
        document.addEventListener('customer:deleted', () => this.refresh());
    },
    
    render() {
        const container = document.getElementById('customers-view');
        if (!container) {
            console.error('Container de clientes não encontrado');
            return;
        }
        
        try {
            // Verifica se Customers_DB está disponível
            if (typeof Customers_DB === 'undefined') {
                throw new Error('Banco de dados de clientes não disponível');
            }
            
            const customers = Customers_DB.findAll();
            
            let html = `
                <div class="module-header">
                    <h1><i class="fas fa-users"></i> Clientes (CRM)</h1>
                    <div class="subtitle">${customers.length} clientes cadastrados</div>
                </div>
            `;
            
            if (customers.length === 0) {
                html += `
                    <div class="empty-state">
                        <i class="fas fa-user-slash"></i>
                        <h3>Nenhum cliente cadastrado</h3>
                        <p>Cadastre seu primeiro cliente para começar</p>
                        <button class="btn btn-primary" onclick="CustomersModule.openCustomerModal(null)">
                            <i class="fas fa-plus"></i> Adicionar Cliente
                        </button>
                    </div>
                `;
            } else {
                html += `
                    <div class="toolbar">
                        <div class="search-box">
                            <i class="fas fa-search"></i>
                            <input type="text" id="customer-search" placeholder="Buscar clientes...">
                        </div>
                        <button class="btn btn-primary" onclick="CustomersModule.openCustomerModal(null)">
                            <i class="fas fa-plus"></i> Novo Cliente
                        </button>
                    </div>
                    
                    <div class="card table-card">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Telefone</th>
                                    <th>Email</th>
                                    <th>Total Gasto</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${customers.map(customer => `
                                    <tr>
                                        <td>
                                            <div class="customer-info">
                                                <div class="avatar">
                                                    ${customer.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <strong>${customer.name}</strong>
                                                    ${customer.tags ? `
                                                        <div class="customer-tags">
                                                            ${customer.tags.map(tag => 
                                                                `<span class="tag tag-${tag}">${tag}</span>`
                                                            ).join('')}
                                                        </div>
                                                    ` : ''}
                                                </div>
                                            </div>
                                        </td>
                                        <td>${customer.phone}</td>
                                        <td>${customer.email || '<span class="text-muted">—</span>'}</td>
                                        <td>R$ ${(customer.totalSpent || 0).toFixed(2)}</td>
                                        <td>
                                            <div class="action-buttons">
                                                <button class="btn-icon btn-sm" onclick="CustomersModule.openCustomerModal('${customer.id}')">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button class="btn-icon btn-sm btn-danger" onclick="CustomersModule.deleteCustomer('${customer.id}')">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }
            
            container.innerHTML = html;
            
            // Configura busca
            const searchInput = document.getElementById('customer-search');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.handleSearch(e.target.value);
                });
            }
            
        } catch (error) {
            console.error('Erro ao renderizar módulo Customers:', error);
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h2>Erro ao carregar clientes</h2>
                    <p>${error.message}</p>
                    <button class="btn btn-primary" onclick="CustomersModule.render()">
                        Tentar novamente
                    </button>
                </div>
            `;
        }
    },
    
    handleSearch(term) {
        if (!term.trim()) {
            this.render();
            return;
        }
        
        const container = document.getElementById('customers-view');
        const searchTerm = term.toLowerCase();
        
        // Filtra clientes localmente
        const customers = Customers_DB.findAll();
        const filtered = customers.filter(customer => 
            customer.name.toLowerCase().includes(searchTerm) ||
            customer.phone.includes(searchTerm) ||
            (customer.email && customer.email.toLowerCase().includes(searchTerm))
        );
        
        if (filtered.length === 0) {
            container.querySelector('tbody').innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        Nenhum cliente encontrado para "${term}"
                    </td>
                </tr>
            `;
        } else {
            container.querySelector('tbody').innerHTML = filtered.map(customer => `
                <tr>
                    <td>
                        <div class="customer-info">
                            <div class="avatar">
                                ${customer.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <strong>${customer.name}</strong>
                            </div>
                        </div>
                    </td>
                    <td>${customer.phone}</td>
                    <td>${customer.email || '<span class="text-muted">—</span>'}</td>
                    <td>R$ ${(customer.totalSpent || 0).toFixed(2)}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon btn-sm" onclick="CustomersModule.openCustomerModal('${customer.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon btn-sm btn-danger" onclick="CustomersModule.deleteCustomer('${customer.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
    },
    
    openCustomerModal(customerId) {
        // Implementação do modal (como na versão anterior)
        console.log('Abrir modal para cliente:', customerId);
        // ... restante do código do modal
    },
    
    deleteCustomer(id) {
        if (confirm('Tem certeza que deseja excluir este cliente?')) {
            try {
                Customers_DB.deleteCustomer(id);
                this.refresh();
                
                // Dispara evento para atualizar dashboard
                document.dispatchEvent(new CustomEvent('data:updated'));
                
                console.log('Cliente excluído:', id);
            } catch (error) {
                console.error('Erro ao excluir cliente:', error);
                alert('Erro ao excluir cliente: ' + error.message);
            }
        }
    },
    
    refresh() {
        this.render();
    }
};

// Registra o módulo automaticamente quando o arquivo é carregado
if (typeof ModuleManager !== 'undefined') {
    ModuleManager.register('Customers', CustomersModule);
} else {
    console.error('ModuleManager não encontrado! CustomersModule não registrado.');
    // Fallback: expõe globalmente
    window.CustomersModule = CustomersModule;
}

// Adiciona estilos específicos do módulo
const customersStyles = document.createElement('style');
customersStyles.textContent = `
    .customer-info {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #4a6fa5;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
    }
    
    .customer-tags {
        display: flex;
        gap: 5px;
        margin-top: 5px;
    }
    
    .tag {
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        background: #e9ecef;
        color: #495057;
    }
    
    .tag-vip {
        background: #ffd700;
        color: #856404;
    }
    
    .tag-frequent {
        background: #20c997;
        color: white;
    }
    
    .action-buttons {
        display: flex;
        gap: 5px;
    }
    
    .btn-icon {
        background: none;
        border: none;
        color: #6c757d;
        cursor: pointer;
        padding: 5px;
    }
    
    .btn-icon:hover {
        color: #495057;
    }
    
    .btn-danger {
        color: #dc3545;
    }
    
    .btn-danger:hover {
        color: #bd2130;
    }
`;

document.head.appendChild(customersStyles);

// Exporta para módulos (se suportado)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CustomersModule;
}
