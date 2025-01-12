import puppeteer from "puppeteer";

import { toWebp } from "./utils";

export async function screenPage(url: string) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setViewport({
    width: 1920,
    height: 1080,
  });

  await Promise.race([
    page.goto(url, { waitUntil: "networkidle0" }),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 30000)),
  ]);

  const screenshot = await page.screenshot({
    type: "png",
    fullPage: true,
  });

  await browser.close();

  return await toWebp(screenshot);
}
