provider "aws" {
  region = "eu-north-1"
}

module "gh_oidc" {
  source = "../../modules/iam"

  env              = "dev"
  eks_cluster_name = "animemoria-dev" # replace with your actual EKS cluster name
}

module "ecr_repos" {
  source = "../../modules/ecr"
}
