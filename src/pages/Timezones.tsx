import { useState } from "react";
import { Link } from "react-router";
import { Icon } from "../components/Icon";
import {
  attempt,
  clockText,
  compareIntervals,
  convertTime,
  dateText,
  durationText,
  favoriteZones,
  makeInterval,
  today,
  zoneLabel,
  type Occurrence,
  type Zoned,
} from "../tools/timezones/timezones";
import "../tools/timezones/timezones.css";

const otherZones = (() => {
  try {
    return Intl.supportedValuesOf("timeZone").filter(
      (zone) => !favoriteZones.some(([id]) => id === zone),
    );
  } catch {
    return [];
  }
})();

function ZoneSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <optgroup label="Mais usados">
          {favoriteZones.map(([id, name]) => (
            <option key={id} value={id}>
              {name} · {id}
            </option>
          ))}
        </optgroup>
        <optgroup label="Outros fusos">
          {otherZones.map((id) => (
            <option key={id} value={id}>
              {id.replaceAll("_", " ")}
            </option>
          ))}
        </optgroup>
      </select>
    </label>
  );
}

function TimeCard({
  value,
  label,
  accent = false,
}: {
  value: Zoned;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className={`tz-time-card ${accent ? "tz-destination" : ""}`}>
      <span className="eyebrow">{label}</span>
      <h3>{zoneLabel(value.timeZoneId)}</h3>
      <strong>{clockText(value)}</strong>
      <p>{dateText(value)}</p>
      <small>
        UTC{value.offset} · {value.timeZoneId}
      </small>
    </div>
  );
}

