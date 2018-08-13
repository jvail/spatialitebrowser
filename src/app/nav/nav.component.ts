import { Component, Output, Inject, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DBService, IVersion, ISRID } from '../db.service';
import * as FileSaver from 'file-saver';
import { AppService } from '../app.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-version-dialog',
  template: `
    <h2 mat-dialog-title>Compiled with</h2>
    <mat-list>
      <mat-list-item>SpatiaLite {{ data.spatialite }}</mat-list-item>
      <mat-list-item>SQLite {{ data.sqlite }}</mat-list-item>
      <mat-list-item>Proj4 {{ data.proj4 }}</mat-list-item>
      <mat-list-item>GEOS {{ data.geos }}</mat-list-item>
    </mat-list>
  `
})

export class VersionDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<VersionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IVersion) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}

@Component({
  selector: 'app-srid-dialog',
  template: `
    <h2 mat-dialog-title>Select SRID & Encoding</h2>
    <mat-dialog-content>
      <mat-form-field style="width: 350px;">
        <mat-select placeholder="DBF Encoding" [(value)]="selection.encoding">
          <mat-option value="CP1251">CP1251</mat-option>
          <mat-option value="UTF-8">UTF-8</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field style="width: 350px;">
        <mat-select placeholder="Spatial Reference System Identifier" [(value)]="selection.srid">
          <mat-option *ngFor="let d of data" [value]="d.srid">
            {{ d.srid  + ' - ' + d.name }}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <span class="fill-space"></span>
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-button [mat-dialog-close]="selection">Ok</button>
    </mat-dialog-actions>
  `
})

export class SRIDDialogComponent {

  selection = {
    encoding: 'CP1251',
    srid: 4326
  };

  constructor(
    public dialogRef: MatDialogRef<SRIDDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ISRID[]) { }

}

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {


  filter: BehaviorSubject<string> = new BehaviorSubject('Tables');
  item: BehaviorSubject<string> = new BehaviorSubject('');
  @Output() filter$ = this.filter.asObservable();
  @Output() item$ = this.item.asObservable();

  @ViewChild('inputsqlite3') inputSqlite3: ElementRef;
  @ViewChild('inputshp') inputShp: ElementRef;
  @ViewChild('appeditor') appeditor;

  dbInitialized = false;
  dbIsBusy = false;

  showDataTable = false;
  sidenavdataOpened = false;

  tables: string[] = [];
  views: string[] = [];
  spatialRefSys: ISRID[] = [];

  constructor(
    private dbservice: DBService,
    private appservice: AppService,
    private toastr: ToastrService,
    public versionDialog: MatDialog,
    public sridDialog: MatDialog) {

      this.dbservice.items$.subscribe(items => {
        this.tables = items.tables;
        this.views = items.views;
      });

      this.dbservice.initialized$.subscribe(initialized => this.dbInitialized = initialized);
      this.dbservice.spatialRefSys$.subscribe(data => {
        this.spatialRefSys = data;
      });

      this.dbservice.busy$.subscribe(busy => {
        this.dbIsBusy = busy;
      });

      this.dbservice.error$.subscribe(error => {
        if (error) {
          this.toastr.error(error, '', {
            timeOut: 3000,
            positionClass: 'toast-bottom-right'
          });
        }
      });

      this.item$.subscribe(item => appservice.item$.next(item));

    }


  onSidenavOpened(opened: boolean) {
    this.sidenavdataOpened = opened;
    if (opened) {
      this.appservice.resizeMap$.next(opened);
    }
  }

  onSidenavClosedStart() {
    this.appservice.resizeMap$.next(false);
  }

  showVersion() {
    this.dbservice.version().then(data => {
      this.versionDialog.open(VersionDialogComponent, {
        width: '400px',
        data: data
      });
    });
  }

  showSRID() {
    return this.sridDialog.open(SRIDDialogComponent, {
        width: '400px',
        data: this.spatialRefSys
      });
  }

  refreshItems() {
    this.dbservice.refreshItems();
  }

  runQuery() {
    const sql = this.appeditor.sql();
    this.dbservice.exec(sql)
      .then(results => {
        results = results[0];
        this.appservice.results$.next(results);
      });
  }

  addFile(type: string, files: FileList) {

    try {

      const reader = new FileReader();

      switch (type) {
        case 'sqlite3':
          reader.onload = () => {
            this.dbservice.open(reader.result);
            this.appservice.item$.next('');
            this.inputSqlite3.nativeElement.value = '';
          };
          reader.readAsArrayBuffer(files.item(0));
          break;
        case 'shp':
          const shpfiles = {
            shp: null,
            shx: null,
            dbf: null
          };
          let tablename = '';
          for (let i = 0; i < files.length; i++) {
            const file = files.item(i);
            tablename = file.name.toLowerCase().substr(0, file.name.length - 4);
            switch (file.name.toLowerCase().substring(file.name.length - 3)) {
              case 'shp':
                shpfiles.shp = file;
                break;
              case 'shx':
                shpfiles.shx = file;
                break;
              case 'dbf':
                shpfiles.dbf = file;
                break;
            }
          }
          (async (dbservice) => {
            shpfiles.shp = await this.readFile(reader, shpfiles.shp);
            shpfiles.shx = await this.readFile(reader, shpfiles.shx);
            shpfiles.dbf = await this.readFile(reader, shpfiles.dbf);
            this.showSRID().afterClosed().subscribe(result => {
              if (result) {
                // this.spatialRefSys.selected = result.srid;
                dbservice.loadshp(tablename, result.encoding, result.srid, shpfiles)
                  .then(res => console.log(res));
                this.inputShp.nativeElement.value = '';
              }
            });
          })(this.dbservice);
        }
    } catch (err) {
      console.log(err);
    }

  }

  async readFile(reader, file) {
      return new Promise((res, rej) => {
        reader.onload = () => {
          res(reader.result);
        };
        reader.readAsArrayBuffer(file);
      });

  }

  async export() {
    const file = await this.dbservice.export();
    FileSaver.saveAs(new Blob([file], { type: 'application/octet-stream' }), 'db.sqlite3');
  }


}
