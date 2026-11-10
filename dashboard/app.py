"""
Raio-X do Mercado de Trabalho Industrial de SC — Dashboard executivo.
Rodar:  streamlit run dashboard/app.py
"""
import json
from pathlib import Path

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import plotly.io as pio
import streamlit as st

ROOT = Path(__file__).resolve().parents[1]
P = ROOT / "data/processed"

st.set_page_config(page_title="Raio-X Industrial SC", page_icon="🏭", layout="wide")

# Números no padrão brasileiro (1.234,5) em todos os gráficos
pio.templates["br"] = go.layout.Template(layout=dict(separators=",."))
pio.templates.default = "plotly+br"

# Cores por papel (paleta validada para daltonismo; diagnóstico sempre com rótulo)
COR_DIAG = {
    "Apagão de mão de obra": "#e34948",
    "Expansão sob pressão": "#eb6834",
    "Expansão acelerada": "#2a78d6",
    "Retração": "#6250d6",
    "Estável": "#b5b3ad",
    "Volume insuficiente": "#e2e1dc",
}
ORDEM_DIAG = list(COR_DIAG)
DIVERGENTE = [[0, "#d95926"], [0.5, "#f1f0ec"], [1, "#256abf"]]
SEQUENCIAL = ["#cde2fb", "#86b6ef", "#3987e5", "#1c5cab", "#0d366b"]
FMT = lambda x: f"{x:,.0f}".replace(",", ".")


@st.cache_data
def carregar():
    ind = pd.read_parquet(P / "industria.parquet")
    rs = pd.read_csv(P / "ind_regiao_setor.csv")
    mf = pd.read_csv(P / "ind_macrofamilia.csv")
    rmf = pd.read_csv(P / "ind_regiao_macrofamilia.csv")
    mun = pd.read_csv(P / "ind_municipio.csv")
    geo = json.loads((ROOT / "data/sc_municipios.geojson").read_text())
    regioes = pd.read_csv(P / "municipios.csv")[["regiao_imediata", "regiao_intermediaria"]].drop_duplicates()
    rs = rs.merge(regioes, on="regiao_imediata", how="left")
    return ind, rs, mf, rmf, mun, geo


ind, rs, mf, rmf, mun, geo = carregar()

# ---------------- Filtros ----------------
st.sidebar.title("Filtros")
regs = sorted(ind["regiao_intermediaria"].cat.categories)
sel_reg = st.sidebar.multiselect("Região intermediária (IBGE)", regs, default=regs)
setores = sorted(ind["setor"].dropna().unique())
sel_set = st.sidebar.multiselect("Setor industrial (divisão CNAE)", setores, default=setores)
st.sidebar.caption("Base: Novo CAGED SC, set/2025 a ago/2026, indústria de transformação (seção C).")

f = ind[ind["regiao_intermediaria"].isin(sel_reg) & ind["setor"].isin(sel_set)]
rs_f = rs[rs["regiao_intermediaria"].isin(sel_reg) & rs["setor"].isin(sel_set)]

# ---------------- Cabeçalho e KPIs ----------------
st.title("Raio-X do Mercado de Trabalho Industrial de Santa Catarina")
st.caption("Onde falta gente, onde sobra vaga e por quê — Equipe Kirasapiens Neurotech · Datathon UniSENAI 2026")

adm = int(f["admissao"].sum())
desl = len(f) - adm
desl_df = f[~f["admissao"]]
pedido = desl_df["pedido"].mean() if len(desl_df) else 0
sal = f.loc[f["admissao"] & f["salario_valido"], "salario"].median()
alertas = (rs_f["diagnostico"].isin(["Apagão de mão de obra", "Expansão sob pressão"])).sum()

k1, k2, k3, k4, k5 = st.columns(5)
k1.metric("Saldo de empregos", FMT(adm - desl), help="Admissões − desligamentos no período")
k2.metric("Movimentações", FMT(len(f)), help=f"{FMT(adm)} admissões e {FMT(desl)} desligamentos")
k3.metric("Desligamentos a pedido", f"{pedido:.0%}",
          help="Parcela dos desligamentos em que o próprio trabalhador pediu para sair. "
               "Alto = mercado aquecido e baixa retenção.")
k4.metric("Salário mediano de admissão", f"R$ {FMT(sal)}" if pd.notna(sal) else "—")
k5.metric("Polos em alerta", int(alertas), help="Pares região × setor classificados como "
          "Apagão ou Expansão sob pressão")

