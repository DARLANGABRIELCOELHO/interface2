// data/catalog_DB.js

class CatalogDatabase extends ConnectionDB {
    constructor() {
        super('CATALOG');
        this.initCatalog();
    }

    // Inicializa o catálogo com dados padrão
    initCatalog() {
        try {
            // Verifica se o catálogo já foi inicializado
            const existingData = this.findAll();
            if (existingData.length === 0) {
                console.log('Inicializando catálogo com dados padrão...');
                this.populateDefaultCatalog();
            } else {
                console.log(`Catálogo já inicializado com ${existingData.length} itens`);
                
                // Atualiza estrutura se necessário
                this.upgradeCatalogStructure();
            }
        } catch (error) {
            console.error('Erro ao inicializar catálogo:', error);
            this.createCleanCatalog();
        }
    }

    // Popula o catálogo com dados padrão (dos arquivos de dados)
    populateDefaultCatalog() {
        const now = new Date().toISOString();
        
        // Dados base de modelos
        const models = [
            { id: 'model_iphone6', name: 'IPHONE 6', category: 'iPhone', generation: 6, year: 2014, active: true, createdAt: now },
            { id: 'model_iphone6_plus', name: 'IPHONE 6 PLUS', category: 'iPhone', generation: 6, year: 2014, active: true, createdAt: now },
            { id: 'model_iphone6s', name: 'IPHONE 6S', category: 'iPhone', generation: 6, year: 2015, active: true, createdAt: now },
            { id: 'model_iphone6s_plus', name: 'IPHONE 6S PLUS', category: 'iPhone', generation: 6, year: 2015, active: true, createdAt: now },
            { id: 'model_iphone_se1', name: 'IPHONE SE 1', category: 'iPhone SE', generation: 1, year: 2016, active: true, createdAt: now },
            { id: 'model_iphone7', name: 'IPHONE 7', category: 'iPhone', generation: 7, year: 2016, active: true, createdAt: now },
            { id: 'model_iphone7_plus', name: 'IPHONE 7 PLUS', category: 'iPhone', generation: 7, year: 2016, active: true, createdAt: now },
            { id: 'model_iphone8', name: 'IPHONE 8', category: 'iPhone', generation: 8, year: 2017, active: true, createdAt: now },
            { id: 'model_iphone8_plus', name: 'IPHONE 8 PLUS', category: 'iPhone', generation: 8, year: 2017, active: true, createdAt: now },
            { id: 'model_iphone_se2', name: 'IPHONE SE 2', category: 'iPhone SE', generation: 2, year: 2020, active: true, createdAt: now },
            { id: 'model_iphone_x', name: 'IPHONE X', category: 'iPhone', generation: 10, year: 2017, active: true, createdAt: now },
            { id: 'model_iphone_xs', name: 'IPHONE XS', category: 'iPhone', generation: 10, year: 2018, active: true, createdAt: now },
            { id: 'model_iphone_xs_max', name: 'IPHONE XS MAX', category: 'iPhone', generation: 10, year: 2018, active: true, createdAt: now },
            { id: 'model_iphone_xr', name: 'IPHONE XR', category: 'iPhone', generation: 10, year: 2018, active: true, createdAt: now },
            { id: 'model_iphone11', name: 'IPHONE 11', category: 'iPhone', generation: 11, year: 2019, active: true, createdAt: now },
            { id: 'model_iphone11_pro', name: 'IPHONE 11 PRO', category: 'iPhone', generation: 11, year: 2019, active: true, createdAt: now },
            { id: 'model_iphone11_pro_max', name: 'IPHONE 11 PRO MAX', category: 'iPhone', generation: 11, year: 2019, active: true, createdAt: now },
            { id: 'model_iphone_se2020', name: 'IPHONE SE 2020', category: 'iPhone SE', generation: 3, year: 2020, active: true, createdAt: now },
            { id: 'model_iphone12', name: 'IPHONE 12', category: 'iPhone', generation: 12, year: 2020, active: true, createdAt: now },
            { id: 'model_iphone12_mini', name: 'IPHONE 12 MINI', category: 'iPhone', generation: 12, year: 2020, active: true, createdAt: now },
            { id: 'model_iphone12_pro', name: 'IPHONE 12 PRO', category: 'iPhone', generation: 12, year: 2020, active: true, createdAt: now },
            { id: 'model_iphone12_pro_max', name: 'IPHONE 12 PRO MAX', category: 'iPhone', generation: 12, year: 2020, active: true, createdAt: now },
            { id: 'model_iphone13', name: 'IPHONE 13', category: 'iPhone', generation: 13, year: 2021, active: true, createdAt: now },
            { id: 'model_iphone13_mini', name: 'IPHONE 13 MINI', category: 'iPhone', generation: 13, year: 2021, active: true, createdAt: now },
            { id: 'model_iphone13_pro', name: 'IPHONE 13 PRO', category: 'iPhone', generation: 13, year: 2021, active: true, createdAt: now },
            { id: 'model_iphone13_pro_max', name: 'IPHONE 13 PRO MAX', category: 'iPhone', generation: 13, year: 2021, active: true, createdAt: now },
            { id: 'model_iphone_se2022', name: 'IPHONE SE 2022', category: 'iPhone SE', generation: 4, year: 2022, active: true, createdAt: now },
            { id: 'model_iphone14', name: 'IPHONE 14', category: 'iPhone', generation: 14, year: 2022, active: true, createdAt: now },
            { id: 'model_iphone14_plus', name: 'IPHONE 14 PLUS', category: 'iPhone', generation: 14, year: 2022, active: true, createdAt: now },
            { id: 'model_iphone14_pro', name: 'IPHONE 14 PRO', category: 'iPhone', generation: 14, year: 2022, active: true, createdAt: now },
            { id: 'model_iphone14_pro_max', name: 'IPHONE 14 PRO MAX', category: 'iPhone', generation: 14, year: 2022, active: true, createdAt: now },
            { id: 'model_iphone15', name: 'IPHONE 15', category: 'iPhone', generation: 15, year: 2023, active: true, createdAt: now },
            { id: 'model_iphone15_plus', name: 'IPHONE 15 PLUS', category: 'iPhone', generation: 15, year: 2023, active: true, createdAt: now },
            { id: 'model_iphone15_pro', name: 'IPHONE 15 PRO', category: 'iPhone', generation: 15, year: 2023, active: true, createdAt: now },
            { id: 'model_iphone15_pro_max', name: 'IPHONE 15 PRO MAX', category: 'iPhone', generation: 15, year: 2023, active: true, createdAt: now }
        ];

        // Dados base de serviços
        const services = [
            { id: 'service_tela', name: 'TROCA DE TELA', category: 'Display', description: 'Troca completa da tela LCD/OLED', estimatedTime: '2-3 horas', difficulty: 'Média-Alta', createdAt: now },
            { id: 'service_bateria', name: 'TROCA DE BATERIA', category: 'Bateria', description: 'Substituição da bateria original', estimatedTime: '1-2 horas', difficulty: 'Média', createdAt: now },
            { id: 'service_vidro', name: 'VIDRO TRASEIRO', category: 'Estrutura', description: 'Troca do vidro traseiro', estimatedTime: '3-4 horas', difficulty: 'Alta', createdAt: now },
            { id: 'service_faceid', name: 'FACE ID', category: 'Biometria', description: 'Reparo do sistema Face ID', estimatedTime: '4-5 horas', difficulty: 'Alta', createdAt: now },
            { id: 'service_conector', name: 'CONECTOR DE CARGA', category: 'Hardware', description: 'Troca do conector de carga (Lightning/USB-C)', estimatedTime: '1-2 horas', difficulty: 'Média', createdAt: now }
        ];

        // Dados base de preços (extraídos do data_bank.js)
        const prices = this.generateDefaultPrices();

        // Dados de categorias
        const categories = [
            { id: 'cat_display', name: 'Display', description: 'Serviços relacionados a telas', icon: 'fa-display', color: '#4CAF50', createdAt: now },
            { id: 'cat_battery', name: 'Bateria', description: 'Serviços relacionados a bateria', icon: 'fa-battery-full', color: '#FF9800', createdAt: now },
            { id: 'cat_structure', name: 'Estrutura', description: 'Serviços relacionados à carcaça', icon: 'fa-mobile-alt', color: '#2196F3', createdAt: now },
            { id: 'cat_biometrics', name: 'Biometria', description: 'Serviços de biometria (Face ID/Touch ID)', icon: 'fa-fingerprint', color: '#9C27B0', createdAt: now },
            { id: 'cat_hardware', name: 'Hardware', description: 'Serviços de hardware interno', icon: 'fa-microchip', color: '#F44336', createdAt: now },
            { id: 'cat_software', name: 'Software', description: 'Serviços de software e sistema', icon: 'fa-code', color: '#607D8B', createdAt: now }
        ];

        // Insere todos os dados
        this.createMany(models);
        this.createMany(services);
        this.createMany(prices);
        this.createMany(categories);

        // Cria metadados do catálogo
        const catalogMeta = {
            id: 'catalog_meta',
            type: 'metadata',
            version: '2.0.0',
            lastUpdate: now,
            modelsCount: models.length,
            servicesCount: services.length,
            pricesCount: prices.length,
            categoriesCount: categories.length,
            createdAt: now,
            updatedAt: now
        };

        this.create(catalogMeta);

        console.log(`Catálogo populado com ${models.length} modelos, ${services.length} serviços e ${prices.length} preços`);
    }

