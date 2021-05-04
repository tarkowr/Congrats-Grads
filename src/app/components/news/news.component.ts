import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { trackPageVisit } from 'src/app/app.utils';
import { AnalyticsService } from 'src/app/services/analytics.service';
import { LibraryService } from 'src/app/services/library.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit {
  seniorCount: number;

  private librarySubscription: Subscription;

  constructor(
    private libraryService: LibraryService,
    private analytics: AnalyticsService,
    private storage: StorageService,
  ) { }

  ngOnInit() {
    trackPageVisit('news', this.storage, this.analytics);
    
    this.librarySubscription = this.libraryService.library.subscribe(
      (library) => this.seniorCount = library.length,
    );
  }

  ngOnDestroy() {
    this.librarySubscription.unsubscribe();
  }

}
