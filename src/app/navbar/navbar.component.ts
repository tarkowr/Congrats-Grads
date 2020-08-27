import { Component, OnInit, Input } from '@angular/core';
import { Location } from '@angular/common';
import { WindowService } from '../services/window.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  @Input() showBackButton: Boolean = true;

  mobile: Boolean = true;

  constructor(private windowService: WindowService,
    private location: Location) { }

  // Navigate back to previous page
  back() {
    this.location.back();
  }

  ngOnInit() { 
    this.windowService.large.subscribe(isMobile => {
      this.mobile = isMobile;
    });
  }

}
