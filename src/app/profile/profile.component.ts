import { Component, OnInit, Input } from '@angular/core';
import { Utilities } from '../utilities/utilities';
import { environment } from 'src/environments/environment';
import { WindowService } from '../services/window.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  @Input() senior: any;

  mobile: Boolean = true;
  showShare: Boolean = false;

  constructor(private utilities: Utilities,
    private windowService: WindowService) { }

  // Check if screen is mobile
  handleScreenSize(){
    this.windowService.medium.subscribe(isMobile => {
      this.mobile = isMobile;
    });
  }

  // UI: Toggle the share input field
  toggleShare(){
    this.showShare = !this.showShare;
  }

  ngOnInit() {
    this.utilities.scrollTop(window);
    this.handleScreenSize();
    this.senior['shareUrl'] = `${environment.url}/library?profile=${this.senior.id}`;
  }

}
