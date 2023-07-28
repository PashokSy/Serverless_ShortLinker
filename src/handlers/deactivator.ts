import { ScheduledEvent } from "aws-lambda";
import { getLink, updateLink } from "../data/link";

export const main = async (event: ScheduledEvent) => {
  try {
    const link = await getLink(event.detail.PK);
    link.deactivated = true;
    await updateLink(link);
  } catch (error) {
    throw error;
  }
};
