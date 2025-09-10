import { useCopyToClipboard } from '../hooks/useCopyToClipboard';


function CopyIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"{...props}>
        <path fill="currentColor" d="M8 2h10c1.1 0 2 .9 2 2v10h-2V4H8V2zM5 6h10c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2zm0 12h10V8H5v10z"/>
    </svg>

  );
}

function CheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/>
    </svg>
  );
}

// Copy Icon with copy to clipboard functionality
export default function CopyButton({ text, tooltip = 'Copy code' }) {
  const { copied, isSupported, copy } = useCopyToClipboard();

  if (!isSupported) return null;

  return (
    <button
      type="button"
      onClick={() => copy(text)}
      aria-label={copied ? 'Copied' : 'Copy to clipboard'}
      className="btn btn-xs btn-ghost text-xs"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      <span className="sr-only">{tooltip}</span>
    </button>
  );
}
