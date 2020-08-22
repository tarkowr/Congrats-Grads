import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Utilities } from '../utilities/utilities';
import { WindowService } from '../services/window.service';
import { AppStateService } from '../services/app-state.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  senior: any;
  mobile: Boolean = true;

  constructor(private utilities: Utilities,
    private router: Router,
    private windowService: WindowService,
    private appStateService: AppStateService,
    ) { }

  // Check if screen is mobile
  handleScreenSize(){
    this.windowService.medium.subscribe(isMobile => {
      this.mobile = isMobile;
    });
  }

  ngOnInit() {
    this.senior = this.appStateService.seniorProfile;

    if (!this.senior) {
      this.router.navigate(['library'], { skipLocationChange: true });
    }

    this.handleScreenSize();
  }

}
