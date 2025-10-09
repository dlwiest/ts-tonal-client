import { HttpClient } from '../http/http-client'
import { TonalUserInfo, TonalGoal, TonalTrainingEffectGoalsResponse, TonalTrainingType, TonalGoalMetric } from '../types'

export class UserService {
  constructor(private httpClient: HttpClient) { }

  async getUserInfo(): Promise<TonalUserInfo> {
    return this.httpClient.request('/users/userinfo')
  }

  async getGoals(): Promise<TonalGoal[]> {
    return this.httpClient.request('/goals')
  }

  async getTrainingEffectGoals(): Promise<TonalTrainingEffectGoalsResponse> {
    return this.httpClient.request('/training-effect-goals')
  }

  async getTrainingTypes(): Promise<TonalTrainingType[]> {
    return this.httpClient.request('/training-types')
  }

  async getGoalMetrics(): Promise<TonalGoalMetric[]> {
    return this.httpClient.request('/goal-metrics')
  }
}