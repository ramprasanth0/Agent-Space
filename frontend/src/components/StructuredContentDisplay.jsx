export default function StructuredContentDisplay({ content }) {
  if (!content) return null;

  return (
    <div className="p-2 space-y-3">
      {/* Answer - always present */}
      <div>{content.answer}</div>

      {/* Other fields only if they exist */}
      {content.explanation && (
        <div className="prose prose-sm">
          <h4 className="font-semibold">Explanation:</h4>
          <p>{content.explanation}</p>
        </div>
      )}

      {content.code && (
        <div>
          <div className="text-xs opacity-70 mb-1">Code ({content.language || 'text'}):</div>
          <pre className="bg-black/10 p-2 rounded text-sm overflow-x-auto">
            <code>{content.code}</code>
          </pre>
        </div>
      )}

      {content.facts && content.facts.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm mb-2">Key Facts:</h4>
          <ul className="list-disc list-inside space-y-1">
            {content.facts.map((fact, i) => <li key={i}>{fact}</li>)}
          </ul>
        </div>
      )}

      {content.actions && content.actions.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm mb-2">Tool Actions:</h4>
          <div className="space-y-2">
            {content.actions.map((action, i) => (
              <div key={i} className="card card-compact bg-base-200 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title text-base">Tool: <span className="badge badge-primary">{action.tool}</span></h5>
                  {action.parameters && <p>Parameters: {action.parameters.join(', ')}</p>}
                  {action.result && <p>Result: {action.result}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {content.sources && content.sources.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm mb-2">Sources:</h4>
          <ul className="list-disc list-inside">
            {content.sources.map((s, i) => (
              <li key={i}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="link link-primary">
                  {s.title || s.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {content.extra && content.extra.length > 0 && (
        <div>
          <h4 className="font-semibold text-sm mb-2">Metadata:</h4>
          <div className="flex flex-wrap gap-2">
            {content.extra.map((item, i) => (
              <div key={i} className="badge badge-outline">
                <span className="font-bold mr-1">{item.key}:</span> {item.value}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}