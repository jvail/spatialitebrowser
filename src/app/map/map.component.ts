import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { AppService } from '../app.service';
import { DBService } from '../db.service';
import { isGeometryBlob } from 'spatiasql';
import { FeatureCollection } from 'geojson';
import turfbbox from '@turf/bbox';

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

  constructor(private appservice: AppService, private dbservice: DBService) {

    this.appservice.draw$.subscribe(data => {
      if (data.length) {
        const geoms = data.reduce((blobs, row) => {
          row.forEach(value => {
            if (value instanceof Uint8Array && isGeometryBlob(value)) {
              blobs.push(value);
            }
          });
          return blobs;
        }, []);
        this.setGeoms(geoms);
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
        this.map.addLayer({
          id: 'poly',
          type: 'fill',
          source: 'source',
          paint: {
            'fill-color': '#ae81ff',
            'fill-opacity': 0.2,
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
            'line-width': 1
          },
          filter: ['==', '$type', 'LineString']
        });
        this.map.addLayer({
          id: 'point',
          type: 'circle',
          source: 'source',
          paint: {
            'circle-radius': 4,
            'circle-color': '#f92672'
          },
          filter: ['==', '$type', 'Point'],
        });
        this.source = <mapboxgl.GeoJSONSource>this.map.getSource('source');
      });
    // .on('click', (evt) => {
    //   const features = this.map.queryRenderedFeatures(evt.point, { layers: ['gadm36_DEU_2'] });
    //   console.log(features);
    // });



  }

  setGeoms(geoms: Uint8Array[]) {

    this.featureCollection.features = [];
    this.source.setData(this.featureCollection);

    this.dbservice.asGeoJSON(geoms, { bbox: false, precision: 6 }).then(jsons => {
      jsons = jsons[0];
      if (jsons.length) {
        this.featureCollection.features = jsons.map(json => {
          return {
            type: 'Feature',
            geometry: JSON.parse(json),
            properties: {}
          };
        });
        const bbox = turfbbox(this.featureCollection).map(n => {
          if (n >= 180) { return 179; }
          if (n <= -180) { return -179; }
          if (n >= 90) { return 89; }
          if (n <= -90) { return -89; }
          return n;
        });
        this.map.fitBounds([[bbox[0], bbox[1]], [bbox[2], bbox[3]]], { padding: 20 });
        this.source.setData(this.featureCollection);
      }
    });

  }

}
