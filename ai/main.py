"""
AI Predictive & Auto-Scaling Service
Provides REST API endpoints for traffic prediction, metric anomaly detection,
and intelligent Kubernetes auto-scaling calculations.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import logging
import os
from api.scaling_routes import router as ai_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("AI-Service")

app = FastAPI(
    title="Intelligent Game Server AI Predictive & Scaling Engine",
    description="AI service powering player traffic forecasting, anomaly detection, and server capacity auto-scaling.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai_router)

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str

@app.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(
        status="healthy",
        service="AI-Predictive-Engine",
        version="1.0.0"
    )

if __name__ == "__main__":
    port = int(os.getenv("AI_SERVICE_PORT", 8000))
    logger.info(f"Starting AI Predictive Engine service on port {port}...")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
