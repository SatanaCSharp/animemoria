resource "aws_iam_role" "github_actions_ecr" {
  name = "github-actions-role-${var.env}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRoleWithWebIdentity"
        Effect = "Allow"
        Principal = {
          Federated = aws_iam_openid_connect_provider.github.arn
        }
        Condition = {
          StringLike = {
            "token.actions.githubusercontent.com:sub": "repo:${var.github_repo}:*"
          }
        }
      }
    ]
  })
}

