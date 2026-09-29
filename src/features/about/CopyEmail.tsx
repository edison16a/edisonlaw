'use client';

import { useEffect, useState } from 'react';
import { CheckIcon } from '@/components/icons';
import { sound } from '@/features/sound';

/** The email written out. Clicking it copies the address, and a small check confirms it. */
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
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={copy}
        title="Copy email address"
        className="min-h-11 cursor-pointer text-left text-sm text-white underline-offset-4 hover:underline sm:min-h-0"
      >
        {email}
      </button>
      <span
        aria-hidden="true"
        className={`inline-flex items-center gap-1 text-xs text-grey-300 transition-opacity duration-200 ${copied ? 'opacity-100' : 'opacity-0'}`}
      >
        <CheckIcon size={14} />
        Copied
      </span>
      <span role="status" className="sr-only">
        {copied ? 'Email address copied' : ''}
      </span>
    </div>
  );
}
