import * as Popover from "@radix-ui/react-popover";
import { Command } from "cmdk";

type Props = { rotulo: string; itens: string[]; sel: Set<string>; onAlterna: (v: string) => void; onTodos: (on: boolean) => void };

/** Dropdown multi-seleção com busca (Radix Popover + cmdk). */
export default function MultiSelect({ rotulo, itens, sel, onAlterna, onTodos }: Props) {
  return (
    <Popover.Root>
      <Popover.Trigger className="ms-trigger" aria-label={"Filtrar " + rotulo}>
        <span className="rot">{rotulo}</span>
        <span className="qtd">{sel.size}/{itens.length}</span>
        <span className="seta" aria-hidden>▼</span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="ms-pop" align="start" sideOffset={6}>
          <Command>
            <Command.Input placeholder={"Buscar " + rotulo.toLowerCase() + "…"} />
            <Command.List>
              <Command.Empty>Nada encontrado.</Command.Empty>
              {itens.map((i) => (
                <Command.Item key={i} value={i} onSelect={() => onAlterna(i)}>
                  <span className={"ms-box" + (sel.has(i) ? " on" : "")} aria-hidden>{sel.has(i) ? "✓" : ""}</span>
                  {i}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
          <div className="ms-rodape">
            <button className="linkbtn" onClick={() => onTodos(true)}>selecionar todas</button>
            <button className="linkbtn" onClick={() => onTodos(false)}>limpar</button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
