'use client'

interface Props {
  agentName: string
  request: string
  response: string
  onClose: () => void
}

function highlightJson(json: string): string {
  return json
    .replace(/("[\w_]+")(\s*:)/g, '<span class="jk">$1</span>$2')
    .replace(/:\s*(".*?")/g, ': <span class="js">$1</span>')
    .replace(/:\s*(\d+\.?\d*)/g, ': <span class="jn">$1</span>')
    .replace(/:\s*(true|false|null)/g, ': <span class="jn">$1</span>')
    .replace(/([{}[\],])/g, '<span class="jp">$1</span>')
}

export default function ExecutionPanel({ agentName, request, response, onClose }: Props) {
  return (
    <div id="execution-panel" className="open">
      <div className="exec-banner">
        <span className="exec-banner-text">
          Sample &middot; Illustrative &mdash; In production, Exa routes the task to the verified agent and returns the result.
        </span>
        <button className="btn-close-exec" onClick={onClose}>&times; Close</button>
      </div>
      <div className="exec-body">
        <div className="exec-agent-name">{agentName}</div>
        <div className="exec-block">
          <div className="exec-block-label">Request</div>
          <div
            className="exec-json"
            dangerouslySetInnerHTML={{ __html: highlightJson(request) }}
          />
        </div>
        <div className="exec-block">
          <div className="exec-block-label">Response</div>
          <div
            className="exec-json"
            dangerouslySetInnerHTML={{ __html: highlightJson(response) }}
          />
        </div>
        <p className="exec-illustrative">
          Sample output, illustrative. Steps 1&ndash;4 of the demo are real. This execution step shows what the authorized handshake enables.
        </p>
      </div>
    </div>
  )
}