    // Gera preços padrão baseados nos dados do data_bank.js
    generateDefaultPrices() {
        const now = new Date().toISOString();
        const prices = [];

        // Mapeamento de modelos para IDs (para referência)
        const modelMapping = {
            'IPHONE 6': 'model_iphone6',
            'IPHONE 6 PLUS': 'model_iphone6_plus',
            'IPHONE 6S': 'model_iphone6s',
            'IPHONE 6S PLUS': 'model_iphone6s_plus',
            'IPHONE SE 1': 'model_iphone_se1',
            'IPHONE 7': 'model_iphone7',
            'IPHONE 7 PLUS': 'model_iphone7_plus',
            'IPHONE 8': 'model_iphone8',
            'IPHONE 8 PLUS': 'model_iphone8_plus',
            'IPHONE SE 2': 'model_iphone_se2',
            'IPHONE X': 'model_iphone_x',
            'IPHONE XS': 'model_iphone_xs',
            'IPHONE XS MAX': 'model_iphone_xs_max',
            'IPHONE XR': 'model_iphone_xr',
            'IPHONE 11': 'model_iphone11',
            'IPHONE 11 PRO': 'model_iphone11_pro',
            'IPHONE 11 PRO MAX': 'model_iphone11_pro_max',
            'IPHONE SE 2020': 'model_iphone_se2020',
            'IPHONE 12': 'model_iphone12',
            'IPHONE 12 MINI': 'model_iphone12_mini',
            'IPHONE 12 PRO': 'model_iphone12_pro',
            'IPHONE 12 PRO MAX': 'model_iphone12_pro_max',
            'IPHONE 13': 'model_iphone13',
            'IPHONE 13 MINI': 'model_iphone13_mini',
            'IPHONE 13 PRO': 'model_iphone13_pro',
            'IPHONE 13 PRO MAX': 'model_iphone13_pro_max',
            'IPHONE SE 2022': 'model_iphone_se2022',
            'IPHONE 14': 'model_iphone14',
            'IPHONE 14 PLUS': 'model_iphone14_plus',
            'IPHONE 14 PRO': 'model_iphone14_pro',
            'IPHONE 14 PRO MAX': 'model_iphone14_pro_max',
            'IPHONE 15': 'model_iphone15',
            'IPHONE 15 PLUS': 'model_iphone15_plus',
            'IPHONE 15 PRO': 'model_iphone15_pro',
            'IPHONE 15 PRO MAX': 'model_iphone15_pro_max'
        };

        // Mapeamento de serviços para IDs
        const serviceMapping = {
            'TROCA DE TELA': 'service_tela',
            'TROCA DE BATERIA': 'service_bateria',
            'VIDRO TRASEIRO': 'service_vidro',
            'FACE ID': 'service_faceid',
            'CONECTOR DE CARGA': 'service_conector'
        };

        // Dados de preços (extraídos do data_bank.js)
        const priceData = {
            'IPHONE 6': { 'TROCA DE TELA': { parcelado: 'R$ 220,00', avista: 'R$ 204,60' }, 'TROCA DE BATERIA': { parcelado: 'R$ 150,00', avista: 'R$ 139,50' }, 'VIDRO TRASEIRO': { parcelado: 'R$ 150,00', avista: 'R$ 139,50' }, 'FACE ID': { parcelado: 'N/A', avista: 'N/A' }, 'CONECTOR DE CARGA': { parcelado: 'R$ 150,00', avista: 'R$ 139,50' } },
            'IPHONE 6 PLUS': { 'TROCA DE TELA': { parcelado: 'R$ 230,00', avista: 'R$ 213,90' }, 'TROCA DE BATERIA': { parcelado: 'R$ 180,00', avista: 'R$ 167,40' }, 'VIDRO TRASEIRO': { parcelado: 'R$ 160,00', avista: 'R$ 148,80' }, 'FACE ID': { parcelado: 'N/A', avista: 'N/A' }, 'CONECTOR DE CARGA': { parcelado: 'R$ 150,00', avista: 'R$ 139,50' } },
            'IPHONE 6S': { 'TROCA DE TELA': { parcelado: 'R$ 220,00', avista: 'R$ 204,60' }, 'TROCA DE BATERIA': { parcelado: 'R$ 150,00', avista: 'R$ 139,50' }, 'VIDRO TRASEIRO': { parcelado: 'R$ 150,00', avista: 'R$ 139,50' }, 'FACE ID': { parcelado: 'N/A', avista: 'N/A' }, 'CONECTOR DE CARGA': { parcelado: 'R$ 150,00', avista: 'R$ 139,50' } },
            'IPHONE 6S PLUS': { 'TROCA DE TELA': { parcelado: 'R$ 230,00', avista: 'R$ 213,90' }, 'TROCA DE BATERIA': { parcelado: 'R$ 180,00', avista: 'R$ 167,40' }, 'VIDRO TRASEIRO': { parcelado: 'R$ 160,00', avista: 'R$ 148,80' }, 'FACE ID': { parcelado: 'N/A', avista: 'N/A' }, 'CONECTOR DE CARGA': { parcelado: 'R$ 150,00', avista: 'R$ 139,50' } },
            'IPHONE SE 1': { 'TROCA DE TELA': { parcelado: 'R$ 220,00', avista: 'R$ 204,60' }, 'TROCA DE BATERIA': { parcelado: 'R$ 150,00', avista: 'R$ 139,50' }, 'VIDRO TRASEIRO': { parcelado: 'R$ 150,00', avista: 'R$ 139,50' }, 'FACE ID': { parcelado: 'N/A', avista: 'N/A' }, 'CONECTOR DE CARGA': { parcelado: 'R$ 150,00', avista: 'R$ 139,50' } },
            'IPHONE 7': { 'TROCA DE TELA': { parcelado: 'R$ 230,00', avista: 'R$ 213,90' }, 'TROCA DE BATERIA': { parcelado: 'R$ 180,00', avista: 'R$ 167,40' }, 'VIDRO TRASEIRO': { parcelado: 'R$ 150,00', avista: 'R$ 139,50' }, 'FACE ID': { parcelado: 'N/A', avista: 'N/A' }, 'CONECTOR DE CARGA': { parcelado: 'R$ 180,00', avista: 'R$ 167,40' } },
            'IPHONE 7 PLUS': { 'TROCA DE TELA': { parcelado: 'R$ 280,00', avista: 'R$ 260,40' }, 'TROCA DE BATERIA': { parcelado: 'R$ 200,00', avista: 'R$ 186,00' }, 'VIDRO TRASEIRO': { parcelado: 'R$ 160,00', avista: 'R$ 148,80' }, 'FACE ID': { parcelado: 'N/A', avista: 'N/A' }, 'CONECTOR DE CARGA': { parcelado: 'R$ 180,00', avista: 'R$ 167,40' } },
            'IPHONE 8': { 'TROCA DE TELA': { parcelado: 'R$ 230,00', avista: 'R$ 213,90' }, 'TROCA DE BATERIA': { parcelado: 'R$ 200,00', avista: 'R$ 186,00' }, 'VIDRO TRASEIRO': { parcelado: 'R$ 250,00', avista: 'R$ 232,50' }, 'FACE ID': { parcelado: 'N/A', avista: 'N/A' }, 'CONECTOR DE CARGA': { parcelado: 'R$ 180,00', avista: 'R$ 167,40' } },
            'IPHONE 8 PLUS': { 'TROCA DE TELA': { parcelado: 'R$ 280,00', avista: 'R$ 260,40' }, 'TROCA DE BATERIA': { parcelado: 'R$ 230,00', avista: 'R$ 213,90' }, 'VIDRO TRASEIRO': { parcelado: 'R$ 280,00', avista: 'R$ 260,40' }, 'FACE ID': { parcelado: 'N/A', avista: 'N/A' }, 'CONECTOR DE CARGA': { parcelado: 'R$ 200,00', avista: 'R$ 186,00' } },
            'IPHONE SE 2': { 'TROCA DE TELA': { parcelado: 'R$ 230,00', avista: 'R$ 213,90' }, 'TROCA DE BATERIA': { parcelado: 'R$ 200,00', avista: 'R$ 186,00' }, 'VIDRO TRASEIRO': { parcelado: 'R$ 280,00', avista: 'R$ 260,40' }, 'FACE ID': { parcelado: 'R$ 250,00', avista: 'R$ 232,50' }, 'CONECTOR DE CARGA': { parcelado: 'R$ 180,00', avista: 'R$ 167,40' } },
            'IPHONE X': { 'TROCA DE TELA': { parcelado: 'R$ 480,00', avista: 'R$ 446,40' }, 'TROCA DE BATERIA': { parcelado: 'R$ 230,00', avista: 'R$ 213,90' }, 'VIDRO TRASEIRO': { parcelado: 'R$ 300,00', avista: 'R$ 279,00' }, 'FACE ID': { parcelado: 'R$ 450,00', avista: 'R$ 430,00' }, 'CONECTOR DE CARGA': { parcelado: 'R$ 220,00', avista: 'R$ 204,60' } },
            'IPHONE XS': { 'TROCA DE TELA': { parcelado: 'R$ 450,00', avista: 'R$ 418,50' }, 'TROCA DE BATERIA': { parcelado: 'R$ 230,00', avista: 'R$ 213,90' }, 'VIDRO TRASEIRO': { parcelado: 'R$ 300,00', avista: 'R$ 279,00' }, 'FACE ID': { parcelado: 'R$ 450,00', avista: 'R$ 430,00' }, 'CONECTOR DE CARGA': { parcelado: 'R$ 220,00', avista: 'R$ 204,60' } },
            'IPHONE XS MAX': { 'TROCA DE TELA': { parcelado: 'R$ 600,00', avista: 'R$ 558,00' }, 'TROCA DE BATERIA': { parcelado: 'R$ 300,00', avista: 'R$ 279,00' }, 'VIDRO TRASEIRO': { parcelado: 'R$ 380,00', avista: 'R$ 353,40' }, 'FACE ID': { parcelado: 'R$ 450,00', avista: 'R$ 430,00' }, 'CONECTOR DE CARGA': { parcelado: 'R$ 220,00', avista: 'R$ 204,60' } },
            'IPHONE XR': { 'TROCA DE TELA': { parcelado: 'R$ 380,00', avista: 'R$ 353,40' }, 'TROCA DE BATERIA': { parcelado: 'R$ 250,00', avista: 'R$ 232,50' }, 'VIDRO TRASEIRO': { parcelado: 'R$ 300,00', avista: 'R$ 279,00' }, 'FACE ID': { parcelado: 'R$ 450,00', avista: 'R$ 430,00' }, 'CONECTOR DE CARGA': { parcelado: 'R$ 220,00', avista: 'R$ 204,60' } },
            'IPHONE 11': { 'TROCA DE TELA': { parcelado: 'R$ 330,00', avista: 'R$ 306,90' }, 'TROCA DE BATERIA': { parcelado: 'R$ 250,00', avista: 'R$ 232,50' }, 'VIDRO TRASEIRO': { parcelado: 'R$ 350,00', avista: 'R$ 325,50' }, 'FACE ID': { parcelado: 'R$ 480,00', avista: 'R$ 450,00' }, 'CONECTOR DE CARGA': { parcelado: 'R$ 220,00', avista: 'R$ 204,60' } },
            'IPHONE 11 PRO': { 'TROCA DE TELA': { parcelado: 'R$ 550,00', avista: 'R$ 511,50' }, 'TROCA DE BATERIA': { parcelado: 'R$ 280,00', avista: 'R$ 260,40' }, 'VIDRO TRASEIRO': { parcelado: 'R$ 380,00', avista: 'R$ 353,40' }, 'FACE ID': { parcelado: 'R$ 480,00', avista: 'R$ 450,00' }, 'CONECTOR DE CARGA': { parcelado: 'R$ 280,00', avista: 'R$ 260,40' } },
            'IPHONE 11 PRO MAX': { 'TROCA DE TELA': { parcelado: 'R$ 600,00', avista: 'R$ 558,00' }, 'TROCA DE BATERIA': { parcelado: 'R$ 300,00', avista: 'R$ 279,00' }, 'VIDRO TRASEIRO': { parcelado: 'R$ 400,00', avista: 'R$ 372,00' }, 'FACE ID': { parcelado: 'R$ 480,00', avista: 'R$ 450,00' }, 'CONECTOR DE CARGA': { parcelado: 'R$ 300,00', avista: 'R$ 279,00' } },
            'IPHONE SE 2020': { 'TROCA DE TELA': { parcelado: 'R$ 230,00', avista: 'R$ 213,90' }, 'TROCA DE BATERIA': { parcelado: 'R$ 200,00', avista: 'R$ 186,00' }, 'VIDRO TRASEIRO': { parcelado: 'R$ 280,00', avista: 'R$ 260,40' }, 'FACE ID': { parcelado: 'R$ 250,00', avista: 'R$ 232,50' }, 'CONECTOR DE CARGA': { parcelado: 'R$ 180,00', avista: 'R$ 167,40' } },
            'IPHONE 12': { 'TROCA DE TELA': { parcelado: 'R$ 900,00', avista: 'R$ 837,00' }, 'TROCA DE BATERIA': { parcelado: 'R$ 350,00', avista: 'R$ 325,50' }, 'VIDRO TRASEIRO': { parcelado: 'R$ 450,00', avista: 'R$ 418,50' }, 'FACE ID': { parcelado: 'R$ 550,00', avista: 'R$ 530,00' }, 'CONECTOR DE CARGA': { parcelado: 'R$ 250,00', avista: 'R$ 232,50' } },
            'IPHONE 12 MINI': { 'TROCA DE TELA': { parcelado: 'R$ 800,00', avista: 'R$ 744,00' }, 'TROCA DE BATERIA': { parcelado: 'R$ 320,00', avista: 'R$ 297,60' }, 'VIDRO TRASEIRO': { parcelado: 'R$ 420,00', avista: 'R$ 390,60' }, 'FACE ID': { parcelado: 'R$ 520,00', avista: 'R$ 500,00' }, 'CONECTOR DE CARGA': { parcelado: 'R$ 240,00', avista: 'R$ 223,20' } },
            'IPHONE 12 PRO': { 'TROCA DE TELA': { parcelado: 'R$ 900,00', avista: 'R$ 837,00' }, 'TROCA DE BATERIA': { parcelado: 'R$ 350,00', avista: 'R$ 325,50' }, 'VIDRO TRASEIRO': { parcelado: 'R$ 450,00', avista: 'R$ 418,50' }, 'FACE ID': { parcelado: 'R$ 550,00', avista: 'R$ 530,00' }, 'CONECTOR DE CARGA': { parcelado: 'R$ 250,00', avista: 'R$ 232,50' } },
            'IPHONE 12 PRO MAX': { 'TROCA DE TELA': { parcelado: 'R$ 1.100,00', avista: 'R$ 1.023,00' }, 'TROCA DE BATERIA': { parcelado: 'R$ 380,00', avista: 'R$ 353,40' }, 'VIDRO TRASEIRO': { parcelado: 'R$ 580,00', avista: 'R$ 539,40' }, 'FACE ID': { parcelado: 'R$ 580,00', avista: 'R$ 550,00' }, 'CONECTOR DE CARGA': { parcelado: 'R$ 350,00', avista: 'R$ 325,50' } },
            'IPHONE 13': { 'TROCA DE TELA': { parcelado: 'R$ 1.000,00', avista: 'R$ 930,00' }, 'TROCA DE BATERIA': { parcelado: 'R$ 350,00', avista: 'R$ 325,50' }, 'VIDRO TRASEIRO': { parcelado: 'R$ 500,00', avista: 'R$ 465,00' }, 'FACE ID': { parcelado: 'R$ 700,00', avista: 'R$ 680,00' }, 'CONECTOR DE CARGA': { parcelado: 'R$ 300,00', avista: 'R$ 279,00' } },
            'IPHONE 13 MINI': { 'TROCA DE TELA': { parcelado: 'R$ 950,00', avista: 'R$ 883,50' }, 'TROCA DE BATERIA': { parcelado: 'R$ 340,00', avista: 'R$ 316,20' }, 'VIDRO TRASEIRO': { parcelado: 'R$ 480,00', avista: 'R$ 446,40' }, 'FACE ID': { parcelado: 'R$ 680,00', avista: 'R$ 660,00' }, 'CONECTOR DE CARGA': { parcelado: 'R$ 280,00', avista: 'R$ 260,40' } },
            'IPHONE 13 PRO': { 'TROCA DE TELA': { parcelado: 'R$ 1.200,00', avista: 'R$ 1.116,00' }, 'TROCA DE BATERIA': { parcelado: 'R$ 380,00', avista: 'R$ 353,40' }, 'VIDRO TRASEIRO': { parcelado: 'R$ 550,00', avista: 'R$ 511,50' }, 'FACE ID': { parcelado: 'R$ 750,00', avista: 'R$ 730,00' }, 'CONECTOR DE CARGA': { parcelado: 'R$ 300,00', avista: 'R$ 279,00' } },
            'IPHONE 13 PRO MAX': { 'TROCA DE TELA': { parcelado: 'R$ 1.400,00', avista: 'R$ 1.302,00' }, 'TROCA DE BATERIA': { parcelado: 'R$ 400,00', avista: 'R$ 372,00' }, 'VIDRO TRASEIRO': { parcelado: 'R$ 580,00', avista: 'R$ 539,40' }, 'FACE ID': { parcelado: 'R$ 750,00', avista: 'R$ 730,00' }, 'CONECTOR DE CARGA': { parcelado: 'R$ 350,00', avista: 'R$ 325,50' } },
            'IPHONE SE 2022': { 'TROCA DE TELA': { parcelado: 'R$ 250,00', avista: 'R$ 232,50' }, 'TROCA DE BATERIA': { parcelado: 'R$ 220,00', avista: 'R$ 204,60' }, 'VIDRO TRASEIRO': { parcelado: 'R$ 300,00', avista: 'R$ 279,00' }, 'FACE ID': { parcelado: 'R$ 280,00', avista: 'R$ 260,00' }, 'CONECTOR DE CARGA': { parcelado: 'R$ 200,00', avista: 'R$ 186,00' } },
            'IPHONE 14': { 'TROCA DE TELA': { parcelado: 'R$ 1.000,00', avista: 'R$ 930,00' }, 'TROCA DE BATERIA': { parcelado: 'R$ 380,00', avista: 'R$ 353,40' }, 'VIDRO TRASEIRO': { parcelado: 'R$ 580,00', avista: 'R$ 539,40' }, 'FACE ID': { parcelado: 'R$ 750,00', avista: 'R$ 730,00' }, 'CONECTOR DE CARGA': { parcelado: 'R$ 300,00', avista: 'R$ 279,00' } },
            'IPHONE 14 PLUS': { 'TROCA DE TELA': { parcelado: 'R$ 1.400,00', avista: 'R$ 1.302,00' }, 'TROCA DE BATERIA': { parcelado: 'R$ 400,00', avista: 'R$ 372,00' }, 'VIDRO TRASEIRO': { parcelado: 'R$ 580,00', avista: 'R$ 539,40' }, 'FACE ID': { parcelado: 'R$ 750,00', avista: 'R$ 730,00' }, 'CONECTOR DE CARGA': { parcelado: 'R$ 300,00', avista: 'R$ 279,00' } },
            'IPHONE 14 PRO': { 'TROCA DE TELA': { parcelado: 'R$ 1.200,00', avista: 'R$ 1.116,00' }, 'TROCA DE BATERIA': { parcelado: 'R$ 400,00', avista: 'R$ 372,00' }, 'VIDRO TRASEIRO': { parcelado: 'R$ 630,00', avista: 'R$ 585,90' }, 'FACE ID': { parcelado: 'R$ 850,00', avista: 'R$ 830,00' }, 'CONECTOR DE CARGA': { parcelado: 'R$ 300,00', avista: 'R$ 279,00' } },
            'IPHONE 14 PRO MAX': { 'TROCA DE TELA': { parcelado: 'R$ 2.200,00', avista: 'R$ 2.046,00' }, 'TROCA DE BATERIA': { parcelado: 'R$ 430,00', avista: 'R$ 399,90' }, 'VIDRO TRASEIRO': { parcelado: 'R$ 650,00', avista: 'R$ 604,50' }, 'FACE ID': { parcelado: 'R$ 850,00', avista: 'R$ 830,00' }, 'CONECTOR DE CARGA': { parcelado: 'R$ 350,00', avista: 'R$ 325,50' } },
            'IPHONE 15': { 'TROCA DE TELA': { parcelado: 'R$ 1.100,00', avista: 'R$ 1.023,00' }, 'TROCA DE BATERIA': { parcelado: 'R$ 400,00', avista: 'R$ 372,00' }, 'VIDRO TRASEIRO': { parcelado: 'R$ 600,00', avista: 'R$ 558,00' }, 'FACE ID': { parcelado: 'R$ 850,00', avista: 'R$ 830,00' }, 'CONECTOR DE CARGA': { parcelado: 'R$ 380,00', avista: 'R$ 353,40' } },
            'IPHONE 15 PLUS': { 'TROCA DE TELA': { parcelado: 'R$ 1.300,00', avista: 'R$ 1.209,00' }, 'TROCA DE BATERIA': { parcelado: 'R$ 420,00', avista: 'R$ 390,60' }, 'VIDRO TRASEIRO': { parcelado: 'R$ 620,00', avista: 'R$ 576,60' }, 'FACE ID': { parcelado: 'R$ 880,00', avista: 'R$ 860,00' }, 'CONECTOR DE CARGA': { parcelado: 'R$ 380,00', avista: 'R$ 353,40' } },
            'IPHONE 15 PRO': { 'TROCA DE TELA': { parcelado: 'R$ 1.300,00', avista: 'R$ 1.209,00' }, 'TROCA DE BATERIA': { parcelado: 'R$ 420,00', avista: 'R$ 390,60' }, 'VIDRO TRASEIRO': { parcelado: 'R$ 650,00', avista: 'R$ 604,50' }, 'FACE ID': { parcelado: 'R$ 900,00', avista: 'R$ 880,00' }, 'CONECTOR DE CARGA': { parcelado: 'R$ 380,00', avista: 'R$ 353,40' } },
            'IPHONE 15 PRO MAX': { 'TROCA DE TELA': { parcelado: 'R$ 1.500,00', avista: 'R$ 1.395,00' }, 'TROCA DE BATERIA': { parcelado: 'R$ 450,00', avista: 'R$ 418,50' }, 'VIDRO TRASEIRO': { parcelado: 'R$ 700,00', avista: 'R$ 651,00' }, 'FACE ID': { parcelado: 'R$ 950,00', avista: 'R$ 930,00' }, 'CONECTOR DE CARGA': { parcelado: 'R$ 400,00', avista: 'R$ 372,00' } }
        };

        // Converte para o formato de preços
        Object.entries(priceData).forEach(([modelName, services]) => {
            const modelId = modelMapping[modelName];
            if (!modelId) {
                console.warn(`Modelo não encontrado: ${modelName}`);
                return;
            }

            Object.entries(services).forEach(([serviceName, prices]) => {
                const serviceId = serviceMapping[serviceName];
                if (!serviceId) {
                    console.warn(`Serviço não encontrado: ${serviceName}`);
                    return;
                }

                // Extrai valores numéricos das strings
                const parsePrice = (priceStr) => {
                    if (priceStr === 'N/A' || !priceStr) return 0;
                    const clean = priceStr.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
                    return parseFloat(clean) || 0;
                };

                const priceId = `price_${modelId}_${serviceId}`;
                prices.push({
                    id: priceId,
                    modelId: modelId,
                    serviceId: serviceId,
                    priceParcelado: parsePrice(prices.parcelado),
                    priceAvista: parsePrice(prices.avista),
                    discount: Math.round((1 - (parsePrice(prices.avista) / parsePrice(prices.parcelado))) * 100) || 5,
                    currency: 'BRL',
                    validFrom: now,
                    validUntil: null, // Sem validade
                    active: true,
                    createdAt: now,
                    updatedAt: now
                });
            });
        });

        return prices;
    }

