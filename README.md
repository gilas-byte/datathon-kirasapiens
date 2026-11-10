<div align="center">

# Raio-X do Mercado de Trabalho de Santa Catarina

**Datathon CDIA 2026 · UniSENAI**

Desafio prático de análise de dados e inteligência artificial, Bacharelado em Ciência de Dados e IA.

![Status](https://img.shields.io/badge/status-em%20andamento-blue)
![Dados](https://img.shields.io/badge/dados-Novo%20CAGED-informational)
![Região](https://img.shields.io/badge/regi%C3%A3o-SC-success)
</div>

---

## Pergunta central

> Quais regiões e setores industriais de SC enfrentam **apagão de mão de obra** ou **expansão acelerada**,
> e como **renda** e **escolaridade** explicam esses gargalos?

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

Ficam em `raw/`.

O `Novo_Caged_MOV_Limpo.csv` (~413 MB) passa do limite de 100 MB por arquivo do GitHub, então não está neste repositório. Baixe no Kaggle:

**[Caged MOV Limpo no Kaggle](https://www.kaggle.com/datasets/guilhermeanselmo/caged-mov-limpo/data)**

Coloque o arquivo baixado em `raw/Novo_Caged_MOV_Limpo.csv`.

| Arquivo | Conteúdo |
|:---:|:---:|
| `Novo_Caged_MOV_Limpo.csv` | Movimentações de emprego em SC nos últimos 12 meses (~3,4 milhões de linhas, separador `;`). Baixar do Kaggle |
| `Municipios_SC_limpo.csv` | Dados demográficos e socioeconômicos dos 296 municípios de SC |
| `Dicionario_de_dados.xlsx` | Documentação das variáveis das bases |

---

## Estrutura

| Pasta | Conteúdo |
|:---:|:---:|
| `docs/` | Material do evento (slides do desafio e Guia do Participante) |
| `raw/` | Dados brutos fornecidos (fora do Git) |
