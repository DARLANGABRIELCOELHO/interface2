// app.js - Ponto de entrada principal do sistema

class Application {
    constructor() {
        this.currentModule = null;
        this.modules = new Map();
        this.isInitialized = false;
        
        // Configurações da aplicação
        this.config = {
            defaultModule: 'dashboard',
            animationDuration: 300,
            localStorageKey: 'ifix-app-state'
        };
    }

    /**
     * Inicializa a aplicação
     */
    async init() {
        try {
            console.log('🚀 Sistema iFix - Iniciando...');
            
            // 1. Inicializar módulos
            await this.initializeModules();
            
            // 2. Configurar eventos globais
            this.setupGlobalEvents();
            
            // 3. Restaurar estado anterior (se existir)
            this.restoreAppState();
            
            // 4. Configurar roteamento
            this.setupRouting();
            
            // 5. Inicializar UI
            this.initializeUI();
            
            this.isInitialized = true;
            
            console.log('✅ Sistema iFix - Pronto para uso');
            
            // Registrar carregamento bem-sucedido
            this.trackEvent('app_loaded', { 
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent 
            });
            
        } catch (error) {
            console.error('❌ Erro ao inicializar aplicação:', error);
            this.showFatalError(error);
        }
    }

    /**
     * Inicializa todos os módulos do sistema
     */
    async initializeModules() {
        console.log('📦 Inicializando módulos...');
        
        // Ordem de inicialização é importante
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
                // Verificar se o módulo existe no escopo global
                const module = this.getModuleInstance(moduleName);
                if (!module) {
                    console.warn(`⚠️ Módulo ${moduleName} não encontrado`);
                    continue;
                }

                // Verificar se o módulo tem método init
                if (typeof module.init === 'function') {
                    console.log(`  → Inicializando ${moduleName}...`);
                    await Promise.resolve(module.init());
                }

                // Registrar módulo
                this.modules.set(moduleName, module);
                
            } catch (error) {
                console.error(`❌ Erro ao inicializar módulo ${moduleName}:`, error);
                // Continuar mesmo com erro em um módulo
            }
        }
    }

    /**
     * Obtém instância do módulo pelo nome
     */
    getModuleInstance(moduleName) {
        const moduleMap = {
            'sidebar': window.SidebarModule,
            'dashboard': window.DashboardModule,
            'customers': window.CustomersModule,
            'serviceOrders': window.OrdersModule,
            'serviceCatalog': window.CatalogModule,
            'priceCalculator': window.CalculatorModule
        };
        
        return moduleMap[moduleName];
    }

    /**
     * Configura eventos globais da aplicação
     */
    setupGlobalEvents() {
        console.log('🎯 Configurando eventos globais...');
        
        // Eventos de teclado
        document.addEventListener('keydown', (e) => {
            // Ctrl + S para salvar
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveCurrentState();
            }
            
            // Esc para cancelar/voltar
            if (e.key === 'Escape') {
                this.handleEscape();
            }
            
            // Navegação por teclas (Ctrl + Número)
            if (e.ctrlKey && e.key >= '1' && e.key <= '6') {
                this.handleKeyboardNavigation(e.key);
            }
        });

        // Evento de antes de descarregar a página
        window.addEventListener('beforeunload', (e) => {
            this.saveAppState();
            // Não exibir mensagem padrão
        });

        // Evento de offline/online
        window.addEventListener('offline', () => {
            this.showNotification('⚠️ Você está offline. Algumas funcionalidades podem não estar disponíveis.', 'warning');
        });

        window.addEventListener('online', () => {
            this.showNotification('✅ Conexão restaurada.', 'success');
            // Tentar sincronizar dados pendentes
            this.syncPendingData();
        });

        // Evento de visibilidade da página
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                // Página voltou a ficar visível
                this.handlePageVisibility();
            }
        });
    }

    /**
     * Configura sistema de roteamento/navegação
     */
    setupRouting() {
        console.log('📍 Configurando sistema de roteamento...');
        
        // Suporte a navegação por hash (#dashboard, #customers, etc)
        window.addEventListener('hashchange', () => {
            this.navigateFromHash();
        });

        // Navegação inicial baseada no hash
        if (window.location.hash) {
            this.navigateFromHash();
        } else {
            // Navegar para módulo padrão
            this.navigate(this.config.defaultModule);
        }
    }

    /**
     * Inicializa interface do usuário
     */
    initializeUI() {
        console.log('🎨 Inicializando interface...');
        
        // Adicionar classes de loading
        document.body.classList.add('app-loading');
        
        // Configurar tema
        this.setupTheme();
        
        // Configurar notificações
        this.setupNotifications();
        
        // Inicializar animações
        this.setupAnimations();
        
        // Remover loading após tudo carregar
        setTimeout(() => {
            document.body.classList.remove('app-loading');
            document.body.classList.add('app-ready');
        }, 500);
    }

    /**
     * Navega para um módulo específico
     * @param {string} moduleName - Nome do módulo
     * @param {Object} params - Parâmetros para o módulo
     */
    async navigate(moduleName, params = {}) {
        try {
            console.log(`🔄 Navegando para: ${moduleName}`);
            
            // Validar se módulo existe
            if (!this.modules.has(moduleName)) {
                console.warn(`Módulo ${moduleName} não encontrado. Redirecionando para dashboard.`);
                moduleName = this.config.defaultModule;
            }

            // Evitar navegação redundante
            if (this.currentModule === moduleName && !params.forceReload) {
                return;
            }

            // Salvar estado atual antes de navegar
            this.saveModuleState(this.currentModule);

            // Animar transição
            await this.animateTransition('out');

            // Esconder módulo atual
            if (this.currentModule) {
                this.hideModule(this.currentModule);
            }

            // Mostrar novo módulo
            this.showModule(moduleName, params);

            // Atualizar hash da URL
            window.location.hash = moduleName;

            // Atualizar histórico
            this.updateHistory(moduleName, params);

            // Salvar estado da aplicação
            this.saveAppState();

            // Animar entrada
            await this.animateTransition('in');

            // Registrar navegação
            this.trackEvent('navigation', {
                from: this.currentModule,
                to: moduleName,
                timestamp: new Date().toISOString()
            });

            this.currentModule = moduleName;

            // Atualizar título da página
            document.title = this.getModuleTitle(moduleName) + ' | iFix Assistência Técnica';

        } catch (error) {
            console.error(`❌ Erro ao navegar para ${moduleName}:`, error);
            this.showError(`Não foi possível carregar o módulo ${moduleName}`);
            
            // Fallback para dashboard
            if (moduleName !== this.config.defaultModule) {
                this.navigate(this.config.defaultModule);
            }
        }
    }

    /**
     * Mostra um módulo específico
     */
    async showModule(moduleName, params = {}) {
        const container = document.getElementById(`${moduleName}-view`);
        if (!container) {
            throw new Error(`Container não encontrado para módulo: ${moduleName}`);
        }

        // Adicionar classe ativa
        container.classList.add('active');
        
        // Atualizar sidebar
        if (window.SidebarModule && typeof window.SidebarModule.updateActive === 'function') {
            window.SidebarModule.updateActive(moduleName);
        }

        // Chamar render do módulo
        const module = this.modules.get(moduleName);
        if (module && typeof module.render === 'function') {
            // Passar parâmetros para o módulo
            if (typeof module.setParams === 'function') {
                module.setParams(params);
            }
            
            await Promise.resolve(module.render());
        }

        // Disparar evento de módulo carregado
        this.dispatchEvent('module-loaded', { 
            module: moduleName,
            container: container 
        });
    }

    /**
     * Esconde um módulo
     */
    hideModule(moduleName) {
        const container = document.getElementById(`${moduleName}-view`);
        if (container) {
            container.classList.remove('active');
            
            // Chamar método de limpeza do módulo, se existir
            const module = this.modules.get(moduleName);
            if (module && typeof module.cleanup === 'function') {
                module.cleanup();
            }
        }
    }

    /**
     * Navegação baseada em hash da URL
     */
    navigateFromHash() {
        const hash = window.location.hash.replace('#', '');
        if (hash && hash !== this.currentModule) {
            // Extrair parâmetros do hash se existirem
            const [moduleName, ...paramParts] = hash.split('/');
            const params = this.parseHashParams(paramParts);
            
            this.navigate(moduleName, params);
        }
    }

    /**
     * Parse parâmetros do hash
     */
    parseHashParams(paramParts) {
        const params = {};
        paramParts.forEach(part => {
            const [key, value] = part.split('=');
            if (key && value) {
                params[key] = decodeURIComponent(value);
            }
        });
        return params;
    }

    /**
     * Restaura estado anterior da aplicação
     */
    restoreAppState() {
        try {
            const saved = localStorage.getItem(this.config.localStorageKey);
            if (saved) {
                const state = JSON.parse(saved);
                
                // Restaurar preferências
                if (state.theme) {
                    this.applyTheme(state.theme);
                }
                
                // Restaurar última posição
                if (state.lastModule && state.lastModule !== this.config.defaultModule) {
                    setTimeout(() => {
                        this.navigate(state.lastModule, { restore: true });
                    }, 100);
                }
                
                console.log('📂 Estado da aplicação restaurado');
            }
        } catch (error) {
            console.warn('⚠️ Não foi possível restaurar estado:', error);
        }
    }

    /**
     * Salva estado atual da aplicação
     */
    saveAppState() {
        try {
            const state = {
                lastModule: this.currentModule,
                theme: document.body.getAttribute('data-theme') || 'dark',
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem(this.config.localStorageKey, JSON.stringify(state));
        } catch (error) {
            console.warn('⚠️ Não foi possível salvar estado:', error);
        }
    }

    /**
     * Salva estado específico de um módulo
     */
    saveModuleState(moduleName) {
        const module = this.modules.get(moduleName);
        if (module && typeof module.getState === 'function') {
            try {
                const state = module.getState();
                if (state) {
                    localStorage.setItem(`module-state-${moduleName}`, JSON.stringify(state));
                }
            } catch (error) {
                console.warn(`⚠️ Não foi possível salvar estado do módulo ${moduleName}:`, error);
            }
        }
    }

    /**
     * Configura sistema de temas
     */
    setupTheme() {
        // Verificar preferência salva ou do sistema
        const savedTheme = localStorage.getItem('app-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        const theme = savedTheme || (prefersDark ? 'dark' : 'light');
        this.applyTheme(theme);
        
        // Botão de alternar tema (se existir)
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const current = document.body.getAttribute('data-theme') || 'dark';
                const newTheme = current === 'dark' ? 'light' : 'dark';
                this.applyTheme(newTheme);
                localStorage.setItem('app-theme', newTheme);
            });
        }
    }

    /**
     * Aplica tema específico
     */
    applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        document.documentElement.style.setProperty('color-scheme', theme);
        
        // Disparar evento
        this.dispatchEvent('theme-changed', { theme });
    }

    /**
     * Configura sistema de notificações
     */
    setupNotifications() {
        // Criar container para notificações
        const container = document.createElement('div');
        container.id = 'notifications-container';
        container.className = 'notifications';
        document.body.appendChild(container);
    }

    /**
     * Mostra uma notificação
     */
    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
            </div>
            <button class="notification-close" aria-label="Fechar">×</button>
        `;
        
        const container = document.getElementById('notifications-container');
        container.appendChild(notification);
        
        // Fechar automático
        if (duration > 0) {
            setTimeout(() => {
                this.closeNotification(notification);
            }, duration);
        }
        
        // Fechar manual
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.closeNotification(notification);
        });
        
        return notification;
    }

    /**
     * Fecha uma notificação
     */
    closeNotification(notification) {
        notification.classList.add('closing');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    /**
     * Obtém ícone para tipo de notificação
     */
    getNotificationIcon(type) {
        const icons = {
            'info': 'ℹ️',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌'
        };
        return icons[type] || icons.info;
    }

    /**
     * Configura animações
     */
    setupAnimations() {
        // Adicionar estilos para transições
        const style = document.createElement('style');
        style.textContent = `
            .module-container {
                transition: opacity ${this.config.animationDuration}ms ease,
                            transform ${this.config.animationDuration}ms ease;
            }
            .module-container.leaving {
                opacity: 0;
                transform: translateX(-20px);
            }
            .module-container.entering {
                opacity: 0;
                transform: translateX(20px);
            }
            .module-container.active {
                opacity: 1;
                transform: translateX(0);
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Anima transição entre módulos
     */
    async animateTransition(direction) {
        return new Promise(resolve => {
            setTimeout(resolve, this.config.animationDuration);
        });
    }

    /**
     * Sincroniza dados pendentes
     */
    async syncPendingData() {
        try {
            // Implementar lógica de sincronização offline/online
            console.log('🔄 Sincronizando dados pendentes...');
        } catch (error) {
            console.error('❌ Erro na sincronização:', error);
        }
    }

    /**
     * Lida com tecla Escape
     */
    handleEscape() {
        // Fechar modais abertos
        const modals = document.querySelectorAll('.modal.show');
        if (modals.length > 0) {
            // Fechar o último modal aberto
            const lastModal = modals[modals.length - 1];
            const closeBtn = lastModal.querySelector('[data-dismiss="modal"]');
            if (closeBtn) {
                closeBtn.click();
            }
            return;
        }
        
        // Voltar para dashboard se estiver em outro módulo
        if (this.currentModule !== this.config.defaultModule) {
            this.navigate(this.config.defaultModule);
        }
    }

    /**
     * Lida com navegação por teclado
     */
    handleKeyboardNavigation(key) {
        const moduleMap = {
            '1': 'dashboard',
            '2': 'customers',
            '3': 'serviceOrders',
            '4': 'serviceCatalog',
            '5': 'priceCalculator',
            '6': 'calculator' // Alias para priceCalculator
        };
        
        const module = moduleMap[key];
        if (module) {
            this.navigate(module);
        }
    }

    /**
     * Lida com visibilidade da página
     */
    handlePageVisibility() {
        // Atualizar dados se necessário
        if (this.currentModule && this.modules.has(this.currentModule)) {
            const module = this.modules.get(this.currentModule);
            if (typeof module.refresh === 'function') {
                module.refresh();
            }
        }
    }

    /**
     * Obtém título do módulo
     */
    getModuleTitle(moduleName) {
        const titles = {
            'dashboard': 'Dashboard',
            'customers': 'Clientes',
            'serviceOrders': 'Ordens de Serviço',
            'serviceCatalog': 'Catálogo',
            'priceCalculator': 'Calculadora de Preços',
            'calculator': 'Calculadora de Preços'
        };
        return titles[moduleName] || moduleName;
    }

    /**
     * Atualiza histórico de navegação
     */
    updateHistory(moduleName, params) {
        const state = { module: moduleName, params };
        const title = this.getModuleTitle(moduleName);
        const url = `#${moduleName}`;
        
        history.pushState(state, title, url);
    }

    /**
     * Mostra erro fatal
     */
    showFatalError(error) {
        document.body.innerHTML = `
            <div class="fatal-error">
                <div class="error-content">
                    <h1>😔 Ocorreu um erro crítico</h1>
                    <p>O sistema não pôde ser carregado. Por favor, recarregue a página.</p>
                    <button onclick="window.location.reload()" class="btn btn-primary">
                        ↻ Recarregar Página
                    </button>
                    <details>
                        <summary>Detalhes do erro</summary>
                        <pre>${error.toString()}</pre>
                    </details>
                </div>
            </div>
        `;
        
        // Adicionar estilos mínimos
        const style = document.createElement('style');
        style.textContent = `
            .fatal-error {
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
            }
            .error-content {
                max-width: 500px;
                text-align: center;
                background: rgba(255,255,255,0.1);
                backdrop-filter: blur(10px);
                padding: 40px;
                border-radius: 20px;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Mostra erro genérico
     */
    showError(message) {
        this.showNotification(message, 'error', 10000);
    }

    /**
     * Rastreia eventos da aplicação
     */
    trackEvent(eventName, data = {}) {
        // Aqui você pode integrar com Google Analytics, etc.
        console.log(`📊 Evento: ${eventName}`, data);
    }

    /**
     * Dispara evento personalizado
     */
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { 
            detail,
            bubbles: true 
        });
        document.dispatchEvent(event);
    }

    /**
     * Obtém informações do sistema
     */
    getSystemInfo() {
        return {
            version: '1.0.0',
            modules: Array.from(this.modules.keys()),
            currentModule: this.currentModule,
            isOnline: navigator.onLine,
            screenSize: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
    }
}

// Instância global da aplicação
const App = new Application();

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    // DOM já carregado
    setTimeout(() => App.init(), 0);
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.App = App;
    
    // Atalhos globais para navegação (backwards compatibility)
    window.navigate = (moduleName, params) => App.navigate(moduleName, params);
}

// Suporte a módulos ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { App };
}

console.log('📱 app.js carregado com sucesso');