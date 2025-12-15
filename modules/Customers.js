// modules/Customers.js

const CustomersModule = {
    init() {
        this.cacheElements();
        // Renderiza apenas se estiver na view ativa ou para pré-carregar
        console.log('✅ CustomersModule inicializado');
    },

    cacheElements() {
        this.container = document.getElementById('customers-view');
    },

    render() {
        if (!this.container) this.cacheElements();
        if (!this.container) return;

        const customers = window.Customers_DB ? window.Customers_DB.findAll().reverse() : [];

        const tableRows = customers.length > 0 
            ? customers.map(customer => this.createCustomerRow(customer)).join('')
            : '<tr><td colspan="4" class="text-center">Nenhum cliente cadastrado.</td></tr>';

        this.container.innerHTML = `
            <div class="section-header">
                <h1>Clientes (CRM)</h1>
                <button class="btn btn-primary" onclick="CustomersModule.showCustomerModal()">
                    + Novo Cliente
                </button>
            </div>

            <div class="card">
                <table class="customers-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Telefone/WhatsApp</th>
                            <th>Email</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>

            ${this.createCustomerModal()}
        `;
    },

    createCustomerRow(customer) {
        return `
            <tr>
                <td><strong>${customer.name}</strong></td>
                <td>${customer.phone}</td>
                <td>${customer.email || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="CustomersModule.deleteCustomer('${customer.id}')">
                        Excluir
                    </button>
                </td>
            </tr>
        `;
    },

    createCustomerModal() {
        return `
            <div id="modal-customer" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Novo Cliente</h2>
                        <span class="close-modal" onclick="CustomersModule.hideCustomerModal()">&times;</span>
                    </div>
                    <form onsubmit="CustomersModule.handleSubmit(event)" id="customer-form">
                        <div class="form-group">
                            <label>Nome Completo *</label>
                            <input type="text" name="name" required placeholder="Ex: João Silva" maxlength="100">
                        </div>
                        <div class="form-group">
                            <label>Telefone / WhatsApp *</label>
                            <input type="tel" name="phone" required placeholder="(11) 99999-9999">
                        </div>
                        <div class="form-group">
                            <label>Email (Opcional)</label>
                            <input type="email" name="email" placeholder="cliente@email.com" maxlength="100">
                        </div>
                        <div class="form-group">
                            <label>Endereço (Opcional)</label>
                            <textarea name="address" rows="2" maxlength="200"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">
                            Salvar Cliente
                        </button>
                    </form>
                </div>
            </div>
        `;
    },

    showCustomerModal() {
        const modal = document.getElementById('modal-customer');
        if(modal) {
            modal.style.display = 'flex';
            const form = document.getElementById('customer-form');
            if(form) form.reset();
        }
    },

    hideCustomerModal() {
        const modal = document.getElementById('modal-customer');
        if(modal) modal.style.display = 'none';
    },

    handleSubmit(event) {
        event.preventDefault();
        const form = event.target;
        
        const customerData = {
            name: form.name.value.trim(),
            phone: form.phone.value.trim(),
            email: form.email.value.trim() || null,
            address: form.address.value.trim() || null
        };

        if (window.Customers_DB) {
            window.Customers_DB.create(customerData);
            this.hideCustomerModal();
            this.render();
            
            // Atualizar dashboard se disponível
            if (window.DashboardModule && typeof window.DashboardModule.refreshData === 'function') {
                window.DashboardModule.refreshData();
            }
            
            this.showNotification('Cliente salvo com sucesso!', 'success');
        } else {
            this.showNotification('Erro: Banco de dados não disponível', 'error');
        }
    },

    deleteCustomer(id) {
        if (confirm('Tem certeza que deseja excluir este cliente?\n\nObservação: As ordens de serviço relacionadas não serão removidas.')) {
            if (window.Customers_DB) {
                window.Customers_DB.delete(id);
                this.render();
                this.showNotification('Cliente excluído!', 'info');
            }
        }
    },

    showNotification(message, type = 'info') {
        if (window.App && typeof window.App.showNotification === 'function') {
            window.App.showNotification(message, type);
        } else {
            alert(message);
        }
    }
};

// Estilos CSS
const customerStyles = `
    <style>
        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            flex-wrap: wrap;
            gap: 16px;
        }
        
        .customers-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .customers-table th {
            background: var(--bg-hover);
            padding: 12px;
            text-align: left;
            font-weight: 600;
            border-bottom: 1px solid var(--border);
            color: var(--text-secondary);
        }
        
        .customers-table td {
            padding: 12px;
            border-bottom: 1px solid var(--border-light);
        }
        
        .customers-table tr:hover {
            background: var(--bg-hover);
        }
        
        .btn-block {
            width: 100%;
            display: block;
        }
    </style>
`;

document.head.insertAdjacentHTML('beforeend', customerStyles);

// Expor globalmente
if (typeof window !== 'undefined') {
    window.CustomersModule = CustomersModule;
}