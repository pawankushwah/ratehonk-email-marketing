import { ZodError, ZodSchema } from 'zod';

export const validateZodSchema = (schema: ZodSchema) => (values: any) => {
  try {
    schema.parse(values);
    return {};
  } catch (error) {
    if (error instanceof ZodError) {
      // Map Zod's { field: ["Error message"] } to Formik's { field: "Error message" }
      const fieldErrors = error.flatten().fieldErrors;
      const formikErrors: Record<string, string> = {};
      
      for (const key in fieldErrors) {
        if (fieldErrors[key] && fieldErrors[key]!.length > 0) {
          formikErrors[key] = fieldErrors[key]![0];
        }
      }
      
      return formikErrors;
    }
    return {};
  }
};
