import {Injectable} from "@nestjs/common";
import {IUserClient, UsersCore} from "@app/common/lib/clients/users.client";
import {HttpService} from "@nestjs/axios";
import {firstValueFrom} from "rxjs";

@Injectable()
export class UsersHttpClient implements IUserClient {
  private readonly baseUrl = process.env["USERS_SERVICE_URL"]!;
  private readonly internalSecret = process.env["INTERNAL_SHARED_SECRET"]!;

  constructor(private readonly http: HttpService) {}

  async findByEmail(email: string): Promise<UsersCore | null> {
    const url = `${this.baseUrl}/users/internal/by-email`;
    const { data } = await firstValueFrom(this.http.get(url, {
      params: { email },
      headers: { 'x-internal-secret': this.internalSecret },
    }))
    return data as UsersCore ?? null;
  }

  async findById(id: string): Promise<UsersCore | null> {
    const url = `${this.baseUrl}/users/internal/by-id/${id}`;
    const { data } = await firstValueFrom(this.http.get(url, {
      headers: { 'x-internal-secreat': this.internalSecret }
    }))
    return data as UsersCore ?? null;
  }

  async setRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    const url = `${this.baseUrl}/users/internal/${userId}/refresh-token`;
    await firstValueFrom(this.http.put(url, { refreshToken }, {
      headers: { 'x-internal-secret': this.internalSecret },
    }));
  }
}
