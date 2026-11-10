<div align="center">

# Raio-X do Mercado de Trabalho de Santa Catarina

**Datathon CDIA 2026 · UniSENAI**

Desafio prático de análise de dados e inteligência artificial, Bacharelado em Ciência de Dados e IA.

![Status](https://img.shields.io/badge/status-em%20andamento-blue)
![Python](https://img.shields.io/badge/python-3.11%2B-informational)
![Dados](https://img.shields.io/badge/dados-Novo%20CAGED-informational)
![Região](https://img.shields.io/badge/regi%C3%A3o-SC-success)
</div>

---

## Pergunta central

> Quais regiões e setores industriais de SC enfrentam **apagão de mão de obra** ou **expansão acelerada**,
> e como **renda** e **escolaridade** explicam esses gargalos?

---

## Equipe

| Integrante | Papel | Responsável por |
|---|---|---|
| Samuel | Product Owner | Pergunta de negócio, recomendações, slides do pitch e hospedagem (Replit, se necessário) |
| Filipe | Visualização de dados | Evolução do dashboard, em especial as visualizações de raio/círculo (bolhas) e os mapas de calor |
| Vinicius | Backend, estatística e QA | Insights estatísticos (`backend/indicadores.py`, notebook) e testes finais de todo o projeto |
| Guilherme | Front e Git | Front do dashboard (`frontend/app.py`), controle de versão e documentação |
| Bernardo | Front e Git | Front do dashboard (`frontend/app.py`), controle de versão e otimização |

**Stack:** Python, com pandas e pyarrow (dados), Plotly e Streamlit (dashboard), Jupyter (notebook) e o SDK da Anthropic (agrupamento de CBOs por IA).

---

## Principais achados

| # | Achado | Evidência |
|---|---|---|
| 1 | **A indústria girou o quadro sem crescer** | 835.776 movimentações na indústria de transformação em 12 meses para um saldo de apenas **+1.098** vagas |
| 2 | **O crescimento é operacional e se concentra no Oeste e em Itajaí** | A região intermediária de Chapecó soma +3.748 vagas, e as regiões imediatas de Itajaí (+2.558) e Chapecó (+2.351) lideram. Ocupações operacionais: +6.326. Técnicos: −2.729, gestão: −1.699, nível superior: −800 |
| 3 | **O apagão é de retenção, não de diploma** | Agroindústria, produção de base, têxtil e vestuário: cerca de 55 a 60% dos desligamentos são **a pedido** do trabalhador, salário de admissão de R$ 2,0 a 2,2 mil e menos de 2% dos admitidos com ensino superior |
| 4 | **Polos em alerta** | Pares região × setor com *apagão* ou *expansão sob pressão*: alimentos em Joaçaba, São Miguel do Oeste e Mafra; vestuário em Ibirama e Ituporanga; veículos em São Bento do Sul e Tubarão |
| 5 | **Polos em expansão acelerada** | Alimentos em Chapecó, Concórdia, Xanxerê e Criciúma; têxtil em Brusque; máquinas e materiais elétricos em Joinville e Blumenau; veículos e equipamentos de transporte em Itajaí |

---

## O que o desafio pede

| Eixo | Descrição |
|:---:|:---:|
| Visão territorial | Mapear os polos industriais e analisar a rotatividade por região |
| Agrupamento por IA | Categorizar os CBOs (ocupações) em macro famílias |
| Data storytelling | Dashboard executivo com recomendações práticas e acionáveis |

---

## Entregáveis

| Item | Status |
|:---:|:---:|
| Scripts ou notebook da análise | pendente |
| Painel analítico (dashboard) | pendente |
| Pitch de 3 minutos em slides | pendente |

Todas as entregas saem deste repositório Git público.

---

## Cronograma

| Data | Horário | Etapa |
|:---:|:---:|:---:|
| 10/11 | 10:00 - 11:40 | Montagem dos grupos e início do desenvolvimento |
| 13/11 | 08:30 - 09:50 | Elaboração dos pitches |
| 13/11 | 10:00 - 11:40 | Apresentação dos pitches (3 min) para a banca |

Grupos de 5 estudantes (2ª e 4ª fase). Banca formada por especialistas de empresas parceiras.

---

## Dados

Ficam em `raw/`. A base do CAGED (~400 MB) não é versionada, porque passa do limite do GitHub (ver `.gitignore`): baixe-a do repositório oficial do desafio e coloque em `raw/`. As outras duas bases são pequenas e estão no Git.

| Arquivo | Conteúdo |
|:---:|:---:|
| `Novo_Caged_MOV_Limpo.csv` | Movimentações de emprego em SC nos últimos 12 meses (~3,4 milhões de linhas, separador `;`) |
| `Municipios_SC_limpo.csv` | Dados demográficos e socioeconômicos dos 295 municípios de SC |
| `Dicionario_de_dados.xlsx` | Documentação das variáveis das bases |

---

## Estrutura

| Pasta | Conteúdo |
|:---:|:---:|
| `docs/` | Material do evento (slides do desafio e Guia do Participante) |
| `raw/` | Dados brutos fornecidos (o CAGED fica fora do Git) |
| `backend/` | Pipeline em Python: `main.py` (ponto de entrada), `pipeline.py` (carga, limpeza, junção e exportação), `indicadores.py` (indicadores e diagnóstico), `cbo_llm.py` (prompt e API de IA para as CBOs) |
| `frontend/` | Dashboard Streamlit: `app.py` (5 abas: mapa, matriz, macrofamílias, renda e escolaridade, recomendações) |
| `data/` | Apoio: regiões do IBGE, malha municipal, macrofamílias de CBO e `processed/` (saídas do pipeline que alimentam o dashboard) |
| `notebooks/` | Notebook documentado com o pipeline completo e as saídas |

---

## Como rodar

```bash
pip install -r requirements.txt

# 1. Coloque Novo_Caged_MOV_Limpo.csv em raw/ e gere os indicadores
python backend/main.py

# 2. Abra o dashboard (funciona mesmo sem o CSV bruto, porque lê data/processed/)
streamlit run frontend/app.py
```

---

## Metodologia

**Limpeza** (volumetria em `data/processed/log_limpeza.csv`)
- 3.397.416 registros → janela de 12 competências (set/2025 a ago/2026) → remoção de categorias e movimentações não identificadas → **835.776 movimentações na indústria de transformação** (CNAE seção C).
- Salário só entra nas comparações se estiver entre R$ 800 e R$ 60 mil, com jornada de pelo menos 30h e sem contratos intermitentes, de aprendiz ou parciais.

**Junção territorial**
- O código de município do CAGED tem 6 dígitos, e o do IBGE tem 7. A junção usa `cod_ibge // 10`.
- As regiões são as **7 intermediárias e 24 imediatas** oficiais do IBGE.
- A população é a estimativa do IBGE para 2026.

**Agrupamento de CBOs por IA**
- Os 1.467 CBOs presentes na indústria pertencem a 177 subgrupos. Para cada subgrupo, um LLM (Claude) recebeu os títulos das ocupações mais frequentes e classificou o subgrupo em uma de **16 macrofamílias** fechadas.
- O prompt e o código para regenerar a classificação via API estão em `backend/cbo_llm.py`. O resultado foi revisado pela equipe.

**Indicadores**

| Indicador | Definição |
|---|---|
| Saldo por 10 mil hab. | (admissões − desligamentos) ÷ população × 10.000 |
| % desligamentos a pedido | desligamentos do tipo 40 ÷ total de desligamentos |
| Índice de reposição | desligamentos ÷ admissões |
| Prêmio salarial ajustado | média, ponderada pelas admissões, de log(mediana da admissão ÷ mediana do desligamento) **dentro da mesma CBO** |
| **Índice de pressão (apagão)** | média dos z-scores dos três indicadores acima |
| **Índice de expansão** | z-score do saldo por 10 mil hab. |

**Diagnóstico** (aplicado a recortes com pelo menos 300 movimentações):
- pressão ≥ 0,5 → *Apagão*
- expansão ≥ 0,5 → *Expansão acelerada*
- ambos ≥ 0,5 → *Expansão sob pressão*
- expansão ≤ −0,5 → *Retração*
- demais casos → *Estável*

---

## Limites da análise
- O CAGED mede **fluxo** de admissões e desligamentos, não estoque de empregos nem vagas abertas. Por isso o "apagão" é inferido pelo comportamento de retenção e salário.
- Só foi fornecida a base MOV; não houve desconto das exclusões (EXC).
- O prêmio salarial tende a ser negativo, porque quem sai tem mais tempo de casa. O sinal está na comparação entre setores e regiões.
- O índice é relativo à própria indústria catarinense e não deve ser comparado com outros estados.

---

## Fontes
- Novo CAGED: Ministério do Trabalho e Emprego (base do desafio)
- IBGE: Cidades@ (base municipal do desafio) e Divisão Regional do Brasil em Regiões Geográficas Imediatas e Intermediárias (2017)
- Malha municipal: [tbrugz/geodata-br](https://github.com/tbrugz/geodata-br)
