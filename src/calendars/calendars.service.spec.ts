import { Test, TestingModule } from '@nestjs/testing';
import { CalendarService } from './calendars.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Calendar } from './entities/calendar.entity';
import { User } from '../users/entities/user.entity';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

// Repository를 위한 mock factory 함수
const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOneBy: jest.fn(),
  find: jest.fn(),
  merge: jest.fn(),
  delete: jest.fn(),
});

describe('CalendarService', () => {
  let service: CalendarService;
  let calendarRepository: Repository<Calendar>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarService,
        {
          provide: getRepositoryToken(Calendar),
          useFactory: mockRepository,
        },
        {
          provide: getRepositoryToken(User),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CalendarService>(CalendarService);
    calendarRepository = module.get<Repository<Calendar>>(
      getRepositoryToken(Calendar),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('create', () => {
    it('사용자를 찾을 수 없을 때 UnauthorizedException을 발생시킨다', async () => {
      // 사용자를 찾을 때의 예외 상황을 테스트합니다.
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);
      await expect(service.create('Test Memo', new Date(), 1)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('새로운 메모를 생성한다', async () => {
      // 새로운 메모를 생성할 때의 테스트입니다.
      // userRepository와 calendarRepository의 메서드를 모킹합니다.
      (userRepository.findOneBy as jest.Mock).mockResolvedValue(null);
      (calendarRepository.create as jest.Mock).mockImplementation(
        (memo) => memo,
      );
      (calendarRepository.save as jest.Mock).mockResolvedValue({
        id: 1,
        memo: 'Test Memo',
      });

      const result = await service.create('Test Memo', new Date(), 1);
      // 생성된 메모와 예상되는 결과를 비교합니다.
      expect(result).toEqual({ id: 1, memo: 'Test Memo' });
      // create와 save 메서드가 호출되었는지 확인합니다.
      expect(calendarRepository.create).toHaveBeenCalled();
      expect(calendarRepository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('모든 메모를 조회한다', async () => {
      // 모든 메모를 조회할 때의 테스트입니다.
      calendarRepository.find = jest.fn().mockResolvedValue(['memo1', 'memo2']);

      const result = await service.findAll();
      // 예상되는 결과와 실제 결과를 비교합니다.
      expect(result).toEqual(['memo1', 'memo2']);
      // find 메서드가 호출되었는지 확인합니다.
      expect(calendarRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('메모를 찾을 수 없을 때 NotFoundException을 발생시킨다', async () => {
      // 메모를 찾을 때의 예외 상황을 테스트합니다.
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);
      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });

    it('메모 상세 정보를 조회한다', async () => {
      // 메모 상세 정보를 조회할 때의 테스트입니다.
      jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);
      // 테스트에 사용할 가짜 메모 객체를 생성합니다.
      const memoDetail = {
        id: 1,
        memo: 'Test Memo',
      };
      // findOne 메서드가 가짜 메모 객체를 반환하도록 모킹합니다.
      service.findOne = jest.fn().mockResolvedValue(memoDetail);
      // findOneBy 메서드가 호출되었는지 확인하기 위해 spyOn을 사용합니다.
      const result = await service.findOne(1);
      // 반환된 결과와 예상되는 결과를 비교합니다.
      expect(result).toEqual(memoDetail);
      // findOneBy 메서드가 호출되었는지 확인합니다.
      expect(calendarRepository.findOneBy).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('메모를 수정한다', async () => {
      // 메모를 수정할 때의 테스트입니다.
      // 수정 전 메모 객체를 생성합니다.
      const calendar = { id: 1, memo: 'Test Memo' };
      // findOne 메서드가 수정 전 메모 객체를 반환하도록 모킹합니다.
      service.findOne = jest.fn().mockResolvedValue(calendar);
      // save 메서드가 수정된 메모 객체를 반환하도록 모킹합니다.
      calendarRepository.save = jest.fn().mockResolvedValue({
        ...calendar,
        memo: 'Updated Memo',
      });

      const result = await service.update(1, {
        memo: 'Updated Memo',
        memoDate: new Date('2024-04-10'), // 문자열을 Date 객체로 변환
      });

      // 수정된 메모와 예상되는 결과를 비교합니다.
      expect(result.memo).toEqual('Updated Memo');
      // save 메서드가 호출되었는지 확인합니다.
      expect(calendarRepository.save).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('메모를 삭제한다', async () => {
      // 메모를 삭제할 때의 테스트입니다.
      // findOne 메서드가 가짜 메모 객체를 반환하도록 모킹합니다.
      service.findOne = jest.fn().mockResolvedValue({ id: 1 });
      // delete 메서드가 호출되었는지 확인하기 위해 spyOn을 사용합니다.
      await service.delete(1);
      // delete 메서드가 호출되었는지 확인합니다.
      expect(calendarRepository.delete).toHaveBeenCalledWith({ id: 1 });
    });
  });
});
