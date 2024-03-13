import { AuthorizationType, AwsIntegration, IAuthorizer, RestApi } from "aws-cdk-lib/aws-apigateway";
import { Role } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { integrationOptions, integrationResponses, methodResponses, objectRequestParamters } from "../struct";

export class DynamoDBResource extends Construct {
    constructor(
        scope: Construct,
        id: string,
        api: RestApi,
        tableName: string,
        credentialsRole: Role,
        authorizer: IAuthorizer
    ) {
        super(scope, id);
        // resources

        const filesRes = api.root.addResource("files")
        filesRes.addMethod("GET", new AwsIntegration({
            service: "dynamodb", integrationHttpMethod: "POST", action: "Query", options: {
                credentialsRole,
                requestTemplates: {
                    "application/json":
                        `
                    {
                        "TableName": "${tableName}",
                        "KeyConditionExpression": "#pk = :pkval AND begins_with(#sk, :skval)",
                        "ExpressionAttributeValues": {
                            ":pkval": {"S": "user#$util.escapeJavaScript($$context.authorizer.claims.sub).replaceAll("\\'","")"},
                            ":skval": {"S": "#file#"}
                        },
                        "ExpressionAttributeNames": {
                            "#pk": "pk",
                            "#sk": "sk"
                        }
                    }
                    `
                },
                
            requestParameters:{
                "integration.request.querystring.index": "method.request.querystring.index"
            },
                integrationResponses
            }
        }),
        { authorizationType: AuthorizationType.COGNITO, authorizer, requestParameters:{
            "method.request.querystring.index": false,
        },
        methodResponses }
        )

    const queryRes = api.root.addResource("query")
    queryRes.addMethod("GET", new AwsIntegration({
        service: "dynamodb", integrationHttpMethod: "POST", action: "Query", options: {
            credentialsRole,
            requestTemplates: {
                "application/json":
                    `
                {
                    "TableName": "${tableName}",
                    "KeyConditionExpression": "#pk = :pkval AND begins_with(#sk, :skval)",
                    "ExpressionAttributeValues": {
                        ":pkval": {"S": "user#$util.escapeJavaScript($$context.authorizer.claims.sub).replaceAll("\\'","")"},
                        ":skval": {"S": "#index#$util.escapeJavaScript($input.params('index')).replaceAll("\\'","")"}
                    },
                    "ExpressionAttributeNames": {
                        "#pk": "pk",
                        "#sk": "sk"
                    }
                }
                `
            },
            integrationResponses,
            requestParameters:{
                "integration.request.querystring.index": "method.request.querystring.index"
            }

        }
    }),
        { authorizationType: AuthorizationType.COGNITO, authorizer, requestParameters:{
            "method.request.querystring.index": false,
        },
        methodResponses }
    )

    }
}

/**
 *       const favoritesRes = api.root.addResource("files")
        // favoritesRes.addMethod("GET", new AwsIntegration({
        //     service: "dynamodb", integrationHttpMethod: "POST", action: "Query", options: {
        //         credentialsRole: ddbRole,
        //         requestTemplates: {
        //             "application/json":
        //                 `
        //             {
        //                 "TableName": "${tableName}",
        //                 "ProjectionExpression": "key",
        //                 "KeyConditionExpression": "#pk = :pkval AND #sk = :skval",
        //                 "ExpressionAttributeValues": {
        //                     ":pkval": {"S": "#user#$util.escapeJavaScript($$context.authorizer.claims.sub).replaceAll("\\'","")"},
        //                     ":skval": {"S": "#favorite"}
        //                 },
        //                 "ExpressionAttributeNames": {
        //                     "#pk": "pk",
        //                     "#sk": "sk"
        //                 }
        //             }
        //             `
        //         },
        //         ...integrationOptions
        //     }
        // }),
        //     { authorizationType: AuthorizationType.COGNITO, authorizer }
        // )
        // favoritesRes.addMethod("POST", new AwsIntegration({
        //     service: "dynamodb", integrationHttpMethod: "POST", action: "PutItem", options: {
        //         credentialsRole: ddbRole,
        //         requestTemplates: {
        //             "application/json":
        //                 `
        //             {
        //                 "TableName": "${tableName}",
        //                 "Item": {
        //                     "pk": {
        //                         "S": "#user#$util.escapeJavaScript($$context.authorizer.claims.sub).replaceAll("\\'","")"
        //                     },
        //                     "sk":{
        //                         "S": "#favorite"
        //                     },
        //                     "prefix": {
        //                         "S": $input.json($.prefix)
        //                     },
        //                     "created": {
        //                         "S": "$context.requestTimeEpoch"
        //                     }
        //                 }
        //             }
        //             `
        //         },
        //         ...integrationOptions
        //     }
        // }),
        //     { authorizationType: AuthorizationType.COGNITO, authorizer }
        // )
        // favoritesRes.addMethod("DELETE", new AwsIntegration({
        //     service: "dynamodb", integrationHttpMethod: "POST", action: "DeleteItem", options: {
        //         credentialsRole: ddbRole,
        //         requestTemplates: {
        //             "application/json":
        //                 `
        //             {
        //                 "TableName": "${tableName}",
        //                 "Key": {
        //                     "pk": {
        //                         "S": "#user#$util.escapeJavaScript($$context.authorizer.claims.sub).replaceAll("\\'","")"
        //                     },
        //                     "sk":{
        //                         "S": "#favorite"
        //                     }
        //                 },
        //             }
        //             `
        //         },
        //         ...integrationOptions
        //     }
        // }),
        //     { authorizationType: AuthorizationType.COGNITO, authorizer }
        // )

        // outputs
 */