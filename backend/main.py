"""Ponto de entrada do backend: prepara todos os dados do dashboard.

Uso:
    python backend/main.py                       # todas as etapas
    python backend/main.py estatistica exportar  # só as etapas indicadas

Etapas:
    pipeline     raw/ -> data/processed/ (indicadores e industria.parquet). Precisa do CSV do CAGED;
                 sem ele, a etapa é pulada e as demais usam o industria.parquet já versionado.
    estatistica  insights estatísticos -> data/processed/est_*.csv
    exportar     JSON para o frontend React -> data/processed/api/
"""
import sys
import time

import estatistica
import exportar
import pipeline

ETAPAS = {"pipeline": pipeline.main, "estatistica": estatistica.main, "exportar": exportar.main}


def caged_disponivel() -> bool:
    return (pipeline.RAW / "Novo_Caged_MOV_Limpo.csv").exists() or \
        (pipeline.OUT / "caged_raw.parquet").exists()


def main(etapas: list[str]):
    invalidas = set(etapas) - set(ETAPAS)
    if invalidas:
        sys.exit(f"Etapa(s) desconhecida(s): {', '.join(sorted(invalidas))}. Use: {', '.join(ETAPAS)}")
    for nome in etapas:
        if nome == "pipeline" and not caged_disponivel():
            print("== pipeline: pulado (raw/Novo_Caged_MOV_Limpo.csv ausente; "
                  "usando data/processed/industria.parquet)\n")
            continue
        print(f"== {nome}")
        t0 = time.perf_counter()
        ETAPAS[nome]()
        print(f"   ({time.perf_counter() - t0:.1f}s)\n")


if __name__ == "__main__":
    main(sys.argv[1:] or list(ETAPAS))
