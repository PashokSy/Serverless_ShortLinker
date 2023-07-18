import { APIGatewayAuthorizerResult, PolicyDocument, APIGatewayRequestAuthorizerEventV2 } from "aws-lambda";
import { decryptToken } from "../util/token";
import { User, getUser } from "../data/user";
import { listVerifiedEmailAddresses } from "../util/sesClient";

export const main = async (event: APIGatewayRequestAuthorizerEventV2): Promise<APIGatewayAuthorizerResult> => {
  try {
    const headers = event.headers;

    if (!headers) return generatePolicy("undefined", "Deny");

    const authorizationToken = headers["authorizationtoken"] as string;

    const authorizerArr = authorizationToken.split(" ");
    const token = authorizerArr[1];

    if (authorizerArr.length != 2 || authorizerArr[0] != "Bearer" || authorizerArr[1].length === 0) {
      return generatePolicy("undefined", "Deny");
    }

    const payload = await decryptToken(token);
    const user = User.fromItem(JSON.parse(payload));

    const verifyEmailArr = await listVerifiedEmailAddresses();

    if (!(await getUser(user))) {
      return generatePolicy("undefined", "Deny");
    }

    if (!verifyEmailArr) {
      return generatePolicy("undefined", "Deny");
    }

    // authorization success
    if (verifyEmailArr.includes(user.email)) {
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
