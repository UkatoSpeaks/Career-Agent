from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import interview, resume, roadmap

app = FastAPI(title="Career Agent API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume.router)
app.include_router(interview.router)
app.include_router(roadmap.router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
