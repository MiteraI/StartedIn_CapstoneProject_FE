import { Injectable } from '@angular/core'
import { NzNotificationService } from 'ng-zorro-antd/notification'

@Injectable({
  providedIn: 'root',
})
export class AntdNotificationService {
  constructor(private notification: NzNotificationService) {}

  openSuccessNotification(message: string, description: string): void {
    this.notification.success(message, description, { nzDuration: 2000 })
  }

  openErrorNotification(message: string, description: string): void {
    this.notification.error(message, description, { nzDuration: 2000 })
  }

  openInfoNotification(message: string, description: string): void {
    this.notification.info(message, description, { nzDuration: 2000 })
  }

  openBlankNotification(message: string, description: string): void {
    this.notification.blank(message, description, { nzDuration: 2000 })
  }

  openWarningNotification(message: string, description: string): void {
    this.notification.warning(message, description, { nzDuration: 2000 })
  }
}