    // Cria um catálogo limpo em caso de erro
    createCleanCatalog() {
        console.log('Criando catálogo limpo...');
        this.clear();
        
        const now = new Date().toISOString();
        const catalogMeta = {
            id: 'catalog_meta',
            type: 'metadata',
            version: '2.0.0',
            lastUpdate: now,
            modelsCount: 0,
            servicesCount: 0,
            pricesCount: 0,
            categoriesCount: 0,
            errorRecovery: true,
            createdAt: now,
            updatedAt: now
        };

        this.create(catalogMeta);
    }

    // Atualiza a estrutura do catálogo se necessário
    upgradeCatalogStructure() {
        const meta = this.findById('catalog_meta');
        if (!meta) {
            console.log('Metadados do catálogo não encontrados, recriando...');
            this.populateDefaultCatalog();
            return;
        }

        const currentVersion = meta.version || '1.0.0';
        const latestVersion = '2.0.0';

        if (currentVersion !== latestVersion) {
            console.log(`Atualizando catálogo da versão ${currentVersion} para ${latestVersion}...`);
            
            // Backup dos dados atuais
            this.createBackup();
            
            // Atualização específica da versão
            if (currentVersion === '1.0.0') {
                this.upgradeFromV1ToV2();
            }
            
            // Atualiza metadados
            meta.version = latestVersion;
            meta.lastUpdate = new Date().toISOString();
            this.update(meta.id, meta);
            
            console.log('Catálogo atualizado com sucesso');
        }
    }

