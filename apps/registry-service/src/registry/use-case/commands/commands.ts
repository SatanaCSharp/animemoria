import { RegisterServiceCommandProcessor } from 'registry/use-case/commands/register-service.command';
import { UnregisterServiceCommandProcessor } from 'registry/use-case/commands/unregister-service.command';

export const commands = [
  RegisterServiceCommandProcessor,
  UnregisterServiceCommandProcessor,
];
