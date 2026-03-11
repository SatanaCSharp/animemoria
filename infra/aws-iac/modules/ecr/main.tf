resource "aws_ecr_repository" "apps" {
  for_each             = toset(var.repo_names)
  name                 = each.value
  image_tag_mutability = "IMMUTABLE" # Prevent overwriting tags
}

# Auto-delete old images
resource "aws_ecr_lifecycle_policy" "cleanup" {
  for_each   = aws_ecr_repository.apps
  repository = each.value.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 3 images"
      selection = {
        tagStatus     = "any"
        countType     = "imageCountMoreThan"
        countNumber   = 3
      }
      action = { type = "expire" }
    }]
  })
}