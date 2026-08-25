"""
PyTorch Autoencoder Neural Network for Multidimensional Metric Anomaly Scoring
"""

import torch
import torch.nn as nn
import numpy as np
import logging
from typing import Tuple, Dict, Any

logger = logging.getLogger("AutoencoderAnomaly")

class MetricAutoencoder(nn.Module):
    def __init__(self, input_dim: int = 4):
        super(MetricAutoencoder, self).__init__()
        # Encoder
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 16),
            nn.ReLU(),
            nn.Linear(16, 8),
            nn.ReLU(),
            nn.Linear(8, 2)  # Bottleneck layer
        )
        # Decoder
        self.decoder = nn.Sequential(
            nn.Linear(2, 8),
            nn.ReLU(),
            nn.Linear(8, 16),
            nn.ReLU(),
            nn.Linear(16, input_dim)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        latent = self.encoder(x)
        reconstructed = self.decoder(latent)
        return reconstructed

class AutoencoderAnomalyScorer:
    def __init__(self, threshold: float = 0.5):
        self.model = MetricAutoencoder(input_dim=4)
        self.threshold = threshold
        self.criterion = nn.MSELoss(reduction='none')

    def score_sample(self, sample_features: List[float]) -> Dict[str, Any]:
        """
        Computes reconstruction error (MSE) between input metrics and autoencoder output.
        High reconstruction error indicates anomaly.
        """
        self.model.eval()
        with torch.no_grad():
            tensor_in = torch.tensor([sample_features], dtype=torch.float32)
            reconstructed = self.model(tensor_in)
            loss_per_feature = self.criterion(reconstructed, tensor_in).numpy()[0]
            total_mse = float(np.mean(loss_per_feature))

        is_anomalous = total_mse > self.threshold

        return {
            "reconstruction_error": round(total_mse, 4),
            "is_anomalous": is_anomalous,
            "threshold": self.threshold,
            "feature_errors": {
                "cpu_err": round(float(loss_per_feature[0]), 4),
                "mem_err": round(float(loss_per_feature[1]), 4),
                "latency_err": round(float(loss_per_feature[2]), 4),
                "loss_err": round(float(loss_per_feature[3]), 4)
            }
        }
