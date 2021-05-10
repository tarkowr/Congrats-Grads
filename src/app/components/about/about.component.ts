import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../../services/analytics.service';
import { StorageService } from '../../services/storage.service';
import { trackPageVisit } from 'src/app/app.utils';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  readMore: boolean;
  team: any [] = [
    {
      name: 'Richie Tarkowski',
      img: 'richie.jpg',
      title: 'Lead Software Developer, UI/UX Designer',
      bio: 'Richie recently graduated from Ferris State University with a degree in Computer Information Systems. He works at Hagerty as a Software Engineer on its mobile team. His favorite thing about being a part of the Congrats Grads team is working with his two sisters.'
    },
    {
      name: 'Alyssa Tarkowski',
      img: 'alyssa.jpg',
      title: 'Head of Marketing, UI/UX Designer',
      bio: 'Alyssa is a sophomore at Ferris State University pursuing a degree in Computer Information Systems. She is an incoming Software Engineer Intern at State Farm. Her favorite thing about being a part of the Congrats Grads team is putting a smile on seniors\' faces.'
    },
    {
      name: 'Carinne Tarkowski',
      img: 'carinne.jpg',
      title: 'Marketing Intern',
      bio: 'Carinne is a freshman in high school, and she manages the Congrats Grads Instagram page. Her favorite thing about being a part of the Congrats Grads team is designing creative content for the social media pages.'
    }
  ];

  constructor(
    private analytics: AnalyticsService,
    private storage: StorageService,
  ) { }

  onClickDonate() {
    this.analytics.trackEvent('donate_btn');
  }

  onReadMoreClick() {
    this.readMore = !this.readMore;
  }

  ngOnInit() {
    trackPageVisit('about', this.storage, this.analytics);
  }

}
