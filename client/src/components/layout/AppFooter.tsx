import Link from "next/link";

const groups = [
  { title: "Explore", links: [["Take the quiz", "/quiz"], ["Career paths", "/careers"], ["Trades quiz", "/careers/trades-career-quiz"], ["Creator quiz", "/careers/creator-careers-quiz"], ["Quiz for teens", "/career-quiz-for-teens"], ["Learn", "/learn"], ["Method", "/methodology"]] },
  { title: "About", links: [["About What Career Fits", "/about"], ["For schools & counselors", "/for-schools"], ["For parents", "/for-parents"], ["For counselors", "/for-counselors"], ["How it was built", "/build"], ["Questions", "/faq"], ["Contact", "/contact"]] },
  { title: "Your choices", links: [["Privacy", "/privacy"], ["Student data", "/student-data"], ["Cookie settings", "/privacy#cookie-preferences"], ["Terms", "/terms"]] },
] as const;

export function AppFooter() {
  return <footer className="workday-footer" aria-label="Site footer">
    <div className="workday-footer__grid">
      <div className="workday-footer__intro">
        <Link href="/" className="workday-footer__brand" aria-label="What Career Fits home"><span aria-hidden="true">◈</span> What Career Fits</Link>
        <p>A free career quiz and a useful starting point, not a verdict. It looks at how you like to work.</p>
      </div>
      {groups.map((group) => <section key={group.title}>
        <h2>{group.title}</h2>
        <ul>{group.links.map(([label, href]) => <li key={href}><Link href={href}>{label}</Link></li>)}</ul>
      </section>)}
    </div>
    <div className="workday-footer__bottom"><span>© 2026 What Career Fits</span><span>Built for reflection, not selection.</span></div>
  </footer>;
}
