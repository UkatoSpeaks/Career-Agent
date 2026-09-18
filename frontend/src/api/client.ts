const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string

export class ApiError extends Error {}

async function post<TResponse>(path: string, body: unknown): Promise<TResponse> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    throw new ApiError(payload?.detail ?? `Request failed with status ${res.status}`)
  }

  return res.json() as Promise<TResponse>
}

// --- Resume Gap Analysis ---

export interface ResumeAnalysisResult {
  matched_skills: string[]
  missing_skills: string[]
  gap_summary: string
  suggestions: string[]
}

export function analyzeResume(resumeText: string, jobDescription: string) {
  return post<{ result: ResumeAnalysisResult }>('/resume/analyze', {
    resume_text: resumeText,
    job_description: jobDescription,
  }).then((r) => r.result)
}

// --- Roadmap Planner ---

export interface RoadmapMilestone {
  title: string
  skills_to_learn: string[]
  resources: string[]
  estimated_time: string
}

export interface RoadmapResult {
  summary: string
  milestones: RoadmapMilestone[]
}

export function generateRoadmap(currentRole: string, targetRole: string, currentSkills: string[]) {
  return post<{ result: RoadmapResult }>('/roadmap/generate', {
    current_role: currentRole,
    target_role: targetRole,
    current_skills: currentSkills,
  }).then((r) => r.result)
}

// --- Interview Prep ---

export function generateInterviewQuestions(targetRole: string, resumeText: string | null, numQuestions: number) {
  return post<{ result: { questions: string[] } }>('/interview/questions', {
    target_role: targetRole,
    resume_text: resumeText,
    num_questions: numQuestions,
  }).then((r) => r.result.questions)
}

export interface InterviewEvaluationResult {
  score: number
  strengths: string[]
  improvements: string[]
  model_answer: string
}

export function evaluateInterviewAnswer(question: string, answer: string) {
  return post<{ result: InterviewEvaluationResult }>('/interview/evaluate', {
    question,
    answer,
  }).then((r) => r.result)
}
