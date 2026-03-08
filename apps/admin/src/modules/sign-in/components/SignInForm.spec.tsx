import { screen, fireEvent, act, waitFor } from '@testing-library/react';
import { ReactElement } from 'react';
import { useForm } from 'react-hook-form';

import { testIds } from '__tests__/mocks/test-ids/modules/sign-in';
import { render } from '__tests__/utils/test-utils';
import { SignInForm } from 'modules/sign-in/components/SignInForm';

import type { SignInFormData } from 'modules/sign-in/schemas/sign-in.schema';

const defaultValues: SignInFormData = {
  email: '',
  password: '',
};

const SignInFormWrapper = (): ReactElement => {
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<SignInFormData>({
    defaultValues,
  });
  const onSubmit = jest.fn();
  return (
    <SignInForm
      control={control}
      errors={errors}
      isSubmitting={false}
      onSubmit={handleSubmit(onSubmit)}
    />
  );
};

describe('SignInForm', () => {
  it('renders email and password inputs with translated labels', () => {
    render(<SignInFormWrapper />);

    expect(screen.getByTestId(testIds.EMAIL_INPUT)).toBeInTheDocument();
    expect(screen.getByTestId(testIds.PASSWORD_INPUT)).toBeInTheDocument();
  });

  it('renders submit button with translated text', () => {
    render(<SignInFormWrapper />);

    expect(screen.getByTestId(testIds.SUBMIT_BUTTON)).toBeInTheDocument();
  });

  it('calls onSubmit when form is submitted with valid data', async () => {
    const onSubmit = jest.fn();
    const FormWithSubmit = (): ReactElement => {
      const {
        control,
        formState: { errors },
        handleSubmit,
      } = useForm<SignInFormData>({ defaultValues });
      return (
        <SignInForm
          control={control}
          errors={errors}
          isSubmitting={false}
          onSubmit={handleSubmit(onSubmit)}
        />
      );
    };
    render(<FormWithSubmit />);

    const emailInput = screen.getByTestId(testIds.EMAIL_INPUT);
    const passwordInput = screen.getByTestId(testIds.PASSWORD_INPUT);

    act(() => {
      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
    });

    const form = screen.getByTestId(testIds.FORM);
    expect(form).toBeInTheDocument();
    act(() => {
      fireEvent.submit(form);
    });

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    expect(onSubmit).toHaveBeenCalledWith(
      { email: 'user@example.com', password: 'password123' },
      expect.anything(),
    );
  });

  it('shows loading state on submit button when isSubmitting is true', () => {
    const FormLoading = (): ReactElement => {
      const {
        control,
        formState: { errors },
      } = useForm<SignInFormData>({
        defaultValues,
      });
      return (
        <SignInForm
          control={control}
          errors={errors}
          isSubmitting
          onSubmit={jest.fn()}
        />
      );
    };
    render(<FormLoading />);

    const button = screen.getByTestId(testIds.SUBMIT_BUTTON);
    expect(button).toBeDisabled();
  });
});
