import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { IonInput, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOffOutline, eyeOutline } from 'ionicons/icons';
import { catchError, tap, throwError } from 'rxjs';
import { AuthJwtService } from 'src/app/core/auth/auth-jwt.service';
import { Login } from 'src/app/shared/models/login.model';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  standalone: true,
  imports: [
    RouterModule,
    IonIcon,
    IonInput,
    IonButton,
    IonIcon,
    FormsModule,
    ReactiveFormsModule,
  ],
})
export class LoginFormComponent implements OnInit {
  loginModel: Login | undefined;
  loginForm: FormGroup;
  showPassword = false;
  failedValidation = false;
  authenticationError = false;
  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthJwtService,
    private router: Router
  ) {
    addIcons({ eyeOutline, eyeOffOutline });
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit() {}

  onSubmit() {
    this.authenticationError = false;
    this.failedValidation = this.loginForm.invalid;
    if (this.failedValidation) {
      return;
    }
    this.authService
      .login(this.loginForm.getRawValue())
      .pipe(
        tap((response: any) => {
          this.authenticationError = false;
          if (!this.router.getCurrentNavigation()) {
            this.router.navigate(['/']);
          }
        }),
        catchError((error) => {
          this.authenticationError = true;
          return throwError(error);
        })
      )
      .subscribe();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
