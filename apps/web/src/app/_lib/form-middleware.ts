import type { NewUser as User } from "@delivery/jobs/types";
import type { z } from "zod";

import { getUser } from "./user-session";

type ActionFields = Record<string, any> | undefined;

export interface ActionState<PrevState extends ActionFields = Record<string, any>> {
  error?: string;
  success?: string;
  inputs: PrevState;
  [key: string]: any; // This allows for additional properties
};

type ValidatedActionFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData,
  prevState: ActionState,
) => Promise<T>;

export function validatedAction<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionFunction<S, T>,
) {
  return async (prevState: ActionState, formData: FormData): Promise<T> => {
    const data = Object.fromEntries(formData);
    const result = schema.safeParse(data);
    if (!result.success) {
      return { error: result.error.errors[0].message, inputs: data } as T;
    }
    return action(result.data, formData, prevState);
  };
}

type ValidatedActionWithUserFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData,
  prevState: ActionState,
  user: User
) => Promise<T>;

export function validatedActionWithUser<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionWithUserFunction<S, T>,
) {
  return async (prevState: ActionState, formData: FormData): Promise<T> => {
    const user = await getUser();
    if (!user) {
      throw new Error("User is not authenticated");
    }

    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0].message } as T;
    }

    return action(result.data, formData, prevState, user);
  };
}

export function getFormChangesAction<S extends z.ZodType<any, any>>(
  data: z.infer<S>,
  prevState: ActionState,
) {
  const changes = new Set(Object.keys(data));

  const result = Array.from(changes)
    .filter(key =>
      !Object.prototype.hasOwnProperty.call(prevState.inputs, key)
      || prevState.inputs[key] !== data[key],
    )
    .reduce<z.infer<S>>((diff, key) => {
      diff[key] = data[key];
      return diff;
    }, {});

  if (data.id) {
    result.id = data.id;
  }

  return result;
}
