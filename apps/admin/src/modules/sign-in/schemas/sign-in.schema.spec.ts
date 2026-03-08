import { signInSchema } from 'modules/sign-in/schemas/sign-in.schema';

describe('signInSchema', () => {
  it('passes for valid email and password', async () => {
    const valid = {
      email: 'user@example.com',
      password: 'password123',
    };
    await expect(signInSchema.validate(valid)).resolves.toEqual(valid);
  });

  it('rejects empty email', async () => {
    await expect(
      signInSchema.validate({ email: '', password: 'password123' }),
    ).rejects.toThrow('validation:email.required');
  });

  it('rejects invalid email format', async () => {
    await expect(
      signInSchema.validate({ email: 'not-an-email', password: 'password123' }),
    ).rejects.toThrow('validation:email.invalid');
  });

  it('rejects empty password', async () => {
    await expect(
      signInSchema.validate({ email: 'user@example.com', password: '' }),
    ).rejects.toThrow('validation:password.required');
  });

  it('rejects password shorter than 8 characters', async () => {
    await expect(
      signInSchema.validate({ email: 'user@example.com', password: 'short' }),
    ).rejects.toThrow('validation:password.minLength');
  });

  it('accepts password with exactly 8 characters', async () => {
    const valid = { email: 'user@example.com', password: '12345678' };
    await expect(signInSchema.validate(valid)).resolves.toEqual(valid);
  });
});
