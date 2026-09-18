import { useState } from 'react'
import { analyzeResume, ApiError, type ResumeAnalysisResult } from '../api/client'
import ErrorBanner from '../components/ErrorBanner'
import LoadingButton from '../components/LoadingButton'
import SkillTag from '../components/SkillTag'

export default function ResumeGapPage() {
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null)

  async function handleAnalyze() {
    setLoading(true)
    setError(null)
    try {
      const res = await analyzeResume(resumeText, jobDescription)
      setResult(res)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const canAnalyze = resumeText.trim().length > 0 && jobDescription.trim().length > 0

  return (
    <div className="mx-auto max-w-[1100px] px-6 py-14 sm:px-12">
      <h1 className="font-heading text-3xl font-bold">Resume Gap Analysis</h1>
      <p className="mt-2.5 max-w-[600px] text-[15px] text-text-secondary">
        Paste your resume and a target job description to see what matches, what's missing, and how to close the
        gap.
      </p>

      <div className="mt-9 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2.5 block text-xs font-semibold tracking-wide text-text-secondary uppercase">
            Your Resume
          </label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume text here — experience, skills, and tools you've worked with..."
            className="min-h-[220px] w-full resize-y rounded-[10px] border border-border bg-surface p-4 text-sm leading-relaxed text-text placeholder:text-text-placeholder focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-2.5 block text-xs font-semibold tracking-wide text-text-secondary uppercase">
            Job Description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description you're targeting here..."
            className="min-h-[220px] w-full resize-y rounded-[10px] border border-border bg-surface p-4 text-sm leading-relaxed text-text placeholder:text-text-placeholder focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <LoadingButton onClick={handleAnalyze} disabled={!canAnalyze} loading={loading}>
          Analyze
        </LoadingButton>
      </div>

      {error && (
        <div className="mt-6">
          <ErrorBanner message={error} />
        </div>
      )}

      {!result && !error && (
        <div className="mt-10 flex flex-col items-center gap-3.5 rounded-[14px] border-[1.5px] border-dashed border-border px-6 py-14">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#C3CAD1"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6" />
            <path d="M9 13h6M9 17h6" />
          </svg>
          <div className="text-sm text-text-placeholder">Your gap analysis will appear here</div>
        </div>
      )}

      {result && (
        <div className="mt-10 rounded-[14px] border border-border bg-surface p-8 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(15,23,42,0.04)]">
          <h2 className="mb-5.5 text-lg font-semibold">Results</h2>

          <div className="mb-7 grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <div className="mb-3 text-xs font-semibold tracking-wide text-text-secondary uppercase">
                Matched Skills
              </div>
              <div className="flex flex-wrap gap-2">
                {result.matched_skills.length === 0 && (
                  <span className="text-sm text-text-secondary">None found.</span>
                )}
                {result.matched_skills.map((skill) => (
                  <SkillTag key={skill} label={skill} tone="green" />
                ))}
              </div>
            </div>
            <div>
              <div className="mb-3 text-xs font-semibold tracking-wide text-text-secondary uppercase">
                Missing Skills
              </div>
              <div className="flex flex-wrap gap-2">
                {result.missing_skills.length === 0 && (
                  <span className="text-sm text-text-secondary">None — great fit!</span>
                )}
                {result.missing_skills.map((skill) => (
                  <SkillTag key={skill} label={skill} tone="amber" />
                ))}
              </div>
            </div>
          </div>

          <div className="mb-6 border-t border-border pt-6">
            <div className="mb-2.5 text-xs font-semibold tracking-wide text-text-secondary uppercase">
              Gap Summary
            </div>
            <p className="max-w-[820px] text-sm leading-relaxed text-text">{result.gap_summary}</p>
          </div>

          <div className="border-t border-border pt-6">
            <div className="mb-3.5 text-xs font-semibold tracking-wide text-text-secondary uppercase">
              Suggestions
            </div>
            <div className="flex flex-col gap-3">
              {result.suggestions.map((suggestion, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#0E7490"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mt-0.5 shrink-0"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span className="text-sm leading-relaxed text-text">{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
