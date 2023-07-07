import { DynamoDB } from "aws-sdk";
import { Base } from "./base";
import { getClient } from "./client";

export class Link extends Base {
  longAlias: string;
  lifeTime: string;
  visitCount: number;

  constructor(longAlias: string, lifeTime: string, visitCount?: number) {
    super();
    this.longAlias = longAlias;
    this.lifeTime = lifeTime;
    this.visitCount = visitCount || 0;
  }

  get pk(): string {
    return `LINK#${this.longAlias}`;
  }

  get sk(): string {
    return `LINK#${this.longAlias}`;
  }

  toItem(): Record<string, unknown> {
    return {
      ...this.keys(),
      longAlias: { S: this.longAlias },
      lifeTime: { S: this.lifeTime },
      visitCount: { N: this.visitCount.toString() },
    };
  }
}

export const createLink = async (link: Link): Promise<Link> => {
  const client = getClient();

  try {
    await client
      .put({
        TableName: process.env.TABLE_NAME as string,
        Item: link.toItem(),
        ConditionExpression: "attribute_not_exists(PK)",
      })
      .promise();

    return link;
  } catch (error) {
    throw error;
  }
};
