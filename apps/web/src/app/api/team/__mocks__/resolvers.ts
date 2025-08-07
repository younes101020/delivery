import { faker } from "@faker-js/faker";
import { HttpResponse } from "msw";

export function getTeamResolver() {
  const teamMembers = faker.helpers.multiple(() => ({
    id: faker.string.uuid(),
    role: faker.helpers.arrayElement(["member", "owner"]),
    teamId: faker.string.uuid(),
    userId: faker.string.uuid(),
    joinedAt: new Date().toISOString(),
    user: {
      name: faker.internet.username(),
      id: faker.string.uuid(),
      email: faker.internet.email(),
    },
  }), {
    count: 10,
  });

  return HttpResponse.json({
    name: "Engineering Team",
    id: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    teamMembers,
  });
}
