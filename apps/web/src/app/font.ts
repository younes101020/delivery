import { Roboto } from "next/font/google";

export const roboto = Roboto({
  weight: "400",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-roboto",
});

export const robotoLight = Roboto({
  weight: "300",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-roboto-thin",
});
