export interface QueryProcessor<TQuery, TResponse = unknown> {
  process(query: TQuery): TResponse | Promise<TResponse>;
}
