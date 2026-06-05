export const AGNOSTIC_CONFIG = {
  impactPremise: "Whoever owns retrieval infrastructure owns the discovery layer.",
  impactThesis: "Agents come to search infrastructure for retrieval. They should be able to come for execution too.",
  impactThesisHighlight: "execution",
  timelineDate: "2026",
  timelineTitle: "The retrieval layer is open.",
  timelineBody: "Every major search and retrieval platform is positioning as infrastructure for agents. The agent object class does not yet have a discovery or identity schema. The primitive is unowned.",
  timelineHighlight: false,
  panel3ClosingSentence: "Agents already come to search infrastructure for retrieval. The same infrastructure should serve execution.",
  openingInsert: "The natural owner already has retrieval infrastructure at web scale, distribution to every developer building agents, and the credibility to operate as a neutral trust authority.",
  gapInsert: null as string | null,
  whySectionLabel: "WHO SHOULD OWN THIS",
  whySectionHeading: "Trust is a distribution problem. The distribution is already solved.",
  whyParagraph1: "A trust layer only works if the agents using it already trust the authority issuing the credentials. That requires three things: distribution to every developer building agents, credibility as a neutral infrastructure player, and the technical substrate to make retrieval work at web scale. These are not research problems. Any company that has won at search or retrieval infrastructure already has all three.",
  whyParagraph2: "The technical argument is simpler than it looks. Agents are web data with executable interfaces. Any company that already indexes web data already has the retrieval primitive. What changes is the schema: instead of indexing pages, you index agent manifests. Instead of returning URLs, you return verified capability matches. The infrastructure does not change. The object class does.",
  whyParagraph3: "In production, every indexed agent carries its full operational envelope. Capabilities, tools, constraints, cost of usage, accepted protocols, MCP or A2A or HTTP, rate limits, input bounds, scope boundaries, principal binding. An agent querying the discovery layer does not just get a verified identity. It gets everything it needs to decide whether to proceed. The right counterpart, at the right cost, over the right protocol, within the right authorization scope. One query. No humans. That is not a feature of a search engine. That is the infrastructure primitive the agent web is missing.",
  whyParagraph4: "The model is SSL, not a platform. A certificate authority verifies identity but is never in the data path. Let’s Encrypt issues certificates but does not proxy your traffic. DNS resolves names but does not route your packets. The natural owner of this primitive verifies at the edges and stays out of the transaction. The agent web gets a foundation. That owner gets the distribution point for every agent interaction on the open internet. AgentAuth is the complementary open source piece that plugs in.",
  closingPremise: "Agents already come to search infrastructure for retrieval.",
  closingThesis: "They should be able to come for execution too.",
  closingThesisHighlight: "execution",
  faqQ1LastSentence: "The only player that can fill this gap is one that already has neural retrieval infrastructure at web scale, across MCP, A2A, and HTTP, as a single query surface.",
  faqQ3Question: "This looks like scope expansion. Why would a search company move into identity?",
  faqQ3AnswerRetrievalPhrase: "Indexing them is the same retrieval primitive any search infrastructure already applies to pages",
  faqQ3AnswerOwnerPhrase: "The natural owner does not have to build the trust layer from scratch.",
  faqQ6LastParagraph: "The equivalent here is whichever company already has distribution to agent developers. If they ship discovery with AgentAuth verification as the default, every developer using their retrieval layer is automatically in the trust graph. The bootstrapping problem is a distribution problem. The natural owner already has the distribution. That is the core reason this primitive belongs to retrieval infrastructure, not an open source project waiting for adoption.",
};

export type CompanyConfig = typeof AGNOSTIC_CONFIG

export const TAVILY_CONFIG: CompanyConfig = { ...AGNOSTIC_CONFIG }
export const PERPLEXITY_CONFIG: CompanyConfig = { ...AGNOSTIC_CONFIG }
export const CLOUDFLARE_CONFIG: CompanyConfig = { ...AGNOSTIC_CONFIG }

export const COMPANY_MAP: Record<string, CompanyConfig> = {
  tavily:     TAVILY_CONFIG,
  perplexity: PERPLEXITY_CONFIG,
  cloudflare: CLOUDFLARE_CONFIG,
}

export function getConfig(company?: string): CompanyConfig {
  if (!company) return AGNOSTIC_CONFIG
  return COMPANY_MAP[company.toLowerCase()] ?? AGNOSTIC_CONFIG
}
