import Plotly from "plotly.js-dist-min";
import createPlotlyComponent from "react-plotly.js/factory";
import type { Layout } from "plotly.js";

export const Plot = createPlotlyComponent(Plotly);

/** Layout base escuro, alinhado aos tokens. Cada gráfico só sobrescreve o que precisa. */
const baseDef = (): Partial<Layout> => ({
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(0,0,0,0)",
  font: { family: "IBM Plex Sans, system-ui, sans-serif", color: "#a8a8a8", size: 12 },
  margin: { l: 48, r: 16, t: 8, b: 40 },
  xaxis: { gridcolor: "#232323", zerolinecolor: "#2e2e2e" },
  yaxis: { gridcolor: "#232323", zerolinecolor: "#2e2e2e" },
  separators: ",.",
});
/** Cópia nova a cada uso: o Plotly muta xaxis/yaxis e um objeto compartilhado contaminava os outros gráficos. */
export const layoutBase = (): Partial<Layout> => baseDef();
export const cores = { pos: "#5fb3a1", neg: "#c9594f", accent: "#ff8a2b", neutral: "#808080" };
export const plotConfig = { displayModeBar: false, responsive: true };

export const escalaSeq: [number, string][] = [[0, "#333333"], [0.5, "#a35a1f"], [1, "#ff8a2b"]];
export const escalaDiv: [number, string][] = [[0, "#c9594f"], [0.5, "#3c3c3c"], [1, "#5fb3a1"]];
