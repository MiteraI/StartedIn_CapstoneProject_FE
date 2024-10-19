import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StateStorageService } from '../auth/state-storage.service';
import { ApplicationConfigService } from '../config/application-config.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private stateStorageService: StateStorageService,
    private applicationConfigService: ApplicationConfigService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const serverApiUrl = this.applicationConfigService.getEndpointFor('');
    // Check if the url simply go to root, no api here then simply pass the request
    if (
      !request.url ||
      (request.url.startsWith('http') && !(serverApiUrl && request.url.startsWith(serverApiUrl)))
    ) {
      return next.handle(request);
    }

    const token: string | null = this.stateStorageService.getAccessToken();
    console.log(token);
    
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
    return next.handle(request);
  }
}
