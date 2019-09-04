import { Component } from '@angular/core';
import { UntilDestroy } from 'ngx-take-until-destroy';
import { fromEvent } from 'rxjs';
import { pluck } from 'rxjs/operators';

@UntilDestroy({ arrayName: 'subscriptions' })
@Component({
  selector: 'app-document-click',
  templateUrl: './document-click.component.html'
})
export class DocumentClickComponent {
  clientX = 0;

  subscriptions = [
    fromEvent<KeyboardEvent>(document, 'click')
      .pipe(pluck<KeyboardEvent, number>('clientX'))
      .subscribe(clientX => {
        console.log(`You've clicked on the document and clientX is ${clientX}`);
        this.clientX = clientX;
      })
  ];
}
