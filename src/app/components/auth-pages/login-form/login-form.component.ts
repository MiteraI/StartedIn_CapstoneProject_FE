import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router, RouterModule } from '@angular/router'
import { IonInput, IonButton } from '@ionic/angular/standalone'
import { NzMessageService } from 'ng-zorro-antd/message'
import { catchError, tap, throwError } from 'rxjs'
import { AuthJwtService } from 'src/app/core/auth/auth-jwt.service'
import { Login } from 'src/app/shared/models/login.model'

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  standalone: true,
  imports: [RouterModule, IonInput, IonButton, FormsModule, ReactiveFormsModule],
})
export class LoginFormComponent implements OnInit {
  loginModel: Login | undefined
  loginForm: FormGroup
  showPassword = false
  failedValidation = false
  constructor(private formBuilder: FormBuilder, private authService: AuthJwtService, private router: Router, private message: NzMessageService) {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    })
  }

  ngOnInit() {}

  onSubmit() {
    this.failedValidation = this.loginForm.invalid
    if (this.failedValidation) {
      return
    }
    this.authService
      .login(this.loginForm.getRawValue())
      .pipe(
        tap((response: any) => {
          if (!this.router.getCurrentNavigation()) {
            this.router.navigate(['/'])
            this.message.success('Đăng nhập thành công')
          }
        }),
        catchError((error) => {
          this.message.error(error.error)
          return throwError(error)
        })
      )
      .subscribe()
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword
  }
}
