import { BlockPublicAccess, Bucket } from "aws-cdk-lib/aws-s3"
import { CfnOutput as output, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import { BooleanAttribute, DateTimeAttribute, NumberAttribute, StringAttribute, UserPool, VerificationEmailStyle } from "aws-cdk-lib/aws-cognito";
import { Effect, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";

export class PrimeDriveUserPool extends Construct {

    readonly userPool
    readonly clientId
    readonly integrationRole
    
    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.userPool = new UserPool(this, "PrimeDriveUserPool", {
            selfSignUpEnabled: true,
            userVerification: {
                emailSubject: 'Welcome to PrimeDrive! Verify Your Email',
                emailBody: `
                <p>Hey {username}!</p>
                <p>Thank you for signing up for our awesome app! To get started, please verify your email by entering the following code:</p>
                <h3>{####}</h3>
                <p>Best regards,<br> The PrimeDrive Team</p>
              `,
                emailStyle: VerificationEmailStyle.CODE,
                smsMessage: 'Thanks for signing up to our awesome app! Your verification code is {####}',
            },

            signInAliases: {
                username: true,
                email: true,
            },
            autoVerify: {
                email: true,
                phone: true
            },
            signInCaseSensitive: false,
            removalPolicy: RemovalPolicy.DESTROY,
            customAttributes: {
                'subscription': new StringAttribute(),
                'joinedOn': new DateTimeAttribute(),
            },
        })

        this.clientId = this.userPool.addClient('ReactWebAppClient', {
            authFlows: {
                userPassword: true,
                userSrp: true
            }
        })

        this.integrationRole = new Role(this, "PoolIntegrationRole", {
            assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
            description: "API Gateway can perform signup, signin and confirm for users",
        })

        this.integrationRole.addToPolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                "cognito-idp:SignUp",
                "cognito-idp:InitiateAuth",
                "cognito-idp:ConfirmForgotPassword",
                "cognito-idp:ConfirmSignUp",
                "cognito-idp:ResendConfirmationCode",
                "cognito-idp:ChangePassword",
                "cognito-idp:ForgotPassword"
            ],
            resources: [
                this.userPool.userPoolArn
            ],
            conditions: {
                "StringEquals": {
                    "s3:prefix": "users"
                }
            }
        }))

        // outputs
        new output(this, 'UserPool ARN', { value: this.userPool.userPoolArn });

    }
}