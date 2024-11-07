import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
  name: 'dateDisplay',
  standalone: true,
})
export class DateDisplayPipe implements PipeTransform {
  transform(value: Date | string | number): string {
    const date = new Date(value)
    const today = new Date()

    // Check if the date is today
    const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()

    if (isToday) {
      // If the date is today, show only the time in HH:mm format
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      // If the date is in the past, show it in YYYY-MM-DD format
      return date.toISOString().split('T')[0]
    }
  }
}
