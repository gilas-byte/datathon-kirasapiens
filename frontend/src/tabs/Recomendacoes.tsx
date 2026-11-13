import { Painel, Pendente } from "../components/Painel";

export default function Recomendacoes() {
  return (
    <div className="grade">
      <Painel titulo="Recomendações para a indústria catarinense" fonte="texto (a definir com a equipe)" span={7}>
        <Pendente texto="conteúdo vem do dashboard/app.py aba 5; decidir se vira JSON ou markdown" />
      </Painel>
      <Painel titulo="Método, premissas e limites" fonte="manifest.json + log_limpeza.json" span={5}>
        <Pendente texto="texto do método + tabela de limpeza (etapa x registros)" />
      </Painel>
    </div>
  );
}
