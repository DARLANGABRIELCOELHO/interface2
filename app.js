// app.js - Ponto de entrada principal do sistema

class Application {
    constructor() {
        this.currentModule = null;
        this.modules = new Map();
        this.isInitialized = false;
        
        this.config = {
            defaultModule: 'dashboard',
            animationDuration: 300,
            localStorageKey: 'ifix-app-state'
        };
    }

    async init() {
        try {
            console.log('🚀 Sistema iFix - Iniciando...');
            
            // Tenta inicializar módulos, mas não para se um falhar
            await this.initializeModules();
            
            this.setupGlobalEvents();
            this.setupRouting();
            
            this.isInitialized = true;
            console.log('✅ Sistema iFix - Pronto');
            
        } catch (error) {
            console.error('❌ Erro crítico na inicialização:', error);
        } finally {
            // GARANTE que o loading vai sumir
            this.initializeUI();
        }
    }

    async initializeModules() {
        console.log('📦 Inicializando módulos...');
        
        const moduleOrder = [
            'sidebar',
            'dashboard',
            'customers',
            'serviceOrders',
            'serviceCatalog',
            'priceCalculator'
        ];

        for (const moduleName of moduleOrder) {
            try {
                const module = this.getModuleInstance(moduleName);
                if (!module) {
                    console.warn(`⚠️ Módulo ${moduleName} não encontrado no window.`);
                    continue;
                }

                if (typeof module.init === 'function') {
                    // Executa init. Se já tiver rodado, o módulo deve tratar a duplicidade.
                    await Promise.resolve(module.init());
                }

                this.modules.set(moduleName, module);
                
            } catch (error) {
                console.error(`❌ Erro ao inicializar módulo ${moduleName}:`, error);
            }
        }
    }

    getModuleInstance(moduleName) {
        const moduleMap = {
            'sidebar': window.SidebarModule,
            'dashboard': window.DashboardModule,
            'customers': window.CustomersModule,
            'serviceOrders': window.OrdersModule, // ou ServiceOrdersModule
            'serviceCatalog': window.CatalogModule, // ou ServiceCatalogModule
            'priceCalculator': window.CalculatorModule
        };
        
        // Tenta buscar pelo mapa ou direto no window se o nome bater
        return moduleMap[moduleName] || window[moduleName];
    }

    setupGlobalEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.handleEscape();
        });
        
        // Listener para remover loading caso algo externo falhe
        window.addEventListener('load', () => {
            document.body.classList.remove('app-loading');
        });
    }

    setupRouting() {
        window.addEventListener('hashchange', () => this.navigateFromHash());
        if (window.location.hash) {
            this.navigateFromHash();
        } else {
            this.navigate(this.config.defaultModule);
        }
    }

    initializeUI() {
        // Força remoção da classe de loading
        setTimeout(() => {
            document.body.classList.remove('app-loading');
            document.body.classList.add('app-ready');
            
            // Força um render do módulo atual se nada apareceu
            if (!this.currentModule) {
                 this.navigate(this.config.defaultModule);
            }
        }, 500);
        
        this.setupTheme();
        this.setupNotifications();
    }

    async navigate(moduleName, params = {}) {
        try {
            if (!this.modules.has(moduleName)) {
                // Tenta recuperar se não foi inicializado
                const module = this.getModuleInstance(moduleName);
                if (module) {
                    this.modules.set(moduleName, module);
                } else {
                    console.warn(`Módulo ${moduleName} indisponível.`);
                    if (moduleName !== 'dashboard') this.navigate('dashboard');
                    return;
                }
            }

            if (this.currentModule) {
                this.hideModule(this.currentModule);
            }

            this.showModule(moduleName, params);
            this.currentModule = moduleName;
            
            // Atualiza Hash sem disparar evento
            const newHash = `#${moduleName}`;
            if(window.location.hash !== newHash) {
                history.pushState(null, null, newHash);
            }

        } catch (error) {
            console.error(`Erro ao navegar para ${moduleName}:`, error);
        }
    }

    showModule(moduleName, params = {}) {
        const container = document.getElementById(`${moduleName}-view`);
        if (container) {
            container.classList.add('active');
            
            const module = this.modules.get(moduleName);
            if (module && typeof module.render === 'function') {
                module.render();
            }
            
            if (window.SidebarModule) {
                window.SidebarModule.updateActive(moduleName);
            }
        }
    }

    hideModule(moduleName) {
        const container = document.getElementById(`${moduleName}-view`);
        if (container) container.classList.remove('active');
    }

    navigateFromHash() {
        const hash = window.location.hash.replace('#', '');
        if (hash) this.navigate(hash);
    }

    handleEscape() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(m => m.style.display = 'none');
        modals.forEach(m => m.classList.remove('active'));
    }

    setupTheme() {
        const savedTheme = localStorage.getItem('app-theme') || 'dark';
        document.body.setAttribute('data-theme', savedTheme);
        
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.onclick = () => {
                const current = document.body.getAttribute('data-theme');
                const next = current === 'dark' ? 'light' : 'dark';
                document.body.setAttribute('data-theme', next);
                localStorage.setItem('app-theme', next);
            };
        }
    }

    setupNotifications() {
        if (!document.getElementById('notifications-container')) {
            const container = document.createElement('div');
            container.id = 'notifications-container';
            container.className = 'notifications';
            document.body.appendChild(container);
        }
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notifications-container');
        if (!container) return;
        
        const notif = document.createElement('div');
        notif.className = `notification notification-${type}`;
        notif.textContent = message;
        container.appendChild(notif);
        
        setTimeout(() => {
            notif.remove();
        }, 4000);
    }
}

// Inicializar a instância global, mas NÃO chamar init() aqui. O init.js fará isso.
window.App = new Application();
