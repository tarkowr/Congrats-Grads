import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LibraryService } from '../../services/library.service';
import { regex } from '../../app.constants';
import { WindowService } from '../../services/window.service';
import { Senior } from '../../models/senior';
import { Library, OrderOption, YearOption } from '../../models/library';
import { LibraryState } from '../../models/state/library.state';
import { app } from '../../app.constants';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit {
  library: Library; // Every senior in the library
  seniors: Senior[]; // Seniors that are currently displayed on the page

  librarySubscription: Subscription;
  windowSubscription: Subscription;

  mobile: Boolean = true;

  readonly paginationLimits = { desktop: 20, mobile: 12 };
  paginationMaxPerPage = this.paginationLimits.desktop;
  paginationStartIndex: number = 0;

  readonly yearOptions: YearOption[] = this.buildYears(app.startYear, app.currentYear);
  readonly defaultYear: YearOption = this.yearOptions.find(y => y.value == app.currentYear.toString());

  searchForm: FormGroup;
  noSearchResults: Boolean = false;
  searchActive: Boolean = false;
  searchFound: number = 0;

  orderForm: FormGroup;
  readonly orderOptions = this.buildOrderOptions();
  readonly defaultOrder = OrderOption.Newest;

  constructor(
    private libraryService: LibraryService,
    private windowService: WindowService,
    private router: Router,
    private formBuilder: FormBuilder) { 
      this.library = new Library();
      this.library.year = this.defaultYear;
    }

  get f() { return this.searchForm.controls }

  get o() { return this.orderForm.controls }

  // Build the order options for the select list
  private buildOrderOptions() : any[] {
    let options = [];
    for (let member in OrderOption) {
      if (isNaN(parseInt(member))) continue;
      options.push(
        {
          key: member,
          value: OrderOption[member],
        }
      );
    }

    return options;
  }

  // Generate year options by min and max years
  private buildYears(start: number, end: number) : YearOption[] {
    let options: YearOption[] = [];
    for (let i=0; i <= (end - start); i++) {
      options.push(
        {
          key: i + 1,
          value: (start + i).toString()
        }
      );
    }

    return options;
  }

  // Copy array of objects w/o reference to properties
  private copyArrayOfObj(arr: any[]) {
    return arr.map(obj => ({ ...obj }));
  }

  // UI: Go to senior profile page
  navigateToProfile(senior: Senior) {
    this.libraryService.state.seniorId = senior.id;
    this.router.navigate([`profile/${senior.id}`]);
  }

  //
  // YEAR
  //
  
  // Handle change in selected year
  changeYear(keepState=false) {
    if (!this.library.master) {
      this.o.year.setValue(this.defaultYear.key);
      return;
    }

    this.library.year = this.yearOptions.find(y => y.key == this.o.year.value);

    if (keepState) return;

    this.o.order.setValue(this.defaultOrder);
    this.library.order = this.defaultOrder;
    this.library.sort();
    this.clearSearch();
  }

  //
  // PAGINATION
  //

  // Set max number of seniors per page
  private setMaxSeniorsPerPage() {
    this.paginationMaxPerPage = this.mobile ? this.paginationLimits.mobile : this.paginationLimits.desktop;
  }

  // Reduce senior list to current page
  private paginate(seniorsList: Senior[]) : Senior[] {
    return this.copyArrayOfObj(seniorsList).splice(this.paginationStartIndex, this.paginationMaxPerPage);
  }

  // Reset pagination to the first page
  private resetPagination() {
    this.paginationStartIndex = 0;
  }

  // UI: Format current pagination state
  getPageState() : string {
    // Current page range
    // Example: X-X of 120 or X of 120
    let pageRange: string;
    
    // Index of the last senior on the current page
    // Example: 20-X of 120
    let pageMax = this.paginationStartIndex + this.seniors.length;

    // Number of total seniors displayed in the library
    // Example: 20-40 of X
    let seniorCount = this.searchActive ? this.searchFound : this.library.totalSeniors;

    // Condense if start index and max on page are the same
    // Example: 40-40 of 40 -> 40 of 40
    if ((this.paginationStartIndex + 1) == pageMax || pageMax == 0) {
      pageRange = `${pageMax}`;
    }
    else {
      pageRange = `${this.paginationStartIndex + 1}-${pageMax}`;
    }

    return `${pageRange} of ${seniorCount}`;
  }

  // UI: Handle page left click
  pageLeft() {
    if (this.paginationStartIndex != 0) {
      this.paginationStartIndex -= this.paginationMaxPerPage;
      this.pof();
      window.scrollTo(0, 0);
    }
  }
 
  // UI: Handle page right click
  pageRight() {
    let activeSeniors = this.searchActive ? this.searchFound : this.library.totalSeniors;

    if (this.paginationStartIndex + this.paginationMaxPerPage < activeSeniors) {
      this.paginationStartIndex += this.paginationMaxPerPage;
      this.pof();
      window.scrollTo(0, 0);
    }
  }

  ///
  /// ORDER
  ///

  // Sort seniors if selected order has changed
  private sortLibrary() {
    const selected = this.o.order.value;

    if (this.library.order != selected) {
      this.library.order = selected;
      this.resetPagination();
      this.library.sort();
    }
  }

  //
  // FILTER
  //

  // Return search input from user
  private getSearchQuery(): string {
    return this.f.search.value ? this.f.search.value.toLowerCase() : '';
  }

  // Filter backup by search query
  private getFilteredSeniors(): Senior[] {
    let query: string = this.getSearchQuery();
    this.noSearchResults = false;

    // Reset pagination on new query 
    if (this.library.query != query) { 
      this.library.query = query;
      this.resetPagination();
    }

    // Return all seniors if search input is invalid
    if (this.searchForm.invalid) {
      this.searchActive = false;
      this.searchFound = 0;
      return this.library.yearMaster;
    }

    this.searchActive = true;

    let filteredSeniors: Senior[] = this.library.filter();
    this.searchFound = filteredSeniors.length;
     
    if (this.searchFound <= 0) {
      this.noSearchResults = true;
    }

    return filteredSeniors;
  }

  // UI: Clear search if no results found
  clearSearch() {
    this.noSearchResults = false;
    this.searchActive = false;
    this.searchFound = 0;
    this.searchForm.reset();
    this.library.query = '';
    this.resetPagination();
    this.savePageState();
    this.seniors = this.paginate(this.library.yearMaster);
  }

  // UI: Pagination, Order, Filter
  pof() {
    if (!this.library.master) {
      this.searchForm.reset();
      this.o.order.setValue(this.defaultOrder);
      return;
    }

    this.sortLibrary();
    let filteredSeniors: Senior[] = this.getFilteredSeniors();

    this.seniors = this.paginate(filteredSeniors);

    this.savePageState();
  }

  // Save page state so page doesn't reset upon navigating away
  private savePageState() {
    let libraryState: LibraryState = new LibraryState();
    libraryState.searchQuery = this.f.search.value ? this.f.search.value.toLowerCase() : undefined;
    libraryState.orderKey = this.library.order == this.defaultOrder ? undefined : this.library.order;
    libraryState.yearKey = this.library.year.key == this.defaultYear.key ? undefined : this.library.year.key;
    libraryState.pageStartIndex = this.paginationStartIndex;

    this.libraryService.state = libraryState;
  }

  // Restore page to saved state
  private restorePageState() {
    let libraryState: LibraryState = this.libraryService.state;
    let filteredSeniors: Senior[];

    if (libraryState.yearKey) {
      this.o.year.setValue(libraryState.yearKey);
      this.changeYear(true);
    }

    if (libraryState.orderKey) {
      this.o.order.setValue(libraryState.orderKey);
      this.sortLibrary();
    }

    if (libraryState.searchQuery) {
      this.f.search.setValue(libraryState.searchQuery);
      filteredSeniors = this.getFilteredSeniors();
    }

    if (libraryState.pageStartIndex) {
      this.paginationStartIndex = libraryState.pageStartIndex;
    }

    this.seniors = this.paginate(filteredSeniors || this.library.yearMaster);

    if (libraryState.seniorId) {
      setTimeout(() => {
        document.getElementById(libraryState.seniorId).scrollIntoView({ behavior: "auto", block: "center", inline: "nearest"});
        this.libraryService.state.seniorId = undefined;
      });
    }
  }

  // Separate seniors by year
  private parseSeniorsByYear(library: Senior[]) {
    let parsed: Record<string, Senior[]> = {}

    library.forEach((senior) => {
      if (!parsed[senior.year.toString()]) {
        parsed[senior.year.toString()] = [senior];
      }
      else {
        parsed[senior.year.toString()].push(senior);
      }
    });

    return parsed;
  }

  ngOnInit() {
    this.buildForms();
    this.handleScreenResize();
    this.getSeniors();
  }

  ngOnDestroy() {
    this.windowSubscription.unsubscribe();
    this.librarySubscription.unsubscribe();
  }

  // OnInit: Initialize the search and order inputs
  private buildForms() {
    this.searchForm = this.formBuilder.group({
      search: ['',  Validators.compose([
        Validators.required, Validators.pattern(regex.search)
      ])]
    });

    this.orderForm = this.formBuilder.group({
      order: [this.defaultOrder,  Validators.compose([
        Validators.required
      ])],
      year: [this.defaultYear.key,  Validators.compose([
        Validators.required
      ])]
    });
  }
  
  // OnInit: Handle a change in the user's viewport
  private handleScreenResize() {
    this.setMaxSeniorsPerPage();

    this.windowSubscription = this.windowService.large.subscribe(isMobile => {
      this.mobile = isMobile;

      this.setMaxSeniorsPerPage();

      if (this.library.master) {
        this.resetPagination();
        this.clearSearch();
      }
    });
  }

  // OnInit: Get senior data from server
  private getSeniors() {
    this.librarySubscription = this.libraryService.library.subscribe((library: Senior[]) => {
      this.library.master = this.parseSeniorsByYear(library);
      this.library.sort();
      this.restorePageState();
    });
  }
}
