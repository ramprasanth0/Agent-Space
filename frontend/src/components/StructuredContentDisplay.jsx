export default function StructuredContentDisplay({ content }) {
  if (!content) return null;
  
  return (
    <div className="space-y-3">
      {/* Answer - always present */}
      <div>{content.answer}</div>
      
      {/* Other fields only if they exist */}
      {content.explanation && (
        <div className="text-sm opacity-90">{content.explanation}</div>
      )}
      
      {content.code && (
        <div>
          <div className="text-xs opacity-70 mb-1">Code ({content.language || 'text'}):</div>
          <pre className="bg-black/10 p-2 rounded text-sm overflow-x-auto">
            <code>{content.code}</code>
          </pre>
        </div>
      )}
      
      {content.sources?.length > 0 && (
        <div>
          <div className="text-xs opacity-70 mb-1">Sources:</div>
          {content.sources.map((src, i) => (
            <a key={i} href={src.url} target="_blank" className="block text-blue-400 hover:underline text-sm">
              → {src.title || src.url}
            </a>
          ))}
        </div>
      )}
      
      {content.facts?.length > 0 && (
        <div>
          <div className="text-xs opacity-70 mb-1">Facts:</div>
          <ul className="list-disc list-inside text-sm">
            {content.facts.map((fact, i) => (
              <li key={i}>{fact}</li>
            ))}
          </ul>
        </div>
      )}
      
      {content.actions?.length > 0 && (
        <div>
          <div className="text-xs opacity-70 mb-1">Actions:</div>
          {content.actions.map((action, i) => (
            <div key={i} className="text-sm">
              • {action.tool}: {action.result}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}