aba1, aba2, aba3, aba4, aba5 = st.tabs(
    ["🗺️ Mapa territorial", "🎯 Matriz de diagnóstico", "🧠 Macrofamílias (IA)",
     "💰 Renda e escolaridade", "✅ Recomendações e método"])

# ---------------- Aba 1: Mapa ----------------
with aba1:
    c1, c2 = st.columns([3, 2])
    with c1:
        metrica = st.radio("Indicador no mapa", ["Saldo por 10 mil habitantes",
                                                 "Desligamentos a pedido (%)",
                                                 "Índice de pressão (apagão)"], horizontal=True)
        m = mun[mun["regiao_intermediaria"].isin(sel_reg)].copy()
        m["id"] = m["cod_ibge"].astype(str)
        m["pct_pedido"] = m["pct_pedido_demissao"] * 100
        col, escala, meio = {
            "Saldo por 10 mil habitantes": ("saldo_10k_hab", DIVERGENTE, 0),
            "Desligamentos a pedido (%)": ("pct_pedido", SEQUENCIAL, None),
            "Índice de pressão (apagão)": ("indice_pressao", SEQUENCIAL, None),
        }[metrica]
        if col != "saldo_10k_hab":
            m.loc[m["movimentacoes"] < 100, col] = None  # evita ruído de municípios minúsculos
        lim = m[col].abs().quantile(0.95) if meio == 0 else None
        # Mapa sem camada de fundo: não depende de tiles nem de arquivos externos
        fig = px.choropleth_map(m, geojson=geo, locations="id", featureidkey="properties.id",
                                color=col, color_continuous_scale=escala,
                                range_color=(-lim, lim) if lim else None,
                                hover_name="municipio_nome",
                                hover_data={"id": False, "regiao_imediata": True, "saldo": ":,",
                                            "movimentacoes": ":,", "pct_pedido": ":.0f",
                                            col: ":.1f"},
                                labels={col: metrica, "regiao_imediata": "Região",
                                        "saldo": "Saldo", "movimentacoes": "Movimentações",
                                        "pct_pedido": "% a pedido"},
                                map_style="white-bg", center={"lat": -27.25, "lon": -50.45},
                                zoom=5.7, opacity=1)
        fig.update_traces(marker_line_width=0.4, marker_line_color="#ffffff")
        fig.update_layout(height=520, margin=dict(l=0, r=0, t=0, b=0),
                          coloraxis_colorbar=dict(title="", thickness=10))
        st.plotly_chart(fig, width="stretch")
        st.caption("Municípios com menos de 100 movimentações ficam sem cor nos indicadores de taxa.")
    with c2:
        st.subheader("Quem puxa e quem freia o saldo")
        r = (f.groupby("regiao_imediata", observed=True)["admissao"]
             .agg(adm="sum", n="size").assign(saldo=lambda d: 2 * d["adm"] - d["n"])
             .reset_index().sort_values("saldo"))
        r = pd.concat([r.head(6), r.tail(6)]).drop_duplicates()
        r["sinal"] = r["saldo"].apply(lambda v: "Cria vagas" if v >= 0 else "Fecha vagas")
        fig = px.bar(r, x="saldo", y="regiao_imediata", orientation="h", color="sinal",
                     color_discrete_map={"Cria vagas": "#2a78d6", "Fecha vagas": "#d95926"},
                     text="saldo", labels={"saldo": "Saldo", "regiao_imediata": ""})
        fig.update_traces(texttemplate="%{text:,}", textposition="outside", marker_line_width=0,
                          cliponaxis=False)
        pad = r["saldo"].abs().max() * 0.7
        fig.update_layout(height=440, legend=dict(title="", orientation="h", y=-0.15),
                          margin=dict(l=0, r=10, t=10, b=0),
                          xaxis=dict(range=[r["saldo"].min() - pad, r["saldo"].max() + pad]),
                          yaxis=dict(categoryorder="array", categoryarray=list(r["regiao_imediata"])))
        st.plotly_chart(fig, width="stretch")

    st.subheader("Saldo mensal da indústria")
    mes = (f.groupby("competênciamov")["admissao"].agg(adm="sum", n="size")
           .assign(saldo=lambda d: 2 * d["adm"] - d["n"]).reset_index())
    mes["mes"] = pd.to_datetime(mes["competênciamov"].astype(str), format="%Y%m").dt.strftime("%b/%y")
    fig = px.bar(mes, x="mes", y="saldo", labels={"mes": "", "saldo": "Saldo"},
                 color=mes["saldo"] >= 0,
                 color_discrete_map={True: "#2a78d6", False: "#d95926"})
    fig.update_layout(showlegend=False, height=280, margin=dict(l=0, r=0, t=10, b=0))
    st.plotly_chart(fig, width="stretch")
    st.caption("Dezembro concentra o fechamento sazonal de vagas (fim de contratos e férias coletivas); "
               "janeiro a março recompõem o quadro.")

