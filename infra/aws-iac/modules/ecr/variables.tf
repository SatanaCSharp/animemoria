variable "repo_names" {
  type        = list(string)
  description = "Names of the ECR repositories to create"

  default = [
    "animemoria-backend",
    "animemoria-frontend",
  ]
}

