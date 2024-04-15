import { Test, TestingModule } from '@nestjs/testing';
import { NewsService } from './news.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { News } from './entities/news.entity';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import puppeteer from 'puppeteer';

const mockAxios = new MockAdapter(axios);

describe('NewsService', () => {
  let service: NewsService;
  let repository: RepositoryMock;
  let browser;
  let scrapeDataSpy;

  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: true });
  });

  afterAll(async () => {
    await browser.close;
  });

  // 테스트 모듈 생성 및 테스트할 서비스 주입
  beforeEach(async () => {
    // 테스트 모듈 설정
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsService,
        {
          provide: getRepositoryToken(News),
          useClass: RepositoryMock,
        },
      ],
    }).compile();
    console.error = jest.fn();
    service = module.get<NewsService>(NewsService);
    repository = module.get<RepositoryMock>(getRepositoryToken(News));
    scrapeDataSpy = jest.spyOn(service, 'scrapeData');
  });

  afterEach(() => {
    scrapeDataSpy.mockRestore();
  });

  it('should return getHTML URLs', async () => {
    // 모의 응답으로 사용할 HTML 데이터를 정의
    const mockHTML = `
      <div class="post-box" data-permalink="https://example.com/post1"></div>
      <div class="post-box" data-permalink="https://example.com/post2"></div>
    `;
    mockAxios.onGet('https://hypebeast.kr/footwear').reply(200, mockHTML);

    const urls = await service.getHTML();

    expect(urls).toEqual([
      'https://example.com/post1',
      'https://example.com/post2',
    ]);
  });

  it('should errors getHTML', async () => {
    mockAxios.onGet('https://hypebeast.kr/footwear').reply(500);
    const result = await service.getHTML();

    expect(result).toBeNull;
  });

  it('should scrapeData of puppeteer', async () => {
    const mockUrl = 'https://example.com';
    const mockHTML = `
    <div class="post-body-title">Mock Title</div>
    <div class="post-body-excerpt">Mock Subtitle</div>
    <div class="post-body-content">Mock Content</div>
    <img class="carousel-cell-image" src="mock-image-url">
  `;

    const page = await browser.newPage();
    await page.setContent(mockHTML, { waitUntil: 'domcontentloaded' });

    try {
      const result = await scrapeDataSpy(mockUrl);

      expect(result).toEqual({
        title: 'Mock Title',
        subTitle: 'Mock Subtitle',
        content: 'Mock Content',
        image: 'mock-image-url',
      });
    } catch (error) {
      expect(console.error).toHaveBeenCalledTimes(1);
    }
  });

  it('should handle errors scrapData', async () => {
    const errorUrl = 'https://error-url.com';
    try {
      const result = await service.scrapeData(errorUrl);
      expect(result).toBeNull;
    } catch (error) {
      expect(error.message).toContain('net::ERR_NAME_NOT_RESOLVED');
    }
  });

  it('should create & save scrapeData to repository', async () => {
    const url = 'https://example.com';
    const title = 'Mock Subtitle';
    const subTitle = 'Mock Subtitle';
    const content = 'Mock Content';
    const image = 'mock-image-url';
    const results = {
      title,
      subTitle,
      content,
      image,
      newsUrl: url,
    };

    jest.spyOn(service, 'scrapeData').mockResolvedValue(results);

    const result = await service.scrapeData(url);

    expect(result).toEqual({
      title,
      subTitle,
      content,
      image,
      newsUrl: url,
    });
  });
  it('should return scraped data', async () => {
    jest.spyOn(service, 'getHTML').mockResolvedValue(['https://example.com']);

    jest.spyOn(service, 'scrapeData').mockResolvedValue({
      title: 'Test Title',
      subTitle: 'Test Subtitle',
      content: 'Test Content',
      image: 'Test image',
    });

    const result = await service.scrapeAll();

    expect(result).toEqual([
      {
        title: 'Test Title',
        subTitle: 'Test Subtitle',
        content: 'Test Content',
        image: 'Test image',
      },
    ]);
  });

  it('should return all news with selected properties', async () => {
    // 테스트에 사용할 가짜 뉴스 데이터 생성
    const mockNewsData = [
      {
        id: 1,
        title: 'Test Title 1',
        subTitle: 'Test Subtitle 1',
        newsImg: 'test-img-url-1',
        views: 10,
        createdAt: new Date(),
      },
      {
        id: 2,
        title: 'Test Title 2',
        subTitle: 'Test Subtitle 2',
        newsImg: 'test-img-url-2',
        views: 20,
        createdAt: new Date(),
      },
    ];

    // 뉴스 데이터 모킹 설정
    jest.spyOn(repository, 'find').mockResolvedValue(mockNewsData);

    // findAllNews() 메서드 호출
    const result = await service.findAllNews();

    // 기대한 결과와 실제 결과 비교
    expect(result).toEqual(
      mockNewsData.map((item) => ({
        id: item.id,
        title: item.title,
        subTitle: item.subTitle,
        newsImg: item.newsImg,
        views: item.views,
      })),
    );
  });

  it('should return findOne By Id', async () => {
    const mockNewsItem = {
      id: 1,
      title: 'Test Title',
      subTitle: 'Test Subtitle',
      newsImg: 'test-img',
      views: 10,
    };

    jest.spyOn(repository, 'findOne').mockResolvedValue(mockNewsItem);
    const result = await service.findOneNews(1);

    expect(result).toEqual(expect.objectContaining(mockNewsItem));
  });

  it('should return viewCount', async () => {
    const mockNewsItem = {
      id: 1,
      title: 'Test Title',
      subTItle: 'Test Subtitle',
      newsImg: 'test-img',
      views: 10,
    };

    jest.spyOn(repository, 'findOne').mockResolvedValue(mockNewsItem);
    jest.spyOn(repository, 'save').mockResolvedValue(mockNewsItem);

    await service.viewCount(1);
    expect(mockNewsItem.views).toBe(11);
  });

  it('should return sorted popularNews', async () => {
    const mockPopularNews = [
      {
        id: 1,
        title: 'Popular News 1',
        subTitle: 'Subtitle 1',
        newsImg: 'test-img',
        views: 100,
      },
      {
        id: 2,
        title: 'Popular News 2',
        subTitle: 'Subtitle 2',
        newsImg: 'test-img',
        views: 99,
      },
    ];

    jest.spyOn(repository, 'find').mockResolvedValue(mockPopularNews);
    const result = await service.findPopularNews();
    expect(result).toEqual(mockPopularNews);
  });

  it('should return sorted latestNews', async () => {
    const mockLatestNews = [
      {
        id: 1,
        title: 'latest News 1',
        subTitle: 'Subtitle 1',
        newsImg: 'test-img',
        views: 10,
      },
      {
        id: 2,
        title: 'latest News 2',
        subTitle: 'Subtitle 2',
        newsImg: 'test-img',
        views: 20,
      },
    ];
    jest.spyOn(repository, 'find').mockResolvedValue(mockLatestNews);
    const result = await service.findLatestNews();
    expect(result).toEqual(mockLatestNews);
  });
});

class RepositoryMock {
  find = jest.fn().mockResolvedValue([]);
  findOne = jest.fn().mockResolvedValue(undefined);
  create = jest.fn().mockResolvedValue([]);
  save = jest.fn().mockResolvedValue([]);
}
