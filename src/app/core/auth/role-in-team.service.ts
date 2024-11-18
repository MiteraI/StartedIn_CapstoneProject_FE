import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Observable, filter, switchMap } from 'rxjs';
import { ApplicationConfigService } from '../config/application-config.service';
import { TeamRole } from '../../shared/enums/team-role.enum';

type RoleResponse = {
  roleInTeam: TeamRole;
};

@Injectable({
  providedIn: 'root',
})
export class RoleInTeamService {
  private roleSubject$ = new BehaviorSubject<TeamRole | null>(null);

  constructor(
    private http: HttpClient,
    private applicationConfigService: ApplicationConfigService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Listen to route changes and update role when project ID changes
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        switchMap(() => {
          const projectId = this.findProjectId(this.route.root);
          if (projectId) {
            return this.fetchRole(projectId);
          }
          this.roleSubject$.next(null);
          return [];
        })
      )
      .subscribe();
  }

  get role$(): Observable<TeamRole | null> {
    return this.roleSubject$.asObservable();
  }

  private fetchRole(projectId: string): Observable<RoleResponse> {
    return this.http
      .get<RoleResponse>(
        this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/current-role`)
      )
      .pipe(
        switchMap(response => {
          this.roleSubject$.next(response.roleInTeam);
          return [response];
        })
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
