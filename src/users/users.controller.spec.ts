import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { User } from './entities/user.entity';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    // 테스트 모듈을 생성합니다.
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController], // UserController를 컨트롤러로 사용합니다.
      providers: [
        {
          provide: UserService,
          useValue: {
            // UserService를 가짜 객체로 대체합니다.
            register: jest.fn(),
            login: jest.fn(),
            findOne: jest.fn(),
            findAll: jest.fn(),
            updateUser: jest.fn(),
            logout: jest.fn(),
            deleteUser: jest.fn(),
          },
        },
      ],
    })
      // AuthGuard('jwt')를 임의로 override하여 항상 canActivate를 true로 설정합니다.
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .compile();

    // 생성된 테스트 모듈에서 UserController와 UserService를 가져옵니다.
    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('회원가입을 처리해야 합니다', async () => {
    // 회원가입 로직의 결과를 설정합니다.
    const result = undefined; // 실제 결과값으로 수정되어야 합니다.
    jest.spyOn(service, 'register').mockImplementation(async () => result);

    // 회원가입을 호출하고 결과를 확인합니다.
    expect(
      await controller.register({
        email: 'test@example.com',
        password: 'password',
        passwordConfirm: 'password',
        nickName: 'nickname',
        name: 'name',
      }),
    ).toBe(result);
  });

  it('로그인을 처리해야 합니다', async () => {
    // 로그인 로직의 결과를 설정합니다.
    const result = {
      userId: 1,
      message: '로그인 성공',
      access_token: 'someToken',
      refresh_token: 'someRefreshToken',
    };

    jest.spyOn(service, 'login').mockImplementation(async () => result);

    // 가짜 Response 객체를 생성합니다.
    const mockResponse = {
      cookie: jest.fn(), // 쿠키 설정을 가짜로 처리합니다.
    } as unknown as Response;

    // 로그인을 호출하고 결과를 확인합니다.
    expect(
      await controller.login(
        {
          email: 'test@example.com',
          password: 'password',
        },
        mockResponse,
      ),
    ).toBe(result);

    // access_token을 쿠키에 저장하는 로직을 검증합니다.
    expect(mockResponse.cookie).toHaveBeenCalledWith(
      'Authorization', // 쿠키 이름
      result.access_token, // access_token 값
      {
        httpOnly: true, // 클라이언트에서 쿠키 수정 방지
        maxAge: 12 * 60 * 60 * 1000, // 12시간 (밀리초 단위)
      },
    );
  });

  it('특정 회원의 정보를 조회해야 합니다', async () => {
    // 조회 결과를 설정합니다.
    const result = new User(); // 실제 결과값으로 수정되어야 합니다.
    jest.spyOn(service, 'findOne').mockImplementation(async () => result);

    // 특정 회원의 정보를 조회하고 결과를 확인합니다.
    expect(await controller.findByEmail('1')).toBe(result);
  });

  it('모든 회원의 정보를 조회해야 합니다', async () => {
    // 조회 결과를 설정합니다.
    const result = [new User()]; // 실제 결과값으로 수정되어야 합니다.
    jest.spyOn(service, 'findAll').mockImplementation(async () => result);

    // 모든 회원의 정보를 조회하고 결과를 확인합니다.
    expect(await controller.findAll()).toBe(result);
  });

  it('회원 정보를 수정해야 합니다', async () => {
    // 회원 정보 수정 결과를 설정합니다.
    const result = {
      message: '회원 정보가 수정되었습니다. 다시 로그인 해주세요.',
      updatedUser: new User(),
    };
    jest
      .spyOn(service, 'updateUser')
      .mockImplementation(async () => result.updatedUser);

    // 회원 정보를 수정하고 결과를 확인합니다.
    expect(
      await controller.updateProfile(1, {
        email: 'updated@example.com',
        nickName: 'updatedNickname',
        name: 'updatedName',
      }),
    ).toEqual(result);
  });

  // 첫 번째 테스트 케이스: 토큰이 제공되지 않았을 때 UnauthorizedException을 발생시키는지 테스트합니다.
  it('토큰이 제공되지 않았을 때 UnauthorizedException을 발생시킨다', async () => {
    // controller.logout을 호출할 때 첫 번째 인자로 null을 전달하고, 이 경우 UnauthorizedException이 발생하는지 expect 함수로 검증합니다.
    // .rejects를 사용하여 비동기 함수가 reject될 것을 기대하고, .toThrow를 통해 특정 예외가 발생하는지 확인합니다.
    await expect(controller.logout(null)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  // 두 번째 테스트 케이스: 유효한 토큰으로 로그아웃 요청 시 성공 메시지를 반환하는지 테스트합니다.
  it('유효한 토큰으로 로그아웃 요청 시 성공 메시지를 반환한다', async () => {
    // 로그아웃이 성공적으로 이루어졌을 때 반환되어야 하는 기대 결과를 정의합니다.
    const expectedResult = { message: '로그아웃되었습니다.' };
    // controller.logout 함수를 호출하고, 'validToken'을 인자로 전달합니다. 이 함수의 반환값을 result 변수에 저장합니다.
    const result = await controller.logout('validToken');

    // 반환된 결과가 기대하는 결과와 동일한지 확인합니다.
    expect(result).toEqual(expectedResult);
    // userService의 logout 메소드가 'validToken' 인자를 받아 호출되었는지 확인합니다.
    // 이는 의존성 주입을 통해 주입된 userService의 logout 함수가 올바르게 호출되었는지 검증하는 과정입니다.
    expect(service.logout).toHaveBeenCalledWith('validToken'); // 로그아웃 메소드 호출 검증
  });

  it('회원 탈퇴를 처리해야 합니다', async () => {
    // UserService의 deleteUser 함수를 가짜 구현으로 대체합니다.
    jest.spyOn(service, 'deleteUser').mockImplementation(async () => {});

    // 회원 탈퇴를 호출하고 결과를 확인합니다.
    await expect(controller.remove(1)).resolves.toBeUndefined();
  });

  it('존재하지 않는 사용자 정보 수정 시 NotFoundException을 발생시켜야 합니다', async () => {
    // UserService의 updateUser 함수를 가짜 구현으로 대체하고 호출 시 반환값을 설정합니다.
    jest.spyOn(service, 'updateUser').mockImplementation(async () => undefined);

    // 존재하지 않는 사용자의 정보를 수정하고 NotFoundException이 발생하는지 확인합니다.
    await expect(
      controller.updateProfile(999, {
        email: 'nonexistent@example.com',
        nickName: 'nickname',
        name: 'name',
      }),
    ).rejects.toThrow(new NotFoundException('사용자를 찾을 수 없습니다.'));
  });

  it('로그아웃 시 토큰이 제공되지 않으면 UnauthorizedException을 발생시켜야 합니다', async () => {
    // 토큰이 제공되지 않은 상태로 로그아웃을 호출하고 UnauthorizedException이 발생하는지 확인합니다.
    await expect(controller.logout('')).rejects.toThrow(
      new UnauthorizedException('로그아웃을 위한 토큰이 제공되지 않았습니다.'),
    );
  });
});
