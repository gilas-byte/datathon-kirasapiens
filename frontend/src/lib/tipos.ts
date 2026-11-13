export const DIAG = [
  "Apagão de mão de obra", "Expansão sob pressão", "Expansão acelerada", "Retração", "Estável", "Volume insuficiente",
] as const;
/** Cores por papel; todo diagnóstico aparece também com rótulo (não depende só da cor). */
export const COR_DIAG: Record<string, string> = {
  "Apagão de mão de obra": "#e5484d",
  "Expansão sob pressão": "#ff8a2b",
  "Expansão acelerada": "#5fb3a1",
  "Retração": "#9a8fd6",
  "Estável": "#8a8a8a",
  "Volume insuficiente": "#4a4a4a",
};
export const EM_ALERTA = new Set(["Apagão de mão de obra", "Expansão sob pressão"]);

export type RegiaoSetor = {
  regiao_imediata: string; setor: string; movimentacoes: number; saldo: number; pct_pedido_demissao: number;
  indice_reposicao: number; salario_mediano_adm: number; pct_superior_adm: number;
  indice_pressao: number; indice_expansao: number; diagnostico: string;
};
export type Macro = {
  macrofamilia: string; admissoes: number; saldo: number; movimentacoes: number; pct_pedido_demissao: number;
  salario_mediano_adm: number; pct_superior_adm: number; indice_pressao: number; diagnostico: string;
};
export type RegiaoMacro = Macro & { regiao_intermediaria: string };
export type Municipio = { regiao_imediata: string; regiao_intermediaria: string };
export type HistSal = { regiao_intermediaria: string; setor: string; lo: number; hi: number; n: number };
export type EscCubo = { regiao_intermediaria: string; setor: string; mov: string; esc: string; n: number };
export type LogLimpeza = { etapa: string; linhas: number };
