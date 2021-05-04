import { Component, OnInit } from '@angular/core';
import { analytics } from 'src/app/app.constants';
import { AnalyticsService } from 'src/app/services/analytics.service';

@Component({
  selector: 'app-social-media',
  templateUrl: './social-media.component.html',
  styleUrls: ['./social-media.component.scss']
})
export class SocialMediaComponent implements OnInit {

  constructor(
    private analytics: AnalyticsService,
  ) { }

  onInstaClick() {
    this.analytics.trackEvent(analytics.insta);
  }

  onFbClick() {
    this.analytics.trackEvent(analytics.facebook);
  }

  ngOnInit() {
  }

}
