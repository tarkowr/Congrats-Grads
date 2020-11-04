import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  team: any [] = [
    {
      name: 'Richie Tarkowski',
      img: 'richie.jpg',
      title: 'Lead Software Developer, UI/UX Designer',
      bio: 'Richie is a senior at Ferris State University, studying Computer Information Systems. He works at Hagerty as a Software Engineer on its mobile team. His favorite thing about being a part of the Congrats Grads team is working with his two sisters on a project.'
    },
    {
      name: 'Alyssa Tarkowski',
      img: 'alyssa.jpg',
      title: 'Head of Marketing, UI/UX Designer',
      bio: 'Alyssa is a freshman at Ferris State University pursuing a degree in Computer Information Systems. She is an incoming Software Engineer Intern at State Farm. Her favorite thing about being a part of the Congrats Grads team is putting a smile on seniors\' faces.'
    },
    {
      name: 'Carinne Tarkowski',
      img: 'carinne.jpg',
      title: 'Marketing Intern',
      bio: 'Carinne is a freshman in high school, and she manages the Congrats Grads Instagram page. Her favorite thing about being a part of the Congrats Grads team is designing creative content for the social media pages.'
    }
  ];

  constructor() { }

  ngOnInit() {
  }

}
