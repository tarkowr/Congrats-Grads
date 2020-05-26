import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';

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

  mobile: Boolean = false;
  breakPoint: Number = 992;

  showSnackbar: Boolean = false;
  snackbarMessage:string;

  paginationStartIndex: number = 0;
  paginationMaxPerPage = 20;

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
      action: this.sortByName
    },
    {
      key: 2,
      value: 'Newest',
      selected: false,
      action: this.sortByDateNew
    },
    {
      key: 3,
      value: 'Oldest',
      selected: false,
      action: this.sortByDateOld
    }
  ];
  selectedOption = this.selectOptions[1];


  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute) { }

  get f() { return this.searchForm.controls }

  get o() { return this.orderForm.controls }

  // Check if screen is mobile
  handleScreenSize(){
    if (window.innerWidth >= this.breakPoint) {
      this.mobile = false;
    }
    else {
      this.mobile = true;
    }
  }

  // Handle screen resize
  attachResizeListener(){
    window.addEventListener('resize', () => {
      this.handleScreenSize();
    });
  }

  // Retrieve all seniors from firebase
  getSeniors() {
    return this.userService.getAll()
      .then((data:[]) => {
        return data.length > 0 ? data : null;
      })
      .catch(err => {
        console.log(err)
        return null;
      });
  }

  // Display senior profile
  getProfile(senior) {
    this.selected = senior;
  }

  // Determine whether to exit profile view based on navbar click
  cancelSelected(event){
    let target: string = event.target.innerText;

    if (target.toLowerCase() === 'library'){
      this.selected = undefined;
    }
  }

  // Exit profile view
  cancel() {
    let id = this.selected.id;
    this.selected = undefined;

    if (this.mobile){
      setTimeout(() => {
        document.getElementById(id).scrollIntoView({ behavior: 'auto'});
      }, 200);
    }
  }

  // Initialize the search form
  buildSearchForm() {
    this.searchForm = this.formBuilder.group({
      search: ['',  Validators.compose([
        Validators.required, Validators.pattern(/^[a-zA-Z0-9 \-]{1,50}$/)
      ])]
    })
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
    return this.copyArrayOfObj(seniorsList).splice(this.paginationStartIndex, this.paginationMaxPerPage);
  }

  // Reset pagination to the first page
  resetPagination() {
    this.paginationStartIndex = 0;
  }

  // Return pagination state
  getPageState() {
    let pageMax = this.paginationMaxPerPage + this.paginationStartIndex;
    let activeSeniors = this.searchActive ? this.searchFound : this.totalSeniors;
    let pageDisplay: string;

    if (pageMax > this.totalSeniors) {
      pageMax = this.totalSeniors;
    }
    if (this.searchActive) {
      pageMax = this.paginationStartIndex + this.seniors.length;
    }

    if ((this.paginationStartIndex + 1) == pageMax) {
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
      this.scrollTop();
    }
  }
 
  // Handle page right
  pageRight() {
    let activeSeniors = this.searchActive ? this.searchFound : this.totalSeniors;

    if (this.paginationStartIndex + this.paginationMaxPerPage < activeSeniors) {
      this.paginationStartIndex += this.paginationMaxPerPage;
      this.pof();
      this.scrollTop();
    }
  }

  // Scroll to top of page
  scrollTop() {
    window.scrollTo(0, 0);
  }
 
  // Copy arrow of objects w/o reference to properties
  copyArrayOfObj(arr:any[]){
    return arr.map(obj => ({ ...obj }));
  }

  // Sort Seniors by Full Name
  sortByName(obj:any[]){
    return obj.sort((a, b) => {
      let aFullName = (a.lname + ' ' + a.fname).trim().toLowerCase().replace('  ', ' ');
      let bFullName = (b.lname + ' ' + b.fname).trim().toLowerCase().replace('  ', ' ');

      if(aFullName < bFullName) { return -1; }
      if(aFullName > bFullName) { return 1; }
      return 0;
    });
  }

  // Sort Seniors by Oldest Date Uploaded
  sortByDateOld(obj:any[]) {
    return obj.sort((a, b) => {
      let aDate = a.uploaded._seconds;
      let bDate = b.uploaded._seconds;

      if(aDate < bDate) { return -1; }
      if(aDate > bDate) { return 1; }
      return 0;
    });
  }

  // Sort Seniors by Newest Date Uploaded
  sortByDateNew(obj:any[]) {
    return obj.sort((a, b) => {
      let aDate = a.uploaded._seconds;
      let bDate = b.uploaded._seconds;

      if(aDate < bDate) { return 1; }
      if(aDate > bDate) { return -1; }
      return 0;
    });
  }

  // Return a sort option by the user's selected option
  getSelectedOption() {
    return this.selectOptions.find(s => s.key == this.o.order.value);
  }

  // Determine whether a search matches a senior
  matchSearch(fname: string, lname: string, query: string) {
    let length = query.length;
    query = query.toLowerCase();
    fname = fname.substring(0, length).toLowerCase();
    lname = lname.substring(0, length).toLowerCase();
    let name = (fname + ' ' + lname).substring(0, length);

    if (fname === query || lname === query || query === name){
      return true;
    }
    return false;
  }

  // Return all seniors that match a search query
  findMatchingSeniors(query: string) {
    return this.backup.filter(s => this.matchSearch(s.fname, s.lname, query));
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

    this.seniors.forEach(s => {
      if (s.id === id){
        found = s;
      }
    });

    return found;
  }

  // Get senior profile by query string ID
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

  async ngOnInit() {
    this.buildSearchForm();
    this.buildOrderForm();

    this.handleScreenSize();
    this.attachResizeListener();

    this.seniors = await this.getSeniors();

    if (this.seniors) {
      this.backup = this.copyArrayOfObj(this.sortByDateNew(this.seniors));
      this.restoreBackupWithPagination();
      this.totalSeniors = this.backup.length;

      this.activatedRoute.queryParams.subscribe(params => {
        const id = params['profile']
        if (!id) return;
        this.handleProfileLink(id);
      });
    }
  }

}
