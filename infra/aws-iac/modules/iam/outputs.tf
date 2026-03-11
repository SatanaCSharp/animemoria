output "role_arn" {
  value       = aws_iam_role.github_actions_ecr.arn
  description = "ARN of the IAM role assumed by GitHub Actions"
}

