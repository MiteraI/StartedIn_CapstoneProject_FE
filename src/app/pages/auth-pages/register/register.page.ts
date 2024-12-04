import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone'
import { RegisterFormComponent } from 'src/app/components/auth-pages/register-form/register-form.component'

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, RegisterFormComponent],
})
export class RegisterPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
