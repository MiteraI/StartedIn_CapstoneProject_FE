export class Account {
  constructor(
    public id: string,
    public authorities: string[],
    public email: string,
    public bio: string,
    public fullName: string,
    public profilePicture: string | null
  ) {}
}
