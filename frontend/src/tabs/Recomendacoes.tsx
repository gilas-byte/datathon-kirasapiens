import { Painel } from "../components/Painel";
import { useData } from "../lib/data";
import { fmt } from "../lib/format";
import type { LogLimpeza } from "../lib/tipos";

export default function Recomendacoes() {
  const { dados: log } = useData<LogLimpeza[]>("log_limpeza.json");
  return (
    <div className="grade">
      <Painel titulo="Recomendações para a indústria catarinense" fonte="análise da equipe" span={12}>
        <div className="prosa">
          <ol>
            <li><strong>Programa de retenção no chão de fábrica (Oeste e Vale do Itajaí).</strong> Nos polos em alerta de
              alimentos (Joaçaba, São Miguel do Oeste, Mafra) e de vestuário (Ibirama, Ituporanga), de 6 a 7 em cada 10
              desligamentos são a pedido e cada contratação apenas repõe uma saída. Ações: plano de carreira curto
              (operador I → II → III em 12 meses), bônus de permanência aos 6 e 12 meses e transporte e alimentação como
              parte da proposta salarial.</li>
            <li><strong>Revisão de faixas salariais de entrada nas famílias de base.</strong> As macrofamílias com maior
              pressão têm salário de admissão em torno de R$ 2,0–2,2 mil. Usar o painel para comparar o próprio piso com a
              mediana regional da mesma ocupação antes de abrir vagas.</li>
            <li><strong>Qualificação rápida onde há expansão (SENAI + empresas).</strong> Chapecó (alimentos), Itajaí
              (equipamentos de transporte e veículos), Joinville e Blumenau (máquinas e materiais elétricos) concentram o
              saldo positivo. Turmas curtas de operador, solda e manutenção, desenhadas com as empresas desses polos,
              encurtam o tempo de preenchimento.</li>
            <li><strong>Monitorar o painel trimestralmente.</strong> O Índice de Pressão funciona como alerta precoce: um par
              região × setor que sobe para o quadrante de apagão por dois trimestres seguidos indica necessidade de ação
              antes da falta de pessoal virar atraso de produção.</li>
          </ol>
        </div>
      </Painel>
      <Painel titulo="Método, premissas e limites" fonte="log_limpeza.json" span={12}>
        <div className="tabela-wrap" style={{ maxWidth: 640, marginBottom: 16 }}>
          <table className="t">
            <thead><tr><th>Etapa</th><th className="n">Registros</th></tr></thead>
            <tbody>{(log ?? []).map((l) => <tr key={l.etapa}><td>{l.etapa}</td><td className="n">{fmt(l.linhas)}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="prosa">
          <ul>
            <li><strong>Janela:</strong> competências de set/2025 a ago/2026. Movimentações declaradas fora do prazo com
              competência anterior foram excluídas para manter 12 meses comparáveis. O arquivo fornecido contém apenas a
              base MOV, então não foi possível descontar a base de exclusões (EXC).</li>
            <li><strong>Regiões:</strong> composição oficial das 7 regiões intermediárias e 24 imediatas do IBGE (2017);
              junção CAGED × IBGE pelo código de município de 6 dígitos.</li>
            <li><strong>Saldo por 10 mil hab.:</strong> população estimada de 2026 (IBGE).</li>
            <li><strong>Índice de pressão (apagão)</strong> = média dos z-scores de: % de desligamentos a pedido, índice de
              reposição (desligamentos ÷ admissões) e prêmio salarial de admissão ajustado por ocupação (mediana de quem
              entra ÷ mediana de quem sai, na mesma CBO). Recortes com menos de 300 movimentações não são classificados.</li>
            <li><strong>Salário válido:</strong> R$ 800 a R$ 60 mil, jornada ≥ 30h, sem intermitentes, aprendizes ou parciais.
              No painel, a mediana do recorte filtrado é recomposta de um histograma (faixas de R$ 10, erro menor que R$ 10).</li>
            <li><strong>Limites:</strong> o CAGED mede fluxo, não estoque nem vagas abertas; "apagão" aqui é inferido pelo
              comportamento de retenção e salário, não pela vaga não preenchida. O prêmio salarial tende a ser negativo
              porque quem sai tem mais tempo de casa, então o sinal está na comparação entre setores.</li>
            <li><strong>IA:</strong> a classificação dos 177 subgrupos CBO em macrofamílias foi feita por LLM (Claude) com o
              prompt em <code>backend/cbo_llm.py</code> e revisada pela equipe. O mapeamento está em
              <code> data/cbo_macrofamilias.csv</code>.</li>
          </ul>
        </div>
      </Painel>
    </div>
  );
}
