import { Component, OnInit } from '@angular/core';
import { LibraryService } from './services/library.service';
import { WindowService } from './services/window.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Congrats Grads';

  constructor(private libraryService: LibraryService,
    private windowService: WindowService) {}

  ngOnInit() {
    this.windowService.checkBreakpoints();
    
    window.addEventListener('resize', () => {
      this.windowService.checkBreakpoints();
    });

    this.libraryService.fetchLibrary();
  }
}
