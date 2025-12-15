// modules/sidebar.js

/**
 * Módulo de Sidebar - Sistema de Navegação Principal
 * Gerencia a navegação entre módulos e estado do sistema
 */
class SidebarModule {
    constructor() {
        this.currentView = null;
        this.menuItems = [];
        this.isCollapsed = false;
        this.menuData = null;
        this.elements = {};
        
        // Configurações
        this.config = {
            collapseBreakpoint: 1024,
            animationDuration: 300,
            localStorageKey: 'sidebar-state'
        };
    }

    /**
     * Inicializa o módulo
     */
    init() {
        this.cacheElements();
        this.loadMenuData();
        this.setupEventListeners();
        this.render();
        this.setupResponsive();
        this.restoreState();
        
        console.log('✅ Sidebar inicializada');
    }

    /**
     * Cache de elementos DOM
     */
    cacheElements() {
        this.elements = {
            sidebar: document.getElementById('sidebar'),
            mobileToggle: document.querySelector('.mobile-menu-toggle'),
            overlay: document.querySelector('.sidebar-overlay'),
            themeToggle: document.getElementById('theme-toggle')
        };
    }

    /**
     * Carrega dados do menu
     */
    loadMenuData() {
        this.menuData = [
            {
                id: 'dashboard',
                title: 'Dashboard',
                icon: 'fas fa-chart-line',
                description: 'Painel de controle com métricas',
                badge: null,
                shortcut: 'Ctrl+1'
            },
            {
                id: 'customers',
                title: 'Clientes',
                icon: 'fas fa-users',
                description: 'Gestão de clientes (CRM)',
                badge: null,
                shortcut: 'Ctrl+2'
            },
            {
                id: 'orders',
                title: 'Ordens de Serviço',
                icon: 'fas fa-clipboard-list',
                description: 'Gestão de ordens de serviço',
                badge: null,
                shortcut: 'Ctrl+3'
            },
            {
                id: 'calculator',
                title: 'Calculadora de Preços',
                icon: 'fas fa-calculator',
                description: 'Consulta de preços e orçamentos',
                badge: null,
                shortcut: 'Ctrl+4'
            },
            {
                id: 'catalog',
                title: 'Catálogo',
                icon: 'fas fa-book',
                description: 'Catálogo de serviços e preços',
                badge: null,
                shortcut: 'Ctrl+5'
            }
        ];
    }

