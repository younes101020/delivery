import type { database } from "../../const";

export type DatabaseType = (typeof database)[number]["value"];

export type DatabaseVersionsCombobox = {
  value: string;
  label: string;
}[];
