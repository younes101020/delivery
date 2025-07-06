import { faker } from "@faker-js/faker";
import { it as base } from "vitest";

import { db } from "@/db";
import { invitations, teams, users } from "@/db/schema";

import type { CreateInvitation, SelectInvitation } from "../lib/dto";

interface Fixtures {
  randomRegisteredTeamId: string;
  invitationPayload: CreateInvitation;
  randomRegisteredInvitation: SelectInvitation;
}

const invitationPayload = {
  email: faker.internet.email(),
  role: "member",
  teamId: faker.number.int({ min: 1, max: 1000 }),
  invitedBy: faker.number.int({ min: 1, max: 1000 }),
};

export const it = base.extend<Fixtures>({
  randomRegisteredTeamId: async ({}, use) => {
    const randomRegisteredTeamId = await getRandomRegisteredTeamId();
    await use(randomRegisteredTeamId);
  },
  invitationPayload: async ({}, use) => {
    const registeredUser = await getRandomRegisteredUser();
    await use({ ...invitationPayload, invitedBy: registeredUser.id });
  },
  randomRegisteredInvitation: async ({}, use) => {
    const randomRegisteredInvitation = await getRandomRegisteredInvitation();
    await use(randomRegisteredInvitation);
  },
});

async function getRandomRegisteredTeamId() {
  const [registeredUser] = await db.select().from(teams).limit(1);
  return registeredUser.id.toString();
}

async function getRandomRegisteredInvitation() {
  const [registeredUser] = await db.select().from(invitations).limit(1);
  return registeredUser;
}

async function getRandomRegisteredUser() {
  const [registeredUser] = await db.select().from(users).limit(1);
  return registeredUser;
}
