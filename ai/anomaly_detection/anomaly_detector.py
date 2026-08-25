"""
Anomaly Detection Engine
Uses Isolation Forest algorithm to detect server metric anomalies including CPU/Memory spikes,
extreme latency variance, and packet loss bursts.
"""

import numpy as np
from sklearn.ensemble import IsolationForest
from typing import Dict, Any, List
import logging

logger = logging.getLogger("AnomalyDetector")

class MetricAnomalyDetector:
    def __init__(self):
        # Initialize IsolationForest model with 5% contamination target
        self.model = IsolationForest(contamination=0.05, random_state=42)
        # Pre-train with synthetic baseline operational data
        self._bootstrap_model()

    def _bootstrap_model(self):
        # Features: [cpu_pct, memory_mb, latency_ms, packet_loss]
        normal_data = np.random.normal(loc=[35.0, 256.0, 30.0, 0.1], scale=[10.0, 40.0, 8.0, 0.2], size=(200, 4))
        normal_data = np.clip(normal_data, a_min=0, a_max=None)
        self.model.fit(normal_data)
        logger.info("Anomaly Detector initialized with bootstrap operational baseline.")

    def detect_anomaly(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """
        Evaluates current server telemetry metrics for anomalies.
        """
        cpu = float(metrics.get("cpu_usage_pct", 30.0))
        memory = float(metrics.get("memory_usage_mb", 250.0))
        latency = float(metrics.get("average_latency_ms", 25.0))
        packet_loss = float(metrics.get("dropped_packets", 0))

        features = np.array([[cpu, memory, latency, packet_loss]])
        prediction = self.model.predict(features)[0]  # 1 = normal, -1 = anomaly
        anomaly_score = float(self.model.score_samples(features)[0])

        is_anomalous = prediction == -1 or cpu > 90.0 or latency > 250.0

        reasons = []
        if cpu > 90.0:
            reasons.append("Extreme CPU Usage Spike (>90%)")
        if latency > 250.0:
            reasons.append("Severe Latency Degradation (>250ms)")
        if packet_loss > 10:
            reasons.append("Packet Loss Anomaly")

        if is_anomalous:
            logger.warning(f"ANOMALY DETECTED! Score: {anomaly_score:.3f}, Reasons: {reasons}")

        return {
            "is_anomalous": is_anomalous,
            "anomaly_score": round(anomaly_score, 4),
            "reasons": reasons if reasons else ["Metrics within normal threshold bounds"],
            "severity": "CRITICAL" if (cpu > 95.0 or latency > 400.0) else ("WARNING" if is_anomalous else "NORMAL"),
        }
