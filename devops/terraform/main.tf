terraform {
  required_version = ">= 1.5.0"
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.25.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.12.0"
    }
  }
}

provider "kubernetes" {
  config_path = var.kubeconfig_path
}

provider "helm" {
  kubernetes {
    config_path = var.kubeconfig_path
  }
}

resource "kubernetes_namespace" "nexus_namespace" {
  metadata {
    name = var.namespace
    labels = {
      environment = var.environment
      managed-by  = "terraform"
    }
  }
}

resource "helm_release" "prometheus_community" {
  name       = "prometheus-stack"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  namespace  = kubernetes_namespace.nexus_namespace.metadata[0].name

  set {
    name  = "grafana.adminPassword"
    value = var.grafana_admin_password
  }
}
