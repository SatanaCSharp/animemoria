import { Test } from '@nestjs/testing';
import { AccountStatus } from '@packages/shared-types/enums';
import { ApplicationError } from '@packages/shared-types/errors';
import { SignInCommandProcessor } from 'account/use-case/commands/sign-in.command';
import * as bcrypt from 'bcrypt';
import { createSignInCommandMock } from 'test/account/mocks/use-case/sign-in.command.mock';
import {
  createAccountRepositoryMock,
  createAccountRepositoryProvider,
  getActiveAccountMock,
} from 'test/shared/domain/repositories/account-repository.mock';
import {
  createSessionRepositoryMock,
  createSessionRepositoryProvider,
  getSessionMock,
} from 'test/shared/domain/repositories/session-repository.mock';
import {
  createAuthServiceMock,
  createAuthServiceProvider,
  getTokenPairMock,
} from 'test/shared/domain/services/auth-service.mock';

jest.mock('bcrypt');

describe('SignInCommandProcessor', () => {
  let processor: SignInCommandProcessor;
  let accountRepository: ReturnType<typeof createAccountRepositoryMock>;
  let sessionRepository: ReturnType<typeof createSessionRepositoryMock>;
  let authService: ReturnType<typeof createAuthServiceMock>;

  beforeEach(async () => {
    accountRepository = createAccountRepositoryMock();
    sessionRepository = createSessionRepositoryMock();
    authService = createAuthServiceMock();

    const moduleRef = await Test.createTestingModule({
      providers: [
        SignInCommandProcessor,
        createAccountRepositoryProvider(accountRepository),
        createSessionRepositoryProvider(sessionRepository),
        createAuthServiceProvider(authService),
      ],
    }).compile();

    processor = moduleRef.get(SignInCommandProcessor);
  });

  describe('process', () => {
    it('creates session and returns tokens for valid credentials', async () => {
      const command = createSignInCommandMock();
      const account = getActiveAccountMock();
      const session = getSessionMock({ appType: command.appType });
      const tokens = getTokenPairMock();

      accountRepository.findByEmail.mockResolvedValue(account);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      sessionRepository.create.mockResolvedValue(session);
      authService.getTokens.mockResolvedValue(tokens);

      const result = await processor.process(command);

      expect(accountRepository.findByEmail).toHaveBeenCalledWith(command.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        command.password,
        account.password,
      );
      expect(sessionRepository.create).toHaveBeenCalledWith({
        accountId: account.id,
        appType: command.appType,
        refreshTokenHash: null,
      });
      expect(authService.getTokens).toHaveBeenCalledWith(
        account.id,
        account.email,
        session.id,
      );
      expect(sessionRepository.update).toHaveBeenCalledWith(session.id, {
        refreshTokenHash: tokens.refreshToken,
      });
      expect(result).toEqual(tokens);
    });

    it('throws when account does not exist', async () => {
      const command = createSignInCommandMock();

      accountRepository.findByEmail.mockResolvedValue(null);

      await expect(processor.process(command)).rejects.toBeInstanceOf(
        ApplicationError,
      );
      expect(sessionRepository.create).not.toHaveBeenCalled();
    });

    it('throws when account is not active', async () => {
      const command = createSignInCommandMock();
      const inactiveAccount = getActiveAccountMock({
        status: AccountStatus.BANNED,
      });

      accountRepository.findByEmail.mockResolvedValue(inactiveAccount);

      await expect(processor.process(command)).rejects.toBeInstanceOf(
        ApplicationError,
      );
      expect(sessionRepository.create).not.toHaveBeenCalled();
    });

    it('throws when password is invalid', async () => {
      const command = createSignInCommandMock();
      const account = getActiveAccountMock();

      accountRepository.findByEmail.mockResolvedValue(account);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(processor.process(command)).rejects.toBeInstanceOf(
        ApplicationError,
      );
      expect(sessionRepository.create).not.toHaveBeenCalled();
    });
  });
});