# ---------------- Aba 2: Matriz ----------------
with aba2:
    st.markdown("**Cada bolha é um par região imediata × setor.** Eixo X: crescimento do emprego "
                "(saldo por 10 mil hab.). Eixo Y: pressão de mão de obra (desligamentos a pedido, "
                "reposição e prêmio salarial). Quanto maior a bolha, mais movimentações.")
    d = rs_f[rs_f["movimentacoes"] >= 300].copy()
    d["rotulo"] = d["regiao_imediata"] + " · " + d["setor"]
    fig = px.scatter(d, x="indice_expansao", y="indice_pressao", size="movimentacoes",
                     color="diagnostico", category_orders={"diagnostico": ORDEM_DIAG},
                     color_discrete_map=COR_DIAG, hover_name="rotulo", size_max=45,
                     hover_data={"indice_expansao": ":.2f", "indice_pressao": ":.2f",
                                 "saldo": ":,", "pct_pedido_demissao": ":.0%",
                                 "salario_mediano_adm": ":,.0f", "movimentacoes": ":,"},
                     labels={"indice_expansao": "Índice de expansão (z)",
                             "indice_pressao": "Índice de pressão / apagão (z)",
                             "diagnostico": "Diagnóstico", "pct_pedido_demissao": "% a pedido",
                             "salario_mediano_adm": "Salário mediano adm. (R$)"})
    for v in (0.5,):
        fig.add_hline(y=v, line_dash="dot", line_color="#8c8a83")
        fig.add_vline(x=v, line_dash="dot", line_color="#8c8a83")
    fig.update_traces(marker=dict(line=dict(width=1.5, color="#ffffff"), opacity=0.85))
    fig.update_layout(height=560, legend=dict(orientation="h", y=1.08), margin=dict(t=40))
    st.plotly_chart(fig, width="stretch")

    st.subheader("Polos que exigem atenção")
    cols = {"regiao_imediata": "Região", "setor": "Setor", "diagnostico": "Diagnóstico",
            "movimentacoes": "Movimentações", "saldo": "Saldo",
            "pct_pedido_demissao": "% saídas a pedido", "indice_reposicao": "Reposição (desl/adm)",
            "salario_mediano_adm": "Salário adm. (R$)", "pct_superior_adm": "% adm. c/ superior"}
    alerta = d[d["diagnostico"].isin(["Apagão de mão de obra", "Expansão sob pressão",
                                      "Expansão acelerada"])]
    alerta = alerta.sort_values(["diagnostico", "movimentacoes"], ascending=[True, False])
    st.dataframe(alerta[list(cols)].rename(columns=cols), hide_index=True, width="stretch",
                 column_config={"% saídas a pedido": st.column_config.NumberColumn(format="percent"),
                                "% adm. c/ superior": st.column_config.NumberColumn(format="percent"),
                                "Reposição (desl/adm)": st.column_config.NumberColumn(format="%.2f"),
                                "Salário adm. (R$)": st.column_config.NumberColumn(format="%.0f")})

