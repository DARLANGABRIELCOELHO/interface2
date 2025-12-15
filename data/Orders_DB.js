// data/Orders_DB.js

class OrdersDatabase extends ConnectionDB {
    constructor() {
        super('ORDERS');
        this.initOrdersSchema();
        this.initDefaultOrders();
    }

    // Inicializa schema de ordens de serviço
    initOrdersSchema() {
        const meta = this.findById('orders_meta');
        const now = new Date().toISOString();
        
        const schema = {
            id: 'orders_meta',
            type: 'metadata',
            version: '2.0.0',
            tableName: 'ORDERS',
            fields: {
                required: ['orderNumber', 'customerId', 'service', 'status', 'deviceModel', 'createdAt'],
                optional: [
                    'customerName', 'customerPhone', 'deviceSerial', 'issueDescription',
                    'diagnosis', 'partsRequired', 'laborCost', 'partsCost', 'totalValue',
                    'estimatedTime', 'actualTime', 'technician', 'priority', 'warrantyDays',
                    'paymentMethod', 'paymentStatus', 'notes', 'checklist', 'photos',
                    'startedAt', 'completedAt', 'deliveredAt', 'updatedAt'
                ]
            },
            statuses: [
                'aberta', 'diagnostico', 'aguardando_pecas', 'em_execucao',
                'aguardando_aprovacao', 'concluida', 'entregue', 'cancelada'
            ],
            priorities: ['baixa', 'normal', 'alta', 'urgente'],
            paymentStatuses: ['pendente', 'parcial', 'pago', 'cancelado'],
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

    // Cria algumas ordens de serviço de exemplo
    initDefaultOrders() {
        const existingData = this.findAll();
        if (existingData.length > 0) return;

        const now = new Date().toISOString();
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
        const threeWeeksAgo = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString();

        const defaultOrders = [
            {
                id: 'order_001',
                orderNumber: 'OS-2023-001',
                customerId: 'cust_001',
                customerName: 'João Silva Santos',
                customerPhone: '(11) 99999-9999',
                deviceModel: 'IPHONE 13 PRO',
                deviceSerial: 'DN123456789',
                service: 'TROCA DE TELA',
                issueDescription: 'Tela quebrada após queda. Display não funciona.',
                diagnosis: 'Tela OLED danificada. Necessita substituição completa.',
                partsRequired: [
                    { name: 'Tela OLED Original', quantity: 1, cost: 850.00 }
                ],
                laborCost: 350.00,
                partsCost: 850.00,
                totalValue: 1200.00,
                estimatedTime: '3 horas',
                actualTime: '2.5 horas',
                technician: 'Carlos Santos',
                priority: 'alta',
                status: 'concluida',
                warrantyDays: 90,
                paymentMethod: 'cartao_credito',
                paymentStatus: 'pago',
                notes: 'Cliente solicitou película de proteção adicional.',
                checklist: {
                    recebimento: true,
                    backup: true,
                    diagnostico: true,
                    orcamento: true,
                    aprovacao: true,
                    reparo: true,
                    teste: true,
                    limpeza: true,
                    entrega: true
                },
                photos: [],
                startedAt: oneWeekAgo,
                completedAt: now,
                deliveredAt: now,
                createdAt: oneWeekAgo,
                updatedAt: now
            },
            {
                id: 'order_002',
                orderNumber: 'OS-2023-002',
                customerId: 'cust_002',
                customerName: 'Maria Oliveira Costa',
                customerPhone: '(21) 98888-8888',
                deviceModel: 'IPHONE 11',
                deviceSerial: 'DN987654321',
                service: 'TROCA DE BATERIA',
                issueDescription: 'Bateria não dura um dia. Desliga com 30% de carga.',
                diagnosis: 'Bateria com desgaste avançado (capacidade 65%).',
                partsRequired: [
                    { name: 'Bateria Original iPhone 11', quantity: 1, cost: 200.00 }
                ],
                laborCost: 80.00,
                partsCost: 200.00,
                totalValue: 280.00,
                estimatedTime: '1.5 horas',
                actualTime: '1 hora',
                technician: 'Ana Lima',
                priority: 'normal',
                status: 'entregue',
                warrantyDays: 180,
                paymentMethod: 'pix',
                paymentStatus: 'pago',
                notes: 'Cliente satisfeito com o serviço.',
                checklist: {
                    recebimento: true,
                    backup: true,
                    diagnostico: true,
                    orcamento: true,
                    aprovacao: true,
                    reparo: true,
                    teste: true,
                    limpeza: true,
                    entrega: true
                },
                photos: [],
                startedAt: twoWeeksAgo,
                completedAt: twoWeeksAgo,
                deliveredAt: twoWeeksAgo,
                createdAt: twoWeeksAgo,
                updatedAt: twoWeeksAgo
            },
            {
                id: 'order_003',
                orderNumber: 'OS-2023-003',
                customerId: 'cust_003',
                customerName: 'Carlos Eduardo Pereira',
                customerPhone: '(31) 97777-7777',
                deviceModel: 'IPHONE 14 PRO MAX',
                deviceSerial: 'DN456789123',
                service: 'VIDRO TRASEIRO',
                issueDescription: 'Vidro traseiro quebrado. Sem danos na câmera.',
                diagnosis: 'Vidro traseiro danificado. Câmera e componentes internos intactos.',
                partsRequired: [
                    { name: 'Vidro Traseiro Original', quantity: 1, cost: 450.00 },
                    { name: 'Adesivo Vidro Traseiro', quantity: 1, cost: 50.00 }
                ],
                laborCost: 300.00,
                partsCost: 500.00,
                totalValue: 800.00,
                estimatedTime: '4 horas',
                actualTime: null,
                technician: 'Pedro Oliveira',
                priority: 'normal',
                status: 'em_execucao',
                warrantyDays: 90,
                paymentMethod: null,
                paymentStatus: 'pendente',
                notes: 'Aguardando chegada do vidro traseiro.',
                checklist: {
                    recebimento: true,
                    backup: true,
                    diagnostico: true,
                    orcamento: true,
                    aprovacao: true,
                    reparo: false,
                    teste: false,
                    limpeza: false,
                    entrega: false
                },
                photos: [],
                startedAt: now,
                completedAt: null,
                deliveredAt: null,
                createdAt: now,
                updatedAt: now
            },
            {
                id: 'order_004',
                orderNumber: 'OS-2023-004',
                customerId: 'cust_004',
                customerName: 'Ana Paula Rodrigues',
                customerPhone: '(41) 96666-6666',
                deviceModel: 'IPHONE XR',
                deviceSerial: 'DN789123456',
                service: 'CONECTOR DE CARGA',
                issueDescription: 'Não carrega. Conector solto.',
                diagnosis: 'Conector Lightning danificado. Necessita substituição.',
                partsRequired: [
                    { name: 'Conector Lightning Original', quantity: 1, cost: 120.00 }
                ],
                laborCost: 100.00,
                partsCost: 120.00,
                totalValue: 220.00,
                estimatedTime: '2 horas',
                actualTime: null,
                technician: null,
                priority: 'baixa',
                status: 'aguardando_pecas',
                warrantyDays: 90,
                paymentMethod: null,
                paymentStatus: 'pendente',
                notes: 'Aguardando peça do fornecedor.',
                checklist: {
                    recebimento: true,
                    backup: false,
                    diagnostico: true,
                    orcamento: true,
                    aprovacao: true,
                    reparo: false,
                    teste: false,
                    limpeza: false,
                    entrega: false
                },
                photos: [],
                startedAt: null,
                completedAt: null,
                deliveredAt: null,
                createdAt: threeWeeksAgo,
                updatedAt: threeWeeksAgo
            },
            {
                id: 'order_005',
                orderNumber: 'OS-2023-005',
                customerId: 'cust_005',
                customerName: 'Roberto Almeida',
                customerPhone: '(51) 95555-5555',
                deviceModel: 'IPHONE 12',
                deviceSerial: 'DN321654987',
                service: 'FACE ID',
                issueDescription: 'Face ID não funciona após queda.',
                diagnosis: 'Sensores Face ID danificados. Necessita substituição do módulo.',
                partsRequired: [
                    { name: 'Módulo Face ID Original', quantity: 1, cost: 550.00 }
                ],
                laborCost: 250.00,
                partsCost: 550.00,
                totalValue: 800.00,
                estimatedTime: '5 horas',
                actualTime: null,
                technician: null,
                priority: 'normal',
                status: 'diagnostico',
                warrantyDays: null,
                paymentMethod: null,
                paymentStatus: 'pendente',
                notes: 'Cliente precisa aprovar orçamento.',
                checklist: {
                    recebimento: true,
                    backup: false,
                    diagnostico: false,
                    orcamento: false,
                    aprovacao: false,
                    reparo: false,
                    teste: false,
                    limpeza: false,
                    entrega: false
                },
                photos: [],
                startedAt: null,
                completedAt: null,
                deliveredAt: null,
                createdAt: threeWeeksAgo,
                updatedAt: threeWeeksAgo
            }
        ];

        defaultOrders.forEach(order => {
            this.create(order);
        });

        console.log(`${defaultOrders.length} ordens de serviço de exemplo criadas`);
    }

    // GERAÇÃO DE NÚMERO DE ORDEM
    generateOrderNumber() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        
        // Busca última ordem do mês
        const allOrders = this.findAll();
        const currentMonthOrders = allOrders.filter(order => {
            if (!order.createdAt) return false;
            const orderDate = new Date(order.createdAt);
            return orderDate.getFullYear() === year && 
                   orderDate.getMonth() + 1 === parseInt(month);
        });
        
        const nextNumber = currentMonthOrders.length + 1;
        return `OS-${year}-${month}-${String(nextNumber).padStart(3, '0')}`;
    }

    // MÉTODOS CRUD ESPECÍFICOS

    // Cria uma nova ordem de serviço
    createOrder(orderData) {
        // Valida dados obrigatórios
        if (!orderData.customerId || !orderData.service || !orderData.deviceModel) {
            throw new Error('Cliente, serviço e modelo do dispositivo são obrigatórios');
        }

        // Gera número da ordem
        const orderNumber = orderData.orderNumber || this.generateOrderNumber();
        const now = new Date().toISOString();

        // Dados padrão
        const newOrder = {
            id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            orderNumber: orderNumber,
            customerId: orderData.customerId,
            customerName: orderData.customerName || '',
            customerPhone: orderData.customerPhone || '',
            deviceModel: orderData.deviceModel,
            deviceSerial: orderData.deviceSerial || '',
            service: orderData.service,
            issueDescription: orderData.issueDescription || '',
            diagnosis: orderData.diagnosis || '',
            partsRequired: orderData.partsRequired || [],
            laborCost: parseFloat(orderData.laborCost) || 0,
            partsCost: parseFloat(orderData.partsCost) || 0,
            totalValue: parseFloat(orderData.totalValue) || 0,
            estimatedTime: orderData.estimatedTime || '',
            actualTime: orderData.actualTime || null,
            technician: orderData.technician || '',
            priority: orderData.priority || 'normal',
            status: orderData.status || 'aberta',
            warrantyDays: parseInt(orderData.warrantyDays) || 90,
            paymentMethod: orderData.paymentMethod || null,
            paymentStatus: orderData.paymentStatus || 'pendente',
            notes: orderData.notes || '',
            checklist: orderData.checklist || {
                recebimento: false,
                backup: false,
                diagnostico: false,
                orcamento: false,
                aprovacao: false,
                reparo: false,
                teste: false,
                limpeza: false,
                entrega: false
            },
            photos: orderData.photos || [],
            startedAt: orderData.startedAt || null,
            completedAt: orderData.completedAt || null,
            deliveredAt: orderData.deliveredAt || null,
            createdAt: now,
            updatedAt: now,
            _version: 1
        };

        // Calcula total se não fornecido
        if (!orderData.totalValue) {
            newOrder.totalValue = newOrder.laborCost + newOrder.partsCost;
        }

        // Insere no banco
        const result = this.create(newOrder);
        
        // Atualiza estatísticas
        this.updateStats();
        
        console.log(`Ordem criada: ${orderNumber} - ${newOrder.deviceModel} (${newOrder.service})`);
        return result;
    }

    // Atualiza ordem existente
    updateOrder(id, orderData) {
        const existingOrder = this.findById(id);
        if (!existingOrder) {
            throw new Error(`Ordem com ID ${id} não encontrada`);
        }

        // Calcula total se peças ou mão de obra foram alterados
        let totalValue = existingOrder.totalValue;
        if (orderData.laborCost !== undefined || orderData.partsCost !== undefined) {
            const laborCost = orderData.laborCost !== undefined ? 
                parseFloat(orderData.laborCost) : existingOrder.laborCost;
            const partsCost = orderData.partsCost !== undefined ? 
                parseFloat(orderData.partsCost) : existingOrder.partsCost;
            totalValue = laborCost + partsCost;
        }

        // Atualiza dados
        const updatedData = {
            ...existingOrder,
            ...orderData,
            id: existingOrder.id, // Garante que ID não mude
            totalValue: orderData.totalValue !== undefined ? 
                parseFloat(orderData.totalValue) : totalValue,
            updatedAt: new Date().toISOString(),
            _version: (existingOrder._version || 1) + 1
        };

        // Remove campos undefined
        Object.keys(updatedData).forEach(key => {
            if (updatedData[key] === undefined) {
                delete updatedData[key];
            }
        });

        // Valida transições de status
        this.validateStatusTransition(existingOrder.status, updatedData.status);

        const result = this.update(id, updatedData);
        
        // Atualiza cliente se status for concluído
        if (updatedData.status === 'concluida' && existingOrder.status !== 'concluida') {
            this.updateCustomerAfterCompletion(id, updatedData);
        }
        
        console.log(`Ordem atualizada: ${updatedData.orderNumber} - v${updatedData._version}`);
        return result;
    }

    // Valida transição de status
    validateStatusTransition(oldStatus, newStatus) {
        const validTransitions = {
            'aberta': ['diagnostico', 'cancelada'],
            'diagnostico': ['aguardando_pecas', 'aguardando_aprovacao', 'cancelada'],
            'aguardando_pecas': ['em_execucao', 'cancelada'],
            'aguardando_aprovacao': ['em_execucao', 'cancelada'],
            'em_execucao': ['concluida', 'cancelada'],
            'concluida': ['entregue'],
            'entregue': [], // Não pode mudar depois de entregue
            'cancelada': [] // Não pode mudar depois de cancelada
        };

        if (oldStatus !== newStatus) {
            if (!validTransitions[oldStatus]?.includes(newStatus)) {
                throw new Error(`Transição de status inválida: ${oldStatus} -> ${newStatus}`);
            }
        }
    }

    // Atualiza cliente após conclusão da ordem
    updateCustomerAfterCompletion(orderId, orderData) {
        try {
            if (typeof Customers_DB !== 'undefined' && Customers_DB.updateCustomerStats) {
                Customers_DB.updateCustomerStats(
                    orderData.customerId, 
                    orderData.totalValue || 0
                );
                console.log(`Cliente ${orderData.customerId} atualizado após conclusão da ordem`);
            }
        } catch (error) {
            console.error('Erro ao atualizar cliente:', error);
        }
    }

    // Busca avançada de ordens
    searchOrders(searchTerm, options = {}) {
        const {
            status = 'all',
            priority = 'all',
            paymentStatus = 'all',
            technician = 'all',
            customerId = null,
            startDate = null,
            endDate = null,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            limit = 100,
            offset = 0
        } = options;

        let orders = this.findAll();

        // Filtro por status
        if (status !== 'all') {
            orders = orders.filter(o => o.status === status);
        }

        // Filtro por prioridade
        if (priority !== 'all') {
            orders = orders.filter(o => o.priority === priority);
        }

        // Filtro por status de pagamento
        if (paymentStatus !== 'all') {
            orders = orders.filter(o => o.paymentStatus === paymentStatus);
        }

        // Filtro por técnico
        if (technician !== 'all' && technician !== null) {
            orders = orders.filter(o => o.technician === technician);
        }

        // Filtro por cliente
        if (customerId) {
            orders = orders.filter(o => o.customerId === customerId);
        }

        // Filtro por data
        if (startDate) {
            const start = new Date(startDate);
            orders = orders.filter(o => {
                const orderDate = new Date(o.createdAt);
                return orderDate >= start;
            });
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            orders = orders.filter(o => {
                const orderDate = new Date(o.createdAt);
                return orderDate <= end;
            });
        }

        // Busca por termo
        if (searchTerm && searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase().trim();
            orders = orders.filter(order => {
                return Object.values(order).some(value => {
                    if (value === null || value === undefined) return false;
                    if (typeof value === 'object') {
                        return JSON.stringify(value).toLowerCase().includes(term);
                    }
                    return value.toString().toLowerCase().includes(term);
                });
            });
        }

        // Ordenação
        orders.sort((a, b) => {
            let aVal = a[sortBy] || '';
            let bVal = b[sortBy] || '';

            // Tratamento especial para datas
            if (sortBy.includes('At') || sortBy === 'createdAt' || sortBy === 'updatedAt') {
                aVal = aVal ? new Date(aVal).getTime() : 0;
                bVal = bVal ? new Date(bVal).getTime() : 0;
            }

            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            } else {
                return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
            }
        });

        // Paginação
        return orders.slice(offset, offset + limit);
    }

