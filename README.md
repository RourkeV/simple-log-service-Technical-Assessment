# Simple Log Service

A serverless logging service built with AWS Lambda, DynamoDB, and Terraform.

## Overview

This application provides a REST API for storing and retrieving application logs with a simple web interface for interaction.

## Architecture

- **Frontend**: Static HTML/CSS/JavaScript web interface
- **Backend**: AWS Lambda function (Node.js)
- **Database**: Amazon DynamoDB
- **Infrastructure**: Managed with Terraform
- **Region**: Africa South (Cape Town) - `af-south-1`

## Features

✅ **Write Logs**: POST log entries with auto-generated unique IDs
✅ **Read Logs**: Retrieve the most recent 100 log entries
✅ **Severity Levels**: INFO, WARNING, ERROR
✅ **Auto-timestamping**: Each log entry includes ISO timestamp
✅ **API Key Authentication**: Secure access with shared secret

## Project Structure

```
simple-log-service-Technical-Assessment/
├── frontend/
│   ├── index.html          # Web interface
│   ├── index.css           # Styling
│   └── index.js            # Frontend logic
├── lambda/
│   ├── index.js            # Lambda handler
│   ├── package.json        # Node dependencies
│   ├── node_modules/       # AWS SDK
│   └── dist.zip            # Deployment package
├── terraform/
│   └── main.tf             # Infrastructure as Code
└── README.md               # This file
```

## Prerequisites

- Node.js and npm
- Terraform
- AWS CLI configured
- PowerShell (for deployment scripts)

## Setup Instructions

### 1. Install Lambda Dependencies

```powershell
cd lambda
npm install
```

### 2. Deploy Infrastructure

```powershell
cd terraform
terraform init
terraform apply
```

### 3. Get Your API Endpoint

```powershell
terraform output function_url
```

### 4. Configure Frontend

Open `frontend/index.html` and update:
- Line 15: Paste your Lambda Function URL
- Line 20: Verify API key matches Terraform (`assessment-api-key`)

### 5. Open the Web Interface

Simply open `frontend/index.html` in your web browser.

## API Endpoints

### POST /logs
Write a new log entry.

**Request:**
```json
{
  "id": "log-1234567890-abc123",
  "message": "Application started",
  "severity": "INFO"
}
```

**Response:**
```json
{
  "success": true,
  "item": {
    "ID": "log-1234567890-abc123",
    "DateTime": "2025-11-04T12:34:56.789Z",
    "Severity": "INFO",
    "Message": "Application started"
  }
}
```

### GET /logs/all?limit=100
Retrieve recent log entries.

**Response:**
```json
{
  "items": [
    {
      "ID": "log-1234567890-abc123",
      "DateTime": "2025-11-04T12:34:56.789Z",
      "Severity": "INFO",
      "Message": "Application started"
    }
  ]
}
```

## Usage Examples

### Using the Web Interface
1. Open `frontend/index.html` in your browser
2. Enter a log message
3. Select severity level
4. Click "Post Log"
5. Click "Refresh Logs" to view entries

### Using PowerShell
```powershell
# Write a log
$url = "https://xxxxx.lambda-url.af-south-1.on.aws/logs"
Invoke-RestMethod -Method POST -Uri $url `
  -Headers @{ 'x-api-key'='assessment-api-key'; 'Content-Type'='application/json' } `
  -Body '{"id":"test1","message":"Test log","severity":"INFO"}'

# Read logs
$url = "https://xxxxx.lambda-url.af-south-1.on.aws/logs/all?limit=100"
Invoke-RestMethod -Method GET -Uri $url `
  -Headers @{ 'x-api-key'='assessment-api-key' }
```

## Technical Details

### DynamoDB Schema
- **Partition Key**: `ID` (String) - Unique log identifier
- **Sort Key**: `DateTime` (String) - ISO timestamp
- **Attributes**: `Severity`, `Message`

### Lambda Configuration
- **Runtime**: Node.js (latest)
- **Memory**: 128 MB
- **Timeout**: 30 seconds
- **Environment Variables**:
  - `DYNAMODB_TABLE`: Table name
  - `Shared_secret`: API key

### Security
- API key authentication via `x-api-key` header
- CORS enabled for all origins
- IAM roles with least privilege access

## Deployment Updates

After making code changes:

```powershell
# Package Lambda
cd lambda
Compress-Archive -Path index.js,node_modules -DestinationPath dist.zip -Force

# Deploy
cd ..\terraform
terraform apply
```

## Cleanup

To remove all AWS resources:

```powershell
cd terraform
terraform destroy
```

## Cost Considerations

This setup uses AWS Free Tier eligible services:
- Lambda: First 1M requests/month free
- DynamoDB: 25 GB storage + 25 WCU/RCU free
- Minimal costs expected for typical usage

## Troubleshooting

**Button doesn't work**: Check browser console (F12) for JavaScript errors

**401 Unauthorized**: Verify API key matches in Terraform and frontend

**CORS errors**: Ensure Terraform CORS configuration has `allow_methods = ["*"]`

**Empty response**: Check Lambda logs in CloudWatch

## Future Enhancements

- [ ] Add log filtering by severity
- [ ] Implement pagination for large result sets
- [ ] Add date range filtering
- [ ] User authentication
- [ ] Export logs to CSV
- [ ] Real-time log streaming

## Author

Technical Assessment Project - [Your Name]

## License

MIT