import {Module} from "@nestjs/common";
import {IUserClient} from "@app/common/lib/clients/users.client";
import {HttpModule} from "@nestjs/axios";
import {UsersHttpClient} from "@app/common/lib/clients/users.http";

@Module({
  imports: [HttpModule.register({ timeout: 3000 })],
  providers: [
    { provide: IUserClient, useClass: UsersHttpClient },
  ],
  exports: [IUserClient],
})
export class UsersClientModule {}
