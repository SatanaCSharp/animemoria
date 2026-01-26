import { useMutation } from '@apollo/client/react';
import { yupResolver } from '@hookform/resolvers/yup';
import { ApplicationError } from '@packages/shared-types/errors';
import { assertDefined } from '@packages/utils/asserts';
import { useNavigate } from '@tanstack/react-router';
import { ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useAuthContext } from 'context/auth.context';
import { usePageTitle } from 'hooks/usePageTitle';
import { SignInForm } from 'modules/sign-in/components/SignInForm';
import { SignInDocument } from 'modules/sign-in/gql/sign-in.graphql.generated';
import {
  signInSchema,
  SignInFormData,
} from 'modules/sign-in/schemas/sign-in.schema';
import { ROUTES } from 'shared/constants/routes';

export const SignInPage = (): ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setToken } = useAuthContext();
  const [signIn, { loading }] = useMutation(SignInDocument, {
    context: {
      headers: { 'x-app-type': 'admin' },
    },
  });

  usePageTitle(t('sign-in:head.title'));

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: yupResolver(signInSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignInFormData): Promise<void> => {
    const response = await signIn({ variables: { input: data } });
    assertDefined(
      response?.data?.signIn?.accessToken,
      new ApplicationError('No accessToken returned.'),
    );
    setToken(response.data.signIn.accessToken);
    await navigate({ to: ROUTES.HOME });
  };

  return (
    <div className="flex items-center justify-center flex-1 bg-gray-50 -mx-4">
      <div className="w-full max-w-md px-8 py-10 bg-white rounded-lg shadow-md mx-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('sign-in:title')}
          </h1>
          <p className="mt-2 text-sm text-gray-600">{t('sign-in:subtitle')}</p>
        </div>
        <SignInForm
          errors={errors}
          control={control}
          isSubmitting={loading}
          onSubmit={handleSubmit(onSubmit)}
        />
      </div>
    </div>
  );
};
