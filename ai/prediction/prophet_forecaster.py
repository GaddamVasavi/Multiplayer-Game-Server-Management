"""
Facebook Prophet Time-Series Forecaster for Game Server Player Traffic
"""

import pandas as pd
import numpy as np
from prophet import Prophet
import logging
from typing import Dict, Any, List

logger = logging.getLogger("ProphetForecaster")

class ProphetPlayerForecaster:
    def __init__(self):
        self.model = None
        self.is_fitted = False

    def fit_model(self, df: pd.DataFrame):
        """
        Fits Prophet model on dataframe containing 'ds' (datetime) and 'y' (active_players) columns.
        """
        if 'ds' not in df.columns or 'y' not in df.columns:
            logger.warning("DataFrame missing required 'ds' or 'y' columns for Prophet.")
            return

        self.model = Prophet(
            changepoint_prior_scale=0.05,
            seasonality_prior_scale=10.0,
            yearly_seasonality=False,
            weekly_seasonality=True,
            daily_seasonality=True
        )
        self.model.fit(df)
        self.is_fitted = True
        logger.info("Prophet time-series model fitted successfully.")

    def forecast_next_steps(self, periods: int = 15) -> Dict[str, Any]:
        """
        Forecasts active players for future time steps.
        """
        if not self.is_fitted or not self.model:
            return {
                "forecast": [50] * periods,
                "confidence_lower": [30] * periods,
                "confidence_upper": [70] * periods,
                "model": "Prophet-Fallback"
            }

        future = self.model.make_future_dataframe(periods=periods, freq='min')
        forecast = self.model.predict(future)

        recent = forecast.tail(periods)
        return {
            "forecast": [max(0, int(v)) for v in recent['yhat'].values],
            "confidence_lower": [max(0, int(v)) for v in recent['yhat_lower'].values],
            "confidence_upper": [max(0, int(v)) for v in recent['yhat_upper'].values],
            "model": "Prophet"
        }
