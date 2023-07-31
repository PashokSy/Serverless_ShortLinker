import { GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { randomBytes } from "crypto";
import { getDynamoDBDocumentClient } from "../util/dynamoClient";
import { CustomError } from "../error/customError";
import { sendEmail } from "../util/sesClient";
import { createSchedule } from "../util/schedulerEvent";

export class Link {
  PK: string;
  SK: string;
  user: string;
  longLink: string;
  shortAlias: string;
  lifetime: string;
  visitCount: number;
  deactivated: boolean;
  createdAt: number;

  constructor(
    user: string,
    longLink: string,
    lifetime: string,
    shortAlias: string,
    PK?: string,
    SK?: string,
    visitCount?: number,
    deactivated?: boolean,
    createdAt?: number,
  ) {
    this.PK = PK || shortAlias;
    this.SK = SK || shortAlias;
    this.user = user;
    this.longLink = longLink;
    this.shortAlias = shortAlias;
    this.lifetime = lifetime;
    this.visitCount = visitCount || 0;
    this.deactivated = deactivated || false;
    this.createdAt = createdAt || Date.now();
  }

  static fromItem(item: Record<string, any>): Link {
    return new Link(
      item.user,
      item.longLink,
      item.lifetime,
      item.shortAlias,
      item.PK,
      item.SK,
      item.visitCount,
      item.deactivated,
      item.createdAt,
    );
  }
}

enum DaysInMs {
  One = 8.64e7,
  Three = 2.592e8,
  Seven = 6.048e8,
}

export const createLinkDeactivationEvent = async (lifetime: string, createdAt: number, PK: string) => {
  try {
    lifetime = lifetime.toLowerCase().trim();

    switch (lifetime) {
      case "oneday":
        await createSchedule(PK, createdAt + DaysInMs.One);
      case "threedays":
        await createSchedule(PK, createdAt + DaysInMs.Three);
      case "sevendays":
        await createSchedule(PK, createdAt + DaysInMs.Seven);
      default:
        return;
    }
  } catch (error) {
    throw error;
  }
};

export const saveLink = async (link: Link): Promise<void> => {
  try {
    const dynamoClient = getDynamoDBDocumentClient();

    const foundLink = await dynamoClient.send(
      new GetCommand({
        TableName: process.env.TABLE_NAME,
        Key: {
          PK: link.PK,
          SK: link.SK,
        },
      }),
    );

    if (!foundLink.Item) {
      await dynamoClient.send(
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
    let shortAlias = randomBytes(3).toString("hex");
    const listLinks = await listLinksByShortAlias(shortAlias);

    while (listLinks?.includes({ shortAlias })) {
      shortAlias = randomBytes(3).toString("hex");
    }

    return shortAlias;
  } catch (error) {
    throw error;
  }
};

export const listLinksByShortAlias = async (shortAlias: string): Promise<Record<string, any>[] | undefined> => {
  try {
    const dynamoClient = getDynamoDBDocumentClient();

    return (
      await dynamoClient.send(
        new ScanCommand({
          TableName: process.env.TABLE_NAME,
          FilterExpression: "PK = :shortAlias",
          ExpressionAttributeValues: {
            ":shortAlias": shortAlias,
          },
        }),
      )
    ).Items;
  } catch (error) {
    throw error;
  }
};

export const getLink = async (shortAlias: string): Promise<Link> => {
  try {
    const dynamoClient = getDynamoDBDocumentClient();

    const item = (
      await dynamoClient.send(
        new GetCommand({
          TableName: process.env.TABLE_NAME,
          Key: {
            PK: shortAlias,
            SK: shortAlias,
          },
        }),
      )
    ).Item;

    if (!item) throw new CustomError(404, "Short link not found");

    return Link.fromItem(item);
  } catch (error) {
    throw error;
  }
};

export const listLinks = async (email: string): Promise<Record<string, any>[] | undefined> => {
  try {
    const dynamoClient = getDynamoDBDocumentClient();

    return (
      await dynamoClient.send(
        new ScanCommand({
          TableName: process.env.TABLE_NAME,
          FilterExpression: "#user = :user",
          ExpressionAttributeValues: {
            ":user": email,
          },
          ExpressionAttributeNames: {
            "#user": "user",
          },
        }),
      )
    ).Items;
  } catch (error) {
    throw error;
  }
};

const sendDeactivationEmail = async (link: Link): Promise<void> => {
  await sendEmail(
    link.user,
    "ShortLinker link deactivation",
    `Your short link ${process.env.BASE_URL}${link.shortAlias} for ${link.longLink} was deactivated`,
  );
};

export const redirectLink = async (shortAlias: string): Promise<Link> => {
  try {
    const dynamoClient = getDynamoDBDocumentClient();

    const link = await getLink(shortAlias);

    if (link.deactivated === true) {
      throw new CustomError(403, "Link was deactivated");
    }

    link.visitCount += 1;

    if (link.lifetime === "singleuse") {
      link.deactivated = true;
      await sendDeactivationEmail(link);
    }

    await dynamoClient.send(
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

export const deactivateLink = async (user: string, shortAlias: string): Promise<void> => {
  try {
    const dynamoClient = getDynamoDBDocumentClient();

    const link = await getLink(shortAlias);

    if (link.user != user) {
      throw new CustomError(403, `User ${user} not authorized to deactivate this link`);
    }

    if (link.deactivated === true) {
      throw new CustomError(403, "Link already deactivated");
    }

    link.deactivated = true;
    await sendDeactivationEmail(link);

    await dynamoClient.send(
      new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: link,
      }),
    );
  } catch (error) {
    throw error;
  }
};

export const listActiveLinks = async (): Promise<Record<string, any>[] | undefined> => {
  try {
    const dynamoClient = getDynamoDBDocumentClient();

    return (
      await dynamoClient.send(
        new ScanCommand({
          TableName: process.env.TABLE_NAME,
          FilterExpression: "attribute_exists(deactivated) AND deactivated <> :deactivated AND deactivateAt <> :Null",
          ExpressionAttributeValues: {
            ":deactivated": true,
            ":Null": null,
          },
        }),
      )
    ).Items;
  } catch (error) {
    throw error;
  }
};

export const updateLink = async (link: Link): Promise<void> => {
  try {
    const dynamoClient = getDynamoDBDocumentClient();

    dynamoClient.send(
      new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: link,
      }),
    );
  } catch (error) {
    throw error;
  }
};
