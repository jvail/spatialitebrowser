import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { DataDataSource } from './data-datasource';
import { DBService } from '../db.service';
import { AppService } from '../app.service';
import { ToastrService } from 'ngx-toastr';

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

  constructor(private dbservice: DBService, public appService: AppService, private toastrService: ToastrService) {}

  ngOnInit() {

    this.dataSource = new DataDataSource(this.paginator, this.sort, this.appService, this.dbservice, this.toastrService);

  }

  // TODO: return proper string for all not-string-or-number types
  getDisplayValue(thing) {

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
