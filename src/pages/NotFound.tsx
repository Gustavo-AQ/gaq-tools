import { Link } from "react-router";
export default function NotFound() {
  return (
    <section className="not-found">
      <span className="eyebrow">404 · CAMINHO NÃO ENCONTRADO</span>
      <h1>Vamos voltar ao início?</h1>
      <p>Esta página não existe. Suas ferramentas estão no workspace.</p>
      <Link className="button primary" to="/">
        Voltar para o início →
      </Link>
    </section>
  );
}
