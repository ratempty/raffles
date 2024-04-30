import {
  Body,
  Controller,
  Post,
  Param,
  UseGuards,
  Request,
  Patch,
  Delete,
  Get,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommentService } from './comments.service';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get('markets/:marketId')
  async getCommentsByMarketId(@Param('marketId') marketId: string) {
    const parsedMarketId = parseInt(marketId, 10);
    return this.commentService.getCommnet(parsedMarketId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('markets/:marketId')
  async create(
    @Param('marketId') marketId: string,
    @Body('content') content: string,
    @Request() req: any,
  ) {
    const numericMarketId = parseInt(marketId, 10);
    if (isNaN(numericMarketId)) {
      throw new Error('Comment ID는 숫자여야 합니다');
    }

    const userId = req.user.id;

    const createdComment = await this.commentService.createComment(
      numericMarketId,
      userId,
      content,
    );
    return {
      message: '댓글이 성공적으로 달렸습니다.',
      comment: createdComment,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('markets/:commentId')
  async update(
    @Param('commentId') commentId: string,
    @Body('content') content: string,
    @Request() req: any,
  ) {
    const numericCommentId = parseInt(commentId, 10);
    if (isNaN(numericCommentId)) {
      throw new Error('Comment ID는 숫자여야 합니다');
    }

    const userId = req.user.id;

    const updatedComment = await this.commentService.updateComment(
      numericCommentId,
      userId,
      content,
    );
    return {
      message: '댓글이 성공적으로 수정되었습니다.',
      comment: updatedComment,
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('markets/:commentId')
  async delete(@Param('commentId') commentId: string, @Request() req: any) {
    const numericCommentId = parseInt(commentId, 10);
    if (isNaN(numericCommentId)) {
      throw new Error('Comment ID는 숫자여야 합니다');
    }

    const userId = req.user.id;

    await this.commentService.deleteComment(numericCommentId, userId);
    return { message: '댓글이 성공적으로 삭제되었습니다.' };
  }
}
