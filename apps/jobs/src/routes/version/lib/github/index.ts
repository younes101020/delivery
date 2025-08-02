import { DELIVERY_LATEST_URL } from "./const";
import { getVersionFromTag } from "./utils";

export async function getLatestDeliveryVersion() {
  const app = await fetch(DELIVERY_LATEST_URL).then(res => res.json());
  if (app.tag_name)
    return getVersionFromTag(app.tag_name);
  return "1.0.0";
}
