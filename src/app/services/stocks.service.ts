import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Quote } from '../interfaces/stocks.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StocksService {
  // Constructors

  constructor(private http: HttpClient) {}

  // Member Fields

  /**
   * Fetches the current quote for a given stock and returns it
   * @param symbol The stock symbol
   * @returns The request subscription
   */
  getQuote = (symbol: string) =>
    this.http.get<Quote>(`${environment.apiUrl}/stocks?symbol=${symbol}`);
}
