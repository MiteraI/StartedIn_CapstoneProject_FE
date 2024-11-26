import { FullProfile } from "../user/full-profile.model";

export type TaskComment = {
    id: string;
    content: string;
    createdTime: string;
    user: FullProfile
}