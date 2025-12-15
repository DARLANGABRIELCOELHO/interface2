// app.js - Núcleo principal da aplicação

class SistemaAssistencia {
    constructor() {
        this.currentModule = null;
        this.modules = {};
        this.init();
    }

    init() {
        console.log('Sistema de Assistência Técnica iniciando...');
        
        // Configura manipuladores de erro
        this.setupErrorHandling();
        
        // Inicializa quando o DOM estiver pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // Carrega módulos dinamicamente
        this.loadModules();
        
        // Configura eventos globais
        this.setupGlobalEvents();
        
        // Inicia com o dashboard
        this.navigateTo('Dashboard');
        
        console.log('Sistema pronto!');
    }

    loadModules() {
        // Módulos serão registrados pelo ModuleManager
        console.log('Aguardando registro dos módulos...');
    }

    setupErrorHandling() {
        // Captura erros globais não tratados
        window.addEventListener('error', (event) => {
            console.error('Erro global capturado:', event.error);
            this.showError(`Erro: ${event.message}`);
        });

        // Captura promessas rejeitadas não tratadas
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Promessa rejeitada não tratada:', event.reason);
            this.showError(`Erro na promessa: ${event.reason}`);
        });
    }

    setupGlobalEvents() {
        // Navegação entre módulos
        document.addEventListener('module:navigate', (event) => {
            if (event.detail && event.detail.module) {
                this.navigateTo(event.detail.module);
            }
        });

        // Atualização do dashboard
        document.addEventListener('data:updated', () => {
            if (this.modules.Dashboard && this.modules.Dashboard.refresh) {
                this.modules.Dashboard.refresh();
            }
        });

        // Logout/limpeza (se implementado)
        document.addEventListener('system:logout', () => {
            this.logout();
        });
    }

    navigateTo(moduleName) {
        // Verifica se o módulo existe
        if (!ModuleManager.exists(moduleName)) {
            console.error(`Módulo ${moduleName} não encontrado`);
            this.showError(`Módulo ${moduleName} não disponível`);
            return;
        }

        // Atualiza módulo ativo na sidebar
        if (ModuleManager.exists('Sidebar')) {
            const sidebar = ModuleManager.get('Sidebar');
            if (sidebar.setActiveModule) {
                sidebar.setActiveModule(moduleName);
            }
        }

        // Carrega o conteúdo do módulo
        this.loadModuleContent(moduleName);
        
        // Atualiza título da página
        document.title = `${moduleName} - Sistema Assistência Técnica`;
        
        console.log(`Navegado para: ${moduleName}`);
    }

    loadModuleContent(moduleName) {
        const module = ModuleManager.get(moduleName);
        const container = document.getElementById('main-content');
        
        if (!container) {
            console.error('Container principal não encontrado');
            return;
        }

        if (!module || !module.render) {
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h2>Módulo não disponível</h2>
                    <p>O módulo ${moduleName} não pôde ser carregado.</p>
                    <button class="btn btn-primary" onclick="app.navigateTo('Dashboard')">
                        Voltar para o Dashboard
                    </button>
                </div>
            `;
            return;
        }

        try {
            // Limpa conteúdo anterior
            container.innerHTML = '';
            
            // Renderiza o módulo
            const moduleContainer = document.createElement('div');
            moduleContainer.id = `${moduleName.toLowerCase()}-view`;
            moduleContainer.className = 'module-view';
            container.appendChild(moduleContainer);
            
            module.render();
            
            // Salva referência ao módulo atual
            this.currentModule = moduleName;
            this.modules[moduleName] = module;
            
        } catch (error) {
            console.error(`Erro ao carregar módulo ${moduleName}:`, error);
            container.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-bug"></i>
                    <h2>Erro ao carregar módulo</h2>
                    <p>${error.message}</p>
                    <button class="btn btn-primary" onclick="app.navigateTo('Dashboard')">
                        Voltar para o Dashboard
                    </button>
                </style>
                </div>
            `;
        }
    }

    showError(message) {
        // Cria notificação de erro
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-circle"></i>
                <span>${message}</span>
                <button class="error-close" onclick="this.parentElement.parentElement.remove()">
                    &times;
                </button>
            </div>
        `;
        
        // Adiciona ao topo da página
        document.body.appendChild(errorDiv);
        
        // Remove automaticamente após 5 segundos
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    }

    logout() {
        // Limpa dados sensíveis (se necessário)
        localStorage.removeItem('user_session');
        
        // Redireciona para página de login ou recarrega
        window.location.reload();
    }
}

// Estilos CSS para erros
const errorStyles = document.createElement('style');
errorStyles.textContent = `
    .error-state {
        text-align: center;
        padding: 50px 20px;
        color: #666;
    }
    
    .error-state i {
        font-size: 48px;
        color: #dc3545;
        margin-bottom: 20px;
    }
    
    .error-state h2 {
        color: #dc3545;
        margin-bottom: 10px;
    }
    
    .error-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 9999;
        max-width: 400px;
    }
    
    .error-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .error-close {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        margin-left: auto;
    }
    
    .module-view {
        padding: 20px;
    }
`;

document.head.appendChild(errorStyles);

// Cria instância global
window.app = new SistemaAssistencia();

// Exporta para módulos (se suportado)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SistemaAssistencia;
}