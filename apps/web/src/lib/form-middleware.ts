import { z } from "zod";

  /* eslint-disable  @typescript-eslint/no-explicit-any */
export type ActionState<PrevState extends object = Record<string, any>> = {
  error?: string;
  success?: string;
  inputs: PrevState;
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  [key: string]: any; // This allows for additional properties
};

/* eslint-disable  @typescript-eslint/no-explicit-any */
type ValidatedActionFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData,
  prevState: ActionState,
) => Promise<T>;

/* eslint-disable  @typescript-eslint/no-explicit-any */
export function validatedAction<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionFunction<S, T>,
) {
  return async (prevState: ActionState, formData: FormData): Promise<T> => {
    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return { error: result.error.errors[0].message } as T;
    }
    return action(result.data, formData, prevState);
  };
}

/* eslint-disable  @typescript-eslint/no-explicit-any */
export function getFormChangesAction<S extends z.ZodType<any, any>>(
  data: z.infer<S>,
  prevState: ActionState,
) {
  const changes = new Set(Object.keys(data));
  const result = Array.from(changes)
    .filter((key) => prevState.inputs.hasOwnProperty(key) && prevState.inputs[key] !== data[key])
    .reduce<z.infer<S>>((diff, key) => {
      diff[key] = data[key];
      return diff;
    }, {});

  if (data.id) {
    result.id = data.id;
  }

  return result;
}
