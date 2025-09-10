import CopyButton from './CopyButton';


// component indegrating copying to clipboard funcion icon with hook
export default function CodeBlock({ code = '', language = '' }) {
  const lines = String(code).trimEnd().split('\n');

  return (
    <div className="my-3">
      {language && <div className="badge badge-primary badge-sm mb-1">{language}</div>}
      <div className="relative">
        <div className="absolute right-2 top-2 z-10">
          <CopyButton text={code} tooltip="Copy code" />
        </div>
        <div className="mockup-code bg-base-200 text-left">
          {lines.map((line, idx) => (
            <pre key={idx} data-prefix=">" className="text-sm">
              <code>{line}</code>
            </pre>
          ))}
        </div>
      </div>
    </div>
  );
}
