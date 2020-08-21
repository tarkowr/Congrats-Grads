import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { Utilities } from '../utilities/utilities';
import { RegexUtilities } from '../utilities/regex.utilities';
import { WindowService } from '../services/window.service';

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit {

  seniors: any[];
  backup: any[];
  selected: any = undefined;
  totalSeniors: number;

  mobile: Boolean = true;

  showSnackbar: Boolean = false;
  snackbarMessage:string;

  paginationStartIndex: number = 0;
  paginationLimits = { desktop: 20, mobile: 12 };
  paginationMaxPerPage = this.paginationLimits.desktop;

  searchForm: FormGroup;
  noSearchResults: Boolean = false;
  noSearchResultsMessage: string = 'No Results!';
  searchActive: Boolean = false;
  searchFound: number = 0;

  orderForm: FormGroup;
  selectOptions = [
    {
      key: 1,
      value: 'Alphabetical',
      selected: true,
      action: this.userService.sortByName
    },
    {
      key: 2,
      value: 'Newest',
      selected: false,
      action: this.userService.sortByDateNew
    },
    {
      key: 3,
      value: 'Oldest',
      selected: false,
      action: this.userService.sortByDateOld
    }
  ];
  selectedOption = this.selectOptions[1];

  constructor(
    private userService: UserService,
    private windowService: WindowService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private utilities: Utilities,
    private regexUtilities: RegexUtilities) { }

  get f() { return this.searchForm.controls }

  get o() { return this.orderForm.controls }

  // UI: Display clicked senior profile
  getProfile(senior) {
    this.selected = senior;
  }

  // Handle a change in the user's viewport
  handleScreenResize(){
    this.windowService.large.subscribe(isMobile => {
      this.mobile = isMobile;

      this.resetPagination();
      this.paginationMaxPerPage = this.mobile ? this.paginationLimits.mobile : this.paginationLimits.desktop;

      if (this.backup) {
        this.clearSearch();
      }
    });
  }

  // Determine whether to exit profile view based on navbar click
  cancelSelected(event){
    let target: string = event.target.innerText;

    if (target.toLowerCase() === 'library'){
      this.selected = undefined;
    }
  }

  // Exit profile view
  // TODO: Find a way to save user's scroll position when switching between profile and library
  cancel() {
    this.selected = undefined;
  }

  // Initialize the search form
  buildSearchForm() {
    this.searchForm = this.formBuilder.group({
      search: ['',  Validators.compose([
        Validators.required, Validators.pattern(this.regexUtilities.search)
      ])]
    });
  }

  // Initialize the search form
  buildOrderForm() {
    this.orderForm = this.formBuilder.group({
      order: [this.selectedOption.key,  Validators.compose([
        Validators.required
      ])]
    })
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
  }

  // Pagination, Order, Filter
  pof() {
    let selected = this.getSelectedOption();

    // Order seniors if selected order has changed
    if (this.selectedOption.key != selected.key) {
      this.selectedOption = selected;
      this.resetPagination();
      selected.action(this.backup);
    }

    // Handle search
    let query:string = this.f.search.value ? this.f.search.value.toLowerCase() : '';
    this.noSearchResults = false;

    if (this.searchForm.invalid) {
      this.searchActive = false;
      this.searchFound = 0;
      this.restoreBackupWithPagination();
      return;
    }

    // Reset pagination on new search
    if(!this.searchActive) {
      this.resetPagination();
      this.searchActive = true;
    }

    let foundSeniors: any[] = this.findMatchingSeniors(query);
    this.searchFound = foundSeniors.length;
 
    if (this.searchFound <= 0) {
      this.noSearchResults = true;
    }

    // Handle pagination
    this.seniors = this.paginationWrapper(foundSeniors);
  }

  // Get senior by ID
  lookupSenior(id:string) {
    let found = undefined;

    this.backup.forEach(s => {
      if (s.id === id){
        found = s;
      }
    });

    return found;
  }

  // Get senior profile by url query string ID
  handleProfileLink(id:string) {
    let senior = this.lookupSenior(id);

    if (!senior){
      setTimeout(() => {
        this.showSnackbar = true;
        this.snackbarMessage = 'Unable to find profile!';
        setTimeout(() => this.showSnackbar = false, 3000);
      }, 1000);

      return;
    }

    this.selected = senior;
  }

  ngOnInit() {
    this.buildSearchForm();
    this.buildOrderForm();

    this.handleScreenResize();

    this.userService.library.subscribe((library: any[]) => {
      if (this.seniors) return;

      this.seniors = library;

      this.backup = this.utilities.copyArrayOfObj(this.userService.sortByDateNew(this.seniors));
      this.restoreBackupWithPagination();
      this.totalSeniors = this.backup.length;

      this.activatedRoute.queryParams.subscribe(params => {
        const id = params['profile'];
        if (!id) return;
        this.handleProfileLink(id);
      });
    })
  }
  
}
