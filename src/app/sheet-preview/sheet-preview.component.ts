import { Component, OnInit, Input, OnChanges } from '@angular/core';

import { MatTableDataSource } from '@angular/material';

import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

@Component({
  selector: 'app-sheet-preview',
  templateUrl: './sheet-preview.component.html',
  styleUrls: ['./sheet-preview.component.scss']
})
export class SheetPreviewComponent implements OnInit, OnChanges {
  @Input('data') dataObject: Array<Object>;
  @Input('column-names') displayedColumns;

  dataSource: MatTableDataSource<any>;
  columns = [];

  constructor() { }

  ngOnChanges() {
    this.columns = this.displayedColumns.map(col_name => {
      return {
        columnDef: col_name,
        header: col_name,
        cell: (row) => row[col_name]
      };
    });

    this.dataSource = new MatTableDataSource(this.dataObject);
  }

  ngOnInit() { }

}
