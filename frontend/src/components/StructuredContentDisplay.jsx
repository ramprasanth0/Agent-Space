import ReactMarkdown from 'react-markdown';

export default function StructuredContentDisplay({ content }) {
  if (!content) return null;

  return (
    <div className="space-y-4 text-[var(--color-response_card_content)]">
      {/* Answer with proper markdown rendering */}
      <div className="prose prose-sm max-w-none prose-invert">
        {/* <div className={`prose prose-sm max-w-none prose-invert ${isStreaming ? 'streaming-text' : ''}`}> */}
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              const language = match ? match[1] : '';

              if (!inline && match) {
                const codeLines = String(children).trim().split('\n');
                return (
                  <div className="my-3">
                    {language && (
                      <div className="badge badge-primary badge-sm mb-1">{language}</div>
                    )}
                    <div className="mockup-code bg-base-200 text-left">
                      {codeLines.map((line, index) => (
                        <pre key={index} data-prefix=">" className="text-sm">
                          <code>{line}</code>
                        </pre>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <code className="kbd kbd-sm" {...props}>
                  {children}
                </code>
              );
            },
            p: ({ children }) => <div className="mb-3">{children}</div>,
            ul: ({ children }) => <ul className="list-disc pl-4 mb-3">{children}</ul>,
            li: ({ children }) => <li className="mb-1">{children}</li>,
          }}
        >
          {content.answer}
        </ReactMarkdown>
      </div>

      {/* Explanation */}
      {content.explanation && (
        <div className="alert bg-neutral border-0">
          <div>
            <h4 className="font-semibold text-sm mb-1">💡 Explanation</h4>
            <p className="text-sm">{content.explanation}</p>
          </div>
        </div>
      )}

      {/* Separate code field - now with multi-line prefix */}
      {content.code && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Additional Code</span>
            {content.language && (
              <div className="badge badge-ghost badge-sm">{content.language}</div>
            )}
          </div>
          <div className="mockup-code bg-base-200 text-left">
            {/* Split the code by newline and map each line to a <pre> tag */}
            {String(content.code).trim().split('\n').map((line, index) => (
              <pre key={index} data-prefix=">" className="text-sm">
                <code>{line}</code>
              </pre>
            ))}
          </div>
        </div>
      )}

      {/* Facts with icons */}
      {
        content.facts && content.facts.length > 0 && (
          <div className="card bg-primary/70">
            <div className="card-body p-4">
              <h4 className="card-title text-sm">📌 Key Facts</h4>
              <ul className="space-y-2">
                {content.facts.map((fact, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-sm">{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )
      }

      {/* Sources with better styling */}
      {
        content.sources && content.sources.length > 0 && (
          <div className="card bg-primary/40">
            <div className="card-body p-4">
              <h4 className="card-title text-sm">🔗 Sources</h4>
              <div className="space-y-2">
                {content.sources.map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm link hover:link-hover"
                  >
                    <span className="text-base-content">{i + 1}.</span>
                    {s.title || s.url}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )
      }

      {/* Actions - if present */}
      {
        content.actions && content.actions.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">🔧 Tool Actions</h4>
            {content.actions.map((action, i) => (
              <div key={i} className="card card-compact bg-base-200">
                <div className="card-body">
                  <div className="flex items-center gap-2">
                    <span className="badge badge-primary">{action.tool}</span>
                  </div>
                  {action.parameters && (
                    <p className="text-sm">Parameters: {action.parameters.join(', ')}</p>
                  )}
                  {action.result && (
                    <p className="text-sm">Result: {action.result}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      }

      {/* Extra metadata */}
      {
        content.extra && content.extra.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {content.extra.map((item, i) => (
              <div key={i} className="badge badge-outline gap-1">
                <span className="font-bold">{item.key}:</span>
                <span>{item.value}</span>
              </div>
            ))}
          </div>
        )
      }
    </div >
  );
}