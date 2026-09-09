export const CACHE_KEY = "gaq-tools.exchange.v1";
export const ENDPOINT = "https://open.er-api.com/v6/latest/BRL";
export type Quote = {
  rates: Record<string, number>;
  updatedAt: number;
  nextUpdate: number;
};
export type ExchangeResult = {
  quote: Quote;
  source: "daily" | "cache" | "stale";
};
type StorageLike = Pick<Storage, "getItem" | "setItem">;

export function validateQuote(value: unknown): Quote | null {
  if (!value || typeof value !== "object") return null;
  const q = value as Quote;
  if (
    !Number.isFinite(q.updatedAt) ||
    q.updatedAt <= 0 ||
    q.updatedAt > Date.now() + 300000 ||
    !Number.isFinite(q.nextUpdate) ||
    q.nextUpdate <= q.updatedAt ||
    q.nextUpdate - q.updatedAt > 3 * 86400000 ||
    !q.rates ||
    typeof q.rates !== "object" ||
    q.rates.BRL !== 1
  )
    return null;
  if (
    !Object.values(q.rates).every(
      (rate) => typeof rate === "number" && Number.isFinite(rate) && rate > 0,
    )
  )
    return null;
  return q;
}

export function readCache(storage?: StorageLike): Quote | null {
  try {
    return validateQuote(JSON.parse(storage?.getItem(CACHE_KEY) ?? "null"));
  } catch {
    return null;
  }
}

export async function loadQuote({
  force = false,
  storage,
  request = fetch,
}: {
  force?: boolean;
  storage?: StorageLike;
  request?: typeof fetch;
} = {}): Promise<ExchangeResult> {
  const cached = readCache(storage);
  if (!force && cached && cached.nextUpdate > Date.now())
    return { quote: cached, source: "cache" };
  try {
    const response = await request(ENDPOINT, {
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("Cotação indisponível.");
    const data = await response.json();
    const quote =
      data.result === "success" && data.base_code === "BRL"
        ? validateQuote({
            rates: data.rates,
            updatedAt: data.time_last_update_unix * 1000,
            nextUpdate: data.time_next_update_unix * 1000,
          })
        : null;
    if (!quote) throw new Error("Resposta de câmbio inválida.");
    try {
      storage?.setItem(CACHE_KEY, JSON.stringify(quote));
    } catch {
      /* Storage is optional. */
    }
    return {
      quote,
      source: quote.nextUpdate <= Date.now() ? "stale" : "daily",
    };
  } catch {
    if (cached) return { quote: cached, source: "stale" };
    throw new Error(
      "Não foi possível obter a cotação. Tente novamente ou informe uma taxa manual.",
    );
  }
}

let pending: Promise<ExchangeResult> | null = null;
export function getQuote(force = false) {
  if (pending) return pending;
  let storage: StorageLike | undefined;
  try {
    storage = window.localStorage;
  } catch {
    /* Private browsers can deny storage. */
  }
  pending = loadQuote({ force, storage }).finally(() => {
    pending = null;
  });
  return pending;
}
