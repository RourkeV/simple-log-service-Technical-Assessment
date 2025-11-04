const {DynamoDBClient} = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require ("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "af-south-1" });
const ddb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.DYNAMODB_TABLE;
const API_KEY = process.env.Shared_secret

exports.handler = async (event) => {
    try{
        console.log("Received event:", JSON.stringify(event));
        
        const providedKey = event.headers?.["x-api-key"]
        if (providedKey !== API_KEY){
            return{
                statusCode:401,
                body:JSON.stringify({error: "Unauthorized"})
            };
        }

        const body = JSON.parse(event.body);
        const { id, message, severity} = body;

        if(!id || !message)  {
            return{
                statusCode: 400,
                body: JSON.stringify({error: "id and message required"})
            }
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
    } catch (error) {
        console.error("Error", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message})
        };
    }
}
