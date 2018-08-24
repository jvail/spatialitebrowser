import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { NavComponent, VersionDialogComponent, SRIDDialogComponent } from './nav/nav.component';
import { LayoutModule } from '@angular/cdk/layout';
import {
  MatToolbarModule,
  MatButtonModule,
  MatSidenavModule,
  MatIconModule,
  MatListModule,
  MatProgressSpinnerModule,
  MatProgressBarModule,
  MatMenuModule,
  MatButtonToggleModule,
  MatDialogModule,
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  MatSelectModule,
  MatBadgeModule,
  MatSnackBarModule,
  MAT_SNACK_BAR_DEFAULT_OPTIONS
} from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MapComponent } from './map/map.component';
import { DataComponent } from './data/data.component';
import { EditorComponent } from './editor/editor.component';
import { AngularSplitModule } from 'angular-split-ng6';


@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    VersionDialogComponent,
    SRIDDialogComponent,
    MapComponent,
    DataComponent,
    EditorComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    LayoutModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatMenuModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSelectModule,
    MatBadgeModule,
    MatSnackBarModule,
    AngularSplitModule
  ],
  providers: [{ provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 5000 } }],
  entryComponents: [VersionDialogComponent, SRIDDialogComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }
