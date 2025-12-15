// init.js - Bootstrapper do Sistema

document.addEventListener('DOMContentLoaded', () => {
    console.log('🏁 DOM carregado. Iniciando sistema...');

    // Verificação de segurança: Bancos de dados
    const dbs = ['ConnectionDB', 'Catalog_DB', 'Customers_DB', 'Orders_DB'];
    const missingDBs = dbs.filter(db => !window[db]);
    
    if (missingDBs.length > 0) {
        console.error('❌ Erro Crítico: Bancos de dados não carregados:', missingDBs);
        alert('Erro ao carregar banco de dados. Verifique o console.');
        document.body.classList.remove('app-loading');
        return;
    }

    // Verificação de segurança: App
    if (!window.App) {
        console.error('❌ Erro Crítico: App.js não carregado corretamente.');
        alert('Erro ao carregar a aplicação principal.');
        document.body.classList.remove('app-loading');
        return;
    }

    // Iniciar Aplicação
    window.App.init().catch(err => {
        console.error('❌ Falha fatal na inicialização do App:', err);
        document.body.innerHTML = '<div style="color:white;text-align:center;padding:50px;"><h1>Erro Fatal</h1><p>O sistema não pôde ser iniciado.</p></div>';
    });
});
