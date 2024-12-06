import { Authority } from '../constants/authority.constants'

export type RegisterRequest = {
  email: string
  password: string
  confirmedPassword: string
  fullName: string
  phoneNumber: string
  role: Authority
  studentCode: string
  address: string
  idCardNumber: string
  academicYear: string
}
