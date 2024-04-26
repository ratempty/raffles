import { Calendar } from 'src/calendars/entities/calendar.entity';
import { Market } from 'src/markets/entities/market.entity';
import { Shoes } from 'src/markets/entities/shoes.entity';
import { News } from 'src/news/entities/news.entity';
import { Raffle } from 'src/raffles/entities/raffle.entity';
import { UserRaffle } from 'src/raffles/entities/userRaffle.entity';
import { User } from 'src/users/entities/user.entity';
import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';

const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'zazae-database.cdk6ou6w2ep8.ap-northeast-2.rds.amazonaws.com',
  port: 3306,
  username: 'root',
  password: 'aaaa4321',
  database: 'optimization',
  entities: [User, Market, News, Raffle, UserRaffle, Calendar, Shoes],
  synchronize: true,
  logging: false,
});

async function createDummyData() {
  await AppDataSource.initialize().then(async () => {
    console.log(`==========[ Dummy Data Creater Started ]==========`);
    for (let i = 0; i < 10; i++) {
      const user = new User();
      user.name = faker.person.fullName();
      user.email = faker.internet.email();
      await AppDataSource.manager.save(user);
      console.log(i);
    }
    console.log('==============[ Dummy Data Creater end ]=================');
  });
}

createDummyData();
