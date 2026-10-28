import { useEffect, useRef, useState } from 'react';

export function CopyField({ value, label }: { value: string; label: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Older browsers / non-secure contexts: select-and-copy fallback.
      inputRef.current?.select();
      if (!document.execCommand('copy')) return;
    }
    setCopied(true);
  }

  return (
    <div className="field">
      <label htmlFor="share-link">{label}</label>
      <div className="row">
        <input
          id="share-link"
          ref={inputRef}
          type="text"
          readOnly
          value={value}
          onFocus={(e) => e.target.select()}
        />
        <button className="btn btn-primary" onClick={copy}>
          Copy
        </button>
      </div>
      <span className="muted" role="status" aria-live="polite">
        {copied ? '✓ Copied' : ''}
      </span>
    </div>
  );
}
