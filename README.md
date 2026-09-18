# Career Agent API

A stateless FastAPI backend with three LangGraph-powered agents (using Groq as the LLM):

- `POST /resume/analyze` — compare a resume against a job description, surface skill gaps and suggestions.
- `POST /interview/questions` — generate interview questions for a target role.
- `POST /interview/evaluate` — score and give feedback on an interview answer.
- `POST /roadmap/generate` — build a milestone-based learning roadmap between a current and target role.

## Setup

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# then edit .env and set GROQ_API_KEY
```

## Run

```bash
uvicorn app.main:app --reload
```

Open http://127.0.0.1:8000/docs for the interactive Swagger UI to try each endpoint.

## Notes

- The service is stateless: no database. Multi-turn flows (e.g. interview prep) are driven by
  the client — call `/interview/questions` once, then `/interview/evaluate` per answer.
- Each agent is a small LangGraph state graph (extract/normalize -> reasoning -> structured
  output) rather than a single LLM call, so intermediate steps stay testable.
- Structured-output calls to Groq retry up to twice on parse failure (see `_with_retries` in
  each agent module).
