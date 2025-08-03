import { config } from "dotenv";

export default async function setup() {
  if(process.env.CI !== "true") config({ path: "../../.env.test" });
}
