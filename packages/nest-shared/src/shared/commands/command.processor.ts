export interface CommandProcessor<TCommand, TResponse = unknown> {
  process(command: TCommand): TResponse | Promise<TResponse>;
}
