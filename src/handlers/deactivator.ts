import { ScheduledEvent } from "aws-lambda";
import { getLink, updateLink } from "../data/link";
import { sendMessageToQueue } from "../util/sqsClient";

export const main = async (event: ScheduledEvent) => {
  try {
    const link = await getLink(event.detail.PK);
    link.deactivated = true;
    await updateLink(link);
    await sendMessageToQueue(JSON.stringify(link));
  } catch (error) {
    throw error;
  }
};
