import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router'
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
  searchForm: any;
  orderForm: any;
  submitted: Boolean = false;
  loading: Boolean = false;
  noResults: Boolean = false;
  message: string = 'No Results!';
  mobile: Boolean = false;
  breakPoint: Number = 992;
  showSnackbar: Boolean = false;
  snackbarMessage:string;
  selectOptions = [
    {
      key: 1,
      value: 'Alphabetical',
      selected: true
    },
    {
      key: 2,
      value: 'Newest',
      selected: false
    },
    {
      key: 3,
      value: 'Oldest',
      selected: false
    }
  ];

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder,
    private router: Router,
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
      }, 0);
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
      order: [this.selectOptions[0].key,  Validators.compose([
        Validators.required
      ])]
    })
  }

  // Restore seniors array from backup
  restoreBackup() {
    this.seniors = this.copyArrayOfObj(this.backup);
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

  // Handle profile search
  onSearch() {
    let query:string = this.f.search.value.toLowerCase();
    this.noResults = false;

    if (this.searchForm.invalid || !this.backup) {
      this.restoreBackup();
      return;
    }

    this.seniors = this.copyArrayOfObj(this.backup.filter(s => this.matchSearch(s.fname, s.lname, query)));
    
    if (this.seniors.length <= 0) {
      this.noResults = true;
    }
  }

  // Order seniors by option
  order() {
    switch(this.o.order.value) {
      case '2':
        this.seniors = this.sortByDateNew(this.backup);
        break;
      case '3':
        this.seniors = this.sortByDateOld(this.backup);
        break;
      default:
        this.seniors = this.sortByName(this.backup);
        break;
    }

    this.onSearch();
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
      this.seniors = this.sortByName(this.seniors);
      this.backup = this.copyArrayOfObj(this.seniors);

      this.activatedRoute.queryParams.subscribe(params => {
        const id = params['profile']
        if (!id) return;
        this.handleProfileLink(id);
      });
    }
  }

}
