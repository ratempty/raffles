// email/email.module.ts
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { UserModule } from 'src/users/users.module';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'smtp.naver.com',
          port: 587,
          ignoreTLS: false,
          secure: false,
          auth: {
            user: configService.get<string>('EMAIL_USER'),
            pass: configService.get<string>('EMAIL_PASS'),
          },
        },
        defaults: {
          from: '"응모했슈" <cic96@naver.com>', // 보내는 사람의 기본 이메일 주소를 설정합니다.
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
    UserModule,
  ],
  controllers: [EmailController],
  providers: [EmailService],
})
export class EmailModule {}
