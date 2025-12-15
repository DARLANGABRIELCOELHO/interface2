// init.js - Gerenciador de inicialização dos módulos

class ModuleManager {
    constructor() {
        this.modules = {};
        this.loaded = false;
        this.initQueue = [];
    }

    // Registra um módulo
    register(name, module) {
        this.modules[name] = module;
        console.log(`Módulo registrado: ${name}`);
        
        // Se já estiver carregado, inicializa imediatamente
        if (this.loaded && module.init) {
            module.init();
        }
    }

    // Inicializa todos os módulos
    initialize() {
        console.log('Inicializando módulos...');
        
        // Ordem de inicialização específica
        const initOrder = [
            'Dashboard',
            'Sidebar',
            'Customers',
            'ServiceOrders',
            'ServiceCatalog',
            'PriceCalculator'
        ];

        initOrder.forEach(moduleName => {
            if (this.modules[moduleName] && this.modules[moduleName].init) {
                try {
                    this.modules[moduleName].init();
                    console.log(`✓ ${moduleName} inicializado`);
                } catch (error) {
                    console.error(`✗ Erro ao inicializar ${moduleName}:`, error);
                }
            }
        });

        this.loaded = true;
        
        // Executa fila de inicialização
        this.initQueue.forEach(fn => fn());
        this.initQueue = [];
        
        // Atualiza dashboard inicial
        if (this.modules.Dashboard && this.modules.Dashboard.render) {
            this.modules.Dashboard.render();
        }
    }

    // Obtém um módulo
    get(moduleName) {
        return this.modules[moduleName];
    }

    // Verifica se um módulo existe
    exists(moduleName) {
        return !!this.modules[moduleName];
    }

    // Executa após inicialização completa
    onReady(callback) {
        if (this.loaded) {
            callback();
        } else {
            this.initQueue.push(callback);
        }
    }
}

// Cria instância global
window.ModuleManager = new ModuleManager();

// Detecta quando o DOM está pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, inicializando sistema...');
    
    // Inicializa módulos após um breve delay para garantir tudo está carregado
    setTimeout(() => {
        ModuleManager.initialize();
    }, 100);
});

// Exporta para módulos (se suportado)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModuleManager;
}