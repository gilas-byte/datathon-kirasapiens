# Raio-X do Mercado de Trabalho de Santa Catarina

Análise do mercado de trabalho industrial catarinense com dados do Novo CAGED, indicadores territoriais e painéis em React e Streamlit.
Projeto acadêmico do Datathon CDIA 2026 · UniSENAI.

![Status](https://img.shields.io/badge/status-concluido-blue) ![Python](https://img.shields.io/badge/python-3.11%2B-informational) ![Dados](https://img.shields.io/badge/dados-Novo%20CAGED-informational) ![Região](https://img.shields.io/badge/regi%C3%A3o-SC-success)

## Pergunta central

> Quais regiões e setores industriais de SC enfrentam **apagão de mão de obra** ou **expansão acelerada**,
> e como **renda** e **escolaridade** explicam esses gargalos?

## O que faz

Investiga quais regiões e setores industriais de SC apresentam pressão de retenção ou expansão acelerada, e como renda e escolaridade se relacionam com esses padrões.

- Limpa e cruza movimentações do Novo CAGED com dados municipais e regiões do IBGE.
- Calcula indicadores de emprego, salário, escolaridade e desligamentos a pedido, com diagnósticos por região, setor e macrofamília ocupacional.
- Disponibiliza mapas, matrizes e recomendações em um frontend estático React/TypeScript e em um dashboard Streamlit.
- Inclui análise estatística, testes de sensibilidade e um agrupamento de CBOs por IA já versionado e revisado pela equipe.

### Limitações

- O CAGED mede **fluxo** de admissões e desligamentos, não estoque de empregos nem vagas abertas. Por isso o "apagão" é inferido pelo comportamento de retenção e salário.
- A base MOV não traz o estoque de vínculos ativos; a **rotatividade bruta** usa a população residente como proxy de estoque e, portanto, mede a intensidade de movimentação por habitante — não o turnover dos empregados já contratados.
- Só foi fornecida a base MOV; não houve desconto das exclusões (EXC).
- O prêmio salarial tende a ser negativo, porque quem sai tem mais tempo de casa. O sinal está na comparação entre setores e regiões.
- O índice é relativo à própria indústria catarinense e não deve ser comparado com outros estados.
- A janela analisada é fixa: setembro de 2025 a agosto de 2026. Não há atualização automática nem previsão de vagas; as associações estatísticas não demonstram causalidade.

Os achados, a metodologia e o dicionário das saídas estão em [docs/analise.md](docs/analise.md). Equipe, cronograma e entregáveis estão em [docs/evento.md](docs/evento.md).

## Estrutura do repositório

| Pasta | Conteúdo |
|---|---|
| `docs/` | Material do evento (slides do desafio e Guia do Participante), equipe, análise e metodologia |
| `raw/` | Dados brutos fornecidos (o CAGED fica fora do Git) |
| `backend/` | Pipeline em Python: `main.py` (ponto de entrada, por etapas), `pipeline.py` (carga, limpeza, junção e exportação), `indicadores.py` (indicadores e diagnóstico), `estatistica.py` (renda × escolaridade × pedido, sensibilidade do Índice de Pressão e sazonalidade), `exportar.py` (JSON para o frontend em `data/processed/api/`), `cbo_llm.py` (prompt e API de IA para as CBOs), `geojson_sc.py` (malha de SC) |
| `tests/` | Testes de consistência do backend (`pytest tests/`) |
| `frontend/` | Frontend da aplicação em React (TypeScript) |
| `dashboard/` | Dashboard analítico em Python (Streamlit): `app.py`, com 5 abas (mapa, matriz, macrofamílias, renda e escolaridade, recomendações) |
| `data/` | Apoio: regiões do IBGE, malha municipal, macrofamílias de CBO e `processed/` (saídas do pipeline que alimentam o dashboard) |
| `notebooks/` | Notebook documentado com o pipeline completo e as saídas |
| `requirements.txt` e `iniciar.bat` | Dependências Python e inicialização do frontend no Windows |

## Como rodar

Execute os comandos a partir da raiz do repositório, salvo quando indicado. Os dados processados já estão versionados: não é necessário baixar o CSV bruto nem usar uma chave de API para abrir os painéis.

### Frontend React

Requer Node.js `^20.19.0 || >=22.12.0` e npm, conforme `frontend/package.json`.

```bash
cd frontend
npm ci
npm run dev
```

Abra o endereço local exibido pelo Vite. O script `dev` sincroniza os JSON de `data/processed/api/` e a malha municipal para `frontend/public/data/` antes de iniciar o painel.

Para gerar e visualizar o build estático, dentro de `frontend/`:

```bash
npm run build
npm run preview
```

O build fica em `frontend/dist/`. No Windows, `iniciar.bat` também instala as dependências e inicia o frontend. Mais detalhes em [frontend/README.md](frontend/README.md).

### Dashboard Streamlit e backend Python

Use Python 3.11+ em um ambiente virtual:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
streamlit run dashboard/app.py
```

A ativação acima é para Linux/macOS; no PowerShell, use `.venv\Scripts\Activate.ps1`. O Streamlit lê diretamente `data/processed/`.

Para recalcular os dados, a partir da raiz e com o ambiente Python ativo:

```bash
python backend/main.py
```

O comando executa `pipeline`, `estatistica` e `exportar`. Sem o CSV bruto e sem o cache `data/processed/caged_raw.parquet`, pula o pipeline e usa o `industria.parquet` versionado nas demais etapas. Para executar apenas estatística e exportação:

```bash
python backend/main.py estatistica exportar
```

Depois de regenerar os JSON, reinicie `npm run dev` ou execute `npm run build` em `frontend/` para sincronizar os dados do frontend.

### Dados de entrada

Ficam em `raw/`.

O `Novo_Caged_MOV_Limpo.csv` (~413 MB) passa do limite de 100 MB por arquivo do GitHub, então não está neste repositório. Baixe no Kaggle:

**[Caged MOV Limpo no Kaggle](https://www.kaggle.com/datasets/guilhermeanselmo/caged-mov-limpo/data)**

Coloque o arquivo baixado em `raw/Novo_Caged_MOV_Limpo.csv`.

| Arquivo | Conteúdo |
|:---:|:---:|
| `Novo_Caged_MOV_Limpo.csv` | Movimentações de emprego em SC nos últimos 12 meses (~3,4 milhões de linhas, separador `;`). Baixar do Kaggle |
| `Municipios_SC_limpo.csv` | Dados demográficos e socioeconômicos dos 295 municípios de SC |
| `Dicionario_de_dados.xlsx` | Documentação das variáveis das bases |

### Agrupamento por IA (opcional)

O painel e o pipeline usam `data/cbo_macrofamilias.csv`, que já está versionado. Para regenerá-lo, `backend/cbo_llm.py` requer o cache `data/processed/caged_raw.parquet` produzido pelo pipeline, o dicionário Excel e a variável de ambiente `ANTHROPIC_API_KEY`.

Com esses pré-requisitos disponíveis:

```bash
python backend/cbo_llm.py
```

Essa etapa envia os títulos de ocupações à API da Anthropic e pode gerar cobrança. O script lê a chave do ambiente; não carrega `.env` automaticamente. O prompt está em [backend/cbo_llm.py](backend/cbo_llm.py), e o resultado em [data/cbo_macrofamilias.csv](data/cbo_macrofamilias.csv). O método de classificação em 16 macrofamílias está descrito em [docs/analise.md](docs/analise.md).

### Testes

Com as dependências Python instaladas, execute na raiz:

```bash
pytest tests/
```

Os testes usam os dados processados versionados, sem precisar do CSV bruto ou da API de IA.

## Status

Estudo — projeto acadêmico concluído, com scripts, dados processados e painéis disponíveis no repositório.

## Licença

O repositório não contém arquivo `LICENSE`; não há licença de uso declarada.
