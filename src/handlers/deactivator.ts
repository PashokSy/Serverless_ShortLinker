import { sendMessageToQueue } from "../util/sqsClient";
import { Link, listActiveLinks, updateLink } from "../data/link";

export const main = async () => {
  try {
    const linksArr = await listActiveLinks();

    if (typeof linksArr === "undefined" || linksArr.length === 0) {
      return;
    }

    for (let i = 0; i < linksArr.length; i++) {
      const currentLink = Link.fromItem(linksArr[i]);

      if (currentLink.deactivateAt === null) continue;

      const lifetime = currentLink.deactivateAt - Date.now();
      if (lifetime <= 0) {
        currentLink.deactivated = true;

        await updateLink(currentLink);
        await sendMessageToQueue(JSON.stringify(currentLink));
      }
    }
  } catch (error) {
    throw error;
  }
};
