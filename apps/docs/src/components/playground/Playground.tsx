import { useState, useCallback, useEffect } from "react";
import { parse, parseMany, isValid, isPossible } from "phoneng";
import type { ParseResult, BatchResult, Network } from "phoneng";
import {
  Copy,
  CheckCircle,
  AlertTriangle,
  Phone,
  Radio,
  Hash,
} from "lucide-react";

const networkColors: Record<string, { bg: string; text: string }> = {
  MTN: { bg: "#ffcc00", text: "#000000" },
  AIRTEL: { bg: "#e60000", text: "#ffffff" },
  GLO: { bg: "#00a550", text: "#ffffff" },
  NINE_MOBILE: { bg: "#006666", text: "#ffffff" },
  NTEL: { bg: "#1a1a1a", text: "#ffffff" },
  VISAFONE: { bg: "#ff6600", text: "#ffffff" },
  SMILE: { bg: "#00bfff", text: "#ffffff" },
  MAFAB: { bg: "#6b21a8", text: "#ffffff" },
  UNKNOWN: { bg: "#6b7280", text: "#ffffff" },
};

const presets = [
  { label: "08031234567", value: "08031234567", desc: "MTN mobile" },
  { label: "+2347011234567", value: "+2347011234567", desc: "Airtel E.164" },
  { label: "2348051234567", value: "2348051234567", desc: "Glo compact" },
  { label: "not-a-number", value: "not-a-number", desc: "Invalid input" },
  { label: "0703 123 4567", value: "0703 123 4567", desc: "MTN with spaces" },
];

const errorMessages: Record<string, string> = {
  EMPTY_INPUT: "No input provided. Please enter a phone number.",
  INVALID_CHARACTERS: "Input contains letters or invalid characters.",
  INVALID_LENGTH: "The phone number has an invalid length.",
  INVALID_COUNTRY_CODE: "The country code is not recognized as Nigerian.",
  INVALID_PREFIX: "The prefix is not assigned to any Nigerian mobile operator.",
  TOO_SHORT: "The phone number is too short for a valid Nigerian number.",
  TOO_LONG: "The phone number is too long for a valid Nigerian number.",
  NOT_NIGERIAN: "This does not appear to be a Nigerian phone number.",
};

function formatNetwork(network: Network): string {
  if (network === "NINE_MOBILE") return "9mobile";
  return network.charAt(0) + network.slice(1).toLowerCase();
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard not available
    }
  }, [value]);

  return (
    <button
      type="button"
      onClick={copy}
      className="flex h-6 w-6 items-center justify-center rounded-[6px] text-[var(--color-tertiary-label)] transition-colors hover:bg-[var(--color-fill)] hover:text-[var(--color-label)]"
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <CheckCircle
          size={14}
          strokeWidth={2}
          className="text-[var(--color-success)]"
        />
      ) : (
        <Copy size={14} strokeWidth={2} />
      )}
    </button>
  );
}

function FormatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[10px] bg-[var(--color-bg-secondary)] px-3 py-2">
      <div>
        <span className="block text-[11px] text-[var(--color-tertiary-label)]">
          {label}
        </span>
        <span className="font-mono text-[14px] text-[var(--color-label)]">
          {value}
        </span>
      </div>
      <CopyButton value={value} />
    </div>
  );
}

function NetworkBadge({ network }: { network: Network }) {
  const colors = networkColors[network];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-[6px] px-2 py-1 text-[12px] font-medium"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <Radio size={14} strokeWidth={2.5} aria-hidden="true" />
      {formatNetwork(network)}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-[6px] bg-[var(--color-fill)] px-2 py-1 text-[12px] font-medium text-[var(--color-label)]">
      <Phone size={14} strokeWidth={2} aria-hidden="true" />
      {type}
    </span>
  );
}

