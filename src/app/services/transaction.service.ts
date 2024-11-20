import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ApplicationConfigService } from '../core/config/application-config.service'
import { map, Observable } from 'rxjs'
import { SearchResponseModel } from '../shared/models/search-response.model'
import { TransactionModel } from '../shared/models/transaction/transaction.model'

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  private parseNumericFields<T extends TransactionModel>(transaction: T): T {
    return {
      ...transaction,
      amount: typeof transaction.amount === 'string' ? parseInt(transaction.amount) : transaction.amount,
    };
  }

  private parseSearchResponse<T extends TransactionModel>(response: SearchResponseModel<T>): SearchResponseModel<T> {
    return {
      ...response,
      data: response.data.map(item => this.parseNumericFields(item))
    };
  }

  getTransactionList(
    projectId: string,
    page: number,
    size: number
  ): Observable<SearchResponseModel<TransactionModel>> {
    const query = `page=${page}&size=${size}`;
    return this.http.get<SearchResponseModel<TransactionModel>>(
      this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/transactions?${query}`)
    ).pipe(
      map(response => this.parseSearchResponse(response))
    );
  }

  getTransaction(id: string, projectId: string): Observable<TransactionModel> {
    return this.http.get<TransactionModel>(
      this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/transactions/${id}`)
    ).pipe(
      map(transaction => this.parseNumericFields(transaction))
    );
  }
}
