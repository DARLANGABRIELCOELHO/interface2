// modules/Customers.js

const CustomersModule = {
    render() {
        const container = document.getElementById('customers-view');
        const customers = Customers_DB.findAll().reverse(); // Mais recentes primeiro

        const tableRows = customers.length > 0 
            ? customers.map(customer => this.createCustomerRow(customer)).join('')
            : '<tr><td colspan="4" class="text-center">Nenhum cliente cadastrado.</td></tr>';

        container.innerHTML = `
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
        document.getElementById('modal-customer').style.display = 'flex';
        document.getElementById('customer-form').reset();
    },

    hideCustomerModal() {
        document.getElementById('modal-customer').style.display = 'none';
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

        Customers_DB.create(customerData);
        this.hideCustomerModal();
        this.render();
        DashboardModule.render(); // Atualiza contadores do dashboard
        
        // Feedback visual opcional
        this.showNotification('Cliente salvo com sucesso!', 'success');
    },

    deleteCustomer(id) {
        if (confirm('Tem certeza que deseja excluir este cliente?\n\nObservação: As ordens de serviço relacionadas não serão removidas.')) {
            Customers_DB.delete(id);
            this.render();
            this.showNotification('Cliente excluído!', 'info');
        }
    },

    showNotification(message, type = 'info') {
        // Implementação básica de notificação - pode ser aprimorada
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
            color: white;
            border-radius: 4px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// Estilos CSS adicionais recomendados
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
            background: #f5f5f5;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #e0e0e0;
        }
        
        .customers-table td {
            padding: 12px;
            border-bottom: 1px solid #eee;
        }
        
        .customers-table tr:hover {
            background: #f9f9f9;
        }
        
        .text-center {
            text-align: center;
        }
        
        .btn-sm {
            padding: 6px 12px;
            font-size: 13px;
        }
        
        .btn-danger {
            background: #f44336;
            color: white;
            border: none;
        }
        
        .btn-danger:hover {
            background: #d32f2f;
        }
        
        .btn-block {
            width: 100%;
            display: block;
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    </style>
`;

// Adiciona estilos ao documento
document.head.insertAdjacentHTML('beforeend', customerStyles);