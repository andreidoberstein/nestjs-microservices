import {Injectable} from "@nestjs/common";
import {AbstractRepository} from "@app/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {User} from "./user.schema";

@Injectable()
export class UsersRepository extends AbstractRepository<User> {
  constructor(@InjectModel(User.name) userModel: Model<User>) {
    super(userModel);
  }
}
