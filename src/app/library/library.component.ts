import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { Utilities } from '../utilities/utilities';
import { RegexUtilities } from '../utilities/regex.utilities';
import { WindowService } from '../services/window.service';
import { AppStateService } from '../services/app-state.service';

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit {
  seniors: any[];
  backup: any[];
  totalSeniors: number;

  mobile: Boolean = true;

  readonly paginationLimits = { desktop: 20, mobile: 12 };
  paginationMaxPerPage = this.paginationLimits.desktop;
  paginationStartIndex: number = 0;

  readonly noSearchResultsMessage: string = 'No Results!';
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

  // UI: Go to senior profile
  getProfile(senior) {
    if (!senior) return;

    this.appStateService.seniorId = senior.id;
    
    this.router.navigate([`profile/${senior.id}`]);
  }

  // Set limit for number of profiles on one page based on mobile state
  setMaxSeniorsPerPage() {
    this.paginationMaxPerPage = this.mobile ? this.paginationLimits.mobile : this.paginationLimits.desktop;
  }

  // Handle a change in the user's viewport
  handleScreenResize(){
    this.setMaxSeniorsPerPage();

    this.windowService.large.subscribe(isMobile => {
      this.mobile = isMobile;

      this.setMaxSeniorsPerPage();

      if (this.seniors) {
        this.resetPagination();
        this.clearSearch();
      }
    });
  }

  // Initialize the search and order inputs
  buildForms() {
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

  // Restore seniors array from backup with pagination
  restoreBackupWithPagination() {
    this.seniors = this.paginationWrapper(this.backup);
  }

  // Split list of seniors into current page
  paginationWrapper(seniorsList: any[]) {
    return this.utilities.copyArrayOfObj(seniorsList).splice(this.paginationStartIndex, this.paginationMaxPerPage);
  }

  // Reset pagination to the first page
  resetPagination() {
    this.paginationStartIndex = 0;
  }

  // Determine current pagination state
  getPageState() {
    
    // Index of the last senior on the current page
    // Example: 20-X of 120
    let pageMax = this.paginationMaxPerPage + this.paginationStartIndex;

    // Number of total seniors displayed in the library
    // Example: 20-40 of X
    let activeSeniors = this.searchActive ? this.searchFound : this.totalSeniors;

    // Contains pagination state in the format of X-X of X
    let pageDisplay: string;

    // Set total page count to number of seniors or max per page (whichever is smaller)
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
      pageDisplay = pageMax.toString();
    }
    else{
      pageDisplay = `${this.paginationStartIndex + 1}-${pageMax}`;
    }

    return `${pageDisplay} of ${activeSeniors}`;
  }

  // Handle page left
  pageLeft() {
    if (this.paginationStartIndex != 0) {
      this.paginationStartIndex -= this.paginationMaxPerPage;
      this.pof();
      this.utilities.scrollTop(window);
    }
  }
 
  // Handle page right
  pageRight() {
    let activeSeniors = this.searchActive ? this.searchFound : this.totalSeniors;

    if (this.paginationStartIndex + this.paginationMaxPerPage < activeSeniors) {
      this.paginationStartIndex += this.paginationMaxPerPage;
      this.pof();
      this.utilities.scrollTop(window);
    }
  }

  // Return a sort option by the user's selected option
  getSelectedOption() {
    return this.selectOptions.find(s => s.key == this.o.order.value);
  }

  // Return all seniors that match a search query
  findMatchingSeniors(query: string) {
    return this.backup.filter(s => this.userService.matchSearch(s.fname, s.lname, query));
  }

  // Clear search if no results found
  clearSearch() {
    this.noSearchResults = false;
    this.searchActive = false;
    this.searchForm.reset();
    this.restoreBackupWithPagination();
    this.savePageState();
  }

  // Pagination, Order, Filter
  pof(isRestoringState = false) {

    // If library is empty (likely still loading) then reset forms
    if (!this.seniors) {
      this.searchForm.reset();
      this.o.order.setValue(this.defaultOption.key);
      return;
    }

    const selected = this.getSelectedOption();

    // Order seniors if selected order has changed
    if (this.selectedOption.key != selected.key) {
      this.selectedOption = selected;

      if (!isRestoringState) this.resetPagination();

      selected.action(this.backup);
    }

    // Handle search
    let query:string = this.f.search.value ? this.f.search.value.toLowerCase() : '';
    this.noSearchResults = false;

    // On new query reset pagination
    if (this.searchQuery != query && !isRestoringState) { 
      this.searchQuery = query;
      this.resetPagination();
    }

    if (!isRestoringState) this.savePageState();

    // Reset search if search input is invalid
    if (this.searchForm.invalid) {
      this.searchActive = false;
      this.searchFound = 0;
      this.restoreBackupWithPagination();
      return;
    }

    if (!this.searchActive) this.searchActive = true;

    let foundSeniors: any[] = this.findMatchingSeniors(query);
    this.searchFound = foundSeniors.length;
     
    if (this.searchFound <= 0) this.noSearchResults = true;

    this.seniors = this.paginationWrapper(foundSeniors);
  }

  // Save page state so page doesn't reset upon navigating away
  savePageState() {
    this.appStateService.searchQuery = this.f.search.value ? this.f.search.value.toLowerCase() : undefined;
    this.appStateService.orderKey = this.selectedOption.key == this.defaultOption.key ? undefined : this.selectedOption.key;
    this.appStateService.pageStartIndex = this.paginationStartIndex;
    this.appStateService.isMobile = this.mobile;
  }

  // Restore page to saved state
  getSavedPageState() {
    const searchQueryState = this.appStateService.searchQuery;
    const orderKeyState = this.appStateService.orderKey;
    const pageState = this.appStateService.pageStartIndex;

    if (searchQueryState) {
      this.f.search.setValue(searchQueryState);
    }

    if (orderKeyState) {
      this.o.order.setValue(orderKeyState);
    }

    if (pageState) {
      this.paginationStartIndex = pageState;
    }

    this.pof(true);
  }

  ngOnInit() {
    this.buildForms();
    this.handleScreenResize();

    this.userService.library.subscribe((library: any[]) => {
      if (this.seniors) return;

      this.seniors = library;

      this.backup = this.utilities.copyArrayOfObj(this.defaultOption.action(library));
      this.totalSeniors = library.length;

      // Restore state if saved
      if (this.appStateService.libraryHasSavedState(this.mobile)) {
        this.getSavedPageState();
      }
      else {
        this.restoreBackupWithPagination();
      }

      // Scroll to selected senior on return from profile
      if (this.appStateService.seniorId) {
        setTimeout(() => {
          document.getElementById(this.appStateService.seniorId).scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest"});
          this.appStateService.seniorId = undefined;
        }, 0);
      }
    });
  }
  
}
