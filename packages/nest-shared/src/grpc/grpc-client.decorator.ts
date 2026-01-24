import { Inject } from '@nestjs/common';
import { getGrpcServiceInjectionToken } from 'grpc/grpc.utils';

export function InjectGrpcServiceClient(
  serviceName: string,
): PropertyDecorator & ParameterDecorator {
  return Inject(getGrpcServiceInjectionToken(serviceName));
}
