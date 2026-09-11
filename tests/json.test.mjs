import test from "node:test";
import assert from "node:assert/strict";

import {
  parseJson,
  formatJson,
  minifyJson,
  validateJson,
} from "../src/tools/json/json.ts";

test("valid JSON is parsed correctly", () => {
  assert.deepEqual(parseJson('{"name":"GAQ CLOUD","active":true}'), {
    name: "GAQ CLOUD",
    active: true,
  });

  assert.deepEqual(parseJson("[1,2,3]"), [1, 2, 3]);

  assert.equal(parseJson("null"), null);
  assert.equal(parseJson("123"), 123);
  assert.equal(parseJson('"GAQ Tools"'), "GAQ Tools");
});

test("empty input is rejected", () => {
  assert.throws(() => parseJson(""), /Cole ou digite um JSON/);
  assert.throws(() => parseJson("   "), /Cole ou digite um JSON/);
});

test("invalid JSON is rejected", () => {
  for (const value of [
    '{"name":"GAQ CLOUD",}',
    "{name: 'GAQ CLOUD'}",
    '{"a":1',
    "[1,2,]",
    "undefined",
  ]) {
    assert.throws(() => parseJson(value));
  }
});

test("JSON is formatted with two-space indentation", () => {
  const result = formatJson(
    '{"project":"GAQ CLOUD","services":["Coolify","Beszel"]}',
  );

  assert.equal(
    result,
    `{
  "project": "GAQ CLOUD",
  "services": [
    "Coolify",
    "Beszel"
  ]
}`,
  );
});

test("JSON is minified correctly", () => {
  const result = minifyJson(`
    {
      "project": "GAQ CLOUD",
      "active": true
    }
  `);

  assert.equal(result, '{"project":"GAQ CLOUD","active":true}');
});

test("nested objects and arrays survive format/minify round trip", () => {
  const original = {
    project: "GAQ CLOUD",
    services: [
      {
        name: "GAQ Tools",
        routes: ["/salary", "/timezones", "/json"],
      },
    ],
    config: {
      active: true,
      count: 3,
    },
  };

  const input = JSON.stringify(original);

  assert.deepEqual(JSON.parse(formatJson(input)), original);
  assert.deepEqual(JSON.parse(minifyJson(input)), original);
});

test("validateJson accepts valid JSON and rejects invalid JSON", () => {
  assert.equal(validateJson('{"valid":true}'), true);
  assert.equal(validateJson("[]"), true);

  assert.throws(() => validateJson('{"invalid":}'));
});