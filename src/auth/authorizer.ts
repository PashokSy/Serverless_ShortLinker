import { APIGatewayAuthorizerResult, PolicyDocument, APIGatewayRequestAuthorizerEvent } from "aws-lambda";
import { decryptToken } from "../util/token";
import { User, getUser } from "../data/user";

export const main = async (event: APIGatewayRequestAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  try {
    const headers = event.headers;
    const resource = event.methodArn;

    if (!headers) return generatePolicy("undefined", "Deny", resource);

    const { authorizationToken } = headers;

    if (!authorizationToken) return generatePolicy("undefined", "Deny", resource);

    const authorizerArr = authorizationToken.split(" ");

    if (authorizerArr.length != 2 || authorizerArr[0] != "Bearer" || authorizerArr[1].length === 0) {
      return generatePolicy("undefined", "Deny", resource);
    }

    const payload = await decryptToken(authorizerArr[1]);
    const user = User.fromItem(JSON.parse(payload));

    if (!(await getUser(user))) {
      return generatePolicy(user.email, "Deny", resource);
    }

    // authorization success
    return generatePolicy(user.email, "Allow", resource);
  } catch (error) {
    throw Error("Unauthorized");
  }
};

const generatePolicy = async (
  principalId: string,
  effect: string,
  resource: string,
): Promise<APIGatewayAuthorizerResult> => {
  const policyDocument = {} as PolicyDocument;
  if (effect) {
    policyDocument.Version = "2012-10-17";
    policyDocument.Statement = [];
    const statementOne: any = {};
    statementOne.Action = "execute-api:Invoke";
    statementOne.Effect = effect;
    statementOne.Resource = resource;
    policyDocument.Statement[0] = statementOne;
  }

  return {
    principalId: principalId,
    policyDocument: policyDocument,
  };
};
