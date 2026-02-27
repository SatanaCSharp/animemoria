import { Test } from '@nestjs/testing';
import {
  createUserRepositoryMock,
  createUserRepositoryProvider,
  UserRepositoryMock,
} from 'test/shared/domain/repositories/create-user-provider';
import {
  createCommandMock,
  getCreatedUserMock,
} from 'test/users/mocks/use-case/create-user.command.mock';
import { CreateUserCommandProcessor } from 'users/use-case/commands/create-user.command';

describe('CreateUserCommandProcessor', () => {
  let processor: CreateUserCommandProcessor;
  let userRepository: UserRepositoryMock;

  beforeEach(async () => {
    userRepository = createUserRepositoryMock();

    const moduleRef = await Test.createTestingModule({
      providers: [
        CreateUserCommandProcessor,
        createUserRepositoryProvider(userRepository),
      ],
    }).compile();

    processor = moduleRef.get(CreateUserCommandProcessor);
  });

  describe('process', () => {
    it('delegates to repository with the command and returns created user', async () => {
      const command = createCommandMock();
      const created = getCreatedUserMock();
      userRepository.create.mockResolvedValue(created);

      const result = await processor.process(command);

      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledWith(command);
      expect(result).toEqual({
        id: created.id,
        accountId: created.accountId,
        email: created.email,
        nickname: created.nickname,
      });
    });

    it('propagates repository errors', async () => {
      const command = createCommandMock();
      const error = new Error('DB unavailable');
      userRepository.create.mockRejectedValue(error);

      await expect(processor.process(command)).rejects.toThrow(error);
      expect(userRepository.create).toHaveBeenCalledWith(command);
    });
  });
});
