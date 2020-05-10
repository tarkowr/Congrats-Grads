import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
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
  submitted: Boolean = false;
  loading: Boolean = false;
  noResults: Boolean = false;
  message: string = 'No Results!';
  mobile: Boolean = false;
  breakPoint: Number = 992;

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder,
    private router: Router) { }

  get f() { return this.searchForm.controls }

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
    this.selected = undefined;
  }

  // Initialize the search form
  buildSearchForm() {
    this.searchForm = this.formBuilder.group({
      search: ['',  Validators.compose([
        Validators.required, Validators.pattern(/^[a-zA-Z0-9 \-]{1,50}$/)
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

  async ngOnInit() {
    this.buildSearchForm();
    this.handleScreenSize();
    this.attachResizeListener();

    this.seniors = await this.getSeniors();

    if (this.seniors) {
      this.backup = this.copyArrayOfObj(this.seniors);
    }
  }

}
