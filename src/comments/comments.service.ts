import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Market } from '../markets/entities/market.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Market)
    private marketRepository: Repository<Market>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  //댓글생성
  async createComment(
    marketId: number,
    userId: number, // 유저 ID를 파라미터로 추가
    content: string,
  ): Promise<Comment> {
    const market = await this.marketRepository.findOne({
      where: { id: marketId },
    });
    if (!market) {
      throw new Error('판매글이 없습니다.');
    }
    const user = await this.userRepository.findOne({ where: { id: userId } }); // 유저 찾기
    if (!user) {
      throw new Error('유저가 없습니다.'); // 유저가 없으면 에러 발생
    }
    const newComment = this.commentRepository.create({
      user, // 댓글 작성자로 유저 인스턴스 사용
      content,
      market,
    });
    return this.commentRepository.save(newComment);
  }

  // 댓글 조회
  async getCommnet(marketId: number) {
    const market = await this.marketRepository.findOne({
      where: {
        id: marketId,
      },
      relations: ['comment'],
    });
    if (!market) {
      throw new Error('판매글이 없습니다');
    }
    return market.comment;
  }

  //댓글수정aaa
  async updateComment(
    commentId: number,
    userId: number,
    content: string,
  ): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['user'], // 댓글 작성자 정보를 가져오기 위해 관계 설정 추가
    });
    if (!comment) {
      throw new Error('댓글이 없습니다.');
    }
    if (comment.user.id !== userId) {
      throw new Error('댓글을 수정할 권한이 없습니다.'); // 댓글 작성자와 현재 유저가 다를 경우 에러 처리
    }
    comment.content = content; // 댓글 내용 수정
    return this.commentRepository.save(comment); // 수정된 댓글 저장
  }
  //댓글삭제
  async deleteComment(commentId: number, userId: number): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['user'], // 댓글 작성자 정보를 가져오기 위해 관계 설정 추가
    });
    if (!comment) {
      throw new Error('댓글이 없습니다.');
    }
    if (comment.user.id !== userId) {
      throw new Error('댓글을 삭제할 권한이 없습니다.'); // 댓글 작성자와 현재 유저가 다를 경우 에러 처리
    }
    await this.commentRepository.remove(comment); // 댓글 삭제
  }
}
