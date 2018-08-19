import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { AppService } from '../app.service';
import { DBService } from '../db.service';
import { geometryFormat, GeometryFormat } from 'spatiasql';
import { FeatureCollection } from 'geojson';
import turfbbox from '@turf/bbox';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit {

  mapbox = mapboxgl;
  map: mapboxgl.Map;
  featureCollection: FeatureCollection = {
    type: 'FeatureCollection',
    features: []
  };
  source: mapboxgl.GeoJSONSource;
  sideBarOpened = false;
  highlightedFeatureId = -1;

  constructor(private appservice: AppService, private dbservice: DBService, private snackBar: MatSnackBar) {

    this.appservice.draw$.subscribe(data => {
      if (data.length) {
        const geoms = data.reduce((blobs, row) => {
          row.forEach(value => {
            if (value instanceof Uint8Array && geometryFormat(value) !== GeometryFormat.None) {
              blobs.push(value);
            }
          });
          return blobs;
        }, []);
        this.setGeoms(geoms);
      }
    });

    this.appservice.resizeMap$.subscribe(opened => {
      this.sideBarOpened = opened;
      setTimeout(() => {
        this.map.resize();
      }, 25);
    });

    this.dbservice.initialized$.subscribe(opened => {
      if (opened && this.source) {
        this.featureCollection.features = [];
        if (this.source) {
          this.source.setData(this.featureCollection);
        }
      }
    });

  }

  ngOnInit() {
  }

  ngAfterViewInit() {

    this.mapbox.accessToken = 'pk.eyJ1IjoicXVhc2lnaXQiLCJhIjoiY2pib3h1aWF4NXJrMTJxbnVhbG9qeTdqeSJ9.5pJbvgw8_UJ8bZAQ_V9dOg';
    this.map = new this.mapbox.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/dark-v9',
      center: [8.682127, 50.110924],
      zoom: 5
    })
      .on('load', () => {
        this.map.addSource('source', { type: 'geojson', data: this.featureCollection });
        this.appservice.highlightFeature$.subscribe(highlightedFeatureId => {
          this.map.setFeatureState({ source: 'source', id: <any>this.highlightedFeatureId }, { hover: false });
          this.map.setFeatureState({ source: 'source', id: <any>highlightedFeatureId + 1 }, { hover: true });
          this.highlightedFeatureId = highlightedFeatureId + 1;
        });
        this.map.addLayer({
          id: 'poly',
          type: 'fill',
          source: 'source',
          paint: {
            'fill-color': '#ae81ff',
            'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.5, 0.2],
            'fill-outline-color': 'white'
          },
          filter: ['==', '$type', 'Polygon']
        });
        this.map.addLayer({
          id: 'line',
          type: 'line',
          source: 'source',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#e6db74',
            'line-width': ['case', ['boolean', ['feature-state', 'hover'], false], 6, 1]
          },
          filter: ['==', '$type', 'LineString']
        });
        this.map.addLayer({
          id: 'point',
          type: 'circle',
          source: 'source',
          paint: {
            'circle-radius': ['case', ['boolean', ['feature-state', 'hover'], false], 10, 4],
            'circle-color': '#f92672'
          },
          filter: ['==', '$type', 'Point'],
        });
        this.source = <mapboxgl.GeoJSONSource>this.map.getSource('source');
      });

    this.map.addControl(new mapboxgl.NavigationControl(), 'top-right');
  }

  setGeoms(geoms: Uint8Array[]) {

    this.dbservice.asGeoJSON(geoms, { bbox: false, precision: 6 })
      .then(jsons => {
        jsons = jsons[0];
        const nullCount = jsons.filter(json => json[0] === null).length;
        if (jsons.length) {
          this.featureCollection.features = jsons.reduce((arr, json, idx) => {
            if (json[0] !== null) {
              arr.push({
                id: idx + 1,
                type: 'Feature',
                geometry: JSON.parse(json[0]),
                properties: {}
              });
            }
            return arr;
          }, []);
          if (this.featureCollection.features.length > 0) {
            const bbox = turfbbox(this.featureCollection);
            this.map.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]], { padding: 20 });
          }
          if (this.source) {
            this.source.setData(this.featureCollection);
          }
        }
        if (nullCount) {
          this.snackBar.open(`
            GeoJSON creation and/or transformation to 4326 failed for ${nullCount} geometries.
            Probably SRID 4326 is missing in table spatial_ref_sys.
          `);
        }
      });

  }


}
