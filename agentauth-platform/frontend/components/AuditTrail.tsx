'use client'

import { useEffect, useRef } from 'react'

export default function AuditTrail() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let fired = false
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !fired) {
          fired = true
          el.querySelectorAll('.arow, .audit-foot').forEach(r => r.classList.add('go'))
        }
      },
      { threshold: 0.4 }
    )
    obs.observe(el)

    // Also handle scroll reveal (.r → .in) at 0.1 threshold
    const revObs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add('in')
          revObs.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )
    revObs.observe(el)

    return () => { obs.disconnect(); revObs.disconnect() }
  }, [])

  return (
    <div className="audit r" id="audit" ref={ref}>
      <div className="audit-hdr">
        <span>TIME</span>
        <span>FROM</span>
        <span></span>
        <span>TO</span>
        <span>MESSAGE</span>
        <span className="rgt">STATUS</span>
      </div>
      <div className="audit-rows">
        <div className="arow">
          <span className="at">09:14:00</span>
          <span className="af ca">Claude</span>
          <span className="aa">&rarr;</span>
          <span className="ato caa">AgentAuth</span>
          <span className="am">&ldquo;find agent: transcribe video and audio&rdquo;</span>
          <span></span>
        </div>
        <div className="arow is-aa">
          <span className="at">09:14:01</span>
          <span className="af caa">AgentAuth</span>
          <span className="aa">&rarr;</span>
          <span className="ato ca">Claude</span>
          <span className="am">1,247 searched &middot; 3 returned &middot; all verified</span>
          <span className="badge b-trusted">TRUSTED</span>
        </div>
        <div className="arow">
          <span className="at">09:14:02</span>
          <span className="af ca">Claude</span>
          <span className="aa">&rarr;</span>
          <span className="ato cm">transcriptor-mcp</span>
          <span className="am">file handoff &middot; authorized</span>
          <span className="badge b-committed">COMMITTED</span>
        </div>
        <div className="arow">
          <span className="at">09:14:11</span>
          <span className="af cm">transcriptor-mcp</span>
          <span className="aa">&rarr;</span>
          <span className="ato ca">Claude</span>
          <span className="am">transcript returned</span>
          <span className="badge b-done">DONE</span>
        </div>
        <div className="arow">
          <span className="at">09:14:11</span>
          <span className="af ca">Claude</span>
          <span className="aa">&rarr;</span>
          <span className="ato cu">User</span>
          <span className="am">&ldquo;Here is your transcript.&rdquo;</span>
          <span></span>
        </div>
      </div>
      <div className="audit-foot">
        <span className="audit-stats">1 query &middot; 3 verified candidates &middot; 1 authorized handshake &middot; 11.2s total</span>
        <span className="pulse"></span>
      </div>
    </div>
  )
}
