import type { FormEvent } from "react";
import { ArrowRight, Check, LoaderCircle, RefreshCw } from "lucide-react";

import { GitHubMark } from "@/components/icons/github-mark";
import { parseRepositoryInput } from "@/lib/repository-url";

interface RepositoryFormProps {
  value: string;
  loading: boolean;
  error: string | null;
  generated: boolean;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function RepositoryForm({
  value,
  loading,
  error,
  generated,
  onChange,
  onSubmit,
}: RepositoryFormProps) {
  const hasValidUrl = Boolean(parseRepositoryInput(value));
  const actionLabel = loading
    ? "Generating world…"
    : generated
      ? "Regenerate world"
      : "Generate world";

  return (
    <form className="repository-form" onSubmit={onSubmit} noValidate>
      <label className="repository-label" htmlFor="repository-url">
        <span>GitHub repository URL</span>
        <small>GitHub only · public repos</small>
      </label>
      <div className={`repository-input ${error ? "has-error" : ""}`}>
        <GitHubMark width={22} height={22} aria-hidden="true" />
        <input
          id="repository-url"
          name="repository-url"
          type="url"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://github.com/owner/repository"
          inputMode="url"
          autoComplete="url"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          required
          aria-describedby={error ? "repository-error" : "repository-hint"}
          aria-invalid={Boolean(error)}
        />
        {!error && hasValidUrl ? (
          <Check className="input-check" size={19} strokeWidth={2} aria-hidden="true" />
        ) : null}
      </div>
      {error ? (
        <p className="form-error" id="repository-error" role="alert">
          {error}
        </p>
      ) : (
        <p className="repository-hint" id="repository-hint">
          Paste the complete URL. Other Git hosts aren’t supported.
        </p>
      )}
      <button
        className="generate-button"
        type="submit"
        disabled={loading}
        aria-label={actionLabel}
      >
        <span>{actionLabel}</span>
        {loading ? (
          <LoaderCircle className="spin" size={21} strokeWidth={1.9} aria-hidden="true" />
        ) : generated ? (
          <RefreshCw size={21} strokeWidth={1.9} aria-hidden="true" />
        ) : (
          <ArrowRight size={22} strokeWidth={1.9} aria-hidden="true" />
        )}
      </button>
    </form>
  );
}
