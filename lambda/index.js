const {DynamoDBClient} = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "af-south-1" });
const ddb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE;
const API_KEY = process.env.Shared_secret;

exports.handler = async (event) => {
    try {
        console.log("Received event:", JSON.stringify(event));
        
        const providedKey = event.headers?.["x-api-key"] || "";
        if (providedKey !== API_KEY) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: "Unauthorized" })
            };
        }
        
        const method = event.requestContext?.http?.method || "GET";
        const path = event.rawPath || "/";
        
        // POST /logs - Write log
        if (method === "POST" && path.endsWith("/logs")) {
            const body = JSON.parse(event.body);
            const { id, message, severity } = body;
            
            if (!id || !message) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: "id and message are required" })
                };
            }
            
            const item = {
                ID: id,
                DateTime: new Date().toISOString(),
                Severity: severity || "INFO",
                Message: message
            };
            
            await ddb.send(new PutCommand({
                TableName: TABLE_NAME,
                Item: item
            }));
            
            return {
                statusCode: 200,
                body: JSON.stringify({ 
                    success: true, 
                    item: item 
                })
            };
        }
        
        // GET /logs/all - Get all recent logs
        if (method === "GET" && path.endsWith("/logs/all")) {
            const limit = Math.min(parseInt(event.queryStringParameters?.limit || "100"), 100);
            
            const result = await ddb.send(new ScanCommand({
                TableName: TABLE_NAME,
                Limit: limit
            }));
            
            // Sort by DateTime descending (newest first)
            const sortedItems = (result.Items || []).sort((a, b) => 
                new Date(b.DateTime) - new Date(a.DateTime)
            );
            
            return {
                statusCode: 200,
                body: JSON.stringify({ items: sortedItems })
            };
        }
        
        return {
            statusCode: 404,
            body: JSON.stringify({ error: "Endpoint not found" })
        };
        
    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
