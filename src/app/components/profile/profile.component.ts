import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, UrlSegment } from '@angular/router';
import { WindowService } from '../../services/window.service';
import { LibraryService } from '../../services/library.service';
import { Subscription } from 'rxjs';
import { Senior } from 'src/app/models/senior';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  senior: Senior;
  mobile: Boolean = true;
  showBackButton: Boolean = false;
  error: Boolean = false;

  windowSubscription: Subscription;
  largeWindowSubscription: Subscription;
  librarySubscription: Subscription;

  constructor(private libraryService: LibraryService,
    private windowService: WindowService,
    private activatedRoute: ActivatedRoute) { }

  // OnInit: Handle change in the user's viewport size
  private handleScreenSize() {
    this.windowSubscription = this.windowService.medium.subscribe(isMobile => {
      this.mobile = isMobile;
    });

    this.largeWindowSubscription = this.windowService.large.subscribe(isMobile => {
      this.showBackButton = !isMobile;
    });
  }

  // OnInit: Parse URL path to get the last segment (senior ID) and lookup senior data by ID
  private getSeniorFromUrl() {
    this.activatedRoute.pathFromRoot[1].url.subscribe((segments: UrlSegment[]) => {
      
      // Get the last segment of URL path
      const id = segments.pop().path;
      
      this.librarySubscription = this.libraryService.library.subscribe((library: Senior[]) => {
        this.senior = library.find(s => s.id == id);

        if (!this.senior) {
          this.error = true;
        }
      })
    });
  }

  ngOnInit() {
    this.handleScreenSize();
    this.getSeniorFromUrl();
  }

  ngOnDestroy() {
    this.windowSubscription.unsubscribe();
    this.largeWindowSubscription.unsubscribe();

    if (this.librarySubscription) {
      this.librarySubscription.unsubscribe();
    }
  }

}
