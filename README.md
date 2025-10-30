# simple-log-service-Technical-Assessment
Creating a simple log service using AWS services, stores and retrieves logs.

## What it does
- Add log entries (ID, DateTime, Severity, Message)
- Retrieve last 100 log entries

## Features
- Add log entries (ID, DateTime, Severity, Message)
- Retrieve last 100 log entries

## Prerequisites
AWS account, Terraform installed

## Quick Setup

### 1. Configure AWS Credentials
```bash
aws configure
```
Enter your AWS credentials when prompted:
- **AWS Access Key ID**: Your access key
- **AWS Secret Access Key**: Your secret key
- **Default region name**: `af-south-1`
- **Default output format**: `json`

### 2. Deploy Infrastructure
```bash
cd terraform
terraform init
terraform apply
```

### 3. Get Application Credentials
```bash

# Dedicated credentials for the log service
terraform output access_key_id
terraform output secret_access_key
```

## Cleanup
```bash
terraform destroy