import { DataSource } from '@angular/cdk/collections';
import { MatPaginator, MatSort } from '@angular/material';
import { map } from 'rxjs/operators';
import { Subject, Observable, of as observableOf, merge } from 'rxjs';

export class DataDataSource extends DataSource<any> {

  data = {
    columns: [],
    values: []
  };
  dataChanged$ = new Subject();

  constructor(private paginator: MatPaginator, private sort: MatSort) {
    super();
  }

  setData(data) {
    this.data.columns = data.columns;
    this.data.values = data.values;
    this.paginator.length = this.data.values.length;
    this.dataChanged$.next();
  }

  connect(): Observable<any[]> {

    const dataMutations = [
      observableOf(this.data.values),
      this.dataChanged$,
      this.paginator.page,
      this.sort.sortChange
    ];

    const ret = merge(...dataMutations).pipe(map(() => {
      return this.getPagedData(this.getSortedData(this.data.values));
    }));

    return ret;
  }

  disconnect() {}

  getPage() {
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return this.data.values.slice(startIndex, startIndex + this.paginator.pageSize);
  }

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

