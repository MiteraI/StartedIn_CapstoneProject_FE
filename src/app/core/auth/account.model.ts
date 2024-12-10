import { Authority } from "src/app/shared/constants/authority.constants";

export class Account {
  constructor(
    public id: string,
    public authorities: Authority[],
    public email: string,
    public bio: string,
    public fullName: string,
    public profilePicture: string | null
  ) {}
}
