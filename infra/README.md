# infra/

[Terraform](https://terraform.io) configuration to provision all AWS cloud resources for DeployStack.

## Resources

| File | What it provisions |
|---|---|
| `main.tf` | AWS provider, VPC, subnets, remote state backend |
| `s3.tf` | S3 bucket for build artifacts (versioned, encrypted) |
| `rds.tf` | PostgreSQL RDS instance (encrypted, automated backups) |
| `redis.tf` | ElastiCache Redis cluster (for job queue + pub/sub) |
| `ecr.tf` | ECR Docker image repositories for each service |

## Usage

```bash
terraform init
terraform plan -var-file=prod.tfvars
terraform apply -var-file=prod.tfvars
```

Create a `prod.tfvars` (never commit this file):
```hcl
aws_region   = "us-east-1"
environment  = "production"
db_password  = "super-secret"
```

## Outputs

- `rds_endpoint` — PostgreSQL host
- `redis_endpoint` — Redis host
- `s3_bucket_name` — Artifact bucket
- `ecr_repo_urls` — Docker registry URLs