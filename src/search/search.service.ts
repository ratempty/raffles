import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class SearchService {
  constructor(private readonly esService: ElasticsearchService) {}
  async search(query: string) {
    try {
      const { body } = await this.esService.search({
        index: 'raffles',
        body: {
          query: {
            match: {
              subName: query,
            },
          },
        },
      });

      return body.hits.hits.map((hit) => hit._source);
    } catch (error) {
      console.error('ES Error:', error);
      throw error; // 에러 처리를 원하는 방식으로 수정하세요
    }
  }
}
