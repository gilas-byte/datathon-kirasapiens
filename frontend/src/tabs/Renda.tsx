import { Painel, Pendente } from "../components/Painel";

export default function Renda() {
  return (
    <div className="grade">
      <Painel titulo="Salário x desligamento a pedido" fonte="est_pedido_salario_escolaridade.json" span={6}>
        <Pendente texto="scatter por quintil de salário e faixa de escolaridade" />
      </Painel>
      <Painel titulo="Perfil de escolaridade: quem entra x quem sai" fonte="ind_macrofamilia.json" span={6}>
        <Pendente texto="barras: pct_superior_adm e pct_ate_fundamental_adm" />
      </Painel>
      <Painel titulo="Modelo logístico: o que prevê o pedido de demissão" fonte="est_logit_pedido.json" span={12}>
        <Pendente texto="razão de chances com IC 95% (forest plot)" />
      </Painel>
    </div>
  );
}
