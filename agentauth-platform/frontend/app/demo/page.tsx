'use client'

import { useState, useRef, useEffect, useCallback, type CSSProperties } from 'react'
import ResultCard, { type Agent } from '@/components/ResultCard'
import ExecutionPanel from '@/components/ExecutionPanel'

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/$/, '')
const IS_PLACEHOLDER =
  !BACKEND_URL ||
  BACKEND_URL === 'https://your-backend-url' ||
  BACKEND_URL === '[INSERT YOUR DEPLOYED BACKEND URL HERE]'

const DEFAULT_CORPUS = 1247

// ─── MOCK DATA ───
const MOCK: Record<string, Agent[]> = {
  'run browser automation tasks': [
    { id: 'browsermcp-mcp', name: 'browsermcp/mcp', description: 'Full browser automation over MCP. Control Chrome, navigate pages, click elements, fill forms, and extract content from any website.', capabilities: ['browser automation', 'web access', 'content extraction'], tools: ['navigate', 'click', 'extract'], score: 0.60, source_url: 'https://github.com/browsermcp/mcp' },
    { id: 'hanzili-comet', name: 'hanzili/comet-mcp', description: 'Connect to Perplexity Comet browser for agentic web browsing, deep research, and real-time task monitoring across the web.', capabilities: ['browser automation', 'research', 'monitoring'], tools: ['search', 'browse', 'list'], score: 0.57, source_url: 'https://github.com/hanzili/comet-mcp' },
    { id: 'apireno-domshell', name: 'apireno/DOMShell', description: 'Browse the web using filesystem commands (ls, cd, grep, click). 38 MCP tools map Chrome accessibility tree to a virtual filesystem via a Chrome Extension.', capabilities: ['browser automation', 'file system access', 'code execution'], tools: ['list', 'click', 'read'], score: 0.54, source_url: 'https://github.com/apireno/DOMShell' },
    { id: 'operative-web-eval', name: 'operative_sh/web-eval-agent', description: 'Autonomous web evaluation agent. Navigate, interact, and extract structured data from websites with natural language instructions.', capabilities: ['browser automation', 'web access'], tools: ['navigate', 'extract', 'analyze'], score: 0.51, source_url: 'https://github.com/operative-sh/web-eval-agent' },
    { id: 'puppeteer-mcp', name: 'modelcontextprotocol/puppeteer', description: 'Official MCP server for Puppeteer. Browser automation, screenshots, PDF generation, and programmatic web interaction.', capabilities: ['browser automation', 'image processing'], tools: ['navigate', 'screenshot', 'execute'], score: 0.49, source_url: 'https://github.com/modelcontextprotocol/servers' },
  ],
  'transcribe and analyze audio': [
    { id: 'samson-transcriptor', name: 'samson-art/transcriptor-mcp', description: 'Audio transcription MCP server. Supports multiple languages, speaker diarization, and timestamped output for AI analysis pipelines.', capabilities: ['audio processing', 'transcription', 'language processing'], tools: ['transcribe', 'analyze', 'read'], score: 0.61, source_url: 'https://github.com/samson-art/transcriptor-mcp' },
    { id: 'subdownload-mcp', name: 'SubDownload/subdownload-mcp', description: 'YouTube knowledge base for AI agents. Summarize videos, fetch full transcripts including videos without captions via AI ASR, search channels and playlists.', capabilities: ['audio processing', 'knowledge management', 'transcription'], tools: ['read', 'write', 'search'], score: 0.55, source_url: 'https://github.com/SubDownload/subdownload-mcp' },
    { id: 'youtube-transcript', name: 'kimtaeyoon83/mcp-server-youtube-transcript', description: 'Fetch YouTube subtitles and transcripts for AI analysis. Supports automatic captions and manual subtitles across all available languages.', capabilities: ['audio processing', 'content extraction'], tools: ['read', 'search'], score: 0.52, source_url: 'https://github.com/kimtaeyoon83/mcp-server-youtube-transcript' },
    { id: 'whisper-mcp', name: 'whisper-mcp/server', description: 'Local Whisper transcription server via MCP. Transcribe audio files offline with OpenAI Whisper models, no API key required.', capabilities: ['audio processing', 'transcription'], tools: ['transcribe', 'read'], score: 0.50, source_url: 'https://github.com/whisper-mcp/server' },
    { id: 'mcp-summarizer', name: '0xshellming/mcp-summarizer', description: 'AI summarization MCP server supporting multiple content types: plain text, web pages, PDF documents, EPUB books, and HTML content.', capabilities: ['knowledge management', 'content processing'], tools: ['transform', 'read'], score: 0.47, source_url: 'https://github.com/0xshellming/mcp-summarizer' },
  ],
  'search and extract from the web': [
    { id: 'smithery-search', name: 'search', description: 'Highest accuracy web search for AIs. Fast, structured results with source URLs and relevance scoring optimized for agent consumption.', capabilities: ['web search', 'content extraction'], tools: ['search', 'read'], score: 0.55, source_url: 'https://smithery.ai/server/search' },
    { id: 'brave-search-mcp', name: 'modelcontextprotocol/brave-search', description: 'Official MCP server for Brave Search API. Web, news, images, and video search with independent index not influenced by ad spend.', capabilities: ['web search', 'news retrieval'], tools: ['search'], score: 0.52, source_url: 'https://github.com/modelcontextprotocol/servers' },
    { id: 'fetch-mcp', name: 'modelcontextprotocol/fetch', description: 'Official MCP fetch server. Retrieve and process web content, converting HTML to markdown for clean AI consumption.', capabilities: ['content extraction', 'web access'], tools: ['read', 'transform'], score: 0.51, source_url: 'https://github.com/modelcontextprotocol/servers' },
    { id: 'firecrawl-mcp', name: 'mendableai/firecrawl-mcp', description: 'Web scraping and crawling via Firecrawl API. Extract structured data from any URL, crawl entire sites, and handle JavaScript-rendered content.', capabilities: ['web search', 'content extraction', 'scraping'], tools: ['read', 'search', 'extract'], score: 0.50, source_url: 'https://github.com/mendableai/firecrawl-mcp-server' },
    { id: 'exa-mcp', name: 'exa-labs/exa-mcp-server', description: 'Official Exa MCP server. Neural search over the web with semantic understanding. Optimized for AI agents retrieving factual, up-to-date information.', capabilities: ['web search', 'knowledge retrieval'], tools: ['search', 'read'], score: 0.49, source_url: 'https://github.com/exa-labs/exa-mcp-server' },
  ],
  'summarize documents and web pages': [
    { id: 'mcp-summarizer-2', name: '0xshellming/mcp-summarizer', description: 'AI summarization MCP server supporting multiple content types: plain text, web pages, PDF documents, EPUB books, and HTML content with configurable output length.', capabilities: ['content processing', 'summarization', 'knowledge extraction'], tools: ['transform', 'read', 'analyze'], score: 0.63, source_url: 'https://github.com/0xshellming/mcp-summarizer' },
    { id: 'firecrawl-sum', name: 'mendableai/firecrawl-mcp', description: 'Web scraping and crawling via Firecrawl API. Extract structured data from any URL and convert pages to clean markdown summaries for AI consumption.', capabilities: ['content extraction', 'summarization', 'web access'], tools: ['read', 'search', 'transform'], score: 0.59, source_url: 'https://github.com/mendableai/firecrawl-mcp-server' },
    { id: 'fetch-sum', name: 'modelcontextprotocol/fetch', description: 'Official MCP fetch server. Retrieve and process web content, converting HTML to clean markdown with automatic noise removal for AI summarization pipelines.', capabilities: ['content extraction', 'web access'], tools: ['read', 'transform'], score: 0.55, source_url: 'https://github.com/modelcontextprotocol/servers' },
    { id: 'subdownload-sum', name: 'SubDownload/subdownload-mcp', description: 'YouTube knowledge base for AI agents. Fetch transcripts and generate video summaries including auto-captioned content via AI ASR.', capabilities: ['audio processing', 'summarization', 'content extraction'], tools: ['read', 'search', 'transform'], score: 0.51, source_url: 'https://github.com/SubDownload/subdownload-mcp' },
    { id: 'brave-sum', name: 'modelcontextprotocol/brave-search', description: 'Brave Search MCP server. Retrieve and summarize web search results with independent indexing, optimized for factual research and content aggregation.', capabilities: ['web search', 'content extraction', 'news retrieval'], tools: ['search', 'read'], score: 0.47, source_url: 'https://github.com/modelcontextprotocol/servers' },
  ],
  'send messages and team notifications': [
    { id: 'slack-mcp', name: 'modelcontextprotocol/slack', description: 'Official Slack MCP server. Send messages, create channels, manage threads, upload files, and interact with workspaces programmatically via the Slack API.', capabilities: ['messaging', 'team collaboration', 'notification delivery'], tools: ['write', 'read', 'search'], score: 0.64, source_url: 'https://github.com/modelcontextprotocol/servers' },
    { id: 'discord-mcp', name: 'v-3/discordmcp', description: 'Discord MCP server. Send messages, manage channels, read message history, and interact with Discord servers and DMs from agent workflows.', capabilities: ['messaging', 'team collaboration'], tools: ['write', 'read'], score: 0.58, source_url: 'https://github.com/v-3/discordmcp' },
    { id: 'ntfy-mcp', name: 'teddybeermaniac/mcp-ntfy', description: 'Push notification delivery via ntfy.sh. Send rich notifications with priorities, tags, and action buttons to any device or webhook endpoint.', capabilities: ['notification delivery', 'messaging'], tools: ['write', 'execute'], score: 0.53, source_url: 'https://github.com/teddybeermaniac/mcp-ntfy' },
    { id: 'telegram-mcp', name: 'aiogram/telegram-mcp', description: 'Telegram bot MCP integration. Send messages, photos, and documents to Telegram users and groups. Supports inline keyboards and formatted messages.', capabilities: ['messaging', 'notification delivery'], tools: ['write', 'read'], score: 0.49, source_url: 'https://github.com/aiogram/telegram-mcp' },
    { id: 'email-mcp', name: 'Shy/mcp-email', description: 'Email MCP server using SMTP and IMAP. Send formatted emails, read inbox, manage folders, and automate email-based notification workflows.', capabilities: ['messaging', 'notification delivery', 'automation'], tools: ['write', 'read', 'search'], score: 0.45, source_url: 'https://github.com/Shy/mcp-email' },
  ],
  'automate my browser': [
    { id: 'browsermcp-mcp-2', name: 'browsermcp/mcp', description: 'Full browser automation over MCP. Control Chrome, navigate pages, click elements, fill forms, and extract content from any website.', capabilities: ['browser automation', 'web access', 'content extraction'], tools: ['navigate', 'click', 'extract'], score: 0.62, source_url: 'https://github.com/browsermcp/mcp' },
    { id: 'playwright-mcp', name: 'microsoft/playwright-mcp', description: 'Official Microsoft Playwright MCP server. Cross-browser automation for Chrome, Firefox, and Safari with full API access.', capabilities: ['browser automation', 'testing', 'web access'], tools: ['navigate', 'click', 'screenshot'], score: 0.58, source_url: 'https://github.com/microsoft/playwright-mcp' },
    { id: 'puppeteer-mcp-2', name: 'modelcontextprotocol/puppeteer', description: 'Official Puppeteer MCP server. Headless Chrome automation, screenshots, PDF generation, and programmatic web interaction.', capabilities: ['browser automation', 'image processing'], tools: ['navigate', 'screenshot', 'execute'], score: 0.54, source_url: 'https://github.com/modelcontextprotocol/servers' },
    { id: 'selenium-mcp', name: 'selenium-mcp/server', description: 'Selenium WebDriver via MCP. Cross-browser automation with support for Chrome, Firefox, Edge, and Safari on local or remote grids.', capabilities: ['browser automation', 'testing'], tools: ['navigate', 'click', 'extract'], score: 0.50, source_url: 'https://github.com/selenium-mcp/server' },
    { id: 'comet-mcp-2', name: 'hanzili/comet-mcp', description: 'Connect to Perplexity Comet browser for agentic web browsing, deep research, and real-time task monitoring.', capabilities: ['browser automation', 'research'], tools: ['search', 'browse', 'list'], score: 0.47, source_url: 'https://github.com/hanzili/comet-mcp' },
  ],
}

