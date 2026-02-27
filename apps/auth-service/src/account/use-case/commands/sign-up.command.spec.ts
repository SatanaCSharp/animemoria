import { Test } from '@nestjs/testing';
import { AccountStatus } from '@packages/shared-types/enums';
import { ApplicationError } from '@packages/shared-types/errors';
import { SignUpCommandProcessor } from 'account/use-case/commands/sign-up.command';
import * as bcrypt from 'bcrypt';
import { createSignUpCommandMock } from 'test/account/mocks/use-case/sign-up.command.mock';
import {
  createUsersClientServiceMock,
  createUsersClientServiceProvider,
} from 'test/shared/client-services/users-client-service.mock';
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

describe('SignUpCommandProcessor', () => {
  let processor: SignUpCommandProcessor;
  let accountRepository: ReturnType<typeof createAccountRepositoryMock>;
  let sessionRepository: ReturnType<typeof createSessionRepositoryMock>;
  let authService: ReturnType<typeof createAuthServiceMock>;
  let usersClientService: ReturnType<typeof createUsersClientServiceMock>;

  beforeEach(async () => {
    accountRepository = createAccountRepositoryMock();
    sessionRepository = createSessionRepositoryMock();
    authService = createAuthServiceMock();
    usersClientService = createUsersClientServiceMock();

    const moduleRef = await Test.createTestingModule({
      providers: [
        SignUpCommandProcessor,
        createAccountRepositoryProvider(accountRepository),
        createSessionRepositoryProvider(sessionRepository),
        createAuthServiceProvider(authService),
        createUsersClientServiceProvider(usersClientService),
      ],
    }).compile();

    processor = moduleRef.get(SignUpCommandProcessor);
  });

  describe('process', () => {
    it('creates account, user, session and returns tokens when email is free', async () => {
      const command = createSignUpCommandMock();
      const hashedPassword = 'hashed-password';
      const account = getActiveAccountMock({ password: hashedPassword });
      const session = getSessionMock();
      const tokens = getTokenPairMock();

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      accountRepository.findByEmail.mockResolvedValue(null);
      accountRepository.create.mockResolvedValue(account);
      sessionRepository.create.mockResolvedValue(session);
      authService.getTokens.mockResolvedValue(tokens);

      const result = await processor.process(command);

      expect(accountRepository.findByEmail).toHaveBeenCalledWith(command.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(command.password, 10);
      expect(accountRepository.create).toHaveBeenCalledWith({
        email: command.email,
        status: AccountStatus.ACTIVE,
        password: hashedPassword,
      });
      expect(usersClientService.createUser).toHaveBeenCalledWith({
        email: command.email,
        nickname: command.nickname,
        accountId: account.id,
      });
      expect(sessionRepository.create).toHaveBeenCalledWith({
        accountId: account.id,
        appType: session.appType,
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

    it('throws when email already exists', async () => {
      const command = createSignUpCommandMock();

      accountRepository.findByEmail.mockResolvedValue(getActiveAccountMock());

      await expect(processor.process(command)).rejects.toBeInstanceOf(
        ApplicationError,
      );
      expect(accountRepository.create).not.toHaveBeenCalled();
      expect(usersClientService.createUser).not.toHaveBeenCalled();
    });
  });
});
