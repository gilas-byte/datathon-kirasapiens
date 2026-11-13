# Frontend: Raio-X do Mercado de Trabalho Industrial de SC

Vite + React + TypeScript + Plotly. Estático: não precisa de servidor.

## Rodar
```bash
cd frontend
npm install
npm run dev        # copia os JSON do backend e abre em localhost
npm run build      # gera frontend/dist (hospedagem estática)
```

## De onde vêm os dados
`npm run sync-data` copia `data/processed/api/*.json` e `data/sc_municipios.geojson` para `public/data` (ignorado pelo git).
Regra: cálculo novo vai em `backend/exportar.py` e sai como JSON. Nada de reimplementar métrica em JS.
No navegador só acontecem **somas** (cubo, histograma de salário, cubo de escolaridade) e filtros.

| Aba | Arquivos |
|---|---|
| KPIs | `cubo.json`, `salario_hist.json`, `ind_regiao_setor.json` |
| Mapa | `ind_municipio.json`, `sc_municipios.geojson`, `cubo.json` |
| Matriz | `ind_regiao_setor.json`, `municipios.json` |
| Macrofamílias | `ind_macrofamilia.json`, `ind_regiao_macrofamilia.json` |
| Renda e escolaridade | `ind_macrofamilia.json`, `escolaridade_cubo.json` |
| Recomendações e método | `log_limpeza.json` |

## Publicar
Push na `main` dispara `.github/workflows/pages.yml` (GitHub Pages). Ative em Settings > Pages > Source: GitHub Actions.
O `public/data` é gerado no build, então os JSON precisam estar versionados em `data/processed/api/`.
