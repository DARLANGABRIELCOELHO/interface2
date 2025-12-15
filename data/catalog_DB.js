// data/catalog_DB.js

// Inicializa com dados padrão se estiver vazio
const defaultCatalog = {
    models: [
        "IPHONE 6", "IPHONE 7", "IPHONE 7 PLUS", "IPHONE 8", "IPHONE 8 PLUS",
        "IPHONE X", "IPHONE XR", "IPHONE 11", "IPHONE 12", "IPHONE 13", 
        "IPHONE 13 PRO MAX", "IPHONE 14", "IPHONE 15 PRO MAX"
    ],
    services: [
        "TROCA DE TELA", "TROCA DE BATERIA", "VIDRO TRASEIRO", "FACE ID", "CONECTOR DE CARGA"
    ],
    // Exemplo reduzido para economizar espaço, a lógica carregará isso
    prices: {
        "IPHONE 11": {
            "TROCA DE TELA": { parcelado: 330.00, avista: 306.90 },
            "TROCA DE BATERIA": { parcelado: 250.00, avista: 232.50 }
        },
        "IPHONE 13": {
            "TROCA DE TELA": { parcelado: 1000.00, avista: 930.00 },
            "TROCA DE BATERIA": { parcelado: 350.00, avista: 325.50 }
        }
    }
};

class CatalogDatabase extends ConnectionDB {
    constructor() {
        super('CATALOG');
        // Se estiver vazio (primeira vez), popula com os dados padrão
        if (this.findAll().length === 0) {
            this.save([defaultCatalog]); 
        }
    }

    getData() {
        return this.findAll()[0]; // Retorna o objeto único de catálogo
    }

    updateData(newData) {
        // Sobrescreve o objeto de catálogo (índice 0)
        this.save([newData]);
    }
}

const Catalog_DB = new CatalogDatabase();