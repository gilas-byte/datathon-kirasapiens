import { Component, type ReactNode } from "react";

/** Se um gráfico falhar (ex.: navegador sem WebGL), só essa aba mostra o aviso; o resto do painel continua. */
export default class ErrorBoundary extends Component<{ children: ReactNode }, { erro?: string }> {
  state: { erro?: string } = {};
  static getDerivedStateFromError(e: Error) { return { erro: e.message }; }
  render() {
    return this.state.erro
      ? <div className="estado erro">Não foi possível desenhar esta aba: {this.state.erro}. Tente recarregar a página ou usar outro navegador.</div>
      : this.props.children;
  }
}
