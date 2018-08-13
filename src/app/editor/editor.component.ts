import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
declare var CodeMirror;

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit, AfterViewInit {

  text = '';
  options = { maxLines: 1000, printMargin: false };
  private editor;
  @ViewChild('editor') editorRef: ElementRef;


  constructor() {


  }

  ngAfterViewInit() {

    this.editor = CodeMirror.fromTextArea(this.editorRef.nativeElement, {
      mode: 'text/x-sql',
      keyMap: 'sublime',
      theme: 'monokai',
      viewportMargin: Infinity,
      lineWrapping: true,
      scrollbarStyle: 'native'
    });

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
