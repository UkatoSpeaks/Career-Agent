import { useState } from 'react'
import { ApiError, evaluateInterviewAnswer, generateInterviewQuestions, type InterviewEvaluationResult } from '../api/client'
import ErrorBanner from '../components/ErrorBanner'
import LoadingButton from '../components/LoadingButton'

interface QAItem {
  question: string
  answer: string
  evaluation: InterviewEvaluationResult | null
  loading: boolean
  error: string | null
}

export default function InterviewPrepPage() {
  const [targetRole, setTargetRole] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [items, setItems] = useState<QAItem[]>([])

  async function handleGenerate() {
    setGenerating(true)
    setGenerateError(null)
    try {
      const questions = await generateInterviewQuestions(targetRole, null, 5)
      setItems(questions.map((question) => ({ question, answer: '', evaluation: null, loading: false, error: null })))
    } catch (err) {
      setGenerateError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  function updateAnswer(index: number, answer: string) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, answer } : item)))
  }

  async function handleGetFeedback(index: number) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, loading: true, error: null } : item)))
    try {
      const item = items[index]
      const evaluation = await evaluateInterviewAnswer(item.question, item.answer)
      setItems((prev) => prev.map((it, i) => (i === index ? { ...it, evaluation, loading: false } : it)))
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Something went wrong. Please try again.'
      setItems((prev) => prev.map((it, i) => (i === index ? { ...it, loading: false, error: message } : it)))
    }
  }

  return (
    <div className="mx-auto max-w-[900px] px-6 py-14 sm:px-12">
      <h1 className="font-heading text-3xl font-bold">Interview Prep</h1>
      <p className="mt-2.5 max-w-[600px] text-[15px] text-text-secondary">
        Generate role-specific interview questions, answer them, and get structured feedback on each response.
      </p>

      <div className="mt-8 flex items-end gap-3">
        <div className="flex-1">
          <label className="mb-2.5 block text-xs font-semibold tracking-wide text-text-secondary uppercase">
            Target Role
          </label>
          <input
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Backend Engineer"
            className="w-full rounded-[10px] border border-border bg-surface px-4 py-3.5 text-sm focus:border-accent focus:outline-none"
          />
        </div>
        <LoadingButton onClick={handleGenerate} disabled={!targetRole.trim()} loading={generating} className="py-3.5">
          Generate Questions
        </LoadingButton>
      </div>

      {generateError && (
        <div className="mt-6">
          <ErrorBanner message={generateError} />
        </div>
      )}

      <div className="mt-10 flex flex-col gap-5">
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-[14px] border border-border bg-surface p-6.5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_rgba(15,23,42,0.04)]"
          >
            <div className="mb-2 text-xs font-semibold text-text-secondary">QUESTION {index + 1}</div>
            <div className="mb-4 text-[15px] leading-snug font-semibold">{item.question}</div>

            <label className="mb-2.5 block text-xs font-semibold tracking-wide text-text-secondary uppercase">
              Your Answer
            </label>
            <textarea
              value={item.answer}
              onChange={(e) => updateAnswer(index, e.target.value)}
              placeholder="Type your answer here..."
              className="mb-4.5 min-h-[100px] w-full resize-y rounded-[10px] border border-border bg-bg p-3.5 text-sm leading-relaxed text-text placeholder:text-text-placeholder focus:border-accent focus:outline-none"
            />

            {!item.evaluation && (
              <LoadingButton
                variant="outline"
                onClick={() => handleGetFeedback(index)}
                disabled={!item.answer.trim()}
                loading={item.loading}
                className="py-2.5 text-[13px]"
              >
                Get Feedback
              </LoadingButton>
            )}

            {item.error && (
              <div className="mt-4">
                <ErrorBanner message={item.error} />
              </div>
            )}

            {item.evaluation && (
              <div className="border-t border-border pt-5">
                <div className="mb-4.5 flex items-center gap-3">
                  <span className="text-xs font-semibold tracking-wide text-text-secondary uppercase">Feedback</span>
                  <span className="inline-flex items-center rounded-full border border-accent-tint-border bg-accent-tint px-3 py-1 text-[13px] font-bold text-accent">
                    {item.evaluation.score} / 10
                  </span>
                </div>

                <div className="mb-5 grid grid-cols-1 gap-7 sm:grid-cols-2">
                  <div>
                    <div className="mb-2.5 text-xs font-semibold text-green">Strengths</div>
                    <div className="flex flex-col gap-2">
                      {item.evaluation.strengths.map((s, i) => (
                        <div key={i} className="flex items-start gap-2 text-[13px] leading-relaxed text-text">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#15803D"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mt-0.5 shrink-0"
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mb-2.5 text-xs font-semibold text-amber">Improvements</div>
                    <div className="flex flex-col gap-2">
                      {item.evaluation.improvements.map((s, i) => (
                        <div key={i} className="flex items-start gap-2 text-[13px] leading-relaxed text-text">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#B45309"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mt-0.5 shrink-0"
                          >
                            <path d="M12 5v14M5 12h14" />
                          </svg>
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-2.5 text-xs font-semibold text-text-secondary">Model Answer</div>
                  <div className="rounded-[10px] border border-border bg-bg p-4 text-[13px] leading-relaxed text-text-secondary">
                    {item.evaluation.model_answer}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
