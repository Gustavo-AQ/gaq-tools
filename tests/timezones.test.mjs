import test from "node:test";
import assert from "node:assert/strict";
import {
  convertTime,
  resolveTime,
  makeInterval,
  compareIntervals,
  clockText,
} from "../src/tools/timezones/timezones.ts";

test("UTC to Sao Paulo and prior-day rollover", () => {
  const result = convertTime("2026-09-09", "01:30", "UTC", "America/Sao_Paulo");
  assert.equal(clockText(result.destination), "22:30");
  assert.equal(result.destination.toPlainDate().toString(), "2026-09-08");
  assert.equal(result.dayDifference, -1);
  assert.equal(result.offsetMinutes, -180);
});
test("New York summer and winter use date-specific offsets", () => {
  assert.equal(
    clockText(
      convertTime(
        "2026-07-15",
        "09:00",
        "America/New_York",
        "America/Sao_Paulo",
      ).destination,
    ),
    "10:00",
  );
  assert.equal(
    clockText(
      convertTime(
        "2026-01-15",
        "09:00",
        "America/New_York",
        "America/Sao_Paulo",
      ).destination,
    ),
    "11:00",
  );
});
test("fractional offsets and international date line", () => {
  assert.equal(
    clockText(
      convertTime("2026-06-01", "09:00", "UTC", "Asia/Kolkata").destination,
    ),
    "14:30",
  );
  assert.equal(
    clockText(
      convertTime("2026-06-01", "09:00", "UTC", "Asia/Kathmandu").destination,
    ),
    "14:45",
  );
  const result = convertTime(
    "2026-06-01",
    "23:00",
    "Pacific/Honolulu",
    "Pacific/Kiritimati",
  );
  assert.equal(result.dayDifference, 1);
  assert.equal(clockText(result.destination), "23:00");
});
test("nonexistent time rejected and repeated time needs explicit occurrence", () => {
  for (const choice of ["reject", "earlier", "later"])
    assert.throws(
      () => resolveTime("2026-03-08", "02:30", "America/New_York", choice),
      /não existe/,
    );
  assert.throws(
    () => resolveTime("2026-11-01", "01:30", "America/New_York"),
    /ocorre duas vezes/,
  );
  const early = resolveTime(
    "2026-11-01",
    "01:30",
    "America/New_York",
    "earlier",
  );
  const late = resolveTime("2026-11-01", "01:30", "America/New_York", "later");
  assert.equal(late.epochMilliseconds - early.epochMilliseconds, 3600000);
});
test("invalid date, clock and zone cannot silently normalize", () => {
  for (const [date, time, zone] of [
    ["2026-02-30", "09:00", "UTC"],
    ["", "09:00", "UTC"],
    ["2026-01-01", "25:00", "UTC"],
    ["2026-01-01", "09:00", "invalid/zone"],
  ])
    assert.throws(() => resolveTime(date, time, zone));
});
test("overnight interval and DST duration reflect actual elapsed time", () => {
  assert.equal(
    makeInterval("2026-06-01", "22:00", "06:00", "UTC").minutes,
    480,
  );
  assert.equal(
    makeInterval("2026-03-08", "00:00", "04:00", "America/New_York").minutes,
    180,
  );
  assert.equal(
    makeInterval("2026-11-01", "00:00", "04:00", "America/New_York").minutes,
    300,
  );
  assert.throws(
    () => makeInterval("2026-06-01", "09:00", "09:00", "UTC"),
    /diferentes/,
  );
});
test("partial, full, zero and boundary-only overlap", () => {
  const work = makeInterval("2026-07-15", "09:00", "17:00", "America/New_York");
  const partial = compareIntervals(
    work,
    makeInterval("2026-07-15", "09:00", "16:00", "America/Sao_Paulo"),
  );
  assert.equal(partial.minutes, 360);
  assert.equal(partial.percent, 75);
  assert.equal(clockText(partial.start), "10:00");
  assert.equal(clockText(partial.end), "16:00");
  assert.equal(
    compareIntervals(
      work,
      makeInterval("2026-07-15", "09:00", "18:00", "America/Sao_Paulo"),
    ).percent,
    100,
  );
  for (const times of [
    ["18:00", "20:00"],
    ["19:00", "21:00"],
  ])
    assert.equal(
      compareIntervals(
        work,
        makeInterval("2026-07-15", ...times, "America/Sao_Paulo"),
      ).minutes,
      0,
    );
});
test("overlap honors availability date and midnight", () => {
  const work = makeInterval("2026-06-01", "22:00", "06:00", "UTC");
  assert.equal(
    compareIntervals(work, makeInterval("2026-06-02", "00:00", "04:00", "UTC"))
      .minutes,
    240,
  );
  assert.equal(
    compareIntervals(work, makeInterval("2026-06-03", "00:00", "04:00", "UTC"))
      .minutes,
    0,
  );
});
test("conversion round trip preserves instant", () => {
  const forward = convertTime(
    "2026-07-15",
    "09:15",
    "Europe/Lisbon",
    "Asia/Tokyo",
  );
  const back = convertTime(
    forward.destination.toPlainDate().toString(),
    clockText(forward.destination),
    "Asia/Tokyo",
    "Europe/Lisbon",
  );
  assert.equal(
    back.destination.epochMilliseconds,
    forward.source.epochMilliseconds,
  );
});
