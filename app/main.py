from fastapi import FastAPI

from app.routers import interview, resume, roadmap

app = FastAPI(title="Career Agent API", version="0.1.0")

app.include_router(resume.router)
app.include_router(interview.router)
app.include_router(roadmap.router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
