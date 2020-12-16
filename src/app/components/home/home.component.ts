import { Component, OnInit } from '@angular/core';
import Typed from 'typed.js';
import { WindowService } from '../../services/window.service';
import { Subscription } from 'rxjs';

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

  windowSubscription: Subscription;

  constructor(private windowService: WindowService) { }

  // Reset typed to a new typed object
  private resetTyped(newTyped: Typed) {
    if (this.typed) {
      this.typed.destroy();
      this.typed = newTyped;
    }
  }

  // OnInit: Rebuild typed on screen resize
  private handleScreenResize() {
    this.windowSubscription = this.windowService.small.subscribe(isMobile => {
      this.mobile = isMobile;
      this.ref = this.mobile ? '#mobile-typed' : '#typed';

      setTimeout(() => this.resetTyped(new Typed(this.ref, this.typedConfig)));
    });
  }

  async ngOnInit() {
    await this.handleScreenResize();
    this.typed = new Typed(this.ref, this.typedConfig);
  }

  ngOnDestroy() {
    this.windowSubscription.unsubscribe();
    this.resetTyped(null);
  }

}
