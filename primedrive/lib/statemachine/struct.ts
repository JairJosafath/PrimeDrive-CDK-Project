import {DefinitionBody, FileDefinitionBody, Pass, Result, State, StateMachine} from "aws-cdk-lib/aws-stepfunctions";
import { aws_lambda, aws_s3, Duration, CfnOutput as output, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Role, ServicePrincipal, PolicyStatement, Effect, ManagedPolicy } from "aws-cdk-lib/aws-iam";
import path = require("path");
import { Table, TableV2 } from "aws-cdk-lib/aws-dynamodb";
import { Function } from "aws-cdk-lib/aws-lambda";
export class PrimeDriveStateMachine extends Construct {

    // readonly integrationRole
    readonly statemachine
    readonly thumberFunction
    readonly thumbBucket
    constructor(scope: Construct, id: string, table: TableV2) {
        super(scope, id);

        this.thumbBucket = new aws_s3.Bucket(this, "ThumberBucket", {
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
          });
        

        this. thumberFunction = new Function(
            this,
            "ThumberFunction",
            {
              runtime: aws_lambda.Runtime.NODEJS_20_X,
              handler: "index.handler",
              code: aws_lambda.Code.fromAsset(
                path.join(__dirname, "../functions/thumber")
              ),
              environment: {
                THUMBER_BUCKET: this.thumbBucket.bucketName,
              },
              timeout: Duration.seconds(30),
              memorySize: 1536,
            }
          );
      
          this.thumbBucket.grantReadWrite(this.thumberFunction)

        this.statemachine = new StateMachine(this, "PrimeDriveStateMachine2", {
            definitionBody: DefinitionBody.fromFile(path.join(__dirname, 'definition.asl.json')),
            definitionSubstitutions:{
                "PrimeDriveTable": table.tableName,
                "ThumberFunction": this.thumberFunction.functionArn
            },
            
        })

        table.grantReadWriteData(this.statemachine.role)
        this.thumberFunction.grantInvoke(this.statemachine.role)
        this.statemachine.role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName("AmazonRekognitionFullAccess"))
        this.statemachine.role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess"))
    }
}