    // Atualiza de v1.0.0 para v2.0.0
    upgradeFromV1ToV2() {
        const now = new Date().toISOString();
        
        // Verifica se já tem a nova estrutura
        const existingModels = this.findByField('type', 'model');
        const existingServices = this.findByField('type', 'service');
        
        if (existingModels.length > 0 || existingServices.length > 0) {
            console.log('Estrutura v2 já parece estar presente, pulando upgrade...');
            return;
        }
        
        // Se os dados estiverem no formato antigo (um único objeto), converte
        const oldData = this.findAll();
        if (oldData.length === 1 && oldData[0].models && Array.isArray(oldData[0].models)) {
            console.log('Convertendo dados do formato antigo...');
            const oldCatalog = oldData[0];
            
            // Limpa dados antigos
            this.clear();
            
            // Converte modelos
            if (oldCatalog.models && Array.isArray(oldCatalog.models)) {
                const models = oldCatalog.models.map((modelName, index) => ({
                    id: `model_legacy_${index}`,
                    name: modelName,
                    category: 'iPhone',
                    generation: this.extractGeneration(modelName),
                    year: this.extractYear(modelName),
                    active: true,
                    createdAt: now,
                    updatedAt: now
                }));
                this.createMany(models);
            }
            
            // Converte serviços
            if (oldCatalog.services && Array.isArray(oldCatalog.services)) {
                const services = oldCatalog.services.map((serviceName, index) => ({
                    id: `service_legacy_${index}`,
                    name: serviceName,
                    category: this.getCategoryFromService(serviceName),
                    description: '',
                    estimatedTime: '1-2 horas',
                    difficulty: 'Média',
                    createdAt: now,
                    updatedAt: now
                }));
                this.createMany(services);
            }
            
            // Converte preços
            if (oldCatalog.prices && typeof oldCatalog.prices === 'object') {
                const prices = [];
                Object.entries(oldCatalog.prices).forEach(([modelName, services]) => {
                    const model = this.findByField('name', modelName)[0];
                    if (!model) return;
                    
                    Object.entries(services).forEach(([serviceName, priceData]) => {
                        const service = this.findByField('name', serviceName)[0];
                        if (!service) return;
                        
                        const parsePrice = (price) => {
                            if (typeof price === 'number') return price;
                            if (typeof price === 'string') {
                                const clean = price.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
                                return parseFloat(clean) || 0;
                            }
                            return 0;
                        };
                        
                        prices.push({
                            id: `price_${model.id}_${service.id}`,
                            modelId: model.id,
                            serviceId: service.id,
                            priceParcelado: parsePrice(priceData.parcelado),
                            priceAvista: parsePrice(priceData.avista),
                            discount: 5,
                            currency: 'BRL',
                            validFrom: now,
                            validUntil: null,
                            active: true,
                            createdAt: now,
                            updatedAt: now
                        });
                    });
                });
                
                if (prices.length > 0) {
                    this.createMany(prices);
                }
            }
        }
    }

