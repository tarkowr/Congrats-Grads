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
  showShare: Boolean = false;

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

  toggleShare(){
    this.showShare = !this.showShare;
  }

  ngOnInit() {
    window.scrollTo({ top: 0, behavior: 'auto' });
    this.handleScreenSize();
    this.attachResizeListener();
    this.senior['shareUrl'] = 'https://congratsgrads.web.app/library?profile=' + this.senior.id;
  }

}
