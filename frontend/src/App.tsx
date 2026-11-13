import { useState } from "react";
import { FiltrosProvider, useFiltros } from "./lib/filtros";
import Rail from "./components/Rail";
import KpiStrip from "./components/KpiStrip";
import Mapa from "./tabs/Mapa";
import Matriz from "./tabs/Matriz";
import Macrofamilias from "./tabs/Macrofamilias";
import Renda from "./tabs/Renda";
import Recomendacoes from "./tabs/Recomendacoes";

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
  const Atual = ABAS.find((a) => a.id === aba)!.C;
  return (
    <main className="main">
      <div className="topo">
        <h1>Raio-X do Mercado de Trabalho Industrial de Santa Catarina</h1>
        <p>Onde falta gente, onde sobra vaga e por quê · Equipe Kirasapiens Neurotech · Datathon UniSENAI 2026</p>
      </div>
      {erro ? <div className="estado erro">Erro ao carregar dados: {erro}. Rode <code>npm run sync-data</code>.</div>
        : carregando ? <div className="estado">Carregando dados…</div>
        : (<>
            <KpiStrip />
            <div className="abas" role="tablist">
              {ABAS.map((a) => (
                <button key={a.id} role="tab" className="aba" aria-selected={aba === a.id} onClick={() => setAba(a.id)}>{a.nome}</button>
              ))}
            </div>
            <Atual />
          </>)}
    </main>
  );
}

export default function App() {
  return (
    <FiltrosProvider>
      <div className="app">
        <Rail />
        <Conteudo />
      </div>
    </FiltrosProvider>
  );
}
