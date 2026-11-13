import { useEffect, useState } from "react";

const base = import.meta.env.BASE_URL + "data/";
const cache = new Map<string, Promise<unknown>>();

function carrega<T>(arquivo: string): Promise<T> {
  if (!cache.has(arquivo)) {
    cache.set(
      arquivo,
      fetch(base + arquivo).then((r) => {
        if (!r.ok) throw new Error(arquivo + ": HTTP " + r.status);
        return r.json();
      })
    );
  }
  return cache.get(arquivo) as Promise<T>;
}

export type Estado<T> = { dados?: T; erro?: string; carregando: boolean };

/** Hook único de dados: useData<Linha[]>("ind_macrofamilia.json") */
export function useData<T>(arquivo: string): Estado<T> {
  const [s, setS] = useState<Estado<T>>({ carregando: true });
  useEffect(() => {
    let vivo = true;
    carrega<T>(arquivo)
      .then((dados) => vivo && setS({ dados, carregando: false }))
      .catch((e) => vivo && setS({ erro: String(e.message ?? e), carregando: false }));
    return () => { vivo = false; };
  }, [arquivo]);
  return s;
}

export type LinhaCubo = {
  regiao_intermediaria: string; regiao_imediata: string; setor: string; competencia: number;
  admissoes: number; desligamentos: number; a_pedido: number; adm_superior: number; saldo: number;
};
