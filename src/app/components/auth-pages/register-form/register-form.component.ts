import { Component, OnInit } from '@angular/core'
import { MatInputModule } from '@angular/material/input'
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { addIcons } from 'ionicons'
import { eyeOffOutline, eyeOutline } from 'ionicons/icons'
import { RegisterRequest } from 'src/app/shared/models/register.model'
import { RegisterService } from 'src/app/services/register.service'
import { catchError, tap, throwError } from 'rxjs'
import { Router } from '@angular/router'
import { MatSnackBar } from '@angular/material/snack-bar'
import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzSelectModule } from 'ng-zorro-antd/select'
import { CommonModule } from '@angular/common'

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
      email: ['', Validators.required],
      password: ['', Validators.required],
      confirmedPassword: ['', Validators.required],
      fullName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
    },
    { validator: this.passwordMatchValidator }
  )

  

  constructor(private formBuilder: FormBuilder, private registerService: RegisterService, private router: Router, private snackBar: MatSnackBar) {
    addIcons({ eyeOutline, eyeOffOutline })
  }

  ngOnInit() {}

  onSubmit() {
    //return if form invalid
    if (this.registerForm.invalid) {
      return
    }
    const registerData: RegisterRequest = this.registerForm.getRawValue()
    this.registerService
      .register(registerData)
      .pipe(
        tap((response: string) => {
          this.router.navigate(['login'])
          this.snackBar.open(response, 'Đóng', {
            duration: 5000,
          })
        }),
        catchError((error) => {
          return throwError(error)
        })
      )
      .subscribe()
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

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword
  }
}
