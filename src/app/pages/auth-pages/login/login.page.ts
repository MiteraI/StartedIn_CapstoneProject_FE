import { Component, OnInit } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { LoginFormComponent } from 'src/app/components/auth-pages/login-form/login-form.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    LoginFormComponent,
  ],
})
export class LoginPage {
  constructor() {}
}
