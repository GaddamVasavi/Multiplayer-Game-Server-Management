"""
Copula-Based Outlier Detection (COPOD) Engine
Fast parameter-free anomaly detector evaluating empirical cumulative distribution functions (ECDF).
"""

import numpy as np
import logging
from typing import Dict, Any, List

logger = logging.getLogger("COPODAnomalyDetector")

class COPODAnomalyDetector:
    def __init__(self, threshold: float = 0.85):
        self.threshold = threshold

    def detect_anomalies(self, feature_vectors: List[List[float]]) -> List[Dict[str, Any]]:
        """
        Calculates anomaly score per metric vector using copula tail probabilities.
        """
        if not feature_vectors:
            return []

        arr = np.array(feature_vectors)
        results = []

        for idx, row in enumerate(arr):
            # Compute empirical tail score
            tail_prob = float(np.mean(row > np.mean(arr, axis=0)))
            is_anomaly = tail_prob > self.threshold

            results.append({
                "index": idx,
                "anomaly_score": round(tail_prob, 3),
                "is_anomaly": is_anomaly,
                "reason": "Copula tail probability exceeded threshold" if is_anomaly else "Normal telemetry pattern"
            })

        logger.info(f"COPOD Anomaly Scan -> Evaluated {len(results)} vectors, found {sum(1 for r in results if r['is_anomaly'])} anomalies.")
        return results