    // Extrai geração do nome do modelo
    extractGeneration(modelName) {
        const match = modelName.match(/(\d+)/);
        return match ? parseInt(match[1]) : 0;
    }

    // Extrai ano do nome do modelo
    extractYear(modelName) {
        const yearMatch = modelName.match(/(20\d{2})/);
        if (yearMatch) return parseInt(yearMatch[1]);
        
        // Mapeamento aproximado por geração
        const generation = this.extractGeneration(modelName);
        const yearMap = {
            6: 2014, 7: 2016, 8: 2017, 10: 2017, 11: 2019, 12: 2020,
            13: 2021, 14: 2022, 15: 2023
        };
        return yearMap[generation] || 2020;
    }

    // Obtém categoria do serviço
    getCategoryFromService(serviceName) {
        const categories = {
            'TROCA DE TELA': 'Display',
            'TROCA DE BATERIA': 'Bateria',
            'VIDRO TRASEIRO': 'Estrutura',
            'FACE ID': 'Biometria',
            'CONECTOR DE CARGA': 'Hardware'
        };
        return categories[serviceName] || 'Hardware';
    }

    // MÉTODOS DE CONSULTA

    // Obtém todos os modelos ativos
    getModels(options = {}) {
        const defaultOptions = {
            active: true,
            sortBy: 'generation',
            sortOrder: 'desc'
        };
        
        const mergedOptions = { ...defaultOptions, ...options };
        return this.findWhere({ type: 'model', active: true }, mergedOptions);
    }

