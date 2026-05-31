import type { Metadata } from 'next'
import Link from 'next/link'
import ScrollReveal from '@/components/ScrollReveal'
import type { CSSProperties } from 'react'

export const metadata: Metadata = {
  title: 'AgentAuth — The Thesis',
}

const pageStyle = { '--mw': '760px' } as CSSProperties

export default function Thesis() {
  return (
    <div style={pageStyle}>
      {/* OPENING THESIS */}
      <section className="thesis-open">
        <div className="w">
          <ScrollReveal>
            <p>The agent web has retrieval and it has communication protocols. It does not yet have a discovery and identity layer. Agents cannot autonomously find other agents by capability at runtime, and they cannot verify each other&rsquo;s authorization to commit. These are not two problems. Discovery without identity is an open marketplace of unverified actors. Identity without discovery is a credential system with no network to secure. The primitive is the composition. Exa is the natural locus to ship it because Exa already has the retrieval infrastructure, the distribution to every developer building agents, and the credibility to operate as a trust authority. This is not scope expansion. Every search platform that won did so by expanding the object class it indexed. Google: pages, then places, then products, then videos. Same primitive, new schemas. Agents are web data with executable interfaces. Indexing them is the same retrieval primitive applied to a new object class. Schema changes. Infrastructure does not. This is how search platforms compound. Not how they pivot.</p>
          </ScrollReveal>
        </div>
      </section>

      {/* THE GAP */}
      <section className="essay-sec">
        <div className="w">
          <div className="lbl r">THE GAP</div>
          <h2 className="sec-heading r">The infrastructure is landing without a foundation.</h2>
          <div className="essay-body">
            <p className="r">The last 14 months produced more agent infrastructure than the previous five years combined. Stripe MPP made agent payments real. Google A2A standardized agent communication with 50+ partners. MCP connected agents to tools at scale. Exa raised $250M to organize the web&rsquo;s data for agents. The rails exist. The money is moving. The foundation is not there.</p>
            <p className="r">Every agent interaction today was set up before it happened. A developer read a manifest, chose a counterpart, and hardcoded the connection. The agent did not decide. The agent did not discover. The agent did not verify. Autonomous is the wrong word for any of this. What exists today is automation with a human in the decision loop, dressed up as autonomy.</p>
            <p className="r">The discovery side of this is being attempted as protocol-specific registries. Smithery indexes MCP servers. The MCP registry is Anthropic&rsquo;s curated list. A2A defines agent cards as a manifest format. None of these are a discovery layer. They are lists. An agent cannot query them by capability at runtime. A human browses them. The retrieval layer that would make discovery actually autonomous does not exist.</p>
            <p className="r">The identity side is being attempted in silos. Stytch, now part of Twilio, is human and B2B SaaS auth with agent identity bolted on. Proof joined the FIDO Alliance in May 2026 and binds verified human identity to agent actions. AgentID launched in February 2026 as a cryptographic identity system. IBM, Auth0, and Yubico are building human-in-the-loop frameworks for high-risk agent actions. Every one of these is solving human-to-agent authorization. None of them are solving agent-to-agent peer verification with principal binding and scope attestation on a per-transaction basis between actors that have never met. That is a different primitive.</p>
            <p className="r">The gap is not that identity and discovery are hard. The gap is that nobody has shipped them as a composed foundational layer. And without the composition, the agent web has rails with no way to verify who is authorized to ride them.</p>
          </div>
        </div>
      </section>

      {/* WHY EXA */}
      <section className="essay-sec">
        <div className="w">
          <div className="lbl r">WHY EXA</div>
          <h2 className="sec-heading r">The retrieval infrastructure already exists. The object class does not.</h2>
          <div className="essay-body">
            <p className="r">Trust is not a technical problem. It is a distribution and credibility problem. A trust layer only works if the agents using it already trust the authority issuing the credentials. That requires distribution to every developer building agents, credibility as a neutral infrastructure player, and the technical substrate to make retrieval work at web scale. Exa has all three. No other player does.</p>
            <p className="r">Stytch has auth distribution but for human and SaaS workflows, not the open agent web. Anthropic has agent-developer distribution but is focused on the model and OS layer, not retrieval infrastructure. Google has A2A but it is a manifest standard, not an index. Nobody else sits at the intersection of retrieval infrastructure, agent-developer distribution, and the brand authority to operate as a neutral trust layer.</p>
            <p className="r">The technical argument is simpler. Agents are web data with executable interfaces. Exa already indexes web data. The retrieval primitive is identical. What changes is the schema: instead of indexing pages, you index agent manifests. Instead of returning URLs, you return verified capability matches. The infrastructure does not change. The object class does. This is what Exa described when it raised $250M: a search lab organizing the web&rsquo;s data for agents. Agent manifests are web data. They are the next object class.</p>
            <p className="r">In production, every indexed agent carries its full operational envelope. Capabilities, tools, constraints, cost of usage, accepted protocols, MCP or A2A or HTTP, rate limits, input bounds, scope boundaries, principal binding. An agent querying the discovery layer does not just get a verified identity. It gets everything it needs to decide whether to proceed. The right counterpart, at the right cost, over the right protocol, within the right authorization scope. One query. No humans. That is not a feature of a search engine. That is the infrastructure primitive the agent web is missing.</p>
            <p className="r">AgentAuth is not asking Exa to become an identity company. The model is SSL, not a platform. A certificate authority verifies identity but is never in the data path. Let&rsquo;s Encrypt issues certificates but does not proxy your traffic. DNS resolves names but does not route your packets. Exa as the discovery and trust layer follows the same architecture: verify at the edges, stay out of the transaction. The agent web gets a foundation. Exa gets the distribution point for every agent interaction on the open internet.</p>
            <p className="r">
              The library is open source. &rarr;{' '}
              <a href="https://github.com/[username]/agentauth" target="_blank" rel="noreferrer" className="gh-inline">
                github.com/[username]/agentauth
              </a>
            </p>
          </div>

          <div className="exa-close r">
            <p className="premise">AI agents already come to Exa for data.</p>
            <p className="thesis-line">
              They should be able to come to Exa for{' '}
              <span style={{ color: 'var(--green)' }}>execution</span> too.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-sec">
        <div className="w">
          <div className="lbl r">FAQ</div>
          <h2 className="sec-heading r">The objections, addressed directly.</h2>

          <div className="faq-item r">
            <div className="faq-q">
              <span className="q-mark">Q</span>
              <span className="q-text">Smithery, the MCP registry, and A2A agent cards already address discovery.</span>
            </div>
            <p className="faq-a">They are lists. Smithery is a human-browsed directory with keyword search, built protocol by protocol. A2A agent cards are a manifest format, not a discovery layer. The MCP registry is a curated index maintained by Anthropic. None of them let an agent query by capability at runtime across protocols without a human in the loop. The distinction is list versus index. A list requires a human to browse it. An index lets an agent query it semantically at runtime. Exa is the only player with the retrieval infrastructure to build a real index at web scale, across MCP, A2A, and HTTP, as a single query surface.</p>
          </div>

          <div className="faq-item r">
            <div className="faq-q">
              <span className="q-mark">Q</span>
              <span className="q-text">Identity is already being solved by Stytch, Proof, AgentID, IBM, Auth0, and Yubico.</span>
            </div>
            <p className="faq-a">Every one of those is solving human-to-agent authorization: a person granting an agent permission to act on their behalf. That is one layer and it is a valid one. The missing layer is agent-to-agent: two actors that have never met, neither able to verify the other&rsquo;s principal, confirm the other&rsquo;s scope, or enforce limits before committing to a transaction. No binding to a human, a company, or a government-recognized entity. No attestation of what this agent is authorized to spend, access, or commit. That is a different primitive. Nobody has shipped it.</p>
          </div>

          <div className="faq-item r">
            <div className="faq-q">
              <span className="q-mark">Q</span>
              <span className="q-text">This looks like scope expansion. Why would Exa move from search to identity?</span>
            </div>
            <p className="faq-a">It is not scope expansion. Agents are web data with executable interfaces. Indexing them is the same retrieval primitive Exa already applies to pages, applied to a new object class. Schema changes. Infrastructure does not. Every search platform that won did so by expanding the object class it indexed, not by building a new product. Google did not pivot when it indexed places and products. It compounded. Exa does not have to build the trust layer from scratch either. AgentAuth is the complementary piece that plugs in. The pitch is not &ldquo;become an identity company.&rdquo; The pitch is &ldquo;be the discovery layer for the next object class, with trust built in.&rdquo;</p>
          </div>

          <div className="faq-item r">
            <div className="faq-q">
              <span className="q-mark">Q</span>
              <span className="q-text">What stops a bad actor from registering a malicious agent and getting a valid cert?</span>
            </div>
            <p className="faq-a">Nothing in the cryptographic layer stops a bad actor from obtaining a cert if they satisfy the issuance criteria. This is the same problem SSL has, and it is not a flaw in the primitive. A verified malicious site is still malicious. What the cert changes is accountability and traceability. A verified malicious agent has a provable identity trail. That makes revocation, reputation systems, and certificate transparency logs possible. Without identity, none of those accountability mechanisms can exist at all. AgentAuth is the foundation those layers are built on, not a substitute for them.</p>
          </div>

          <div className="faq-item r">
            <div className="faq-q">
              <span className="q-mark">Q</span>
              <span className="q-text">Why not use existing PKI? SPIFFE, SPIRE, and mTLS already solve service identity.</span>
            </div>
            <p className="faq-a">SPIFFE and SPIRE are designed for workload identity within known infrastructure boundaries: services registered in advance, in controlled environments, by known operators. The open agent web is the opposite. Unknown counterparts, dynamic discovery, cross-organizational, no shared infrastructure boundary. mTLS requires both parties to have certificates from a mutually trusted CA before the connection, which presupposes the discovery step has already happened through some other mechanism. These are the right solutions for the enterprise perimeter. They do not generalize to the open internet agent graph. AgentAuth follows the SSL model for the web: a public CA that any agent can use to verify any other agent, without prior relationship, at internet scale.</p>
          </div>

          <div className="faq-item r">
            <div className="faq-q">
              <span className="q-mark">Q</span>
              <span className="q-text">How do you bootstrap trust in the CA itself? If no agents trust AgentAuth yet, the network has no value.</span>
            </div>
            <p className="faq-a">The cold start problem is real and the answer is the same as how SSL bootstrapped: distribution, not adoption. Let&rsquo;s Encrypt did not wait for websites to trust it before issuing certs. It issued certs to early adopters, got bundled into browsers, and the network effect followed distribution. The equivalent here is Exa. If Exa ships discovery with AgentAuth verification as the default, every agent developer who uses Exa&rsquo;s discovery layer is automatically in the trust graph. The bootstrapping problem is a distribution problem. Exa already has the distribution. That is one of the core reasons Exa is the natural locus for this primitive, not an open source project waiting for adoption.</p>
          </div>
        </div>
      </section>

      {/* FOOTER ACTIONS */}
      <section className="thesis-actions">
        <div className="w">
          <a href="/memo.pdf" className="pdf-btn r">
            <svg viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z" />
            </svg>
            Read the full memo (PDF, 3 pages)
          </a>
          <p className="gh-row r">
            Open source &rarr;{' '}
            <a href="https://github.com/[username]/agentauth" target="_blank" rel="noreferrer" className="gh-inline">
              github.com/[username]/agentauth
            </a>
          </p>
        </div>
      </section>

      {/* SITE FOOTER */}
      <footer className="site-footer-thesis">
        <div className="w">
          <div className="f-links">
            <Link href="/">Home</Link>
            <Link href="/demo">Demo</Link>
            <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
          </div>
          <p className="f-attr">BUILT AT DUKE &middot; OPEN SOURCE &middot; 2026</p>
        </div>
      </footer>
    </div>
  )
}
