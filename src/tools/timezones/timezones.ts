import { Temporal } from "@js-temporal/polyfill";

export type Occurrence = "reject" | "earlier" | "later";
export type Zoned = Temporal.ZonedDateTime;
export type Interval = { start: Zoned; end: Zoned; minutes: number };

export const favoriteZones = [
  ["UTC", "UTC · Tempo universal"],
  ["America/Sao_Paulo", "São Paulo · Brasília"],
  ["America/Manaus", "Manaus"],
  ["America/Rio_Branco", "Rio Branco"],
  ["America/Noronha", "Fernando de Noronha"],
  ["America/New_York", "Nova York"],
  ["America/Chicago", "Chicago"],
  ["America/Denver", "Denver"],
  ["America/Los_Angeles", "Los Angeles"],
  ["America/Toronto", "Toronto"],
  ["America/Vancouver", "Vancouver"],
  ["Europe/London", "Londres"],
  ["Europe/Lisbon", "Lisboa"],
  ["Europe/Berlin", "Berlim"],
  ["Europe/Paris", "Paris"],
  ["Asia/Dubai", "Dubai"],
  ["Asia/Kolkata", "Índia · Kolkata"],
  ["Asia/Tokyo", "Tóquio"],
  ["Asia/Singapore", "Singapura"],
  ["Australia/Sydney", "Sydney"],
  ["Pacific/Auckland", "Auckland"],
] as const;

export function zoneLabel(zone: string) {
  return (
    favoriteZones.find(([id]) => id === zone)?.[1] ?? zone.replaceAll("_", " ")
  );
}

export function today(zone = "UTC") {
  return Temporal.Now.plainDateISO(zone).toString();
}

function plain(date: string, time: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time))
    throw new Error("Preencha uma data e um horário válidos.");
  try {
    const value = Temporal.PlainDateTime.from(`${date}T${time}`, {
      overflow: "reject",
    });
    if (value.year < 1900 || value.year > 2100) throw new Error();
    return value;
  } catch {
    throw new Error(
      "Use uma data válida entre 1900 e 2100 e um horário entre 00:00 e 23:59.",
    );
  }
}

export function resolveTime(
  date: string,
  time: string,
  zone: string,
  occurrence: Occurrence = "reject",
): Zoned {
  const value = plain(date, time);
  let early: Zoned;
  let late: Zoned;
  try {
    early = value.toZonedDateTime(zone, { disambiguation: "earlier" });
    late = value.toZonedDateTime(zone, { disambiguation: "later" });
  } catch {
    throw new Error("Escolha um fuso horário válido.");
  }
  if (
    !early.toPlainDateTime().equals(value) ||
    !late.toPlainDateTime().equals(value)
  )
    throw new Error(
      `${time} não existe em ${zoneLabel(zone)} nesta data devido a uma mudança de relógio. Escolha outro horário.`,
    );
  if (
    early.epochMilliseconds !== late.epochMilliseconds &&
    occurrence === "reject"
  )
    throw new Error(
      `${time} ocorre duas vezes em ${zoneLabel(zone)} nesta data. Em “Horários repetidos”, escolha a primeira ou a segunda ocorrência.`,
    );
  return occurrence === "later" ? late : early;
}

export function convertTime(
  date: string,
  time: string,
  from: string,
  to: string,
  occurrence: Occurrence = "reject",
) {
  const source = resolveTime(date, time, from, occurrence);
  let destination: Zoned;
  try {
    destination = source.withTimeZone(to);
  } catch {
    throw new Error("Escolha um fuso de destino válido.");
  }
  return {
    source,
    destination,
    dayDifference: source.toPlainDate().until(destination.toPlainDate()).days,
    offsetMinutes:
      (destination.offsetNanoseconds - source.offsetNanoseconds) / 60000000000,
  };
}

export function makeInterval(
  date: string,
  start: string,
  end: string,
  zone: string,
  occurrence: Occurrence = "reject",
): Interval {
  const startPlain = plain(date, start);
  plain(date, end);
  if (start === end)
    throw new Error("O início e o fim do expediente precisam ser diferentes.");
  const endDate =
    end < start ? startPlain.toPlainDate().add({ days: 1 }).toString() : date;
  const first = resolveTime(date, start, zone, occurrence);
  const last = resolveTime(endDate, end, zone, occurrence);
  const minutes = (last.epochMilliseconds - first.epochMilliseconds) / 60000;
  if (minutes <= 0)
    throw new Error(
      "O fim precisa ocorrer depois do início. Revise o expediente.",
    );
  return { start: first, end: last, minutes };
}

export function compareIntervals(work: Interval, available: Interval) {
  const first = Math.max(
    work.start.epochMilliseconds,
    available.start.epochMilliseconds,
  );
  const last = Math.min(
    work.end.epochMilliseconds,
    available.end.epochMilliseconds,
  );
  const minutes = Math.max(0, (last - first) / 60000);
  return {
    minutes,
    percent: (minutes / work.minutes) * 100,
    start:
      minutes > 0
        ? Temporal.Instant.fromEpochMilliseconds(first).toZonedDateTimeISO(
            available.start.timeZoneId,
          )
        : null,
    end:
      minutes > 0
        ? Temporal.Instant.fromEpochMilliseconds(last).toZonedDateTimeISO(
            available.start.timeZoneId,
          )
        : null,
  };
}

export function clockText(value: Zoned) {
  return value.toPlainTime().toString({ smallestUnit: "minute" });
}
export function dateText(value: Zoned) {
  return value
    .toPlainDate()
    .toLocaleString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
}
export function durationText(minutes: number) {
  const rounded = Math.round(Math.abs(minutes));
  const hours = Math.floor(rounded / 60);
  const remaining = rounded % 60;
  return `${hours} h${remaining ? ` ${remaining} min` : ""}`;
}

export function attempt<T>(
  callback: () => T,
): { value: T; error: null } | { value: null; error: string } {
  try {
    return { value: callback(), error: null };
  } catch (error) {
    return {
      value: null,
      error:
        error instanceof Error ? error.message : "Revise os dados informados.",
    };
  }
}
