import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ApplicationConfigService } from '../core/config/application-config.service'
import { map, Observable } from 'rxjs'
import { SearchResponseModel } from '../shared/models/search-response.model'
import { TransactionModel } from '../shared/models/transaction/transaction.model'
import { TransactionCreateModel } from '../shared/models/transaction/transaction-create.model'
import { TransactionType } from '../shared/enums/transaction-type.enum'

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
    size: number,
    fromName?: string,
    toName?: string,
    type?: TransactionType,
    isInFlow?: boolean,
    dateFrom?: Date,
    dateTo?: Date,
    amountFrom?: number,
    amountTo?: number
  ): Observable<SearchResponseModel<TransactionModel>> {
    const query = (fromName?.trim() ? `fromName=${fromName.trim()}&` : '')
      + (toName?.trim() ? `toName=${toName.trim()}&` : '')
      + (type ? `type=${type}&` : '')
      + (isInFlow ? `isInFlow=${isInFlow}&` : '')
      + (dateFrom ? `dateFrom=${dateFrom.toISOString().split('T')[0]}&` : '')
      + (dateTo ? `dateTo=${dateTo.toISOString().split('T')[0]}&` : '')
      + (amountFrom ? `amountFrom=${amountFrom}&` : '')
      + (amountTo ? `amountTo=${amountTo}&` : '')
      + `page=${page}&size=${size}`;
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

  createTransaction(projectId: string, transaction: TransactionCreateModel): Observable<TransactionModel> {
    return this.http.post<TransactionModel>(
      this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/transactions`),
      transaction
    );
  }

  uploadEvidence(id: string, projectId: string, file: File): Observable<string> {
    const formdata = new FormData();
    formdata.append('file', file);
    return this.http.post<string>(
      this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/transactions/${id}/evidence`),
      formdata,
      { responseType: 'text' as 'json' }
    );
  }

  getSelfTransactionList(
    page: number,
    size: number,
    fromName?: string,
    toName?: string,
    type?: TransactionType,
    isInFlow?: boolean,
    dateFrom?: Date,
    dateTo?: Date,
    amountFrom?: number,
    amountTo?: number
  ): Observable<SearchResponseModel<TransactionModel>> {
    const query = (fromName?.trim() ? `fromName=${fromName.trim()}&` : '')
      + (toName?.trim() ? `toName=${toName.trim()}&` : '')
      + (type ? `type=${type}&` : '')
      + (isInFlow ? `isInFlow=${isInFlow}&` : '')
      + (dateFrom ? `dateFrom=${dateFrom.toISOString().split('T')[0]}&` : '')
      + (dateTo ? `dateTo=${dateTo.toISOString().split('T')[0]}&` : '')
      + (amountFrom ? `amountFrom=${amountFrom}&` : '')
      + (amountTo ? `amountTo=${amountTo}&` : '')
      + `page=${page}&size=${size}`;
    return this.http.get<SearchResponseModel<TransactionModel>>(
      this.applicationConfigService.getEndpointFor(`/api/transactions?${query}`)
    ).pipe(
      map(response => this.parseSearchResponse(response))
    );
  }
}
