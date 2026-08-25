"""
PyTest Test Suite for AI Engine (Mandatory Test 5: AI Scaling Decision)
Validates Traffic Forecasting, Anomaly Detection Scoring, and Kubernetes Scaling Calculations.
"""

import pytest
from prediction.traffic_predictor import TrafficPredictor
from anomaly_detection.anomaly_detector import MetricAnomalyDetector
from scaling_engine.scaling_calculator import ScalingEngine

def test_traffic_predictor_rising_trend():
    predictor = TrafficPredictor(capacity_per_pod=50)
    samples = [
        {"active_players": 20},
        {"active_players": 40},
        {"active_players": 80},
    ]

    forecast = predictor.forecast_traffic(samples)
    assert forecast["current_players"] == 80
    assert forecast["predicted_players_5m"] > 80
    assert forecast["trend"] == "RISING"

def test_anomaly_detector_normal_metrics():
    detector = MetricAnomalyDetector()
    normal_sample = {
        "cpu_usage_pct": 35.0,
        "memory_usage_mb": 200.0,
        "average_latency_ms": 22.0,
        "dropped_packets": 0
    }

    result = detector.detect_anomaly(normal_sample)
    assert result["is_anomalous"] == False
    assert result["severity"] == "NORMAL"

def test_anomaly_detector_cpu_spike_anomaly():
    detector = MetricAnomalyDetector()
    spike_sample = {
        "cpu_usage_pct": 98.5,
        "memory_usage_mb": 850.0,
        "average_latency_ms": 320.0,
        "dropped_packets": 15
    }

    result = detector.detect_anomaly(spike_sample)
    assert result["is_anomalous"] == True
    assert "Extreme CPU Usage Spike (>90%)" in result["reasons"]

def test_ai_scaling_decision_scale_up_trigger(mandatory_test_5=True):
    """
    Mandatory Test 5: Verify AI scaling decision algorithm when predicted traffic exceeds pod capacity.
    """
    scaler = ScalingEngine(capacity_per_pod=50, min_pods=2, max_pods=20, safety_buffer=0.20)
    
    # Test 1: Current 2 pods (capacity 100). Predicted traffic: 180 players.
    # Buffered players = 180 * 1.20 = 216 -> ceil(216 / 50) = 5 pods.
    decision = scaler.calculate_scaling_decision(
        current_pods=2,
        predicted_players=180,
        is_anomalous=False
    )

    assert decision["action"] == "SCALE_UP"
    assert decision["target_pods"] == 5
    assert decision["delta_pods"] == 3

def test_ai_scaling_mode_switch():
    scaler = ScalingEngine()
    assert scaler.mode == "RECOMMENDATION"

    updated_mode = scaler.set_mode("AUTOMATIC")
    assert updated_mode == "AUTOMATIC"
    assert scaler.mode == "AUTOMATIC"
