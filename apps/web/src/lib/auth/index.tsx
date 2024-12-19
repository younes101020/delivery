"use client";

import { serverEnv } from "@/env";
import { NewUser as User } from "@delivery/jobs/types";
import { createContext, ReactNode, use, useContext, useEffect, useState } from "react";

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
};

const UserContext = createContext<UserContextType | null>(null);

export function useUser(): UserContextType | null {
  const context = useContext(UserContext);
  if (context === null && serverEnv.NODE_ENV !== "test") {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

export function UserProvider({
  children,
  userPromise,
}: {
  children: ReactNode;
  userPromise: Promise<User | null>;
}) {
  const initialUser = use(userPromise);
  const [user, setUser] = useState<User | null>(initialUser);
  
  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
}
