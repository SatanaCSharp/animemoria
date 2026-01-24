import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import * as grpc from '@packages/grpc';
import { InjectGrpcServiceClient } from '@packages/nest-shared/grpc';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UsersClientService implements OnModuleInit {
  private usersServiceClient!: grpc.UsersServiceClient;

  constructor(
    @InjectGrpcServiceClient('users-service')
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.usersServiceClient = this.client.getService<grpc.UsersServiceClient>(
      grpc.USERS_SERVICE_NAME,
    );
  }

  async createUser(
    request: grpc.CreateUserRequest,
  ): Promise<grpc.CreateUserResponse> {
    return firstValueFrom(this.usersServiceClient.createUser(request));
  }
}
