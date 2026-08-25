"""
AI Model Accuracy & Performance Metrics Evaluator
Calculates MAE, RMSE, MAPE, and R2 Scores for AI Traffic Predictors.
"""

import numpy as np
import logging
from typing import Dict, Any, List

logger = logging.getLogger("ModelEvaluator")

class ModelEvaluator:
    @staticmethod
    def calculate_metrics(y_true: List[float], y_pred: List[float]) -> Dict[str, float]:
        """
        Computes Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), and Mean Absolute Percentage Error (MAPE).
        """
        true_arr = np.array(y_true, dtype=float)
        pred_arr = np.array(y_pred, dtype=float)

        mae = float(np.mean(np.abs(true_arr - pred_arr)))
        rmse = float(np.sqrt(np.mean((true_arr - pred_arr) ** 2)))
        mape = float(np.mean(np.abs((true_arr - pred_arr) / np.maximum(1.0, true_arr))) * 100.0)

        logger.info(f"Model Evaluation Metrics -> MAE: {mae:.2f}, RMSE: {rmse:.2f}, MAPE: {mape:.2f}%")

        return {
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
            "mape_pct": round(mape, 2),
            "accuracy_pct": round(max(0.0, 100.0 - mape), 2)
        }
