resource "aws_eks_access_entry" "github_actions" {
  cluster_name  = var.eks_cluster_name
  principal_arn = aws_iam_role.github_actions_ecr.arn
  type          = "STANDARD"
}

resource "aws_eks_access_policy_association" "github_actions" {
  cluster_name  = var.eks_cluster_name
  principal_arn = aws_iam_role.github_actions_ecr.arn
  policy_arn    = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"

  access_scope {
    type = "cluster"
  }
}