const nf = new Intl.NumberFormat("pt-BR");
export const fmt = (n: number) => nf.format(Math.round(n));
export const fmtSinal = (n: number) => (n > 0 ? "+" : "") + nf.format(Math.round(n));
export const pct = (x: number) => (x * 100).toFixed(0).replace(".", ",") + "%";
export const mesRotulo = (c: number) => {
  const m = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"][(c % 100) - 1];
  return m + "/" + String(Math.floor(c / 100)).slice(2);
};
