import {DefinitionBody, FileDefinitionBody, Pass, Result, State, StateMachine} from "aws-cdk-lib/aws-stepfunctions";
import { CfnOutput as output, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Role, ServicePrincipal, PolicyStatement, Effect, ManagedPolicy } from "aws-cdk-lib/aws-iam";
import path = require("path");
import { Table, TableV2 } from "aws-cdk-lib/aws-dynamodb";
export class PrimeDriveStateMachine extends Construct {

    // readonly integrationRole
    readonly statemachine

    constructor(scope: Construct, id: string, table: TableV2) {
        super(scope, id);

        this.statemachine = new StateMachine(this, "PrimeDriveStateMachine2", {
            definitionBody: DefinitionBody.fromFile(path.join(__dirname, 'definition.asl.json')),
            definitionSubstitutions:{
                "PrimeDriveTable": table.tableName
            },
        })

        table.grantReadWriteData(this.statemachine.role)
        this.statemachine.role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName("AmazonRekognitionFullAccess"))
        this.statemachine.role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess"))
    }
}