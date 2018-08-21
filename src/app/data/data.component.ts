import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { DataDataSource } from './data-datasource';
import { DBService } from '../db.service';
import { AppService } from '../app.service';

@Component({
  selector: 'app-data',
  templateUrl: './data.component.html',
  styleUrls: ['./data.component.css']
})
export class DataComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource: DataDataSource;

  displayedColumns = [];
  pageSizeOptions = [25, 50, 100, 500, 1000, 2500, 10000];

  constructor(private dbservice: DBService, public appService: AppService, public snackBar: MatSnackBar) {}

  ngOnInit() {

    this.dataSource = new DataDataSource(this.paginator, this.sort, this.appService, this.dbservice, this.snackBar);

  }

  // TODO: return proper string for all not-string-or-number types
  getDisplayValue(thing: any) {

    switch (typeof thing) {
      case 'object':
        if (thing === null) {
          return 'NULL';
        } else {
          return 'blob';
        }
      default:
        return thing;
    }

  }

}
