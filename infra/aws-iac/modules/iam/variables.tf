variable "env" {
  type        = string
  description = "The deployment environment (dev/prod)"

  validation {
    condition     = contains(["dev", "stage", "prod"], var.env)
    error_message = "The env variable must be dev, stage, or prod."
  }
}

variable "github_repo" {
  type        = string
  description = "The GitHub organization and repository name (e.g. org/repo)"

  default = "SatanaCSharp/animemoria"
}

variable "eks_cluster_name" {
  type        = string
  description = "Name of the EKS cluster to grant the GitHub Actions role access to"
}
