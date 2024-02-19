import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { CacheModule } from '@nestjs/cache-manager';
import { ServeStaticModule } from "@nestjs/serve-static"
import path from 'path';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
  imports: [CacheModule.register(),
    ServeStaticModule.forRoot({
      rootPath: `${path}/uploads`,
      serveRoot: '/uploads'
      
  })
  ]
})
export class UsersModule {}
