import { Component, OnInit } from '@angular/core';
import { WindowService } from '../services/window.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  senior: any;
  mobile: Boolean = true;

  constructor(private windowService: WindowService) { }

  // Check if screen is mobile
  handleScreenSize(){
    this.windowService.medium.subscribe(isMobile => {
      this.mobile = isMobile;
    });
  }

  ngOnInit() {
    this.handleScreenSize();
  }

}
