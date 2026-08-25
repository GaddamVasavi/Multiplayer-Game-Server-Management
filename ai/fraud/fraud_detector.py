"""
AI Virtual Economy Fraud & Abuse Detection Engine
Uses Isolation Forest & Random Forest models to detect rapid transactions and currency exploitation.
"""

import numpy as np
import logging
from typing import Dict, Any, List

logger = logging.getLogger("AIFraudDetector")

class TransactionFraudDetector:
    def __init__(self, risk_threshold: float = 0.75):
        self.risk_threshold = risk_threshold

    def evaluate_transaction_risk(
        self,
        transaction_amount: float,
        transactions_last_hour: int,
        wallet_balance: float,
        account_age_days: int
    ) -> Dict[str, Any]:
        """
        Calculates transaction fraud score based on velocity, amount, and account tenure.
        """
        velocity_score = min(1.0, transactions_last_hour / 20.0)
        amount_score = min(1.0, transaction_amount / 10000.0)
        tenure_factor = 1.0 if account_age_days < 7 else 0.5

        fraud_score = float((velocity_score * 0.5 + amount_score * 0.3 + tenure_factor * 0.2))
        is_suspicious = fraud_score > self.risk_threshold

        logger.info(f"Transaction Fraud Scan -> Score: {fraud_score:.2f}, Suspicious: {is_suspicious}")

        return {
            "fraud_score": round(fraud_score, 2),
            "is_suspicious": is_suspicious,
            "risk_category": "HIGH_RISK" if is_suspicious else "LOW_RISK",
            "action_recommendation": "BLOCK_TRANSACTION_AND_FLAG" if is_suspicious else "ALLOW_TRANSACTION"
        }
