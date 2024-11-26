import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ApplicationConfigService } from "../core/config/application-config.service";
import { AssetStatus } from "../shared/enums/asset-status.enum";
import { Observable } from "rxjs";
import { SearchResponseModel } from "../shared/models/search-response.model";
import { AssetModel } from "../shared/models/asset/asset.model";
import { AssetCreateModel } from "../shared/models/asset/asset-create.model";

@Injectable({
  providedIn: 'root',
})
export class AssetService {
  constructor(
    private http: HttpClient,
    private applicationConfigService: ApplicationConfigService
  ){}

  getAssetListForProject(
    id: string,
    pageIndex: number,
    pageSize: number,
    assetName?: string,
    fromPrice?: number,
    toPrice?: number,
    status?: AssetStatus,
    serialNumber?: string,
    fromDate?: Date,
    toDate?: Date
  ) : Observable<SearchResponseModel<AssetModel>> {
    const query = (assetName?.trim() ? `assetName=${assetName}&` : '')
      + (status ? `status=${status}&` : '')
      + (fromPrice ? `fromPrice=${fromPrice}&`:'')
      + (toPrice ? `toPrice=${toPrice}&`:'')
      + (serialNumber ? `serialNumber=${serialNumber}&`:'')
      + (fromDate ? `fromDate=${fromDate.toISOString().split('T')[0]}&`:'')
      + (toDate ? `toDate=${toDate.toISOString().split('T')[0]}&`:'')
      + `page=${pageIndex}&size=${pageSize}`;
    return this.http.get<SearchResponseModel<AssetModel>>(
      this.applicationConfigService.getEndpointFor(`/api/projects/${id}/assets?${query}`),
    );
  }

  createNewAsset(projectId: string, createAsset: AssetCreateModel) {
    return this.http.post(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/assets`), createAsset)
  }
}
