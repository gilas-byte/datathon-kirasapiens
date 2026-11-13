import { useFiltros } from "../lib/filtros";

function Grupo({ titulo, tipo, itens, sel }: { titulo: string; tipo: "regiao" | "setor"; itens: string[]; sel: Set<string> }) {
  const { alterna, todos } = useFiltros();
  return (
    <div className="grupo">
      <h2>{titulo}</h2>
      <div className="acoes">
        <button className="linkbtn" onClick={() => todos(tipo, true)}>todas</button>
        <button className="linkbtn" onClick={() => todos(tipo, false)}>nenhuma</button>
      </div>
      {itens.map((i) => (
        <label className="check" key={i}>
          <input type="checkbox" checked={sel.has(i)} onChange={() => alterna(tipo, i)} />
          {i}
        </label>
      ))}
    </div>
  );
}

export default function Rail() {
  const { regioes, setores, selRegioes, selSetores } = useFiltros();
  return (
    <aside className="rail" aria-label="Filtros">
      <Grupo titulo="Região intermediária (IBGE)" tipo="regiao" itens={regioes} sel={selRegioes} />
      <Grupo titulo="Setor industrial (CNAE)" tipo="setor" itens={setores} sel={selSetores} />
      <p className="nota">Base: Novo CAGED SC, set/2025 a ago/2026, indústria de transformação (seção C).</p>
    </aside>
  );
}