    // Obtém todos os serviços ativos
    getServices(options = {}) {
        const defaultOptions = {
            active: true,
            sortBy: 'name',
            sortOrder: 'asc'
        };
        
        const mergedOptions = { ...defaultOptions, ...options };
        return this.findWhere({ type: 'service', active: true }, mergedOptions);
    }

    // Obtém preços por modelo e serviço
    getPrice(modelId, serviceId) {
        return this.findWhere({ 
            modelId: modelId, 
            serviceId: serviceId,
            active: true 
        })[0];
    }

    // Obtém todos os preços de um modelo
    getPricesByModel(modelId) {
        return this.findWhere({ 
            modelId: modelId,
            active: true 
        }, { sortBy: 'serviceId', sortOrder: 'asc' });
    }

    // Obtém todos os preços de um serviço
    getPricesByService(serviceId) {
        return this.findWhere({ 
            serviceId: serviceId,
            active: true 
        }, { sortBy: 'modelId', sortOrder: 'asc' });
    }

    // Busca modelos por nome (parcial)
    searchModels(searchTerm) {
        return this.searchText(searchTerm, ['name', 'category']);
    }

    // Busca serviços por nome (parcial)
    searchServices(searchTerm) {
        return this.searchText(searchTerm, ['name', 'category', 'description']);
    }

