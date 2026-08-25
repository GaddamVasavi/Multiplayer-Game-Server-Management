"""
Official Kubernetes Python SDK Client Wrapper
Handles scale patching of Deployments and monitoring of cluster pod capacity.
"""

import logging
from typing import Dict, Any, Optional

try:
    from kubernetes import client, config
    KUBERNETES_SDK_AVAILABLE = True
except ImportError:
    KUBERNETES_SDK_AVAILABLE = False

logger = logging.getLogger("KubernetesClient")

class KubernetesScaleController:
    def __init__(self, deployment_name: str = "game-backend-deployment", namespace: str = "default"):
        self.deployment_name = deployment_name
        self.namespace = namespace
        self.apps_v1_api = None

        if KUBERNETES_SDK_AVAILABLE:
            try:
                config.load_incluster_config()
                logger.info("Loaded in-cluster Kubernetes configuration.")
            except Exception:
                try:
                    config.load_kube_config()
                    logger.info("Loaded local kubeconfig configuration.")
                except Exception as e:
                    logger.warning(f"Could not initialize Kubernetes config: {e}")

            if KUBERNETES_SDK_AVAILABLE:
                self.apps_v1_api = client.AppsV1Api()

    def scale_deployment(self, target_replicas: int) -> Dict[str, Any]:
        """
        Executes scale patch on target Kubernetes Deployment.
        """
        if not self.apps_v1_api:
            logger.info(f"[DRY-RUN] Scaling Deployment '{self.deployment_name}' to {target_replicas} replicas.")
            return {
                "status": "SIMULATED_SCALE_SUCCESS",
                "deployment": self.deployment_name,
                "target_replicas": target_replicas,
                "mode": "SIMULATION_ENVIRONMENT"
            }

        try:
            scale_body = client.V1Scale(
                spec=client.V1ScaleSpec(replicas=target_replicas)
            )
            response = self.apps_v1_api.patch_namespaced_deployment_scale(
                name=self.deployment_name,
                namespace=self.namespace,
                body=scale_body
            )
            logger.info(f"Successfully scaled '{self.deployment_name}' to {target_replicas} replicas via Kubernetes API.")
            return {
                "status": "KUBERNETES_API_SCALE_SUCCESS",
                "deployment": self.deployment_name,
                "replicas": response.spec.replicas,
            }
        except Exception as e:
            logger.error(f"Failed to scale Kubernetes deployment '{self.deployment_name}': {e}")
            return {
                "status": "KUBERNETES_API_ERROR",
                "error": str(e)
            }
