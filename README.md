Markdown
# Metric Flow 📊

Um Dashboard analítico premium e moderno para gestão de dados, análise de vendas e Business Intelligence. Construído com foco na performance, integridade de dados e numa interface de utilizador de excelência (Dark Mode).

## 🚀 Funcionalidades

* **Métricas em Tempo Real:** Cálculo dinâmico de Receita Total, Crescimento, Tickets Médios e Taxas de Conversão baseados em dados reais.
* **Gráficos Interativos (Recharts):**
  * **Line Chart:** Comparação visual elegante entre as Vendas Totais e os Objetivos (Target Sales) com tooltips personalizadas.
  * **Heatmap (Orders by Time):** Mapa de calor desenvolvido de raiz com Tailwind CSS para analisar os picos de atividade de pedidos ao longo da semana.
* **Tabela de Dados Premium:** Listagem de últimos pedidos com indicadores de estado (status) coloridos e design minimalista.
* **Integração Fullstack:** Frontend reativo perfeitamente interligado com uma API robusta e base de dados relacional.

## 💻 Tecnologias Utilizadas

**Frontend:**
* [Next.js](https://nextjs.org/) (React Framework)
* [Tailwind CSS](https://tailwindcss.com/) (Estilização)
* [Recharts](https://recharts.org/) (Visualização de Dados)
* [Lucide React](https://lucide.dev/) (Ícones)

**Backend & Dados:**
* Python / FastAPI (Web Service)
* PostgreSQL (Base de Dados Relacional)

## ⚙️ Como executar o projeto localmente

### 1. Clonar o repositório
```bash
git clone [https://github.com/FerNegreiro/metric-flow-api.git](https://github.com/FerNegreiro/metric-flow-api.git)
2. Configurar o Frontend
Bash
cd frontend-folder
npm install
# Criar ficheiro .env com NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
3. Configurar o Backend
Bash
cd backend-folder
python -m venv venv
source venv/bin/activate  # ou venv\Scripts\activate no Windows
pip install -r requirements.txt
# Configurar credenciais do banco de dados no .env
uvicorn main:app --reload
🌐 Deploy
Frontend: Alojado na [Netlify/Vercel]

Backend: Alojado no [Render]

Base de Dados: PostgreSQL hospedado no [Render]

Desenvolvido com dedicação para elevar o padrão da análise de dados.

