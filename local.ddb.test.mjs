import { DynamoDBClient, QueryCommand} from "@aws-sdk/client-dynamodb"


const client = new DynamoDBClient({endpoint: 'http://localhost:8000'});

const input = {
    "ExpressionAttributeValues": {
      ":pk": {
        "S": "user#123"
      },
        ":sk": {
            "S": "#index#house2"
        }
    },
    "KeyConditionExpression": "pk = :pk AND begins_with(sk, :sk)",
    // "ProjectionExpression": "SongTitle",
    "TableName": "testTable"
  };

  async function query() {

    try{
        const command = new QueryCommand(input);
        const response = await client.send(command);
        // console.log(response.Items);
        console.log(response.Items[0].keys)
    }
    catch(err){
        console.error(err);
    }
  }

  query();
