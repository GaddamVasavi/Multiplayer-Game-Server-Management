"""
Player Engagement & Churn Risk Predictor
Evaluates player login frequency, match completion rates, and win/loss ratios to classify churn risk.
"""

import numpy as np
import logging
from typing import Dict, Any

logger = logging.getLogger("ChurnPredictor")

class ChurnRiskPredictor:
    def evaluate_churn_risk(
        self,
        days_since_last_login: int,
        matches_last_7_days: int,
        win_rate_pct: float,
        session_duration_avg_mins: float
    ) -> Dict[str, Any]:
        """
        Calculates churn risk probability (0.0 = High Retention, 1.0 = High Churn Risk).
        """
        recency_penalty = min(1.0, days_since_last_login / 14.0)
        frequency_score = max(0.0, 1.0 - (matches_last_7_days / 10.0))
        frustration_factor = 0.3 if win_rate_pct < 20.0 else 0.0

        churn_risk_score = float(min(1.0, recency_penalty * 0.5 + frequency_score * 0.3 + frustration_factor))

        if churn_risk_score > 0.7:
            risk_category = "HIGH_CHURN_RISK"
        elif churn_risk_score > 0.4:
            risk_category = "MODERATE_CHURN_RISK"
        else:
            risk_category = "HIGHLY_ENGAGED"

        logger.info(f"Churn Risk Evaluation -> Score: {churn_risk_score:.2f} ({risk_category})")

        return {
            "churn_risk_score": round(churn_risk_score, 2),
            "engagement_score": round(max(0.0, 100.0 * (1.0 - churn_risk_score)), 1),
            "risk_category": risk_category,
            "incentive_recommendation": "GRANT_BONUS_QUEST_REWARD" if churn_risk_score > 0.5 else "NO_ACTION"
        }
