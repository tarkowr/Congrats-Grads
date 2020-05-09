import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  @Input() senior: any;

  constructor() { }

  ngOnInit() {
    window.scrollTo(0, 0);
  }

}
