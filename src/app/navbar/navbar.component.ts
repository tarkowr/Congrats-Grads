import { Component, OnInit, Input } from '@angular/core';
import { Location } from '@angular/common';
import { WindowService } from '../services/window.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  @Input() showBackButton: Boolean = true;

  mobile: Boolean = true;
  windowSubscription: Subscription;

  constructor(private windowService: WindowService,
    private location: Location) { }

  // UI: Navigate back to previous page
  back() {
    this.location.back();
  }

  ngOnInit() { 
    this.windowSubscription = this.windowService.large.subscribe(isMobile => {
      this.mobile = isMobile;
    });
  }

  ngOnDestroy() {
    this.windowSubscription.unsubscribe();
  }

}
