import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ApplicationConfigService } from '../core/config/application-config.service'
import { CreateRecruitmentPost } from '../shared/models/recruitment/create-recruitment-post.model'
import { RecruitmentInProject } from '../shared/models/recruitment/recruitment-in-project.model'
import { NzUploadFile } from 'ng-zorro-antd/upload'
import { RecruitmentImage } from '../shared/models/recruitment/recruitment-image.model'
import { UpdateRecruitmentPost } from '../shared/models/recruitment/update-recruitment-post.model'

@Injectable({
  providedIn: 'root',
})
export class RecruitmentService {
  constructor(private http: HttpClient, private applicationConfigService: ApplicationConfigService) {}

  getProjectRecruitmentPosts(projectId: string) {
    return this.http.get<RecruitmentInProject>(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/recruitments`))
  }

  createRecruitmentPost(projectId: string, data: CreateRecruitmentPost) {
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('content', data.content)
    formData.append('isOpen', data.isOpen.toString())
    data.files.forEach((file) => {
      formData.append('recruitFiles', file)
    })
    return this.http.post(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/recruitments`), formData)
  }

  updateRecruitmentPost(projectId: string, data: UpdateRecruitmentPost) {
    return this.http.put(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/recruitments`), data)
  }

  uploadImage(projectId: string, file: NzUploadFile) {
    const formData = new FormData()
    formData.append('recruitFile', file as unknown as File)
    return this.http.post<RecruitmentImage>(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/recruitments/images/add`), formData)
  }

  deleteImage(projectId: string, fileId: string) {
    return this.http.delete(this.applicationConfigService.getEndpointFor(`/api/projects/${projectId}/recruitments/images/${fileId}/remove`))
  }
}
