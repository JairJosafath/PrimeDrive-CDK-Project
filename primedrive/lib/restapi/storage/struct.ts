import {
  AuthorizationType,
  AwsIntegration,
  IAuthorizer,
  LambdaIntegration,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { Role } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import {
  integrationOptions,
  integrationResponses,
  methodResponses,
  objectRequestParamters,
} from "../struct";
import { Function } from "aws-cdk-lib/aws-lambda";
import { Bucket } from "aws-cdk-lib/aws-s3";

export class StorageResource extends Construct {
  constructor(
    scope: Construct,
    id: string,
    api: RestApi,
    bucketName: string,
    credentialsRole: Role,
    authorizer: IAuthorizer,
    presigner: Function,
    thumbBucket: Bucket
  ) {
    super(scope, id);
    // resources

    // this resource actually interacts with the files(objects since s3 is object storage)
    const objectRes = api.root.addResource("object").addResource("{key+}");

    // this resource exposes the presigned url generator for the client
    const presignedRes = api.root.addResource("presigned");

    // methods

    thumbBucket.grantReadWrite(credentialsRole);
    objectRes.addMethod(
      "GET",
      new AwsIntegration({
        service: "s3",
        integrationHttpMethod: "GET",
        path: thumbBucket.bucketName + `/users/{sub}/{key}`,
        options: {
          credentialsRole,
          requestParameters: {
            "integration.request.path.sub": "context.authorizer.claims.sub",
            "integration.request.path.key": "method.request.path.key",
          },
          integrationResponses
        },
      }),
      {
        requestParameters: {
          "method.request.path.key": false,
        },
        authorizationType: AuthorizationType.COGNITO,
        authorizer,
        methodResponses,
      }
    );

    objectRes.addMethod(
      "DELETE",
      new AwsIntegration({
        service: "s3",
        integrationHttpMethod: "DELETE",
        path: bucketName + `/users/{sub}/{key}`,
        options: {
          credentialsRole,
          requestParameters: {
            "integration.request.path.sub": "context.authorizer.claims.sub",
            "integration.request.path.key": "method.request.path.key",
          },
            integrationResponses
        },
      }),
      {
        requestParameters: {
          "method.request.path.key": false,
        },
        authorizationType: AuthorizationType.COGNITO,
        authorizer,
        methodResponses,
      }
    );

    presignedRes.addMethod(
      "GET",
      new LambdaIntegration(presigner, {
        requestParameters: {
          "integration.request.querystring.sub":
            "context.authorizer.claims.sub",
          "integration.request.querystring.key":
            "method.request.querystring.key",
          "integration.request.querystring.action":
            "method.request.querystring.action",
        },
        proxy: false,
        requestTemplates: {
          "application/json": `{
                    "sub": "$context.authorizer.claims.sub",
                    "key": "$input.params('key')",
                    "action": "$input.params('action')"
                }`,
        },
        integrationResponses,
      }),
      {
        authorizationType: AuthorizationType.COGNITO,
        authorizer,
        requestParameters: {
          "method.request.querystring.key": false,
          "method.request.querystring.action": false,
        },
        methodResponses,
      }
    );

    // objectRes.addMethod("POST", new AwsIntegration({
    //     service: "s3",
    //     integrationHttpMethod: "POST",
    //     path: bucketName + `?delete`,
    //     options: {
    //         credentialsRole,
    //         requestParameters: {
    //             "integration.request.path.sub": "context.authorizer.claims.sub"
    //         }
    //     }
    // }),
    //     {
    //         requestParameters: {
    //         },
    //         authorizationType: AuthorizationType.COGNITO,
    //         authorizer
    //     }
    // )
  }
}
