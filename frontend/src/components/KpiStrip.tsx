import { useFiltros } from "../lib/filtros";
import { fmt, fmtSinal, pct } from "../lib/format";

export default function KpiStrip() {
  const { cuboFiltrado: c } = useFiltros();
  const adm = c.reduce((a, l) => a + l.admissoes, 0);
  const desl = c.reduce((a, l) => a + l.desligamentos, 0);
  const ped = c.reduce((a, l) => a + l.a_pedido, 0);
  const saldo = adm - desl;
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
        <div className="sub">alto = baixa retenção</div>
      </div>
      <div className="kpi">
        <div className="rot">Salário mediano de admissão</div>
        <div className="val pend">—</div>
        <div className="sub">pendente: mediana não soma, sai do ind_*.json</div>
      </div>
      <div className="kpi">
        <div className="rot">Polos em alerta</div>
        <div className="val pend">—</div>
        <div className="sub">pendente: contar diagnóstico em ind_regiao_setor.json</div>
      </div>
    </section>
  );
}
