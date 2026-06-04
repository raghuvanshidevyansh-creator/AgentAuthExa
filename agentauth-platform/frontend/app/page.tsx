import type { Metadata } from 'next'
import Link from 'next/link'
import ScrollReveal from '@/components/ScrollReveal'
import AuditTrail from '@/components/AuditTrail'
import { AGNOSTIC_CONFIG as config } from '@/config/company'

export const metadata: Metadata = {
  title: 'AgentAuth — Discovery and Trust for the Agent Web',
}

const [thesisBefore, thesisAfter] = config.impactThesis.split(config.impactThesisHighlight)

export default function Landing() {
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="w">
          <div className="hero-lbl r">OPEN SOURCE &middot; AGENT INFRASTRUCTURE</div>
          <h1 className="r" style={{ transitionDelay: '.1s' }}>
            Agents can talk.<br />
            Agents can retrieve.<br />
            <span className="gap">They cannot find each other.</span>
          </h1>
          <p className="hero-sub r" style={{ transitionDelay: '.2s' }}>
            Agent-to-agent communication is a myth. Every connection today was hardcoded by a developer who read a manifest and made a choice. Runtime discovery does not exist. Neither does trust between agents that have never met.
          </p>
          <div className="ctas r" style={{ transitionDelay: '.3s' }}>
            <Link href="/thesis" className="btn-s">Read the thesis</Link>
            <Link href="/demo" className="btn-p">Try the demo</Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how">
        <div className="w">
          <div className="lbl r">HOW IT WORKS</div>
          <h2 className="how-h r">An agent hits a wall.<br />Here is what happens next.</h2>

          <div className="steps r">
            <div className="step">
              <div className="sn">01</div>
              <div className="sc">
                <h3>The Request</h3>
                <p>A user asks Claude: <em>&ldquo;Transcribe this video file.&rdquo;</em> Claude has no transcription capability. In today&rsquo;s world, the conversation ends here.</p>
              </div>
            </div>
            <div className="step">
              <div className="sn">02</div>
              <div className="sc">
                <h3>Capability Query</h3>
                <p>Claude queries the discovery layer: <em>&ldquo;find an agent that transcribes video and audio.&rdquo;</em> Natural language. No manifest. No developer. Runtime.</p>
              </div>
            </div>
            <div className="step">
              <div className="sn">03</div>
              <div className="sc">
                <h3>Discovery and Verification</h3>
                <p>1,247 agent manifests searched across MCP, A2A, and HTTP. Top 3 returned, ranked by capability match. Every result carries a cryptographically verified identity card. Scope confirmed before any result is surfaced. <strong>You don&rsquo;t get discovery without trust. You don&rsquo;t get trust without discovery.</strong></p>
              </div>
            </div>
            <div className="step">
              <div className="sn">04</div>
              <div className="sc">
                <h3>Authorized Handshake</h3>
                <p>Claude passes the video file to the top-ranked verified agent. Both sides confirmed identity and scope before a single byte transferred.</p>
              </div>
            </div>
            <div className="step">
              <div className="sn">05</div>
              <div className="sc">
                <h3>Execution and Return</h3>
                <p>The transcription agent processes the file and returns the transcript. Claude delivers it to the user. <em>The user never knew another agent was involved. That is the point.</em></p>
              </div>
            </div>
          </div>

          <AuditTrail />

          <p className="honesty r">
            Steps 1&ndash;4 are live in the demo. Steps 5&ndash;6 are illustrative of what the primitive enables.
          </p>
        </div>
      </section>

      {/* THE GAP */}
      <section className="gap-sec">
        <div className="w">
          <div className="lbl r">THE GAP</div>

          <div className="panel r">
            <h3>&ldquo;Almost every agent integration today was a human decision.&rdquo;</h3>
            <p>A developer decided which agents could talk to each other, found their manifests, and hardcoded the connections. The routing may be dynamic. The pool is always fixed. Smithery lists MCP servers. A2A defines agent cards. Google indexes the web. None of them let an agent find a counterpart by capability at runtime, without a human in the loop. List versus index. The retrieval layer across protocols is the gap.</p>
          </div>

          <div className="panel r">
            <h3>&ldquo;Discovery without identity is an open marketplace of unverified actors.&rdquo;</h3>
            <p>Knowing an agent exists is not the same as knowing it is authorized to act. An agent can be cryptographically real and still be operating outside its principal&rsquo;s intent, with no binding to this transaction, this scope, this limit. Stytch, Proof, AgentID, IBM, Auth0 are all solving human-to-agent authorization: a person granting an agent permission to act. The missing layer is agent-to-agent: two actors that have never met, neither able to verify the other&rsquo;s principal, confirm the other&rsquo;s scope, or enforce limits before committing. Protocols define the channel. They say nothing about who is on the other end. That primitive does not exist yet.</p>
          </div>

          <div className="panel r">
            <h3>&ldquo;This is how search platforms compound. Not how they pivot.&rdquo;</h3>
            <div className="gquote">
              <p>Every search platform that won did so by expanding the object class it indexed. Google: pages, then places, then products, then videos. Same primitive, new schemas.</p>
            </div>
            <p>Agents are web data with executable interfaces. Indexing them is the same retrieval primitive applied to a new object class. Schema changes. Infrastructure does not.</p>
            <p className="r">{config.panel3ClosingSentence}</p>
          </div>
        </div>
      </section>

      {/* IMPACT */}
      <section className="exa-sec">
        <div className="w">
          <div className="exa-over r">THE OPPORTUNITY</div>
          <p className="exa-premise r">{config.impactPremise}</p>
          <p className="exa-thesis r">
            {thesisBefore}
            <span style={{ color: 'var(--green)' }}>{config.impactThesisHighlight}</span>
            {thesisAfter}
          </p>
        </div>
      </section>

      {/* TIMING */}
      <section className="timing">
        <div className="w">
          <div className="lbl r">THE TIMING</div>
          <h2 className="timing-h r">The rails are landing.<br />The trust layer is not.</h2>
          <p className="timing-sub r">Every major piece of agent infrastructure shipped in the last 14 months. The gap is not theoretical anymore. It is load-bearing.</p>

          <div className="r">
            <div className="tl-entry">
              <div className="tl-date">APR 2025</div>
              <div className="tl-content">
                <h4>Google A2A Protocol</h4>
                <p>Agent-to-agent communication is standardized. 50+ partners. The channel exists. The identity layer does not.</p>
              </div>
            </div>
            <div className="tl-entry">
              <div className="tl-date">MAR 2026</div>
              <div className="tl-content">
                <h4>Stripe MPP</h4>
                <p>Agent payments are live. Real money, real stakes, no way to verify who is authorized to spend it.</p>
              </div>
            </div>
            <div className="tl-entry">
              <div className="tl-date">MAR 2026</div>
              <div className="tl-content">
                <h4>AgentMail raises $6M</h4>
                <p>Email infrastructure for agents. Vertical agent infrastructure is being funded. Trust is next.</p>
              </div>
            </div>
            <div className={`tl-entry${config.timelineHighlight ? ' hl' : ''}`}>
              <div className="tl-date">{config.timelineDate}</div>
              <div className="tl-content">
                <h4>{config.timelineTitle}</h4>
                <p>{config.timelineBody}</p>
              </div>
            </div>
          </div>

          <p className="timing-close r">
            The agentic economy is being built on top of unverified actors. Every week that passes without a discovery and trust layer is a week more infrastructure gets built on an unsound foundation.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="site-footer-landing">
        <div className="w">
          <p className="f-pip">pip install agentauth</p>
          <div className="f-links">
            <a href="https://github.com/raghuvanshidevyansh-creator/AgentAuthExa" target="_blank" rel="noreferrer">
              github.com/raghuvanshidevyansh-creator/AgentAuthExa
            </a>
            <Link href="/thesis">Read the thesis</Link>
          </div>
          <p className="f-attr">BUILT AT DUKE &middot; OPEN SOURCE &middot; 2026</p>
        </div>
      </footer>
    </>
  )
}
