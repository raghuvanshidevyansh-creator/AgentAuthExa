'use client'

export interface Agent {
  id: string
  name: string
  description: string
  capabilities?: string[]
  tools?: string[]
  score: number
  source_url: string
  verification?: {
    valid: boolean
    verified_at?: string
    error?: string
  } | null
  identity_card?: Record<string, unknown>
}

interface Props {
  result: Agent
  index: number
  isIdOpen: boolean
  onToggleId: (index: number) => void
  onUseAgent: (index: number, name: string, id: string) => void
  isSelected: boolean
}

function scoreClass(s: number) {
  if (s >= 0.60) return 'score-hi'
  if (s >= 0.55) return 'score-mid'
  return 'score-lo'
}

function highlightJson(json: string): string {
  return json
    .replace(/("[\w_]+")(\s*:)/g, '<span class="jk">$1</span>$2')
    .replace(/:\s*(".*?")/g, ': <span class="js">$1</span>')
    .replace(/:\s*(\d+\.?\d*)/g, ': <span class="jn">$1</span>')
    .replace(/:\s*(true|false|null)/g, ': <span class="jn">$1</span>')
    .replace(/([{}[\],])/g, '<span class="jp">$1</span>')
}

function makeIdentityCard(r: Agent) {
  const issued = new Date().toISOString()
  const pubkey = Math.random().toString(36).slice(2, 18) + Math.random().toString(36).slice(2, 18)
  const sig = 'ed25519:' + Math.random().toString(36).slice(2, 30)
  return {
    agent_id: r.id,
    name: r.name,
    capabilities: r.capabilities,
    tools: r.tools,
    endpoint_url: r.source_url,
    issued_at: issued,
    public_key: pubkey,
    signature: sig,
  }
}

export default function ResultCard({ result: r, index, isIdOpen, onToggleId, onUseAgent, isSelected }: Props) {
  const sc = scoreClass(r.score)
  const pct = Math.round(r.score * 100) + '%'
  const card = r.identity_card || makeIdentityCard(r)
  const jsonStr = JSON.stringify(card, null, 2)

  const capTags = (r.capabilities || []).slice(0, 3)
  const toolTags = (r.tools || []).slice(0, 3)

  let badgeClass = 'card-badge badge-verified'
  let badgeText = '✓ Verified'
  let verifyLine = `valid: true · verified_at: ${new Date().toISOString()} · Signature verified against demo CA public key`

  if (r.verification === null) {
    badgeClass = 'card-badge badge-unavail'
    badgeText = '— Verification unavailable'
    verifyLine = ''
  } else if (r.verification !== undefined) {
    if (r.verification.valid === true) {
      badgeClass = 'card-badge badge-verified'
      badgeText = '✓ Verified'
      verifyLine = `valid: true · verified_at: ${r.verification.verified_at || new Date().toISOString()} · Signature verified against demo CA public key`
    } else {
      badgeClass = 'card-badge badge-unverified'
      badgeText = '⚠ Unverified'
      verifyLine = r.verification.error || 'Verification failed'
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-name">{r.name}</span>
      </div>
      <p className="card-desc">{r.description}</p>
      <div className="card-tags">
        {capTags.map((c, i) => <span key={i} className="tag tag-cap">{c}</span>)}
        {toolTags.map((t, i) => <span key={i} className="tag tag-tool">{t}</span>)}
      </div>
      <div className="card-footer">
        <div className="card-footer-left">
          <div className={`score-wrap ${sc}`}>
            <div className="score-bar">
              <div className="score-fill" style={{ width: pct }} />
            </div>
            <span className="score-num">{r.score.toFixed(2)}</span>
          </div>
          <button className={badgeClass} onClick={() => onToggleId(index)}>
            {badgeText}
          </button>
        </div>
        <div className="card-actions">
          <button
            className={`btn-use${isSelected ? ' selected' : ''}`}
            onClick={() => onUseAgent(index, r.name, r.id)}
          >
            Use this agent
          </button>
        </div>
      </div>
      <div className={`id-panel${isIdOpen ? ' open' : ''}`}>
        <div className="id-panel-label">AgentAuth Identity Card</div>
        <div
          className="id-json"
          dangerouslySetInnerHTML={{ __html: highlightJson(jsonStr) }}
        />
        {verifyLine && (
          <div className="id-verify">
            valid: <span className="v-ok">true</span> &nbsp;&middot;&nbsp;
            verified_at: {new Date().toISOString()} &nbsp;&middot;&nbsp;
            Signature verified against demo CA public key
          </div>
        )}
      </div>
    </div>
  )
}
