import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LibraryService } from '../../services/library.service';
import { regex } from '../../app.constants';
import { WindowService } from '../../services/window.service';
import { AnalyticsService } from '../../services/analytics.service';
import { Senior } from '../../models/senior';
import { LibraryState } from '../../models/state/library.state';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit {
  seniors: Senior[]; // Seniors that are currently displayed on the page
  master: Record<string, Senior[]>; // Every senior in the library
  totalSeniors: number;

  librarySubscription: Subscription;
  windowSubscription: Subscription;

  mobile: Boolean = true;

  readonly paginationLimits = { desktop: 20, mobile: 12 };
  paginationMaxPerPage = this.paginationLimits.desktop;
  paginationStartIndex: number = 0;

  readonly yearOptions: any[] = this.buildYears(2020, 2021);
  readonly defaultYear = this.yearOptions.find(y => y.value == 2021);
  selectedYear = this.defaultYear;

  searchForm: FormGroup;
  searchQuery: string = '';
  noSearchResults: Boolean = false;
  searchActive: Boolean = false;
  searchFound: number = 0;

  orderForm: FormGroup;
  readonly orderOptions = this.buildOrderOptions();
  readonly defaultOrder = this.orderOptions.find(o => o.value == 'Newest');
  selectedOrder = this.defaultOrder;

  constructor(
    private libraryService: LibraryService,
    private windowService: WindowService,
    private libraryState: LibraryState,
    private analytics: AnalyticsService,
    private router: Router,
    private formBuilder: FormBuilder) { }

  get f() { return this.searchForm.controls }

  get o() { return this.orderForm.controls }

  get yearMaster(): Senior[] {
    return this.master[this.selectedYear.value];
  }

  // Return a list of all available order options
  buildOrderOptions() : any[] {
    return [
      {
        key: 1,
        value: 'Alphabetical',
        action: this.libraryService.sortByName
      },
      {
        key: 2,
        value: 'Newest',
        action: this.libraryService.sortByNewest
      },
      {
        key: 3,
        value: 'Oldest',
        action: this.libraryService.sortByOldest
      }
    ];
  }

  // Generate year options by min and max years
  buildYears(start: number, end: number) : any[] {
    let options = [];
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
  copyArrayOfObj(arr: any[]) {
    return arr.map(obj => ({ ...obj }));
  }

  // UI: Go to senior profile page
  getProfile(senior: Senior) {
    this.libraryState.seniorId = senior.id;
    this.router.navigate([`profile/${senior.id}`]);
  }

  //
  // YEAR
  //
  
  // Handle change in selected year
  changeYear(onRestore = false) {
    this.selectedYear = this.yearOptions.find(y => y.key == this.o.year.value);
    this.totalSeniors = this.yearMaster.length;

    if (!onRestore) {
      this.o.order.setValue(this.defaultOrder.key);
      this.selectedOrder = this.defaultOrder;
      this.selectedOrder.action(this.yearMaster);
      this.clearSearch();
    }
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

    // Current page range in the format of X or X-X
    let pageRange: string;
    
    // Index of the last senior on the current page
    // Example: 20-X of 120
    let pageMax = this.paginationMaxPerPage + this.paginationStartIndex;

    // Number of total seniors displayed in the library
    // Example: 20-40 of X
    let seniorCount = this.searchActive ? this.searchFound : this.totalSeniors;

    // Set total page count to senior count or max on this page (whichever is smaller)
    if (pageMax > this.totalSeniors) {
      pageMax = this.totalSeniors;
    }

    // Index of the last senior on the current page when there is a current search filter
    // Example: 20-X of 120
    if (this.searchActive) {
      pageMax = this.paginationStartIndex + this.seniors.length;
    }

    // Condense if start index and max on page are the same
    // Example: 40-40 of 40 -> 40 of 40
    if ((this.paginationStartIndex + 1) == pageMax || pageMax == 0) {
      pageRange = pageMax.toString();
    }
    else{
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
    let activeSeniors = this.searchActive ? this.searchFound : this.totalSeniors;

    if (this.paginationStartIndex + this.paginationMaxPerPage < activeSeniors) {
      this.paginationStartIndex += this.paginationMaxPerPage;
      this.pof();
      window.scrollTo(0, 0);
      this.analytics.trackEvent('library_paginate', { year: this.selectedYear.value, order: this.selectedOrder.value });
    }
  }

  ///
  /// ORDER
  ///

  // Return the user's selected option
  private getSelectedOrder() {
    return this.orderOptions.find(s => s.key == this.o.order.value);
  }

  // Order seniors (backup) if selected order has changed
  // Apply order to backup since seniors will be paginated and may be filtered
  private orderBackup() {
    const selected = this.getSelectedOrder();

    if (this.selectedOrder.key != selected.key) {
      this.selectedOrder = selected;
      this.resetPagination();
      selected.action(this.yearMaster);
    }
  }

  //
  // FILTER
  //

  // Return all seniors that match a search query
  private filterSeniors(query: string) : Senior[] {
    return this.yearMaster.filter(s => this.libraryService.matchesSearch(s.fname, s.lname, query)); 
  }

  // Return search input from user
  private getSearchQuery(): string {
    return this.f.search.value ? this.f.search.value.toLowerCase() : '';
  }

  // Filter backup by search query
  private getFilteredSeniors(): Senior[] {
    let query: string = this.getSearchQuery();
    this.noSearchResults = false;

    // Reset pagination on new query 
    if (this.searchQuery != query) { 
      this.searchQuery = query;
      this.resetPagination();
    }

    // Return all seniors if search input is invalid
    if (this.searchForm.invalid) {
      this.searchActive = false;
      this.searchFound = 0;
      return this.yearMaster;
    }

    this.searchActive = true;

    let filteredSeniors: Senior[] = this.filterSeniors(query);
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
    this.searchQuery = '';
    this.resetPagination();
    this.savePageState();
    this.seniors = this.paginate(this.yearMaster);
  }

  // UI: Pagination, Order, Filter
  pof() {
    if (!this.master) {
      this.searchForm.reset();
      this.o.order.setValue(this.defaultOrder.key);
      return;
    }

    this.orderBackup();
    let filteredSeniors: Senior[] = this.getFilteredSeniors();

    this.seniors = this.paginate(filteredSeniors);

    this.savePageState();
  }

  // Save page state so page doesn't reset upon navigating away
  private savePageState() {
    this.libraryState.searchQuery = this.f.search.value ? this.f.search.value.toLowerCase() : undefined;
    this.libraryState.orderKey = this.selectedOrder.key == this.defaultOrder.key ? undefined : this.selectedOrder.key;
    this.libraryState.yearKey = this.selectedYear.key == this.defaultYear.key ? undefined : this.selectedYear.key;
    this.libraryState.pageStartIndex = this.paginationStartIndex;
    this.libraryState.isMobile = this.mobile;
  }

  // Restore page to saved state
  private restorePageState() {
    const searchQueryState = this.libraryState.searchQuery;
    const orderKeyState = this.libraryState.orderKey;
    const yearKeyState = this.libraryState.yearKey;
    const pageState = this.libraryState.pageStartIndex;

    if (yearKeyState) {
      this.o.year.setValue(yearKeyState);
      this.changeYear(true);
    }

    if (searchQueryState) {
      this.f.search.setValue(searchQueryState);
    }

    if (orderKeyState) {
      this.o.order.setValue(orderKeyState);
    }

    this.orderBackup();
    let filteredSeniors: Senior[] = this.getFilteredSeniors();

    if (pageState) {
      this.paginationStartIndex = pageState;
    }

    this.seniors = this.paginate(filteredSeniors);
  }

  // Scroll to selected senior on return from profile
  private scrollToSelectedSenior() {
    if (this.libraryState.seniorId) {
      setTimeout(() => {
        document.getElementById(this.libraryState.seniorId).scrollIntoView({ behavior: "auto", block: "center", inline: "nearest"});
        this.libraryState.seniorId = undefined;
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
      order: [this.selectedOrder.key,  Validators.compose([
        Validators.required
      ])],
      year: [this.selectedYear.key,  Validators.compose([
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

      if (this.master) {
        this.resetPagination();
        this.clearSearch();
      }
    });
  }

  // OnInit: Get senior data from firebase
  private getSeniors() {
    this.librarySubscription = this.libraryService.library.subscribe((library: Senior[]) => {
      this.master = this.parseSeniorsByYear(this.defaultOrder.action(library));

      this.totalSeniors = this.yearMaster.length;

      if (this.libraryState.hasState(this.mobile)) {
        this.restorePageState();
      }
      else {
        this.seniors = this.paginate(this.yearMaster);
      }

      this.scrollToSelectedSenior();
    });
  }
}
