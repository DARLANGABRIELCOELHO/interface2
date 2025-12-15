// data/Orders_DB.js

class OrdersDatabase extends ConnectionDB {
    constructor() {
        super('ORDERS');
    }

    getStats() {
        const all = this.findAll();
        const pending = all.filter(o => o.status !== 'Concluído').length;
        const done = all.filter(o => o.status === 'Concluído').length;
        
        // Soma faturamento
        const revenue = all
            .filter(o => o.status === 'Concluído')
            .reduce((acc, curr) => acc + (parseFloat(curr.totalValue) || 0), 0);

        return { pending, done, revenue, total: all.length };
    }

    getByCustomer(customerId) {
        return this.findAll().filter(o => o.customerId === customerId);
    }
}

const Orders_DB = new OrdersDatabase();