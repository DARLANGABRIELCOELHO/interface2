// data/Customers_DB.js

class CustomersDatabase extends ConnectionDB {
    constructor() {
        super('CUSTOMERS');
    }

    // Busca cliente por nome ou CPF/Telefone (Simula LIKE do SQL)
    search(query) {
        const all = this.findAll();
        if (!query) return all;
        query = query.toLowerCase();
        return all.filter(c => 
            c.name.toLowerCase().includes(query) || 
            c.phone.includes(query)
        );
    }
}

const Customers_DB = new CustomersDatabase();