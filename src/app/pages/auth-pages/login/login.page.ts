import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonLabel,
  IonInput,
  IonButton,
  IonItem,
  IonButtons,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { catchError, tap, throwError } from 'rxjs';
import { AuthJwtService } from 'src/app/core/auth/auth-jwt.service';
import { Login } from 'src/app/shared/models/login.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonButtons,
    IonInput,
    IonLabel,
    IonButton,
    IonContent,
    IonItem,
    IonHeader,
    IonTitle,
    IonToolbar,
    FormsModule,
    ReactiveFormsModule,
    IonIcon,
  ],
})
export class LoginPage implements OnInit {
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
    console.log('Form submitted');
    this.failedValidation = this.loginForm.invalid;
    if (this.failedValidation) {
      console.log('Form is invalid');
      return;
    }
    this.authService
      .login(this.loginForm.getRawValue())
      .pipe(
        tap((response: any) => {
          this.authenticationError = false;
          console.log(response);
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
