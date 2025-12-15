# IFIX - Sistema de Gestão para Assistência Técnica

## 🚀 Como Usar
1. Crie uma pasta no seu computador chamada `IFIX_System`.
2. Dentro dela, crie a seguinte estrutura de pastas:
   - `modules/`
   - `data/`
3. Salve os arquivos fornecidos em seus respectivos lugares.
4. Abra o `index.html` no seu navegador (Chrome, Edge, Firefox).

## 💾 Sobre o Banco de Dados (SQL/Persistência)
Como você solicitou uma solução apenas com HTML/JS (sem instalar servidores backend), criei um **Motor de Persistência** (`connection_DB.js`).
- Ele salva tudo no **LocalStorage** do navegador.
- **Você pode fechar a aba, desligar o computador e voltar: seus clientes e ordens de serviço estarão lá.**
- Para "zerar" o banco, basta limpar o cache do navegador.

## 📂 Estrutura de Arquivos

### Raiz
- `index.html`: Estrutura visual, CSS (Estilos) e importação de scripts.
- `app.js`: O "Cérebro". Gerencia qual tela aparece e inicializa o sistema.

### Data (Camada de Dados)
- `connection_DB.js`: Simula a conexão SQL. Tem funções como `save`, `findAll`, `create`.
- `Customers_DB.js`: Gerencia a tabela de Clientes.
- `Orders_DB.js`: Gerencia a tabela de Ordens de Serviço.
- `catalog_DB.js`: Gerencia preços e serviços (o antigo `data_bank.js` foi migrado para cá).

### Modules (Telas e Lógica)
- `dashboard.js`: Gráficos e Resumos.
- `sidebar.js`: Menu lateral.
- `Customers.js`: Tela de cadastro/listagem de clientes.
- `serviceOrders.js`: Tela de OS e Checklists.
- `PriceCalculator.js`: A sua calculadora de preços original, adaptada.
- `serviceCatalog.js`: Gerenciamento dos preços.
