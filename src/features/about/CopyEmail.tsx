'use client';

import { useEffect, useState } from 'react';
import { CheckIcon, CopyIcon } from '@/components/icons';
import { sound } from '@/features/sound';

/** The email written out, with a button that copies it. */
export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      sound.play('blip');
    } catch {
      // Clipboard access can be refused. The address is still visible and selectable.
    }
  };

  return (
    <div className="flex items-center gap-3">
      <a href={`mailto:${email}`} className="text-sm text-white underline-offset-4 hover:underline">
        {email}
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy email address"
        className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-grey-700 px-3.5 text-xs text-grey-300 transition-colors hover:border-white hover:text-white sm:min-h-0 sm:px-2.5 sm:py-1"
      >
        {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
        <span aria-hidden="true">{copied ? 'Copied' : 'Copy'}</span>
      </button>
      <span role="status" className="sr-only">
        {copied ? 'Email address copied' : ''}
      </span>
    </div>
  );
}
