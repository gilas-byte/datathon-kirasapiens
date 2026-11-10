"""Exporta os dados prontos para o frontend React (data/processed/api/*.json).

- Uma versão JSON de cada CSV de data/processed/ (lista de registros; NaN vira null).
- cubo.json: contagens aditivas por região imediata × setor × competência, para o frontend
  filtrar e somar sem precisar do microdado (medianas não somam, por isso ficam de fora).
- manifest.json: lista dos arquivos, colunas, número de linhas e metadados da base.
"""
import json
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data/processed"
API = OUT / "api"


def cubo(ind: pd.DataFrame) -> pd.DataFrame:
    x = ind.assign(adm=ind["admissao"].astype(int),
                   desl=(~ind["admissao"]).astype(int),
                   ped=(~ind["admissao"] & ind["pedido"]).astype(int),
                   adm_superior=(ind["admissao"] & ind["graudeinstrução"].isin({9, 10, 11, 80})).astype(int))
    c = (x.groupby(["regiao_intermediaria", "regiao_imediata", "setor", "competênciamov"], observed=True)
         .agg(admissoes=("adm", "sum"), desligamentos=("desl", "sum"),
              a_pedido=("ped", "sum"), adm_superior=("adm_superior", "sum"))
         .reset_index())
    c["saldo"] = c["admissoes"] - c["desligamentos"]
    return c.rename(columns={"competênciamov": "competencia"})


def _gravar(df: pd.DataFrame, nome: str) -> dict:
    caminho = API / f"{nome}.json"
    df.to_json(caminho, orient="records", force_ascii=False, double_precision=6)
    return {"arquivo": caminho.name, "linhas": len(df), "colunas": list(df.columns)}


def main():
    API.mkdir(parents=True, exist_ok=True)
    ind = pd.read_parquet(OUT / "industria.parquet")
    arquivos = {"cubo": _gravar(cubo(ind), "cubo")}
    for csv in sorted(OUT.glob("*.csv")):
        arquivos[csv.stem] = _gravar(pd.read_csv(csv), csv.stem)

    comp = ind["competênciamov"]
    manifest = {
        "gerado_em": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "base": "Novo CAGED SC, indústria de transformação (CNAE seção C)",
        "janela": {"inicio": int(comp.min()), "fim": int(comp.max())},
        "movimentacoes": len(ind),
        "admissoes": int(ind["admissao"].sum()),
        "desligamentos": int((~ind["admissao"]).sum()),
        "arquivos": arquivos,
    }
    (API / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
    for nome, a in arquivos.items():
        print(f"api/{a['arquivo']:<44} {a['linhas']:>6} linhas")
    return manifest


if __name__ == "__main__":
    main()
