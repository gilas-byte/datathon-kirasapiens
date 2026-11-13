import { useMemo } from "react";
import { Painel, Pendente } from "../components/Painel";
import { useFiltros } from "../lib/filtros";
import { Plot, layoutBase, cores, plotConfig } from "../lib/plotly";
import { mesRotulo } from "../lib/format";

export default function Mapa() {
  const { cuboFiltrado: c } = useFiltros();
  // Prova de pipeline: saldo mensal a partir do cubo (soma pura, filtrável no navegador).
  const mensal = useMemo(() => {
    const m = new Map<number, number>();
    c.forEach((l) => m.set(l.competencia, (m.get(l.competencia) ?? 0) + l.saldo));
    return [...m.entries()].sort((a, b) => a[0] - b[0]);
  }, [c]);

  return (
    <div className="grade">
      <Painel titulo="Mapa de SC por município" fonte="ind_municipio.json + sc_municipios.geojson" span={7}>
        <Pendente texto="choropleth: saldo por 10 mil hab. / % a pedido / índice de pressão (seletor de indicador)" />
      </Painel>
      <Painel titulo="Quem puxa e quem freia o saldo" fonte="cubo.json" span={5}>
        <Pendente texto="barras horizontais por região imediata, verde/coral pelo sinal" />
      </Painel>
      <Painel titulo="Saldo mensal da indústria" fonte="cubo.json" span={12}>
        <Plot
          data={[{ type: "bar", x: mensal.map(([k]) => mesRotulo(k)), y: mensal.map(([, v]) => v),
                   marker: { color: mensal.map(([, v]) => (v >= 0 ? cores.pos : cores.neg)) } }]}
          layout={{ ...layoutBase, height: 260 }}
          config={plotConfig}
          style={{ width: "100%" }}
          useResizeHandler
        />
      </Painel>
    </div>
  );
}
