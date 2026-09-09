import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateSalary,
  parseDecimal,
  crossRate,
} from "../src/tools/salary/calculator.ts";
import { loadQuote, validateQuote } from "../src/tools/salary/exchange.ts";

test("Brazilian amounts and invalid input", () => {
  for (const [input, value] of [
    ["5.000,50", 5000.5],
    ["5000,50", 5000.5],
    ["5000.50", 5000.5],
    ["5.000", 5000],
    ["0", 0],
    ["1.234.567,89", 1234567.89],
  ])
    assert.equal(parseDecimal(input), value);
  for (const input of [
    "",
    "-1",
    "NaN",
    "Infinity",
    "5abc",
    "1,2,3",
    "1e6",
    "5,000.50",
    "1.23.4",
  ])
    assert.equal(parseDecimal(input), null);
});
test("PJ monthly conversion and reverse hourly calculation", () => {
  const result = calculateSalary(8000, "monthly", 40, 52);
  assert.equal(result.annual, 96000);
  assert.equal(result.monthly, 8000);
  assert.ok(Math.abs(result.hourly - 46.15384615384615) < 1e-10);
  assert.ok(
    Math.abs(calculateSalary(result.hourly, "hourly", 40, 52).monthly - 8000) <
      1e-8,
  );
  assert.equal(calculateSalary(1000, "weekly", 40, 48).annual, 48000);
  assert.equal(calculateSalary(96000, "annual", 40, 48).hourly, 50);
});
test("bounds, zero and overflow never create invalid results", () => {
  assert.equal(calculateSalary(0, "monthly", 44, 52).annual, 0);
  for (const args of [
    [100, "monthly", 0, 52],
    [100, "monthly", 40, 0],
    [-1, "monthly", 40, 52],
    [100, "monthly", 169, 52],
    [100, "monthly", 40, 54],
    [Infinity, "monthly", 40, 52],
    [100, "monthly", 40, 52, 0],
    [Number.MAX_VALUE, "monthly", 40, 52],
  ])
    assert.equal(calculateSalary(...args), null);
});
test("cross currency conversion, same currency and missing rates", () => {
  assert.equal(crossRate({}, "BRL", "BRL"), 1);
  assert.equal(
    crossRate({ BRL: 1, USD: 0.2, EUR: 0.16 }, "USD", "EUR"),
    0.7999999999999999,
  );
  assert.equal(crossRate({ BRL: 1 }, "USD", "BRL"), null);
  assert.equal(calculateSalary(1000, "monthly", 40, 52, 5).monthly, 5000);
});
const current = () => ({
  rates: { BRL: 1, USD: 0.2 },
  updatedAt: Date.now() - 3600000,
  nextUpdate: Date.now() + 3600000,
});
const storageFor = (q) => {
  let value = JSON.stringify(q);
  return {
    getItem: () => value,
    setItem: (_, v) => {
      value = v;
    },
  };
};
test("fresh cache avoids network; expired cache survives outage", async () => {
  let calls = 0;
  const request = async () => {
    calls++;
    throw new Error("offline");
  };
  assert.equal(
    (await loadQuote({ storage: storageFor(current()), request })).source,
    "cache",
  );
  assert.equal(calls, 0);
  const stale = {
    ...current(),
    updatedAt: Date.now() - 86400000,
    nextUpdate: Date.now() - 1000,
  };
  assert.equal(
    (await loadQuote({ storage: storageFor(stale), request })).source,
    "stale",
  );
  assert.equal(calls, 1);
  await assert.rejects(loadQuote({ request }), /taxa manual/);
});
test("valid response cached, force refresh bypasses cache and storage errors are harmless", async () => {
  const q = current();
  let calls = 0;
  const request = async () => {
    calls++;
    return new Response(
      JSON.stringify({
        result: "success",
        base_code: "BRL",
        rates: q.rates,
        time_last_update_unix: q.updatedAt / 1000,
        time_next_update_unix: q.nextUpdate / 1000,
      }),
    );
  };
  assert.equal(
    (await loadQuote({ force: true, storage: storageFor(q), request })).source,
    "daily",
  );
  assert.equal(calls, 1);
  assert.equal(
    (
      await loadQuote({
        storage: {
          getItem() {
            throw Error();
          },
          setItem() {
            throw Error();
          },
        },
        request,
      })
    ).source,
    "daily",
  );
});
test("malformed responses and poisoned caches are rejected", async () => {
  assert.equal(
    validateQuote({ ...current(), rates: { BRL: 1, USD: -2 } }),
    null,
  );
  assert.equal(validateQuote({ ...current(), rates: { BRL: 2 } }), null);
  assert.equal(
    validateQuote({ ...current(), updatedAt: Date.now() + 86400000 }),
    null,
  );
  await assert.rejects(
    loadQuote({ request: async () => new Response("{broken") }),
  );
  await assert.rejects(
    loadQuote({ request: async () => new Response("{}", { status: 429 }) }),
  );
});
