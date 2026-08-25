variable "kubeconfig_path" {
  type        = string
  default     = "~/.kube/config"
  description = "Path to local kubeconfig file"
}

variable "namespace" {
  type        = string
  default     = "nexus-arena"
  description = "Target Kubernetes namespace"
}

variable "environment" {
  type        = string
  default     = "production"
  description = "Environment name (production/staging/dev)"
}

variable "grafana_admin_password" {
  type        = string
  default     = "admin_secure_password_99"
  sensitive   = true
  description = "Grafana dashboard admin password"
}