// ─── EXEC TEMPLATES ───
const EXEC_TEMPLATES: Record<string, { request: string; response: string }> = {
  browser: {
    request: `{
  "agent_id": "$ID",
  "task": "navigate_and_extract",
  "payload": {
    "url": "https://example.com/pricing",
    "instructions": "Extract all pricing tiers and features",
    "format": "structured_json"
  },
  "auth": {
    "cert_hash": "sha256:a3f9b2...",
    "scope": ["navigate", "extract"],
    "issued_at": "2026-05-31T09:14:02Z"
  }
}`,
    response: `{
  "status": "success",
  "agent_id": "$ID",
  "result": {
    "tiers": [
      { "name": "Starter", "price": "$29/mo", "features": ["5 agents", "10k requests"] },
      { "name": "Pro",     "price": "$99/mo", "features": ["Unlimited agents", "1M requests"] }
    ],
    "extracted_at": "2026-05-31T09:14:11Z",
    "confidence": 0.94
  }
}`,
  },
  audio: {
    request: `{
  "agent_id": "$ID",
  "task": "transcribe",
  "payload": {
    "source": "base64://[video_bytes]",
    "format": "mp4",
    "language": "auto",
    "diarize": true
  },
  "auth": {
    "cert_hash": "sha256:b2c1a8...",
    "scope": ["transcribe", "read"],
    "issued_at": "2026-05-31T09:14:02Z"
  }
}`,
    response: `{
  "status": "success",
  "agent_id": "$ID",
  "result": {
    "transcript": "Welcome to the Q2 product review. Today we'll cover...",
    "duration_seconds": 847,
    "speakers": ["Speaker A", "Speaker B"],
    "language": "en",
    "confidence": 0.97
  }
}`,
  },
  default: {
    request: `{
  "agent_id": "$ID",
  "task": "execute",
  "payload": {
    "query": "[user task]",
    "format": "structured"
  },
  "auth": {
    "cert_hash": "sha256:c9d2e1...",
    "scope": ["read", "write"],
    "issued_at": "2026-05-31T09:14:02Z"
  }
}`,
    response: `{
  "status": "success",
  "agent_id": "$ID",
  "result": {
    "output": "[task completed successfully]",
    "completed_at": "2026-05-31T09:14:11Z"
  }
}`,
  },
}

