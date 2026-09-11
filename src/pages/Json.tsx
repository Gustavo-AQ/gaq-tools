import {
  formatJson,
  minifyJson,
  validateJson,
} from "../tools/json/json";

import { useState } from "react";
import { Link } from "react-router";
import { Icon } from "../components/Icon";
import "../tools/json/json.css";

type Status =
  | { type: "idle"; message: string }
  | { type: "valid"; message: string }
  | { type: "error"; message: string };

export default function Json() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<Status>({
    type: "idle",
    message: "Aguardando JSON.",
  });

  function handleFormat() {
    try {
      setOutput(formatJson(input));
      setStatus({
        type: "valid",
        message: "JSON válido e formatado.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "JSON inválido.",
      });
    }
  }

  function handleMinify() {
    try {
      setOutput(minifyJson(input));
      setStatus({
        type: "valid",
        message: "JSON válido e minificado.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "JSON inválido.",
      });
    }
  }

  function handleValidate() {
    try {
      validateJson(input);

      setStatus({
        type: "valid",
        message: "JSON válido.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "JSON inválido.",
      });
    }
  }

  async function handleCopy() {
    if (!output) return;

    await navigator.clipboard.writeText(output);

    setStatus({
      type: "valid",
      message: "Resultado copiado.",
    });
  }

  function handleClear() {
    setInput("");
    setOutput("");
    setStatus({
      type: "idle",
      message: "Aguardando JSON.",
    });
  }

  return (
    <>
      <Link className="back-link" to="/">
        ← Todas as ferramentas
      </Link>

      <section className="page-heading">
        <span className="eyebrow">DESENVOLVIMENTO</span>
        <h1>JSON Formatter</h1>
        <p>
          Valide, formate e minifique JSON rapidamente. Todo o processamento
          acontece diretamente no seu navegador.
        </p>
      </section>

      <div className="json-workspace">
        <section className="preview-panel json-panel">
          <div className="panel-heading">
            <span className="tool-icon json-tool-icon">
              <Icon name="json" />
            </span>

            <div>
              <h2>Entrada</h2>
              <p>Cole o JSON que deseja analisar.</p>
            </div>
          </div>

          <textarea
            className="json-editor"
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setStatus({
                type: "idle",
                message: "Aguardando validação.",
              });
            }}
            placeholder={`{
  "project": "GAQ CLOUD",
  "service": "GAQ Tools"
}`}
            spellCheck={false}
          />

          <div className="json-actions">
            <button className="button primary" type="button" onClick={handleFormat}>
              Formatar
            </button>

            <button className="button secondary" type="button" onClick={handleMinify}>
              Minificar
            </button>

            <button className="button secondary" type="button" onClick={handleValidate}>
              Validar
            </button>

            <button className="button ghost" type="button" onClick={handleClear}>
              Limpar
            </button>
          </div>
        </section>

        <section className="preview-panel json-panel">
          <div className="panel-heading json-output-heading">
            <div>
              <span className="eyebrow">RESULTADO</span>
              <h2>Saída</h2>
            </div>

            <button
              className="json-copy"
              type="button"
              onClick={handleCopy}
              disabled={!output}
            >
              Copiar
            </button>
          </div>

          <textarea
            className="json-editor"
            value={output}
            readOnly
            placeholder="O resultado aparecerá aqui."
            spellCheck={false}
          />

          <div
            className={`json-status json-status-${status.type}`}
            role="status"
          >
            <span />
            {status.message}
          </div>
        </section>
      </div>

      <aside className="json-privacy">
        <Icon name="cloud" />
        <div>
          <h2>Processado localmente.</h2>
          <p>
            O conteúdo informado não é enviado para a GAQ CLOUD nem armazenado
            em banco de dados.
          </p>
        </div>
      </aside>

      <Link className="related-link" to="/timezones">
        Explore também: Fusos horários <Icon name="arrow" />
      </Link>
    </>
  );
}