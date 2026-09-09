export const periods = [
  { key: "monthly", label: "Mensal" },
  { key: "annual", label: "Anual" },
  { key: "weekly", label: "Semanal" },
  { key: "hourly", label: "Por hora" },
] as const;
export type Period = (typeof periods)[number]["key"];

export const currencies = [
  ["BRL", "Real brasileiro"],
  ["USD", "Dólar americano"],
  ["EUR", "Euro"],
  ["GBP", "Libra esterlina"],
  ["CAD", "Dólar canadense"],
  ["AUD", "Dólar australiano"],
  ["CHF", "Franco suíço"],
  ["JPY", "Iene japonês"],
] as const;
export type Currency = (typeof currencies)[number][0];

// A dot followed by exactly three digits is a Brazilian thousands separator.
// Ungrouped decimal-dot input is accepted too, e.g. 5000.50.
export function parseDecimal(raw: string): number | null {
  const text = raw.trim();
  let normalized: string;
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(text))
    normalized = text.replaceAll(".", "").replace(",", ".");
  else if (/^\d+(,\d+)?$/.test(text)) normalized = text.replace(",", ".");
  else if (/^\d+\.\d+$/.test(text)) normalized = text;
  else return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

export function calculateSalary(
  amount: number,
  period: Period,
  hours: number,
  weeks: number,
  rate = 1,
): Record<Period, number> | null {
  if (
    ![amount, hours, weeks, rate].every(Number.isFinite) ||
    amount < 0 ||
    hours <= 0 ||
    hours > 168 ||
    weeks <= 0 ||
    weeks > 53 ||
    rate <= 0
  )
    return null;
  const factors: Record<Period, number> = {
    annual: 1,
    monthly: 12,
    weekly: weeks,
    hourly: weeks * hours,
  };
  const annual = amount * factors[period] * rate;
  const result = {
    annual,
    monthly: annual / 12,
    weekly: annual / weeks,
    hourly: annual / weeks / hours,
  };
  return Object.values(result).every(Number.isFinite) ? result : null;
}

export function crossRate(
  rates: Record<string, number>,
  from: Currency,
  to: Currency,
): number | null {
  if (from === to) return 1;
  const rate = rates[to] / rates[from];
  return rates[from] > 0 && rates[to] > 0 && Number.isFinite(rate) && rate > 0
    ? rate
    : null;
}

export function formatMoney(value: number, currency: Currency) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
