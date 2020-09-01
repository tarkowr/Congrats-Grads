import { Component, OnInit } from '@angular/core';
import Typed from 'typed.js';
import { WindowService } from '../services/window.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  mobile: Boolean = true;
  ref: string = '#mobile-typed';
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

  constructor(private windowService: WindowService) { }

  // Rebuild typed on screen resize
  handleScreenResize() {
    this.windowService.small.subscribe(isMobile => {
      this.mobile = isMobile;
      this.ref = this.mobile ? '#mobile-typed' : '#typed';

      let resetTyped = () => {
        if (this.typed) {
          this.typed.destroy();
          this.typed = new Typed(this.ref, this.typedConfig);
        }
      }

      try { 
        resetTyped(); 
      }
      catch(e) {
        setTimeout(() => resetTyped(), 200);
      }
    });
  }

  async ngOnInit() {
    await this.handleScreenResize();
    this.typed = new Typed(this.ref, this.typedConfig);
  }

  ngOnDestroy(){
    if (this.typed) {
      this.typed.destroy();
    }
  }

}
