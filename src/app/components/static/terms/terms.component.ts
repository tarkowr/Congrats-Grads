import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../../../services/analytics.service';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent implements OnInit {

  constructor(private analytics: AnalyticsService) { }

  ngOnInit() { 
    this.analytics.trackView('terms');
  }

}
