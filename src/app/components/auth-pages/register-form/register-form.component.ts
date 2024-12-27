import { Component, OnInit } from '@angular/core'
import { MatInputModule } from '@angular/material/input'
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms'
import { addIcons } from 'ionicons'
import { eyeOffOutline, eyeOutline } from 'ionicons/icons'
import { RegisterService } from 'src/app/services/register.service'
import { Router, RouterModule } from '@angular/router'
import { MatSnackBar } from '@angular/material/snack-bar'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { CommonModule } from '@angular/common'
import { Authority } from 'src/app/shared/constants/authority.constants'
import { RegisterRequest } from 'src/app/shared/models/register.model'
import { catchError, tap, throwError } from 'rxjs'
import { NzMessageService } from 'ng-zorro-antd/message'

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss'],
  standalone: true,
  imports: [RouterModule, FormsModule, MatInputModule, ReactiveFormsModule, NzButtonModule, NzCheckboxModule, NzFormModule, NzInputModule, NzSelectModule, CommonModule],
})
export class RegisterFormComponent implements OnInit {
  loading = false
  showPassword = false
  registerForm = this.formBuilder.group(
    {
      email: ['', [Validators.required, Validators.email, emailDomainValidator('role')]],
      password: ['', Validators.required],
      confirmedPassword: ['', Validators.required],
      fullName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      role: ['User', Validators.required],
      address: ['', Validators.required],
      idCardNumber: ['', [Validators.required, this.idCardNumberValidator()]],
      studentCode: [''],
      academicYear: [''],
    },
    { validator: this.passwordMatchValidator }
  )

  authorityOptions: { label: string; value: string }[] = []

  constructor(private formBuilder: FormBuilder, private registerService: RegisterService, private router: Router, private message: NzMessageService) {
    addIcons({ eyeOutline, eyeOffOutline })
  }

  ngOnInit() {
    this.authorityOptions = Object.values(Authority).map((value) => {
      let label = '' // Initialize label
      switch (value) {
        case 'User':
          label = 'Sinh viên'
          break
        case 'Mentor':
          label = 'Người hướng dẫn'
          break
        case 'Investor':
          label = 'Nhà đầu tư'
          break
        default:
          label = value // Fallback to the original value if no match
      }

      return { label, value }
    })

    // Check if 'role' is already set to 'User'
    const initialRole = this.registerForm.get('role')?.value
    this.updateRoleValidators(initialRole)

    // Listen to role changes to update validators dynamically
    this.registerForm.get('role')?.valueChanges.subscribe((role) => {
      this.updateRoleValidators(role)
    })
  }

  updateRoleValidators(role: string | null) {
    const studentCodeControl = this.registerForm.get('studentCode')
    const academicYearControl = this.registerForm.get('academicYear')

    if (role === 'User') {
      studentCodeControl?.setValidators([Validators.required, this.studentCodeFormatValidator()])
      academicYearControl?.setValidators([Validators.required, this.academicYearFormatValidator()])
    } else {
      studentCodeControl?.clearValidators()
      academicYearControl?.clearValidators()
    }

    // Update validation status
    studentCodeControl?.updateValueAndValidity()
    academicYearControl?.updateValueAndValidity()
    this.registerForm.get('email')?.updateValueAndValidity()
  }

  getIdCardNumberErrorMessage() {
    const idCardNumberControl = this.registerForm.get('idCardNumber')
    if (idCardNumberControl?.hasError('required')) {
      return 'Vui lòng nhập mã thẻ ID'
    }
    if (idCardNumberControl?.hasError('invalidIdCardNumber')) {
      return 'Mã thẻ ID phải có 12 chữ số'
    }
    return '' // No error
  }

  academicYearFormatValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const academicYearRegex = /^\d{4}-\d{4}$/ // Format: YYYY-YYYY
      if (control.value && !academicYearRegex.test(control.value)) {
        return { invalidFormat: true }
      }
      return null
    }
  }

  studentCodeFormatValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const studentCodeRegex = /^(SE|SA|SS|IA)\d{6}$/ // Prefix (SE, SA, SS, IA) + 6 digits
      if (control.value && !studentCodeRegex.test(control.value)) {
        return { invalidFormat: true } // Invalid format error
      }
      return null // Valid format
    }
  }

  idCardNumberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const idCardNumber = control.value
      const idCardRegex = /^\d{12}$/ // Checks if the value is exactly 12 digits
      if (idCardNumber && !idCardRegex.test(idCardNumber)) {
        return { invalidIdCardNumber: true } // Invalid if it doesn't match 12 digits
      }
      return null // Valid if it matches the format
    }
  }

  onSubmit() {
    //return if form invalid

    console.log(this.registerForm.getRawValue())
    console.log(this.registerForm.valid)

    if (this.registerForm.invalid) {
      return
    }
    this.loading = true
    const registerData: RegisterRequest = this.registerForm.getRawValue()
    this.registerService
      .register(registerData)
      .pipe(
        tap((response: string) => {
          this.loading = false
          this.router.navigate(['login'])
          this.message.success(response)
        }),
        catchError((error) => {
          this.loading = false
          if (error.status === 400 && error.error) {
            // Handle the specific error case, such as account already exists
            this.message.error(error.error || 'Đã xảy ra lỗi khi đăng ký')
          } else {
            // Handle other errors
            this.message.error('Đã xảy ra lỗi, vui lòng thử lại!')
            console.log(error.message)
          }
          return throwError(error) // Re-throw the error for further handling if needed
        })
      )
      .subscribe()
  }

  getEmailErrorMessage() {
    const emailControl = this.registerForm.get('email')

    if (emailControl?.hasError('required')) {
      return 'Vui lòng nhập email'
    }
    if (emailControl?.hasError('email')) {
      return 'Email không hợp lệ'
    }
    if (emailControl?.hasError('invalidEmailDomain')) {
      return 'Vui lòng nhập email fpt.edu.vn'
    }

    return '' // No error
  }

  getPasswordErrorMessage() {
    const passwordControl = this.registerForm.get('password')

    if (passwordControl?.hasError('required')) {
      return 'Vui lòng nhập mật khẩu'
    }
    if (passwordControl?.hasError('minlength')) {
      return 'Mật khẩu phải có ít nhất 8 ký tự'
    }

    return '' // No error
  }

  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password')
    const confirmedPassword = control.get('confirmedPassword')
    if (password && confirmedPassword && password.value !== confirmedPassword.value) {
      confirmedPassword.setErrors({ passwordMismatch: true })
    } else {
      confirmedPassword?.setErrors(null)
    }
  }
}
function emailDomainValidator(roleField: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const email = control.value as string
    const parent = control.parent // Access the form group
    const role = parent?.get(roleField)?.value
    if (role === 'User' && !email.endsWith('@fpt.edu.vn')) {
      return { invalidEmailDomain: true }
    }
    return null
  }
}
