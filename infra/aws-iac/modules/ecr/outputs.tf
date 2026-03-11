output "repository_urls" {
  value       = { for name, repo in aws_ecr_repository.apps : name => repo.repository_url }
  description = "Map of ECR repository names to their URLs"
}

