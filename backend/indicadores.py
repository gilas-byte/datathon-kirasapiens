"""Cálculo dos indicadores do Raio-X, compartilhado pelo pipeline e pelo dashboard."""
import numpy as np
import pandas as pd

ESC_SUPERIOR = {9, 10, 11, 80}
ESC_ATE_FUNDAMENTAL = {1, 2, 3, 4, 5}
MIN_MOV = 300  # volume mínimo de movimentações para um recorte entrar no ranking


def premio_salarial(g: pd.DataFrame) -> float:
    """Prêmio de admissão ajustado por ocupação.

    Para cada CBO com >=10 admissões e >=10 desligamentos com salário válido,
    calcula log(mediana_admissão / mediana_desligamento) e faz a média
    ponderada pelas admissões. Positivo = quem entra ganha mais do que quem sai
    na MESMA ocupação (sinal de disputa por mão de obra).
    """
    s = g[g["salario_valido"]]
    if s.empty:
        return np.nan
    t = s.groupby(["cbo", "admissao"])["salario"].agg(["median", "size"]).unstack()
    t = t.reindex(columns=pd.MultiIndex.from_product([["median", "size"], [False, True]]))
    t = t.dropna()
    if t.empty:
        return np.nan
    t = t[(t[("size", True)] >= 10) & (t[("size", False)] >= 10)]
    if t.empty:
        return np.nan
    r = np.log(t[("median", True)] / t[("median", False)])
    return float(np.exp(np.average(r, weights=t[("size", True)])) - 1)


def resumir(g: pd.DataFrame) -> pd.Series:
    adm = g["admissao"]
    n_adm = int(adm.sum())
    n_desl = int((~adm).sum())
    desl = g[~adm]
    adm_df = g[adm]
    sal_adm = adm_df.loc[adm_df["salario_valido"], "salario"]
    return pd.Series({
        "admissoes": n_adm,
        "desligamentos": n_desl,
        "saldo": n_adm - n_desl,
        "movimentacoes": n_adm + n_desl,
        "indice_reposicao": n_desl / n_adm if n_adm else np.nan,
        "pct_pedido_demissao": desl["pedido"].mean() if n_desl else np.nan,
        "salario_mediano_adm": sal_adm.median() if len(sal_adm) else np.nan,
        "premio_salarial": premio_salarial(g),
        "pct_superior_adm": adm_df["graudeinstrução"].isin(ESC_SUPERIOR).mean() if n_adm else np.nan,
        "pct_ate_fundamental_adm": adm_df["graudeinstrução"].isin(ESC_ATE_FUNDAMENTAL).mean() if n_adm else np.nan,
        "idade_media_adm": adm_df["idade"].mean() if n_adm else np.nan,
    })


def tabela(df: pd.DataFrame, chaves: list[str], pop: pd.Series | None = None) -> pd.DataFrame:
    """Indicadores agregados por `chaves`. `pop` (indexada pela 1ª chave) ativa o saldo por 10 mil hab."""
    t = df.groupby(chaves, observed=True).apply(resumir, include_groups=False).reset_index()
    if pop is not None:
        t["populacao"] = t[chaves[0]].astype(object).map(pop).astype(float)
        t["saldo_10k_hab"] = t["saldo"] / t["populacao"] * 10_000
    return t


LIMIAR = 0.5  # corte (em desvios-padrão) dos índices de pressão e expansão

# Variantes do Índice de Pressão, usadas na análise de sensibilidade (backend/estatistica.py):
#   atual          média dos z-scores de % a pedido, prêmio salarial e reposição (padrão do projeto)
#   sem_reposicao  só % a pedido e prêmio: a reposição é quase o inverso do saldo (ρ ≈ −0,9)
#                  e por isso mede retração, não falta de mão de obra
#   winsor         componentes limitados aos percentis 1 e 99 antes do z-score
#   robusto        z-score robusto: (x − mediana) / (1,4826 · MAD)
METODOS_PRESSAO = ("atual", "sem_reposicao", "winsor", "robusto")


def _zscore(s: pd.Series, ok: pd.Series, metodo: str) -> pd.Series:
    v = s[ok]
    if metodo == "winsor":
        lo, hi = v.quantile([0.01, 0.99])
        s, v = s.clip(lo, hi), v.clip(lo, hi)
    if metodo == "robusto":
        mad = 1.4826 * (v - v.median()).abs().median()
        if mad > 0:
            return (s - v.median()) / mad
    return (s - v.mean()) / v.std(ddof=0)


def classificar(t: pd.DataFrame, min_mov: int = MIN_MOV, metodo: str = "atual",
                limiar: float = LIMIAR) -> pd.DataFrame:
    """Índice de Pressão (apagão) e quadrante de diagnóstico.

    Pressão = média dos z-scores de:
      - % de desligamentos a pedido (trabalhador sai porque tem opção)
      - prêmio salarial de admissão (empresa paga mais para repor)
      - índice de reposição (desligamentos / admissões: contrata só para repor)
    Expansão = z-score do saldo (por 10 mil hab. quando disponível).

    `metodo` muda só o cálculo da pressão (ver METODOS_PRESSAO); a expansão usa sempre
    o z-score padrão, para isolar o efeito na análise de sensibilidade.
    """
    if metodo not in METODOS_PRESSAO:
        raise ValueError(f"metodo deve ser um de {METODOS_PRESSAO}")
    t = t.copy()
    ok = t["movimentacoes"] >= min_mov

    cols = ["pct_pedido_demissao", "premio_salarial"]
    if metodo != "sem_reposicao":
        cols.append("indice_reposicao")
    comp = pd.concat([_zscore(t[c], ok, metodo) for c in cols], axis=1)
    comp["premio_salarial"] = comp["premio_salarial"].fillna(0)
    t["indice_pressao"] = comp.mean(axis=1)

    base = "saldo_10k_hab" if "saldo_10k_hab" in t else "saldo"
    if base == "saldo":
        t["taxa_saldo"] = t["saldo"] / t["movimentacoes"]
        base = "taxa_saldo"
    t["indice_expansao"] = _zscore(t[base], ok, "atual")

    p, e = t["indice_pressao"], t["indice_expansao"]
    t["diagnostico"] = np.select(
        [~ok, (p >= limiar) & (e >= limiar), p >= limiar, e >= limiar, e <= -limiar],
        ["Volume insuficiente", "Expansão sob pressão", "Apagão de mão de obra",
         "Expansão acelerada", "Retração"],
        default="Estável")
    return t
