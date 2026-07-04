import { Injectable } from '@nestjs/common'
import axios, { AxiosInstance } from 'axios'
import { HttpAdapter } from '../interfaces/http-adapter.interface'

@Injectable()
export class AxiosAdapter implements HttpAdapter {
  private readonly axios: AxiosInstance

  constructor() {
    this.axios = axios
  }

  async get<T>(url: string): Promise<T> {
    try {
      const { data } = await this.axios.get<T>(url)
      return data
    } catch (error: any) {
      throw new Error(`Error fetching data from ${url}: ${error}`)
    }
  }
}
