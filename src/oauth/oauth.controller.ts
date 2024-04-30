// oauth/oauth.controller.ts

import {
  Controller,
  Get,
  Header,
  HttpStatus,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { OAuthService } from './oauth.service';

@Controller('kakao')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}
  @Get('/oauth')
  @Header('Content-Type', 'text/html')
  redirectToKakaoAuth(@Res() res) {
    const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;
    const KAKAO_REDIRECT_URI = process.env.KAKAO_REDIRECT_URI;
    const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_REST_API_KEY}&redirect_uri=${KAKAO_REDIRECT_URI}`;
    res.redirect(HttpStatus.TEMPORARY_REDIRECT, kakaoAuthURL);
  }
  // 사용자 정보 불러오는 로직
  @Get('/oauth/kakao-auth')
  async getKakaoInfo(@Query() query: { code }) {
    const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;
    const KAKAO_REDIRECT_URI = process.env.KAKAO_REDIRECT_URI;
    const kakaoReturn = await this.oauthService.kakaoLogin(
      KAKAO_REST_API_KEY,
      KAKAO_REDIRECT_URI,
      query.code,
    );
<<<<<<< HEAD
    return { message: '카카오 로그인 되었습니다', kakaoReturn };
=======
    // return { message: '카카오 로그인 되었습니다', kakaoReturn };
    response.cookie('access_token', kakaoReturn.access_token, {
      path: '/',
      secure: true,
      sameSite: 'none',
    });
    response.redirect('https://www.didyouraffles.site/');

>>>>>>> 48da8c83feb9133c47c780c750741576ecdb50b3
  }
}
