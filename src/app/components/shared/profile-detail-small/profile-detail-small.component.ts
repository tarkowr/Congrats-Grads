import { Component, Input, OnInit } from '@angular/core';
import { Senior } from 'src/app/models/senior';

@Component({
  selector: 'app-profile-detail-small',
  templateUrl: './profile-detail-small.component.html',
  styleUrls: ['./profile-detail-small.component.scss']
})
export class ProfileDetailSmallComponent implements OnInit {
  @Input() senior: Senior;

  constructor() { }

  ngOnInit() {
  }

}
