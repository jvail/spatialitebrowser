import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { DataDataSource } from './data-datasource';
import { DBService } from '../db.service';
import { AppService } from '../app.service';
import { map } from 'rxjs/operators';
import { merge } from 'rxjs';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.css']
})
export class DataComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource: DataDataSource;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = [];
  pageSizeOptions = [25, 50, 100, 500, 1000, 2500, 10000];

  constructor(private dbservice: DBService, private appService: AppService) {

    this.appService.item$.subscribe(item => {
      this.paginator.firstPage();
      if (item) {
        this.dbservice.exec(`select * from ${item}`).then(results => {
          results = results[0];
          this.displayedColumns = results.length ? results[0].columns : [];
          const data = {
            columns: this.displayedColumns,
            values: results.length ? results[0].values : []
          };
          this.setData(data);
        });
      } else {
        this.setData({
          columns: [],
          values: []
        });
      }
    });

    this.appService.results$.subscribe(results => {
      if (results) {
        this.displayedColumns = results.length ? results[0].columns : [];
        const data = {
          columns: this.displayedColumns,
          values: results.length ? results[0].values : []
        };
        this.setData(data);
      } else {
        this.setData({
          columns: [],
          values: []
        });
      }
      this.paginator.firstPage();
    });

  }

  setData(data) {
    this.dataSource.setData(data);
    this.appService.draw$.next(this.dataSource.getPage());
  }

  ngOnInit() {

    this.dataSource = new DataDataSource(this.paginator, this.sort);
    merge(this.paginator.page, this.sort.sortChange).subscribe(() => {
      this.appService.draw$.next(this.dataSource.getPage());
    });

  }

  isObject(thing) {
    return typeof thing === 'object' && thing !== null;
  }

}
