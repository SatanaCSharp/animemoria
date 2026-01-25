import * as yup from 'yup';

export const signInSchema = yup.object().shape({
  email: yup
    .string()
    .required('validation:email.required')
    .email('validation:email.invalid'),
  password: yup
    .string()
    .required('validation:password.required')
    .min(8, 'validation:password.minLength'),
});

export type SignInFormData = yup.InferType<typeof signInSchema>;
