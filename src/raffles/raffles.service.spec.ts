import { Repository } from 'typeorm';
import { RafflesService } from './raffles.service';
import { Raffle } from './entities/raffle.entity';
import { UserRaffle } from './entities/userRaffle.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import axios from 'axios';

describe('rafflesService', () => {
  let rafflesservice: RafflesService;
  let raffleRepositoryMock: Partial<
    Record<keyof Repository<Raffle>, jest.Mock>
  >;
  let userRaffleRepositoryMock: Partial<
    Record<keyof Repository<UserRaffle>, jest.Mock>
  >;

  beforeEach(async () => {
    raffleRepositoryMock = {
      save: jest.fn(),
      findBy: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn(),
        getMany: jest.fn(),
      })),
    };

    userRaffleRepositoryMock = {
      find: jest.fn(),
      findBy: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        RafflesService,
        {
          provide: getRepositoryToken(Raffle),
          useValue: raffleRepositoryMock,
        },
        {
          provide: getRepositoryToken(UserRaffle),
          useValue: userRaffleRepositoryMock,
        },
      ],
    }).compile();

    console.log = jest.fn();
    rafflesservice = moduleRef.get<RafflesService>(RafflesService);
  });

  it('should get soon raffles', async () => {
    const queryResult = [
      {
        id: 2067,
        subName: '나이키 에어 맥스 95 뉴욕',
        brand: 'NIKE',
        imgUrl:
          'https://static.shoeprize.com/Raffle/thumb/FZ4125-061-shoeprize-NIKE-AIR-MAX-95-NEW-YORK-406601-1711068077177.jpg',
        shoeCode: 'FZ4125-061',
        raffleStartDate: '2024-04-10T05:00:00.000Z',
        raffleEndDate: '2024-04-20T05:59:59.000Z',
      },
    ];

    raffleRepositoryMock.createQueryBuilder.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(queryResult),
    });

    const fakeRaffles = queryResult.map((soonRaffle) => ({
      id: soonRaffle.id,
      subName: soonRaffle.subName,
      brand: soonRaffle.brand,
      imgUrl: soonRaffle.imgUrl,
      shoeCode: soonRaffle.shoeCode,
    }));

    const raffles = await rafflesservice.getRaffles();

    expect(raffles[1]).toEqual(fakeRaffles);
    expect(raffleRepositoryMock.createQueryBuilder).toHaveBeenCalledTimes(2);
    expect(raffleRepositoryMock.createQueryBuilder).toHaveBeenCalledWith(
      'raffle',
    );
  });

  it('should get shoe raffles', async () => {
    const shoeCode = 'FZ4125-060';
    const result = [
      {
        id: 2065,
        name: 'NIKE AIR MAX 95 ATLANTA',
        subName: '나이키 에어 맥스 95 애틀랜타',
        raffleUrl:
          'https://feature.com/products/air-max-95-prm-anthracite-metallic-silver-nike',
        shoeCode: 'FZ4125-060',
        brand: 'NIKE',
        relPrice: '$185',
        imgUrl:
          'https://static.shoeprize.com/Raffle/thumb/FZ4125-060-shoeprize-NIKE-AIR-MAX-95-ATLANTA-406581-1711067312509.jpg',
        raffleStartDate: '2024-03-25T15:24:06.000Z',
        raffleEndDate: '2024-04-04T05:00:00.000Z',
      },
      {
        id: 2066,
        name: 'NIKE AIR MAX 95 ATLANTA',
        subName: '나이키 에어 맥스 95 애틀랜타',
        raffleUrl:
          'https://socialstatuspgh.runfair.com/ko-KR/us/nike-air-max-95-premium-atl',
        shoeCode: 'FZ4125-060',
        brand: 'NIKE',
        relPrice: '$185',
        imgUrl:
          'https://static.shoeprize.com/Raffle/thumb/FZ4125-060-shoeprize-NIKE-AIR-MAX-95-ATLANTA-406581-1711067312509.jpg',
        raffleStartDate: '2024-03-28T05:00:00.000Z',
        raffleEndDate: '2024-04-05T05:59:59.000Z',
      },
    ];

    raffleRepositoryMock.findBy.mockReturnValue(result);

    const raffles = await rafflesservice.getRaffle(shoeCode);

    expect(raffles).toEqual(result);
    expect(raffleRepositoryMock.findBy).toHaveBeenCalledTimes(1);
    expect(raffleRepositoryMock.findBy).toHaveBeenCalledWith({ shoeCode });
  });

  it('should get UserRaffle', async () => {
    const userId = 1;
    const userRaffleResult = [
      {
        id: 1,
        userId: 1,
        raffleId: 123,
        createdAt: '2024-04-14T03:43:41.384Z',
      },
    ];

    const fakeRaffle = {
      id: 123,
      name: 'AIR JORDAN 5 RETRO SE SAIL',
      subName: '에어 조던 5 레트로 SE 세일',
      raffleUrl:
        'https://a-ma-maniere.runfair.com/en-US/us/womens-air-jordan-5-se-sail',
      shoeCode: 'FN7405-100',
      brand: 'JORDAN',
      relPrice: '$210',
      imgUrl:
        'https://static.shoeprize.com/Raffle/thumb/FN7405-100-shoeprize-AIR-JORDAN-5-RETRO-SE-SAIL-118994-1711808412767.jpg',
      raffleStartDate: null,
      raffleEndDate: '2024-04-14T05:00:00.000Z',
      releaseMarketIcon:
        'https://static.shoeprize.com/site/icon/A_MA_MANIERE-6dc7ecca-4c51-11ec-8677-026203d2c2d6.jpg',
      releaseMarketName: 'A MA MANIERE',
    };

    userRaffleRepositoryMock.find.mockReturnValue(userRaffleResult);
    raffleRepositoryMock.findBy.mockReturnValue(fakeRaffle);

    const expectedResult = [
      {
        raffle: fakeRaffle,
        createdAt: '2024-04-14T03:43:41.384Z',
      },
    ];

    const result = await rafflesservice.getUserRaffle(userId);

    expect(result).toEqual(expectedResult);
    expect(userRaffleRepositoryMock.find).toHaveBeenCalledTimes(1);
    expect(userRaffleRepositoryMock.find).toHaveBeenCalledWith({
      where: { userId },
    });
    expect(raffleRepositoryMock.findBy).toHaveBeenCalledTimes(1);
    expect(raffleRepositoryMock.findBy).toHaveBeenCalledWith({
      id: userRaffleResult[0].raffleId,
    });
  });

  it('should make UserRaffle', async () => {
    const userId = 1;
    const raffleId = 1231;
    const result = {
      id: 1,
      userId: 1,
      raffleId: 1231,
    };

    userRaffleRepositoryMock.findBy.mockReturnValue([]);
    userRaffleRepositoryMock.save.mockReturnValue(result);

    const userRaffle = await rafflesservice.makeUserRaffle(raffleId, userId);

    expect(userRaffle).toEqual(result);
    expect(userRaffleRepositoryMock.findBy).toHaveBeenCalledTimes(1);
    expect(userRaffleRepositoryMock.findBy).toHaveBeenCalledWith({
      raffleId,
      userId,
    });

    expect(userRaffleRepositoryMock.save).toHaveBeenCalledTimes(1);
    expect(userRaffleRepositoryMock.save).toHaveBeenCalledWith({
      raffleId,
      userId,
    });
  });

  it('Exist UserRaffle', async () => {
    const userId = 1;
    const raffleId = 1231;

    const existUserRaffle = {
      id: 1,
      userId: 1,
      raffleId: 1231,
    };

    userRaffleRepositoryMock.findBy.mockReturnValue([existUserRaffle]);

    await expect(
      rafflesservice.makeUserRaffle(raffleId, userId),
    ).rejects.toThrow(ConflictException);
  });

  it('should delete userRaffle', async () => {
    const userId = 1;
    const raffleId = 1231;
    const result = {
      id: 1,
      userId: 1,
      raffleId: 1231,
    };

    userRaffleRepositoryMock.findBy.mockReturnValue(result);
    userRaffleRepositoryMock.delete.mockReturnValue(undefined);

    const userRaffle = await rafflesservice.deleteUserRaffle(raffleId, userId);

    expect(userRaffle).toEqual(undefined);
    expect(userRaffleRepositoryMock.findBy).toHaveBeenCalledTimes(1);
    expect(userRaffleRepositoryMock.findBy).toHaveBeenCalledWith({
      raffleId,
      userId,
    });

    expect(userRaffleRepositoryMock.delete).toHaveBeenCalledTimes(1);
    expect(userRaffleRepositoryMock.delete).toHaveBeenCalledWith({
      raffleId,
      userId,
    });
  });

  it('non-exist userRaffle', async () => {
    const userId = 1;
    const raffleId = 1231;

    userRaffleRepositoryMock.findBy.mockReturnValue([]);

    await expect(
      rafflesservice.deleteUserRaffle(raffleId, userId),
    ).rejects.toThrow(NotFoundException);
  });

  it('should scrap url', async () => {
    const headers = {
      accept: '*/*',
      'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      'content-type': 'application/json',
      referer: 'https://www.shoeprize.com/discover/',
      'sec-ch-ua':
        '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    };

    const today = new Date();
    today.setDate(today.getDate());
    const formatDate = today.toISOString().slice(0, 10).replace(/-/g, '');

    const params = {
      page: 1,
      page_size: 50,
      is_end: false,
      ordering: 'end_time,-id',
      type: 1,
      released_date: formatDate,
    };

    jest.spyOn(axios, 'get').mockResolvedValue({
      data: {
        results: [
          { product: { id: 114564 } },
          { product: { id: 408169 } },
          { product: { id: 408209 } },
        ],
      },
    });

    await rafflesservice.scrapUrl();

    expect(axios.get).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledWith(
      'https://www.shoeprize.com/api/v2/releases/',
      { headers, params },
    );
  });

  it('error scrap url', async () => {
    const mockError = new Error('Request failed');
    jest.spyOn(axios, 'get').mockRejectedValue(mockError);

    await expect(rafflesservice.scrapUrl()).rejects.toThrow('Request failed');

    jest.restoreAllMocks();
  });

  it('should scrap info with save to repository', async () => {
    const productIdArr = [114564];

    const axiosSpy = jest.spyOn(axios, 'get').mockResolvedValue({
      data: {
        results: [
          {
            id: 146473,
            uuid: 'd091dd6c-3355-4123-b49f-03f78ce12f71',
            type: 1,
            isEvent: false,
            method: '당첨 문자 발송',
            url: 'https://grandstage.a-rt.com/product/new?prdtNo=1020100891&page=1',
            price: '￦169,000',
            releaseMarket: {
              name: 'ABC마트 GS 경기신세계점',
              permalink: 'abc-gs-gyeonggi-ssg',
              icon: 'https://static.shoeprize.com/site/icon/ABC%EB%A7%88%ED%8A%B8_GS_%EA%B2%BD%EA%B8%B0%EC%8B%A0%EC%84%B8%EA%B3%84%EC%A0%90-c4fc8a5e-f155-11ee-855e-0219d052041b.jpeg',
              phone: '0215889667',
              mapUrl: 'https://naver.me/5wAqA3X9',
              address:
                '경기 용인시 수지구 포은대로 536 신세계백화점 경기점 4층, ABC-MART GS 경기신세계점',
              channels: [
                {
                  type: 'instagram',
                  link: 'https://www.instagram.com/abcmartkr_grandstage/',
                  typeName: '인스타그램',
                },
              ],
              isUseApp: false,
            },
            dateInfo: '4월 3일 (수) 10:00 ~ 4월 9일 (화) 23:50',
            announcedTimestamp: 1712797200000,
            closedTimestamp: 1712674200000,
            startTimestamp: 1712106000000,
            endTimestamp: 1712674200000,
            product: {
              id: 114564,
              brandName: 'ASICS',
              name: '아식스 젤-카야노 14 크림 블랙',
              nameEn: 'ASICS GEL-KAYANO 14 CREAM BLACK',
              thumb:
                'https://static.shoeprize.com/Raffle/thumb/1201A019-108-shoeprize-ASICS-GEL-KAYANO-14-CREAM-BLACK-114564-1685067716736.jpg',
              code: '1201A019-108',
            },
            shippingMethod: '매장 수령',
            payMethod: '오프라인 구매',
            salePrice: '169000.00',
            salePriceCurrency: 'KRW',
            salePriceCurrencySymbol: '￦',
            region: '한국',
            isUndefinedStartTime: false,
            isUndefinedEndTime: false,
            purchaseStartedTimestamp: 1712797200000,
            purchaseStoppedTimestamp: 1712847000000,
            mode: 'online',
            isUndefinedPurchaseStartedAt: false,
            isUndefinedPurchaseStoppedAt: false,
            isUndefinedAnnouncedAt: false,
            completedTimestamp: 1712847599999,
            isExpired: false,
            isInHouse: false,
            isDomesticSite: true,
          },
        ],
      },
    });

    await rafflesservice.scrapInfo(productIdArr);

    expect(axiosSpy).toHaveBeenCalledTimes(1);

    jest.restoreAllMocks();
  });

  it('raffle subname has 후디,온라인 선착순 and raffle has not raffleStartDate', async () => {
    const productIdArr = [114564];

    const axiosSpy = jest.spyOn(axios, 'get').mockResolvedValue({
      data: {
        results: [
          {
            id: 146473,
            uuid: 'd091dd6c-3355-4123-b49f-03f78ce12f71',
            type: 1,
            isEvent: false,
            method: '당첨 문자 발송',
            url: 'https://grandstage.a-rt.com/product/new?prdtNo=1020100891&page=1',
            price: '￦169,000',
            releaseMarket: {
              name: 'ABC마트 GS 경기신세계점',
              permalink: 'abc-gs-gyeonggi-ssg',
              icon: 'https://static.shoeprize.com/site/icon/ABC%EB%A7%88%ED%8A%B8_GS_%EA%B2%BD%EA%B8%B0%EC%8B%A0%EC%84%B8%EA%B3%84%EC%A0%90-c4fc8a5e-f155-11ee-855e-0219d052041b.jpeg',
              phone: '0215889667',
              mapUrl: 'https://naver.me/5wAqA3X9',
              address:
                '경기 용인시 수지구 포은대로 536 신세계백화점 경기점 4층, ABC-MART GS 경기신세계점',
              channels: [
                {
                  type: 'instagram',
                  link: 'https://www.instagram.com/abcmartkr_grandstage/',
                  typeName: '인스타그램',
                },
              ],
              isUseApp: false,
            },
            dateInfo: '4월 3일 (수) 10:00 ~ 4월 9일 (화) 23:50',
            announcedTimestamp: 1712797200000,
            closedTimestamp: 1712674200000,
            startTimestamp: 1712106000000,
            endTimestamp: 1712674200000,
            product: {
              id: 114564,
              brandName: 'ASICS',
              name: '아식스 젤-카야노 14 크림 후디 블랙',
              nameEn: 'ASICS GEL-KAYANO 14 CREAM BLACK',
              thumb:
                'https://static.shoeprize.com/Raffle/thumb/1201A019-108-shoeprize-ASICS-GEL-KAYANO-14-CREAM-BLACK-114564-1685067716736.jpg',
              code: '1201A019-108',
            },
            shippingMethod: '매장 수령',
            payMethod: '오프라인 구매',
            salePrice: '169000.00',
            salePriceCurrency: 'KRW',
            salePriceCurrencySymbol: '￦',
            region: '한국',
            isUndefinedStartTime: false,
            isUndefinedEndTime: false,
            purchaseStartedTimestamp: 1712797200000,
            purchaseStoppedTimestamp: 1712847000000,
            mode: 'online',
            isUndefinedPurchaseStartedAt: false,
            isUndefinedPurchaseStoppedAt: false,
            isUndefinedAnnouncedAt: false,
            completedTimestamp: 1712847599999,
            isExpired: false,
            isInHouse: false,
            isDomesticSite: true,
          },
          {
            id: 146473,
            uuid: 'd091dd6c-3355-4123-b49f-03f78ce12f71',
            type: 1,
            isEvent: false,
            method: '당첨 문자 발송',
            url: 'https://grandstage.a-rt.com/product/new?prdtNo=1020100891&page=1',
            price: '￦169,000',
            releaseMarket: {
              name: 'ABC마트 GS 경기신세계점',
              permalink: 'abc-gs-gyeonggi-ssg',
              icon: 'https://static.shoeprize.com/site/icon/ABC%EB%A7%88%ED%8A%B8_GS_%EA%B2%BD%EA%B8%B0%EC%8B%A0%EC%84%B8%EA%B3%84%EC%A0%90-c4fc8a5e-f155-11ee-855e-0219d052041b.jpeg',
              phone: '0215889667',
              mapUrl: 'https://naver.me/5wAqA3X9',
              address:
                '경기 용인시 수지구 포은대로 536 신세계백화점 경기점 4층, ABC-MART GS 경기신세계점',
              channels: [
                {
                  type: 'instagram',
                  link: 'https://www.instagram.com/abcmartkr_grandstage/',
                  typeName: '인스타그램',
                },
              ],
              isUseApp: false,
            },
            dateInfo: '4월 3일 (수) 10:00 ~ 4월 9일 (화) 23:50',
            announcedTimestamp: 1712797200000,
            closedTimestamp: 1712674200000,
            startTimestamp: 1712106000000,
            endTimestamp: 1712674200000,
            product: {
              id: 114564,
              brandName: 'ASICS',
              name: '아식스 젤-카야노 14 크림 블랙',
              nameEn: 'ASICS GEL-KAYANO 14 CREAM BLACK',
              thumb:
                'https://static.shoeprize.com/Raffle/thumb/1201A019-108-shoeprize-ASICS-GEL-KAYANO-14-CREAM-BLACK-114564-1685067716736.jpg',
              code: '1201A019-108',
            },
            shippingMethod: '매장 수령',
            payMethod: '오프라인 구매',
            salePrice: '169000.00',
            salePriceCurrency: 'KRW',
            salePriceCurrencySymbol: '￦',
            region: '한국',
            isUndefinedStartTime: false,
            isUndefinedEndTime: false,
            purchaseStartedTimestamp: 1712797200000,
            purchaseStoppedTimestamp: 1712847000000,
            mode: 'online',
            isUndefinedPurchaseStartedAt: false,
            isUndefinedPurchaseStoppedAt: false,
            isUndefinedAnnouncedAt: false,
            completedTimestamp: 1712847599999,
            isExpired: false,
            isInHouse: false,
            isDomesticSite: true,
          },
          {
            id: 146473,
            uuid: 'd091dd6c-3355-4123-b49f-03f78ce12f71',
            type: 1,
            isEvent: false,
            method: '온라인 선착순',
            url: 'https://grandstage.a-rt.com/product/new?prdtNo=1020100891&page=1',
            price: '￦169,000',
            releaseMarket: {
              name: 'ABC마트 GS 경기신세계점',
              permalink: 'abc-gs-gyeonggi-ssg',
              icon: 'https://static.shoeprize.com/site/icon/ABC%EB%A7%88%ED%8A%B8_GS_%EA%B2%BD%EA%B8%B0%EC%8B%A0%EC%84%B8%EA%B3%84%EC%A0%90-c4fc8a5e-f155-11ee-855e-0219d052041b.jpeg',
              phone: '0215889667',
              mapUrl: 'https://naver.me/5wAqA3X9',
              address:
                '경기 용인시 수지구 포은대로 536 신세계백화점 경기점 4층, ABC-MART GS 경기신세계점',
              channels: [
                {
                  type: 'instagram',
                  link: 'https://www.instagram.com/abcmartkr_grandstage/',
                  typeName: '인스타그램',
                },
              ],
              isUseApp: false,
            },
            dateInfo: '4월 3일 (수) 10:00 ~ 4월 9일 (화) 23:50',
            announcedTimestamp: 1712797200000,
            closedTimestamp: 1712674200000,
            startTimestamp: 1712106000000,
            endTimestamp: 1712674200000,
            product: {
              id: 114564,
              brandName: 'ASICS',
              name: '아식스 젤-카야노 14 크림 블랙',
              nameEn: 'ASICS GEL-KAYANO 14 CREAM BLACK',
              thumb:
                'https://static.shoeprize.com/Raffle/thumb/1201A019-108-shoeprize-ASICS-GEL-KAYANO-14-CREAM-BLACK-114564-1685067716736.jpg',
              code: '1201A019-108',
            },
            shippingMethod: '매장 수령',
            payMethod: '오프라인 구매',
            salePrice: '169000.00',
            salePriceCurrency: 'KRW',
            salePriceCurrencySymbol: '￦',
            region: '한국',
            isUndefinedStartTime: false,
            isUndefinedEndTime: false,
            purchaseStartedTimestamp: 1712797200000,
            purchaseStoppedTimestamp: 1712847000000,
            mode: 'online',
            isUndefinedPurchaseStartedAt: false,
            isUndefinedPurchaseStoppedAt: false,
            isUndefinedAnnouncedAt: false,
            completedTimestamp: 1712847599999,
            isExpired: false,
            isInHouse: false,
            isDomesticSite: true,
          },
          {
            id: 146473,
            uuid: 'd091dd6c-3355-4123-b49f-03f78ce12f71',
            type: 1,
            isEvent: false,
            method: '당첨 문자 발송',
            url: 'https://grandstage.a-rt.com/product/new?prdtNo=1020100891&page=1',
            price: '￦169,000',
            releaseMarket: {
              name: 'ABC마트 GS 경기신세계점',
              permalink: 'abc-gs-gyeonggi-ssg',
              icon: 'https://static.shoeprize.com/site/icon/ABC%EB%A7%88%ED%8A%B8_GS_%EA%B2%BD%EA%B8%B0%EC%8B%A0%EC%84%B8%EA%B3%84%EC%A0%90-c4fc8a5e-f155-11ee-855e-0219d052041b.jpeg',
              phone: '0215889667',
              mapUrl: 'https://naver.me/5wAqA3X9',
              address:
                '경기 용인시 수지구 포은대로 536 신세계백화점 경기점 4층, ABC-MART GS 경기신세계점',
              channels: [
                {
                  type: 'instagram',
                  link: 'https://www.instagram.com/abcmartkr_grandstage/',
                  typeName: '인스타그램',
                },
              ],
              isUseApp: false,
            },
            dateInfo: '4월 3일 (수) 10:00 ~ 4월 9일 (화) 23:50',
            announcedTimestamp: 1712797200000,
            closedTimestamp: 1712674200000,
            endTimestamp: 1712674200000,
            product: {
              id: 114564,
              brandName: 'ASICS',
              name: '아식스 젤-카야노 14 크림 블랙',
              nameEn: 'ASICS GEL-KAYANO 14 CREAM BLACK',
              thumb:
                'https://static.shoeprize.com/Raffle/thumb/1201A019-108-shoeprize-ASICS-GEL-KAYANO-14-CREAM-BLACK-114564-1685067716736.jpg',
              code: '1201A019-108',
            },
            shippingMethod: '매장 수령',
            payMethod: '오프라인 구매',
            salePrice: '169000.00',
            salePriceCurrency: 'KRW',
            salePriceCurrencySymbol: '￦',
            region: '한국',
            isUndefinedStartTime: false,
            isUndefinedEndTime: false,
            purchaseStartedTimestamp: 1712797200000,
            purchaseStoppedTimestamp: 1712847000000,
            mode: 'online',
            isUndefinedPurchaseStartedAt: false,
            isUndefinedPurchaseStoppedAt: false,
            isUndefinedAnnouncedAt: false,
            completedTimestamp: 1712847599999,
            isExpired: false,
            isInHouse: false,
            isDomesticSite: true,
          },
        ],
      },
    });

    const result = [
      [
        {
          name: 'ASICS GEL-KAYANO 14 CREAM BLACK',
          subName: '아식스 젤-카야노 14 크림 블랙',
          shoeCode: '1201A019-108',
          brand: 'ASICS',
          relPrice: '￦169,000',
          imgUrl:
            'https://static.shoeprize.com/Raffle/thumb/1201A019-108-shoeprize-ASICS-GEL-KAYANO-14-CREAM-BLACK-114564-1685067716736.jpg',
          raffleStartDate: '2024-04-03 01:00:00',
          raffleEndDate: '2024-04-09 14:50:00',
          raffleUrl:
            'https://grandstage.a-rt.com/product/new?prdtNo=1020100891&page=1',
          releaseMarketName: 'ABC마트 GS 경기신세계점',
          releaseMarketIcon:
            'https://static.shoeprize.com/site/icon/ABC%EB%A7%88%ED%8A%B8_GS_%EA%B2%BD%EA%B8%B0%EC%8B%A0%EC%84%B8%EA%B3%84%EC%A0%90-c4fc8a5e-f155-11ee-855e-0219d052041b.jpeg',
        },
        {
          name: 'ASICS GEL-KAYANO 14 CREAM BLACK',
          subName: '아식스 젤-카야노 14 크림 블랙',
          shoeCode: '1201A019-108',
          brand: 'ASICS',
          relPrice: '￦169,000',
          imgUrl:
            'https://static.shoeprize.com/Raffle/thumb/1201A019-108-shoeprize-ASICS-GEL-KAYANO-14-CREAM-BLACK-114564-1685067716736.jpg',
          raffleStartDate: null,
          raffleEndDate: '2024-04-09 14:50:00',
          raffleUrl:
            'https://grandstage.a-rt.com/product/new?prdtNo=1020100891&page=1',
          releaseMarketName: 'ABC마트 GS 경기신세계점',
          releaseMarketIcon:
            'https://static.shoeprize.com/site/icon/ABC%EB%A7%88%ED%8A%B8_GS_%EA%B2%BD%EA%B8%B0%EC%8B%A0%EC%84%B8%EA%B3%84%EC%A0%90-c4fc8a5e-f155-11ee-855e-0219d052041b.jpeg',
        },
      ],
    ];

    await rafflesservice.scrapInfo(productIdArr);

    expect(axiosSpy).toHaveBeenCalledTimes(1);
    expect(await rafflesservice.scrapInfo(productIdArr)).toEqual(result);

    jest.restoreAllMocks();
  });

  it('error scrap info', async () => {
    const mockError = new Error('Request failed');
    const productIdArr = [123, 456, 789];
    jest.spyOn(axios, 'get').mockRejectedValue(mockError);

    await expect(rafflesservice.scrapInfo(productIdArr)).rejects.toThrow(
      'Request failed',
    );

    jest.restoreAllMocks();
  });

  it('error during saving raffles', async () => {
    const mockError = new Error('save fail');
    const productIdArr = [123, 456, 789];

    jest.spyOn(raffleRepositoryMock, 'save').mockRejectedValue(mockError);

    try {
      await rafflesservice.scrapInfo(productIdArr);
    } catch (error) {
      expect(raffleRepositoryMock.save).toHaveBeenCalledTimes(
        productIdArr.length,
      );
      expect(console.log).toHaveBeenCalledTimes(productIdArr.length);
    }
  });
});
