import { z } from "zod";

export type ActionState = {
  error?: string;
  success?: string;
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  [key: string]: any; // This allows for additional properties
};

/* eslint-disable  @typescript-eslint/no-explicit-any */
type ValidatedActionFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData
) => Promise<T>;

/* eslint-disable  @typescript-eslint/no-explicit-any */
export function validatedAction<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData): Promise<T> => {
    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0].message } as T;
    }

    return action(result.data, formData);
  };
}
