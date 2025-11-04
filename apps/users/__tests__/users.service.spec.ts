import { Test } from '@nestjs/testing';
import { UsersService } from '../src/app/users/users.service';
import { UsersRepository } from '../src/app/users/users.repository';

describe('UsersService (unit)', () => {
  let service: UsersService;
  const repo = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findOne: jest.fn(),
  };

  beforeAll(async () => {
    const mod = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: repo },
      ],
    }).compile();

    service = mod.get(UsersService);
  });

  beforeEach(() => jest.clearAllMocks());

  it('create → chama repo.create e retorna usuário', async () => {
    const dto = { name: 'A', email: 'a@a.com', password: '123456' };
    repo.create.mockResolvedValue({ _id: '1', ...dto });
    const res = await service.create(dto as any);
    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(res._id).toBe('1');
  });

  it('findOne (id existente)', async () => {
    repo.findById.mockResolvedValue({ _id: '1' });
    const res = await service.findOne('1');
    expect(res._id).toBe('1');
  });

  it('findOne (id inexistente) → NotFoundException', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.findOne('x')).rejects.toMatchObject({ status: 404 });
  });

  it('update → retorna doc atualizado', async () => {
    repo.update.mockResolvedValue({ _id: '1', name: 'B' });
    const res = await service.update('1', { name: 'B' });
    expect(res.name).toBe('B');
  });

  it('remove → retorna deleted', async () => {
    repo.delete.mockResolvedValue(true);
    const res = await service.remove('1');
    expect(res.deleted).toBe(true);
  });
});
