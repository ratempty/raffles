// email/email.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  // 인증 코드 전송 요청 처리
  @Post('send')
  async sendVerificationEmail(@Body('email') email: string) {
    await this.emailService.sendVerificationEmail(email);
    return { message: '인증 이메일을 성공적으로 전송하였습니다.' };
  }

  // 인증 코드 검증 요청 처리
  @Post('verify')
  verifyEmailCode(@Body() body: { email: string; code: string }) {
    const { email, code } = body;
    const isValid = this.emailService.verifyEmailCode(email, code);
    if (isValid) {
      return { message: '인증에 성공하였습니다.' };
    } else {
      return { message: '인증에 실패하였습니다.', isValid };
    }
  }
}
