import { TableV2, AttributeType } from "aws-cdk-lib/aws-dynamodb"
import { CfnOutput as output, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Role, ServicePrincipal, PolicyStatement, Effect } from "aws-cdk-lib/aws-iam";
export class PrimeDriveTable extends Construct {

    readonly integrationRole
    readonly table

    constructor(scope: Construct, id: string) {
        super(scope, id);

        const dynamodb = new TableV2(this, "PrimeDriveTable", {
            partitionKey: {
                name: "pk",
                type: AttributeType.STRING
            },
            sortKey: {
                name: "sk",
                type: AttributeType.STRING
            },
            tags: [
                { key: "stage", value: "dev" },
                { key: "with_pipeline", value: "no" },
                { key: "project", value: "prime-drive" }
            ],
            removalPolicy: RemovalPolicy.DESTROY
        })
        this.table = dynamodb

        this.integrationRole = new Role(this, "dynamodbIntegrationRole", {
            assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
            description: "API Gateway can interact with Dynamodb for the user"
        })
        this.integrationRole.addToPolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                "dynamodb:GetItem",
                "dynamodb:Query"
            ],
            resources: [
                dynamodb.tableArn
            ],
            conditions: {
                // "ForAllValues:StringEquals": {
                //     "dynamodb:LeadingKeys": [
                //         "#user"
                //     ],
                //     "dynamodb:Attributes": [
                //         // attributes where the user can change the value
                //     ]
                // }
            }
        }))

        // outputs
        new output(this, 'Table ARN', { value: dynamodb.tableArn });

    }
}