function getExecTemplate(name: string) {
  const n = name.toLowerCase()
  if (n.includes('browser') || n.includes('puppeteer') || n.includes('playwright') || n.includes('selenium') || n.includes('dom'))
    return EXEC_TEMPLATES.browser
  if (n.includes('audio') || n.includes('transcript') || n.includes('whisper') || n.includes('subdownload'))
    return EXEC_TEMPLATES.audio
  return EXEC_TEMPLATES.default
}

type UiState = 'initial' | 'loading' | 'results' | 'error' | 'lowconf'

interface ExecPanelState {
  agentName: string
  agentId: string
  request: string
  response: string
}

const pageStyle = { '--mw': '860px' } as CSSProperties

export default function Demo() {
  const [query, setQuery] = useState('')
  const [corpusSize, setCorpusSize] = useState(DEFAULT_CORPUS)
  const [uiState, setUiState] = useState<UiState>('initial')
  const [results, setResults] = useState<Agent[]>([])
  const [queryTimeMs, setQueryTimeMs] = useState(0)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [lowconfMsg, setLowconfMsg] = useState('')
  const [activeChip, setActiveChip] = useState<string | null>(null)
  const [openIdPanels, setOpenIdPanels] = useState<Set<number>>(new Set())
  const [execPanel, setExecPanel] = useState<ExecPanelState | null>(null)
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [charCount, setCharCount] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [cancelVisible, setCancelVisible] = useState(false)

  const abortRef = useRef<AbortController | null>(null)
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const execPanelRef = useRef<HTMLDivElement>(null)
  const resultAreaRef = useRef<HTMLDivElement>(null)

  const isSubmitDisabled = query.trim().length < 3 || uiState === 'loading'

  // Health check on mount
  useEffect(() => {
    if (!IS_PLACEHOLDER) {
      fetch(`${BACKEND_URL}/health`)
        .then(r => r.json())
        .then((d: { corpus_size?: number }) => {
          if (d.corpus_size) setCorpusSize(d.corpus_size)
        })
        .catch(() => {})
    }
  }, [])

  const runSearch = useCallback(async (q: string) => {
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()

    setExecPanel(null)
    setSelectedCard(null)
    setOpenIdPanels(new Set())
    setCancelVisible(true)
    setShowHint(false)
    setUiState('loading')
    setLoadingMsg(`Searching ${corpusSize.toLocaleString()} agents...`)
    setTimeout(() => {
      resultAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)

    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current)
    phaseTimerRef.current = setTimeout(() => {
      setLoadingMsg('Backend warming up — this can take 10–20 seconds on first load. Hang tight.')
    }, 3000)

    try {
      let fetchedResults: Agent[]
      let ms: number
      const mockData = MOCK[q]

      if (IS_PLACEHOLDER && mockData) {
        await new Promise(r => setTimeout(r, 800 + Math.random() * 400))
        fetchedResults = mockData
        ms = Math.round(140 + Math.random() * 60)
      } else if (!IS_PLACEHOLDER) {
        const t0 = Date.now()
        const timeoutSignal = AbortSignal.timeout(8000)
        const combinedSignal = AbortSignal.any
          ? AbortSignal.any([abortRef.current.signal, timeoutSignal])
          : abortRef.current.signal

        const res = await fetch(`${BACKEND_URL}/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: q }),
          signal: combinedSignal,
        })
        ms = Date.now() - t0

        if (res.status === 503) {
          const data = await res.json()
          throw new Error(data.detail || 'The search service is unavailable. Try again in a moment.')
        }
        if (res.status === 400) {
          const data = await res.json()
          throw new Error(data.detail || data.error || 'Invalid search query.')
        }
        if (!res.ok) {
          throw new Error(`Search failed (${res.status})`)
        }
        const data = await res.json()
        fetchedResults = (data.results || []).map((r: Agent & { similarity_score?: number }) => ({
          ...r,
          score: r.score ?? r.similarity_score ?? 0,
        }))
        ms = data.query_time_ms || ms
      } else {
        throw new Error('No results available for custom queries without a configured backend. Try one of the example chips above.')
      }

      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current)
      setCancelVisible(false)

      if (!fetchedResults || fetchedResults.length === 0) {
        showLowConf(q)
        return
      }

      const topScore = fetchedResults[0].score
      if (topScore < 0.55) {
        showLowConf(q)
        return
      }

      setResults(fetchedResults)
      setQueryTimeMs(ms)
      setUiState('results')
      setTimeout(() => {
        resultAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
    } catch (err: unknown) {
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current)
      setCancelVisible(false)

      if (err instanceof Error) {
        if (err.name === 'AbortError') return
        if (err.message.includes('timeout') || err.message.includes('8 seconds') || err.name === 'TimeoutError') {
          setErrorMsg('The search service timed out. This sometimes happens on cold start — wait a few seconds and try again.')
        } else {
          setErrorMsg(err.message || 'The search service is unavailable. The backend may be sleeping — try again in a moment.')
        }
      } else {
        setErrorMsg('An unexpected error occurred. Please try again.')
      }
      setUiState('error')
      setTimeout(() => {
        resultAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
    }
  }, [corpusSize])

  function showLowConf(_q: string) {
    const size = corpusSize.toLocaleString()
    setLowconfMsg(`No strong matches in this prototype's corpus of ${size} MCP servers. This is what the gap looks like at small scale. A production index at Exa scale would surface agents from across the agent web, including ones not yet aggregated in any registry.`)
    setUiState('lowconf')
    setTimeout(() => {
      resultAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setQuery(val)
    setCharCount(val.length)
    setShowHint(false)
    if (activeChip) setActiveChip(null)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isSubmitDisabled) handleSubmit()
    }
  }

  function handleSubmit() {
    const q = query.trim()
    if (q.length < 3) { setShowHint(true); return }
    runSearch(q)
  }

  function handleCancel() {
    if (abortRef.current) abortRef.current.abort()
    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current)
    setCancelVisible(false)
    setUiState('initial')
  }

  function handleChip(q: string) {
    setQuery(q)
    setActiveChip(q)
    setShowHint(false)
    setCharCount(q.length)
    runSearch(q)
  }

  function toggleIdPanel(index: number) {
    setOpenIdPanels(prev => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  function useAgent(index: number, name: string, id: string) {
    setSelectedCard(index)
    const tmpl = getExecTemplate(name)
    setExecPanel({
      agentName: name,
      agentId: id,
      request: tmpl.request.replace(/\$ID/g, id),
      response: tmpl.response.replace(/\$ID/g, id),
    })
    setTimeout(() => {
      execPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 50)
  }

  const charCounterClass =
    charCount > 275 ? 'char-counter over' :
    charCount > 200 ? 'char-counter warn' : 'char-counter'

  return (
    <div style={pageStyle}>
      <div className="demo-frame">
        <div className="w">
          <div className="frame-label">LIVE DEMO</div>
          <p className="frame-narrative">
            An agent has a task. It needs to find another agent with the right capability and verify it can be trusted.{' '}
            <em>Here is what that looks like.</em>
          </p>

          {/* CHIPS */}
          <div className="chips">
            {[
              'run browser automation tasks',
              'transcribe and analyze audio',
              'search and extract from the web',
              'summarize documents and web pages',
              'send messages and team notifications',
              'automate my browser',
            ].map(q => (
              <button
                key={q}
                className={`chip${activeChip === q ? ' active' : ''}`}
                onClick={() => handleChip(q)}
              >
                {q}
              </button>
            ))}
          </div>

          {/* SEARCH INPUT */}
          <div className="search-box">
            <div className="search-input-row">
              <input
                type="text"
                id="query-input"
                placeholder="describe the capability you need"
                maxLength={300}
                autoComplete="off"
                value={query}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
              />
              <div className="search-actions">
                {cancelVisible && (
                  <button id="btn-cancel" onClick={handleCancel}>Cancel</button>
                )}
                <button
                  id="btn-submit"
                  disabled={isSubmitDisabled}
                  onClick={handleSubmit}
                >
                  Find agents
                </button>
              </div>
            </div>
            {charCount > 200 && (
              <div className={charCounterClass}>
                {300 - charCount} characters remaining
              </div>
            )}
            {showHint && (
              <div className="input-hint" style={{ display: 'block' }}>
                Describe a capability to search.
              </div>
            )}
          </div>

          {/* CORPUS STAT */}
          <div className="corpus-stat">
            Searching across <span>{corpusSize.toLocaleString()}</span> indexed agents.
          </div>

          {/* RESULT AREA */}
          <div id="result-area" ref={resultAreaRef}>
            <div className={`state state-initial${uiState === 'initial' ? ' visible' : ''}`}>
              Type a capability above, or select an example.
            </div>

            <div className={`state state-loading${uiState === 'loading' ? ' visible' : ''}`}>
              <div className="loading-msg">{loadingMsg}</div>
              <div className="loading-dots">
                <span /><span /><span />
              </div>
            </div>

            <div className={`state state-error${uiState === 'error' ? ' visible' : ''}`}>
              <p className="error-msg">{errorMsg}</p>
            </div>

            <div className={`state state-lowconf${uiState === 'lowconf' ? ' visible' : ''}`}>
              <div className="lowconf-inner">
                <div className="lowconf-label">No strong matches</div>
                <p className="lowconf-msg">{lowconfMsg}</p>
              </div>
            </div>

            <div className={`state state-results${uiState === 'results' ? ' visible' : ''}`}>
              <div className="result-meta">
                {results.length} agents found &middot; {queryTimeMs}ms
              </div>
              <p className="result-summary">
                AgentAuth searched{' '}
                <strong>{corpusSize.toLocaleString()} agent manifests</strong>{' '}
                for agents that can{' '}
                <strong>{query}</strong>.{' '}
                It returned{' '}
                <strong>{results.length} candidates</strong>{' '}
                and verified each identity card cryptographically &mdash;{' '}
                <span className="result-summary-pass">{results.length} of {results.length} passed</span>.
              </p>
              <div id="cards-container">
                {results.map((r, i) => (
                  <ResultCard
                    key={r.id}
                    result={r}
                    index={i}
                    isIdOpen={openIdPanels.has(i)}
                    onToggleId={toggleIdPanel}
                    onUseAgent={useAgent}
                    isSelected={selectedCard === i}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* EXECUTION PANEL */}
          {execPanel && (
            <div ref={execPanelRef}>
              <ExecutionPanel
                agentName={execPanel.agentName}
                request={execPanel.request}
                response={execPanel.response}
                onClose={() => { setExecPanel(null); setSelectedCard(null) }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
