import { Link } from 'react-router-dom'

const tools = [
  {
    to: '/resume',
    title: 'Resume Gap Analysis',
    description: 'Paste your resume and a job description to see exactly which skills match and which are missing.',
    icon: (
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    ),
    iconExtra: [<path key="fold" d="M14 2v6h6" />, <path key="check" d="m9 15 2 2 4-4" />],
  },
  {
    to: '/interview',
    title: 'Interview Prep',
    description: 'Practice with role-specific questions and get structured, scored feedback on every answer.',
    icon: (
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    ),
    iconExtra: [],
  },
  {
    to: '/roadmap',
    title: 'Roadmap Planner',
    description: 'Get a milestone-by-milestone learning path to move from your current role to your target role.',
    icon: <circle cx="12" cy="12" r="10" />,
    iconExtra: [<polygon key="needle" points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />],
  },
]

export default function Home() {
  return (
    <div className="mx-auto max-w-[1100px] px-6 py-16 sm:px-12 sm:py-24">
      <div className="mb-4 text-xs font-semibold tracking-[0.12em] text-accent uppercase">AI Career Coach</div>
      <h1 className="max-w-[700px] font-heading text-4xl leading-[1.15] font-bold text-text sm:text-5xl">
        Land your next role, one step at a time.
      </h1>
      <p className="mt-5 max-w-[560px] text-[17px] leading-relaxed text-text-secondary">
        Career Agent compares your resume to real job descriptions, coaches you through mock interviews, and builds
        a roadmap to close the gaps between where you are and where you want to be.
      </p>

      <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.to}
            to={tool.to}
            className="rounded-[14px] border border-border bg-surface p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-md"
          >
            <div className="mb-4.5 flex h-11 w-11 items-center justify-center rounded-[10px] bg-accent-tint">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0E7490"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {tool.icon}
                {tool.iconExtra}
              </svg>
            </div>
            <h3 className="mb-2.5 text-lg font-semibold">{tool.title}</h3>
            <p className="mb-5 text-sm leading-relaxed text-text-secondary">{tool.description}</p>
            <span className="text-sm font-semibold text-accent">Open →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
