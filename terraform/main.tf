terraform {
  required_providers {
    aws = {
        source = "hashicorp/aws"
        version = "~>5.0"
    }

  }
}

provider "aws" {
  region = "af-south-1"
  #access_key
  #secret_key
}

resource "aws_dynamodb_table" "log_instance_table" {
  name           = "log-instance-table"
  billing_mode   = "PROVISIONED"
  read_capacity  = 5
  write_capacity = 1
  hash_key = "ID"
  range_key = "DateTime"



attribute {
    name = "ID"
    type = "S"
  }
  attribute {
    name = "DateTime"
    type = "S"
  }

    global_secondary_index {
      name = "datetime-index"
      hash_key = "DateTime"
      read_capacity = 5
      write_capacity = 1
      projection_type = "ALL"
    }

  tags = {
    name = "logInstanceTable"
    Environment = "dev"
  }
}

resource "aws_iam_policy" "dynamodb_log_policy" {
  name        = "dynamodb-log-policy"
  description = "Policy to allow logging to DynamoDB table"
  policy      = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:BatchWriteItem",
        "dynamodb:BatchGetItem","dynamodb:Query","dynamodb:Scan","dynamodb:DescribeTable"
      ]
        Effect   = "Allow"
        Resource = [
          aws_dynamodb_table.log_instance_table.arn,
          "${aws_dynamodb_table.log_instance_table.arn}/index/*"]
      }
    ]
  })
}



#iam user and user group creation

#iam user 
resource "aws_iam_user" "log_user" {
  name = "log-user"

}

#iam group
resource "aws_iam_group" "log_group" {
  name = "log-group"
  
}

#attach policy
resource "aws_iam_group_policy_attachment" "policy_attachment" {
  group = aws_iam_group.log_group.name
  policy_arn = aws_iam_policy.dynamodb_log_policy.arn
}

#add user to group
resource "aws_iam_user_group_membership" "user_group_addition" {
  user = aws_iam_user.log_user.name
  groups = [aws_iam_group.log_group.name]
}

#access key
resource "aws_iam_access_key" "log_user_key" {
  user = aws_iam_user.log_user.name
  
}

output "access_key_id" {
  value = aws_iam_access_key.log_user_key.id
}

output "secret_access_key" {
  value = aws_iam_access_key.log_user_key.secret
  sensitive = true
}




#lambda role

resource "aws_iam_role" "lambda_dynamodb_role" {
  name = "lambda-dynamodb-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
  
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_dynamodb_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_dynamodb" {
  role       = aws_iam_role.lambda_dynamodb_role.name
  policy_arn = aws_iam_policy.dynamodb_log_policy.arn
}

resource "aws_lambda_function" "log_service" {
  function_name = "log-service-function"
  role          = aws_iam_role.lambda_dynamodb_role.arn
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  filename      = "${path.module}/../lambda/dist.zip"

  source_code_hash = filebase64sha256("${path.module}/../lambda/dist.zip")

  timeout = 10


  depends_on = [
    aws_iam_role_policy_attachment.lambda_logs,
    aws_iam_role_policy_attachment.lambda_dynamodb
  ]
  
  environment {
    variables = {
      DYNAMODB_TABLE = aws_dynamodb_table.log_instance_table.name
      Shared_secret = "assessment-api-key"
    }
  }
}


resource "aws_lambda_function_url" "log_service_url" {
  function_name      = aws_lambda_function.log_service.function_name
  authorization_type = "NONE" 
  cors {
    allow_credentials = false
    allow_headers     = ["content-type", "x-api-key"]
    allow_methods     = ["*"]
    allow_origins     = ["*"]
    max_age           = 3600
  }
}


output "function_url" {
  value = aws_lambda_function_url.log_service_url.function_url
  description = "Public HTTPS endpoint for log service API"
}