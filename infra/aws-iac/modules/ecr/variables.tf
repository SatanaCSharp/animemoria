variable "repo_names" {
  type        = list(string)
  description = "Names of the ECR repositories to create"

  default = [
    "registry-service-rest",
    "users-service-graphql",
    "users-service-grpc",
    "auth-service-graphql",
    "auth-service-grpc",
    "api-gateway-service-graphql",
    "api-gateway-service-rest",
    "admin",
    "web",
  ]
}

