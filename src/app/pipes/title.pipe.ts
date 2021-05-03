import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'title'})
export class TitlePipe implements PipeTransform {

  transform(value: string) : string {
    if (!value) return '';

    const delimiter = ' ';
    var words = value.split(delimiter);
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(delimiter);
  }
}
