import { Injectable } from '@angular/core';
import { RegisterRequest } from '../../shared/models/register.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApplicationConfigService } from 'src/app/core/config/application-config.service';

@Injectable({
  providedIn: 'root',
})
export class RegisterService {
  constructor(
    private http: HttpClient,
    private applicationConfigService: ApplicationConfigService
  ) {}

  register(registerData: RegisterRequest): Observable<any> {
    return this.http.post(
      this.applicationConfigService.getEndpointFor('/api/register'),
      registerData,
      {
        responseType: 'text',
      }
    );
  }
}
