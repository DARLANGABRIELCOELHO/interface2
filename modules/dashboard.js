// modules/dashboard.js

/**
 * Módulo de Dashboard - Painel de controle com métricas e insights
 * Fornece visão geral do negócio com KPIs, gráficos e análises
 */
class DashboardModule {
    constructor() {
        this.timeRange = 'month'; // week, month, year
        this.isLoading = false;
        this.lastUpdate = null;
        
        // Dados em cache para performance
        this.cachedData = {
            kpis: null,
            charts: null,
            recentOrders: null,
            insights: null
        };
        
        // Configurações
        this.config = {
            refreshInterval: 300000, // 5 minutos
            chartAnimation: true,
            showNotifications: true,
            autoRefresh: true
        };
        
        this.elements = {};
        this.charts = {};
    }

    /**
     * Inicializa o módulo
     */
    async init() {
        this.cacheElements();
        await this.initializeData();
        this.setupEventListeners();
        this.render();
        this.startAutoRefresh();
        console.log('✅ DashboardModule inicializado');
    }

    /**
     * Cache de elementos DOM
     */
    cacheElements() {
        this.elements.container = document.getElementById('dashboard-view');
    }

    /**
     * Inicializa dados do dashboard
     */
    async initializeData() {
        try {
            this.isLoading = true;
            
            // Carregar dados de múltiplas fontes em paralelo
            await Promise.all([
                this.loadKPIs(),
                this.loadChartData(),
                this.loadRecentOrders(),
                this.loadInsights()
            ]);
            
            this.lastUpdate = new Date();
            this.isLoading = false;
            
        } catch (error) {
            console.error('Erro ao inicializar dados do dashboard:', error);
            this.isLoading = false;
        }
    }

    /**
     * Carrega KPIs principais
     */
    async loadKPIs() {
        try {
            const orders = await this.getOrders();
            const customers = await this.getCustomers();
            
            // Calcular métricas
            const stats = this.calculateOrderStats(orders);
            
            this.cachedData.kpis = {
                revenue: {
                    value: stats.totalRevenue,
                    label: 'Faturamento Mensal',
                    icon: 'fas fa-dollar-sign',
                    color: 'success',
                    change: '+12.5%',
                    trend: 'up',
                    formatted: this.formatCurrency(stats.totalRevenue)
                },
                pending: {
                    value: stats.pendingCount,
                    label: 'Serviços Pendentes',
                    icon: 'fas fa-clock',
                    color: 'warning',
                    change: '-3%',
                    trend: 'down',
                    formatted: stats.pendingCount.toString()
                },
                completed: {
                    value: stats.completedCount,
                    label: 'Serviços Concluídos',
                    icon: 'fas fa-check-circle',
                    color: 'primary',
                    change: '+8.2%',
                    trend: 'up',
                    formatted: stats.completedCount.toString()
                },
                customers: {
                    value: customers.length,
                    label: 'Clientes Ativos',
                    icon: 'fas fa-users',
                    color: 'info',
                    change: '+5.1%',
                    trend: 'up',
                    formatted: customers.length.toString()
                },
                averageTicket: {
                    value: stats.averageTicket,
                    label: 'Ticket Médio',
                    icon: 'fas fa-receipt',
                    color: 'info',
                    change: '+2.4%',
                    trend: 'up',
                    formatted: this.formatCurrency(stats.averageTicket)
                },
                conversion: {
                    value: stats.conversionRate,
                    label: 'Taxa de Conversão',
                    icon: 'fas fa-chart-line',
                    color: 'success',
                    change: '+1.8%',
                    trend: 'up',
                    formatted: `${stats.conversionRate.toFixed(1)}%`
                }
            };
            
        } catch (error) {
            console.error('Erro ao carregar KPIs:', error);
            this.cachedData.kpis = this.getFallbackKPIs();
        }
    }

    /**
     * Carrega dados para gráficos
     */
    async loadChartData() {
        try {
            const orders = await this.getOrders();
            
            // Dados para gráfico de faturamento semanal
            const revenueData = this.generateWeeklyRevenueData(orders);
            
            // Dados para gráfico de volume de serviços
            const volumeData = this.generateServiceVolumeData(orders);
            
            // Dados para gráfico de categorias
            const categoryData = this.generateCategoryData(orders);
            
            this.cachedData.charts = {
                revenue: revenueData,
                volume: volumeData,
                categories: categoryData
            };
            
        } catch (error) {
            console.error('Erro ao carregar dados de gráficos:', error);
            this.cachedData.charts = this.getFallbackChartData();
        }
    }

