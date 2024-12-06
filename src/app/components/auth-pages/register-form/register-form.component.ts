import { Component, OnInit } from '@angular/core'
import { MatInputModule } from '@angular/material/input'
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms'
import { addIcons } from 'ionicons'
import { eyeOffOutline, eyeOutline } from 'ionicons/icons'
import { RegisterService } from 'src/app/services/register.service'
import { Router } from '@angular/router'
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
  imports: [FormsModule, MatInputModule, ReactiveFormsModule, NzButtonModule, NzCheckboxModule, NzFormModule, NzInputModule, NzSelectModule, CommonModule],
})
export class RegisterFormComponent implements OnInit {
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
      idCardNumber: ['', Validators.required],
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
      let label = ''; // Initialize label
      switch (value) {
        case 'User':
          label = 'Sinh viên';
          break;
        case 'Mentor':
          label = 'Người hướng dẫn';
          break;
        case 'Investor':
          label = 'Nhà đầu tư';
          break;
        default:
          label = value; // Fallback to the original value if no match
      }
    
      return { label, value };
    })

    this.registerForm.get('role')?.valueChanges.subscribe(() => {
      this.registerForm.get('email')?.updateValueAndValidity()
      this.registerForm.get('studentCode')?.setValue('')
      this.registerForm.get('academicYear')?.setValue('')
    })
  }

  onSubmit() {
    //return if form invalid

    console.log(this.registerForm.getRawValue())
    console.log(this.registerForm.valid)

    if (this.registerForm.invalid) {
      return
    }
    const registerData: RegisterRequest = this.registerForm.getRawValue()
    this.registerService
      .register(registerData)
      .pipe(
        tap((response: string) => {
          this.router.navigate(['login'])
          this.message.success(response)
        }),
        catchError((error) => {
          this.message.error(error.message)
          return throwError(error)
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