    /**
     * Configura listeners de eventos
     */
    setupEventListeners() {
        // Eventos de teclado para navegação rápida
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Toggle de menu mobile
        if (this.elements.mobileToggle) {
            this.elements.mobileToggle.addEventListener('click', () => this.toggleMobileMenu());
        }
        
        // Overlay para fechar menu no mobile
        if (this.elements.overlay) {
            this.elements.overlay.addEventListener('click', () => this.closeMobileMenu());
        }
        
        // Toggle de tema
        if (this.elements.themeToggle) {
            this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // Detectar redimensionamento da janela
        window.addEventListener('resize', () => this.handleResize());
        
        // Eventos personalizados da aplicação
        document.addEventListener('module-loaded', (e) => this.onModuleLoaded(e));
        document.addEventListener('update-badge', (e) => this.updateBadge(e.detail));
    }

    /**
     * Renderiza a sidebar
     */
    render() {
        if (!this.elements.sidebar) {
            console.error('Elemento sidebar não encontrado');
            return;
        }

        try {
            this.elements.sidebar.innerHTML = this.getTemplate();
            this.cacheMenuItems();
            this.updateSystemStatus();
            
            // Adicionar classes baseadas no estado
            if (this.isCollapsed) {
                this.elements.sidebar.classList.add('collapsed');
            }
            
        } catch (error) {
            console.error('Erro ao renderizar sidebar:', error);
            this.renderFallback();
        }
    }

    /**
     * Template HTML da sidebar
     */
    getTemplate() {
        return `
            <div class="sidebar-header">
                <div class="logo">
                    <div class="logo-icon">🔧</div>
                    <div class="logo-text">
                        <h1>iFix</h1>
                        <span class="logo-subtitle">Assistência Técnica</span>
                    </div>
                </div>
                
                <button class="sidebar-toggle" aria-label="${this.isCollapsed ? 'Expandir menu' : 'Recolher menu'}">
                    <i class="fas fa-${this.isCollapsed ? 'chevron-right' : 'chevron-left'}"></i>
                </button>
            </div>
            
            <nav class="sidebar-nav" aria-label="Navegação principal">
                <ul class="nav-menu">
                    ${this.menuData.map(item => this.getMenuItemTemplate(item)).join('')}
                </ul>
            </nav>
            
            <div class="sidebar-footer">
                <div class="system-status">
                    <div class="status-indicator">
                        <span class="status-dot online"></span>
                        <span class="status-text">Sistema Online</span>
                    </div>
                    <div class="status-details">
                        <small>Última atualização: ${this.formatTime(new Date())}</small>
                        <small>Banco de dados: <span class="db-status">Ativo</span></small>
                    </div>
                </div>
                
                <div class="sidebar-actions">
                    <button class="btn btn-icon btn-sm" onclick="SidebarModule.toggleCollapse()" 
                            aria-label="${this.isCollapsed ? 'Expandir menu' : 'Recolher menu'}" 
                            title="${this.isCollapsed ? 'Expandir menu' : 'Recolher menu'}">
                        <i class="fas fa-${this.isCollapsed ? 'expand' : 'compress'}"></i>
                    </button>
                    
                    <button class="btn btn-icon btn-sm" onclick="SidebarModule.toggleTheme()" 
                            aria-label="Alternar tema" title="Alternar tema claro/escuro">
                        <i class="fas fa-moon"></i>
                    </button>
                    
                    <button class="btn btn-icon btn-sm" onclick="SidebarModule.showSettings()" 
                            aria-label="Configurações" title="Configurações do sistema">
                        <i class="fas fa-cog"></i>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Template para item do menu
     */
    getMenuItemTemplate(item) {
        const isActive = this.currentView === item.id;
        const badgeHTML = item.badge ? `<span class="nav-badge">${item.badge}</span>` : '';
        
        return `
            <li class="nav-item ${isActive ? 'active' : ''}">
                <a href="#${item.id}" 
                   class="nav-link" 
                   data-view="${item.id}"
                   aria-current="${isActive ? 'page' : 'false'}"
                   title="${item.description}">
                    <div class="nav-icon">
                        <i class="${item.icon}"></i>
                    </div>
                    <div class="nav-content">
                        <span class="nav-title">${item.title}</span>
                        <span class="nav-description">${item.description}</span>
                    </div>
                    ${badgeHTML}
                    ${item.shortcut ? `<span class="nav-shortcut">${item.shortcut}</span>` : ''}
                </a>
            </li>
        `;
    }

    /**
     * Cache dos elementos do menu após renderização
     */
    cacheMenuItems() {
        this.menuItems = Array.from(document.querySelectorAll('.nav-item'));
        
        // Adicionar eventos de clique
        this.menuItems.forEach(item => {
            const link = item.querySelector('.nav-link');
            if (link) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const viewId = link.getAttribute('data-view');
                    this.navigateTo(viewId);
                });
            }
        });
        
        // Adicionar evento ao botão de toggle
        const toggleBtn = this.elements.sidebar.querySelector('.sidebar-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleCollapse());
        }
    }

    /**
     * Navega para uma view específica
     */
    navigateTo(viewId, forceReload = false) {
        try {
            // Validar viewId
            const isValidView = this.menuData.some(item => item.id === viewId);
            if (!isValidView) {
                console.warn(`View "${viewId}" não encontrada`);
                return;
            }
            
            // Atualizar item ativo
            this.updateActive(viewId);
            
            // Navegar usando a aplicação principal
            if (window.App && typeof window.App.navigate === 'function') {
                window.App.navigate(viewId, { forceReload });
            } else if (window.app && typeof window.app.navigate === 'function') {
                // Fallback para sistema antigo
                window.app.navigate(viewId);
            } else {
                console.error('Sistema de navegação não encontrado');
            }
            
            // Fechar menu no mobile
            if (window.innerWidth < this.config.collapseBreakpoint) {
                this.closeMobileMenu();
            }
            
            // Rastrear navegação
            this.trackNavigation(viewId);
            
        } catch (error) {
            console.error('Erro ao navegar:', error);
        }
    }

    /**
     * Atualiza o item ativo no menu
     */
    updateActive(viewName) {
        // Remover classe ativa de todos os itens
        this.menuItems.forEach(item => {
            item.classList.remove('active');
            const link = item.querySelector('.nav-link');
            if (link) {
                link.setAttribute('aria-current', 'false');
            }
        });
        
        // Encontrar e ativar o item correspondente
        const targetItem = this.menuItems.find(item => {
            const link = item.querySelector('.nav-link');
            return link && link.getAttribute('data-view') === viewName;
        });
        
        if (targetItem) {
            targetItem.classList.add('active');
            const link = targetItem.querySelector('.nav-link');
            if (link) {
                link.setAttribute('aria-current', 'page');
            }
            this.currentView = viewName;
        }
    }

    /**
     * Alterna entre menu expandido/recolhido
     */
    toggleCollapse() {
        this.isCollapsed = !this.isCollapsed;
        this.elements.sidebar.classList.toggle('collapsed', this.isCollapsed);
        
        // Atualizar ícone do toggle
        const toggleIcon = this.elements.sidebar.querySelector('.sidebar-toggle i');
        if (toggleIcon) {
            toggleIcon.className = `fas fa-${this.isCollapsed ? 'chevron-right' : 'chevron-left'}`;
        }
        
        // Atualizar aria-label
        const toggleBtn = this.elements.sidebar.querySelector('.sidebar-toggle');
        if (toggleBtn) {
            toggleBtn.setAttribute('aria-label', 
                this.isCollapsed ? 'Expandir menu' : 'Recolher menu');
        }
        
        // Salvar estado
        this.saveState();
        
        // Disparar evento
        this.dispatchEvent('sidebar-toggle', { collapsed: this.isCollapsed });
    }

    /**
     * Alterna entre temas claro/escuro
     */
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('app-theme', newTheme);
        
        // Atualizar ícone
        const themeIcon = this.elements.themeToggle?.querySelector('i');
        if (themeIcon) {
            themeIcon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
        }
        
        // Disparar evento
        this.dispatchEvent('theme-changed', { theme: newTheme });
    }

    /**
     * Configura responsividade
     */
    setupResponsive() {
        // Verificar tamanho inicial
        this.handleResize();
        
        // Adicionar estilos para responsividade
        this.addResponsiveStyles();
    }

    /**
     * Adiciona estilos CSS para responsividade
     */
    addResponsiveStyles() {
        const styleId = 'sidebar-responsive-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            @media (max-width: ${this.config.collapseBreakpoint}px) {
                #sidebar {
                    position: fixed;
                    left: -280px;
                    top: 0;
                    bottom: 0;
                    z-index: 1000;
                    transition: left ${this.config.animationDuration}ms ease;
                }
                
                #sidebar.active {
                    left: 0;
                    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
                }
                
                .sidebar-overlay {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(2px);
                    z-index: 999;
                }
                
                .sidebar-overlay.active {
                    display: block;
                }
                
                .mobile-menu-toggle {
                    display: flex !important;
                }
            }
            
            #sidebar.collapsed {
                width: 80px;
                min-width: 80px;
            }
            
            #sidebar.collapsed .logo-text,
            #sidebar.collapsed .nav-content,
            #sidebar.collapsed .nav-shortcut,
            #sidebar.collapsed .nav-description,
            #sidebar.collapsed .status-details,
            #sidebar.collapsed .sidebar-actions {
                display: none;
            }
            
            #sidebar.collapsed .logo {
                justify-content: center;
                padding: 10px;
            }
            
            #sidebar.collapsed .logo-icon {
                font-size: 24px;
            }
            
            #sidebar.collapsed .nav-item {
                justify-content: center;
            }
            
            #sidebar.collapsed .nav-link {
                padding: 12px;
                justify-content: center;
            }
            
            #sidebar.collapsed .nav-icon {
                margin: 0;
                font-size: 18px;
            }
            
            #sidebar.collapsed .nav-badge {
                position: absolute;
                top: 5px;
                right: 5px;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Manipula redimensionamento da janela
     */
    handleResize() {
        const isMobile = window.innerWidth < this.config.collapseBreakpoint;
        
        // Adicionar/remover classe mobile
        this.elements.sidebar.classList.toggle('mobile', isMobile);
        
        // No mobile, garantir que não esteja recolhido
        if (isMobile && this.isCollapsed) {
            this.isCollapsed = false;
            this.elements.sidebar.classList.remove('collapsed');
        }
        
        // Disparar evento
        this.dispatchEvent('resize', { isMobile, width: window.innerWidth });
    }

    /**
     * Abre/fecha menu no mobile
     */
    toggleMobileMenu() {
        this.elements.sidebar.classList.toggle('active');
        this.elements.overlay.classList.toggle('active');
        
        // Prevenir scroll no body quando menu está aberto
        document.body.classList.toggle('no-scroll', 
            this.elements.sidebar.classList.contains('active'));
    }

    /**
     * Fecha menu no mobile
     */
    closeMobileMenu() {
        this.elements.sidebar.classList.remove('active');
        this.elements.overlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }

    /**
     * Atualiza status do sistema
     */
    updateSystemStatus() {
        const statusIndicator = this.elements.sidebar.querySelector('.status-dot');
        const dbStatus = this.elements.sidebar.querySelector('.db-status');
        const timeElement = this.elements.sidebar.querySelector('.status-details small');
        
        if (!statusIndicator || !dbStatus || !timeElement) return;
        
        // Simular verificação de status (em produção, isso seria uma chamada real)
        const isOnline = navigator.onLine;
        const isDbConnected = window.connection_DB ? true : false;
        
        // Atualizar indicador visual
        statusIndicator.className = `status-dot ${isOnline ? 'online' : 'offline'}`;
        
        // Atualizar texto do banco de dados
        dbStatus.textContent = isDbConnected ? 'Ativo' : 'Inativo';
        dbStatus.className = `db-status ${isDbConnected ? 'active' : 'inactive'}`;
        
        // Atualizar horário
        if (timeElement) {
            timeElement.textContent = `Última atualização: ${this.formatTime(new Date())}`;
        }
    }

    /**
     * Formata hora para exibição
     */
    formatTime(date) {
        return date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Manipula atalhos de teclado
     */
    handleKeyboardShortcuts(event) {
        // Ctrl + Números para navegação
        if (event.ctrlKey && event.key >= '1' && event.key <= '5') {
            const index = parseInt(event.key) - 1;
            if (this.menuData[index]) {
                event.preventDefault();
                this.navigateTo(this.menuData[index].id);
            }
        }
        
        // ESC para fechar menu mobile
        if (event.key === 'Escape' && window.innerWidth < this.config.collapseBreakpoint) {
            this.closeMobileMenu();
        }
        
        // Ctrl+B para alternar sidebar
        if (event.ctrlKey && event.key === 'b') {
            event.preventDefault();
            this.toggleCollapse();
        }
    }

    /**
     * Atualiza badge de um item do menu
     */
    updateBadge({ viewId, count }) {
        const item = this.menuItems.find(item => {
            const link = item.querySelector('.nav-link');
            return link && link.getAttribute('data-view') === viewId;
        });
        
        if (item) {
            let badge = item.querySelector('.nav-badge');
            
            if (count > 0) {
                if (!badge) {
                    badge = document.createElement('span');
                    badge.className = 'nav-badge';
                    item.querySelector('.nav-link').appendChild(badge);
                }
                badge.textContent = count > 99 ? '99+' : count.toString();
                badge.style.display = 'flex';
            } else if (badge) {
                badge.style.display = 'none';
            }
        }
    }

    /**
     * Evento quando um módulo é carregado
     */
    onModuleLoaded(event) {
        const { module } = event.detail;
        
        // Atualizar badge se necessário (exemplo: ordens pendentes)
        if (module === 'orders') {
            // Simular atualização de badge
            setTimeout(() => {
                this.updateBadge({ viewId: 'orders', count: Math.floor(Math.random() * 5) });
            }, 1000);
        }
    }

    /**
     * Mostra configurações
     */
    showSettings() {
        // Em produção, isso abriria um modal de configurações
        console.log('Abrir configurações do sistema');
        alert('Configurações do sistema serão implementadas na próxima versão.');
    }

    /**
     * Renderização de fallback em caso de erro
     */
    renderFallback() {
        this.elements.sidebar.innerHTML = `
            <div style="padding: 20px; text-align: center;">
                <div class="logo" style="color: var(--primary); margin-bottom: 30px;">🔧 iFix</div>
                <p style="color: var(--text-muted); margin-bottom: 20px;">Menu de navegação</p>
                <button onclick="location.reload()" class="btn btn-primary">
                    Recarregar Sistema
                </button>
            </div>
        `;
    }

    /**
     * Salva estado da sidebar
     */
    saveState() {
        try {
            const state = {
                collapsed: this.isCollapsed,
                lastView: this.currentView,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem(this.config.localStorageKey, JSON.stringify(state));
        } catch (error) {
            console.warn('Não foi possível salvar estado da sidebar:', error);
        }
    }

    /**
     * Restaura estado salvo
     */
    restoreState() {
        try {
            const saved = localStorage.getItem(this.config.localStorageKey);
            if (saved) {
                const state = JSON.parse(saved);
                
                if (state.collapsed && window.innerWidth >= this.config.collapseBreakpoint) {
                    this.isCollapsed = state.collapsed;
                    this.elements.sidebar.classList.toggle('collapsed', this.isCollapsed);
                }
                
                if (state.lastView) {
                    this.currentView = state.lastView;
                }
            }
        } catch (error) {
            console.warn('Não foi possível restaurar estado da sidebar:', error);
        }
    }

    /**
     * Rastreia navegação para analytics
     */
    trackNavigation(viewId) {
        // Em produção, integrar com Google Analytics, etc.
        console.log(`Navegação para: ${viewId}`);
    }

    /**
     * Dispara evento personalizado
     */
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(`sidebar-${eventName}`, { 
            detail,
            bubbles: true 
        });
        document.dispatchEvent(event);
    }

    /**
     * Atualiza dados do menu dinamicamente
     */
    updateMenuData(newData) {
        this.menuData = newData;
        this.render();
    }

    /**
     * Métodos públicos estáticos para acesso global
     */
    static navigateTo(viewId) {
        if (window.SidebarModule && window.SidebarModule.navigateTo) {
            window.SidebarModule.navigateTo(viewId);
        }
    }
    
    static toggleCollapse() {
        if (window.SidebarModule && window.SidebarModule.toggleCollapse) {
            window.SidebarModule.toggleCollapse();
        }
    }
    
    static toggleTheme() {
        if (window.SidebarModule && window.SidebarModule.toggleTheme) {
            window.SidebarModule.toggleTheme();
        }
    }
    
    static showSettings() {
        if (window.SidebarModule && window.SidebarModule.showSettings) {
            window.SidebarModule.showSettings();
        }
    }
}

// Criar instância única
const sidebarInstance = new SidebarModule();

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => sidebarInstance.init());
} else {
    sidebarInstance.init();
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.SidebarModule = sidebarInstance;
}

// Exportação para módulos ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SidebarModule: sidebarInstance };
}

console.log('✅ sidebar.js carregado com sucesso');