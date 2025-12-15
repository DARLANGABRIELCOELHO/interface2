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
        console.log('✅ CustomersModule inicializado');
        this.cacheElements();
        // A renderização real acontece quando o app navega para este módulo
    },

    cacheElements() {
        this.container = document.getElementById('customers-view');
    },

    // Renderiza a interface completa
    render() {
        if (!this.container) this.cacheElements();
        if (!this.container) return;

        const customers = this.getFilteredCustomers();

        this.container.innerHTML = `
            <!-- Cabeçalho com título e botões de ação -->
            <div class="module-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div class="header-left">
                    <h1><i class="fas fa-users"></i> Clientes (CRM)</h1>
                    <div class="subtitle" style="color: var(--text-secondary);">${customers.length} clientes cadastrados</div>
                </div>
                <div class="header-actions" style="display: flex; gap: 10px;">
                    <button class="btn btn-primary" onclick="CustomersModule.openCustomerModal(null)">
                        <i class="fas fa-plus"></i> Novo Cliente
                    </button>
                </div>
            </div>

            <!-- Barra de ferramentas (busca) -->
            <div class="card" style="padding: 15px; margin-bottom: 20px;">
                <div class="form-group" style="margin-bottom: 0;">
                    <input type="text" 
                           class="form-control"
                           placeholder="Buscar clientes por nome, telefone ou email..." 
                           value="${this.searchTerm}"
                           onkeyup="CustomersModule.handleSearch(event)">
                </div>
            </div>

            <!-- Tabela de Clientes -->
            <div class="card">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Telefone</th>
                            <th>Email</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.renderTableRows(customers)}
                    </tbody>
                </table>
            </div>

            ${this.getModalTemplate()}
        `;
    },

    renderTableRows(customers) {
        if (customers.length === 0) {
            return `<tr><td colspan="4" class="text-center" style="padding: 20px;">Nenhum cliente encontrado.</td></tr>`;
        }

        return customers.map(customer => `
            <tr>
                <td><strong>${customer.name}</strong></td>
                <td>${customer.phone}</td>
                <td>${customer.email || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="CustomersModule.openCustomerModal('${customer.id}')">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="CustomersModule.deleteCustomer('${customer.id}')">Excluir</button>
                </td>
            </tr>
        `).join('');
    },

    getModalTemplate() {
        return `
            <div id="customer-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="modal-title" class="modal-title">Novo Cliente</h2>
                        <button class="modal-close" onclick="CustomersModule.closeCustomerModal()">&times;</button>
                    </div>
                    <form id="customer-form" onsubmit="CustomersModule.handleSubmit(event)">
                        <div class="modal-body">
                            <input type="hidden" name="id">
                            <div class="form-group">
                                <label class="form-label">Nome Completo *</label>
                                <input type="text" name="name" class="form-control" required placeholder="Ex: João Silva">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Telefone *</label>
                                <input type="tel" name="phone" class="form-control" required placeholder="(11) 99999-9999">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Email</label>
                                <input type="email" name="email" class="form-control" placeholder="email@exemplo.com">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Endereço</label>
                                <textarea name="address" class="form-control" rows="2"></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" onclick="CustomersModule.closeCustomerModal()">Cancelar</button>
                            <button type="submit" class="btn btn-primary">Salvar</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    },

    handleSearch(event) {
        this.searchTerm = event.target.value.toLowerCase();
        this.render();
    },

    getFilteredCustomers() {
        let customers = window.Customers_DB ? window.Customers_DB.findAll() : [];
        if (this.searchTerm) {
            customers = customers.filter(c => 
                (c.name && c.name.toLowerCase().includes(this.searchTerm)) ||
                (c.phone && c.phone.includes(this.searchTerm)) ||
                (c.email && c.email.toLowerCase().includes(this.searchTerm))
            );
        }
        // Ordenar: mais recentes primeiro
        return customers.reverse();
    },

    openCustomerModal(customerId) {
        const modal = document.getElementById('customer-modal');
        const form = document.getElementById('customer-form');
        const title = document.getElementById('modal-title');
        
        if (customerId) {
            const customer = window.Customers_DB.findById(customerId);
            title.textContent = 'Editar Cliente';
            form.elements.id.value = customer.id;
            form.elements.name.value = customer.name;
            form.elements.phone.value = customer.phone;
            form.elements.email.value = customer.email || '';
            form.elements.address.value = customer.address || '';
        } else {
            title.textContent = 'Novo Cliente';
            form.reset();
            form.elements.id.value = '';
        }
        
        modal.style.display = 'flex';
        modal.classList.add('active');
    },

    closeCustomerModal() {
        const modal = document.getElementById('customer-modal');
        modal.style.display = 'none';
        modal.classList.remove('active');
    },

    handleSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const data = {
            id: form.elements.id.value,
            name: form.elements.name.value,
            phone: form.elements.phone.value,
            email: form.elements.email.value,
            address: form.elements.address.value
        };

        if (data.id) {
            window.Customers_DB.update(data.id, data);
        } else {
            delete data.id; // Deixar o DB gerar o ID
            window.Customers_DB.create(data);
        }
        
        this.closeCustomerModal();
        this.render();
        
        // Atualiza dashboard se possível
        if (window.DashboardModule && typeof window.DashboardModule.refreshData === 'function') {
            window.DashboardModule.refreshData();
        }
    },

    deleteCustomer(id) {
        if (confirm('Tem certeza que deseja excluir este cliente?')) {
            window.Customers_DB.delete(id);
            this.render();
        }
    }
};

// Exportar globalmente
if (typeof window !== 'undefined') {
    window.CustomersModule = CustomersModule;
}
