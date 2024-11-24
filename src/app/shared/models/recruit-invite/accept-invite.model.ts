import { ApplicationType } from "../../enums/application-type.enum"
import { TeamRole } from "../../enums/team-role.enum"

export type AcceptInvite = {
    type: ApplicationType,
    role: TeamRole
}