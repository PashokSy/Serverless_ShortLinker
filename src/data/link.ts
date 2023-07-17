import { GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { randomBytes } from "crypto";

import { getDynamoClient } from "../util/dynamoClient";
import { CustomError } from "../error/customError";

export class Link {
  PK: string;
  SK: string;
  user: string;
  longAlias: string;
  shortAlias: string;
  lifetime: string;
  visitCount: number;
  deactivated: boolean;
  createdAt: number;
  deactivateAt: number | null;

  constructor(
    user: string,
    longAlias: string,
    lifetime: string,
    shortAlias: string,
    PK?: string,
    SK?: string,
    visitCount?: number,
    deactivated?: boolean,
    createdAt?: number,
    deactivateAt?: number | null,
  ) {
    this.PK = PK || shortAlias;
    this.SK = SK || shortAlias;
    this.user = user;
    this.longAlias = longAlias;
    this.shortAlias = shortAlias;
    this.lifetime = lifetime;
    this.visitCount = visitCount || 0;
    this.deactivated = deactivated || false;
    this.createdAt = createdAt || Date.now();
    this.deactivateAt = deactivateAt || calculateDeactivateDate(this.lifetime, this.createdAt);
  }

  fromItem(item: Record<string, any>): Link {
    return new Link(
      item.user,
      item.longAlias,
      item.lifetime,
      item.shortAlias,
      item.PK,
      item.SK,
      item.visitCount,
      item.deactivated,
      item.createdAt,
      item.deactivateAt,
    );
  }
}

const calculateDeactivateDate = (lifetime: string, createdAt: number) => {
  lifetime = lifetime.toLowerCase().trim();

  switch (lifetime) {
    case "singleuse":
      return null;
    case "oneday":
      return createdAt + 8.64e7;
    case "threedays":
      return createdAt + 2.592e8;
    case "sevendays":
      return createdAt + 6.048e8;
    default:
      throw new CustomError(400, "Provided lifetime is invalid");
  }
};

export const saveLink = async (link: Link) => {
  try {
    const client = getDynamoClient();

    const foundLink = await client.send(
      new GetCommand({
        TableName: process.env.TABLE_NAME,
        Key: {
          PK: link.PK,
          SK: link.SK,
        },
      }),
    );

    if (!foundLink.Item) {
      await client.send(
        new PutCommand({
          TableName: process.env.TABLE_NAME,
          Item: link,
        }),
      );
    } else {
      throw new CustomError(409, "Link already exists");
    }
  } catch (error) {
    throw error;
  }
};

export const generateShortAlias = async (): Promise<string> => {
  try {
    const shortAlias = randomBytes(3).toString("hex");
    const listLinks = await listLinksByShortAlias(shortAlias);
    if (!listLinks || listLinks?.length === 0) {
      return shortAlias;
    } else {
      return generateShortAlias();
    }
  } catch (error) {
    throw error;
  }
};

export const listLinksByShortAlias = async (shortAlias: string) => {
  try {
    const client = getDynamoClient();
    const input = {
      TableName: process.env.TABLE_NAME,
      FilterExpression: "PK = :shortAlias",
      ExpressionAttributeValues: {
        ":shortAlias": shortAlias,
      },
    };
    const output = await client.send(new ScanCommand(input));

    return output.Items;
  } catch (error) {
    throw error;
  }
};

export const getLink = async (shortAlias: string) => {
  try {
    const client = getDynamoClient();

    const link = await client.send(
      new GetCommand({
        TableName: process.env.TABLE_NAME,
        Key: {
          PK: shortAlias,
          SK: shortAlias,
        },
      }),
    );

    return link.Item;
  } catch (error) {
    throw error;
  }
};

export const listLinks = async (email: string) => {
  try {
    const client = getDynamoClient();

    const input = {
      TableName: process.env.TABLE_NAME,
      FilterExpression: "#user = :user AND deactivated = :deactivated",
      ExpressionAttributeValues: {
        ":user": email,
        ":deactivated": false,
      },
      ExpressionAttributeNames: {
        "#user": "user",
      },
    };
    const output = await client.send(new ScanCommand(input));

    return output.Items;
  } catch (error) {
    throw error;
  }
};

export const redirectLink = async (shortAlias: string) => {
  try {
    const client = getDynamoClient();

    const response = await client.send(
      new GetCommand({
        TableName: process.env.TABLE_NAME,
        Key: {
          PK: shortAlias,
          SK: shortAlias,
        },
      }),
    );

    const link = response.Item;

    if (!link) {
      throw new CustomError(404, "Short link not found");
    }

    if (link["deactivated"] === true) {
      throw new CustomError(403, "Link was deactivated");
    }

    link["visitCount"] += 1;

    if (link["lifetime"] === "singleuse") {
      link["deactivated"] = true;
    }

    await client.send(
      new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: link,
      }),
    );

    return link;
  } catch (error) {
    throw error;
  }
};

export const deactivateLink = async (shortAlias: string) => {
  try {
    const client = getDynamoClient();

    const response = await client.send(
      new GetCommand({
        TableName: process.env.TABLE_NAME,
        Key: {
          PK: shortAlias,
          SK: shortAlias,
        },
      }),
    );

    const link = response.Item;
    if (!link) {
      throw new CustomError(404, "Short link not found");
    }

    if (link["deactivated"] === true) {
      throw new CustomError(403, "Link was already deactivated");
    }

    link["deactivated"] = true;

    await client.send(
      new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: link,
      }),
    );
  } catch (error) {
    throw error;
  }
};
