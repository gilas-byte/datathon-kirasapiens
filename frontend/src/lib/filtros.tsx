import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useData, type LinhaCubo } from "./data";
import type { Municipio } from "./tipos";

type Ctx = {
  regioes: string[]; setores: string[];
  selRegioes: Set<string>; selSetores: Set<string>;
  alterna: (tipo: "regiao" | "setor", v: string) => void;
  todos: (tipo: "regiao" | "setor", on: boolean) => void;
  cuboFiltrado: LinhaCubo[];
  /** região imediata -> intermediária (de municipios.json) */
  intermediariaDe: Map<string, string>;
  carregando: boolean; erro?: string;
};
const C = createContext<Ctx | null>(null);
export const useFiltros = () => useContext(C)!;

export function FiltrosProvider({ children }: { children: ReactNode }) {
  const { dados: cubo = [], carregando, erro } = useData<LinhaCubo[]>("cubo.json");
  const { dados: muns = [] } = useData<Municipio[]>("municipios.json");
  const intermediariaDe = useMemo(() => new Map(muns.map((m) => [m.regiao_imediata, m.regiao_intermediaria])), [muns]);
  const regioes = useMemo(() => [...new Set(cubo.map((l) => l.regiao_intermediaria))].sort(), [cubo]);
  const setores = useMemo(() => [...new Set(cubo.map((l) => l.setor))].sort(), [cubo]);
  // null = "tudo selecionado" (evita estado inicial dessincronizado com o carregamento)
  const [r, setR] = useState<Set<string> | null>(null);
  const [s, setS] = useState<Set<string> | null>(null);
  // Sets estáveis entre renders: evita recalcular e redesenhar todos os gráficos à toa
  const selRegioes = useMemo(() => r ?? new Set(regioes), [r, regioes]);
  const selSetores = useMemo(() => s ?? new Set(setores), [s, setores]);

  const alterna: Ctx["alterna"] = (tipo, v) => {
    const [atual, set, todosV] = tipo === "regiao" ? [selRegioes, setR, regioes] : [selSetores, setS, setores];
    const n = new Set(atual); n.has(v) ? n.delete(v) : n.add(v);
    set(n.size === todosV.length ? null : n);
  };
  const todos: Ctx["todos"] = (tipo, on) => (tipo === "regiao" ? setR : setS)(on ? null : new Set());

  // Só somas (aditivo) acontecem no navegador. Medianas/índices vêm prontos dos ind_*.json.
  const cuboFiltrado = useMemo(
    () => cubo.filter((l) => selRegioes.has(l.regiao_intermediaria) && selSetores.has(l.setor)),
    [cubo, selRegioes, selSetores]
  );
  return <C.Provider value={{ regioes, setores, selRegioes, selSetores, alterna, todos, cuboFiltrado, intermediariaDe, carregando, erro }}>{children}</C.Provider>;
}
