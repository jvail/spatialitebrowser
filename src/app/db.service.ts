import { Injectable } from '@angular/core';
import { Database, IShpFiles, IResult, IGeoJSONOptions } from 'spatiasql/dist/spatiasql';
import { BehaviorSubject } from 'rxjs';

// SELECT
// HasIconv(),
// HasMathSQL(),
// HasGeoCallbacks(),
// HasProj(),
// HasGeos(),
// HasGeosAdvanced(),
// HasGeosTrunk(),
// HasGeosReentrant(),
// HasGeosOnlyReentrant(),
// HasRtTopo(),
// HasLibXML2(),
// HasEpsg(),
// HasFreeXL(),
// HasGeoPackage(),
// HasGCP(),
// HasGroundControlPoints(),
// HasTopology(),
// HasKNN(),
// HasRouting()


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
  tablesMeta: string[];
  viewsMeta: string[];
}

@Injectable({
  providedIn: 'root'
})
export class DBService {

  private db: Database;

  private metaTables = [
    'spatial_ref_sys',
    'spatialite_history',
    'sqlite_sequence',
    'geometry_columns',
    'spatial_ref_sys_aux',
    'views_geometry_columns',
    'virts_geometry_columns',
    'geometry_columns_statistics',
    'views_geometry_columns_statistics',
    'virts_geometry_columns_statistics',
    'geometry_columns_field_infos',
    'views_geometry_columns_field_infos',
    'virts_geometry_columns_field_infos',
    'geometry_columns_time',
    'geometry_columns_auth',
    'views_geometry_columns_auth',
    'virts_geometry_columns_auth',
    'data_licenses',
    'sql_statements_log',
    'SpatialIndex',
    'ElementaryGeometries',
    'KNN'
  ];
  private metaViews = [
    'geom_cols_ref_sys',
    'spatial_ref_sys_all',
    'vector_layers',
    'vector_layers_auth',
    'vector_layers_statistics',
    'vector_layers_field_infos'
  ];
  private metaIndices = [
    'sqlite_autoindex_geometry_columns_1',
    'sqlite_autoindex_views_geometry_columns_1',
    'sqlite_autoindex_virts_geometry_columns_1',
    'sqlite_autoindex_geometry_columns_statistics_1',
    'sqlite_autoindex_views_geometry_columns_statistics_1',
    'sqlite_autoindex_virts_geometry_columns_statistics_1',
    'sqlite_autoindex_geometry_columns_field_infos_1',
    'sqlite_autoindex_views_geometry_columns_field_infos_1',
    'sqlite_autoindex_virts_geometry_columns_field_infos_1',
    'sqlite_autoindex_geometry_columns_time_1',
    'sqlite_autoindex_geometry_columns_auth_1',
    'sqlite_autoindex_views_geometry_columns_auth_1',
    'sqlite_autoindex_virts_geometry_columns_auth_1',
    'sqlite_autoindex_data_licenses_1',
    'idx_spatial_ref_sys',
    'idx_srid_geocols',
    'idx_viewsjoin',
    'idx_virtssrid'
  ];
  private metaTriggers = [
    'geometry_columns_f_table_name_insert',
    'geometry_columns_f_table_name_update',
    'geometry_columns_f_geometry_column_insert',
    'geometry_columns_f_geometry_column_update',
    'geometry_columns_geometry_type_insert',
    'geometry_columns_geometry_type_update',
    'geometry_columns_coord_dimension_insert',
    'geometry_columns_coord_dimension_update',
    'vwgc_view_name_insert',
    'vwgc_view_name_update',
    'vwgc_view_geometry_insert',
    'vwgc_view_geometry_update',
    'vwgc_view_rowid_update',
    'vwgc_view_rowid_insert',
    'vwgc_f_table_name_insert',
    'vwgc_f_table_name_update',
    'vwgc_f_geometry_column_insert',
    'vwgc_f_geometry_column_update',
    'vtgc_virt_name_insert',
    'vtgc_virt_name_update',
    'vtgc_virt_geometry_insert',
    'vtgc_virt_geometry_update',
    'vtgc_geometry_type_insert',
    'vtgc_geometry_type_update',
    'vtgc_coord_dimension_insert',
    'vtgc_coord_dimension_update',
    'gcs_f_table_name_insert',
    'gcs_f_table_name_update',
    'gcs_f_geometry_column_insert',
    'gcs_f_geometry_column_update',
    'vwgcs_view_name_insert',
    'vwgcs_view_name_update',
    'vwgcs_view_geometry_insert',
    'vwgcs_view_geometry_update',
    'vtgcs_virt_name_insert',
    'vtgcs_virt_name_update',
    'vtgcs_virt_geometry_insert',
    'vtgcs_virt_geometry_update',
    'gcfi_f_table_name_insert',
    'gcfi_f_table_name_update',
    'gcfi_f_geometry_column_insert',
    'gcfi_f_geometry_column_update',
    'vwgcfi_view_name_insert',
    'vwgcfi_view_name_update',
    'vwgcfi_view_geometry_insert',
    'vwgcfi_view_geometry_update',
    'vtgcfi_virt_name_insert',
    'vtgcfi_virt_name_update',
    'vtgcfi_virt_geometry_insert',
    'vtgcfi_virt_geometry_update',
    'gctm_f_table_name_insert',
    'gctm_f_table_name_update',
    'gctm_f_geometry_column_insert',
    'gctm_f_geometry_column_update',
    'gcau_f_table_name_insert',
    'gcau_f_table_name_update',
    'gcau_f_geometry_column_insert',
    'gcau_f_geometry_column_update',
    'vwgcau_view_name_insert',
    'vwgcau_view_name_update',
    'vwgcau_view_geometry_insert',
    'vwgcau_view_geometry_update',
    'vtgcau_virt_name_insert',
    'vtgcau_virt_name_update',
    'vtgcau_virt_geometry_insert',
    'vtgcau_virt_geometry_update'
  ];


  private items: BehaviorSubject<IItems> = new BehaviorSubject({ tables: [], views: [], tablesMeta: [], viewsMeta: [] });
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
    const items = result[0][0].values.reduce((obj: IItems, value) => {
      switch (value[1]) {
        case 'table':
          if (this.metaTables.indexOf(value[0]) < 0) {
            obj.tables.push(value[0]);
          } else {
            obj.tablesMeta.push(value[0]);
          }
          break;
        case 'view':
          if (this.metaViews.indexOf(value[0]) < 0) {
            obj.views.push(value[0]);
          } else {
            obj.viewsMeta.push(value[0]);
          }
          break;
      }
      return obj;
    }, <IItems>{ tablesMeta: [], viewsMeta: [], tables: [], views: [] });

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
