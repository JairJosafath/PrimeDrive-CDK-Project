import { AwsIntegration, CorsOptions, IntegrationResponse, MethodResponse, RestApi } from "aws-cdk-lib/aws-apigateway";
import { UserPoolClient } from "aws-cdk-lib/aws-cognito";
import { Role } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { corsOptions, integrationResponses, methodResponses } from "../struct";

/**
 * AuthResource
 * this is the restapi resource for all auth related endpoints
 * 
 * post /auth/login
 * post /auth/signup
 * post /auth/confirm
 * 
 */

export class AuthResource extends Construct {
    constructor(
        scope: Construct,
        id: string,
        api: RestApi,
        client: UserPoolClient,
        credentialsRole: Role
    ) {
        super(scope, id);

        // resources
        const authRes = api.root.addResource("auth")
        const loginRes = authRes.addResource("login")
        const signupRes = authRes.addResource("signup")
        const confirmRes = authRes.addResource("confirm")

        // // add cors for dev only
        // loginRes.addCorsPreflight(corsOptions)
        // signupRes.addCorsPreflight(corsOptions)
        // confirmRes.addCorsPreflight(corsOptions)

        // methods
        loginRes.addMethod(
            "POST",
            new AwsIntegration({
                service: "cognito-idp",
                integrationHttpMethod: "POST",
                action: "InitiateAuth",
                options: {
                    credentialsRole,
                    integrationResponses,
                    requestTemplates: {
                        "application/json":
                            `
                    {
                        "AuthFlow": "USER_PASSWORD_AUTH",
                        "ClientId": "${client.userPoolClientId}",
                        "AuthParameters": {
                            "USERNAME": $input.json('$.username'),
                            "PASSWORD": $input.json('$.password')
                        }
                    }
                    `
                    },
                }
            }),
            {
                methodResponses
            }
        )

        signupRes.addMethod(
            "POST",
            new AwsIntegration({
                service: "cognito-idp",
                integrationHttpMethod: "POST",
                action: "SignUp",

                options: {
                    credentialsRole,
                    integrationResponses,
                    requestTemplates: {
                        "application/json":
                            `
                        {
                            "ClientId": "${client.userPoolClientId}",
                            "Username": $input.json('$.username'),
                            "Password": $input.json('$.password'),
                            "UserAttributes": [
                                {
                                    "Name": "custom:subscription",
                                    "Value": "free"
                                },
                                {
                                    "Name": "email",
                                    "Value": $input.json('$.email')
                                }
                            ]
                        }
                        `
                    },
                }
            }), {
            methodResponses
        })

        confirmRes.addMethod(
            "POST",
            new AwsIntegration({
                service: "cognito-idp",
                integrationHttpMethod: "POST",
                action: "ConfirmSignUp",
                options: {
                    credentialsRole,
                    integrationResponses,
                    requestTemplates: {
                        "application/json":
                            `
                        {
                            "Username": $input.json('$.username'),
                            "ClientId": "${client.userPoolClientId}",
                            "ConfirmationCode": $input.json('$.code')
                        }
                        `
                    },
                }
            }), {
            methodResponses
        })
    }
}