import { db } from "@delivery/drizzle";
import { invitations, teamMembers, teams, users } from "@delivery/drizzle/schema";
import { faker } from "@faker-js/faker";
import { sql } from "drizzle-orm";
import { it as base } from "vitest";

import type { InsertUserSchema, SelectUserSchema } from "@/lib/dto";

import type { CreateInvitation, SelectInvitation } from "../team/invitation/lib/dto";
import type { TeamMember } from "../team/lib/dto";

interface Fixtures {
  userPayload: InsertUserSchema;
  registeredUser: SelectUserSchema;
  randomRegisteredTeamId: string;
  invitationPayload: CreateInvitation;
  randomRegisteredInvitation: SelectInvitation;
  randomRegisteredTeamMember: TeamMember;
}

const userPayload = {
  email: faker.internet.email(),
  password: faker.internet.password(),
};

const invitationPayload = {
  email: faker.internet.email(),
  role: "member",
  teamId: faker.number.int({ min: 1, max: 1000 }),
  invitedBy: faker.number.int({ min: 1, max: 1000 }),
};

export const it = base.extend<Fixtures>({
  userPayload: async ({}, use) => {
    await use(userPayload);
  },
  registeredUser: async ({}, use) => {
    const registeredUser = await getRandomRegisteredUser();
    await use({ ...registeredUser, role: "member" });
  },
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
  randomRegisteredTeamMember: async ({}, use) => {
    const randomRegisteredTeamMember = await getRandomRegisteredTeamMember();
    await use(randomRegisteredTeamMember);
  },
});

async function getRandomRegisteredUser() {
  const [registeredUser] = await db.select().from(users).orderBy(sql`RANDOM()`).limit(1);
  return registeredUser;
}

async function getRandomRegisteredTeamId() {
  const [registeredTeam] = await db.select().from(teams).orderBy(sql`RANDOM()`).limit(1);
  return registeredTeam.id.toString();
}

async function getRandomRegisteredTeamMember() {
  const [registeredTeamMember] = await db.select().from(teamMembers).orderBy(sql`RANDOM()`).limit(1);
  return registeredTeamMember;
}

async function getRandomRegisteredInvitation() {
  const [registeredInvitation] = await db.select().from(invitations).orderBy(sql`RANDOM()`).limit(1);
  return registeredInvitation;
}
