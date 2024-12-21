"use server";

import { validatedAction } from "@/lib/auth/middleware";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function signOut() {
  (await cookies()).delete("session");
}

const signInSchema = z.object({
    email: z.string().email().min(3).max(255),
    password: z.string().min(8).max(100),
  });
  
  export const signIn = validatedAction(signInSchema, async (data, formData) => {
    const { email, password } = data;
  
    const userWithTeam = await db
      .select({
        user: users,
        team: teams,
      })
      .from(users)
      .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
      .leftJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(eq(users.email, email))
      .limit(1);
  
    if (userWithTeam.length === 0) {
      return {
        error: 'Invalid email or password. Please try again.',
        email,
        password,
      };
    }
  
    const { user: foundUser, team: foundTeam } = userWithTeam[0];
  
    const isPasswordValid = await comparePasswords(
      password,
      foundUser.passwordHash,
    );
  
    if (!isPasswordValid) {
      return {
        error: 'Invalid email or password. Please try again.',
        email,
        password,
      };
    }
  
    await Promise.all([
      setSession(foundUser),
      logActivity(foundTeam?.id, foundUser.id, ActivityType.SIGN_IN),
    ]);
  
    const redirectTo = formData.get('redirect') as string | null;
    if (redirectTo === 'checkout') {
      const priceId = formData.get('priceId') as string;
      return createCheckoutSession({ team: foundTeam, priceId });
    }
  
    redirect('/dashboard');
  });