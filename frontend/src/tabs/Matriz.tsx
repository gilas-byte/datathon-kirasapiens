import { Painel, Pendente } from "../components/Painel";

export default function Matriz() {
  return (
    <div className="grade">
      <Painel titulo="Matriz de diagnóstico: expansão x pressão" fonte="ind_regiao_setor.json" span={8}>
        <Pendente texto="scatter indice_expansao x indice_pressao, tamanho = movimentações, cor = diagnostico" />
      </Painel>
      <Painel titulo="Legenda dos diagnósticos" fonte="ind_regiao_setor.json" span={4}>
        <Pendente texto="seis classes: Apagão, Expansão sob pressão, Expansão acelerada, Retração, Estável, Volume insuficiente" />
      </Painel>
      <Painel titulo="Polos que exigem atenção" fonte="ind_regiao_setor.json" span={12}>
        <Pendente texto="tabela filtrada em Apagão e Expansão sob pressão" />
      </Painel>
    </div>
  );
}
