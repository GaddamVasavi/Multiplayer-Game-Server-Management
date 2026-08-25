"""
Predictive Server Pre-warming Controller
Pre-allocates Kubernetes server pods ahead of predicted traffic spikes to maintain 0ms queue delay.
"""

import logging
from typing import Dict, Any

logger = logging.getLogger("ServerPrewarmer")

class ServerPrewarmer:
    def __init__(self, buffer_capacity: int = 50):
        self.buffer_capacity = buffer_capacity

    def evaluate_prewarm_need(self, current_pods: int, predicted_players_15m: int) -> Dict[str, Any]:
        """
        Determines whether server pre-warming is required.
        """
        needed_pods = (predicted_players_15m + self.buffer_capacity - 1) // self.buffer_capacity
        if needed_pods > current_pods:
            pods_to_add = needed_pods - current_pods
            logger.info(f"PRE-WARM TRIGGERED: Pre-allocating {pods_to_add} pods for predicted 15m load of {predicted_players_15m} players.")
            return {
                "prewarm_required": True,
                "target_pods": needed_pods,
                "pods_to_add": pods_to_add,
                "reason": f"Pre-warming for predicted traffic spike ({predicted_players_15m} players)"
            }
        return {
            "prewarm_required": False,
            "target_pods": current_pods,
            "pods_to_add": 0,
            "reason": "Current pod capacity sufficient for predicted load"
        }
