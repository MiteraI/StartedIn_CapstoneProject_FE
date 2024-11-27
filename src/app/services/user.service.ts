import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApplicationConfigService } from '../core/config/application-config.service';
import { Observable } from 'rxjs';
import { FullProfile } from '../shared/models/user/full-profile.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  getUserDetails(userId: string): Observable<FullProfile> {
    const url = `/api/users/${userId}`;
    return this.http.get<FullProfile>(this.applicationConfigService.getEndpointFor(url));
  }

  getFullProfile(): Observable<FullProfile> {
    return this.http.get<FullProfile>(this.applicationConfigService.getEndpointFor(`/api/full-profile`));
  }

  editProfile(bio: string, phoneNumber: string): Observable<FullProfile> {
    return this.http.put<FullProfile>(this.applicationConfigService.getEndpointFor(`/api/profile`), { bio, phoneNumber });
  }

  uploadProfilePicture(file: File): Observable<string> {
    const formdata = new FormData();
    formdata.append('file', file);
    return this.http.post<string>(
      this.applicationConfigService.getEndpointFor(`/api/profile-picture`),
      formdata,
      { responseType: 'text' as 'json' }
    );
  }

  uploadCoverPhoto(file: File): Observable<string> {
    const formdata = new FormData();
    formdata.append('file', file);
    return this.http.post<string>(
      this.applicationConfigService.getEndpointFor(`/api/cover-photo`),
      formdata,
      { responseType: 'text' as 'json' }
    );
  }
}
