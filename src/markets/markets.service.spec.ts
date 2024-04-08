import { Test, TestingModule } from '@nestjs/testing';
import { MarketsService } from './markets.service';
import { Repository } from 'typeorm';
import { Market } from './entities/market.entity';
import { Shoes } from './entities/shoes.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

describe('MarketsService', () => {
  let service: MarketsService;
  let marketsRepositoryMock: Partial<
    Record<keyof Repository<Market>, jest.Mock>
  >;
  let shoesRepositoryMock: Partial<Record<keyof Repository<Shoes>, jest.Mock>>;

  beforeEach(async () => {
    shoesRepositoryMock = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };

    marketsRepositoryMock = {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarketsService,
        {
          provide: getRepositoryToken(Market),
          useValue: marketsRepositoryMock,
        },
        {
          provide: getRepositoryToken(Shoes),
          useValue: shoesRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<MarketsService>(MarketsService);
  });

  const shoes = [
    {
      id: 1,
      name: 'Nike ZoomX Vaporfly 3 Ekiden Pack',
      brand: 'Nike',
      imgUrl: { imageUrl: '이미지url1', thumbUrl: '썸네일url1' },
    },
    {
      id: 2,
      name: 'Nike Air Zoom GT Hustle 2 Greater Than Ever',
      brand: 'Nike',
      imgUrl: { imageUrl: '이미지url2', thumbUrl: '썸네일url2' },
    },
  ];

  const resultShoes = [
    {
      id: 1,
      name: 'Nike ZoomX Vaporfly 3 Ekiden Pack',
      brand: 'Nike',
      thumbUrl: '썸네일url1',
    },
    {
      id: 2,
      name: 'Nike Air Zoom GT Hustle 2 Greater Than Ever',
      brand: 'Nike',
      thumbUrl: '썸네일url2',
    },
  ];
  it('신발 페이지별 조회', async () => {
    const page = '1';
    shoesRepositoryMock.find.mockResolvedValueOnce(shoes);
    shoesRepositoryMock.find.mockResolvedValueOnce(
      shoes.map((shoe) => ({
        id: shoe.id,
        name: shoe.name,
        brand: shoe.brand,
        thumbUrl: shoe.imgUrl['thumbUrl'],
      })),
    );
    const results = await service.getAllShoes(page);
    expect(shoesRepositoryMock.find).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
        brand: true,
        imgUrl: true,
      },
      skip: 0,
      take: 50,
    });
    expect(results).toEqual(resultShoes);
  });

  it('판매글 생성', async () => {
    const userId = 1;
    const shoesId = 1;
    const createMarketDto = {
      title: '제목',
      content: '내용',
      size: '240mm',
      imgUrl: ['이미지1', '이미지2'],
      salesStatus: 0,
      price: 100000,
      useStatus: 0,
    };
    const market = {
      id: 1,
      title: '제목',
      content: '내용',
      createdAt: '2024-04-05 12:48:35.685825',
      updatedAt: '2024-04-05 12:48:35.685825',
      size: '240mm',
      imgUrl: ['이미지1', '이미지2'],
      SaleStatus: 0,
      price: 100000,
      UseStatus: 0,
      userId: 1,
      shoesId: 1,
      view: 0,
    };
    marketsRepositoryMock.save.mockResolvedValueOnce(market);
    await service.createMarket(userId, shoesId, createMarketDto);
    expect(marketsRepositoryMock.save).toHaveBeenCalledWith({
      userId,
      shoesId,
      title: createMarketDto.title,
      content: createMarketDto.content,
      size: createMarketDto.size,
      view: 0,
      imgUrl: createMarketDto.imgUrl,
      salesStatus: createMarketDto.salesStatus,
      price: createMarketDto.price,
      useStatus: createMarketDto.useStatus,
    });
  });

  it('판매글 전체 조회+신발 상세 정보', async () => {
    const shoesId = 1;
    const shoesInfo = {
      name: '신발이름',
      brand: '나이키',
      shoeCode: '신발 코드',
      imageUrl: '이미지url1',
    };
    const posts = [
      {
        id: 1,
        title: '판매글1',
        content: '내용1',
        createdAt: '2024-04-05T03:48:36.486Z',
        updatedAt: '2024-04-05T06:54:31.000Z',
        size: '270mm',
        view: '1',
        imgUrl: ['이미지1', '이미지2'],
        saleStatus: 0,
        price: '120000',
        useStatus: 0,
        userId: 1,
        shoesId: 1,
      },
      {
        id: 2,
        title: '판매글2',
        content: '내용2',
        createdAt: '2024-04-05T03:48:36.486Z',
        updatedAt: '2024-04-05T06:54:31.000Z',
        size: '270mm',
        view: '1',
        imgUrl: ['이미지1', '이미지2'],
        saleStatus: 0,
        price: '120000',
        useStatus: 0,
        userId: 1,
        shoesId: 1,
      },
    ];
    const shoes = {
      name: '신발이름',
      brand: '나이키',
      shoeCode: '신발 코드',
      imgUrl: { imageUrl: '이미지url1', thumbUrl: '썸네일url1' },
    };
    shoesRepositoryMock.findOne.mockResolvedValueOnce(shoes);
    marketsRepositoryMock.find.mockResolvedValueOnce(posts);
    const result = await service.findAllMarket(shoesId);

    expect(shoesRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { id: shoesId },
      select: ['name', 'brand', 'shoeCode', 'imgUrl'],
    });
    expect(marketsRepositoryMock.find).toHaveBeenCalledWith({
      where: { shoesId },
      order: { saleStatus: 'ASC', view: 'DESC' },
    });
    expect(result).toEqual({ shoesInfo, posts });
  });

  it('판매글 상세 조회', async () => {
    const marketId = 1;
    const market = {
      id: 1,
      title: '판매글1',
      content: '내용1',
      createdAt: '2024-04-05T03:48:36.486Z',
      updatedAt: '2024-04-05T06:54:31.000Z',
      size: '270mm',
      view: '1',
      imgUrl: ['이미지1', '이미지2'],
      saleStatus: 0,
      price: '120000',
      useStatus: 0,
      userId: 1,
      shoesId: 1,
    };
    const updateMarket = {
      id: 1,
      title: '판매글1',
      content: '내용1',
      createdAt: '2024-04-05T03:48:36.486Z',
      updatedAt: '2024-04-05T06:54:31.000Z',
      size: '270mm',
      view: '2',
      imgUrl: ['이미지1', '이미지2'],
      saleStatus: 0,
      price: '120000',
      useStatus: 0,
      userId: 1,
      shoesId: 1,
    };
    marketsRepositoryMock.findOne.mockResolvedValueOnce(market);
    marketsRepositoryMock.update.mockResolvedValueOnce(updateMarket);
    marketsRepositoryMock.findOne.mockResolvedValueOnce(updateMarket);
    const result = await service.findOneMarket(marketId);

    expect(marketsRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { id: marketId },
    });
    expect(marketsRepositoryMock.update).toHaveBeenCalledWith(
      { id: marketId },
      { view: +market.view + 1 },
    );
    expect(marketsRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { id: marketId },
    });
    expect(result).toEqual(updateMarket);
  });

  it('판매글 상세 조회 - 예외 발생', async () => {
    const marketId = 1;
    marketsRepositoryMock.findOne.mockResolvedValueOnce(undefined);

    await expect(service.findOneMarket(marketId)).rejects.toThrow(
      NotFoundException,
    );

    expect(marketsRepositoryMock.findOne).toHaveBeenCalledWith({
      where: { id: marketId },
    });

    expect(marketsRepositoryMock.update).not.toHaveBeenCalled();
  });
});
