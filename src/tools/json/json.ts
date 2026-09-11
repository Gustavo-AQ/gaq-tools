export function parseJson(value: string): unknown {
  if (!value.trim()) {
    throw new Error("Cole ou digite um JSON para continuar.");
  }

  return JSON.parse(value);
}

export function formatJson(value: string): string {
  return JSON.stringify(parseJson(value), null, 2);
}

export function minifyJson(value: string): string {
  return JSON.stringify(parseJson(value));
}

export function validateJson(value: string): boolean {
  parseJson(value);
  return true;
}