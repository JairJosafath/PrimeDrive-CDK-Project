import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { PrimeDriveTable } from './dynamodb/struct';
import { PrimeDriveStorage } from './storage/struct';
import { PrimeDriveUserPool } from './userpool/struct';
import { PrimeDriveRestAPI } from './restapi/struct';
import { PrimeDriveStateMachine } from './statemachine/struct';
import { stat } from 'fs';

export class PrimeDriveStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // dynamodb table
    const table = new PrimeDriveTable(this, "PrimeDriveTable")



    // incognito userpool
    const userPool = new PrimeDriveUserPool(this, "PrimeDriveUserPool")

    // statemachine
    const statemachine = new PrimeDriveStateMachine(this, "PrimeDriveStateMachine", table.table)

    // s3 storage with userfiles
    const s3 = new PrimeDriveStorage(this, "PrimeDriveStorage", statemachine.statemachine)
    s3.bucket.grantReadWrite(statemachine.thumberFunction)

    // apigateway restapi
    const api = new PrimeDriveRestAPI(this, "PrimeDriveRestAPI",
      { pool: userPool.userPool, client: userPool.clientId, integrationRole: userPool.integrationRole},
      { bucketName: s3.bucket.bucketName, integrationRole: s3.integrationRole, presigner: s3.presignedUrlFunction  },
      { integrationRole: table.integrationRole, tableName: table.table.tableName },
      { thumbBucket: statemachine.thumbBucket}
    )

  }
}
