import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class SearchService {
  constructor(private readonly esService: ElasticsearchService) {}
  async search(query: string) {
    try {
      const { body } = await this.esService.search({
        index: ['raffles', 'shoes', 'news'],
        body: {
          query: {
            bool: {
              should: [
                { match_phrase: { name: { query, boost: 1.5 } } },
                { match_phrase: { name: { query, boost: 1.0 } } },
                { match_phrase: { title: { query, boost: 0.5 } } },
              ],
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

  async insertData(index: string, body: any) {
    try {
      const result = await this.esService.index({
        index,
        body,
      });
      console.log('indexed data: ', result);
      console.log('인덱스드 데이터');
      return result;
    } catch (error) {
      console.error('ES Error:', error.meta);
      console.log('콘솔에러: ', console.error);
      throw new Error();
    }
  }
}
