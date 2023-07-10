import {
  APIGatewayAuthorizerResult,
  PolicyDocument,
  APIGatewayRequestAuthorizerEventV2,
  APIGatewayRequestAuthorizerEventHeaders,
} from "aws-lambda";
import { decryptToken } from "../util/token";
import { fromItem } from "../data/user";

const headers = { "content-type": "application/json" };

export const main = async (event: APIGatewayRequestAuthorizerEventV2): Promise<APIGatewayAuthorizerResult> => {
  try {
    const headers = event.headers as APIGatewayRequestAuthorizerEventHeaders;

    const authorizationToken = headers["authorizationtoken"] as string;

    const authorizerArr = authorizationToken.split(" ");
    const token = authorizerArr[1];

    if (authorizerArr.length != 2 || authorizerArr[0] != "Bearer" || authorizerArr[1].length === 0) {
      return generatePolicy("undefined", "Deny");
    }

    const payload = await decryptToken(token);

    // authorization success
    if (typeof payload != "undefined") {
      const user = fromItem(JSON.parse(payload));
      return generatePolicy(user.email, "Allow");
    }

    return generatePolicy("undefined", "Deny");
  } catch (error) {
    throw error;
  }
};

const generatePolicy = async (principalId: string, effect: string): Promise<APIGatewayAuthorizerResult> => {
  const policyDocument = {} as PolicyDocument;
  if (effect) {
    policyDocument.Version = "2012-10-17";
    policyDocument.Statement = [];
    const statementOne: any = {};
    statementOne.Action = "execute-api:Invoke";
    statementOne.Effect = effect;
    statementOne.Resource = "*";
    policyDocument.Statement[0] = statementOne;
  }

  return {
    principalId: principalId,
    policyDocument: policyDocument,
  };
};
