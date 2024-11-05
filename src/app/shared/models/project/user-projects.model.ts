import { ProjectModel } from './project.model'

export type UserProjectsModel = {
  listOwnProject: ProjectModel[]
  listParticipatedProject: ProjectModel[]
}
