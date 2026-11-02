
from fastapi import FastAPI

app = FastAPI(
    title="Lorvens Club API",
    description="Backend API for Lorvens Club website and admin portal",
    version="1.0.0",
)


@app.get("/")
def home():
    return {
        "message": "Welcome to Lorvens Club API",
        "status": "running",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
