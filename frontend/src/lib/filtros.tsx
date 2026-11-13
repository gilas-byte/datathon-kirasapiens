import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useData, type LinhaCubo } from "./data";

type Ctx = {
  regioes: string[]; setores: string[];
  selRegioes: Set<string>; selSetores: Set<string>;
  alterna: (tipo: "regiao" | "setor", v: string) => void;
  todos: (tipo: "regiao" | "setor", on: boolean) => void;
  cuboFiltrado: LinhaCubo[];
  carregando: boolean; erro?: string;
};
const C = createContext<Ctx | null>(null);
export const useFiltros = () => useContext(C)!;

export function FiltrosProvider({ children }: { children: ReactNode }) {
  const { dados: cubo = [], carregando, erro } = useData<LinhaCubo[]>("cubo.json");
  const regioes = useMemo(() => [...new Set(cubo.map((l) => l.regiao_intermediaria))].sort(), [cubo]);
  const setores = useMemo(() => [...new Set(cubo.map((l) => l.setor))].sort(), [cubo]);
  // null = "tudo selecionado" (evita estado inicial dessincronizado com o carregamento)
  const [r, setR] = useState<Set<string> | null>(null);
  const [s, setS] = useState<Set<string> | null>(null);
  const selRegioes = r ?? new Set(regioes);
  const selSetores = s ?? new Set(setores);

  const alterna: Ctx["alterna"] = (tipo, v) => {
    const [atual, set, todosV] = tipo === "regiao" ? [selRegioes, setR, regioes] : [selSetores, setS, setores];
    const n = new Set(atual); n.has(v) ? n.delete(v) : n.add(v);
    set(n.size === todosV.length ? null : n);
  };
  const todos: Ctx["todos"] = (tipo, on) => (tipo === "regiao" ? setR : setS)(on ? null : new Set());

  // Só somas (aditivo) acontecem no navegador. Medianas/índices vêm prontos dos ind_*.json.
  const cuboFiltrado = useMemo(
    () => cubo.filter((l) => selRegioes.has(l.regiao_intermediaria) && selSetores.has(l.setor)),
    [cubo, r, s] // eslint-disable-line react-hooks/exhaustive-deps
  );
  return <C.Provider value={{ regioes, setores, selRegioes, selSetores, alterna, todos, cuboFiltrado, carregando, erro }}>{children}</C.Provider>;
}
