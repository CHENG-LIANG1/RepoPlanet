import type { FormEvent } from "react";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";

import { GitHubMark } from "@/components/icons/github-mark";

interface RepositoryFormProps {
  value: string;
  loading: boolean;
  error: string | null;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function RepositoryForm({
  value,
  loading,
  error,
  onChange,
  onSubmit,
}: RepositoryFormProps) {
  return (
    <form className="repository-form" onSubmit={onSubmit} noValidate>
      <label className="sr-only" htmlFor="repository-url">
        Public GitHub repository URL
      </label>
      <div className={`repository-input ${error ? "has-error" : ""}`}>
        <GitHubMark width={22} height={22} aria-hidden="true" />
        <input
          id="repository-url"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="github.com/facebook/react"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-describedby={error ? "repository-error" : undefined}
          aria-invalid={Boolean(error)}
        />
        {!error && value.trim() ? (
          <Check className="input-check" size={19} strokeWidth={2} aria-hidden="true" />
        ) : null}
      </div>
      {error ? (
        <p className="form-error" id="repository-error" role="alert">
          {error}
        </p>
      ) : null}
      <button
        className="generate-button"
        type="submit"
        disabled={loading}
        aria-label={loading ? "Mapping repository" : "Generate planet"}
      >
        <span>{loading ? "Mapping repository…" : "Generate planet"}</span>
        {loading ? (
          <LoaderCircle className="spin" size={21} strokeWidth={1.9} aria-hidden="true" />
        ) : (
          <ArrowRight size={22} strokeWidth={1.9} aria-hidden="true" />
        )}
      </button>
    </form>
  );
}
