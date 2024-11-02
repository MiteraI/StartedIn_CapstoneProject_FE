import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'initialsOnly',
  standalone: true
})
export class InitialsOnlyPipe implements PipeTransform {
  transform(value: string): string {
    return value
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
