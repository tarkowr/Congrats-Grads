import { Component, OnInit } from '@angular/core';
import { v4 as uuid } from 'uuid';
import { LibraryService } from './services/library.service';
import { WindowService } from './services/window.service';
import { StorageService } from './services/storage.service';
import { AnalyticsService } from './services/analytics.service';
import { storage } from './app.constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Congrats Grads';

  constructor(private libraryService: LibraryService,
    private windowService: WindowService,
    private analytics: AnalyticsService,
    private storageService: StorageService) {}

  ngOnInit() {
    this.windowService.checkBreakpoints();
    
    window.addEventListener('resize', () => {
      this.windowService.checkBreakpoints();
    });

    this.libraryService.fetchLibrary();

    let user = this.storageService.get(storage.userId);

    if (!user) {
      user = uuid();
      this.storageService.set(storage.userId, user);
      this.analytics.trackEvent('new_user', { route: window.location.pathname });
    }
  }
}
