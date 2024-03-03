import { SFNClient, StartExecutionCommand } from "@aws-sdk/client-sfn"; 

const client = new SFNClient();

export async function handler(event) {
    const bucket = event.Records[0].s3.bucket.name;
    const key = event.Records[0].s3.object.key; 
    const sub = key.split("/")[1];
    
    const input = {
      stateMachineArn: process.env.STEPFUNCTION_ARN,
      input: JSON.stringify({bucket, key, sub})
    }

    const command = new StartExecutionCommand(input);
    const response = await client.send(command);
}
