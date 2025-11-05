export type UsersCore = {
  _id: string
  email: string
  name: string
  password: string
  roles: string[]
  refreshToken: string
}

export abstract class IUserClient {
  abstract findByEmail(email: string): Promise<UsersCore | null>
  abstract findById(id: string): Promise<UsersCore | null>
  abstract setRefreshToken(userId: string, refreshToken: string | null): Promise<void>
}