# ---------------- Aba 3: Macrofamílias ----------------
with aba3:
    st.markdown("Os **1.467 códigos CBO** da indústria foram agrupados por IA generativa em "
                "**16 macrofamílias** (a partir dos títulos das ocupações de cada subgrupo). "
                "Assim dá para ver se o gargalo está na engenharia ou no chão de fábrica.")
    st.subheader("Índice de pressão por macrofamília (SC inteira)")
    g = mf[mf["admissoes"] >= 1000].sort_values("indice_pressao")
    fig = px.bar(g, x="indice_pressao", y="macrofamilia", orientation="h",
                 color="diagnostico", color_discrete_map=COR_DIAG,
                 category_orders={"diagnostico": ORDEM_DIAG},
                 hover_data={"admissoes": ":,", "saldo": ":,", "pct_pedido_demissao": ":.0%",
                             "salario_mediano_adm": ":,.0f"},
                 labels={"indice_pressao": "Índice de pressão (z) — à direita, mais sinais de apagão",
                         "macrofamilia": "", "diagnostico": "Diagnóstico",
                         "salario_mediano_adm": "Salário adm. (R$)",
                         "pct_pedido_demissao": "% a pedido"})
    fig.update_traces(marker_line_width=0)
    fig.update_layout(height=480, legend=dict(orientation="h", y=1.08, title=""),
                      yaxis=dict(categoryorder="array", categoryarray=list(g["macrofamilia"])),
                      margin=dict(t=40))
    st.plotly_chart(fig, width="stretch")

    st.subheader("% dos desligamentos que foram a pedido do trabalhador, por região")
    h = rmf[rmf["regiao_intermediaria"].isin(sel_reg) & (rmf["movimentacoes"] >= 300)]
    piv = h.pivot(index="macrofamilia", columns="regiao_intermediaria", values="pct_pedido_demissao")
    piv = piv.loc[piv.mean(axis=1).sort_values(ascending=False).index]
    fig = px.imshow(piv * 100, color_continuous_scale=SEQUENCIAL, aspect="auto",
                    text_auto=".0f", labels=dict(color="% a pedido", x="", y=""))
    fig.update_xaxes(side="top")
    fig.update_layout(height=560, margin=dict(t=30), coloraxis_colorbar=dict(thickness=10))
    st.plotly_chart(fig, width="stretch")
    st.caption("Células vazias: menos de 300 movimentações no recorte.")

# ---------------- Aba 4: Renda e escolaridade ----------------
with aba4:
    st.markdown("**A falta de gente é de qualificação ou de salário?** Cada ponto é uma macrofamília: "
                "quanto ela paga, quanto exige de escolaridade e quanto perde de gente por pedido.")
    g = (f[f["admissao"]].groupby("macrofamilia", observed=True)
         .agg(sal=("salario", lambda s: s[f.loc[s.index, "salario_valido"]].median()),
              sup=("graudeinstrução", lambda s: s.isin([9, 10, 11, 80]).mean() * 100),
              adm=("admissao", "size")).reset_index())
    ped = (f[~f["admissao"]].groupby("macrofamilia", observed=True)["pedido"].mean() * 100).rename("ped")
    g = g.merge(ped, on="macrofamilia")
    g = g[g["adm"] >= 500]
    # Rótulo direto só nas famílias-chave da história; as demais aparecem no hover
    chave = {"Agroindústria e Alimentos": "Agroindústria", "Produção de Base (Linha e Embalagem)":
             "Produção de base e têxtil", "Têxtil, Vestuário, Couro e Calçados": "",
             "Metalmecânica e Montagem": "Metalmecânica", "Técnicos Industriais e Qualidade":
             "Técnicos", "Engenharia, TI e P&D": "Engenharia e TI", "Gestão e Liderança": "Gestão"}
    g["rotulo"] = g["macrofamilia"].astype(str).map(chave).fillna("")
    fig = px.scatter(g, x="sal", y="ped", size="adm", text="rotulo", size_max=45,
                     color="sup", color_continuous_scale=SEQUENCIAL[1:], hover_name="macrofamilia",
                     hover_data={"rotulo": False, "sal": ":,.0f", "ped": ":.0f", "sup": ":.0f",
                                 "adm": ":,"},
                     labels={"sal": "Salário mediano de admissão (R$)",
                             "ped": "% dos desligamentos a pedido",
                             "sup": "% admitidos com superior", "adm": "Admissões"})
    fig.update_traces(textposition="middle right", textfont_size=12,
                      marker=dict(line=dict(width=1.5, color="#ffffff"), sizemin=8))
    fig.update_layout(height=560, coloraxis_colorbar=dict(thickness=10),
                      xaxis=dict(range=[g["sal"].min() - 150, g["sal"].max() + 700]))
    st.plotly_chart(fig, width="stretch")
    st.info("**Leitura:** as famílias que mais perdem gente por pedido são as que pagam menos e exigem "
            "menos escolaridade (produção de base, alimentos, têxtil). O gargalo dominante da indústria "
            "catarinense é de **atratividade e retenção**, não de diploma. Já engenharia, técnicos e "
            "gestão estão com saldo negativo: não há apagão de qualificação superior no período.")

    st.subheader("Perfil de escolaridade: quem entra x quem sai")
    esc_map = {1: "Até fundamental", 2: "Até fundamental", 3: "Até fundamental", 4: "Até fundamental",
               5: "Até fundamental", 6: "Médio incompleto", 7: "Médio completo",
               8: "Superior (incompleto ou mais)", 9: "Superior (incompleto ou mais)",
               10: "Superior (incompleto ou mais)", 11: "Superior (incompleto ou mais)",
               80: "Superior (incompleto ou mais)"}
    e = f.assign(esc=f["graudeinstrução"].map(esc_map),
                 mov=f["admissao"].map({True: "Admitidos", False: "Desligados"}))
    e = e.dropna(subset=["esc"]).groupby(["mov", "esc"]).size().reset_index(name="n")
    e["pct"] = e["n"] / e.groupby("mov")["n"].transform("sum") * 100
    fig = px.bar(e, x="pct", y="mov", color="esc", orientation="h", text_auto=".0f",
                 category_orders={"esc": ["Até fundamental", "Médio incompleto", "Médio completo",
                                          "Superior (incompleto ou mais)"]},
                 color_discrete_sequence=["#cde2fb", "#86b6ef", "#3987e5", "#184f95"],
                 labels={"pct": "% das movimentações", "mov": "", "esc": "Escolaridade"})
    fig.update_traces(marker_line_width=2, marker_line_color="#ffffff")
    fig.update_layout(height=230, legend=dict(orientation="h", y=-0.4), margin=dict(t=10))
    st.plotly_chart(fig, width="stretch")

