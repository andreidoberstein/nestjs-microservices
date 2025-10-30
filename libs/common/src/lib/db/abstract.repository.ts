import {BaseEntity} from "./base.entity";
import {FilterQuery, Model, UpdateQuery} from 'mongoose'

export abstract class AbstractRepository<T> {
  protected constructor(protected readonly model: Model<T>) {}

  async create(data: Omit<T, '_id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const created = await this.model.create(data as any)
    return created.toJSON() as T
  }

  async find(filter: FilterQuery<T> = {} as any): Promise<T[]> {
    return this.model.find(filter).lean<T[]>().exec();
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
}
