import { RegisterServiceCommandProcessor } from 'modules/registry/use-case/commands/register-service.command';
import { UnregisterServiceCommandProcessor } from 'modules/registry/use-case/commands/unregister-service.command';

export const commands = [
  RegisterServiceCommandProcessor,
  UnregisterServiceCommandProcessor,
];
