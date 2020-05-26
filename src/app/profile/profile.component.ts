import { Component, OnInit, Input } from '@angular/core';
import { Utilities } from '../utilities/utilities';
import { environment } from 'src/environments/environment';

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

  constructor(private utilities:Utilities) { }

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

  // UI: Toggle the share input field
  toggleShare(){
    this.showShare = !this.showShare;
  }

  ngOnInit() {
    this.utilities.scrollTop(window);
    this.handleScreenSize();
    this.attachResizeListener();
    this.senior['shareUrl'] = `${environment.url}/library?profile=${this.senior.id}`;
  }

}
