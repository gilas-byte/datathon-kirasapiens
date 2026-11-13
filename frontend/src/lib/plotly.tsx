import Plotly from "plotly.js-dist-min";
import createPlotlyComponent from "react-plotly.js/factory";
import type { Layout } from "plotly.js";

export const Plot = createPlotlyComponent(Plotly);

/** Layout base escuro, alinhado aos tokens. Cada gráfico só sobrescreve o que precisa. */
export const layoutBase: Partial<Layout> = {
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(0,0,0,0)",
  font: { family: "IBM Plex Sans, system-ui, sans-serif", color: "#a7b1ab", size: 12 },
  margin: { l: 48, r: 16, t: 8, b: 40 },
  xaxis: { gridcolor: "#1f2723", zerolinecolor: "#28312d" },
  yaxis: { gridcolor: "#1f2723", zerolinecolor: "#28312d" },
  separators: ",.",
};
export const cores = { pos: "#4fb59a", neg: "#e0715e", accent: "#e0a526", neutral: "#7d8a83" };
export const plotConfig = { displayModeBar: false, responsive: true };
