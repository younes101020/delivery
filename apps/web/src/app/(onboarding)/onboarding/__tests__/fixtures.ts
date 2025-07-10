import { it } from "vitest";

interface User {
  email: string;
  password: string;
  registered: boolean;
}

const users: User[] = [];

interface OnBoardingFixtures {
  users: User[];
}

export const onBoardingTest = it.extend<OnBoardingFixtures>({
  users: async ({}, inject) => {
    users.push(
      {
        email: "test@example.com",
        password: "Azerty-60",
        registered: true,
      },
      {
        email: "jane@example.com",
        password: "password456",
        registered: false,
      },
      {
        email: "bob@example.com",
        password: "password789",
        registered: false,
      },
    );
    await inject(users);
    users.length = 0;
  },
});
