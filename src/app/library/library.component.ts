import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { Utilities } from '../utilities/utilities';
import { RegexUtilities } from '../utilities/regex.utilities';
import { WindowService } from '../services/window.service';
import { AppStateService } from '../services/app-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit {
  seniors: any[]; // This will only contain the seniors that are currently displayed on the page
  master: any[]; // Master will always contain every senior in the library
  totalSeniors: number;

  librarySubscription: Subscription;
  windowSubscription: Subscription;

  mobile: Boolean = true;

  readonly paginationLimits = { desktop: 20, mobile: 12 };
  paginationMaxPerPage = this.paginationLimits.desktop;
  paginationStartIndex: number = 0;

  searchForm: FormGroup;
  searchQuery: string = '';
  noSearchResults: Boolean = false;
  searchActive: Boolean = false;
  searchFound: number = 0;

  orderForm: FormGroup;
  readonly selectOptions = [
    {
      key: 1,
      value: 'Alphabetical',
      selected: false,
      action: this.userService.sortByName
    },
    {
      key: 2,
      value: 'Newest',
      selected: true,
      action: this.userService.sortByDateNew
    },
    {
      key: 3,
      value: 'Oldest',
      selected: false,
      action: this.userService.sortByDateOld
    }
  ];
  readonly defaultOption = this.selectOptions[1];
  selectedOption = this.defaultOption;

  constructor(
    private userService: UserService,
    private windowService: WindowService,
    private appStateService: AppStateService,
    private router: Router,
    private formBuilder: FormBuilder,
    private utilities: Utilities,
    private regexUtilities: RegexUtilities) { }

  get f() { return this.searchForm.controls }

  get o() { return this.orderForm.controls }

  // UI: Go to senior profile page
  getProfile(senior) {
    if (!senior) return;

    this.appStateService.seniorId = senior.id;

    this.router.navigate([`profile/${senior.id}`]);
  }

  //
  // PAGINATION
  //

  // Set max number of seniors per page
  private setMaxSeniorsPerPage() {
    this.paginationMaxPerPage = this.mobile ? this.paginationLimits.mobile : this.paginationLimits.desktop;
  }

  // Reduce senior list to current page
  private paginate(seniorsList: any[]) {
    return this.utilities.copyArrayOfObj(seniorsList).splice(this.paginationStartIndex, this.paginationMaxPerPage);
  }

  // Reset pagination to the first page
  private resetPagination() {
    this.paginationStartIndex = 0;
  }

  // UI: Format current pagination state
  getPageState() {

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
      this.utilities.scrollTop(window);
    }
  }
 
  // UI: Handle page right click
  pageRight() {
    let activeSeniors = this.searchActive ? this.searchFound : this.totalSeniors;

    if (this.paginationStartIndex + this.paginationMaxPerPage < activeSeniors) {
      this.paginationStartIndex += this.paginationMaxPerPage;
      this.pof();
      this.utilities.scrollTop(window);
    }
  }

  ///
  /// ORDER
  ///

  // Return the user's selected option
  private getSelectedOrder() {
    return this.selectOptions.find(s => s.key == this.o.order.value);
  }

  // Order seniors (backup) if selected order has changed
  // Apply order to backup since seniors will be paginated and may be filtered
  private orderBackup() {
    const selected = this.getSelectedOrder();

    if (this.selectedOption.key != selected.key) {
      this.selectedOption = selected;
      this.resetPagination();
      selected.action(this.master);
    }
  }

  //
  // FILTER
  //

  // Return all seniors that match a search query
  private filterSeniors(query: string) {
    return this.master.filter(s => this.userService.matchSearch(s.fname, s.lname, query));
  }

  // Return search input from user
  private getSearchQuery(): string {
    return this.f.search.value ? this.f.search.value.toLowerCase() : '';
  }

  // Filter backup by search query
  private getFilteredSeniors(): any[] {
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
      return this.master;
    }

    this.searchActive = true;

    let filteredSeniors: any[] = this.filterSeniors(query);
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
    this.seniors = this.paginate(this.master);
  }

  // UI: Pagination, Order, Filter
  pof() {
    if (!this.master) {
      this.searchForm.reset();
      this.o.order.setValue(this.defaultOption.key);
      return;
    }

    this.orderBackup();
    let filteredSeniors: any[] = this.getFilteredSeniors();

    this.seniors = this.paginate(filteredSeniors);

    this.savePageState();
  }

  // Save page state so page doesn't reset upon navigating away
  private savePageState() {
    this.appStateService.searchQuery = this.f.search.value ? this.f.search.value.toLowerCase() : undefined;
    this.appStateService.orderKey = this.selectedOption.key == this.defaultOption.key ? undefined : this.selectedOption.key;
    this.appStateService.pageStartIndex = this.paginationStartIndex;
    this.appStateService.isMobile = this.mobile;
  }

  // Restore page to saved state
  private restorePageState() {
    const searchQueryState = this.appStateService.searchQuery;
    const orderKeyState = this.appStateService.orderKey;
    const pageState = this.appStateService.pageStartIndex;

    if (searchQueryState) {
      this.f.search.setValue(searchQueryState);
    }

    if (orderKeyState) {
      this.o.order.setValue(orderKeyState);
    }

    this.orderBackup();
    let filteredSeniors: any[] = this.getFilteredSeniors();

    if (pageState) {
      this.paginationStartIndex = pageState;
    }

    this.seniors = this.paginate(filteredSeniors);
  }

  // Scroll to selected senior on return from profile
  private scrollToSelectedSenior() {
    if (this.appStateService.seniorId) {
      setTimeout(() => {
        document.getElementById(this.appStateService.seniorId).scrollIntoView({ behavior: "auto", block: "center", inline: "nearest"});
        this.appStateService.seniorId = undefined;
      });
    }
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
        Validators.required, Validators.pattern(this.regexUtilities.search)
      ])]
    });

    this.orderForm = this.formBuilder.group({
      order: [this.selectedOption.key,  Validators.compose([
        Validators.required
      ])]
    });
  }
  
  // OnInit: Handle a change in the user's viewport
  private handleScreenResize(){
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
    this.librarySubscription = this.userService.library.subscribe((library: any[]) => {
      this.master = this.utilities.copyArrayOfObj(this.defaultOption.action(library));

      this.totalSeniors = library.length;

      if (this.appStateService.libraryHasSavedState(this.mobile)) {
        this.restorePageState();
      }
      else {
        this.seniors = this.paginate(this.master);
      }

      this.scrollToSelectedSenior();
    });
  }
  
}
