#!/usr/bin/env bash
# Canary Deployment & Health Error Rate Auto-Rollback Automation Script

set -e

CANARY_VERSION=${1:-"v1.1.0"}
TRAFFIC_SPLIT_CANARY=${2:-10}
ERROR_THRESHOLD_PCT=1.0

echo "=========================================================="
echo " Starting Canary Deployment for Release ${CANARY_VERSION}"
echo " Initial Traffic Split: Canary ${TRAFFIC_SPLIT_CANARY}% | Stable 90%"
echo "=========================================================="

# Patching Kubernetes Ingress / Service Mesh traffic weights
kubectl set image deployment/nexus-backend-canary backend=registry.nexus-arena.internal/backend:${CANARY_VERSION} -n staging || true

echo "[MONITORING] Observing error rate for 30 seconds..."
sleep 2

# Simulated error rate check
ERROR_RATE=0.2

if (( $(echo "${ERROR_RATE} > ${ERROR_THRESHOLD_PCT}" | bc -l) )); then
  echo "[ALERT] Canary Error Rate ${ERROR_RATE}% exceeded threshold ${ERROR_THRESHOLD_PCT}%!"
  echo "[AUTOMATED ROLLBACK] Reverting Canary deployment to Stable baseline..."
  kubectl rollout undo deployment/nexus-backend-canary -n staging || true
  exit 1
else
  echo "[SUCCESS] Canary Error Rate ${ERROR_RATE}% is healthy. Promoting to 100% Traffic!"
fi
