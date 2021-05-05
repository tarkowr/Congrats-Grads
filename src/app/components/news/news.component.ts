import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
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

  private librarySubscription: Subscription;
  private windowSubscription: Subscription;

  mobile: boolean = true;

  constructor(
    private libraryService: LibraryService,
    private windowService: WindowService,
    private analytics: AnalyticsService,
    private storage: StorageService,
  ) { }

  ngOnInit() {
    trackPageVisit('news', this.storage, this.analytics);

    this.windowSubscription = this.windowService.small.subscribe(
      (isMobile: boolean) => this.mobile = isMobile,
    );
    
    this.librarySubscription = this.libraryService.library.subscribe(
      (library) => {
        this.seniorCount = library.length;
        this.raed = library.find(senior => senior.id == '70518f3a-ed9f-47ee-8144-641eb4a2eff8');
      },
    );
  }

  ngOnDestroy() {
    this.librarySubscription.unsubscribe();
    this.windowSubscription.unsubscribe();
  }

}
