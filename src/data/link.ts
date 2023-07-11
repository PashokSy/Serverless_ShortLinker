import { GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { randomBytes } from "crypto";

import { getClient } from "../util/client";

enum LifeTime {
  SingleUse = "SingleUse",
  OneDay = "OneDay",
  ThreeDays = "ThreeDays",
  SevenDays = "SevenDays",
}

export class Link {
  PK: string;
  SK: string;
  user: string;
  longAlias: string;
  shortAlias: string;
  lifetime: string;
  visitCount: number;
  deactivated: boolean;

  constructor(
    email: string,
    longAlias: string,
    lifetime: string,
    shortAlias: string,
    visitCount?: number,
    deactivated?: boolean,
  ) {
    this.PK = shortAlias;
    this.SK = shortAlias;
    this.user = email;
    this.longAlias = longAlias;
    this.shortAlias = shortAlias;
    this.lifetime = lifetime;
    this.visitCount = visitCount || 0;
    this.deactivated = deactivated || false;
  }
}

export const saveLink = async (link: Link) => {
  try {
    const client = getClient();

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
      throw new Error("Link exists");
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
    const client = getClient();
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
    const client = getClient();

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
