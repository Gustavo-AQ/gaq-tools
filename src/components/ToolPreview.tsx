import { Link } from "react-router";
import { Icon, type IconName } from "./Icon";

type Props = {
  title: string;
  description: string;
  icon: IconName;
  category: string;
  fields: { label: string; value: string }[];
  features: string[];
  otherPath: string;
  otherTitle: string;
};

export default function ToolPreview({
  title,
  description,
  icon,
  category,
  fields,
  features,
  otherPath,
  otherTitle,
}: Props) {
  return (
    <>
      <Link className="back-link" to="/">
        ← Todas as ferramentas
      </Link>
      <section className="page-heading">
        <span className="eyebrow">{category}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </section>
      <div className="preview-notice">
        <span className="badge">Em construção</span>
        <p>
          Esta é uma prévia visual. Os campos e resultados serão ativados em uma
          próxima etapa.
        </p>
      </div>
      <div className="preview-grid">
        <section className="preview-panel">
          <div className="panel-heading">
            <span className="tool-icon">
              <Icon name={icon} />
            </span>
            <div>
              <h2>Prepare sua comparação</h2>
              <p>Uma visão do que vem por aí.</p>
            </div>
          </div>
          <fieldset disabled>
            <legend>Prévia dos campos</legend>
            <div className="field-grid">
              {fields.map((field) => (
                <label key={field.label}>
                  {field.label}
                  <input value={field.value} readOnly />
                </label>
              ))}
            </div>
            <button className="button primary" type="button" disabled>
              Disponível em breve <Icon name="arrow" />
            </button>
          </fieldset>
        </section>
        <section className="preview-panel result-panel">
          <span className="eyebrow">SEU PRÓXIMO PASSO</span>
          <h2>Clareza para decidir.</h2>
          <p>A ferramenta está sendo preparada para ajudar você a:</p>
          <ul>
            {features.map((feature) => (
              <li key={feature}>
                <span aria-hidden="true">↗</span>
                {feature}
              </li>
            ))}
          </ul>
          <div className="empty-result">
            <Icon name={icon} />
            <p>
              Seus resultados aparecerão aqui
              <br />
              quando a ferramenta estiver pronta.
            </p>
          </div>
        </section>
      </div>
      <Link className="related-link" to={otherPath}>
        Explore também: {otherTitle}
        <Icon name="arrow" />
      </Link>
    </>
  );
}
