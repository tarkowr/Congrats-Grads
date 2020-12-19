import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../../../services/analytics.service';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss']
})
export class PrivacyComponent implements OnInit {

  constructor(private analytics: AnalyticsService) { }

  ngOnInit() { 
    this.analytics.trackView('privacy');
  }

}
