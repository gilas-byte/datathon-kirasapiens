import { useMemo, useState } from "react";
import { Painel } from "../components/Painel";
import { useFiltros } from "../lib/filtros";
import { useData } from "../lib/data";
import { Plot, layoutBase, cores, plotConfig, escalaSeq, escalaDiv } from "../lib/plotly";
import { mesRotulo } from "../lib/format";

type Mun = {
  cod_ibge: number; municipio_nome: string; regiao_imediata: string; regiao_intermediaria: string;
  saldo: number; movimentacoes: number; pct_pedido_demissao: number; saldo_10k_hab: number; indice_pressao: number;
};
const INDICADORES = {
  saldo: { rot: "Saldo por 10 mil hab.", campo: "saldo_10k_hab", div: true, fmt: (v: number) => v.toFixed(1) },
  pedido: { rot: "Desligamentos a pedido (%)", campo: "pct_pedido_demissao", div: false, fmt: (v: number) => (v * 100).toFixed(0) + "%" },
  pressao: { rot: "Índice de pressão", campo: "indice_pressao", div: false, fmt: (v: number) => v.toFixed(2) },
} as const;
type Chave = keyof typeof INDICADORES;

// Fundo de mapa cinza sem tiles externos
const estiloFundo = { version: 8, sources: {}, layers: [{ id: "bg", type: "background", paint: { "background-color": "#181818" } }] };

function MapaSC() {
  const { selRegioes } = useFiltros();
  const { dados: mun } = useData<Mun[]>("ind_municipio.json");
  const { dados: geo } = useData<unknown>("sc_municipios.geojson");
  const [ind, setInd] = useState<Chave>("saldo");

  const linhas = useMemo(() => (mun ?? []).filter((m) => selRegioes.has(m.regiao_intermediaria)), [mun, selRegioes]);
  if (!mun || !geo) return <div className="estado">Carregando mapa…</div>;

  const cfg = INDICADORES[ind];
  // Taxas de municípios minúsculos são ruído: ficam sem cor (como no Streamlit)
  const z = linhas.map((m) => (cfg.div || m.movimentacoes >= 100 ? (m[cfg.campo] as number) : null));
  const lim = cfg.div ? Math.max(1, quantilAbs(z.filter((v): v is number => v !== null), 0.95)) : undefined;

  return (
    <>
      <div className="seg" role="group" aria-label="Indicador do mapa">
        {(Object.keys(INDICADORES) as Chave[]).map((k) => (
          <button key={k} aria-pressed={ind === k} onClick={() => setInd(k)}>{INDICADORES[k].rot}</button>
        ))}
      </div>
      <Plot
        data={[{
          type: "choroplethmap", geojson: geo, featureidkey: "properties.id",
          locations: linhas.map((m) => String(m.cod_ibge)), z,
          text: linhas.map((m) => m.municipio_nome + "<br>" + m.regiao_imediata + "<br>Saldo: " + m.saldo + " · Mov.: " + m.movimentacoes),
          hovertemplate: "%{text}<br>" + cfg.rot + ": %{z:.2f}<extra></extra>",
          colorscale: cfg.div ? escalaDiv : escalaSeq,
          ...(lim ? { zmin: -lim, zmax: lim, zmid: 0 } : {}),
          marker: { line: { width: 0.4, color: "#111111" } },
          colorbar: { thickness: 10, outlinewidth: 0, tickfont: { color: "#a8a8a8" } },
        } as never]}
        layout={{ ...layoutBase(), height: 520, margin: { l: 0, r: 0, t: 0, b: 0 },
                  map: { style: estiloFundo, center: { lat: -27.25, lon: -50.45 }, zoom: 6.15 } } as never}
        config={plotConfig} style={{ width: "100%" }} useResizeHandler
      />
      <p className="fonte" style={{ margin: "8px 0 0" }}>Municípios com menos de 100 movimentações ficam sem cor nos indicadores de taxa.</p>
    </>
  );
}

function quantilAbs(v: number[], q: number) {
  const s = v.map(Math.abs).sort((a, b) => a - b);
  return s.length ? s[Math.min(s.length - 1, Math.floor(q * s.length))] : 0;
}

export default function Mapa() {
  const { cuboFiltrado: c } = useFiltros();
  const mensal = useMemo(() => {
    const m = new Map<number, number>();
    c.forEach((l) => m.set(l.competencia, (m.get(l.competencia) ?? 0) + l.saldo));
    return [...m.entries()].sort((a, b) => a[0] - b[0]);
  }, [c]);
  const porRegiao = useMemo(() => {
    const m = new Map<string, number>();
    c.forEach((l) => m.set(l.regiao_imediata, (m.get(l.regiao_imediata) ?? 0) + l.saldo));
    return [...m.entries()].sort((a, b) => a[1] - b[1]);
  }, [c]);

  return (
    <div className="grade">
      <Painel titulo="Mapa de SC por município" fonte="ind_municipio.json + sc_municipios.geojson" span={7}>
        <MapaSC />
      </Painel>
      <Painel titulo="Quem puxa e quem freia o saldo" fonte="cubo.json" span={5}>
        <Plot
          data={[{ type: "bar", orientation: "h", x: porRegiao.map(([, v]) => v), y: porRegiao.map(([k]) => k),
                   marker: { color: porRegiao.map(([, v]) => (v >= 0 ? cores.pos : cores.neg)) } }]}
          layout={{ ...layoutBase(), height: 560, margin: { l: 240, r: 16, t: 8, b: 32 } }}
          config={plotConfig} style={{ width: "100%" }} useResizeHandler
        />
      </Painel>
      <Painel titulo="Saldo mensal da indústria" fonte="cubo.json" span={12}>
        <Plot
          data={[{ type: "bar", x: mensal.map(([k]) => mesRotulo(k)), y: mensal.map(([, v]) => v),
                   marker: { color: mensal.map(([, v]) => (v >= 0 ? cores.pos : cores.neg)) } }]}
          layout={{ ...layoutBase(), height: 260 }} config={plotConfig} style={{ width: "100%" }} useResizeHandler
        />
      </Painel>
    </div>
  );
}
