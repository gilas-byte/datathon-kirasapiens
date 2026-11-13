import { Painel, Pendente } from "../components/Painel";

export default function Macrofamilias() {
  return (
    <div className="grade">
      <Painel titulo="Índice de pressão por macrofamília (SC inteira)" fonte="ind_macrofamilia.json" span={6}>
        <Pendente texto="barras horizontais, 17 macrofamílias" />
      </Painel>
      <Painel titulo="Desligamentos a pedido por região x macrofamília" fonte="ind_regiao_macrofamilia.json" span={6}>
        <Pendente texto="heatmap % a pedido" />
      </Painel>
    </div>
  );
}
