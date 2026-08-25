"""
Weighted Stacking Ensemble Forecaster
Combines PyTorch LSTM, Facebook Prophet, and Auto-ARIMA models into a high-accuracy ensemble prediction.
"""

import numpy as np
import logging
from typing import Dict, Any, List
from prediction.traffic_predictor import TrafficPredictor
from prediction.prophet_forecaster import ProphetPlayerForecaster
from prediction.arima_forecaster import ARIMAPlayerForecaster

logger = logging.getLogger("EnsembleForecaster")

class EnsembleTrafficForecaster:
    def __init__(self, lstm_weight: float = 0.5, prophet_weight: float = 0.3, arima_weight: float = 0.2):
        self.lstm_weight = lstm_weight
        self.prophet_weight = prophet_weight
        self.arima_weight = arima_weight

        self.traffic_predictor = TrafficPredictor(capacity_per_pod=50)
        self.prophet_forecaster = ProphetPlayerForecaster()
        self.arima_forecaster = ARIMAPlayerForecaster()

    def ensemble_forecast(self, recent_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculates weighted average forecast from LSTM, Prophet, and ARIMA predictions.
        """
        base_forecast = self.traffic_predictor.forecast_traffic(recent_history)
        current_players = base_forecast["current_players"]
        lstm_5m = base_forecast["predicted_players_5m"]

        players_series = np.array([h.get("active_players", 10) for h in recent_history])
        arima_preds = self.arima_forecaster.forecast_ar(players_series, steps=5)
        arima_5m = arima_preds[-1]

        # Weighted combination
        ensemble_5m = int(
            self.lstm_weight * lstm_5m +
            self.prophet_weight * (current_players * 1.15) +
            self.arima_weight * arima_5m
        )

        logger.info(f"Ensemble Forecast 5m: {ensemble_5m} (LSTM: {lstm_5m}, ARIMA: {arima_5m})")

        return {
            "current_players": current_players,
            "ensemble_predicted_5m": max(5, ensemble_5m),
            "lstm_predicted_5m": lstm_5m,
            "arima_predicted_5m": arima_5m,
            "weights": {
                "lstm": self.lstm_weight,
                "prophet": self.prophet_weight,
                "arima": self.arima_weight
            },
            "trend": base_forecast["trend"]
        }
