import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { functions } from 'lodash';

@Injectable()
export class SearchService {
  constructor(private readonly esService: ElasticsearchService) {}
  async search(query: string) {
    try {
      const { body } = await this.esService.search({
        index: ['raffles', 'shoes', 'news'],
        body: {
          size: 10000,
          query: {
            function_score: {
              query: {
                multi_match: {
                  query: query,
                  fields: ['subName^6', 'name^2', 'title'],
                  fuzziness: '1',
                  operator: 'OR',
                },
              },
              functions: [
                { filter: { match: { category: 'raffles' } }, weight: 10 },
                { filter: { match: { category: 'shoes' } }, weight: 1 },
                { filter: { match: { category: 'news' } }, weight: 1 },
              ],
              score_mode: 'sum',
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
