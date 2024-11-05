import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'vndCurrency',
  standalone: true
})
export class VndCurrencyPipe implements PipeTransform {
  transform(value: number): string {
    return value.toLocaleString('vi-VN') + '₫';
  }
}
