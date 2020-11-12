import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LibraryService } from '../../services/library.service';
import { LibraryState } from '../../models/state/library.state';
import { LocalStorage } from '../../services/local-storage.service';
import { WindowService } from '../../services/window.service';
import { RegexConstants } from '../../constants/regex.constants';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {
  mobile: Boolean = true;

  windowSubscription: Subscription;

  createForm: FormGroup;
  submitted: Boolean = false;
  loading: Boolean = false;

  image: any;
  fileMessage: string = "No file chosen";
  
  btnWait: Boolean = false;

  showSnackbar:Boolean = false;
  message:String;
  
  error:Boolean = false;
  maxUpload: Boolean = false;
  missingImage: Boolean = true;
  wrongType: Boolean = false;
  sizeLimit: Boolean = false;
  otherErr: Boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private windowService: WindowService,
    private libraryService: LibraryService,
    private libraryState: LibraryState,
    private localStorage: LocalStorage,
    private router: Router,
    private regexConstants: RegexConstants) { }

  get f() { return this.createForm.controls }

  // UI: Handle selected image
  selectImage(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.image = file;
      this.fileMessage = file.name;
      this.missingImage = false;
      this.sizeLimit = false;
      this.wrongType = false;
    }
  }

  // Prevent too many uploads from single user
  private validateUploadCount(){
    const max = 2;
    let uploads:[] = this.localStorage.getUploaded();

    if (!uploads) return true;

    return uploads.length < max;
  }

  // Display server errors based on type
  private handleError(err) {
    if (!err) return;

    switch(err.error) {
      case 1001:
        this.missingImage = true;
        break;
      case 1002: 
        this.wrongType = true;
        break;
      case 1003:
        this.otherErr = true;
        break;
      default:
        this.sizeLimit = true;
        break;
    }
  }

  // Successful profile upload
  private onSuccess(data) {
    this.submitted = false;
    this.createForm.reset();
    this.message = 'Successfully Uploaded!';
    this.showSnackbar = true;
    this.error = false;
    this.localStorage.setUploaded(data['id']);
  }

  // Error on profile upload
  private onError(err) {
    this.message = 'Unable to Create Profile';
    this.showSnackbar = true;
    this.error = true;
    this.handleError(err);
    this.btnWait = true;
  }

  // After handling profile upload response
  private onComplete() {
    this.loading = false;

    setTimeout(() => {
      this.showSnackbar = false;
      this.btnWait = false;
      if (!this.error) {
        this.router.navigate(['library']);
      }
    }, (this.error) ? 3000 : 2000);
  }

  // Reset all client-side error indicators
  private resetErrors() {
    this.maxUpload = false;
    this.wrongType = false;
    this.sizeLimit = false;
    this.otherErr = false;
  }

  // UI: Handle upload form on submission
  onSubmit() {
    this.submitted = true;

    this.resetErrors();

    if (this.createForm.invalid) {
      return;
    }

    if (this.missingImage || this.wrongType || this.sizeLimit) {
      return;
    }

    if (!this.validateUploadCount()){
      this.maxUpload = true;
      return;
    }

    this.loading = true;

    this.libraryService.create(this.f.firstname.value, this.f.lastname.value, this.f.school.value, this.f.comments.value, this.image)
      .then(async (data) => {
        await this.libraryService.fetchLibrary();
        this.libraryState.reset();
        this.onSuccess(data);
      })
      .catch(err => {
        this.onError(err);
      })
      .finally(() => {
        this.onComplete();
      });
  }

  ngOnInit() {
    this.buildUserForm();
    this.handleScreenResize();
  }

  ngOnDestroy() {
    this.windowSubscription.unsubscribe();
  }

  // OnInit: Initialize the create user form
  private buildUserForm() {
    this.createForm = this.formBuilder.group({
      firstname: ['',  Validators.compose([
        Validators.required, Validators.pattern(this.regexConstants.NAME)
      ])],
      lastname: ['',  Validators.compose([
        Validators.required, Validators.pattern(this.regexConstants.NAME)
      ])],
      school: ['',  Validators.compose([
        Validators.required, Validators.pattern(this.regexConstants.SCHOOL)
      ])],
      profileImg: [''],
      comments: ['',  Validators.compose([
        Validators.required, Validators.pattern(this.regexConstants.COMMENTS)
      ])]
    });
  }

  // OnInit: Handle a change in the user's viewport
  private handleScreenResize(){
    this.windowSubscription = this.windowService.large.subscribe(isMobile => {
      this.mobile = isMobile;
    });
  }
}
