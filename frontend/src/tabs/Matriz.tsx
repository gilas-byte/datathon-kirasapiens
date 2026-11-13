import { useMemo } from "react";
import { Painel } from "../components/Painel";
import { useFiltros } from "../lib/filtros";
import { useData } from "../lib/data";
import { Plot, layoutBase, plotConfig } from "../lib/plotly";
import { fmt, pct } from "../lib/format";
import { COR_DIAG, DIAG, type RegiaoSetor } from "../lib/tipos";

export default function Matriz() {
  const { selRegioes, selSetores, intermediariaDe } = useFiltros();
  const { dados: rs } = useData<RegiaoSetor[]>("ind_regiao_setor.json");

  const d = useMemo(
    () => (rs ?? []).filter((p) => p.movimentacoes >= 300 && selSetores.has(p.setor)
                                   && selRegioes.has(intermediariaDe.get(p.regiao_imediata) ?? "")),
    [rs, selRegioes, selSetores, intermediariaDe]
  );
  const alerta = useMemo(
    () => d.filter((p) => ["Apagão de mão de obra", "Expansão sob pressão", "Expansão acelerada"].includes(p.diagnostico))
           .sort((a, b) => DIAG.indexOf(a.diagnostico as never) - DIAG.indexOf(b.diagnostico as never) || b.movimentacoes - a.movimentacoes),
    [d]
  );
  if (!rs) return <div className="estado">Carregando…</div>;
  const maxMov = Math.max(1, ...d.map((p) => p.movimentacoes));

  return (
    <div className="grade">
      <Painel titulo="Matriz de diagnóstico: expansão x pressão" fonte="ind_regiao_setor.json" span={8}>
        <p className="nota">
          Cada bolha é um par região imediata × setor. Eixo X: crescimento do emprego (saldo por 10 mil hab.).
          Eixo Y: pressão de mão de obra (desligamentos a pedido, reposição e prêmio salarial). Quanto maior a bolha, mais movimentações.
        </p>
        <Plot
          data={DIAG.map((g) => {
            const x = d.filter((p) => p.diagnostico === g);
            return {
              type: "scatter", mode: "markers", name: g,
              x: x.map((p) => p.indice_expansao), y: x.map((p) => p.indice_pressao),
              text: x.map((p) => p.regiao_imediata + " · " + p.setor),
              customdata: x.map((p) => [p.saldo, p.pct_pedido_demissao, p.salario_mediano_adm, p.movimentacoes]),
              hovertemplate: "<b>%{text}</b><br>Expansão: %{x:.2f} · Pressão: %{y:.2f}<br>Saldo: %{customdata[0]:,.0f}" +
                "<br>% a pedido: %{customdata[1]:.0%}<br>Salário adm.: R$ %{customdata[2]:,.0f}<br>Mov.: %{customdata[3]:,.0f}<extra>" + g + "</extra>",
              marker: { color: COR_DIAG[g], opacity: 0.85, line: { width: 1.2, color: "#111111" },
                        size: x.map((p) => p.movimentacoes), sizemode: "area", sizeref: (2 * maxMov) / 45 ** 2, sizemin: 5 },
            };
          }) as never}
          layout={{
            ...layoutBase(), height: 560, margin: { l: 56, r: 16, t: 36, b: 48 },
            legend: { orientation: "h", y: 1.1 },
            xaxis: { ...layoutBase().xaxis, title: { text: "Índice de expansão (z)" }, zeroline: false },
            yaxis: { ...layoutBase().yaxis, title: { text: "Índice de pressão / apagão (z)" }, zeroline: false },
            shapes: [
              { type: "line", xref: "paper", x0: 0, x1: 1, y0: 0.5, y1: 0.5, line: { color: "#808080", dash: "dot", width: 1 } },
              { type: "line", yref: "paper", y0: 0, y1: 1, x0: 0.5, x1: 0.5, line: { color: "#808080", dash: "dot", width: 1 } },
            ],
          } as never}
          config={plotConfig} style={{ width: "100%" }} useResizeHandler
        />
      </Painel>
      <Painel titulo="Como ler os diagnósticos" fonte="ind_regiao_setor.json" span={4}>
        <div className="legenda">
          <ul>
            {[
              ["Apagão de mão de obra", "pressão alta, sinais de que falta gente e quem entra não segura."],
              ["Expansão sob pressão", "o emprego cresce, mas a retenção já sofre."],
              ["Expansão acelerada", "crescimento forte sem sinal de pressão."],
              ["Retração", "mais saídas que entradas."],
              ["Estável", "dentro do esperado."],
              ["Volume insuficiente", "menos de 300 movimentações: não classificado."],
            ].map(([k, t]) => (
              <li key={k}><span className="tag"><i style={{ background: COR_DIAG[k] }} /><b>{k}</b></span><br />{t}</li>
            ))}
          </ul>
        </div>
      </Painel>
      <Painel titulo="Polos que exigem atenção" fonte="ind_regiao_setor.json" span={12}>
        <div className="tabela-wrap">
          <table className="t">
            <thead><tr>
              <th>Região</th><th>Setor</th><th>Diagnóstico</th>
              <th className="n">Movimentações</th><th className="n">Saldo</th><th className="n">% saídas a pedido</th>
              <th className="n">Reposição (desl/adm)</th><th className="n">Salário adm. (R$)</th><th className="n">% adm. c/ superior</th>
            </tr></thead>
            <tbody>
              {alerta.map((p) => (
                <tr key={p.regiao_imediata + p.setor}>
                  <td>{p.regiao_imediata}</td><td>{p.setor}</td>
                  <td><span className="tag"><i style={{ background: COR_DIAG[p.diagnostico] }} />{p.diagnostico}</span></td>
                  <td className="n">{fmt(p.movimentacoes)}</td><td className="n">{fmt(p.saldo)}</td>
                  <td className="n">{pct(p.pct_pedido_demissao)}</td><td className="n">{p.indice_reposicao.toFixed(2)}</td>
                  <td className="n">{fmt(p.salario_mediano_adm)}</td><td className="n">{pct(p.pct_superior_adm)}</td>
                </tr>
              ))}
              {!alerta.length && <tr><td colSpan={9} className="estado">Nenhum polo em alerta no recorte.</td></tr>}
            </tbody>
          </table>
        </div>
      </Painel>
    </div>
  );
}
