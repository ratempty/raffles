import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      useFactory: async () => ({
        node: process.env.ES_ENDPOINT,
        auth: {
          username: process.env.ES_USERNAME,
          password: process.env.ES_PASSWORD,
        },
        ssl: {
          rejectUnauthorized: true,
        },
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        maxRetries: 10,
        requestTimeout: 60000,
        pingTimeout: 60000,
      }),
      inject: [],
    }),
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
