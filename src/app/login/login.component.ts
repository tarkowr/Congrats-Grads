import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  message: String;
  showSnackbar: Boolean = false;

  constructor() { }

  ngOnInit() {
  }

}
