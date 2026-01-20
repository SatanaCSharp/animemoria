import { SignInCommandProcessor } from 'account/use-case/commands/sign-in.command';
import { SignUpCommandProcessor } from 'account/use-case/commands/sign-up.command';

export const commands = [SignUpCommandProcessor, SignInCommandProcessor];
