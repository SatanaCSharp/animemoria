provider "aws" {
  region = "eu-north-1"
}

module "gh_oidc" {
  source = "../../modules/iam"

  env         = "dev"
}

module "ecr_repos" {
  source = "../../modules/ecr"

}