    /**
     * Carrega ordens recentes
     */
    async loadRecentOrders() {
        try {
            const orders = await this.getOrders();
            
            // Ordenar por data mais recente e pegar as 10 primeiras
            const recent = orders
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 10)
                .map(order => ({
                    id: order.id,
                    customer: order.customerName || 'Cliente',
                    device: order.deviceModel,
                    service: order.serviceType,
                    value: order.totalValue || 0,
                    status: order.status,
                    date: new Date(order.createdAt),
                    formattedDate: this.formatDate(order.createdAt, 'relative')
                }));
            
            this.cachedData.recentOrders = recent;
            
        } catch (error) {
            console.error('Erro ao carregar ordens recentes:', error);
            this.cachedData.recentOrders = [];
        }
    }

    /**
     * Carrega insights e análises
     */
    async loadInsights() {
        try {
            const orders = await this.getOrders();
            const customers = await this.getCustomers();
            
            // Análise de tendências
            const trends = this.analyzeTrends(orders);
            
            // Insights principais
            this.cachedData.insights = {
                topServices: this.getTopServices(orders),
                topModels: this.getTopModels(orders),
                peakHours: this.getPeakHours(orders),
                trends: trends,
                recommendations: this.generateRecommendations(orders, customers)
            };
            
        } catch (error) {
            console.error('Erro ao carregar insights:', error);
            this.cachedData.insights = this.getFallbackInsights();
        }
    }

    /**
     * Obtém ordens do banco de dados
     */
    async getOrders() {
        try {
            if (window.Orders_DB && typeof Orders_DB.findAll === 'function') {
                return Orders_DB.findAll();
            } else {
                // Dados de exemplo para desenvolvimento
                return this.getSampleOrders();
            }
        } catch (error) {
            console.error('Erro ao obter ordens:', error);
            return [];
        }
    }

    /**
     * Obtém clientes do banco de dados
     */
    async getCustomers() {
        try {
            if (window.Customers_DB && typeof Customers_DB.findAll === 'function') {
                return Customers_DB.findAll();
            } else {
                return [];
            }
        } catch (error) {
            console.error('Erro ao obter clientes:', error);
            return [];
        }
    }

    /**
     * Calcula estatísticas das ordens
     */
    calculateOrderStats(orders) {
        const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.totalValue) || 0), 0);
        const pendingCount = orders.filter(order => order.status === 'pending' || order.status === 'Pendente').length;
        const completedCount = orders.filter(order => order.status === 'completed' || order.status === 'Concluído').length;
        const averageTicket = orders.length > 0 ? totalRevenue / orders.length : 0;
        const conversionRate = orders.length > 0 ? (completedCount / orders.length) * 100 : 0;
        
        return {
            totalRevenue,
            pendingCount,
            completedCount,
            averageTicket,
            conversionRate,
            totalOrders: orders.length
        };
    }

    /**
     * Gera dados de faturamento semanal
     */
    generateWeeklyRevenueData(orders) {
        const weeks = 8;
        const data = [];
        
        for (let i = weeks - 1; i >= 0; i--) {
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - (i * 7));
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            
            // Calcular faturamento da semana
            const weekRevenue = orders
                .filter(order => {
                    const orderDate = new Date(order.createdAt);
                    return orderDate >= weekStart && orderDate <= weekEnd;
                })
                .reduce((sum, order) => sum + (parseFloat(order.totalValue) || 0), 0);
            
            data.push({
                week: `Sem ${weeks - i}`,
                revenue: weekRevenue,
                formatted: this.formatCurrency(weekRevenue),
                dateRange: `${weekStart.getDate()}/${weekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`
            });
        }
        
        return data;
    }

    /**
     * Gera dados de volume de serviços
     */
    generateServiceVolumeData(orders) {
        const days = 14;
        const data = [];
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            const dayOrders = orders.filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate.toDateString() === date.toDateString();
            });
            
            data.push({
                day: this.formatDate(date, 'short'),
                date: date,
                volume: dayOrders.length,
                revenue: dayOrders.reduce((sum, order) => sum + (parseFloat(order.totalValue) || 0), 0)
            });
        }
        
        return data;
    }

    /**
     * Gera dados por categoria de serviço
     */
    generateCategoryData(orders) {
        const categories = {};
        
        orders.forEach(order => {
            const category = this.detectServiceCategory(order.serviceType);
            if (!categories[category]) {
                categories[category] = {
                    count: 0,
                    revenue: 0
                };
            }
            categories[category].count++;
            categories[category].revenue += parseFloat(order.totalValue) || 0;
        });
        
        return Object.entries(categories).map(([name, data]) => ({
            name,
            count: data.count,
            revenue: data.revenue,
            percentage: (data.count / orders.length * 100).toFixed(1)
        }));
    }

    /**
     * Detecta categoria do serviço
     */
    detectServiceCategory(serviceType) {
        const service = serviceType?.toLowerCase() || '';
        
        if (service.includes('tela') || service.includes('display')) return 'Tela';
        if (service.includes('bateria')) return 'Bateria';
        if (service.includes('placa') || service.includes('circuito')) return 'Placa';
        if (service.includes('software') || service.includes('sistema')) return 'Software';
        if (service.includes('limpeza')) return 'Limpeza';
        if (service.includes('câmera') || service.includes('camera')) return 'Câmera';
        if (service.includes('conector') || service.includes('carga')) return 'Conectividade';
        
        return 'Outros';
    }

    /**
     * Analisa tendências dos dados
     */
    analyzeTrends(orders) {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        
        const currentMonthOrders = orders.filter(o => new Date(o.createdAt) >= lastMonth);
        const previousMonthOrders = orders.filter(o => {
            const date = new Date(o.createdAt);
            return date >= new Date(lastMonth.getFullYear(), lastMonth.getMonth() - 1, 1) &&
                   date < lastMonth;
        });
        
        const currentRevenue = currentMonthOrders.reduce((sum, o) => sum + (parseFloat(o.totalValue) || 0), 0);
        const previousRevenue = previousMonthOrders.reduce((sum, o) => sum + (parseFloat(o.totalValue) || 0), 0);
        
        const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue * 100) : 100;
        
        return {
            revenueGrowth: revenueGrowth.toFixed(1),
            orderGrowth: previousMonthOrders.length > 0 ? 
                ((currentMonthOrders.length - previousMonthOrders.length) / previousMonthOrders.length * 100).toFixed(1) : 
                '100',
            averageTicketGrowth: '2.4',
            customerRetention: '85.2'
        };
    }

    /**
     * Obtém serviços mais populares
     */
    getTopServices(orders) {
        const serviceCounts = {};
        
        orders.forEach(order => {
            const service = order.serviceType;
            serviceCounts[service] = (serviceCounts[service] || 0) + 1;
        });
        
        return Object.entries(serviceCounts)
            .map(([service, count]) => ({ service, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }

    /**
     * Obtém modelos mais atendidos
     */
    getTopModels(orders) {
        const modelCounts = {};
        
        orders.forEach(order => {
            const model = order.deviceModel;
            modelCounts[model] = (modelCounts[model] || 0) + 1;
        });
        
        return Object.entries(modelCounts)
            .map(([model, count]) => ({ model, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }

    /**
     * Obtém horários de pico
     */
    getPeakHours(orders) {
        const hourCounts = Array(24).fill(0);
        
        orders.forEach(order => {
            if (order.createdAt) {
                const hour = new Date(order.createdAt).getHours();
                hourCounts[hour]++;
            }
        });
        
        const maxCount = Math.max(...hourCounts);
        const peakHours = hourCounts
            .map((count, hour) => ({ hour, count }))
            .filter(item => item.count === maxCount)
            .map(item => `${item.hour}:00`);
        
        return peakHours.length > 0 ? peakHours.join(', ') : '9:00 - 18:00';
    }

    /**
     * Gera recomendações baseadas nos dados
     */
    generateRecommendations(orders, customers) {
        const recommendations = [];
        
        // Análise de serviços
        const topServices = this.getTopServices(orders);
        if (topServices.length > 0) {
            recommendations.push({
                type: 'success',
                icon: 'fas fa-star',
                title: 'Serviço Popular',
                message: `${topServices[0].service} é seu serviço mais solicitado`
            });
        }
        
        // Análise de clientes
        if (customers.length < 50) {
            recommendations.push({
                type: 'info',
                icon: 'fas fa-users',
                title: 'Crescimento de Clientes',
                message: 'Considere campanhas para atrair mais clientes'
            });
        }
        
        // Análise de faturamento
        const stats = this.calculateOrderStats(orders);
        if (stats.averageTicket < 200) {
            recommendations.push({
                type: 'warning',
                icon: 'fas fa-chart-line',
                title: 'Ticket Médio Baixo',
                message: 'Ofereça serviços adicionais para aumentar o ticket médio'
            });
        }
        
        return recommendations;
    }

    /**
     * Configura listeners de eventos
     */
    setupEventListeners() {
        // Atualizar dados
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-action="refresh-dashboard"]')) {
                this.refreshData();
            }
            
            if (e.target.closest('[data-time-range]')) {
                const range = e.target.closest('[data-time-range]').getAttribute('data-time-range');
                this.changeTimeRange(range);
            }
        });

        // Evento de atualização de outros módulos
        document.addEventListener('orders-updated', () => this.refreshData());
        document.addEventListener('customers-updated', () => this.refreshData());
    }

    /**
     * Renderiza o módulo principal
     */
    async render() {
        if (!this.elements.container) return;

        try {
            if (this.isLoading) {
                this.showLoading();
                return;
            }

            this.elements.container.innerHTML = this.getTemplate();
            
            // Inicializar gráficos após renderização
            setTimeout(() => {
                this.renderCharts();
                this.setupChartEvents();
            }, 100);
            
            // Adicionar classe para animações
            this.elements.container.classList.add('dashboard-loaded');
            
        } catch (error) {
            console.error('Erro ao renderizar dashboard:', error);
            this.showError('Não foi possível carregar o dashboard');
        }
    }

    /**
     * Template principal do dashboard
     */
    getTemplate() {
        const kpis = this.cachedData.kpis || this.getFallbackKPIs();
        const recentOrders = this.cachedData.recentOrders || [];
        const insights = this.cachedData.insights || this.getFallbackInsights();
        
        return `
            <div class="dashboard-container">
                <div class="dashboard-header">
                    <div class="header-content">
                        <h1><i class="fas fa-chart-line"></i> Dashboard Geral</h1>
                        <p class="subtitle">Visão completa do desempenho da sua assistência técnica</p>
                    </div>
                    
                    <div class="header-actions">
                        <div class="time-range-selector">
                            <button class="btn btn-outline btn-sm ${this.timeRange === 'week' ? 'active' : ''}" 
                                    data-time-range="week">
                                Semana
                            </button>
                            <button class="btn btn-outline btn-sm ${this.timeRange === 'month' ? 'active' : ''}" 
                                    data-time-range="month">
                                Mês
                            </button>
                            <button class="btn btn-outline btn-sm ${this.timeRange === 'year' ? 'active' : ''}" 
                                    data-time-range="year">
                                Ano
                            </button>
                        </div>
                        
                        <button class="btn btn-icon" data-action="refresh-dashboard" title="Atualizar dados">
                            <i class="fas fa-sync-alt ${this.isLoading ? 'fa-spin' : ''}"></i>
                        </button>
                        
                        ${this.lastUpdate ? `
                            <small class="text-muted">
                                Atualizado: ${this.formatDate(this.lastUpdate, 'relative')}
                            </small>
                        ` : ''}
                    </div>
                </div>
                
                <!-- KPIs Principais -->
                <div class="kpi-grid">
                    ${Object.values(kpis).map(kpi => this.getKPITemplate(kpi)).join('')}
                </div>
                
                <!-- Gráficos -->
                <div class="charts-grid">
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3><i class="fas fa-chart-bar"></i> Faturamento Semanal</h3>
                            <div class="chart-legend">
                                <span class="legend-item">
                                    <span class="legend-color revenue"></span>
                                    Faturamento
                                </span>
                            </div>
                        </div>
                        <div class="chart-container" id="revenue-chart"></div>
                    </div>
                    
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3><i class="fas fa-chart-line"></i> Volume de Serviços</h3>
                            <div class="chart-legend">
                                <span class="legend-item">
                                    <span class="legend-color volume"></span>
                                    Volume
                                </span>
                            </div>
                        </div>
                        <div class="chart-container" id="volume-chart"></div>
                    </div>
                </div>
                
                <!-- Insights e Ordens Recentes -->
                <div class="insights-grid">
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fas fa-lightbulb"></i> Insights & Recomendações</h3>
                        </div>
                        <div class="card-body">
                            <div class="insights-list">
                                ${insights.recommendations?.map(rec => `
                                    <div class="insight-item insight-${rec.type}">
                                        <div class="insight-icon">
                                            <i class="${rec.icon}"></i>
                                        </div>
                                        <div class="insight-content">
                                            <strong>${rec.title}</strong>
                                            <p>${rec.message}</p>
                                        </div>
                                    </div>
                                `).join('') || '<p class="text-muted">Nenhum insight disponível no momento.</p>'}
                            </div>
                            
                            <div class="insight-stats">
                                <div class="stat-row">
                                    <span class="stat-label">Crescimento de Faturamento:</span>
                                    <span class="stat-value ${insights.trends?.revenueGrowth > 0 ? 'text-success' : 'text-danger'}">
                                        ${insights.trends?.revenueGrowth || 0}%
                                    </span>
                                </div>
                                <div class="stat-row">
                                    <span class="stat-label">Horários de Pico:</span>
                                    <span class="stat-value">${insights.peakHours || 'N/A'}</span>
                                </div>
                                <div class="stat-row">
                                    <span class="stat-label">Retenção de Clientes:</span>
                                    <span class="stat-value">${insights.trends?.customerRetention || 'N/A'}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fas fa-history"></i> Ordens Recentes</h3>
                            <a href="#" onclick="SidebarModule.navigateTo('orders')" class="btn btn-link btn-sm">
                                Ver Todas
                            </a>
                        </div>
                        <div class="card-body">
                            ${recentOrders.length > 0 ? `
                                <div class="recent-orders-table">
                                    ${recentOrders.map(order => this.getRecentOrderTemplate(order)).join('')}
                                </div>
                            ` : `
                                <div class="empty-state">
                                    <p class="text-muted">Nenhuma ordem recente encontrada.</p>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
                
                <!-- Estatísticas Detalhadas -->
                <div class="detailed-stats">
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fas fa-chart-pie"></i> Serviços por Categoria</h3>
                        </div>
                        <div class="card-body">
                            <div id="category-chart" class="category-chart"></div>
                            <div class="category-legend">
                                ${(this.cachedData.charts?.categories || []).map(cat => `
                                    <div class="legend-item">
                                        <span class="legend-dot" style="background-color: ${this.getCategoryColor(cat.name)}"></span>
                                        <span class="legend-label">${cat.name}</span>
                                        <span class="legend-value">${cat.count} (${cat.percentage}%)</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fas fa-trophy"></i> Top Serviços</h3>
                        </div>
                        <div class="card-body">
                            ${insights.topServices?.length > 0 ? `
                                <div class="top-services">
                                    ${insights.topServices.map((service, index) => `
                                        <div class="service-item">
                                            <div class="service-rank">#${index + 1}</div>
                                            <div class="service-info">
                                                <strong>${service.service}</strong>
                                                <small>${service.count} ordens</small>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : '<p class="text-muted">Nenhum dado disponível.</p>'}
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fas fa-mobile-alt"></i> Modelos Mais Atendidos</h3>
                        </div>
                        <div class="card-body">
                            ${insights.topModels?.length > 0 ? `
                                <div class="top-models">
                                    ${insights.topModels.map((model, index) => `
                                        <div class="model-item">
                                            <div class="model-icon">
                                                <i class="fas fa-mobile-alt"></i>
                                            </div>
                                            <div class="model-info">
                                                <strong>${model.model}</strong>
                                                <small>${model.count} serviços</small>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : '<p class="text-muted">Nenhum dado disponível.</p>'}
                        </div>
                    </div>
                </div>
                
                <!-- Ações Rápidas -->
                <div class="quick-actions">
                    <h3><i class="fas fa-bolt"></i> Ações Rápidas</h3>
                    <div class="actions-grid">
                        <button class="action-card" onclick="SidebarModule.navigateTo('orders')">
                            <div class="action-icon bg-primary">
                                <i class="fas fa-plus"></i>
                            </div>
                            <div class="action-content">
                                <strong>Nova Ordem</strong>
                                <small>Criar nova ordem de serviço</small>
                            </div>
                        </button>
                        
                        <button class="action-card" onclick="SidebarModule.navigateTo('customers')">
                            <div class="action-icon bg-success">
                                <i class="fas fa-user-plus"></i>
                            </div>
                            <div class="action-content">
                                <strong>Novo Cliente</strong>
                                <small>Cadastrar novo cliente</small>
                            </div>
                        </button>
                        
                        <button class="action-card" onclick="ServiceCatalogModule.showPriceAdjustment()">
                            <div class="action-icon bg-warning">
                                <i class="fas fa-percentage"></i>
                            </div>
                            <div class="action-content">
                                <strong>Ajustar Preços</strong>
                                <small>Atualizar tabela de preços</small>
                            </div>
                        </button>
                        
                        <button class="action-card" onclick="DashboardModule.exportReport()">
                            <div class="action-icon bg-info">
                                <i class="fas fa-file-export"></i>
                            </div>
                            <div class="action-content">
                                <strong>Exportar Relatório</strong>
                                <small>Gerar relatório mensal</small>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Template para KPI
     */
    getKPITemplate(kpi) {
        return `
            <div class="kpi-card">
                <div class="kpi-header">
                    <div class="kpi-icon bg-${kpi.color}">
                        <i class="${kpi.icon}"></i>
                    </div>
                    <div class="kpi-trend ${kpi.trend}">
                        <i class="fas fa-${kpi.trend === 'up' ? 'arrow-up' : 'arrow-down'}"></i>
                        ${kpi.change}
                    </div>
                </div>
                <div class="kpi-content">
                    <div class="kpi-value">${kpi.formatted}</div>
                    <div class="kpi-label">${kpi.label}</div>
                </div>
            </div>
        `;
    }

    /**
     * Template para ordem recente
     */
    getRecentOrderTemplate(order) {
        const statusConfig = {
            pending: { color: 'warning', icon: 'fas fa-clock', label: 'Pendente' },
            in_progress: { color: 'info', icon: 'fas fa-tools', label: 'Em Andamento' },
            completed: { color: 'success', icon: 'fas fa-check-circle', label: 'Concluído' },
            Concluído: { color: 'success', icon: 'fas fa-check-circle', label: 'Concluído' },
            Pendente: { color: 'warning', icon: 'fas fa-clock', label: 'Pendente' }
        };
        
        const status = statusConfig[order.status] || statusConfig.pending;
        
        return `
            <div class="recent-order">
                <div class="order-info">
                    <div class="order-header">
                        <strong>${order.id}</strong>
                        <span class="badge badge-${status.color}">
                            <i class="${status.icon}"></i> ${status.label}
                        </span>
                    </div>
                    <div class="order-details">
                        <small>${order.customer} • ${order.device}</small>
                        <small>${order.service}</small>
                    </div>
                </div>
                <div class="order-meta">
                    <div class="order-value">R$ ${parseFloat(order.value).toFixed(2)}</div>
                    <div class="order-date">${order.formattedDate}</div>
                </div>
            </div>
        `;
    }

    /**
     * Renderiza gráficos
     */
    renderCharts() {
        this.renderRevenueChart();
        this.renderVolumeChart();
        this.renderCategoryChart();
    }

    /**
     * Renderiza gráfico de faturamento
     */
    renderRevenueChart() {
        const chartData = this.cachedData.charts?.revenue || [];
        const container = document.getElementById('revenue-chart');
        
        if (!container || chartData.length === 0) return;
        
        const maxRevenue = Math.max(...chartData.map(d => d.revenue));
        const barWidth = 100 / chartData.length;
        
        container.innerHTML = `
            <div class="chart-bars">
                ${chartData.map(data => {
                    const height = maxRevenue > 0 ? (data.revenue / maxRevenue * 100) : 0;
                    return `
                        <div class="chart-bar" style="width: ${barWidth}%">
                            <div class="bar-value" style="height: ${height}%" 
                                 data-value="${data.formatted}" 
                                 data-label="${data.week}">
                            </div>
                            <div class="bar-label">${data.week}</div>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="chart-tooltip" id="revenue-tooltip"></div>
        `;
    }

    /**
     * Renderiza gráfico de volume
     */
    renderVolumeChart() {
        const chartData = this.cachedData.charts?.volume || [];
        const container = document.getElementById('volume-chart');
        
        if (!container || chartData.length === 0) return;
        
        const maxVolume = Math.max(...chartData.map(d => d.volume));
        
        container.innerHTML = `
            <div class="line-chart-container">
                <div class="line-chart-grid">
                    ${Array.from({length: 5}).map((_, i) => 
                        `<div class="grid-line" style="bottom: ${i * 25}%"></div>`
                    ).join('')}
                </div>
                <svg class="line-chart" viewBox="0 0 100 100" preserveAspectRatio="none">
                    ${this.generateLineChartPath(chartData, maxVolume)}
                </svg>
                <div class="line-chart-labels">
                    ${chartData.map(data => 
                        `<div class="label">${data.day.split('/')[0]}</div>`
                    ).join('')}
                </div>
                <div class="chart-tooltip" id="volume-tooltip"></div>
            </div>
        `;
    }

    /**
     * Gera path SVG para gráfico de linha
     */
    generateLineChartPath(data, maxValue) {
        if (data.length < 2) return '';
        
        const points = data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - (d.volume / maxValue * 100);
            return `${x},${y}`;
        });
        
        return `
            <path d="M ${points.join(' L ')}" 
                  fill="none" 
                  stroke="var(--primary)" 
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round" />
        `;
    }

    /**
     * Renderiza gráfico de categorias
     */
    renderCategoryChart() {
        const categories = this.cachedData.charts?.categories || [];
        const container = document.getElementById('category-chart');
        
        if (!container || categories.length === 0) return;
        
        let cumulativeAngle = 0;
        const total = categories.reduce((sum, cat) => sum + cat.count, 0);
        
        container.innerHTML = `
            <div class="pie-chart">
                ${categories.map(cat => {
                    const percentage = (cat.count / total) * 100;
                    const angle = (percentage / 100) * 360;
                    const startAngle = cumulativeAngle;
                    cumulativeAngle += angle;
                    
                    return `
                        <div class="pie-slice" 
                             style="--start: ${startAngle}deg; --end: ${startAngle + angle}deg; 
                                    background-color: ${this.getCategoryColor(cat.name)};">
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    /**
     * Obtém cor para categoria
     */
    getCategoryColor(category) {
        const colors = {
            'Tela': '#FF6B6B',
            'Bateria': '#4ECDC4',
            'Placa': '#45B7D1',
            'Software': '#96CEB4',
            'Limpeza': '#FFEAA7',
            'Câmera': '#DDA0DD',
            'Conectividade': '#98D8C8',
            'Outros': '#B2B2B2'
        };
        
        return colors[category] || '#6A5ACD';
    }

    /**
     * Configura eventos dos gráficos
     */
    setupChartEvents() {
        // Tooltips para gráfico de faturamento
        const revenueBars = document.querySelectorAll('#revenue-chart .bar-value');
        const revenueTooltip = document.getElementById('revenue-tooltip');
        
        revenueBars.forEach(bar => {
            bar.addEventListener('mouseenter', (e) => {
                const value = e.target.getAttribute('data-value');
                const label = e.target.getAttribute('data-label');
                
                revenueTooltip.innerHTML = `
                    <strong>${label}</strong><br>
                    ${value}
                `;
                revenueTooltip.style.display = 'block';
                
                const rect = e.target.getBoundingClientRect();
                const container = revenueTooltip.parentElement.getBoundingClientRect();
                
                revenueTooltip.style.left = `${rect.left - container.left + rect.width / 2}px`;
                revenueTooltip.style.top = `${rect.top - container.top - 40}px`;
            });
            
            bar.addEventListener('mouseleave', () => {
                revenueTooltip.style.display = 'none';
            });
        });
    }

    /**
     * Atualiza dados do dashboard
     */
    async refreshData() {
        try {
            this.isLoading = true;
            this.showNotification('Atualizando dados do dashboard...', 'info');
            
            await this.initializeData();
            await this.render();
            
            this.showNotification('Dashboard atualizado com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao atualizar dashboard:', error);
            this.showNotification('Erro ao atualizar dashboard', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Muda o intervalo de tempo
     */
    changeTimeRange(range) {
        this.timeRange = range;
        this.refreshData();
    }

    /**
     * Inicia atualização automática
     */
    startAutoRefresh() {
        if (this.config.autoRefresh) {
            this.autoRefreshInterval = setInterval(() => {
                this.refreshData();
            }, this.config.refreshInterval);
        }
    }

    /**
     * Para atualização automática
     */
    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }
    }

    /**
     * Exporta relatório
     */
    exportReport() {
        const reportData = {
            kpis: this.cachedData.kpis,
            charts: this.cachedData.charts,
            insights: this.cachedData.insights,
            generatedAt: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(reportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const link = document.createElement('a');
        link.setAttribute('href', dataUri);
        link.setAttribute('download', `relatorio_dashboard_${new Date().toISOString().split('T')[0]}.json`);
        link.click();
        
        this.showNotification('Relatório exportado com sucesso', 'success');
    }

    /**
     * Formata valor monetário
     */
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    }

    /**
     * Formata data
     */
    formatDate(date, format = 'short') {
        if (!date) return 'N/A';
        
        const d = new Date(date);
        
        if (format === 'short') {
            return d.toLocaleDateString('pt-BR');
        } else if (format === 'relative') {
            const now = new Date();
            const diffMs = now - d;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);
            
            if (diffMins < 1) return 'agora mesmo';
            if (diffMins < 60) return `${diffMins} min atrás`;
            if (diffHours < 24) return `${diffHours}h atrás`;
            if (diffDays === 1) return 'ontem';
            if (diffDays < 7) return `${diffDays} dias atrás`;
            
            return d.toLocaleDateString('pt-BR');
        }
        
        return d.toLocaleDateString('pt-BR');
    }

    /**
     * Mostra estado de carregamento
     */
    showLoading() {
        if (this.elements.container) {
            this.elements.container.innerHTML = `
                <div class="loading-state">
                    <div class="spinner"></div>
                    <p>Carregando dashboard...</p>
                </div>
            `;
        }
    }

    /**
     * Mostra mensagem de erro
     */
    showError(message) {
        if (this.elements.container) {
            this.elements.container.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3>Erro ao carregar dashboard</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="DashboardModule.refreshData()">
                        <i class="fas fa-redo"></i> Tentar Novamente
                    </button>
                </div>
            `;
        }
    }

    /**
     * Mostra notificação
     */
    showNotification(message, type = 'info') {
        if (window.App && typeof App.showNotification === 'function') {
            App.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    /**
     * Dados de fallback para desenvolvimento
     */
    getFallbackKPIs() {
        return {
            revenue: {
                value: 12500,
                label: 'Faturamento Mensal',
                icon: 'fas fa-dollar-sign',
                color: 'success',
                change: '+12.5%',
                trend: 'up',
                formatted: this.formatCurrency(12500)
            },
            pending: {
                value: 8,
                label: 'Serviços Pendentes',
                icon: 'fas fa-clock',
                color: 'warning',
                change: '-3%',
                trend: 'down',
                formatted: '8'
            },
            completed: {
                value: 42,
                label: 'Serviços Concluídos',
                icon: 'fas fa-check-circle',
                color: 'primary',
                change: '+8.2%',
                trend: 'up',
                formatted: '42'
            },
            customers: {
                value: 68,
                label: 'Clientes Ativos',
                icon: 'fas fa-users',
                color: 'info',
                change: '+5.1%',
                trend: 'up',
                formatted: '68'
            },
            averageTicket: {
                value: 297.62,
                label: 'Ticket Médio',
                icon: 'fas fa-receipt',
                color: 'info',
                change: '+2.4%',
                trend: 'up',
                formatted: this.formatCurrency(297.62)
            },
            conversion: {
                value: 84.0,
                label: 'Taxa de Conversão',
                icon: 'fas fa-chart-line',
                color: 'success',
                change: '+1.8%',
                trend: 'up',
                formatted: '84.0%'
            }
        };
    }

    /**
     * Dados de gráficos de fallback
     */
    getFallbackChartData() {
        return {
            revenue: [
                { week: 'Sem 1', revenue: 3200, formatted: 'R$ 3.200,00' },
                { week: 'Sem 2', revenue: 2800, formatted: 'R$ 2.800,00' },
                { week: 'Sem 3', revenue: 4100, formatted: 'R$ 4.100,00' },
                { week: 'Sem 4', revenue: 3700, formatted: 'R$ 3.700,00' },
                { week: 'Sem 5', revenue: 4500, formatted: 'R$ 4.500,00' },
                { week: 'Sem 6', revenue: 3900, formatted: 'R$ 3.900,00' },
                { week: 'Sem 7', revenue: 4200, formatted: 'R$ 4.200,00' },
                { week: 'Sem 8', revenue: 4800, formatted: 'R$ 4.800,00' }
            ],
            volume: Array.from({length: 14}, (_, i) => ({
                day: `${15 + i}/01`,
                date: new Date(2024, 0, 15 + i),
                volume: Math.floor(Math.random() * 10) + 5,
                revenue: Math.floor(Math.random() * 3000) + 1500
            })),
            categories: [
                { name: 'Tela', count: 24, revenue: 10800, percentage: '40.0' },
                { name: 'Bateria', count: 12, revenue: 3000, percentage: '20.0' },
                { name: 'Placa', count: 8, revenue: 2800, percentage: '13.3' },
                { name: 'Software', count: 6, revenue: 1200, percentage: '10.0' },
                { name: 'Limpeza', count: 5, revenue: 400, percentage: '8.3' },
                { name: 'Outros', count: 5, revenue: 800, percentage: '8.3' }
            ]
        };
    }

    /**
     * Insights de fallback
     */
    getFallbackInsights() {
        return {
            topServices: [
                { service: 'Troca de Tela', count: 24 },
                { service: 'Troca de Bateria', count: 12 },
                { service: 'Reparo na Placa', count: 8 },
                { service: 'Limpeza Geral', count: 6 },
                { service: 'Troca de Conector', count: 5 }
            ],
            topModels: [
                { model: 'iPhone 12', count: 15 },
                { model: 'Samsung Galaxy S21', count: 12 },
                { model: 'Xiaomi Mi 11', count: 8 },
                { model: 'Motorola Edge', count: 6 },
                { model: 'iPhone 11', count: 5 }
            ],
            peakHours: '14:00, 16:00',
            trends: {
                revenueGrowth: '12.5',
                orderGrowth: '8.2',
                averageTicketGrowth: '2.4',
                customerRetention: '85.2'
            },
            recommendations: [
                {
                    type: 'success',
                    icon: 'fas fa-star',
                    title: 'Serviço Popular',
                    message: 'Troca de Tela é seu serviço mais solicitado'
                },
                {
                    type: 'info',
                    icon: 'fas fa-users',
                    title: 'Crescimento de Clientes',
                    message: 'Considere campanhas para atrair mais clientes'
                },
                {
                    type: 'warning',
                    icon: 'fas fa-chart-line',
                    title: 'Ticket Médio Baixo',
                    message: 'Ofereça serviços adicionais para aumentar o ticket médio'
                }
            ]
        };
    }

    /**
     * Ordem de exemplo para desenvolvimento
     */
    getSampleOrders() {
        return Array.from({length: 50}, (_, i) => ({
            id: `OS-${1000 + i}`,
            customerId: String(Math.floor(Math.random() * 50) + 1),
            customerName: ['João', 'Maria', 'Carlos', 'Ana', 'Pedro'][Math.floor(Math.random() * 5)] + ' ' +
                        ['Silva', 'Santos', 'Oliveira', 'Souza', 'Lima'][Math.floor(Math.random() * 5)],
            deviceModel: ['iPhone 12', 'Samsung Galaxy S21', 'Xiaomi Mi 11', 'Motorola Edge', 'iPhone 11'][Math.floor(Math.random() * 5)],
            serviceType: ['Troca de Tela', 'Troca de Bateria', 'Reparo na Placa', 'Limpeza Geral', 'Troca de Conector'][Math.floor(Math.random() * 5)],
            totalValue: Math.floor(Math.random() * 500) + 100,
            status: ['pending', 'in_progress', 'completed'][Math.floor(Math.random() * 3)],
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        }));
    }

    /**
     * Métodos estáticos para acesso global
     */
    static async render() {
        if (window.DashboardModule && window.DashboardModule.render) {
            return window.DashboardModule.render();
        }
    }
    
    static refreshData() {
        if (window.DashboardModule && window.DashboardModule.refreshData) {
            window.DashboardModule.refreshData();
        }
    }
    
    static exportReport() {
        if (window.DashboardModule && window.DashboardModule.exportReport) {
            window.DashboardModule.exportReport();
        }
    }
}

// Criar instância única
const dashboardInstance = new DashboardModule();

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => dashboardInstance.init());
} else {
    dashboardInstance.init();
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.DashboardModule = dashboardInstance;
}

// Exportação para módulos ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DashboardModule: dashboardInstance };
}

console.log('✅ dashboard.js carregado com sucesso');