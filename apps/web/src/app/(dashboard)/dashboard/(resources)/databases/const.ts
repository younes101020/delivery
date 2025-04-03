export const DEFAULT_DATABASE_VERSION = "latest";

export const database = [
  {
    label: "Postgres",
    value: "postgres",
    description: "PostgreSQL is a powerful, open source object-relational database system.",
    dbType: "SGBD",
    utilityClass: {
      colorEffectHexClassUtility: "via-[#336791]",
      fillIcon: "fill-blue-500",
    },
  },
  {
    label: "Mongo",
    value: "mongo",
    description: "MongoDB is a general purpose, document-based, distributed database.",
    dbType: "NOSQL",
    utilityClass: {
      colorEffectHexClassUtility: "via-[#4DB33D]",
      fillIcon: "fill-green-500",
    },
  },
] as const;
