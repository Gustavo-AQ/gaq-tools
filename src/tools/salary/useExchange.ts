import { useEffect, useState } from "react";
import { getQuote, type ExchangeResult } from "./exchange";

export function useExchange(enabled: boolean) {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{
    revision: number;
    data: ExchangeResult | null;
    error: string;
  } | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    getQuote(revision > 0)
      .then((result) => {
        if (active) setState({ revision, data: result, error: "" });
      })
      .catch((cause: unknown) => {
        if (active)
          setState({
            revision,
            data: null,
            error:
              cause instanceof Error ? cause.message : "Cotação indisponível.",
          });
      });
    return () => {
      active = false;
    };
  }, [enabled, revision]);
  const loading = enabled && state?.revision !== revision;
  return {
    data: state?.data ?? null,
    loading,
    error: loading ? "" : (state?.error ?? ""),
    refresh: () => setRevision((value) => value + 1),
  };
}
