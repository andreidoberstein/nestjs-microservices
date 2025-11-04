import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { UsersRepository } from '../src/app/users/users.repository';
import { User, UserSchema } from '../src/app/users/user.schema';
import {UsersService} from "../src/app/users/users.service";

describe('UsersRepository (integration-memory)', () => {
  let mongo: MongoMemoryServer;
  let conn: Connection;
  let repo: UsersService;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();

    const moduleRef = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
      providers: [
        UsersRepository,
        { provide: getModelToken(User.name), useFactory: (conn: Connection) => conn.model(User.name, UserSchema), inject: [Connection] },
      ],
    }).compile();

    // pega model via Nest
    const userModel = moduleRef.get<Model<User>>(getModelToken(User.name));
    // injeta no repo manualmente (o provider já faz isso no ctor)
    repo = moduleRef.get(UsersRepository);
  });

  afterAll(async () => {
    await conn?.close();
    await mongo.stop();
  });

  it('create/find', async () => {
    const u = await repo.create({ name: 'X', email: 'x@x.com', password: '123456' } as any);
    expect(u._id).toBeDefined();
    const list = await repo.findAll();
    expect(list.length).toBeGreaterThan(0);
  });
});
