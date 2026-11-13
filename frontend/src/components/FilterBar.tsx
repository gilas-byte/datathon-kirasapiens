import { sileo } from "sileo";
import MultiSelect from "./MultiSelect";
import { useFiltros } from "../lib/filtros";

export default function FilterBar() {
  const { regioes, setores, selRegioes, selSetores, alterna, todos } = useFiltros();
  const limpa = (tipo: "regiao" | "setor", on: boolean) => {
    todos(tipo, on);
    if (!on) sileo.warning({ title: "Filtro vazio", description: "Nenhum item selecionado: os indicadores ficam zerados." });
  };
  return (
    <div className="filtros" role="group" aria-label="Filtros">
      <MultiSelect rotulo="Região intermediária" itens={regioes} sel={selRegioes} onAlterna={(v) => alterna("regiao", v)} onTodos={(on) => limpa("regiao", on)} />
      <MultiSelect rotulo="Setor industrial" itens={setores} sel={selSetores} onAlterna={(v) => alterna("setor", v)} onTodos={(on) => limpa("setor", on)} />
      <span className="base">Novo CAGED SC · set/2025 a ago/2026 · indústria de transformação (CNAE C)</span>
    </div>
  );
}
