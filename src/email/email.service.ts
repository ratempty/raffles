import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  private readonly verificationCodes = new Map<string, string>(); // 이메일과 인증 코드를 매핑합니다.

  constructor(private readonly mailerService: MailerService) {}

  // 인증 코드 생성과 이메일 전송
  async sendVerificationEmail(email: string): Promise<void> {
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6자리의 랜덤 코드 생성
      this.verificationCodes.set(email, code); // 생성된 코드를 저장
      // console.log('emailcode : ', code);

      await this.mailerService.sendMail({
        to: email, // 받는 사람의 이메일 주소
        subject: '회원가입 인증 코드', // 메일 제목
        text: `인증 코드는 ${code}입니다.`, // 메일 내용
      });
    } catch (error) {
      // 이메일 전송 실패 처리
      console.log(error);

      throw new InternalServerErrorException(
        '이메일 전송 중 오류가 발생했습니다. 나중에 다시 시도해주세요.',
      );
    }
  }

  // 인증 코드 검증
  verifyEmailCode(email: string, code: string): boolean {
    const storedCode = this.verificationCodes.get(email);
    return storedCode === code; // 저장된 코드와 사용자가 입력한 코드가 일치하는지 확인
  }
}
