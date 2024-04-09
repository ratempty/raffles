// oauth/oauth.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class OAuthService {
  constructor(
    private readonly http: HttpService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // 카카오 로그인 메소드
  async kakaoLogin(
    KAKAO_REST_API_KEY: string,
    KAKAO_REDIRECT_URI: string,
    code: string,
  ): Promise<{ message: string; access_token: string; user_id: number }> {
    const config = {
      grant_type: 'authorization_code',
      client_id: KAKAO_REST_API_KEY,
      redirect_uri: KAKAO_REDIRECT_URI,
      code,
    };

    const params = new URLSearchParams(config).toString();
    const tokenHeaders = {
      'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    };
    const tokenUrl = `https://kauth.kakao.com/oauth/token?${params}`;

    // 카카오로부터 access token 요청
    const tokenRes = await firstValueFrom(
      this.http.post(tokenUrl, '', { headers: tokenHeaders }),
    );

    // AccessToken 받기
    const accessToken = tokenRes.data.access_token;

    // 카카오로부터 사용자 정보 요청
    const userInfoUrl = `https://kapi.kakao.com/v2/user/me`;
    const userInfoHeaders = {
      Authorization: `Bearer ${accessToken}`,
    };

    const userInfoRes = await firstValueFrom(
      this.http.get(userInfoUrl, { headers: userInfoHeaders }),
    );
    console.log('User Info:', userInfoRes.data);
    const data = userInfoRes.data;

    // 카카오 사용자 정보를 로컬 DB에 저장
    let user = await this.userRepository.findOne({
      where: { kakaoId: data.id },
    });
    if (!user) {
      // 카카오 사용자가 사이트에 가입되어 있지 않은 경우, 자동으로 가입시킴
      user = new User();
      user.kakaoId = data.id;
      user.email = data.kakao_account.email; // 카카오에서 제공하는 이메일 정보 활용
      user.name = data.kakao_account.name; // 카카오에서 제공하는 이름 정보 활용

      await this.userRepository.save(user);
    }

    // 여기서는 간단히 JWT 토큰 생성하여 반환
    const accessTokenPayload = {
      email: user.email,
      sub: user.id,
      token_type: 'access',
    };

    const newAccessToken = this.jwtService.sign(accessTokenPayload, {
      expiresIn: '15m',
    });
    console.log('ChangeAccessToken : ', newAccessToken);

    return {
      message: '로그인 되었습니다',
      access_token: newAccessToken,
      user_id: user.id,
    };
  }
}
