import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { DBService } from './db.service';
import { map } from 'rxjs/operators';
import { IResult } from 'spatiasql/dist/spatiasql';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  item$: Subject<string> = new Subject();
  results$: Subject<any[] | IResult[]> = new Subject();
  draw$: Subject<any[]> = new Subject();
  resizeMap$: Subject<boolean> = new Subject();

  constructor(private dbservice: DBService) {}

}
