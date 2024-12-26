import { HttpClient } from '@angular/common/http'
import { ApplicationConfigService } from '../core/config/application-config.service'
import { Injectable } from '@angular/core'
import { BehaviorSubject, delay, map, Observable, of } from 'rxjs'
import { ContractPartyModel } from '../shared/models/contract/contract-party.model'
import { StartupModel } from '../shared/models/project/startup.model'
import { SearchResponseModel } from '../shared/models/search-response.model'
import { ProjectModel } from '../shared/models/project/project.model'
import { TeamMemberModel } from '../shared/models/user/team-member.model'
import { ProjectOveriewModel } from '../shared/models/project/project-overview.model'
import { PayosInfoModel } from '../shared/models/project/payos-info.model'
import { InvestmentCallStatus } from '../shared/enums/investment-call-status.enum'
//import { simulateStartupAPI } from '../shared/mocks/startup-samples'
import { CheckProjectClosableModel } from '../shared/models/project/check-project-closable.model'
import { mockCanCloseProject, mockCannotCloseProject } from '../shared/mocks/close-data-samples'
import { CheckUserLeaveableModel } from '../shared/models/project/check-user-leaveable.model'

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  refreshProject$ = new BehaviorSubject<boolean>(true)
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  private parseNumericFields<T extends StartupModel>(startup: T): T {
    return {
      ...startup,
      investmentCall: startup.investmentCall
        ? {
            ...startup.investmentCall,
            targetCall: typeof startup.investmentCall.targetCall === 'string' ? parseInt(startup.investmentCall.targetCall) : startup.investmentCall.targetCall,
            amountRaised: typeof startup.investmentCall.amountRaised === 'string' ? parseInt(startup.investmentCall.amountRaised) : startup.investmentCall.amountRaised,
            remainAvailableEquityShare:
              typeof startup.investmentCall.remainAvailableEquityShare === 'string'
                ? parseFloat(startup.investmentCall.remainAvailableEquityShare)
                : startup.investmentCall.remainAvailableEquityShare,
            equityShareCall:
              typeof startup.investmentCall.equityShareCall === 'string' ? parseFloat(startup.investmentCall.equityShareCall) : startup.investmentCall.equityShareCall,
          }
        : null,
    }
  }

  private parseSearchResponse<T extends StartupModel>(response: SearchResponseModel<T>): SearchResponseModel<T> {
    return {
      ...response,
      data: response.data.map((item) => this.parseNumericFields(item)),
    }
  }

  getProject(id: string): Observable<ProjectModel> {
    return this.http.get<ProjectModel>(this.applicationConfigService.getEndpointFor(`/api/projects/${id}`))
  }

  getContractPartiesForProject(id: string): Observable<ContractPartyModel[]> {
    return this.http.get<ContractPartyModel[]>(this.applicationConfigService.getEndpointFor(`/api/projects/${id}/parties`))
  }

  getStartups(
    pageIndex: number,
    pageSize: number,
    projectName?: string,
    status?: InvestmentCallStatus,
    targetFrom?: number,
    targetTo?: number,
    raisedFrom?: number,
    raisedTo?: number,
    availableShareFrom?: number,
    availableShareTo?: number
  ): Observable<SearchResponseModel<StartupModel>> {
    const query =
      (projectName?.trim() ? `projectName=${projectName}&` : '') +
      (status ? `status=${status}&` : '') +
      (targetFrom ? `targetFrom=${targetFrom}&` : '') +
      (targetTo ? `targetTo=${targetTo}&` : '') +
      (raisedFrom ? `raisedFrom=${raisedFrom}&` : '') +
      (raisedTo ? `raisedTo=${raisedTo}&` : '') +
      (availableShareFrom ? `availableShareFrom=${availableShareFrom}&` : '') +
      (availableShareTo ? `availableShareTo=${availableShareTo}&` : '') +
      `page=${pageIndex}&size=${pageSize}`
    // return of(simulateStartupAPI(
    //   pageIndex,
    //   pageSize,
    //   projectName,
    //   status,
    //   targetFrom,
    //   targetTo,
    //   raisedFrom,
    //   raisedTo,
    //   availableShareFrom,
    //   availableShareTo
    // )).pipe(delay(800));
    return this.http
      .get<SearchResponseModel<StartupModel>>(this.applicationConfigService.getEndpointFor(`/api/startups?${query}`))
      .pipe(map((response) => this.parseSearchResponse(response)))
  }

  getUserProjects(): Observable<ProjectModel[]> {
    return this.http.get<ProjectModel[]>(this.applicationConfigService.getEndpointFor('/api/projects'))
  }

  getMembers(projectId: string): Observable<TeamMemberModel[]> {
    return this.http.get<TeamMemberModel[]>(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/members`))
  }

  createProject(projectForm: FormData): Observable<any> {
    return this.http.post(this.applicationConfigService.getEndpointFor('/api/projects'), projectForm)
  }

  getProjectOverview(projectId: string): Observable<ProjectOveriewModel> {
    return this.http.get<ProjectOveriewModel>(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}`))
  }

  getPayosInfo(projectId: string): Observable<PayosInfoModel> {
    return this.http.get<PayosInfoModel>(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/payment-gateway`))
  }

  updatePayosInfo(projectId: string, payosInfo: PayosInfoModel): Observable<any> {
    return this.http.post(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/payment-gateway`), payosInfo, { responseType: 'text' as 'json' })
  }

  checkProjectClosable(projectId: string): Observable<CheckProjectClosableModel> {
    //return of(mockCannotCloseProject).pipe(delay(800));
    return this.http.get<CheckProjectClosableModel>(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/check-closable`))
  }

  closeProject(projectId: string): Observable<any> {
    return this.http.put(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/close`), null, { responseType: 'text' as 'json' })
  }

  checkUserLeaveable(projectId: string): Observable<CheckUserLeaveableModel> {
    return this.http.get<CheckUserLeaveableModel>(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/check-leaveable`))
  }

  setAppointmentUrl(projectId: string, appointmentUrl: string): Observable<any> {
    return this.http.post(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/add-appointment-url`), { appointmentUrl }, { responseType: 'text' as 'json' })
  }

  editPost(projectId: string, projectDetailPost: string): Observable<any> {
    return this.http.put(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/edit-post`), { projectDetailPost }, { responseType: 'text' })
  }
}
