import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, AfterContentChecked } from '@angular/core';
import { AppService } from '../app.service';
declare var CodeMirror;

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit, AfterViewInit {

  text = '';
  sqlQry = '';
  options = { maxLines: 1000, printMargin: false };
  private editor;
  @ViewChild('editor') editorRef: ElementRef;

  constructor(private appService: AppService) {

    this.appService.query$.subscribe(sql => {
      if (this.sqlQry !== sql && this.editor) {
        this.sqlQry = sql;
        this.editor.getDoc().setValue(this.sqlQry);
      }
    });

  }

  ngAfterViewInit() {

    this.editor = CodeMirror.fromTextArea(this.editorRef.nativeElement, {
      mode: 'text/x-sql',
      keyMap: 'sublime',
      theme: 'monokai',
      viewportMargin: 100,
      lineWrapping: true,
      scrollbarStyle: 'native',
      autoRefresh: true
    });

    if (this.sqlQry) {
      this.editor.getDoc().setValue(this.sqlQry);
    }

  }

  onChange(code) {
    console.log(code);
  }

  sql(): string {
    return this.editor.getValue();
  }


  ngOnInit() {
  }

}
