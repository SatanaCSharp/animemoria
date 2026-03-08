import { Button } from '@packages/ui-shared/buttons';
import { SpinnerIcon } from '@packages/ui-shared/icons';
import { EmailInput, PasswordInput } from '@packages/ui-shared/inputs';
import { ReactElement } from 'react';
import { Control, Controller, FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { testIds } from '__tests__/mocks/test-ids/modules/sign-in';
import { SignInFormData } from 'modules/sign-in/schemas/sign-in.schema';

type Props = {
  onSubmit: () => void;
  isSubmitting: boolean;
  control: Control<SignInFormData>;
  errors: FieldErrors<SignInFormData>;
};

export const SignInForm = (props: Props): ReactElement => {
  const { t } = useTranslation();
  return (
    <form
      data-testid={testIds.FORM}
      onSubmit={props.onSubmit}
      className="space-y-6"
    >
      <Controller
        name="email"
        control={props.control}
        render={({ field }) => (
          <EmailInput
            data-testid={testIds.EMAIL_INPUT}
            label={t('sign-in:email.label')}
            value={field.value}
            onValueChange={field.onChange}
            onBlur={field.onBlur}
            isInvalid={!!props.errors.email}
            errorMessage={
              props.errors.email?.message
                ? t(props.errors.email.message)
                : undefined
            }
            isRequired
            variant="bordered"
            className="w-full"
          />
        )}
      />
      <Controller
        name="password"
        control={props.control}
        render={({ field }) => (
          <PasswordInput
            data-testid={testIds.PASSWORD_INPUT}
            label={t('sign-in:password.label')}
            value={field.value}
            onValueChange={field.onChange}
            onBlur={field.onBlur}
            isInvalid={!!props.errors.password}
            errorMessage={
              props.errors.password?.message
                ? t(props.errors.password.message)
                : undefined
            }
            isRequired
            variant="bordered"
            className="w-full"
          />
        )}
      />

      <Button
        data-testid={testIds.SUBMIT_BUTTON}
        isLoading={props.isSubmitting}
        type="submit"
        variant="bordered"
        className="w-full border-gray-900"
        spinner={<SpinnerIcon className="animate-spin h-5 w-5 text-current" />}
      >
        {t('sign-in:submit')}
      </Button>
    </form>
  );
};
