import { DELIVERY_IN_PROGRESS_ACTIONS_RUNS_URL, DELIVERY_LATEST_URL, GH_ACCESS_TOKEN } from "./const";
import { getVersionFromTag } from "./utils";

export async function getLatestDeliveryVersion() {
  const app = await fetch(DELIVERY_LATEST_URL, {
    headers: {
      Authorization: `Bearer ${GH_ACCESS_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
  }).then(res => res.json());
  if (app.tag_name)
    return getVersionFromTag(app.tag_name);
  return "1.0.0";
}

export async function isPipelineInProgress() {
  const response = await fetch(DELIVERY_IN_PROGRESS_ACTIONS_RUNS_URL, {
    headers: {
      Authorization: `Bearer ${GH_ACCESS_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
  }).then(res => res.json());
  return Number.parseInt(response.total_count) > 0;
}
