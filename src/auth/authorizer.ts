import { APIGatewayAuthorizerResult, PolicyDocument, APIGatewayRequestAuthorizerEventV2 } from "aws-lambda";
import { decryptToken } from "../util/token";
import { User, getUser } from "../data/user";

export const main = async (event: APIGatewayRequestAuthorizerEventV2): Promise<APIGatewayAuthorizerResult> => {
  try {
    const headers = event.headers;

    if (!headers) return generatePolicy("undefined", "Deny");

    const { authorizationToken } = headers;

    if (!authorizationToken) return generatePolicy("undefined", "Deny");

    const authorizerArr = authorizationToken.split(" ");
    const token = authorizerArr[1];

    if (authorizerArr.length != 2 || authorizerArr[0] != "Bearer" || authorizerArr[1].length === 0) {
      return generatePolicy("undefined", "Deny");
    }

    const payload = await decryptToken(token);
    const user = User.fromItem(JSON.parse(payload));

    if (!(await getUser(user))) {
      return generatePolicy("undefined", "Deny");
    }

    // authorization success
    return generatePolicy(user.email, "Allow");
  } catch (error) {
    return generatePolicy("undefined", "Deny");
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
