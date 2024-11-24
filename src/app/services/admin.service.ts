import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApplicationConfigService } from "../core/config/application-config.service";
import { Observable } from "rxjs";
import { SearchResponseModel } from "../shared/models/search-response.model";
import { ProjectModel } from "../shared/models/project/project.model";

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  constructor(
    private http: HttpClient,
    private applicationConfigService: ApplicationConfigService
  ){}

  importUsers(file: File) : Observable<any> {
    const formdata = new FormData();
    formdata.append('formFile', file);
    return this.http.post(
      this.applicationConfigService.getEndpointFor(`/api/admin/excel-import`),
      formdata,
      { responseType: 'text' as 'json' }
    );
  }

  getProjectList(
    pageIndex: number,
    pageSize: number
  ) : Observable<SearchResponseModel<ProjectModel>> {
    const query = `page=${pageIndex}&size=${pageSize}`;
    return this.http.get<SearchResponseModel<ProjectModel>>(
      this.applicationConfigService.getEndpointFor(`/api/admin/projects?${query}`),
    );
  }

  getProject(id: string) : Observable<ProjectModel> {
    return this.http.get<ProjectModel>(
      this.applicationConfigService.getEndpointFor(`/api/admin/projects/${id}`),
    );
  }

  verifyProject(id: string) : Observable<any> {
    return this.http.put(
      this.applicationConfigService.getEndpointFor(`/api/admin/projects/${id}/activate`),
      null,
    );
  }

  getContractDownloadUrl(projectId: string, contractId: string) : Observable<any> {
    const url = `/api/admin/projects/${projectId}/internal-contract/${contractId}/download`;
    return this.http.post(
      this.applicationConfigService.getEndpointFor(url),
      null
    );
  }
}
