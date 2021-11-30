import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'noimage'
})
export class NoimagePipe implements PipeTransform {
 
  transform( item: any ): string {

    if ( !item.hasImage ) {
      return 'assets/img/noimage.png';
    } else {
      return item.webImage.url;
    }

  }

}
