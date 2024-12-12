import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'percentFormatter',
  standalone: true,
})
export class PercentFormatterPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (!value) {
      return '0%'; // Giá trị mặc định
    }
    return `${parseFloat(value.toFixed(2))}%`; // Giữ nhiều nhất 2 chữ số sau dấu thập phân
  }
}
