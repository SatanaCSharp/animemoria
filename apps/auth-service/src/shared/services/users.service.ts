import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import {
  CreateUserRequest,
  CreateUserResponse,
  UsersServiceClient,
} from '@packages/grpc';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UsersService implements OnModuleInit {
  private usersServiceClient!: UsersServiceClient;

  constructor(@Inject('USERS_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit(): void {
    this.usersServiceClient =
      this.client.getService<UsersServiceClient>('UsersService');
  }

  async createUser(request: CreateUserRequest): Promise<CreateUserResponse> {
    return firstValueFrom(this.usersServiceClient.createUser(request));
  }
}
