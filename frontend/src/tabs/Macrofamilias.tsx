import { useMemo } from "react";
import { Painel } from "../components/Painel";
import { useFiltros } from "../lib/filtros";
import { useData } from "../lib/data";
import { Plot, layoutBase, plotConfig, escalaSeq } from "../lib/plotly";
import { COR_DIAG, DIAG, type Macro, type RegiaoMacro } from "../lib/tipos";

export default function Macrofamilias() {
  const { selRegioes } = useFiltros();
  const { dados: mf } = useData<Macro[]>("ind_macrofamilia.json");
  const { dados: rmf } = useData<RegiaoMacro[]>("ind_regiao_macrofamilia.json");

  const g = useMemo(() => (mf ?? []).filter((m) => m.admissoes >= 1000).sort((a, b) => a.indice_pressao - b.indice_pressao), [mf]);
  const heat = useMemo(() => {
    const h = (rmf ?? []).filter((r) => selRegioes.has(r.regiao_intermediaria) && r.movimentacoes >= 300);
    const regs = [...new Set(h.map((r) => r.regiao_intermediaria))].sort();
    const fams = [...new Set(h.map((r) => r.macrofamilia))];
    const val = (f: string, r: string) => h.find((x) => x.macrofamilia === f && x.regiao_intermediaria === r)?.pct_pedido_demissao;
    const media = (f: string) => { const v = regs.map((r) => val(f, r)).filter((x): x is number => x != null); return v.reduce((a, b) => a + b, 0) / (v.length || 1); };
    fams.sort((a, b) => media(b) - media(a));
    const z = fams.map((f) => regs.map((r) => { const v = val(f, r); return v == null ? null : v * 100; }));
    return { regs, fams, z };
  }, [rmf, selRegioes]);
  if (!mf || !rmf) return <div className="estado">Carregando…</div>;

  return (
    <div className="grade">
      <Painel titulo="Índice de pressão por macrofamília (SC inteira)" fonte="ind_macrofamilia.json" span={12}>
        <p className="nota">
          Os 1.467 códigos CBO da indústria foram agrupados por IA generativa em macrofamílias (a partir dos títulos das
          ocupações de cada subgrupo). Assim dá para ver se o gargalo está na engenharia ou no chão de fábrica.
          À direita, mais sinais de apagão.
        </p>
        <Plot
          data={DIAG.map((d) => {
            const x = g.filter((m) => m.diagnostico === d);
            return {
              type: "bar", orientation: "h", name: d, x: x.map((m) => m.indice_pressao), y: x.map((m) => m.macrofamilia),
              marker: { color: COR_DIAG[d] },
              customdata: x.map((m) => [m.admissoes, m.saldo, m.pct_pedido_demissao, m.salario_mediano_adm]),
              hovertemplate: "<b>%{y}</b><br>Pressão: %{x:.2f}<br>Admissões: %{customdata[0]:,.0f} · Saldo: %{customdata[1]:,.0f}" +
                "<br>% a pedido: %{customdata[2]:.0%}<br>Salário adm.: R$ %{customdata[3]:,.0f}<extra>" + d + "</extra>",
            };
          }).filter((t) => (t.x as number[]).length) as never}
          layout={{
            ...layoutBase(), height: 500, margin: { l: 300, r: 16, t: 36, b: 40 }, barmode: "overlay",
            legend: { orientation: "h", y: 1.1 },
            yaxis: { ...layoutBase().yaxis, categoryorder: "array", categoryarray: g.map((m) => m.macrofamilia) },
            xaxis: { ...layoutBase().xaxis, title: { text: "Índice de pressão (z)" } },
          } as never}
          config={plotConfig} style={{ width: "100%" }} useResizeHandler
        />
      </Painel>
      <Painel titulo="% dos desligamentos que foram a pedido do trabalhador, por região" fonte="ind_regiao_macrofamilia.json" span={12}>
        {heat.fams.length ? (
          <Plot
            data={[{
              type: "heatmap", x: heat.regs, y: heat.fams, z: heat.z, colorscale: escalaSeq, hoverongaps: false,
              text: heat.z.map((l) => l.map((v) => (v == null ? "" : v.toFixed(0)))), texttemplate: "%{text}",
              textfont: { color: "#ececec", size: 12 },
              hovertemplate: "<b>%{y}</b><br>%{x}: %{z:.0f}% a pedido<extra></extra>",
              colorbar: { thickness: 10, outlinewidth: 0, ticksuffix: "%" }, xgap: 2, ygap: 2,
            }] as never}
            layout={{
              ...layoutBase(), height: 560, margin: { l: 300, r: 16, t: 36, b: 16 },
              xaxis: { side: "top", showgrid: false }, yaxis: { autorange: "reversed", showgrid: false },
            } as never}
            config={plotConfig} style={{ width: "100%" }} useResizeHandler
          />
        ) : <div className="estado">Nenhuma região selecionada.</div>}
        <p className="fonte" style={{ margin: "8px 0 0" }}>Células vazias: menos de 300 movimentações no recorte.</p>
      </Painel>
    </div>
  );
}