    // Obtém estatísticas do catálogo
    getCatalogStats() {
        const meta = this.findById('catalog_meta');
        if (!meta) return null;
        
        return {
            models: meta.modelsCount || 0,
            services: meta.servicesCount || 0,
            prices: meta.pricesCount || 0,
            categories: meta.categoriesCount || 0,
            version: meta.version,
            lastUpdate: meta.lastUpdate,
            createdAt: meta.createdAt
        };
    }

    // MÉTODOS DE GERENCIAMENTO

    // Adiciona novo modelo
    addModel(modelData) {
        const now = new Date().toISOString();
        const modelId = `model_${Date.now()}`;
        
        const newModel = {
            id: modelId,
            type: 'model',
            name: modelData.name,
            category: modelData.category || 'iPhone',
            generation: modelData.generation || 0,
            year: modelData.year || new Date().getFullYear(),
            description: modelData.description || '',
            active: true,
            createdAt: now,
            updatedAt: now
        };
        
        const result = this.create(newModel);
        
        // Atualiza contador de modelos
        this.updateModelCount();
        
        return result;
    }

    // Adiciona novo serviço
    addService(serviceData) {
        const now = new Date().toISOString();
        const serviceId = `service_${Date.now()}`;
        
        const newService = {
            id: serviceId,
            type: 'service',
            name: serviceData.name,
            category: serviceData.category || 'Hardware',
            description: serviceData.description || '',
            estimatedTime: serviceData.estimatedTime || '1-2 horas',
            difficulty: serviceData.difficulty || 'Média',
            active: true,
            createdAt: now,
            updatedAt: now
        };
        
        const result = this.create(newService);
        
        // Atualiza contador de serviços
        this.updateServiceCount();
        
        return result;
    }

