"""
PyTorch LSTM Neural Network for Time-Series Player Forecasting
"""

import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import logging
from typing import Tuple, List

logger = logging.getLogger("PyTorchLSTM")

class PlayerTrafficLSTM(nn.Module):
    def __init__(self, input_dim: int = 4, hidden_dim: int = 64, num_layers: int = 2, output_dim: int = 1):
        super(PlayerTrafficLSTM, self).__init__()
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers

        self.lstm = nn.LSTM(input_dim, hidden_dim, num_layers, batch_first=True, dropout=0.2)
        self.fc = nn.Linear(hidden_dim, output_dim)
        self.relu = nn.ReLU()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_dim).to(x.device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_dim).to(x.device)

        out, _ = self.lstm(x, (h0, c0))
        out = self.fc(self.relu(out[:, -1, :]))
        return out

class LSTMTrainer:
    def __init__(self, model: PlayerTrafficLSTM, lr: float = 0.001):
        self.model = model
        self.criterion = nn.MSELoss()
        self.optimizer = optim.Adam(model.parameters(), lr=lr)

    def train_epoch(self, X_train: np.ndarray, y_train: np.ndarray) -> float:
        self.model.train()
        inputs = torch.tensor(X_train, dtype=torch.float32)
        targets = torch.tensor(y_train, dtype=torch.float32).unsqueeze(1)

        self.optimizer.zero_grad()
        outputs = self.model(inputs)
        loss = self.criterion(outputs, targets)
        loss.backward()
        self.optimizer.step()

        return float(loss.item())

    def predict(self, input_seq: np.ndarray) -> float:
        self.model.eval()
        with torch.no_grad():
            tensor_in = torch.tensor(input_seq, dtype=torch.float32).unsqueeze(0)
            prediction = self.model(tensor_in)
            return float(prediction.item())
