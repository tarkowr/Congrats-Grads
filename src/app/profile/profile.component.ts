import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  @Input() senior: any;

  mobile: Boolean = false;
  breakPoint: Number = 768;

  constructor() { }

  // Check if screen is mobile
  handleScreenSize(){
    if (window.innerWidth >= this.breakPoint) {
      this.mobile = false;
    }
    else {
      this.mobile = true;
    }
  }

  // Handle screen resize
  attachResizeListener(){
    window.addEventListener('resize', () => {
      this.handleScreenSize();
    });
  }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.handleScreenSize();
    this.attachResizeListener();
  }

}
