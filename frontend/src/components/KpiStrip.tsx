import { useMemo } from "react";
import { useFiltros } from "../lib/filtros";
import { useData } from "../lib/data";
import { fmt, fmtSinal, pct } from "../lib/format";
import { medianaHist } from "../lib/stats";
import { EM_ALERTA, type HistSal, type RegiaoSetor } from "../lib/tipos";

export default function KpiStrip() {
  const { cuboFiltrado: c, selRegioes, selSetores, intermediariaDe } = useFiltros();
  const { dados: hist } = useData<HistSal[]>("salario_hist.json");
  const { dados: rs } = useData<RegiaoSetor[]>("ind_regiao_setor.json");

  const adm = c.reduce((a, l) => a + l.admissoes, 0);
  const desl = c.reduce((a, l) => a + l.desligamentos, 0);
  const ped = c.reduce((a, l) => a + l.a_pedido, 0);
  const saldo = adm - desl;

  const mediana = useMemo(
    () => (hist ? medianaHist(hist.filter((h) => selRegioes.has(h.regiao_intermediaria) && selSetores.has(h.setor))) : null),
    [hist, selRegioes, selSetores]
  );
  const alertas = useMemo(
    () => (rs ?? []).filter((p) => EM_ALERTA.has(p.diagnostico) && selSetores.has(p.setor)
                                   && selRegioes.has(intermediariaDe.get(p.regiao_imediata) ?? "")).length,
    [rs, selRegioes, selSetores, intermediariaDe]
  );

  return (
    <section className="kpis" aria-label="Indicadores do recorte">
      <div className="kpi">
        <div className="rot">Saldo de empregos</div>
        <div className={"val " + (saldo >= 0 ? "pos" : "neg")}>{fmtSinal(saldo)}</div>
        <div className="sub">admissões − desligamentos</div>
      </div>
      <div className="kpi">
        <div className="rot">Movimentações</div>
        <div className="val">{fmt(adm + desl)}</div>
        <div className="sub">{fmt(adm)} adm. · {fmt(desl)} deslig.</div>
      </div>
      <div className="kpi">
        <div className="rot">Desligamentos a pedido</div>
        <div className="val">{desl ? pct(ped / desl) : "—"}</div>
        <div className="sub">alto = mercado aquecido, baixa retenção</div>
      </div>
      <div className="kpi">
        <div className="rot">Salário mediano de admissão</div>
        <div className="val">{mediana ? "R$ " + fmt(mediana) : "—"}</div>
        <div className="sub">salários válidos (R$ 800 a 60 mil)</div>
      </div>
      <div className="kpi">
        <div className="rot">Polos em alerta</div>
        <div className="val acc">{alertas}</div>
        <div className="sub">região × setor em Apagão ou Expansão sob pressão</div>
      </div>
    </section>
  );
}
