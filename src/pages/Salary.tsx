import { useState } from "react";
import { Link } from "react-router";
import { Icon } from "../components/Icon";
import {
  calculateSalary,
  crossRate,
  currencies,
  formatMoney,
  parseDecimal,
  periods,
  type Currency,
  type Period,
} from "../tools/salary/calculator";
import { useExchange } from "../tools/salary/useExchange";
import "../tools/salary/salary.css";

export default function Salary() {
  const [amount, setAmount] = useState("5000");
  const [period, setPeriod] = useState<Period>("monthly");
  const [from, setFrom] = useState<Currency>("BRL");
  const [to, setTo] = useState<Currency>("BRL");
  const [hours, setHours] = useState("44");
  const [weeks, setWeeks] = useState("52");
  const [manual, setManual] = useState(false);
  const [manualRate, setManualRate] = useState("");
  const different = from !== to;
  const fx = useExchange(different && !manual);
  const value = parseDecimal(amount);
  const h = parseDecimal(hours);
  const w = parseDecimal(weeks);
  const amountError =
    value === null ? "Informe um valor válido, como 5.000,50." : "";
  const hoursError =
    h === null || h <= 0 || h > 168 ? "Informe mais de 0 e até 168 horas." : "";
  const weeksError =
    w === null || w <= 0 || w > 53 ? "Informe mais de 0 e até 53 semanas." : "";
  const typedRate = parseDecimal(manualRate);
  const rateError =
    different && manual && (typedRate === null || typedRate <= 0)
      ? "Informe uma taxa maior que zero."
      : "";
  const rate = !different
    ? 1
    : manual
      ? typedRate
      : fx.data
        ? crossRate(fx.data.quote.rates, from, to)
        : null;
  const valid = !amountError && !hoursError && !weeksError && !rateError;
  const results =
    valid && value !== null && h !== null && w !== null && rate !== null
      ? calculateSalary(value, period, h, w, rate)
      : null;
  const original =
    valid && value !== null && h !== null && w !== null
      ? calculateSalary(value, period, h, w)
      : null;
  function changeCurrencies(nextFrom: Currency, nextTo: Currency) {
    setFrom(nextFrom);
    setTo(nextTo);
    setManualRate("");
  }
  const options = currencies.map(([code, label]) => (
    <option key={code} value={code}>
      {code} · {label}
    </option>
  ));

  return (
    <>
      <Link className="back-link" to="/">
        ← Todas as ferramentas
      </Link>
      <section className="page-heading">
        <span className="eyebrow">TRABALHO & FINANÇAS</span>
        <h1>Salário e moedas</h1>
        <p>
          Compare sua remuneração por período. Converta a moeda só quando
          precisar.
        </p>
      </section>
      <div className="preview-grid salary-workspace">
        <section
          className="preview-panel salary-form"
          aria-labelledby="salary-input-title"
        >
          <div className="panel-heading">
            <span className="tool-icon">
              <Icon name="salary" />
            </span>
            <div>
              <h2 id="salary-input-title">Seu ponto de partida</h2>
              <p>Os resultados acompanham suas alterações.</p>
            </div>
          </div>
          <div className="field-grid">
            <label>
              Remuneração
              <input
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                aria-invalid={!!amountError}
                aria-describedby="amount-help"
              />
              <small
                id="amount-help"
                className={amountError ? "field-error" : ""}
              >
                {amountError || "Use 5.000,50 ou 5000,50."}
              </small>
            </label>
            <label>
              Período
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as Period)}
              >
                {periods.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Moeda de origem
              <select
                value={from}
                onChange={(e) =>
                  changeCurrencies(e.target.value as Currency, to)
                }
              >
                {options}
              </select>
            </label>
            <label>
              Moeda de destino
              <select
                value={to}
                onChange={(e) =>
                  changeCurrencies(from, e.target.value as Currency)
                }
              >
                {options}
              </select>
            </label>
          </div>
          <button
            className="text-button"
            type="button"
            onClick={() => changeCurrencies(to, from)}
            disabled={!different}
          >
            ⇄ Inverter moedas
          </button>
          <div className="schedule-section">
            <h3>Sua jornada de referência</h3>
            <div className="field-grid">
              <label>
                Horas por semana
                <input
                  inputMode="decimal"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  aria-invalid={!!hoursError}
                  aria-describedby={hoursError ? "hours-error" : undefined}
                />
                {hoursError && (
                  <small id="hours-error" className="field-error">
                    {hoursError}
                  </small>
                )}
              </label>
              <label>
                Semanas por ano
                <input
                  inputMode="decimal"
                  value={weeks}
                  onChange={(e) => setWeeks(e.target.value)}
                  aria-invalid={!!weeksError}
                  aria-describedby={weeksError ? "weeks-error" : undefined}
                />
                {weeksError && (
                  <small id="weeks-error" className="field-error">
                    {weeksError}
                  </small>
                )}
              </label>
            </div>
            <p>
              A média mensal usa 12 meses. Ajuste as semanas para refletir o
              período remunerado do ano.
            </p>
          </div>
          {!different ? (
            <div className="fx-panel">
              <span className="badge available">Sem câmbio</span>
              <p>
                {from} → {to}: apenas o período muda. Nenhuma cotação é
                necessária.
              </p>
            </div>
          ) : (
            <div className="fx-panel">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={manual}
                  onChange={(e) => setManual(e.target.checked)}
                />
                Usar taxa manual
              </label>
              {manual ? (
                <label>
                  1 {from} equivale a quantos {to}?
                  <input
                    inputMode="decimal"
                    value={manualRate}
                    onChange={(e) => setManualRate(e.target.value)}
                    placeholder="Ex.: 5,25"
                    aria-invalid={!!rateError}
                    aria-describedby={rateError ? "rate-error" : undefined}
                  />
                  {rateError && (
                    <small id="rate-error" className="field-error">
                      {rateError}
                    </small>
                  )}
                  <small>Taxa informada por você, sem consulta externa.</small>
                </label>
              ) : (
                <>
                  <div className="fx-status" role="status">
                    {fx.loading
                      ? "Consultando cotação diária…"
                      : fx.error ||
                        (fx.data
                          ? fx.data.source === "stale"
                            ? "Não foi possível confirmar uma cotação atual. Usando a última cotação salva."
                            : fx.data.source === "cache"
                              ? "Cotação diária salva neste navegador."
                              : "Cotação diária consultada."
                          : "Preparando consulta…")}
                  </div>
                  {fx.data && (
                    <p>
                      Atualizada em{" "}
                      {new Date(fx.data.quote.updatedAt).toLocaleString(
                        "pt-BR",
                      )}
                      .
                      {rate === null &&
                        " Esta moeda não está disponível na cotação recebida."}
                    </p>
                  )}
                  {rate !== null && (
                    <p className="rate-value">
                      1 {from} ={" "}
                      {new Intl.NumberFormat("pt-BR", {
                        maximumFractionDigits: 6,
                      }).format(rate)}{" "}
                      {to}
                    </p>
                  )}
                  <button
                    type="button"
                    className="text-button"
                    onClick={fx.refresh}
                    disabled={fx.loading}
                  >
                    {fx.loading ? "Consultando…" : "Atualizar cotação"}
                  </button>
                  <a
                    className="provider-link"
                    href="https://www.exchangerate-api.com"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Rates By Exchange Rate API ↗
                  </a>
                </>
              )}
            </div>
          )}
        </section>
        <section
          className="preview-panel salary-results"
          aria-labelledby="results-title"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="eyebrow">SUA REMUNERAÇÃO EM PERSPECTIVA</span>
          <h2 id="results-title">Equivalentes em {to}</h2>
          <p>
            {different
              ? manual
                ? "Estimativa com a taxa manual."
                : "Estimativa com a cotação diária indicada."
              : "Mesma moeda, diferentes períodos."}
          </p>
          {results ? (
            <>
              <div className="salary-result-grid">
                {periods.map((p) => (
                  <div
                    key={p.key}
                    className={`salary-result ${period === p.key ? "selected-result" : ""}`}
                  >
                    <span>
                      {p.label}
                      {period === p.key && <small>Período informado</small>}
                    </span>
                    <strong>{formatMoney(results[p.key], to)}</strong>
                    {different && original && (
                      <small>
                        {formatMoney(original[p.key], from)} na origem
                      </small>
                    )}
                  </div>
                ))}
              </div>
              <p className="calculation-basis">
                Base: {hours} h/semana · {weeks} semanas/ano · 12 meses/ano.
              </p>
            </>
          ) : (
            <div className="salary-empty">
              <Icon name="salary" />
              <p>
                {!valid
                  ? "Revise os campos indicados para ver os resultados."
                  : rate === null
                    ? "Os resultados em outra moeda aparecerão quando houver uma cotação válida. Você também pode informar uma taxa manual."
                    : "O valor excede o limite de cálculo. Informe um valor menor."}
              </p>
            </div>
          )}
          <div className="salary-explanation">
            <h3>Como comparar uma proposta PJ?</h3>
            <p>
              Informe o valor mensal desejado, mantenha BRL nas duas moedas e
              ajuste sua jornada. O equivalente por hora será calculado com essa
              base.
            </p>
            <p>
              Os valores são proporcionais, antes de impostos, taxas, benefícios
              e 13º. Não representam salário líquido ou um cálculo trabalhista.
            </p>
          </div>
        </section>
      </div>
      <Link className="related-link" to="/timezones">
        Explore também: Fusos horários <Icon name="arrow" />
      </Link>
    </>
  );
}
