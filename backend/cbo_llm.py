"""
Agrupamento de CBOs em macrofamílias com IA generativa.

Como funciona
-------------
1. Para cada subgrupo de CBO (3 primeiros dígitos) presente na indústria,
   coletamos os títulos das ocupações mais frequentes no CAGED.
2. Enviamos essa lista a um LLM com um conjunto fechado de macrofamílias
   e pedimos uma classificação em JSON.
3. O resultado vira `data/cbo_macrofamilias.csv`, usado pelo pipeline.

O arquivo versionado no repositório foi gerado com o Claude (Anthropic)
seguindo este mesmo prompt e revisado pela equipe. Para regenerar:

    export ANTHROPIC_API_KEY=...
    python backend/cbo_llm.py

Requer: pip install anthropic pandas pyarrow openpyxl
"""
import json
import os
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]

MACROFAMILIAS = [
    "Gestão e Liderança",
    "Engenharia, TI e P&D",
    "Técnicos Industriais e Qualidade",
    "Supervisão de Produção (Mestres e Encarregados)",
    "Administrativo, Comercial e Negócios",
    "Logística e Movimentação",
    "Produção de Base (Linha e Embalagem)",
    "Agroindústria e Alimentos",
    "Têxtil, Vestuário, Couro e Calçados",
    "Metalmecânica e Montagem",
    "Processos Químicos, Plásticos, Papel e Cerâmica",
    "Madeira e Móveis",
    "Manutenção Industrial",
    "Construção e Extração Mineral",
    "Agropecuária, Pesca e Florestal",
    "Serviços de Apoio",
]

PROMPT = """Você é especialista na Classificação Brasileira de Ocupações (CBO 2002)
e no parque industrial de Santa Catarina.

Classifique cada subgrupo de CBO abaixo em EXATAMENTE UMA das macrofamílias:
{familias}

Regras:
- Use os títulos de ocupação como evidência principal.
- Mestres, encarregados e supervisores de produção vão para
  "Supervisão de Produção (Mestres e Encarregados)".
- Ocupações de nível superior em engenharia, TI, química e design de produto
  vão para "Engenharia, TI e P&D".
- Responda SOMENTE com JSON no formato {{"<subgrupo>": "<macrofamília>", ...}}.

Subgrupos:
{subgrupos}
"""


def montar_entrada(caged: pd.DataFrame, dic_cbo: pd.DataFrame, top: int = 5) -> str:
    nomes = dict(zip(dic_cbo["cod"], dic_cbo["desc"]))
    c = caged.assign(sub=caged["cbo2002ocupação"] // 1000)
    freq = c.groupby(["sub", "cbo2002ocupação"]).size().reset_index(name="n")
    linhas = []
    for sub, g in freq.sort_values("n", ascending=False).groupby("sub"):
        titulos = [str(nomes.get(x, "?")) for x in g["cbo2002ocupação"].head(top)]
        linhas.append(f"{sub}: " + "; ".join(titulos))
    return "\n".join(linhas)


def classificar(texto_subgrupos: str, modelo: str = "claude-sonnet-5-5") -> dict:
    import anthropic

    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    msg = client.messages.create(
        model=modelo,
        max_tokens=8000,
        messages=[{
            "role": "user",
            "content": PROMPT.format(
                familias="\n".join(f"- {f}" for f in MACROFAMILIAS),
                subgrupos=texto_subgrupos,
            ),
        }],
    )
    texto = msg.content[0].text
    return json.loads(texto[texto.find("{"): texto.rfind("}") + 1])


if __name__ == "__main__":
    caged = pd.read_parquet(ROOT / "data/processed/caged_raw.parquet",
                            columns=["seção", "cbo2002ocupação"])
    caged = caged[caged["seção"] == "C"]
    dic = pd.read_excel(ROOT / "raw/Dicionario_de_dados.xlsx",
                        sheet_name="cbo2002ocupação")
    dic.columns = ["cod", "desc"]
    dic = dic.dropna().astype({"cod": int})

    entrada = montar_entrada(caged, dic)
    mapa = classificar(entrada)
    out = pd.DataFrame(sorted(mapa.items()), columns=["subgrupo", "macrofamilia"])
    out.to_csv(ROOT / "data/cbo_macrofamilias.csv", index=False)
    print(out["macrofamilia"].value_counts())
