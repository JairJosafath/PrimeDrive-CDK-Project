import { BlockPublicAccess, Bucket } from "aws-cdk-lib/aws-s3";
import {
  aws_iam,
  aws_lambda,
  aws_s3,
  aws_s3_notifications,
  CfnOutput as output,
  RemovalPolicy,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  Effect,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import path = require("path");
import { StateMachine } from "aws-cdk-lib/aws-stepfunctions";
export class PrimeDriveStorage extends Construct {
  readonly integrationRole;
  readonly bucket;
  readonly presignedUrlFunction;

  constructor(scope: Construct, id: string, stateMachine: StateMachine) {
    super(scope, id);

    // Storage
    const storage = new Bucket(this, "PrimeDriveStorage", {
      removalPolicy: RemovalPolicy.DESTROY,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      autoDeleteObjects: true,
    });
    this.bucket = storage;

    this.integrationRole = new Role(this, "S3IntegrationRole", {
      assumedBy: new ServicePrincipal("apigateway.amazonaws.com"),
      description: "API Gateway can interact with S3 for the user",
    });

    this.integrationRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["s3:GetObjectAttributes", "s3:GetObject", "s3:DeleteObject"],
        resources: [storage.bucketArn],
        conditions: {
          StringEquals: {
            "s3:prefix": "users",
          },
        },
      })
    );

    //

    // event triggers

    const s3TriggerFunction = new aws_lambda.Function(this, "LambdaFunction", {
      runtime: aws_lambda.Runtime.NODEJS_20_X,
      handler: "index.handler",
      code: aws_lambda.Code.fromAsset(
        path.join(__dirname, "../functions/s3Trigger")
      ),
      environment: {
        STEPFUNCTION_ARN: stateMachine.stateMachineArn,
      },
      role: new aws_iam.Role(this, "s3TriggerFunctionRole", {
        assumedBy: new aws_iam.ServicePrincipal("lambda.amazonaws.com"),
        description: "Lambda function to trigger step function",
        managedPolicies: [
          aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaBasicExecutionRole"
          ),
          aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
            "AmazonS3ReadOnlyAccess"
          ),
          aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
            "AWSStepFunctionsFullAccess"
          ),
        ],
      }),
    });

    this.bucket.addEventNotification(
      aws_s3.EventType.OBJECT_CREATED,
      new aws_s3_notifications.LambdaDestination(s3TriggerFunction),
      { prefix: "users/" }
    );

    this.presignedUrlFunction = new aws_lambda.Function(
      this,
      "PresignedUrlFunction",
      {
        runtime: aws_lambda.Runtime.NODEJS_20_X,
        handler: "index.handler",
        code: aws_lambda.Code.fromAsset(
          path.join(__dirname, "../functions/preSignedUrlGenerator")
        ),
        environment: {
          BUCKET_NAME: storage.bucketName,
        },
        role: new aws_iam.Role(this, "PresignedUrlFunctionRole", {
          assumedBy: new aws_iam.ServicePrincipal("lambda.amazonaws.com"),
          description: "Lambda function to generate presigned url",
          managedPolicies: [
            aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
              "service-role/AWSLambdaBasicExecutionRole"
            ),
            aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
              "AmazonS3FullAccess"
            ),
            aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
              "AmazonCognitoPowerUser"
            ),
          ],
        }),
      }
    );

    // outputs
    new output(this, "Storage s3 ARN", { value: storage.bucketArn });
  }
}
