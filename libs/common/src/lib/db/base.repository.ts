import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { BaseEntity } from '@app/common';

export type Page<T> = { items: T[]; total: number; page: number; limit: number };

export abstract class BaseRepository<T extends BaseEntity> {
  constructor(protected readonly model: Model<T>) {}

  async create(data: Omit<T, '_id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const created = await this.model.create(data as any);
    return created.toJSON() as T;
  }

  async find(filter: FilterQuery<T> = {} as any): Promise<T[]> {
    return this.model.find(filter).lean<T[]>().exec();
  }

  async paginate(filter: FilterQuery<T>, page = 1, limit = 20): Promise<Page<T>> {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.model.find(filter).skip(skip).limit(limit).lean<T[]>().exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total, page, limit };
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(filter).lean<T>().exec();
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).lean<T>().exec();
  }

  async update(id: string, update: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, update, { new: true }).lean<T>().exec();
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.model.findByIdAndDelete(id).exec();
    return !!res;
  }

  async softDelete(id: string): Promise<T | null> {
    return this.update(id, { $set: { deletedAt: new Date() } } as any);
  }
}
