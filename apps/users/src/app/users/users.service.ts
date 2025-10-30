import {Injectable, NotFoundException} from "@nestjs/common";
import {UsersRepository} from "./users.repository";
import {CreateUserDto} from "./dto/create-user.dto";
import {UpdateUserDto} from "./dto/update-user.dto";

@Injectable()
export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  create(dto: CreateUserDto) {
    return this.repo.create(dto);
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: string) {
    const found = await this.repo.findById(id);
    if (!found) throw new NotFoundException('User not found');
    return found;
  }

  async update(id: string, dto: UpdateUserDto) {
    const updated = await this.repo.update(id, { $set: dto } as any);
    if (!updated) throw new NotFoundException('User not found');
    return updated;
  }

  async remove(id: string) {
    const ok = await this.repo.delete(id);
    if (!ok) throw new NotFoundException('User not found');
    return { deleted: true };
  }
}