    // Adiciona novo preço
    addPrice(priceData) {
        const now = new Date().toISOString();
        const priceId = `price_${priceData.modelId}_${priceData.serviceId}`;
        
        // Verifica se já existe
        const existing = this.getPrice(priceData.modelId, priceData.serviceId);
        if (existing) {
            return this.updatePrice(priceData.modelId, priceData.serviceId, priceData);
        }
        
        const newPrice = {
            id: priceId,
            modelId: priceData.modelId,
            serviceId: priceData.serviceId,
            priceParcelado: priceData.priceParcelado,
            priceAvista: priceData.priceAvista,
            discount: priceData.discount || Math.round((1 - (priceData.priceAvista / priceData.priceParcelado)) * 100),
            currency: priceData.currency || 'BRL',
            validFrom: priceData.validFrom || now,
            validUntil: priceData.validUntil || null,
            active: true,
            createdAt: now,
            updatedAt: now
        };
        
        const result = this.create(newPrice);
        
        // Atualiza contador de preços
        this.updatePriceCount();
        
        return result;
    }

    // Atualiza preço existente
    updatePrice(modelId, serviceId, newPriceData) {
        const price = this.getPrice(modelId, serviceId);
        if (!price) {
            return this.addPrice({ modelId, serviceId, ...newPriceData });
        }
        
        const updatedPrice = {
            ...price,
            ...newPriceData,
            updatedAt: new Date().toISOString()
        };
        
        return this.update(price.id, updatedPrice);
    }

    // Atualiza contadores nos metadados
    updateModelCount() {
        const meta = this.findById('catalog_meta');
        if (meta) {
            const count = this.findByField('type', 'model').length;
            meta.modelsCount = count;
            meta.updatedAt = new Date().toISOString();
            this.update(meta.id, meta);
        }
    }

    updateServiceCount() {
        const meta = this.findById('catalog_meta');
        if (meta) {
            const count = this.findByField('type', 'service').length;
            meta.servicesCount = count;
            meta.updatedAt = new Date().toISOString();
            this.update(meta.id, meta);
        }
    }

    updatePriceCount() {
        const meta = this.findById('catalog_meta');
        if (meta) {
            const count = this.findByField('priceParcelado', { $exists: true }).length;
            meta.pricesCount = count;
            meta.updatedAt = new Date().toISOString();
            this.update(meta.id, meta);
        }
    }

    // Importa dados do data_bank.js global
    importFromDataBank() {
        if (!window.phoneData) {
            console.error('Dados do data_bank.js não encontrados');
            return false;
        }
        
        console.log('Importando dados do data_bank.js...');
        
        const now = new Date().toISOString();
        const imported = {
            models: 0,
            services: 0,
            prices: 0
        };
        
        // Importa modelos
        if (window.phoneData.models && Array.isArray(window.phoneData.models)) {
            window.phoneData.models.forEach(modelName => {
                const existing = this.findByField('name', modelName);
                if (existing.length === 0) {
                    this.addModel({
                        name: modelName,
                        category: 'iPhone',
                        generation: this.extractGeneration(modelName),
                        year: this.extractYear(modelName)
                    });
                    imported.models++;
                }
            });
        }
        
        // Importa serviços
        if (window.phoneData.services && Array.isArray(window.phoneData.services)) {
            window.phoneData.services.forEach(serviceName => {
                const existing = this.findByField('name', serviceName);
                if (existing.length === 0) {
                    this.addService({
                        name: serviceName,
                        category: this.getCategoryFromService(serviceName)
                    });
                    imported.services++;
                }
            });
        }
        
        // Importa preços
        if (window.phoneData.prices && typeof window.phoneData.prices === 'object') {
            Object.entries(window.phoneData.prices).forEach(([modelName, services]) => {
                const model = this.findByField('name', modelName)[0];
                if (!model) return;
                
                Object.entries(services).forEach(([serviceName, priceData]) => {
                    const service = this.findByField('name', serviceName)[0];
                    if (!service) return;
                    
                    const parsePrice = (priceStr) => {
                        if (priceStr === 'N/A' || !priceStr) return 0;
                        const clean = priceStr.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
                        return parseFloat(clean) || 0;
                    };
                    
                    this.addPrice({
                        modelId: model.id,
                        serviceId: service.id,
                        priceParcelado: parsePrice(priceData.parcelado),
                        priceAvista: parsePrice(priceData.avista)
                    });
                    
                    imported.prices++;
                });
            });
        }
        
        console.log(`Importação concluída: ${imported.models} modelos, ${imported.services} serviços, ${imported.prices} preços`);
        return imported;
    }

    // Exporta dados para formato compatível com data_bank.js
    exportToDataBankFormat() {
        const models = this.getModels();
        const services = this.getServices();
        const prices = this.findAll().filter(item => item.priceParcelado !== undefined);
        
        const result = {
            models: models.map(m => m.name),
            services: services.map(s => s.name),
            prices: {}
        };
        
        models.forEach(model => {
            result.prices[model.name] = {};
            services.forEach(service => {
                const price = this.getPrice(model.id, service.id);
                if (price) {
                    const formatPrice = (value) => {
                        if (value === 0) return 'N/A';
                        return `R$ ${value.toFixed(2).replace('.', ',')}`;
                    };
                    
                    result.prices[model.name][service.name] = {
                        parcelado: formatPrice(price.priceParcelado),
                        avista: formatPrice(price.priceAvista)
                    };
                }
            });
        });
        
        return result;
    }
}

// Cria instância global
const Catalog_DB = new CatalogDatabase();

// Expõe globalmente se estiver no navegador
if (typeof window !== 'undefined') {
    window.Catalog_DB = Catalog_DB;
}

// Exporta para módulos (se suportado)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Catalog_DB;
}