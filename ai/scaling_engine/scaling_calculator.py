"""
Intelligent Auto-Scaling Calculator & Kubernetes Trigger Engine
Calculates target server pod replicas based on traffic forecasts and safety buffers.
Supports Recommendation Mode and Autonomous Mode.
"""

import math
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("ScalingEngine")

class ScalingEngine:
    def __init__(self, capacity_per_pod: int = 50, min_pods: int = 2, max_pods: int = 20, safety_buffer: float = 0.20):
        self.capacity_per_pod = capacity_per_pod
        self.min_pods = min_pods
        self.max_pods = max_pods
        self.safety_buffer = safety_buffer
        self.mode = "RECOMMENDATION"  # Options: RECOMMENDATION | AUTOMATIC

    def set_mode(self, mode: str) -> str:
        if mode.upper() in ["RECOMMENDATION", "AUTOMATIC"]:
          self.mode = mode.upper()
          logger.info(f"Auto-Scaling Engine mode updated to: {self.mode}")
        return self.mode

    def calculate_scaling_decision(self, current_pods: int, predicted_players: int, is_anomalous: bool) -> Dict[str, Any]:
        """
        Calculates recommended and target Kubernetes pod replicas.
        Formula:
        N_target = max(N_min, min(N_max, ceil((PredictedPlayers * (1 + SafetyBuffer)) / CapacityPerPod)))
        """
        buffered_players = float(predicted_players) * (1.0 + self.safety_buffer)
        
        # If anomaly detected, add extra emergency pod
        if is_anomalous:
            buffered_players += self.capacity_per_pod

        target_pods = math.ceil(buffered_players / float(self.capacity_per_pod))
        target_pods = max(self.min_pods, min(self.max_pods, target_pods))

        if target_pods > current_pods:
            action = "SCALE_UP"
            reason = f"Traffic forecast ({predicted_players} players) exceeds current capacity ({current_pods * self.capacity_per_pod} players)."
        elif target_pods < current_pods:
            action = "SCALE_DOWN"
            reason = f"Traffic forecast ({predicted_players} players) requires fewer server instances."
        else:
            action = "MAINTAIN"
            reason = "Current server pod capacity matches predicted load optimal range."

        decision = {
            "mode": self.mode,
            "action": action,
            "current_pods": current_pods,
            "target_pods": target_pods,
            "delta_pods": target_pods - current_pods,
            "predicted_players": predicted_players,
            "safety_buffer_pct": int(self.safety_buffer * 100),
            "reason": reason,
            "execute_status": "RECOMMENDED_ONLY" if self.mode == "RECOMMENDATION" else "AUTOMATED_EXECUTION_TRIGGERED"
        }

        logger.info(f"Scaling Decision ({self.mode}): {action} -> Target Pods: {target_pods} (Delta: {target_pods - current_pods})")
        return decision
