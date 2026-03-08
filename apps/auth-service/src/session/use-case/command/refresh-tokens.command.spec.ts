import { Test } from '@nestjs/testing';
import { ApplicationError } from '@packages/shared-types/errors';
import { RefreshTokensCommandProcessor } from 'session/use-case/command/refresh-tokens.command';
import { createRefreshTokensCommandMock } from 'test/session/mocks/use-case/refresh-tokens.command.mock';
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

describe('RefreshTokensCommandProcessor', () => {
  let processor: RefreshTokensCommandProcessor;
  let accountRepository: ReturnType<typeof createAccountRepositoryMock>;
  let sessionRepository: ReturnType<typeof createSessionRepositoryMock>;
  let authService: ReturnType<typeof createAuthServiceMock>;

  beforeEach(async () => {
    accountRepository = createAccountRepositoryMock();
    sessionRepository = createSessionRepositoryMock();
    authService = createAuthServiceMock();

    const moduleRef = await Test.createTestingModule({
      providers: [
        RefreshTokensCommandProcessor,
        createAccountRepositoryProvider(accountRepository),
        createSessionRepositoryProvider(sessionRepository),
        createAuthServiceProvider(authService),
      ],
    }).compile();

    processor = moduleRef.get(RefreshTokensCommandProcessor);
  });

  describe('process', () => {
    it('generates new tokens and updates session when command is valid', async () => {
      const command = createRefreshTokensCommandMock();
      const session = getSessionMock({
        id: command.sessionId,
        accountId: command.accountId,
        refreshTokenHash: command.oldRefreshToken,
      });
      const account = getActiveAccountMock({ id: command.accountId });
      const tokens = getTokenPairMock();

      sessionRepository.findById.mockResolvedValue(session);
      accountRepository.findById.mockResolvedValue(account);
      authService.getTokens.mockResolvedValue(tokens);

      const result = await processor.process(command);

      expect(sessionRepository.findById).toHaveBeenCalledWith(
        command.sessionId,
      );
      expect(accountRepository.findById).toHaveBeenCalledWith(
        command.accountId,
      );
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

    it('throws when session does not exist', async () => {
      const command = createRefreshTokensCommandMock();

      sessionRepository.findById.mockResolvedValue(null);

      await expect(processor.process(command)).rejects.toBeInstanceOf(
        ApplicationError,
      );
    });

    it('throws when session belongs to another account', async () => {
      const command = createRefreshTokensCommandMock();
      const session = getSessionMock({
        id: command.sessionId,
        accountId: 'other-account',
      });

      sessionRepository.findById.mockResolvedValue(session);

      await expect(processor.process(command)).rejects.toBeInstanceOf(
        ApplicationError,
      );
    });

    it('throws when refresh token hash is missing', async () => {
      const command = createRefreshTokensCommandMock();
      const session = getSessionMock({
        id: command.sessionId,
        accountId: command.accountId,
        refreshTokenHash: null,
      });

      sessionRepository.findById.mockResolvedValue(session);

      await expect(processor.process(command)).rejects.toBeInstanceOf(
        ApplicationError,
      );
    });

    it('throws when old refresh token does not match stored hash', async () => {
      const command = createRefreshTokensCommandMock();
      const session = getSessionMock({
        id: command.sessionId,
        accountId: command.accountId,
        refreshTokenHash: 'other-token',
      });

      sessionRepository.findById.mockResolvedValue(session);

      await expect(processor.process(command)).rejects.toBeInstanceOf(
        ApplicationError,
      );
    });

    it('throws when account does not exist', async () => {
      const command = createRefreshTokensCommandMock();
      const session = getSessionMock({
        id: command.sessionId,
        accountId: command.accountId,
        refreshTokenHash: command.oldRefreshToken,
      });

      sessionRepository.findById.mockResolvedValue(session);
      accountRepository.findById.mockResolvedValue(null);

      await expect(processor.process(command)).rejects.toBeInstanceOf(
        ApplicationError,
      );
    });
  });
});
