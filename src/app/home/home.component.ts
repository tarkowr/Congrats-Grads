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
  typedConfig = {
    strings: ['Honor your Senior', 'Represent your Class', 'Show your School Spirit'],
    typeSpeed: 15,
    startDelay: 0,
    autoInsertCss: true,
    fadeOut: false,
    backDelay: 3500,
    loop: true
  }
  typed: Typed;

  constructor() { }

  // Handle screen resize
  attachResizeListener(){
    window.addEventListener('resize', async () => {
      await this.handleScreenSize();

      let resetTyped = () => {
        if (this.typed !== null) {
          this.typed.destroy();
          this.typed = new Typed(this.ref, this.typedConfig);
        }
      }

      try { 
        resetTyped(); 
      }
      catch(e) {
        console.log(e)
        setTimeout(() => { resetTyped(); }, 200);
      }
    });
  }

  // Check if screen is mobile
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

  // Cancel the typed event
  cancel() {
    this.typed.destroy();
    this.typed = null;
  }

  async ngOnInit() {
    await this.handleScreenSize();
    this.attachResizeListener();

    this.typed = new Typed(this.ref, this.typedConfig);
  }

}
