import { FiltrosProvider, useFiltros } from "./lib/filtros";
import { lazy, Suspense, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Toaster, sileo } from "sileo";
import "sileo/styles.css";
import FilterBar from "./components/FilterBar";
import KpiStrip from "./components/KpiStrip";
import ErrorBoundary from "./components/ErrorBoundary";

const Mapa = lazy(() => import("./tabs/Mapa"));
const Matriz = lazy(() => import("./tabs/Matriz"));
const Macrofamilias = lazy(() => import("./tabs/Macrofamilias"));
const Renda = lazy(() => import("./tabs/Renda"));
const Recomendacoes = lazy(() => import("./tabs/Recomendacoes"));

const ABAS = [
  { id: "mapa", nome: "Mapa territorial", C: Mapa },
  { id: "matriz", nome: "Matriz de diagnóstico", C: Matriz },
  { id: "macro", nome: "Macrofamílias (IA)", C: Macrofamilias },
  { id: "renda", nome: "Renda e escolaridade", C: Renda },
  { id: "rec", nome: "Recomendações e método", C: Recomendacoes },
] as const;

function Conteudo() {
  const [aba, setAba] = useState<(typeof ABAS)[number]["id"]>("mapa");
  const { carregando, erro } = useFiltros();
  useEffect(() => {
    if (erro) sileo.error({ title: "Falha ao carregar dados", description: erro });
  }, [erro]);
  const Atual = ABAS.find((a) => a.id === aba)!.C;
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  // Setas esquerda/direita, Home e End navegam entre abas (padrão WAI-ARIA)
  const teclado = (e: KeyboardEvent, i: number) => {
    const n = ABAS.length;
    const alvo = e.key === "ArrowRight" ? (i + 1) % n : e.key === "ArrowLeft" ? (i - 1 + n) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (alvo < 0) return;
    e.preventDefault(); setAba(ABAS[alvo].id); refs.current[alvo]?.focus();
  };
  return (
    <main className="main">
      <div className="topo">
        <h1>Raio-X do Mercado de Trabalho Industrial de Santa Catarina</h1>
        <p>Onde falta gente, onde sobra vaga e por quê · Equipe Kirasapiens Neurotech · Datathon UniSENAI 2026</p>
      </div>
      <FilterBar />
      {erro ? <div className="estado erro">Erro ao carregar dados: {erro}. Rode <code>npm run sync-data</code>.</div>
        : carregando ? <div className="estado">Carregando dados…</div>
        : (<>
            <KpiStrip />
            <div className="abas" role="tablist" aria-label="Seções do painel">
              {ABAS.map((a, i) => (
                <button key={a.id} id={"aba-" + a.id} ref={(el) => { refs.current[i] = el; }} role="tab" className="aba"
                  aria-selected={aba === a.id} aria-controls="painel-abas" tabIndex={aba === a.id ? 0 : -1}
                  onClick={() => setAba(a.id)} onKeyDown={(e) => teclado(e, i)}>{a.nome}</button>
              ))}
            </div>
            <div id="painel-abas" role="tabpanel" aria-labelledby={"aba-" + aba}>
              <ErrorBoundary key={aba}>
                <Suspense fallback={<div className="estado">Carregando gráficos…</div>}><Atual /></Suspense>
              </ErrorBoundary>
            </div>
          </>)}
    </main>
  );
}

export default function App() {
  return (
    <FiltrosProvider>
      <div className="app">
        <Toaster position="top-right" theme="dark" />
        <Conteudo />
      </div>
    </FiltrosProvider>
  );
}
