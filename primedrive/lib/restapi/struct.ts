import { BlockPublicAccess, Bucket } from "aws-cdk-lib/aws-s3"
import { CfnOutput as output, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import { BooleanAttribute, DateTimeAttribute, IUserPool, NumberAttribute, StringAttribute, UserPool, UserPoolClient, VerificationEmailStyle } from "aws-cdk-lib/aws-cognito";
import { Effect, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { RestApi, Cors, CognitoUserPoolsAuthorizer, Resource, Integration, AwsIntegration, PassthroughBehavior, LogGroupLogDestination, AccessLogFormat, AuthorizationType, CorsOptions, MethodResponse, IntegrationResponse, AccessLogField } from "aws-cdk-lib/aws-apigateway";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { AuthResource } from "./auth/struct";
import { StorageResource } from "./storage/struct";
import { DynamoDBResource } from "./dynamodb/struct";
import { Function } from "aws-cdk-lib/aws-lambda";

export const integrationResponses: IntegrationResponse[] = [
    {
        statusCode: "200",
        responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": "'*'",
            "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
            "method.response.header.Access-Control-Allow-Methods": "'GET,OPTIONS,POST'"
        }
    },
    {
        statusCode: "400",
        responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": "'*'",
            "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
            "method.response.header.Access-Control-Allow-Methods": "'GET,OPTIONS,POST'"
        }
    },
    {
        statusCode: "500",
        responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": "'*'",
            "method.response.header.Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
            "method.response.header.Access-Control-Allow-Methods": "'GET,OPTIONS,POST'"
        }
    }
]
export const methodResponses: MethodResponse[] = [{
    statusCode: "200",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Origin": false,
        "method.response.header.Access-Control-Allow-Headers": false,
        "method.response.header.Access-Control-Allow-Methods": false
    },
},
{
    statusCode: "400",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Origin": false,
        "method.response.header.Access-Control-Allow-Headers": false,
        "method.response.header.Access-Control-Allow-Methods": false
    },
},
{
    statusCode: "500",
    responseParameters: {
        "method.response.header.Access-Control-Allow-Origin": false,
        "method.response.header.Access-Control-Allow-Headers": false,
        "method.response.header.Access-Control-Allow-Methods": false
    },
}
]
export const corsOptions: CorsOptions = {
    allowOrigins: ["http://localhost:3000"],
    allowMethods: Cors.ALL_METHODS
}

export const integrationOptions = {
    // passthroughBehavior: PassthroughBehavior.WHEN_NO_TEMPLATES,
}

export const objectRequestParamters = {
    "integration.request.path.sub": "context.authorizer.claims.sub",
    "integration.request.path.key": "method.request.path.key"
}

interface S3Options {
    bucketName: string,
    integrationRole: Role,
    presigner: Function
}
interface DynamodbOptions {
    tableName: string,
    integrationRole: Role
}
interface UserPoolOpions {
    pool: UserPool,
    client: UserPoolClient,
    integrationRole: Role
}
export class PrimeDriveRestAPI extends Construct {
    constructor(scope: Construct, id: string, { pool, client, integrationRole: poolRole }: UserPoolOpions, { bucketName, integrationRole: s3Role, presigner }: S3Options, { tableName, integrationRole: ddbRole }: DynamodbOptions) {
        super(scope, id);

        const api = new RestApi(this, "PrimeDriveRestAPI")


        const authorizer = new CognitoUserPoolsAuthorizer(this, 'PoolAuthorizer', {
            cognitoUserPools: [pool]
        })

        // auth resources
        const auth = new AuthResource(this, "AuthRestApiResource", api, client, poolRole);

        // // s3 resources
        const storage = new StorageResource(this, "StorageRestApiResource", api, bucketName, s3Role, authorizer, presigner)

        // dynamodb resources
        const dynamodb = new DynamoDBResource(this, "DynamoDBRestApiResource", api, tableName, ddbRole, authorizer)
  
        new output(this, 'UserPool Invoke Url', { value: api.url + `/dev` });

    }
}