export default function Timezones() {
  const [date, setDate] = useState(() => today());
  const [time, setTime] = useState("09:00");
  const [from, setFrom] = useState("UTC");
  const [to, setTo] = useState("America/Sao_Paulo");
  const [occurrence, setOccurrence] = useState<Occurrence>("reject");
  const [showWork, setShowWork] = useState(false);
  const [workEnd, setWorkEnd] = useState("17:00");
  const [availableDate, setAvailableDate] = useState("");
  const [availableStart, setAvailableStart] = useState("09:00");
  const [availableEnd, setAvailableEnd] = useState("18:00");
  const conversion = attempt(() =>
    convertTime(date, time, from, to, occurrence),
  );
  const converted = conversion.value;
  const localDate =
    availableDate || converted?.destination.toPlainDate().toString() || date;
  const comparison = showWork
    ? attempt(() => {
        const work = makeInterval(date, time, workEnd, from, occurrence);
        const available = makeInterval(
          localDate,
          availableStart,
          availableEnd,
          to,
          occurrence,
        );
        return { work, available, overlap: compareIntervals(work, available) };
      })
    : null;
  const shift = converted
    ? converted.dayDifference === 0
      ? "Mesmo dia"
      : converted.dayDifference === -1
        ? "Dia anterior"
        : converted.dayDifference === 1
          ? "Dia seguinte"
          : `${converted.dayDifference > 0 ? "+" : ""}${converted.dayDifference} dias`
    : "";
  function swap() {
    if (converted) {
      setDate(converted.destination.toPlainDate().toString());
      setTime(clockText(converted.destination));
    }
    setFrom(to);
    setTo(from);
    setAvailableDate("");
  }

  return (
    <>
      <Link className="back-link" to="/">
        ← Todas as ferramentas
      </Link>
      <section className="page-heading">
        <span className="eyebrow">TEMPO & PRODUTIVIDADE</span>
        <h1>Fusos horários</h1>
        <p>
          Traduza horários para o seu dia a dia e descubra se uma jornada
          combina com a sua.
        </p>
      </section>
      <div className="tz-workspace">
        <section
          className="preview-panel tz-form"
          aria-labelledby="timezone-form-title"
        >
          <div className="panel-heading">
            <span className="tool-icon">
              <Icon name="clock" />
            </span>
            <div>
              <h2 id="timezone-form-title">Que horas são para você?</h2>
              <p>Informe a data e o horário no local de origem.</p>
            </div>
          </div>
          <div className="field-grid">
            <label>
              Data na origem
              <input
                type="date"
                min="1900-01-01"
                max="2100-12-31"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label>
              {showWork
                ? "Início do expediente na origem"
                : "Horário na origem"}
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </label>
            <ZoneSelect
              label="Fuso de origem"
              value={from}
              onChange={setFrom}
            />
            <ZoneSelect
              label="Seu fuso de destino"
              value={to}
              onChange={(value) => {
                setTo(value);
                setAvailableDate("");
              }}
            />
          </div>
          <button
            className="tz-text-button"
            type="button"
            onClick={swap}
            disabled={showWork}
          >
            ⇄ Inverter conversão
          </button>
          {showWork && (
            <p className="tz-hint">
              Desative a comparação de jornadas para inverter a conversão.
            </p>
          )}
          <details className="tz-details">
            <summary>Horários repetidos</summary>
            <p>
              Quando o relógio é atrasado, um horário pode ocorrer duas vezes. A
              escolha abaixo vale para os horários repetidos nos campos desta
              página.
            </p>
            <label>
              Ocorrência em uma mudança de relógio
              <select
                value={occurrence}
                onChange={(e) => setOccurrence(e.target.value as Occurrence)}
              >
                <option value="reject">
                  Solicitar escolha se houver repetição
                </option>
                <option value="earlier">Primeira ocorrência</option>
                <option value="later">Segunda ocorrência</option>
              </select>
            </label>
          </details>
          {conversion.error && (
            <p className="tz-error" role="alert">
              {conversion.error}
            </p>
          )}
          <div className="tz-work-toggle">
            <label>
              <input
                type="checkbox"
                checked={showWork}
                onChange={(e) => setShowWork(e.target.checked)}
              />
              Comparar jornada de trabalho
            </label>
            <p>
              Confira quanto do expediente da vaga cabe na sua disponibilidade.
            </p>
          </div>
          {showWork && (
            <div className="tz-work-fields">
              <label>
                Fim do expediente na origem
                <input
                  type="time"
                  value={workEnd}
                  onChange={(e) => setWorkEnd(e.target.value)}
                />
              </label>
              <h3>Sua disponibilidade em {zoneLabel(to)}</h3>
              <label>
                Data da sua disponibilidade
                <input
                  type="date"
                  min="1900-01-01"
                  max="2100-12-31"
                  value={localDate}
                  onChange={(e) => setAvailableDate(e.target.value)}
                />
              </label>
              <p className="tz-hint">
                Por padrão, acompanha a data do início convertido. Escolha outra
                data se necessário.
              </p>
              {availableDate && (
                <button
                  className="tz-text-button"
                  type="button"
                  onClick={() => setAvailableDate("")}
                >
                  Acompanhar data convertida
                </button>
              )}
              <div className="field-grid">
                <label>
                  Disponível a partir de
                  <input
                    type="time"
                    value={availableStart}
                    onChange={(e) => setAvailableStart(e.target.value)}
                  />
                </label>
                <label>
                  Disponível até
                  <input
                    type="time"
                    value={availableEnd}
                    onChange={(e) => setAvailableEnd(e.target.value)}
                  />
                </label>
              </div>
              <p className="tz-hint">
                Fim anterior ao início significa dia seguinte. Intervalos iguais
                não são aceitos. Pausas não são descontadas.
              </p>
            </div>
          )}
        </section>
        <div className="tz-output" aria-live="polite">
          {converted ? (
            <section aria-label="Horário convertido">
              <div className="tz-time-grid">
                <TimeCard label="NA ORIGEM" value={converted.source} />
                <TimeCard
                  label="NO SEU FUSO"
                  value={converted.destination}
                  accent
                />
              </div>
              <div className="tz-difference">
                <span className="badge">{shift}</span>
                <p>
                  {converted.offsetMinutes === 0
                    ? "Os dois locais têm o mesmo horário nesta data."
                    : `O destino está ${durationText(converted.offsetMinutes)} ${converted.offsetMinutes > 0 ? "à frente" : "atrás"} da origem nesta data.`}
                </p>
              </div>
            </section>
          ) : (
            <section className="preview-panel tz-empty">
              <Icon name="clock" />
              <h2>Vamos encontrar seu horário.</h2>
              <p>Revise a data, o horário e os fusos para ver a conversão.</p>
            </section>
          )}
          {showWork && comparison && (
            <section
              className="preview-panel tz-comparison"
              aria-labelledby="comparison-title"
            >
              <span className="eyebrow">COMPATIBILIDADE DE JORNADA</span>
              <h2 id="comparison-title">Seu tempo em comum</h2>
              {comparison.error ? (
                <p className="tz-error" role="alert">
                  {comparison.error}
                </p>
              ) : (
                comparison.value &&
                (() => {
                  const { work, available, overlap } = comparison.value;
                  const start = work.start.withTimeZone(to);
                  const end = work.end.withTimeZone(to);
                  return (
                    <>
                      <div className="tz-overlap">
                        <strong>{durationText(overlap.minutes)}</strong>
                        <span>
                          {Math.round(overlap.percent)}% do expediente da vaga
                        </span>
                      </div>
                      <p className="tz-match">
                        {overlap.minutes === 0
                          ? "Os expedientes não coincidem."
                          : overlap.minutes === work.minutes
                            ? "Sua disponibilidade cobre todo o expediente."
                            : "Sua disponibilidade cobre parte do expediente."}
                      </p>
                      <div className="tz-interval">
                        <h3>Expediente da vaga no seu fuso</h3>
                        <p>
                          {dateText(start)} · <b>{clockText(start)}</b>
                          <br />
                          até {dateText(end)} · <b>{clockText(end)}</b>
                        </p>
                        <small>
                          Duração real: {durationText(work.minutes)} · UTC
                          {start.offset} → UTC{end.offset}
                        </small>
                      </div>
                      <div className="tz-interval">
                        <h3>Sua disponibilidade</h3>
                        <p>
                          {dateText(available.start)} ·{" "}
                          <b>{clockText(available.start)}</b>
                          <br />
                          até {dateText(available.end)} ·{" "}
                          <b>{clockText(available.end)}</b>
                        </p>
                        <small>
                          Duração real: {durationText(available.minutes)}
                        </small>
                      </div>
                      {overlap.start && overlap.end && (
                        <div className="tz-common">
                          <h3>Janela em comum · {zoneLabel(to)}</h3>
                          <p>
                            {dateText(overlap.start)} ·{" "}
                            <b>{clockText(overlap.start)}</b>
                            <br />
                            até {dateText(overlap.end)} ·{" "}
                            <b>{clockText(overlap.end)}</b>
                          </p>
                        </div>
                      )}
                      <p className="tz-hint">
                        Comparação para estas datas, sem repetição semanal. A
                        duração real considera eventuais mudanças do relógio.
                      </p>
                    </>
                  );
                })()
              )}
            </section>
          )}
          <aside className="tz-note">
            <Icon name="cloud" />
            <div>
              <h2>Seu horário, calculado aqui.</h2>
              <p>
                A conversão acontece no navegador, sem enviar seus horários a um
                serviço. As regras de fuso e horário de verão dependem da data e
                da base de fusos do navegador.
              </p>
            </div>
          </aside>
        </div>
      </div>
      <Link className="related-link" to="/salary">
        Explore também: Salário e moedas <Icon name="arrow" />
      </Link>
    </>
  );
}
