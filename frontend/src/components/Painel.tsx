import type { ReactNode } from "react";

export function Painel({ titulo, fonte, span = 12, children }: { titulo: string; fonte: string; span?: 4 | 5 | 6 | 7 | 8 | 12; children?: ReactNode }) {
  return (
    <section className={"painel col-" + span}>
      <header>
        <h3>{titulo}</h3>
        <span className="fonte">{fonte}</span>
      </header>
      {children}
    </section>
  );
}

export const Pendente = ({ texto }: { texto: string }) => <div className="pendente">{texto}</div>;
