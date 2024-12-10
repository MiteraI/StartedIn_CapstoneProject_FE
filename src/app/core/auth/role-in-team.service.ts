import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { ApplicationConfigService } from '../config/application-config.service';
import { TeamRole } from '../../shared/enums/team-role.enum';

type RoleResponse = {
  roleInTeam: TeamRole;
};

@Injectable({
  providedIn: 'root',
})
export class RoleInTeamService {
  private role: TeamRole | null = null;
  private roleSubject$ = new BehaviorSubject<TeamRole | null>(this.role);

  constructor(
    private http: HttpClient,
    private applicationConfigService: ApplicationConfigService,
    private route: ActivatedRoute
  ) {}

  get role$(): Observable<TeamRole | null> {
    return this.roleSubject$.asObservable();
  }

  fetchRole(): Observable<TeamRole | null> {
    const projectId = this.findProjectId(this.route.root);
    return this.http.get<RoleResponse>(
      this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/current-role`)
    ).pipe(
      map(roleResponse => {
        if (!roleResponse) return null;
        return roleResponse.roleInTeam;
      }),
      tap(role => {
        this.role = role;
        this.roleSubject$.next(role);
      }),
      catchError(() => of(null))
    );
  }

  clearRole() {
    this.role = null;
    this.roleSubject$.next(null);
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
