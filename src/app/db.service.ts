import { Injectable } from '@angular/core';
import { Database, IShpFiles, IResult, IGeoJSONOptions } from 'spatiasql/dist/spatiasql';
import { BehaviorSubject } from 'rxjs';

export interface IVersion {
  spatialite: string;
  sqlite: string;
  proj4: string;
  geos: string;
}

export interface ISRID {
  srid: number;
  name: string;
}

export interface IItems {
  tables: string[];
  views: string[];
}

@Injectable({
  providedIn: 'root'
})
export class DBService {

  private db: Database;

  private sysTables = ['sqlite_sequence', 'geometry_columns', 'spatial_ref_sys', 'spatialite_history'];
  private sysViews = ['geom_cols_ref_sys'];

  private items: BehaviorSubject<IItems> = new BehaviorSubject({ tables: [], views: [] });
  items$ = this.items.asObservable();

  private initialized: BehaviorSubject<boolean> = new BehaviorSubject(false);
  initialized$ = this.initialized.asObservable();

  private spatialRefSys: BehaviorSubject<any[]> = new BehaviorSubject([]);
  spatialRefSys$ = this.spatialRefSys.asObservable();

  private busy: BehaviorSubject<boolean> = new BehaviorSubject(false);
  busy$ = this.busy.asObservable();

  private error: BehaviorSubject<string> = new BehaviorSubject('');
  error$ = this.error.asObservable();

  constructor() {

    this.db = new Database();

    fetch('assets/db/db.sqlite').then(file => {
      file.arrayBuffer().then(buffer => {
        this.open(buffer);
      });
    });

  }

  async exec(sql: string, userData?: any): Promise<IResult[] | any[]> {

    this.busy.next(true);

    return this.db.exec(sql, userData)
      .then(res => {
        this.busy.next(this.db.busy());
        return res;
      })
      .catch(err => {
        this.busy.next(this.db.busy());
        this.error.next(err);
        return [];
      });
  }

  async asGeoJSON(geoms: Uint8Array[], options?: IGeoJSONOptions) {

    this.busy.next(true);

    return this.db.asGeoJSON(geoms, options)
      .then(res => {
        this.busy.next(this.db.busy());
        return res;
      })
      .catch(err => {
        this.busy.next(this.db.busy());
        this.error.next(err);
        return [];
      });
  }

  async refreshItems() {
    const result = await this.db.exec('select name, type from sqlite_master order by name');
    const items = result[0][0].values.reduce((obj, value) => {
      switch (value[1]) {
        case 'table':
          if (this.sysTables.indexOf(value[0]) < 0) {
            obj.tables.push(value[0]);
          } else {
            obj.sysTables.push(value[0]);
          }
          break;
        case 'view':
          if (this.sysViews.indexOf(value[0]) < 0) {
            obj.views.push(value[0]);
          } else {
            obj.sysViews.push(value[0]);
          }
          break;
      }
      return obj;
    }, { sysTables: [], sysViews: [], tables: [], views: [] });

    this.items.next(items);
  }


  async version(): Promise<IVersion> {
    const version = await this.db.exec(`
      select
      spatialite_version() spatialite,
      sqlite_version() sqlite,
      proj4_version() proj4,
      geos_version() geos
    `);

    return {
      spatialite: version[0][0].values[0][0],
      sqlite: version[0][0].values[0][1],
      proj4: version[0][0].values[0][2],
      geos: version[0][0].values[0][3]
    };
  }

  open(buffer: ArrayBuffer) {

    this.initialized.next(false);
    this.db.open(buffer).then(opened => {
      this.initialized.next(opened);
      this.refreshItems();
      this.db.exec('select srid, ref_sys_name from spatial_ref_sys')
        .then(results => {
          this.spatialRefSys.next(results[0][0].values.map(value => {
            return { srid: value[0], name: value[1] };
          }));
        })
        .catch(err => this.spatialRefSys.next([]));

      // this.db.exec('select geometry from regions limit 1')
      //   .then(results => {
      //     const geoms = results[0].values.map(value => value[0]);
      //     this.isGaiaGeom(geoms[0]);
      //     this.db.exec('select asgeojson(extent(:geom))', [geoms[0]])
      //       .then(wkt => console.log(wkt));
      //     this.db.asGeoJSON(geoms, { bbox: true, precision: 7 })
      //       .then(res => {
      //         console.log(res);
      //         // this.db.geomFromGeoJSON(res[0]).then(geom => console.log(geom));
      //       })
      //       .catch(err => console.log(err));
      //   });
    });

  }

  async loadshp(tablename: string, codeset: string, srid: number, shpfiles: IShpFiles) {

    this.busy.next(true);

    return this.db.loadshp(tablename, codeset, srid, shpfiles)
      .then(res => {
        this.busy.next(this.db.busy());
        this.refreshItems();
        return res;
      })
      .catch(err => {
        this.busy.next(this.db.busy());
        this.error.next(err);
        return [];
      });

  }

  async export() {
    return this.db.export();
  }



}
