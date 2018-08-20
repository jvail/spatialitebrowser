import { DataSource } from '@angular/cdk/collections';
import { MatPaginator, MatSort } from '@angular/material';
import { flatMap, debounceTime } from 'rxjs/operators';
import { Subject, Observable, merge, defer } from 'rxjs';
import { AppService, Item } from '../app.service';
import { DBService } from '../db.service';
import { IResult } from 'spatiasql/dist/spatiasql';
import { MatSnackBar } from '@angular/material';

export class DataDataSource extends DataSource<any> {

  item: Item = { type: '', name: '' };
  dataChanged$ = new Subject();
  data: IResult = {
    columns: [],
    values: []
  };
  length = 0;
  sql = '';

  constructor(private paginator: MatPaginator, private sort: MatSort,
    private appService: AppService, private dbService: DBService, public snackBar: MatSnackBar) {
    super();

    this.appService.item$.subscribe(item => {
      if (item.name && item.type) {
        this.item = item;
        this.dbService.exec(`select count(*) from ${item.name}`).then(results => {
          this.length = results[0][0].values[0][0];
          if (this.length === 0) {
            this.snackBar.open('Ok - Result empty');
          }
        });
        this.sort.active = '';
        this.dataChanged$.next();
        this.sql = 'sql';
      } else {
        this.item = { type: '', name: '' };
        this.length = 0;
        this.data.columns = [];
        this.data.values = [];
        this.sort.active = '';
        this.sql = '';
      }
      this.paginator.firstPage();
    });

    this.appService.query$.subscribe(sql => {
      if (sql.trim()) {
        this.dbService.exec(sql)
          .then(results => {
            this.item = { type: '', name: '' };
            this.sql = sql;
            this.length = 0;
            this.sort.active = '';
            if (results[0] && results[0][0]) {
              this.data = results[0][0];
              this.length = this.data.values.length;
              this.dataChanged$.next();
            } else {
              if (Array.isArray(results[0]) && results[0].length === 0) {
                this.snackBar.open('OK - Result empty');
              }
              this.data.columns = [];
              this.data.values = [];
            }
          })
          .catch(err => console.log(err));
      }
    });

  }

  connect(): Observable<any[]> {

    return merge(this.paginator.page, this.sort.sortChange, this.dataChanged$).pipe(
      debounceTime(1000),
      flatMap(() => {
        let sql = '';
        if (this.item.name && this.item.type) {
          if (this.item.type === 'Tables' || this.item.type === 'Meta Tables') {
            sql = `
              select * from ${this.item.name}
              where rowid not in (
                select rowid from ${this.item.name}
                order by ${this.sort.active ? this.sort.active : 'rowid'} ${this.sort.direction}
                limit ${this.paginator.pageIndex * this.paginator.pageSize}
              )
              order by ${this.sort.active ? this.sort.active : 'rowid'} ${this.sort.direction}
              limit ${this.paginator.pageSize}
            `;
          } else if (this.item.type === 'Views' || this.item.type === 'Meta Views') {
            sql = `select * from ${this.item.name}\n`;
            if (this.sort.active) {
              sql += `order by ${this.sort.active} ${this.sort.direction}\n`;
            }
            sql += `limit ${this.paginator.pageSize} offset ${this.paginator.pageIndex * this.paginator.pageSize}`;
          } else {
            throw this.item;
          }
        } else if (this.sql) {
          const data = this.getPagedData(this.getSortedData(this.data.values));
          this.appService.draw$.next(data);
          return [data];
        }

        return defer(() => {
          return this.dbService.exec(sql).then(res => {
            const data = res[0][0];
            if (data) {
              this.data = res[0][0];
              this.appService.draw$.next(this.data.values);
            } else {
              this.data.values = [];
              this.appService.draw$.next([]);
            }
            return this.data.values;
          });
        });

      }));

  }

  disconnect() {}

  private getPagedData(data: any[]) {
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return data.slice(startIndex, startIndex + this.paginator.pageSize);
  }

  private getSortedData(data: any[]) {
    if (!this.sort.active || this.sort.direction === '' || data.length === 0) {
      return data;
    }

    const asc = this.sort.direction === 'asc';
    const idx = this.data.columns.indexOf(this.sort.active);

    switch (typeof data[0][idx]) {
      case 'number':
        if (asc) {
          return data.sort((a, b) => a[idx] - b[idx]);
        } else {
          return data.sort((a, b) => b[idx] - a[idx]);
        }
      case 'string':
        if (asc) {
          return data.sort((a, b) => ('' + a[idx]).localeCompare('' + b[idx]));
        } else {
          return data.sort((a, b) => -('' + a[idx]).localeCompare('' + b[idx]));
        }
      default:
        return data;
    }
  }


}

