import { HttpClient } from '../http/http-client'
import { TonalUserInfo, TonalGoal } from '../types'

export class UserService {
  constructor(private httpClient: HttpClient) { }

  async getUserInfo(): Promise<TonalUserInfo> {
    return this.httpClient.request('/users/userinfo')
  }

  async getGoals(): Promise<TonalGoal[]> {
    return this.httpClient.request('/goals')
  }
}