import { Component, OnInit, Input } from '@angular/core';
import { Location } from '@angular/common';
import { WindowService } from '../../../services/window.service';
import { Subscription } from 'rxjs';
import { StorageService } from 'src/app/services/storage.service';
import { app, storage } from 'src/app/app.constants';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  @Input() showBackButton: Boolean = true;

  hasNewsUpdate: boolean;
  newsUpdateCount: number;

  mobile: Boolean = true;
  private windowSubscription: Subscription;

  constructor(
    private windowService: WindowService,
    private storage: StorageService,
    private location: Location,
  ) { }

  // UI: Navigate back to previous page
  back() {
    this.location.back();
  }

  // Show alert icon with news update count
  private showNewsAlertIcon() {
    var seenPostCount: number = +this.storage.get(storage.seenNewsUpdates);

    if (seenPostCount >= app.newsUpdates) return;

    this.hasNewsUpdate = true;
    this.newsUpdateCount = app.newsUpdates - seenPostCount;
  }

  ngOnInit() { 
    this.windowSubscription = this.windowService.large.subscribe(isMobile => {
      this.mobile = isMobile;
    });

    this.showNewsAlertIcon();
  }

  ngOnDestroy() {
    this.windowSubscription.unsubscribe();
  }

}
