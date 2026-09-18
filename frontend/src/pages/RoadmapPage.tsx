import { type KeyboardEvent, useState } from 'react'
import { ApiError, generateRoadmap, type RoadmapResult } from '../api/client'
import ErrorBanner from '../components/ErrorBanner'
import LoadingButton from '../components/LoadingButton'
import SkillTag from '../components/SkillTag'

export default function RoadmapPage() {
  const [currentRole, setCurrentRole] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<RoadmapResult | null>(null)

  function addSkill() {
    const value = skillInput.trim()
    if (value && !skills.includes(value)) {
      setSkills([...skills, value])
    }
    setSkillInput('')
  }

  function handleSkillKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addSkill()
    }
  }

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    try {
      const res = await generateRoadmap(currentRole, targetRole, skills)
      setResult(res)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const canGenerate = currentRole.trim().length > 0 && targetRole.trim().length > 0

  return (
    <div className="mx-auto max-w-[900px] px-6 py-14 sm:px-12">
      <h1 className="font-heading text-3xl font-bold">Roadmap Planner</h1>
      <p className="mt-2.5 max-w-[600px] text-[15px] text-text-secondary">
        Tell us where you are and where you want to go — we'll map the milestones in between.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2.5 block text-xs font-semibold tracking-wide text-text-secondary uppercase">
            Current Role
          </label>
          <input
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value)}
            placeholder="e.g. Junior Backend Developer"
            className="w-full rounded-[10px] border border-border bg-surface px-4 py-3 text-sm focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-2.5 block text-xs font-semibold tracking-wide text-text-secondary uppercase">
            Target Role
          </label>
          <input
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Senior Backend / Platform Engineer"
            className="w-full rounded-[10px] border border-border bg-surface px-4 py-3 text-sm focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-5">
        <label className="mb-2.5 block text-xs font-semibold tracking-wide text-text-secondary uppercase">
          Current Skills
        </label>
        <div className="flex flex-wrap items-center gap-2 rounded-[10px] border border-border bg-surface px-3.5 py-3">
          {skills.map((skill) => (
            <SkillTag key={skill} label={skill} onRemove={() => setSkills(skills.filter((s) => s !== skill))} />
          ))}
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleSkillKeyDown}
            onBlur={addSkill}
            placeholder="+ Add skill"
            className="min-w-[100px] flex-1 py-1 text-sm placeholder:text-text-placeholder focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <LoadingButton onClick={handleGenerate} disabled={!canGenerate} loading={loading}>
          Generate Roadmap
        </LoadingButton>
      </div>

      {error && (
        <div className="mt-6">
          <ErrorBanner message={error} />
        </div>
      )}

      {result && (
        <>
          <div className="mt-11 rounded-[14px] border border-border bg-surface px-7 py-6">
            <p className="text-sm leading-relaxed text-text">{result.summary}</p>
          </div>

          <div className="relative mt-10 pl-1">
            <div className="absolute top-2 bottom-2 left-[23px] w-0.5 bg-border" />
            <div className="flex flex-col gap-7">
              {result.milestones.map((milestone, i) => (
                <div key={i} className="relative flex items-start gap-5">
                  <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent font-heading text-[15px] font-bold text-white">
                    {i + 1}
                  </div>
                  <div className="flex-1 rounded-[14px] border border-border bg-surface p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(15,23,42,0.04)]">
                    <div className="mb-3.5 flex items-start justify-between gap-4">
                      <h3 className="text-base font-semibold">{milestone.title}</h3>
                      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-bg px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-text-secondary">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#5B6672"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 7v5l3 3" />
                        </svg>
                        {milestone.estimated_time}
                      </span>
                    </div>
                    <div className="mb-3.5 flex flex-wrap gap-2">
                      {milestone.skills_to_learn.map((skill) => (
                        <SkillTag key={skill} label={skill} />
                      ))}
                    </div>
                    <div className="mb-1.5 text-xs font-semibold text-text-secondary">Resources</div>
                    <div className="text-[13px] leading-relaxed text-text-secondary">
                      {milestone.resources.join(' · ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
