"""
AI Dynamic Game Difficulty Optimizer
Adjusts orb spawn rates and speed vectors dynamically to balance player win rates near 50%.
"""

import logging
from typing import Dict, Any

logger = logging.getLogger("DifficultyTuner")

class DynamicDifficultyTuner:
    def tune_difficulty(self, consecutive_wins: int, consecutive_losses: int, current_elo: int) -> Dict[str, Any]:
        """
        Calculates orb spawn rate and dynamic speed multiplier based on player momentum.
        """
        if consecutive_wins >= 3:
            speed_multiplier = 1.25
            orb_spawn_interval_sec = 2.0
            difficulty_tier = "HARD"
        elif consecutive_losses >= 3:
            speed_multiplier = 0.85
            orb_spawn_interval_sec = 4.0
            difficulty_tier = "EASY"
        else:
            speed_multiplier = 1.0
            orb_spawn_interval_sec = 3.0
            difficulty_tier = "BALANCED"

        logger.info(f"Dynamic Difficulty Tuner -> Tier: {difficulty_tier}, Speed Mult: {speed_multiplier}")

        return {
            "difficulty_tier": difficulty_tier,
            "speed_multiplier": speed_multiplier,
            "orb_spawn_interval_sec": orb_spawn_interval_sec,
            "target_win_probability": 0.50
        }
