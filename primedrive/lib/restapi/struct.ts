import { BlockPublicAccess, Bucket } from "aws-cdk-lib/aws-s3";
import { CfnOutput as output, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  BooleanAttribute,
  DateTimeAttribute,
  IUserPool,
  NumberAttribute,
  StringAttribute,
  UserPool,
  UserPoolClient,
  VerificationEmailStyle,
} from "aws-cdk-lib/aws-cognito";
import {
  Effect,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import {
  RestApi,
  Cors,
  CognitoUserPoolsAuthorizer,
  Resource,
  Integration,
  AwsIntegration,
  PassthroughBehavior,
  LogGroupLogDestination,
  AccessLogFormat,
  AuthorizationType,
  CorsOptions,
  MethodResponse,
  IntegrationResponse,
  AccessLogField,
} from "aws-cdk-lib/aws-apigateway";
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
      "method.response.header.Access-Control-Allow-Headers":
        "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
      "method.response.header.Access-Control-Allow-Methods":
        "'GET,OPTIONS,POST'",
        "method.response.header.Content-Length": "integration.response.header.Content-Length",
        "method.response.header.Content-Type": "integration.response.header.Content-Type",
        "method.response.header.Date": "integration.response.header.Date",
        "method.response.header.ETag": "integration.response.header.ETag",
        "method.response.header.Last-Modified": "integration.response.header.Last-Modified",
        "method.response.header.Server": "integration.response.header.Server",
        "method.response.header.x-amz-id-2": "integration.response.header.x-amz-id-2",
        "method.response.header.x-amz-request-id": "integration.response.header.x-amz-request-id",
        "method.response.header.Content-Disposition": "integration.response.header.Content-Disposition",
    },
    
  },
  {
    statusCode: "400",
    responseParameters: {
      "method.response.header.Access-Control-Allow-Origin": "'*'",
      "method.response.header.Access-Control-Allow-Headers":
        "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
      "method.response.header.Access-Control-Allow-Methods":
        "'GET,OPTIONS,POST'",
    },
  },
  {
    statusCode: "500",
    responseParameters: {
      "method.response.header.Access-Control-Allow-Origin": "'*'",
      "method.response.header.Access-Control-Allow-Headers":
        "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
      "method.response.header.Access-Control-Allow-Methods":
        "'GET,OPTIONS,POST'",
    },
  },
];
export const methodResponses: MethodResponse[] = [
  {
    statusCode: "200",
    responseParameters: {
      "method.response.header.Access-Control-Allow-Origin": false,
      "method.response.header.Access-Control-Allow-Headers": false,
      "method.response.header.Access-Control-Allow-Methods": false,
      "method.response.header.Content-Length": false,
      "method.response.header.Content-Type": false,
      "method.response.header.Date": false,
      "method.response.header.ETag": false,
      "method.response.header.Last-Modified": false,
      "method.response.header.Server": false,
      "method.response.header.x-amz-id-2": false,
      "method.response.header.x-amz-request-id": false,
      "method.response.header.Content-Disposition": false,
    },
  },
  {
    statusCode: "400",
    responseParameters: {
      "method.response.header.Access-Control-Allow-Origin": false,
      "method.response.header.Access-Control-Allow-Headers": false,
      "method.response.header.Access-Control-Allow-Methods": false,
    },
  },
  {
    statusCode: "500",
    responseParameters: {
      "method.response.header.Access-Control-Allow-Origin": false,
      "method.response.header.Access-Control-Allow-Headers": false,
      "method.response.header.Access-Control-Allow-Methods": false,
    },
  },
];
export const corsOptions: CorsOptions = {
  allowOrigins: ["http://localhost:3000"],
  allowMethods: Cors.ALL_METHODS,
};

export const integrationOptions = {
  // passthroughBehavior: PassthroughBehavior.WHEN_NO_TEMPLATES,
};

export const objectRequestParamters = {
  "integration.request.path.sub": "context.authorizer.claims.sub",
  "integration.request.path.key": "method.request.path.key",
};

interface S3Options {
  bucketName: string;
  integrationRole: Role;
  presigner: Function;
}
interface DynamodbOptions {
  tableName: string;
  integrationRole: Role;
}
interface UserPoolOpions {
  pool: UserPool;
  client: UserPoolClient;
  integrationRole: Role;
}
export class PrimeDriveRestAPI extends Construct {
  constructor(
    scope: Construct,
    id: string,
    { pool, client, integrationRole: poolRole }: UserPoolOpions,
    { bucketName, integrationRole: s3Role, presigner }: S3Options,
    { tableName, integrationRole: ddbRole }: DynamodbOptions,
    { thumbBucket }: { thumbBucket: Bucket }
  ) {
    super(scope, id);

    const api = new RestApi(this, "PrimeDriveRestAPI",{
        defaultCorsPreflightOptions:{
            allowOrigins: Cors.ALL_ORIGINS,
            allowMethods: Cors.ALL_METHODS
        },
        binaryMediaTypes: ["image/*", "application/octet-stream"],
    });

    const authorizer = new CognitoUserPoolsAuthorizer(this, "PoolAuthorizer", {
      cognitoUserPools: [pool],
    });

    // auth resources
    const auth = new AuthResource(
      this,
      "AuthRestApiResource",
      api,
      client,
      poolRole
    );

    // // s3 resources
    const storage = new StorageResource(
      this,
      "StorageRestApiResource",
      api,
      bucketName,
      s3Role,
      authorizer,
      presigner,
      thumbBucket
    );

    // dynamodb resources
    const dynamodb = new DynamoDBResource(
      this,
      "DynamoDBRestApiResource",
      api,
      tableName,
      ddbRole,
      authorizer
    );

    new output(this, "UserPool Invoke Url", { value: api.url + `/dev` });
  }
}
