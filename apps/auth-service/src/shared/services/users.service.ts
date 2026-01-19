import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import {
  CreateUserRequest,
  CreateUserResponse,
  USERS_SERVICE_NAME,
  UsersServiceClient,
} from '@packages/grpc';
import { InjectGrpcServiceClient } from '@packages/nest-shared/grpc';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UsersService implements OnModuleInit {
  private usersServiceClient!: UsersServiceClient;

  constructor(
    @InjectGrpcServiceClient('users-service')
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.usersServiceClient =
      this.client.getService<UsersServiceClient>(USERS_SERVICE_NAME);
  }

  async createUser(request: CreateUserRequest): Promise<CreateUserResponse> {
    return firstValueFrom(this.usersServiceClient.createUser(request));
  }
}
