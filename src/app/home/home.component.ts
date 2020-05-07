import { Component, OnInit } from '@angular/core';
import Typed  from 'typed.js';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  breakPoint: Number = 576;
  mobile: Boolean = false;
  ref: string = '#typed';
  typed = {
    strings: ['Honor your Senior', 'Represent your Class', 'Show your School Spirit'],
    typeSpeed: 15,
    startDelay: 0,
    autoInsertCss: true,
    fadeOut: false,
    backDelay: 3500,
    loop: true
  }

  constructor() { }

  attachResizeListener(){
    window.addEventListener('resize', () => {
      this.handleScreenSize();
    });
  }

  handleScreenSize(){
    if (window.innerWidth >= this.breakPoint) {
      this.mobile = false;
      this.ref = '#typed';
    }
    else {
      this.mobile = true;
      this.ref = '#mobile-typed';
    }
  }

  async ngOnInit() {
    await this.handleScreenSize();
    this.attachResizeListener();

    new Typed(this.ref, this.typed);
  }

}
