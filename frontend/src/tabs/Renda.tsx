import { useMemo } from "react";
import { Painel } from "../components/Painel";
import { useFiltros } from "../lib/filtros";
import { useData } from "../lib/data";
import { Plot, layoutBase, plotConfig, escalaMarcador } from "../lib/plotly";
import type { EscCubo, Macro } from "../lib/tipos";

const ROTULO: Record<string, string> = {
  "Agroindústria e Alimentos": "Agroindústria", "Produção de Base (Linha e Embalagem)": "Produção de base",
  "Metalmecânica e Montagem": "Metalmecânica", "Técnicos Industriais e Qualidade": "Técnicos",
  "Engenharia, TI e P&D": "Engenharia e TI", "Gestão e Liderança": "Gestão",
};
const ESC = ["Até fundamental", "Médio incompleto", "Médio completo", "Superior (incompleto ou mais)"];
const COR_ESC = ["#4a4a4a", "#7a7a7a", "#b3b3b3", "#ff8a2b"];

export default function Renda() {
  const { selRegioes, selSetores } = useFiltros();
  const { dados: mf } = useData<Macro[]>("ind_macrofamilia.json");
  const { dados: esc } = useData<EscCubo[]>("escolaridade_cubo.json");

  const g = useMemo(() => (mf ?? []).filter((m) => m.admissoes >= 500), [mf]);
  const barras = useMemo(() => {
    const f = (esc ?? []).filter((e) => selRegioes.has(e.regiao_intermediaria) && selSetores.has(e.setor));
    const movs = ["Desligados", "Admitidos"]; // Plotly empilha de baixo p/ cima: Admitidos fica no topo
    const tot = new Map(movs.map((m) => [m, f.filter((e) => e.mov === m).reduce((a, e) => a + e.n, 0)]));
    return { movs, tot, n: (m: string, e: string) => f.filter((x) => x.mov === m && x.esc === e).reduce((a, x) => a + x.n, 0) };
  }, [esc, selRegioes, selSetores]);
  if (!mf || !esc) return <div className="estado">Carregando…</div>;

  return (
    <div className="grade">
      <Painel titulo="A falta de gente é de qualificação ou de salário?" fonte="ind_macrofamilia.json (SC inteira)" span={12}>
        <p className="nota">
          Cada ponto é uma macrofamília: quanto ela paga, quanto exige de escolaridade e quanto perde de gente por pedido.
          Este gráfico cobre a SC inteira (não muda com os filtros).
        </p>
        <Plot
          data={[{
            type: "scatter", mode: "text+markers", x: g.map((m) => m.salario_mediano_adm), y: g.map((m) => m.pct_pedido_demissao * 100),
            text: g.map((m) => ROTULO[m.macrofamilia] ?? ""), textposition: "middle right", textfont: { size: 12, color: "#ececec" },
            customdata: g.map((m) => [m.macrofamilia, m.pct_superior_adm * 100, m.admissoes]),
            hovertemplate: "<b>%{customdata[0]}</b><br>Salário adm.: R$ %{x:,.0f}<br>% a pedido: %{y:.0f}%" +
              "<br>% adm. com superior: %{customdata[1]:.0f}%<br>Admissões: %{customdata[2]:,.0f}<extra></extra>",
            marker: { size: g.map((m) => m.admissoes), sizemode: "area", sizeref: (2 * Math.max(...g.map((m) => m.admissoes))) / 45 ** 2, sizemin: 8,
                      color: g.map((m) => m.pct_superior_adm * 100), colorscale: escalaMarcador, line: { width: 1.2, color: "#111111" },
                      colorbar: { title: { text: "% adm. c/ superior" }, thickness: 10, outlinewidth: 0 } },
          }] as never}
          layout={{
            ...layoutBase(), height: 540, margin: { l: 56, r: 16, t: 16, b: 48 },
            xaxis: { ...layoutBase().xaxis, title: { text: "Salário mediano de admissão (R$)" }, range: [Math.min(...g.map((m) => m.salario_mediano_adm)) - 150, Math.max(...g.map((m) => m.salario_mediano_adm)) + 900] },
            yaxis: { ...layoutBase().yaxis, title: { text: "% dos desligamentos a pedido" } },
          } as never}
          config={plotConfig} style={{ width: "100%" }} useResizeHandler
        />
        <div className="leitura">
          <strong>Leitura:</strong> as famílias que mais perdem gente por pedido são as que pagam menos e exigem menos
          escolaridade (produção de base, alimentos, têxtil). O gargalo dominante da indústria catarinense é de
          <strong> atratividade e retenção</strong>, não de diploma. Já engenharia, técnicos e gestão estão com saldo
          negativo: não há apagão de qualificação superior no período.
        </div>
      </Painel>
      <Painel titulo="Perfil de escolaridade: quem entra x quem sai" fonte="escolaridade_cubo.json" span={12}>
        <Plot
          data={ESC.map((e, i) => ({
            type: "bar", orientation: "h", name: e, y: barras.movs,
            x: barras.movs.map((m) => (barras.tot.get(m) ? (barras.n(m, e) / (barras.tot.get(m) as number)) * 100 : 0)),
            text: barras.movs.map((m) => (barras.tot.get(m) ? ((barras.n(m, e) / (barras.tot.get(m) as number)) * 100).toFixed(0) : "")),
            textposition: "inside", marker: { color: COR_ESC[i], line: { width: 2, color: "#181818" } },
            textfont: { color: i === 2 || i === 3 ? "#111111" : "#ececec" },
            hovertemplate: "%{y}: %{x:.1f}%<extra>" + e + "</extra>",
          })) as never}
          layout={{
            ...layoutBase(), height: 230, barmode: "stack", margin: { l: 90, r: 16, t: 8, b: 70 },
            legend: { orientation: "h", y: -0.35, traceorder: "normal" }, xaxis: { ...layoutBase().xaxis, title: { text: "% das movimentações" }, range: [0, 100] },
          } as never}
          config={plotConfig} style={{ width: "100%" }} useResizeHandler
        />
      </Painel>
    </div>
  );
}
