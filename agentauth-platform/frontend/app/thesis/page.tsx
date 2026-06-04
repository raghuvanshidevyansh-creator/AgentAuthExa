import type { Metadata } from 'next'
import Link from 'next/link'
import ScrollReveal from '@/components/ScrollReveal'
import type { CSSProperties } from 'react'
import { AGNOSTIC_CONFIG as config } from '@/config/company'

export const metadata: Metadata = {
  title: 'AgentAuth — The Thesis',
}

const pageStyle = { '--mw': '760px' } as CSSProperties

const [closingBefore, closingAfter] = config.closingThesis.split(config.closingThesisHighlight)

export default function Thesis() {
  return (
    <div style={pageStyle}>
      {/* OPENING THESIS */}
      <section className="thesis-open">
        <div className="w">
          <ScrollReveal>
            <p>The agent web has retrieval and it has communication protocols. It does not yet have a discovery and identity layer. Agents cannot autonomously find other agents by capability at runtime, and they cannot verify each other&rsquo;s authorization to commit. These are not two problems. Discovery without identity is an open marketplace of unverified actors. Identity without discovery is a credential system with no network to secure. The primitive is the composition. {config.openingInsert} This is not scope expansion. Every search platform that won did so by expanding the object class it indexed. Google: pages, then places, then products, then videos. Same primitive, new schemas. Agents are web data with executable interfaces. Indexing them is the same retrieval primitive applied to a new object class. Schema changes. Infrastructure does not. This is how search platforms compound. Not how they pivot.</p>
          </ScrollReveal>
        </div>
      </section>

      {/* THE GAP */}
      <section className="essay-sec">
        <div className="w">
          <div className="lbl r">THE GAP</div>
          <h2 className="sec-heading r">The infrastructure is landing without a foundation.</h2>
          <div className="essay-body">
            <p className="r">The last 14 months produced more agent infrastructure than the previous five years combined. Stripe MPP made agent payments real. Google A2A standardized agent communication with 50+ partners. MCP connected agents to tools at scale. {config.gapInsert ? <>{config.gapInsert} </> : null}The rails exist. The money is moving. The foundation is not there.</p>
            <p className="r">Every agent interaction today was set up before it happened. A developer read a manifest, chose a counterpart, and hardcoded the connection. The agent did not decide. The agent did not discover. The agent did not verify. Autonomous is the wrong word for any of this. What exists today is automation with a human in the decision loop, dressed up as autonomy.</p>
            <p className="r">The discovery side of this is being attempted as protocol-specific registries. Smithery indexes MCP servers. The MCP registry is Anthropic&rsquo;s curated list. A2A defines agent cards as a manifest format. None of these are a discovery layer. They are lists. An agent cannot query them by capability at runtime. A human browses them. The retrieval layer that would make discovery actually autonomous does not exist.</p>
            <p className="r">The identity side is being attempted in silos. Stytch, now part of Twilio, is human and B2B SaaS auth with agent identity bolted on. Proof joined the FIDO Alliance in May 2026 and binds verified human identity to agent actions. AgentID launched in February 2026 as a cryptographic identity system. IBM, Auth0, and Yubico are building human-in-the-loop frameworks for high-risk agent actions. Every one of these is solving human-to-agent authorization. None of them are solving agent-to-agent peer verification with principal binding and scope attestation on a per-transaction basis between actors that have never met. That is a different primitive.</p>
            <p className="r">The gap is not that identity and discovery are hard. The gap is that nobody has shipped them as a composed foundational layer. And without the composition, the agent web has rails with no way to verify who is authorized to ride them.</p>
          </div>
        </div>
      </section>

      {/* WHO SHOULD OWN THIS */}
      <section className="essay-sec">
        <div className="w">
          <div className="lbl r">{config.whySectionLabel}</div>
          <h2 className="sec-heading r">{config.whySectionHeading}</h2>
          <div className="essay-body">
            <p className="r">{config.whyParagraph1}</p>
            <p className="r">{config.whyParagraph2}</p>
            <p className="r">{config.whyParagraph3}</p>
            <p className="r">{config.whyParagraph4}</p>
          </div>

          <div className="exa-close r">
            <p className="premise">{config.closingPremise}</p>
            <p className="thesis-line">
              {closingBefore}
              <span style={{ color: 'var(--green)' }}>{config.closingThesisHighlight}</span>
              {closingAfter}
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
            <p className="faq-a">They are lists. Smithery is a human-browsed directory with keyword search, built protocol by protocol. A2A agent cards are a manifest format, not a discovery layer. The MCP registry is a curated index maintained by Anthropic. None of them let an agent query by capability at runtime across protocols without a human in the loop. The distinction is list versus index. A list requires a human to browse it. An index lets an agent query it semantically at runtime. {config.faqQ1LastSentence}</p>
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
              <span className="q-text">{config.faqQ3Question}</span>
            </div>
            <p className="faq-a">It is not scope expansion. Agents are web data with executable interfaces. {config.faqQ3AnswerRetrievalPhrase}, applied to a new object class. Schema changes. Infrastructure does not. Every search platform that won did so by expanding the object class it indexed, not by building a new product. Google did not pivot when it indexed places and products. It compounded. {config.faqQ3AnswerOwnerPhrase} AgentAuth is the complementary piece that plugs in. The pitch is not &ldquo;become an identity company.&rdquo; The pitch is &ldquo;be the discovery layer for the next object class, with trust built in.&rdquo;</p>
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
            <p className="faq-a">The cold start problem is real and the answer is the same as how SSL bootstrapped: distribution, not adoption. Let&rsquo;s Encrypt did not wait for websites to trust it before issuing certs. It issued certs to early adopters, got bundled into browsers, and the network effect followed distribution. {config.faqQ6LastParagraph}</p>
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
        </div>
      </section>

      {/* SITE FOOTER */}
      <footer className="site-footer-thesis">
        <div className="w">
          <div className="f-links">
            <Link href="/">Home</Link>
            <Link href="/demo">Demo</Link>
          </div>
          <p className="f-attr">BUILT AT DUKE &middot; OPEN SOURCE &middot; 2026</p>
        </div>
      </footer>
    </div>
  )
}
