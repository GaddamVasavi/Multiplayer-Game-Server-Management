"""
Q-Learning Reinforcement Learning Agent for Cost-Optimized Kubernetes Scaling
Balances server cloud cost vs SLA latency violation penalty.
"""

import numpy as np
import logging
from typing import Dict, Any, Tuple

logger = logging.getLogger("RLScalingAgent")

class QLearningScalingAgent:
    def __init__(self, num_states: int = 10, num_actions: int = 3, alpha: float = 0.1, gamma: float = 0.9, epsilon: float = 0.1):
        self.num_states = num_states
        self.num_actions = num_actions  # 0: Scale Down 1, 1: Maintain, 2: Scale Up 1
        self.alpha = alpha
        self.gamma = gamma
        self.epsilon = epsilon
        # Q-Table state x action initialized to zeros
        self.q_table = np.zeros((num_states, num_actions))

    def _discretize_state(self, current_pods: int, predicted_players: int, latency_ms: float) -> int:
        """
        Discretizes server state into integer index 0-9 based on load factor.
        """
        load_per_pod = predicted_players / max(1, current_pods)
        if latency_ms > 150:
            return 9  # Critical state
        state_idx = min(8, int(load_per_pod / 15.0))
        return state_idx

    def select_action(self, state: int) -> int:
        """
        Epsilon-greedy action selection.
        """
        if np.random.uniform(0, 1) < self.epsilon:
            return np.random.choice(self.num_actions)  # Explore
        return int(np.argmax(self.q_table[state]))  # Exploit

    def update_q_value(self, state: int, action: int, reward: float, next_state: int):
        """
        Q-learning Bellman update: Q(s,a) = Q(s,a) + alpha * [reward + gamma * max Q(s',a') - Q(s,a)]
        """
        best_next = np.max(self.q_table[next_state])
        old_q = self.q_table[state, action]
        self.q_table[state, action] = old_q + self.alpha * (reward + self.gamma * best_next - old_q)

    def calculate_reward(self, current_pods: int, latency_ms: float, SLA_threshold: float = 100.0, cost_per_pod: float = 0.05) -> float:
        """
        Reward function:
        Reward = - (Pod Cost) - (SLA Latency Penalty)
        """
        pod_cost = current_pods * cost_per_pod
        sla_penalty = max(0.0, (latency_ms - SLA_threshold) / 20.0) ** 2
        reward = -(pod_cost + sla_penalty)
        return float(reward)
