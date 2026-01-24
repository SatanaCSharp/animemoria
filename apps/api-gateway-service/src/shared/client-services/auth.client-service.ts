import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import * as grpc from '@packages/grpc';
import { InjectGrpcServiceClient } from '@packages/nest-shared/grpc';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthClientService implements OnModuleInit {
  private authServiceClient!: grpc.AuthServiceClient;

  constructor(
    @InjectGrpcServiceClient('auth-service')
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.authServiceClient = this.client.getService<grpc.AuthServiceClient>(
      grpc.AUTH_SERVICE_NAME,
    );
  }

  async refreshTokensRequest(
    request: grpc.RefreshTokensRequest,
  ): Promise<grpc.RefreshTokensResponse> {
    return firstValueFrom(this.authServiceClient.refreshTokens(request));
  }
}