function SuccessResult({ result }: { result: ParseResult & { valid: true } }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <NetworkBadge network={result.network} />
        <TypeBadge type={result.type} />
        <span className="inline-flex items-center gap-1 rounded-[6px] bg-[var(--color-fill)] px-2 py-1 text-[12px] font-medium text-[var(--color-label)]">
          <Hash size={14} strokeWidth={2.5} aria-hidden="true" />
          {result.prefix}
        </span>
      </div>
      <div className="grid gap-2">
        <FormatRow label="E.164" value={result.e164} />
        <FormatRow label="National" value={result.national} />
        <FormatRow label="International" value={result.international} />
        <FormatRow label="Compact" value={result.compact} />
        <FormatRow label="RFC 3966" value={result.rfc3966} />
      </div>
    </div>
  );
}

function FailureResult({ result }: { result: ParseResult & { valid: false } }) {
  return (
    <div className="rounded-[10px] bg-[var(--color-danger)]/10 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle
          size={20}
          strokeWidth={2}
          className="mt-0.5 shrink-0 text-[var(--color-danger)]"
        />
        <div>
          <p className="font-medium text-[var(--color-danger)]">
            {result.reason}
          </p>
          <p className="mt-1 text-[13px] text-[var(--color-secondary-label)]">
            {errorMessages[result.reason]}
          </p>
          <p className="mt-2 font-mono text-[12px] text-[var(--color-tertiary-label)]">
            Input: "{result.input}"
          </p>
        </div>
      </div>
    </div>
  );
}

