import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../../../services/analytics.service';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss']
})
export class PageNotFoundComponent implements OnInit {

  constructor(private analytics: AnalyticsService) { }

  ngOnInit() { 
    this.analytics.trackError('404', { route: window.location.pathname });
  }

}
