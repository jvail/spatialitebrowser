import { Component } from '@angular/core';
import { DBService } from './db.service';
import { AppService } from './app.service';
// import { Database } from 'spatiasql/dist/spatiasql';
// import * as FileSaver from 'file-saver';
// import * as mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(private dbService: DBService, private appService: AppService) {

    const params = new URLSearchParams(window.location.search.substring(1));
    const url = params.get('db');
    const qry = params.get('qry');

    if (url) {
      fetch(url)
        .then(db => {
          if (db.ok) {
            db.arrayBuffer().then(buffer => {
              this.dbService.open(buffer);
              if (qry) {
                this.appService.query$.next(qry);
              }
            });
          } else {
            this.openDefaultDb(qry);
          }
        })
        .catch(err => {
          this.openDefaultDb(qry);
        });
    } else {
      this.openDefaultDb(qry);
    }



  }

  openDefaultDb(qry) {
    fetch('assets/db/db.sqlite').then(defaultDb => {
      defaultDb.arrayBuffer().then(buffer => {
        this.dbService.open(buffer);
        if (qry) {
          this.appService.query$.next(qry);
        }
      });
    });
  }


  // async addLayer() {

  //   const layer: mapboxgl.Layer = {
  //     id: 'gadm36_DEU_2',
  //     type: 'fill',
  //     source: {
  //       type: 'geojson',
  //       data: {
  //         type: 'FeatureCollection',
  //         features: []
  //       }
  //     },
  //     layout: {},
  //     paint: {
  //       'fill-opacity': 0.2,
  //       'fill-color': '#088',
  //       'fill-outline-color': 'white'
  //     }
  //   };
  //   this.map.addLayer(layer);
  //   const source = <mapboxgl.GeoJSONSource>this.map.getSource('gadm36_DEU_2');

  //   // const loaded = await this.loadShp();
  //   // const features = [];

  //   if (loaded) {

  //     // const stmt = await this.db.prepare(
  //     //   `select rowid, AsGeoJSON(geometry, 6) geometry
  //     //   from gadm36_DEU_2
  //     //   where rowid > :skip
  //     //   order by rowid
  //     //   limit :count`
  //     // );
  //     // for await (const feature of this.getFeatures(stmt, 25)) {
  //     //   features.push(...feature);
  //     //   source.setData({
  //     //     type: 'FeatureCollection',
  //     //       features: features
  //     //   });
  //     // }

  //     // for await (const results of this.getX(25)) {
  //     //   features.push(...results.map(row => {
  //     //     return {
  //     //       type: 'Feature',
  //     //       properties: {
  //     //         name: row[0]
  //     //       },
  //     //       geometry: JSON.parse(row[1])
  //     //     };
  //     //   }));
  //     //   source.setData({
  //     //     type: 'FeatureCollection',
  //     //     features: features
  //     //   });
  //     // }


  //   }


  //   // (<mapboxgl.GeoJSONSource>layer.source).setData()

  // }

  // async loadShp(): Promise<boolean> {

  //   const files = await Promise.all([
  //     fetch('assets/shp/gadm36_DEU_2.dbf').then(res => res.arrayBuffer()),
  //     fetch('assets/shp/gadm36_DEU_2.shp').then(res => res.arrayBuffer()),
  //     fetch('assets/shp/gadm36_DEU_2.shx').then(res => res.arrayBuffer())
  //   ]);

  //   return await this.db.loadshp('gadm36_DEU_2', 'UTF-8', 4326, {
  //     dbf: files[0],
  //     shp: files[1],
  //     shx: files[2]
  //   });

  // }

  // async *getX(count) {

  //   let skip = 0;

  //   while (true) {
  //     const result = await this.db.exec(
  //       `select rowid, AsGeoJSON(geometry, 6) geometry
  //       from gadm36_DEU_2
  //       where rowid > ${skip}
  //       order by rowid
  //       limit ${count}`);

  //       skip = result[0].values[result[0].values.length - 1][0];
  //       yield result[0].values;
  //       if (result[0].values.length < count) {
  //         return;
  //       }
  //   }

  // }

  // async *getFeatures(stmt, count) {

  //   console.log('getFeatures');
  //   let skip = 0;
  //   let yielded = 0;
  //   let features = [];
  //   let rowid = 0;

  //   while (true) {
  //     for await (const row of this.getRows(stmt, skip, count)) {
  //       yielded++;
  //       rowid = row[0];
  //       features.push({
  //         type: 'Feature',
  //         properties: {
  //           name: row[0]
  //         },
  //         geometry: JSON.parse(row[1])
  //       });
  //     }
  //     skip = rowid;
  //     yield features;
  //     features = [];
  //     if (yielded < count) {
  //       console.log('yielded < count');
  //       return;
  //     }
  //     yielded = 0;

  //   }

  // }

  // async *getRows(stmt: IStatement, skip: number, count: number) {

  //   console.log('getRows');
  //   while (true) {
  //     await stmt.bind([skip, count]);
  //     for await (const step of stmt.step()) {
  //       console.log('step');
  //       yield await stmt.get();
  //     }
  //     return;
  //   }

  // }

  // async runAsync() {
  //   const db = new Database();
  //   db.exec('select sqlite_version()')
  //     .then(res => console.log(res));

  //   Promise.all([
  //     db.exec('create table a (b)'),
  //     db.exec('select * from sqlite_master'),
  //     db.exec('insert into a values (:b)', [0]),
  //     db.exec('insert into a values (:b)', [1]),
  //     db.exec('insert into a values (:b)', [2]),
  //     db.exec('insert into a values (:b)', [3]),
  //     db.exec('insert into a values (:b)', [4]),
  //     db.exec('select * from a')
  //   ])
  //     .then(res => console.log(res))
  //     .catch(err => console.log(err));

  //   const stmt = await db.prepare('select * from a where b>:x and b<:y');
  //   await stmt.bind([0, 3]);
  //   for await (const step of stmt.step()) {
  //     const result = await stmt.get();
  //     console.log(result);
  //   }
  //   await stmt.bind([2, 5]);
  //   for await (const step of stmt.step()) {
  //     const result = await stmt.getAsObject();
  //     console.log(result);
  //   }
  //   stmt.free();

  //   const files = await Promise.all([
  //     fetch('assets/shp/ne_110m_admin_0_countries.dbf').then(res => res.arrayBuffer()),
  //     fetch('assets/shp/ne_110m_admin_0_countries.shp').then(res => res.arrayBuffer()),
  //     fetch('assets/shp/ne_110m_admin_0_countries.shx').then(res => res.arrayBuffer())
  //   ]);

  //   const loaded = await db.loadshp('ne_110m_admin_0_countries', 'CP1251', 4326, {
  //       dbf: files[0],
  //       shp: files[1],
  //       shx: files[2]
  //     });

  //   if (loaded) {
  //     db.exec('select name, AsGeoJSON(geometry, 5) as geometry from ne_110m_admin_0_countries')
  //       .then(res => console.log(res));
  //   }

  //   const file = await db.export();
  //   FileSaver.saveAs(new Blob([file], { type: 'application/octet-stream' }), 'db.sqlite3');

  //   db.close();

  // }

}
