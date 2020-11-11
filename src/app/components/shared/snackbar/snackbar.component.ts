import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss']
})
export class SnackbarComponent implements OnInit {

  @Input() message: String;

  msg: String;
  show: Boolean;

  constructor() { }

  ngOnInit() {
    this.msg = this.message;
    this.show = true;

    setTimeout(() => {
      this.show = false;
    }, 3000);
  }

}
