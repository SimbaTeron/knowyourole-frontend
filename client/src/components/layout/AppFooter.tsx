import Link from "next/link";

const groups = [
  { title: "Explore", links: [["Take the quiz", "/quiz"], ["Career paths", "/careers"], ["Learn", "/learn"], ["Method", "/methodology"]] },
  { title: "About", links: [["About KnowYouRole", "/about"], ["Questions", "/faq"], ["Contact", "/contact"]] },
  { title: "Your choices", links: [["Privacy", "/privacy"], ["Cookie settings", "/privacy#cookie-preferences"], ["Terms", "/terms"]] },
] as const;

export function AppFooter() {
  return <footer className="workday-footer" aria-label="Site footer">
    <div className="workday-footer__grid">
      <div className="workday-footer__intro">
        <Link href="/" className="workday-footer__brand" aria-label="KnowYouRole home"><span aria-hidden="true">◈</span> KnowYouRole</Link>
        <p>Practical work-style reflection and career exploration. A useful starting point, not a verdict.</p>
      </div>
      {groups.map((group) => <section key={group.title}>
        <h2>{group.title}</h2>
        <ul>{group.links.map(([label, href]) => <li key={href}><Link href={href}>{label}</Link></li>)}</ul>
      </section>)}
    </div>
    <div className="workday-footer__bottom"><span>© 2026 KnowYouRole</span><span>Built for reflection, not selection.</span></div>
  </footer>;
}