# ---------------- Aba 5: Recomendações ----------------
with aba5:
    st.subheader("Recomendações para a indústria catarinense")
    st.markdown("""
1. **Programa de retenção no chão de fábrica (Oeste e Vale do Itajaí).**
   Nos polos em alerta de alimentos (Joaçaba, São Miguel do Oeste, Mafra) e de vestuário
   (Ibirama, Ituporanga), de 6 a 7 em cada 10 desligamentos são a pedido e cada contratação apenas repõe uma saída. Ações: plano de carreira curto (operador I → II → III em 12 meses),
   bônus de permanência aos 6 e 12 meses e transporte e alimentação como parte da proposta salarial.
2. **Revisão de faixas salariais de entrada nas famílias de base.**
   As macrofamílias com maior pressão têm salário de admissão em torno de R$ 2,0–2,2 mil. Usar o painel
   para comparar o próprio piso com a mediana regional da mesma ocupação antes de abrir vagas.
3. **Qualificação rápida onde há expansão (SENAI + empresas).**
   Chapecó (alimentos), Itajaí (equipamentos de transporte e veículos), Joinville e Blumenau
   (máquinas e materiais elétricos) concentram o saldo positivo. Turmas curtas de operador, solda e
   manutenção, desenhadas com as empresas desses polos, encurtam o tempo de preenchimento.
4. **Monitorar o painel trimestralmente.** O Índice de Pressão funciona como alerta precoce:
   um par região × setor que sobe para o quadrante de apagão por dois trimestres seguidos indica
   necessidade de ação antes da falta de pessoal virar atraso de produção.
""")
    st.subheader("Método, premissas e limites")
    log = pd.read_csv(P / "log_limpeza.csv")
    st.dataframe(log.rename(columns={"etapa": "Etapa", "linhas": "Registros"}), hide_index=True)
    st.markdown("""
- **Janela:** competências de set/2025 a ago/2026. Movimentações declaradas fora do prazo com
  competência anterior foram excluídas para manter 12 meses comparáveis. O arquivo fornecido contém
  apenas a base **MOV**, então não foi possível descontar a base de exclusões (EXC).
- **Regiões:** composição oficial das 7 regiões intermediárias e 24 imediatas do IBGE (2017);
  junção CAGED × IBGE pelo código de município de 6 dígitos.
- **Saldo por 10 mil hab.:** população estimada de 2026 (IBGE).
- **Índice de pressão (apagão)** = média dos z-scores de: % de desligamentos a pedido,
  índice de reposição (desligamentos ÷ admissões) e prêmio salarial de admissão ajustado por
  ocupação (mediana de quem entra ÷ mediana de quem sai, na mesma CBO). Recortes com menos de 300
  movimentações não são classificados.
- **Salário válido:** R$ 800 a R$ 60 mil, jornada ≥ 30h, sem intermitentes, aprendizes ou parciais.
- **Limites:** o CAGED mede fluxo, não estoque nem vagas abertas; "apagão" aqui é inferido pelo
  comportamento de retenção e salário, não pela vaga não preenchida. O prêmio salarial tende a ser
  negativo porque quem sai tem mais tempo de casa, então o sinal está na comparação entre setores.
- **IA:** a classificação dos 177 subgrupos CBO em macrofamílias foi feita por LLM (Claude) com o
  prompt em `backend/cbo_llm.py` e revisada pela equipe. O mapeamento está em `data/cbo_macrofamilias.csv`.
""")
