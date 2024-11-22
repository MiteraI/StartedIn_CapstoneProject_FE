import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ApplicationConfigService } from '../config/application-config.service';
import { TeamRole } from '../../shared/enums/team-role.enum';

type RoleResponse = {
  roleInTeam: TeamRole;
};

@Injectable({
  providedIn: 'root',
})
export class RoleInTeamService {
  constructor(
    private http: HttpClient,
    private applicationConfigService: ApplicationConfigService,
    private route: ActivatedRoute
  ) {}

  get role$(): Observable<RoleResponse | null> {
    const projectId = this.findProjectId(this.route.root);
    if (projectId) {
      return this.fetchRole(projectId);
    }
    return of(null);
  }

  private fetchRole(projectId: string): Observable<RoleResponse> {
    return this.http.get<RoleResponse>(
      this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/current-role`)
    );
  }

  private findProjectId(route: ActivatedRoute): string | null {
    const projectId = route.snapshot.paramMap.get('id');
    if (projectId) {
      return projectId;
    }

    if (route.firstChild) {
      return this.findProjectId(route.firstChild);
    }

    return null;
  }
}
