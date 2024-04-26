// comments.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { CommentController } from './comments.controller';
import { CommentService } from './comments.service';
import { User } from '../users/entities/user.entity';
import { Market } from '../markets/entities/market.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, User, Market])],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentsModule {}