function BatchSummary({ result }: { result: BatchResult }) {
  const { summary } = result;
  const total = summary.total;
  const validPercent = total > 0 ? (summary.valid / total) * 100 : 0;
  const invalidPercent = total > 0 ? (summary.invalid / total) * 100 : 0;

  const networkEntries = Object.entries(summary.byNetwork)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="space-y-4">
      <div className="flex gap-4 text-[14px]">
        <div>
          <span className="text-[var(--color-tertiary-label)]">Total: </span>
          <span className="font-medium text-[var(--color-label)]">{total}</span>
        </div>
        <div>
          <span className="text-[var(--color-tertiary-label)]">Valid: </span>
          <span className="font-medium text-[var(--color-success)]">
            {summary.valid}
          </span>
        </div>
        <div>
          <span className="text-[var(--color-tertiary-label)]">Invalid: </span>
          <span className="font-medium text-[var(--color-danger)]">
            {summary.invalid}
          </span>
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-[var(--color-fill)]">
        <div className="flex h-full">
          <div
            className="bg-[var(--color-success)]"
            style={{ width: `${validPercent}%` }}
          />
          <div
            className="bg-[var(--color-danger)]"
            style={{ width: `${invalidPercent}%` }}
          />
        </div>
      </div>

      {networkEntries.length > 0 && (
        <div className="space-y-2">
          <p className="text-[12px] font-medium text-[var(--color-tertiary-label)]">
            BY NETWORK
          </p>
          <div className="space-y-1">
            {networkEntries.map(([network, count]) => {
              const percent = (count / summary.valid) * 100;
              const colors = networkColors[network];
              return (
                <div key={network} className="flex items-center gap-2">
                  <span
                    className="w-20 text-[12px] font-medium"
                    style={{ color: colors.bg }}
                  >
                    {formatNetwork(network as Network)}
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-fill)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: colors.bg,
                      }}
                    />
                  </div>
                  <span className="w-8 text-right text-[12px] text-[var(--color-secondary-label)]">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function BatchResults({ result }: { result: BatchResult }) {
  return (
    <div className="max-h-[300px] space-y-2 overflow-y-auto">
      {result.results.map((r, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-[10px] bg-[var(--color-bg-secondary)] px-3 py-2"
        >
          <div className="flex items-center gap-3">
            <span
              className={`h-2 w-2 rounded-full ${r.valid ? "bg-[var(--color-success)]" : "bg-[var(--color-danger)]"}`}
              aria-label={r.valid ? "Valid" : "Invalid"}
            />
            <span className="font-mono text-[13px] text-[var(--color-label)]">
              {r.valid ? r.e164 : r.input}
            </span>
          </div>
          {r.valid ? (
            <NetworkBadge network={r.network} />
          ) : (
            <span className="text-[12px] text-[var(--color-danger)]">
              {r.reason}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

export function Playground() {
  const [input, setInput] = useState("");
  const [batchMode, setBatchMode] = useState(false);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null);
  const [liveStatus, setLiveStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!input.trim()) {
      setLiveStatus(null);
      return;
    }

    if (batchMode) {
      setLiveStatus(null);
      return;
    }

    const possible = isPossible(input);
    const valid = isValid(input);

    if (valid) {
      setLiveStatus("Valid Nigerian phone number");
    } else if (possible) {
      setLiveStatus("Correct length, checking prefix...");
    } else {
      setLiveStatus("Invalid format");
    }
  }, [input, batchMode]);

  const handleParse = useCallback(() => {
    if (!input.trim()) return;

    if (batchMode) {
      const lines = input
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      setBatchResult(parseMany(lines));
      setResult(null);
    } else {
      setResult(parse(input));
      setBatchResult(null);
    }
  }, [input, batchMode]);

  const handlePreset = useCallback((value: string) => {
    setInput(value);
    setBatchMode(false);
    setResult(parse(value));
    setBatchResult(null);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (input.trim()) {
        handleParse();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [input, handleParse]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div>
          <label
            htmlFor="phone-input"
            className="mb-2 block text-[13px] font-medium text-[var(--color-label)]"
          >
            {batchMode ? "Phone Numbers (one per line)" : "Phone Number"}
          </label>
          {batchMode ? (
            <textarea
              id="phone-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="08031234567&#10;+2347011234567&#10;08051234567"
              className="h-32 w-full resize-none rounded-[10px] border border-[var(--color-separator)] bg-[var(--color-bg)] px-3 py-2 font-mono text-[15px] text-[var(--color-label)] outline-none transition-colors placeholder:text-[var(--color-tertiary-label)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
            />
          ) : (
            <input
              id="phone-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="08031234567"
              className="w-full rounded-[10px] border border-[var(--color-separator)] bg-[var(--color-bg)] px-3 py-2 font-mono text-[15px] text-[var(--color-label)] outline-none transition-colors placeholder:text-[var(--color-tertiary-label)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20"
            />
          )}
          {liveStatus && !batchMode && (
            <p
              className={`mt-2 text-[13px] ${liveStatus.includes("Valid") ? "text-[var(--color-success)]" : liveStatus.includes("Invalid") ? "text-[var(--color-danger)]" : "text-[var(--color-secondary-label)]"}`}
            >
              {liveStatus}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setBatchMode(!batchMode);
              setResult(null);
              setBatchResult(null);
            }}
            className={`flex h-8 items-center gap-2 rounded-[10px] px-3 text-[13px] transition-colors ${
              batchMode
                ? "bg-[var(--color-accent)] text-white"
                : "bg-[var(--color-fill)] text-[var(--color-label)] hover:bg-[var(--color-separator)]"
            }`}
          >
            Batch Mode
          </button>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[var(--color-tertiary-label)]">
            Presets
          </p>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => handlePreset(preset.value)}
                className="rounded-[6px] bg-[var(--color-fill)] px-2 py-1 font-mono text-[12px] text-[var(--color-secondary-label)] transition-colors hover:bg-[var(--color-separator)] hover:text-[var(--color-label)]"
                title={preset.desc}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[10px] bg-[var(--color-bg-secondary)] p-4">
        <h3 className="mb-4 text-[13px] font-medium text-[var(--color-label)]">
          {batchMode ? "Batch Results" : "Parse Result"}
        </h3>

        {!result && !batchResult && (
          <p className="text-[13px] text-[var(--color-tertiary-label)]">
            Enter a phone number to see the parsed result.
          </p>
        )}

        {result && (
          <>
            {result.valid ? (
              <SuccessResult result={result} />
            ) : (
              <FailureResult result={result} />
            )}
          </>
        )}

        {batchResult && (
          <div className="space-y-6">
            <BatchSummary result={batchResult} />
            <div>
              <p className="mb-2 text-[12px] font-medium text-[var(--color-tertiary-label)]">
                INDIVIDUAL RESULTS
              </p>
              <BatchResults result={batchResult} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
