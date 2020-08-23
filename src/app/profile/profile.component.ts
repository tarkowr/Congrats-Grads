import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { WindowService } from '../services/window.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  senior: any;
  mobile: Boolean = true;
  error: Boolean = false;

  constructor(private userService: UserService,
    private windowService: WindowService,
    private activatedRoute: ActivatedRoute,) { }

  // Check if screen is mobile
  handleScreenSize(){
    this.windowService.medium.subscribe(isMobile => {
      this.mobile = isMobile;
    });
  }

  ngOnInit() {
    this.handleScreenSize();

    this.activatedRoute.pathFromRoot[1].url.subscribe((segments: UrlSegment[]) => {
      // Get the last segment of URL path
      const id = segments.pop().path;
      
      this.userService.library.subscribe((library: any[]) => {
        this.senior = library.find(s => s.id == id);

        if (!this.senior) {
          this.error = true;
        }
      })
    });
  }

}
