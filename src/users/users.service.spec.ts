import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRaffle } from '../raffles/entities/userRaffle.entity';
import { HttpModule } from '@nestjs/axios';
import {
  NotFoundException,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EmailService } from '../email/email.service'; // EmailService를 임포트합니다.

jest.mock('bcrypt', () => ({
  ...jest.requireActual('bcrypt'),
  compare: jest.fn(),
}));

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let userRaffleRepository: Repository<UserRaffle>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        UserService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'mockedToken'),
          },
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserRaffle),
          useClass: Repository,
        },
        {
          provide: EmailService, // EmailService 제공자를 설정합니다.
          useValue: {
            sendVerificationEmail: jest.fn(), // sendVerificationEmail 메소드를 모킹합니다.
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    userRaffleRepository = module.get<Repository<UserRaffle>>(
      getRepositoryToken(UserRaffle),
    );

    userRepository.findOne = jest.fn();
    userRepository.findOneBy = jest.fn();
    userRepository.create = jest.fn().mockImplementation((user) => user);
    userRaffleRepository.find = jest.fn();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if user with given email already exists', async () => {
      userRepository.findOneBy = jest
        .fn()
        .mockResolvedValueOnce({ email: 'test@example.com' });

      await expect(
        service.register(
          'test@example.com',
          'password',
          'password',
          'testNickname',
          'Test User',
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if password and passwordConfirm do not match', async () => {
      await expect(
        service.register(
          'test@example.com',
          'password',
          'password2',
          'testNickname',
          'Test User',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should login user with correct credentials', async () => {
      // 가짜 유저 객체를 생성하여 모킹에 사용합니다.
      const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        // User 타입에 필요한 추가적인 속성들을 가짜 값으로 포함시킵니다.
        nickName: 'testNickName',
        name: 'Test Name',
        clientId: 'testClientId',
        kakaoId: 'testKakaoId',
        // 나머지 필요한 속성들도 가짜 값으로 추가...
      } as User; // 'as User'를 사용하여 이 객체가 User 타입임을 명시적으로 지정합니다.

      // userRepository.findOne 메소드를 모킹하여 가짜 유저 객체를 반환하도록 설정합니다.
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      // bcrypt.compare 함수를 모킹하여 항상 true를 반환하도록 설정합니다. (비밀번호 검증 성공)
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // login 메소드를 호출하여 로그인을 시도합니다.
      const result = await service.login('test@example.com', 'password');

      // 예상 결과를 확인합니다.
      expect(result.userId).toEqual(mockUser.id);
      expect(result.message).toEqual('로그인 되었습니다'); // 로그인 성공 메시지를 확인합니다.
      expect(result.access_token).toBeDefined(); // 접근 토큰이 정의되어 있는지 확인합니다.
      expect(result.refresh_token).toBeDefined(); // 리프레시 토큰이 정의되어 있는지 확인합니다.
    });

    it('should throw UnauthorizedException if email is incorrect', async () => {
      // userRepository.findOne 메소드를 모킹하여 null을 반환하도록 설정합니다. (사용자를 찾지 못함)
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      // 잘못된 이메일로 로그인을 시도하고 예외를 확인합니다.
      await expect(
        service.login('wrong@example.com', 'password'),
      ).rejects.toThrow(UnauthorizedException); // UnauthorizedException이 예상된대로 발생하는지 확인합니다.
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      // 가짜 유저 객체를 생성하여 모킹에 사용합니다.
      const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        // User 타입에 필요한 추가적인 속성들을 가짜 값으로 포함시킵니다.
        nickName: 'testNickName',
        name: 'Test Name',
        clientId: 'testClientId',
        kakaoId: 'testKakaoId',
        // 나머지 필요한 속성들도 가짜 값으로 추가...
      } as User; // 'as User'를 사용하여 이 객체가 User 타입임을 명시적으로 지정합니다.

      // userRepository.findOne 메소드를 모킹하여 가짜 유저 객체를 반환하도록 설정합니다.
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      // bcrypt.compare 함수를 모킹하여 항상 false를 반환하도록 설정합니다. (비밀번호 검증 실패)
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // 잘못된 비밀번호로 로그인을 시도하고 예외를 확인합니다.
      await expect(
        service.login('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException); // UnauthorizedException이 예상된대로 발생하는지 확인합니다.
    });
  });

  describe('findByEmail', () => {
    it('should return a user for a given email', async () => {
      // 예상되는 반환 값 설정
      const expectedUser = { email: 'test@example.com', id: 1 };

      // userRepository.findOneBy 메소드를 모킹하여 예상되는 반환 값을 반환하도록 설정합니다.
      userRepository.findOneBy = jest.fn().mockResolvedValueOnce(expectedUser);

      // findByEmail 메소드를 호출하여 특정 이메일에 해당하는 사용자를 찾습니다.
      const result = await service.findByEmail('test@example.com');

      // 예상 결과와 실제 결과를 비교하고 userRepository.findOneBy 메소드가 올바르게 호출되었는지 확인합니다.
      expect(result).toEqual(expectedUser); // 예상된 사용자 객체가 반환되는지 확인합니다.
      expect(userRepository.findOneBy).toHaveBeenCalledWith({
        email: 'test@example.com',
      }); // userRepository.findOneBy가 특정 이메일로 호출되었는지 확인합니다.
    });
  });

  describe('findOne', () => {
    it('should return a user for a given id', async () => {
      // 예상되는 반환 값 설정
      const expectedUser = { email: 'test@example.com', id: 1 };

      // userRepository.findOneBy 메소드를 모킹하여 예상되는 반환 값을 반환하도록 설정합니다.
      userRepository.findOneBy = jest.fn().mockResolvedValueOnce(expectedUser);

      // findOne 메소드를 호출하여 특정 ID에 해당하는 사용자를 찾습니다.
      const result = await service.findOne(1);

      // 예상 결과와 실제 결과를 비교하고 userRepository.findOneBy 메소드가 올바르게 호출되었는지 확인합니다.
      expect(result).toEqual(expectedUser); // 예상된 사용자 객체가 반환되는지 확인합니다.
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 1 }); // userRepository.findOneBy가 특정 ID로 호출되었는지 확인합니다.
    });

    it('should throw NotFoundException if no user is found', async () => {
      // userRepository.findOneBy 메소드를 모킹하여 null을 반환하도록 설정합니다. (사용자를 찾지 못함)
      userRepository.findOneBy = jest.fn().mockResolvedValueOnce(null);

      // findOne 메소드를 호출하여 예외를 확인합니다.
      await expect(service.findOne(999)).rejects.toThrow(
        '해당 유저가 없습니다',
      ); // NotFoundException이 예상된대로 발생하는지 확인합니다.
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      // 예상되는 사용자 배열 설정
      const expectedUsers = [
        { email: 'test1@example.com', id: 1 },
        { email: 'test2@example.com', id: 2 },
      ];

      // userRepository.find 메소드를 모킹하여 예상되는 사용자 배열을 반환하도록 설정합니다.
      userRepository.find = jest.fn().mockResolvedValueOnce(expectedUsers);

      // findAll 메소드를 호출하여 모든 사용자를 찾습니다.
      const result = await service.findAll();

      // 예상 결과와 실제 결과를 비교하고 userRepository.find 메소드가 올바르게 호출되었는지 확인합니다.
      expect(result).toEqual(expectedUsers); // 예상된 사용자 배열이 반환되는지 확인합니다.
      expect(userRepository.find).toHaveBeenCalled(); // userRepository.find가 호출되었는지 확인합니다.
    });
  });

  describe('updateUser', () => {
    it('should update user details', async () => {
      // 원래 사용자 데이터
      const originalUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        nickName: 'Tester',
      };

      // 업데이트된 사용자 데이터
      const updatedUser = { ...originalUser, name: 'Updated Test User' };

      // userRepository.findOneBy 메소드를 모킹하여 두 번의 호출에 대해 각각 원래 사용자 및 업데이트된 사용자를 반환하도록 설정합니다.
      userRepository.findOneBy = jest
        .fn()
        .mockResolvedValueOnce(originalUser) // 첫 번째 호출에 대한 모킹
        .mockResolvedValueOnce(updatedUser); // 두 번째 호출에 대한 모킹

      // userRepository.update 메소드를 모킹하여 null을 반환하도록 설정합니다.
      userRepository.update = jest.fn().mockResolvedValueOnce(null);

      // updateUser 메소드를 호출하여 사용자를 업데이트합니다.
      const result = await service.updateUser(1, {
        email: 'test@example.com',
        name: 'Updated Test User',
        nickName: 'Tester',
      });

      // 업데이트된 사용자 데이터가 예상대로 변경되었는지 확인합니다.
      expect(result.name).toEqual('Updated Test User'); // 업데이트된 이름이 예상된 대로 변경되었는지 확인합니다.
      expect(userRepository.update).toHaveBeenCalled(); // userRepository.update가 호출되었는지 확인합니다.
    });

    it('should throw NotFoundException if user does not exist', async () => {
      // userRepository.findOneBy 메소드를 모킹하여 사용자를 찾지 못하도록 설정합니다. (null 반환)
      userRepository.findOneBy = jest.fn().mockResolvedValueOnce(null);

      // deleteUser 메소드를 호출하여 예외가 발생하는지 확인합니다.
      await expect(
        service.updateUser(999, {
          email: 'nonexistent@example.com',
          name: 'Nonexistent User',
          nickName: 'NoOne',
        }),
      ).rejects.toThrow('사용자를 찾을 수 없습니다.'); // NotFoundException이 예상된대로 발생하는지 확인합니다.
    });
  });

  describe('logout', () => {
    it('throws an error if token is not provided', async () => {
      await expect(service.logout('')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      // 삭제할 사용자 데이터
      const user = { id: 1, email: 'test@example.com' };

      // userRepository.findOneBy 메소드를 모킹하여 삭제할 사용자 데이터를 반환하도록 설정합니다.
      userRepository.findOneBy = jest.fn().mockResolvedValueOnce(user);

      // userRepository.delete 메소드를 모킹하여 null을 반환하도록 설정합니다.
      userRepository.delete = jest.fn().mockResolvedValueOnce(null);

      // deleteUser 메소드를 호출하여 사용자를 삭제합니다.
      await expect(service.deleteUser(1)).resolves.not.toThrow();

      // userRepository.delete가 삭제할 사용자 데이터와 함께 호출되었는지 확인합니다.
      expect(userRepository.delete).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      // userRepository.findOneBy 메소드를 모킹하여 사용자를 찾지 못하도록 설정합니다. (null 반환)
      userRepository.findOneBy = jest.fn().mockResolvedValueOnce(null);

      // deleteUser 메소드를 호출하여 사용자를 삭제하면 NotFoundException이 발생하는지 확인합니다.
      await expect(service.deleteUser(999)).rejects.toThrow(
        '사용자를 찾을 수 없습니다.',
      ); // NotFoundException이 예상된대로 발생하는지 확인합니다.
    });
  });
});
