import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { app, storage } from 'src/app/app.constants';
import { trackPageVisit } from 'src/app/app.utils';
import { Senior } from 'src/app/models/senior';
import { AnalyticsService } from 'src/app/services/analytics.service';
import { LibraryService } from 'src/app/services/library.service';
import { StorageService } from 'src/app/services/storage.service';
import { WindowService } from 'src/app/services/window.service';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit {
  seniorCount: number;
  raed: Senior;
  dakota: Senior;

  counter: number = 0;

  private librarySubscription: Subscription;
  private windowSubscription: Subscription;

  mobile: boolean = true;

  constructor(
    private libraryService: LibraryService,
    private windowService: WindowService,
    private analytics: AnalyticsService,
    private storage: StorageService,
  ) { }

  onClickDonate() {
    this.analytics.trackEvent('donate_btn');
  }

  ngOnInit() {
    trackPageVisit('news', this.storage, this.analytics);

    this.storage.set(storage.seenNewsUpdates, app.newsUpdates);

    this.windowSubscription = this.windowService.small.subscribe(
      (isMobile: boolean) => this.mobile = isMobile,
    );
    
    this.librarySubscription = this.libraryService.library.subscribe(
      (library) => {
        this.seniorCount = library.length;
        this.dakota = library.find(senior => senior.id == 'b8cba7d9-1e84-4ffc-9a4d-dc6c472414f1');
        this.raed = library.find(senior => senior.id == '70518f3a-ed9f-47ee-8144-641eb4a2eff8');
      },
    );

    this.loopCounter();
  }

  // Loop 500 senior counter
  loopCounter() {
    const maxValue = 100;
    const updateInterval = 800;
    const resetTimeout = 1500;

    let timer = setInterval(() => {
      if (this.counter >= maxValue) return;

      this.counter = this.counter + 20;
      if (this.counter >= maxValue) {
        clearInterval(timer);
        setTimeout(() => this.counter = 0, resetTimeout);
        setTimeout(() => this.loopCounter(), resetTimeout + 1000);
      }
    }, updateInterval);
  }

  ngOnDestroy() {
    this.librarySubscription.unsubscribe();
    this.windowSubscription.unsubscribe();
  }

}
