// modules/PriceCalculator.js

const CalculatorModule = {
    // Inicialização do módulo
    init() {
        if (this.initialized) return; // Previne dupla inicialização
        this.cacheElements();
        this.bindEvents();
        this.initialized = true;
        console.log('✅ CalculatorModule inicializado');
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
        // Delegation pattern
        document.addEventListener('click', (e) => {
            if (e.target.matches('.calculate-price-btn') || e.target.closest('.calculate-price-btn')) {
                this.handleCalculate();
            }
            if (e.target.matches('.whatsapp-link')) {
                this.trackWhatsAppClick();
            }
        });

        // Eventos de mudança nos selects - usando delegação para garantir funcionamento após re-render
        document.addEventListener('change', (e) => {
            if (e.target.id === 'calc-model' || e.target.id === 'calc-service') {
                this.clearResult();
            }
        });
    },

    // Renderização principal
    render() {
        if (!this.elements.container) {
            this.cacheElements();
            if (!this.elements.container) return;
        }

        try {
            const data = this.getCatalogData();
            this.elements.container.innerHTML = this.getTemplate(data);
            this.updateCachedElements();
        } catch (error) {
            console.error('Erro no render:', error);
            this.showError('Erro ao carregar calculadora');
        }
    },

    // Obter dados do catálogo
    getCatalogData() {
        if (window.Catalog_DB && typeof window.Catalog_DB.getData === 'function') {
            const data = window.Catalog_DB.getData();
            return {
                models: Array.isArray(data.models) ? data.models : [],
                services: Array.isArray(data.services) ? data.services : [],
                prices: data.prices || {}
            };
        }
        return this.getFallbackData();
    },

    // Dados de fallback caso Catalog_DB não esteja disponível
    getFallbackData() {
        return {
            models: ['iPhone 12', 'Samsung Galaxy S21', 'Xiaomi Mi 11'],
            services: ['Troca de Tela', 'Troca de Bateria'],
            prices: {}
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
                            <select id="calc-model" class="form-select">
                                <option value="" disabled selected>Selecione um modelo...</option>
                                ${this.generateOptions(data.models)}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="calc-service" class="form-label">
                                <i class="fas fa-tools"></i> Tipo de Serviço
                            </label>
                            <select id="calc-service" class="form-select">
                                <option value="" disabled selected>Selecione um serviço...</option>
                                ${this.generateOptions(data.services)}
                            </select>
                        </div>
                    </div>
                    
                    <div class="calculator-actions">
                        <button type="button" class="btn btn-primary calculate-price-btn">
                            <i class="fas fa-search"></i> Consultar Preço
                        </button>
                        <button type="button" class="btn btn-secondary" onclick="CalculatorModule.clearForm()">
                            <i class="fas fa-redo"></i> Limpar
                        </button>
                    </div>
                    
                    <div id="calc-result" class="calculator-result"></div>
                </div>
            </div>
        `;
    },

    generateOptions(items) {
        if (!Array.isArray(items) || items.length === 0) return '';
        return items.map(item => `<option value="${item}">${item}</option>`).join('');
    },

    updateCachedElements() {
        this.elements.modelSelect = document.getElementById('calc-model');
        this.elements.serviceSelect = document.getElementById('calc-service');
        this.elements.resultDiv = document.getElementById('calc-result');
    },

    handleCalculate() {
        const model = document.getElementById('calc-model')?.value;
        const service = document.getElementById('calc-service')?.value;
        
        if (!model || !service) {
            this.showValidationError('Selecione o modelo e o serviço para continuar');
            return;
        }
        
        const price = this.findPrice(model, service);
        
        if (price) {
            this.displayPriceResult(model, service, price);
        } else {
            this.showNoPriceFound(model, service);
        }
    },

    findPrice(model, service) {
        const data = this.getCatalogData();
        if (!data.prices[model]) return null;
        const price = data.prices[model][service];
        return price ? {
            avista: (parseFloat(price.avista) || 0).toFixed(2),
            parcelado: (parseFloat(price.parcelado) || 0).toFixed(2)
        } : null;
    },

    displayPriceResult(model, service, price) {
        const resultDiv = document.getElementById('calc-result');
        if (!resultDiv) return;

        const whatsappLink = this.generateWhatsAppLink(model, service, price.avista);
        
        resultDiv.innerHTML = `
            <div class="price-result success" style="margin-top: 20px; padding: 20px; background: var(--bg-hover); border-radius: 8px; border-left: 4px solid var(--success);">
                <div class="result-header" style="margin-bottom: 15px;">
                    <h3><i class="fas fa-check-circle" style="color: var(--success)"></i> Preço Encontrado</h3>
                </div>
                
                <div class="device-info">
                    <p><strong>Modelo:</strong> ${model}</p>
                    <p><strong>Serviço:</strong> ${service}</p>
                </div>
                
                <div class="price-display" style="display: flex; gap: 20px; margin: 20px 0;">
                    <div class="price-option highlight">
                        <span class="price-label" style="display: block; color: var(--text-secondary)">À Vista</span>
                        <span class="price-value" style="font-size: 1.5rem; font-weight: bold; color: var(--success)">R$ ${price.avista}</span>
                    </div>
                    
                    <div class="price-option">
                        <span class="price-label" style="display: block; color: var(--text-secondary)">Parcelado</span>
                        <span class="price-value" style="font-size: 1.5rem; font-weight: bold;">R$ ${price.parcelado}</span>
                    </div>
                </div>
                
                <a href="${whatsappLink}" target="_blank" class="btn btn-success whatsapp-link">
                    <i class="fab fa-whatsapp"></i> Agendar no WhatsApp
                </a>
            </div>
        `;
    },

    generateWhatsAppLink(model, service, price) {
        const phoneNumber = "5515991630531";
        const message = `Olá! Gostaria de um orçamento para ${service} no ${model}. Valor à vista: R$ ${price}`;
        return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    },

    showNoPriceFound(model, service) {
        const resultDiv = document.getElementById('calc-result');
        if (resultDiv) {
            resultDiv.innerHTML = `
                <div class="price-result warning" style="margin-top: 20px; padding: 20px; background: var(--bg-hover); border-radius: 8px; border-left: 4px solid var(--warning);">
                    <h3>Preço não cadastrado</h3>
                    <p>Não encontramos preço para <strong>${service}</strong> no modelo <strong>${model}</strong>.</p>
                </div>
            `;
        }
    },

    showValidationError(message) {
        const resultDiv = document.getElementById('calc-result');
        if (resultDiv) {
            resultDiv.innerHTML = `<p style="color: var(--danger); margin-top: 10px;">${message}</p>`;
        }
    },

    showError(message) {
        const resultDiv = document.getElementById('calc-result');
        if (resultDiv) {
            resultDiv.innerHTML = `<p style="color: var(--danger); margin-top: 10px;">${message}</p>`;
        }
    },

    clearForm() {
        const m = document.getElementById('calc-model');
        const s = document.getElementById('calc-service');
        if(m) m.value = "";
        if(s) s.value = "";
        this.clearResult();
    },

    clearResult() {
        const resultDiv = document.getElementById('calc-result');
        if (resultDiv) resultDiv.innerHTML = '';
    },

    trackWhatsAppClick() {
        console.log('Clique no WhatsApp registrado');
    }
};

// Auto-inicialização segura
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CalculatorModule.init());
} else {
    CalculatorModule.init();
}

if (typeof window !== 'undefined') {
    window.CalculatorModule = CalculatorModule;
}