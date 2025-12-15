// data/connection_DB.js

class ConnectionDB {
    constructor(tableName) {
        this.tableName = `IFIX_${tableName}`;
        // Inicializa o banco se não existir
        if (!localStorage.getItem(this.tableName)) {
            localStorage.setItem(this.tableName, JSON.stringify([]));
        }
    }

    // SELECT * FROM table
    findAll() {
        const data = localStorage.getItem(this.tableName);
        return data ? JSON.parse(data) : [];
    }

    // SELECT * FROM table WHERE id = ?
    findById(id) {
        const all = this.findAll();
        return all.find(item => item.id === id);
    }

    // INSERT INTO table
    create(data) {
        const all = this.findAll();
        // Gera um ID simples baseado em timestamp se não houver
        const newItem = { 
            id: Date.now().toString(), 
            created_at: new Date().toISOString(),
            ...data 
        };
        all.push(newItem);
        this.save(all);
        return newItem;
    }

    // UPDATE table SET ... WHERE id = ?
    update(id, newData) {
        let all = this.findAll();
        const index = all.findIndex(item => item.id === id);
        if (index !== -1) {
            all[index] = { ...all[index], ...newData, updated_at: new Date().toISOString() };
            this.save(all);
            return all[index];
        }
        return null;
    }

    // DELETE FROM table WHERE id = ?
    delete(id) {
        let all = this.findAll();
        const newAll = all.filter(item => item.id !== id);
        this.save(newAll);
    }

    // Commit changes
    save(data) {
        localStorage.setItem(this.tableName, JSON.stringify(data));
    }
}

// Expor globalmente
if (typeof window !== 'undefined') {
    window.ConnectionDB = ConnectionDB;
}