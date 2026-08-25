"""
Telemetry Data Preprocessing & Feature Engineering Pipeline
Converts raw time-series metrics into ML-ready feature matrices for LSTM and Isolation Forest models.
"""

import numpy as np
import pandas as pd
from typing import Tuple, List, Dict, Any

class TelemetryFeatureEngineer:
    def __init__(self, sequence_length: int = 10):
        self.sequence_length = sequence_length

    def create_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Engineers rolling averages, lag features, and rate-of-change metrics.
        """
        data = df.copy()

        # Fill missing values
        data = data.ffill().bfill()

        # Rolling Statistics (3-sample & 5-sample windows)
        data['players_roll_mean_3'] = data['active_players'].rolling(window=3, min_periods=1).mean()
        data['players_roll_std_3'] = data['active_players'].rolling(window=3, min_periods=1).std().fillna(0)
        data['cpu_roll_mean_3'] = data['cpu_usage_pct'].rolling(window=3, min_periods=1).mean()

        # Lag Features
        data['players_lag_1'] = data['active_players'].shift(1).fillna(method='bfill')
        data['players_lag_2'] = data['active_players'].shift(2).fillna(method='bfill')

        # Rate of Change (Velocity & Acceleration)
        data['players_velocity'] = data['active_players'] - data['players_lag_1']
        data['players_acceleration'] = data['players_velocity'] - (data['players_lag_1'] - data['players_lag_2'])

        return data

    def prepare_lstm_sequences(self, data: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Constructs (X, y) sliding window arrays for PyTorch LSTM training.
        X shape: (num_samples, sequence_length, num_features)
        y shape: (num_samples, 1)
        """
        X, y = [], []
        for i in range(len(data) - self.sequence_length):
            X.append(data[i : i + self.sequence_length])
            y.append(data[i + self.sequence_length, 0])  # Predict active_players column

        return np.array(X), np.array(y)
