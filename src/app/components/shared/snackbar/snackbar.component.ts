import { Component, OnInit } from '@angular/core';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss']
})
export class SnackbarComponent implements OnInit {

  show: boolean = false;
  message: string;

  constructor(
    private snackbarService: SnackbarService
  ) { }

  ngOnInit() {
    this.snackbarService.message.subscribe((msg: string) => {
      if (this.show) return;

      this.message = msg;
      this.show = true;
      setTimeout(() => this.show = false, this.snackbarService.timeout);
    });
  }

}
