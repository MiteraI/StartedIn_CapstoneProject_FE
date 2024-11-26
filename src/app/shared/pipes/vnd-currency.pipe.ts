import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'vndCurrency',
  standalone: true,
})
export class VndCurrencyPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value == null || isNaN(Number(value))) {
      return '0₫'; // Fallback for invalid or undefined values
    }

    // Convert to number if value is a string
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;

    // Format number as VND currency
    return numericValue.toLocaleString('vi-VN') + '₫';
  }
}