"""
FastAPI Routes for AI Predictions, Anomaly Detection & Scaling Control
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from prediction.traffic_predictor import TrafficPredictor
from anomaly_detection.anomaly_detector import MetricAnomalyDetector
from scaling_engine.scaling_calculator import ScalingEngine

router = APIRouter(prefix="/api/v1", tags=["AI Engine"])

predictor = TrafficPredictor(capacity_per_pod=50)
anomaly_detector = MetricAnomalyDetector()
scaler = ScalingEngine(capacity_per_pod=50, min_pods=2, max_pods=20)

class TelemetrySample(BaseModel):
    timestamp: Optional[str] = None
    active_players: int = Field(..., ge=0)
    active_rooms: int = Field(..., ge=0)
    cpu_usage_pct: float = Field(..., ge=0.0, le=100.0)
    memory_usage_mb: float = Field(..., ge=0.0)
    average_latency_ms: float = Field(..., ge=0.0)
    dropped_packets: int = Field(default=0, ge=0)

class ScaleDecisionRequest(BaseModel):
    current_pods: int = Field(..., ge=1)
    telemetry_history: List[TelemetrySample]

class ModeToggleRequest(BaseModel):
    mode: str = Field(..., description="RECOMMENDATION or AUTOMATIC")

@router.post("/predict")
def predict_traffic(samples: List[TelemetrySample]):
    history = [s.model_dump() for s in samples]
    return predictor.forecast_traffic(history)

@router.post("/detect-anomalies")
def detect_anomalies(sample: TelemetrySample):
    return anomaly_detector.detect_anomaly(sample.model_dump())

@router.post("/scale-decision")
def calculate_scaling_decision(req: ScaleDecisionRequest):
    history = [s.model_dump() for s in req.telemetry_history]
    forecast = predictor.forecast_traffic(history)
    
    latest_sample = history[-1] if len(history) > 0 else {}
    anomaly_result = anomaly_detector.detect_anomaly(latest_sample)

    decision = scaler.calculate_scaling_decision(
        current_pods=req.current_pods,
        predicted_players=forecast["predicted_players_5m"],
        is_anomalous=anomaly_result["is_anomalous"]
    )

    return {
        "forecast": forecast,
        "anomaly_analysis": anomaly_result,
        "scaling_decision": decision
    }

@router.post("/mode")
def update_scaling_mode(req: ModeToggleRequest):
    new_mode = scaler.set_mode(req.mode)
    return {"status": "SUCCESS", "active_mode": new_mode}

@router.get("/mode")
def get_scaling_mode():
    return {"active_mode": scaler.mode}
