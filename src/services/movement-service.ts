import { HttpClient } from '../http/http-client'
import { TonalMovement } from '../types'

export class MovementService {
  constructor(private httpClient: HttpClient) { }

  async getMovements(): Promise<TonalMovement[]> {
    return this.httpClient.request('/movements')
  }
}