    // Obtém ordens por cliente
    getOrdersByCustomer(customerId, options = {}) {
        const {
            includeInactive = false,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            limit = 50
        } = options;

        let orders = this.findWhere({ customerId: customerId });

        if (!includeInactive) {
            orders = orders.filter(o => !['cancelada', 'entregue'].includes(o.status));
        }

        // Ordenação
        orders.sort((a, b) => {
            let aVal = a[sortBy] || '';
            let bVal = b[sortBy] || '';

            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            } else {
                return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
            }
        });

        return orders.slice(0, limit);
    }

    // Obtém ordens por status
    getOrdersByStatus(status, options = {}) {
        const {
            sortBy = 'createdAt',
            sortOrder = 'asc',
            limit = 100
        } = options;

        let orders = this.findWhere({ status: status });

        // Ordenação
        orders.sort((a, b) => {
            let aVal = a[sortBy] || '';
            let bVal = b[sortBy] || '';

            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            } else {
                return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
            }
        });

        return orders.slice(0, limit);
    }

    // Obtém ordens pendentes (não concluídas)
    getPendingOrders() {
        return this.findAll()
            .filter(o => !['concluida', 'entregue', 'cancelada'].includes(o.status))
            .sort((a, b) => {
                // Ordena por prioridade e depois por data
                const priorityOrder = { 'urgente': 0, 'alta': 1, 'normal': 2, 'baixa': 3 };
                const aPriority = priorityOrder[a.priority] || 3;
                const bPriority = priorityOrder[b.priority] || 3;
                
                if (aPriority !== bPriority) {
                    return aPriority - bPriority;
                }
                
                return new Date(a.createdAt) - new Date(b.createdAt);
            });
    }

    // Obtém ordens atrasadas
    getOverdueOrders() {
        const now = new Date();
        const orders = this.getPendingOrders();
        
        return orders.filter(order => {
            if (!order.estimatedTime || !order.startedAt) return false;
            
            // Calcula data estimada de conclusão
            const startedAt = new Date(order.startedAt);
            const hoursMatch = order.estimatedTime.match(/(\d+)/);
            if (!hoursMatch) return false;
            
            const estimatedHours = parseInt(hoursMatch[1]);
            const estimatedCompletion = new Date(startedAt.getTime() + estimatedHours * 60 * 60 * 1000);
            
            return estimatedCompletion < now;
        });
    }

    // Atualiza checklist da ordem
    updateChecklist(orderId, checklistItem, value) {
        const order = this.findById(orderId);
        if (!order) return null;

        const updatedChecklist = {
            ...order.checklist,
            [checklistItem]: value
        };

        // Se todos os itens estiverem completos, marca como concluída
        const allComplete = Object.values(updatedChecklist).every(item => item === true);
        let statusUpdate = {};
        
        if (allComplete && order.status !== 'concluida') {
            statusUpdate.status = 'concluida';
            statusUpdate.completedAt = new Date().toISOString();
        }

        return this.updateOrder(orderId, {
            checklist: updatedChecklist,
            ...statusUpdate
        });
    }

    // Adiciona item às peças necessárias
    addPartRequired(orderId, part) {
        const order = this.findById(orderId);
        if (!order) return null;

        const partsRequired = order.partsRequired || [];
        partsRequired.push({
            id: `part_${Date.now()}`,
            name: part.name,
            quantity: part.quantity || 1,
            cost: parseFloat(part.cost) || 0,
            notes: part.notes || ''
        });

        // Recalcula custo das peças
        const partsCost = partsRequired.reduce((sum, part) => sum + (part.cost * part.quantity), 0);

        return this.updateOrder(orderId, {
            partsRequired: partsRequired,
            partsCost: partsCost,
            totalValue: order.laborCost + partsCost
        });
    }

    // Remove item das peças necessárias
    removePartRequired(orderId, partId) {
        const order = this.findById(orderId);
        if (!order) return null;

        const partsRequired = order.partsRequired.filter(part => part.id !== partId);
        
        // Recalcula custo das peças
        const partsCost = partsRequired.reduce((sum, part) => sum + (part.cost * part.quantity), 0);

        return this.updateOrder(orderId, {
            partsRequired: partsRequired,
            partsCost: partsCost,
            totalValue: order.laborCost + partsCost
        });
    }

    // Atualiza status de pagamento
    updatePaymentStatus(orderId, paymentStatus, paymentMethod = null) {
        const updates = { paymentStatus: paymentStatus };
        
        if (paymentMethod) {
            updates.paymentMethod = paymentMethod;
        }

        return this.updateOrder(orderId, updates);
    }

    // Cancela ordem de serviço
    cancelOrder(orderId, reason = '') {
        const order = this.findById(orderId);
        if (!order) return null;

        return this.updateOrder(orderId, {
            status: 'cancelada',
            notes: order.notes + (reason ? `\n\nCancelada: ${reason}` : '\n\nCancelada sem motivo informado.')
        });
    }

    // ESTATÍSTICAS E RELATÓRIOS

    // Obtém estatísticas gerais
    getStats(options = {}) {
        const { startDate = null, endDate = null } = options;
        let orders = this.findAll();

        // Filtro por data se fornecido
        if (startDate) {
            const start = new Date(startDate);
            orders = orders.filter(o => new Date(o.createdAt) >= start);
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            orders = orders.filter(o => new Date(o.createdAt) <= end);
        }

        // Contagem por status
        const byStatus = {};
        const statuses = this.findById('orders_meta')?.statuses || [];
        statuses.forEach(status => {
            byStatus[status] = orders.filter(o => o.status === status).length;
        });

        // Contagem por prioridade
        const byPriority = {};
        const priorities = this.findById('orders_meta')?.priorities || [];
        priorities.forEach(priority => {
            byPriority[priority] = orders.filter(o => o.priority === priority).length;
        });

        // Faturamento
        const completedOrders = orders.filter(o => o.status === 'concluida');
        const deliveredOrders = orders.filter(o => o.status === 'entregue');
        
        const revenue = completedOrders.reduce((sum, o) => sum + (o.totalValue || 0), 0);
        const deliveredRevenue = deliveredOrders.reduce((sum, o) => sum + (o.totalValue || 0), 0);
        
        // Peças e mão de obra
        const partsRevenue = completedOrders.reduce((sum, o) => sum + (o.partsCost || 0), 0);
        const laborRevenue = completedOrders.reduce((sum, o) => sum + (o.laborCost || 0), 0);

        // Tempo médio
        const times = completedOrders
            .filter(o => o.startedAt && o.completedAt)
            .map(o => {
                const start = new Date(o.startedAt);
                const end = new Date(o.completedAt);
                return (end - start) / (1000 * 60 * 60); // horas
            });
        
        const avgTime = times.length > 0 ? 
            times.reduce((sum, time) => sum + time, 0) / times.length : 0;

        return {
            total: orders.length,
            byStatus: byStatus,
            byPriority: byPriority,
            pending: orders.filter(o => !['concluida', 'entregue', 'cancelada'].includes(o.status)).length,
            completed: completedOrders.length,
            delivered: deliveredOrders.length,
            cancelled: orders.filter(o => o.status === 'cancelada').length,
            revenue: revenue,
            deliveredRevenue: deliveredRevenue,
            pendingRevenue: orders
                .filter(o => !['concluida', 'entregue', 'cancelada'].includes(o.status))
                .reduce((sum, o) => sum + (o.totalValue || 0), 0),
            partsRevenue: partsRevenue,
            laborRevenue: laborRevenue,
            avgOrderValue: completedOrders.length > 0 ? revenue / completedOrders.length : 0,
            avgTime: avgTime,
            paymentStatus: {
                pendente: orders.filter(o => o.paymentStatus === 'pendente').length,
                parcial: orders.filter(o => o.paymentStatus === 'parcial').length,
                pago: orders.filter(o => o.paymentStatus === 'pago').length
            }
        };
    }

    // Obtém estatísticas mensais
    getMonthlyStats(year = null) {
        const targetYear = year || new Date().getFullYear();
        const orders = this.findAll().filter(order => {
            if (!order.createdAt) return false;
            const orderYear = new Date(order.createdAt).getFullYear();
            return orderYear === targetYear;
        });

        const months = Array.from({ length: 12 }, (_, i) => i + 1);
        const stats = {};

        months.forEach(month => {
            const monthOrders = orders.filter(order => {
                const orderMonth = new Date(order.createdAt).getMonth() + 1;
                return orderMonth === month;
            });

            const completedOrders = monthOrders.filter(o => o.status === 'concluida');
            const revenue = completedOrders.reduce((sum, o) => sum + (o.totalValue || 0), 0);

            stats[month] = {
                total: monthOrders.length,
                completed: completedOrders.length,
                revenue: revenue,
                avgValue: completedOrders.length > 0 ? revenue / completedOrders.length : 0
            };
        });

        return stats;
    }

    // Obtém top serviços
    getTopServices(limit = 10) {
        const orders = this.findAll();
        const serviceCount = {};

        orders.forEach(order => {
            const service = order.service;
            serviceCount[service] = (serviceCount[service] || 0) + 1;
        });

        return Object.entries(serviceCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .map(([service, count]) => ({ service, count }));
    }

    // Obtém top modelos
    getTopModels(limit = 10) {
        const orders = this.findAll();
        const modelCount = {};

        orders.forEach(order => {
            const model = order.deviceModel;
            modelCount[model] = (modelCount[model] || 0) + 1;
        });

        return Object.entries(modelCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .map(([model, count]) => ({ model, count }));
    }

    // Obtém performance dos técnicos
    getTechnicianPerformance() {
        const orders = this.findAll();
        const technicians = {};

        orders.forEach(order => {
            if (!order.technician) return;
            
            if (!technicians[order.technician]) {
                technicians[order.technician] = {
                    total: 0,
                    completed: 0,
                    revenue: 0,
                    avgTime: []
                };
            }

            technicians[order.technician].total++;
            
            if (order.status === 'concluida') {
                technicians[order.technician].completed++;
                technicians[order.technician].revenue += order.totalValue || 0;
                
                if (order.startedAt && order.completedAt) {
                    const start = new Date(order.startedAt);
                    const end = new Date(order.completedAt);
                    const hours = (end - start) / (1000 * 60 * 60);
                    technicians[order.technician].avgTime.push(hours);
                }
            }
        });

        // Calcula médias
        Object.keys(technicians).forEach(tech => {
            const data = technicians[tech];
            data.completionRate = data.total > 0 ? (data.completed / data.total) * 100 : 0;
            data.avgRevenue = data.completed > 0 ? data.revenue / data.completed : 0;
            data.avgTime = data.avgTime.length > 0 ? 
                data.avgTime.reduce((sum, time) => sum + time, 0) / data.avgTime.length : 0;
            delete data.avgTime; // Remove array temporário
        });

        return technicians;
    }

    // Atualiza estatísticas no banco
    updateStats() {
        const stats = this.getStats();
        const meta = this.findById('orders_stats');
        const now = new Date().toISOString();

        const statsData = {
            id: 'orders_stats',
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

    // EXPORTAÇÃO

    // Exporta ordens para CSV
    exportToCSV(orders = null, includeDetails = false) {
        const data = orders || this.findAll();
        if (data.length === 0) return '';
        
        // Define cabeçalhos
        const headers = [
            'Número OS', 'Cliente', 'Telefone', 'Modelo', 'Serial',
            'Serviço', 'Status', 'Prioridade', 'Técnico', 'Valor Total',
            'Custo Mão de Obra', 'Custo Peças', 'Data Abertura',
            'Data Início', 'Data Conclusão', 'Data Entrega', 'Status Pagamento'
        ];

        if (includeDetails) {
            headers.push('Problema', 'Diagnóstico', 'Peças Necessárias', 'Observações');
        }
        
        // Converte dados
        const rows = data.map(order => {
            const baseRow = [
                order.orderNumber,
                `"${order.customerName || ''}"`,
                order.customerPhone || '',
                order.deviceModel || '',
                order.deviceSerial || '',
                order.service || '',
                order.status || '',
                order.priority || '',
                order.technician || '',
                order.totalValue || 0,
                order.laborCost || 0,
                order.partsCost || 0,
                order.createdAt ? new Date(order.createdAt).toLocaleDateString('pt-BR') : '',
                order.startedAt ? new Date(order.startedAt).toLocaleDateString('pt-BR') : '',
                order.completedAt ? new Date(order.completedAt).toLocaleDateString('pt-BR') : '',
                order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString('pt-BR') : '',
                order.paymentStatus || ''
            ];

            if (includeDetails) {
                const parts = order.partsRequired?.map(p => 
                    `${p.name} (${p.quantity}x)`
                ).join('; ') || '';
                
                baseRow.push(
                    `"${order.issueDescription || ''}"`,
                    `"${order.diagnosis || ''}"`,
                    `"${parts}"`,
                    `"${order.notes || ''}"`
                );
            }

            return baseRow.join(',');
        });
        
        return [headers.join(','), ...rows].join('\n');
    }

    // Exporta relatório de faturamento
    exportRevenueReport(startDate, endDate) {
        const stats = this.getStats({ startDate, endDate });
        const orders = this.searchOrders('', { startDate, endDate, status: 'concluida' });

        const report = {
            periodo: {
                inicio: startDate,
                fim: endDate
            },
            resumo: {
                totalOrdens: stats.total,
                ordensConcluidas: stats.completed,
                faturamentoTotal: stats.revenue,
                faturamentoMedio: stats.avgOrderValue,
                custoPeças: stats.partsRevenue,
                custoMaoDeObra: stats.laborRevenue
            },
            ordens: orders.map(order => ({
                numero: order.orderNumber,
                cliente: order.customerName,
                servico: order.service,
                modelo: order.deviceModel,
                valor: order.totalValue,
                dataConclusao: order.completedAt,
                statusPagamento: order.paymentStatus
            })),
            topServicos: this.getTopServices(5),
            topModelos: this.getTopModels(5)
        };

        return JSON.stringify(report, null, 2);
    }
}

// Cria instância global
const Orders_DB = new OrdersDatabase();

// Expõe globalmente se estiver no navegador
if (typeof window !== 'undefined') {
    window.Orders_DB = Orders_DB;
}

// Exporta para módulos (se suportado)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Orders_DB;
}