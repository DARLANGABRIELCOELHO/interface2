// modules/PriceCalculator.js

const CalculatorModule = {
    // Inicialização do módulo
    init() {
        this.cacheElements();
        this.bindEvents();
    },

    // Cache de elementos DOM
    cacheElements() {
        this.elements = {
            container: document.getElementById('calculator-view'),
            modelSelect: null,
            serviceSelect: null,
            resultDiv: null,
            calculateBtn: null
        };
    },

    // Vinculação de eventos
    bindEvents() {
        // Delegation pattern para lidar com elementos dinâmicos
        document.addEventListener('click', (e) => {
            if (e.target.matches('.calculate-price-btn')) {
                this.handleCalculate();
            }
            if (e.target.matches('.whatsapp-link')) {
                this.trackWhatsAppClick();
            }
        });

        // Eventos de mudança nos selects
        document.addEventListener('change', (e) => {
            if (e.target.matches('#calc-model') || e.target.matches('#calc-service')) {
                this.clearResult();
            }
        });
    },

    // Renderização principal
    render() {
        if (!this.elements.container) {
            console.error('Container não encontrado');
            return;
        }

        try {
            const data = this.getCatalogData();
            
            this.elements.container.innerHTML = this.getTemplate(data);
            
            // Atualizar cache após renderizar
            this.updateCachedElements();
            
            // Adicionar evento ao botão
            const btn = this.elements.container.querySelector('.calculate-price-btn');
            if (btn) {
                btn.addEventListener('click', () => this.handleCalculate());
            }
            
        } catch (error) {
            this.showError('Erro ao carregar calculadora');
            console.error('Erro no render:', error);
        }
    },

    // Obter dados do catálogo
    getCatalogData() {
        try {
            // Verificar se Catalog_DB existe
            if (typeof Catalog_DB === 'undefined') {
                console.warn('Catalog_DB não definido. Usando dados de fallback.');
                return this.getFallbackData();
            }
            
            const data = Catalog_DB.getData();
            
            // Validar estrutura dos dados
            if (!data || typeof data !== 'object') {
                throw new Error('Dados do catálogo inválidos');
            }
            
            return {
                models: Array.isArray(data.models) ? data.models : [],
                services: Array.isArray(data.services) ? data.services : [],
                prices: data.prices && typeof data.prices === 'object' ? data.prices : {}
            };
            
        } catch (error) {
            console.warn('Erro ao obter dados do catálogo:', error);
            return this.getFallbackData();
        }
    },

    // Dados de fallback caso Catalog_DB não esteja disponível
    getFallbackData() {
        return {
            models: ['iPhone 12', 'Samsung Galaxy S21', 'Xiaomi Mi 11', 'Motorola Edge'],
            services: ['Troca de Tela', 'Troca de Bateria', 'Reparo na Placa', 'Limpeza Geral'],
            prices: {
                'iPhone 12': {
                    'Troca de Tela': { avista: 450.00, parcelado: 500.00 },
                    'Troca de Bateria': { avista: 250.00, parcelado: 280.00 }
                },
                'Samsung Galaxy S21': {
                    'Troca de Tela': { avista: 400.00, parcelado: 450.00 },
                    'Reparo na Placa': { avista: 350.00, parcelado: 400.00 }
                }
            }
        };
    },

    // Template HTML
    getTemplate(data) {
        return `
            <div class="calculator-container">
                <div class="calculator-header">
                    <h1><i class="fas fa-calculator"></i> Calculadora de Preços</h1>
                    <p class="subtitle">Consulte preços e gere orçamentos automaticamente</p>
                </div>
                
                <div class="card calculator-card">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="calc-model" class="form-label">
                                <i class="fas fa-mobile-alt"></i> Modelo do Aparelho
                            </label>
                            <select id="calc-model" class="form-select" aria-label="Selecione o modelo">
                                <option value="" disabled selected>Selecione um modelo...</option>
                                ${this.generateOptions(data.models, 'modelo')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="calc-service" class="form-label">
                                <i class="fas fa-tools"></i> Tipo de Serviço
                            </label>
                            <select id="calc-service" class="form-select" aria-label="Selecione o serviço">
                                <option value="" disabled selected>Selecione um serviço...</option>
                                ${this.generateOptions(data.services, 'serviço')}
                            </select>
                        </div>
                    </div>
                    
                    <div class="calculator-actions">
                        <button type="button" class="btn btn-primary calculate-price-btn" aria-label="Consultar preço">
                            <i class="fas fa-search"></i> Consultar Preço
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="CalculatorModule.clearForm()">
                            <i class="fas fa-redo"></i> Limpar
                        </button>
                    </div>
                    
                    <div id="calc-result" class="calculator-result" role="region" aria-live="polite"></div>
                </div>
                
                <div class="calculator-help">
                    <h3><i class="fas fa-question-circle"></i> Como funciona?</h3>
                    <ol>
                        <li>Selecione o modelo do aparelho</li>
                        <li>Escolha o serviço necessário</li>
                        <li>Clique em "Consultar Preço"</li>
                        <li>Use o botão WhatsApp para agendar</li>
                    </ol>
                </div>
            </div>
        `;
    },

    // Gerar options para selects
    generateOptions(items, type) {
        if (!Array.isArray(items) || items.length === 0) {
            return `<option value="" disabled>Nenhum ${type} cadastrado</option>`;
        }
        
        return items.map(item => 
            `<option value="${this.escapeHtml(item)}">${this.escapeHtml(item)}</option>`
        ).join('');
    },

    // Atualizar elementos em cache após render
    updateCachedElements() {
        this.elements.modelSelect = document.getElementById('calc-model');
        this.elements.serviceSelect = document.getElementById('calc-service');
        this.elements.resultDiv = document.getElementById('calc-result');
    },

    // Manipulador principal de cálculo
    handleCalculate() {
        try {
            const model = this.elements.modelSelect?.value;
            const service = this.elements.serviceSelect?.value;
            
            // Validação
            if (!model || !service) {
                this.showValidationError('Selecione o modelo e o serviço para continuar');
                return;
            }
            
            // Buscar preço
            const price = this.findPrice(model, service);
            
            // Exibir resultado
            if (price) {
                this.displayPriceResult(model, service, price);
            } else {
                this.showNoPriceFound(model, service);
            }
            
        } catch (error) {
            console.error('Erro ao calcular preço:', error);
            this.showError('Ocorreu um erro ao calcular o preço');
        }
    },

    // Buscar preço nos dados
    findPrice(model, service) {
        const data = this.getCatalogData();
        
        // Verificar se o modelo existe
        if (!data.prices[model]) {
            return null;
        }
        
        // Verificar se o serviço existe para o modelo
        const price = data.prices[model][service];
        
        if (!price || typeof price !== 'object') {
            return null;
        }
        
        // Validar estrutura do preço
        return {
            avista: this.formatPrice(price.avista),
            parcelado: this.formatPrice(price.parcelado)
        };
    },

    // Exibir resultado de preço encontrado
    displayPriceResult(model, service, price) {
        const whatsappLink = this.generateWhatsAppLink(model, service, price.avista);
        
        this.elements.resultDiv.innerHTML = `
            <div class="price-result success">
                <div class="result-header">
                    <h3><i class="fas fa-check-circle"></i> Preço Encontrado</h3>
                    <span class="badge badge-success">Disponível</span>
                </div>
                
                <div class="device-info">
                    <p><strong>Modelo:</strong> ${this.escapeHtml(model)}</p>
                    <p><strong>Serviço:</strong> ${this.escapeHtml(service)}</p>
                </div>
                
                <div class="price-display">
                    <div class="price-option highlight">
                        <span class="price-label">À Vista</span>
                        <span class="price-value">R$ ${price.avista}</span>
                        <span class="price-savings">Economize R$ ${(parseFloat(price.parcelado) - parseFloat(price.avista)).toFixed(2)}</span>
                    </div>
                    
                    <div class="price-option">
                        <span class="price-label">Parcelado</span>
                        <span class="price-value">R$ ${price.parcelado}</span>
                        <span class="price-installments">Em até 12x</span>
                    </div>
                </div>
                
                <div class="result-actions">
                    <a href="${whatsappLink}" 
                       target="_blank" 
                       class="btn btn-success whatsapp-link"
                       aria-label="Agendar serviço no WhatsApp">
                        <i class="fab fa-whatsapp"></i> Agendar no WhatsApp
                    </a>
                    
                    <button type="button" class="btn btn-outline" onclick="CalculatorModule.showDetails('${this.escapeHtml(model)}', '${this.escapeHtml(service)}')">
                        <i class="fas fa-info-circle"></i> Mais Detalhes
                    </button>
                </div>
                
                <div class="result-footer">
                    <small><i class="fas fa-shield-alt"></i> Inclui garantia de 90 dias</small>
                </div>
            </div>
        `;
    },

    // Gerar link do WhatsApp
    generateWhatsAppLink(model, service, price) {
        const phoneNumber = "5515991630531";
        const message = `Olá! Gostaria de solicitar um orçamento para:\n\n` +
                       `📱 *Modelo:* ${model}\n` +
                       `🔧 *Serviço:* ${service}\n` +
                       `💰 *Valor à vista:* R$ ${price}\n\n` +
                       `Podemos agendar uma avaliação?`;
        
        return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    },

    // Exibir quando não encontrar preço
    showNoPriceFound(model, service) {
        this.elements.resultDiv.innerHTML = `
            <div class="price-result warning">
                <div class="result-header">
                    <h3><i class="fas fa-exclamation-triangle"></i> Preço não cadastrado</h3>
                </div>
                
                <div class="warning-content">
                    <p>O serviço <strong>${this.escapeHtml(service)}</strong> para o modelo <strong>${this.escapeHtml(model)}</strong> ainda não possui preço cadastrado.</p>
                    
                    <div class="suggestions">
                        <p><strong>Sugestões:</strong></p>
                        <ul>
                            <li>Verifique outros modelos similares</li>
                            <li>Entre em contato para um orçamento personalizado</li>
                            <li>Consulte nosso catálogo completo de serviços</li>
                        </ul>
                    </div>
                    
                    <div class="warning-actions">
                        <button type="button" class="btn btn-primary" onclick="SidebarModule.navigateTo('serviceCatalog')">
                            <i class="fas fa-book"></i> Ver Catálogo
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // Mostrar erro de validação
    showValidationError(message) {
        this.elements.resultDiv.innerHTML = `
            <div class="price-result error" role="alert">
                <i class="fas fa-exclamation-circle"></i>
                <p>${this.escapeHtml(message)}</p>
            </div>
        `;
    },

    // Mostrar erro genérico
    showError(message) {
        this.elements.resultDiv.innerHTML = `
            <div class="price-result error" role="alert">
                <i class="fas fa-times-circle"></i>
                <p>${this.escapeHtml(message)}</p>
                <button type="button" class="btn btn-small" onclick="CalculatorModule.render()">
                    Tentar Novamente
                </button>
            </div>
        `;
    },

    // Limpar resultado
    clearResult() {
        if (this.elements.resultDiv) {
            this.elements.resultDiv.innerHTML = '';
        }
    },

    // Limpar formulário
    clearForm() {
        if (this.elements.modelSelect) this.elements.modelSelect.value = '';
        if (this.elements.serviceSelect) this.elements.serviceSelect.value = '';
        this.clearResult();
        
        // Focar no primeiro campo
        this.elements.modelSelect?.focus();
    },

    // Mostrar detalhes do serviço
    showDetails(model, service) {
        alert(`Detalhes do serviço:\n\nModelo: ${model}\nServiço: ${service}\n\nEsta função será expandida na próxima versão.`);
    },

    // Rastrear clique no WhatsApp
    trackWhatsAppClick() {
        console.log('Clique no WhatsApp registrado');
        // Aqui pode ser implementado tracking com Google Analytics, etc.
    },

    // Utilitários
    formatPrice(value) {
        if (!value && value !== 0) return '0.00';
        const num = parseFloat(value);
        return isNaN(num) ? '0.00' : num.toFixed(2);
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Métodos públicos para acesso externo
    calculatePrice(model, service) {
        if (!model || !service) {
            throw new Error('Modelo e serviço são obrigatórios');
        }
        
        const price = this.findPrice(model, service);
        return price || null;
    },

    // Método para atualização em tempo real
    refreshData() {
        this.clearForm();
        this.render();
    }
};

// Auto-inicialização quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CalculatorModule.init());
} else {
    CalculatorModule.init();
}

// Exportar para uso global (se necessário)
if (typeof window !== 'undefined') {
    window.CalculatorModule = CalculatorModule;
}