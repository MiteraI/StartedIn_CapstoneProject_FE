import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'percentFormatter',
  standalone: true,
})
export class PercentFormatterPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null || isNaN(value)) {
      return '0%'; // Giá trị mặc định
    }
    return `${value.toFixed(2)}%`; // Giữ 2 chữ số sau dấu thập phân
  }
}