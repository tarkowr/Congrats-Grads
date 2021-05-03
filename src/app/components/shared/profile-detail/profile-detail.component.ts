import { Component, Input, OnInit } from '@angular/core';
import { Senior } from 'src/app/models/senior';

@Component({
  selector: 'app-profile-detail',
  templateUrl: './profile-detail.component.html',
  styleUrls: ['./profile-detail.component.scss']
})
export class ProfileDetailComponent implements OnInit {
  @Input() senior: Senior;

  constructor() { }

  ngOnInit() {
  }

}
