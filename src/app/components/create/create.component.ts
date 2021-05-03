import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LibraryService } from '../../services/library.service';
import { Senior } from '../../models/senior';
import { StorageService } from '../../services/storage.service';
import { WindowService } from '../../services/window.service';
import { AnalyticsService } from '../../services/analytics.service';
import { app, regex, storage } from '../../app.constants';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {
  mobile: Boolean = true;

  private windowSubscription: Subscription;

  createForm: FormGroup;
  submitted: Boolean = false;
  loading: Boolean = false;

  image: any;
  fileMessage: string = "No file chosen";
  previewImg: string;
  
  btnWait: Boolean = false;
  
  error: Boolean = false;
  maxUpload: Boolean = false;
  missingImage: Boolean = true;
  wrongType: Boolean = false;
  sizeLimit: Boolean = false;
  serverError: Boolean = false;

  hadImageSizeError: Boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private windowService: WindowService,
    private snackbar: SnackbarService,
    private libraryService: LibraryService,
    private storageService: StorageService,
    private analytics: AnalyticsService,
    private router: Router,
  ) { }

  get f() { return this.createForm.controls }

  get firstname() : string {
    return this.f.firstname.value;
  }

  get lastname() : string {
    return this.f.lastname.value;
  }

  get school() : string {
    return this.f.school.value;
  }

  get comments() : string {
    return this.f.comments.value.replace(/\s\s+/g, ' ');
  }

  get year() : number {
    return app.currentYear;
  }

  get uploads() : any[] {
    return this.storageService.get(storage.uploads) || [];
  }

  // UI: Handle selected image
  selectImage(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.image = file;
      this.fileMessage = file.name;
      this.missingImage = false;
      this.sizeLimit = false;
      this.wrongType = false;

      const reader = new FileReader();
      reader.onload = (e) => this.previewImg = reader.result.toString();

      reader.readAsDataURL(file);
    }
  }

  // Client-side validation of uploaded image
  private validateImage() {
    if (this.image) {
      if (this.image.size > app.maxImageSize) {
        this.sizeLimit = true;
        this.hadImageSizeError = true;

        const user = this.storageService.get(storage.userId);
        this.analytics.trackError('max_image_size', { user: user, name: this.image.name, size: this.image.size });
      }
    }
  }

  // Add new upload to local storage
  private setUploaded(id: string) {
    let uploaded: string[] = this.uploads;

    uploaded.push(id);
    this.storageService.set(storage.uploads, uploaded);
  }

  // Display server errors based on type
  private handleError(err) {
    if (!err) return;

    this.analytics.trackError('upload_profile', { code: err.error });

    switch(err.error) {
      case 1001:
        this.missingImage = true;
        break;
      case 1002: 
        this.wrongType = true;
        break;
      default:
        this.serverError = true;
        break;
    }
  }

  // Successful profile upload
  private onSuccess(senior: Senior) {
    const SNACKBAR_TIMEOUT = 2000;

    this.submitted = false;
    this.createForm.reset();
    this.snackbar.show('Successfully Uploaded!', SNACKBAR_TIMEOUT);
    this.error = false;
    this.setUploaded(senior.id);

    setTimeout(() => this.router.navigate(['library']), SNACKBAR_TIMEOUT);
  }

  // Error on profile upload
  private onError(err) {
    this.snackbar.show('Unable to Create Profile');
    this.error = true;
    this.handleError(err);
    this.btnWait = true;

    setTimeout(() => this.btnWait = false, app.snackbarTimeout);
  }

  // After handling profile upload response
  private onComplete() {
    this.loading = false;
  }

  // Reset all client-side error indicators
  private resetErrors() {
    this.maxUpload = false;
    this.wrongType = false;
    this.sizeLimit = false;
    this.serverError = false;
  }

  // UI: Handle upload form on submission
  onSubmit() {
    this.submitted = true;

    this.resetErrors();

    if (this.createForm.invalid) {
      return;
    }

    this.validateImage();

    if (this.missingImage || this.wrongType || this.sizeLimit) {
      this.btnWait = true;
      setTimeout(() => this.btnWait = false, 1500);
      return;
    }

    this.hadImageSizeError = false;

    if (this.uploads.length >= app.maxUploads) {
      this.maxUpload = true;
      return;
    }

    this.loading = true;

    this.libraryService.upload(this.firstname, this.lastname, this.school, this.comments, this.image)
      .then(async (senior: Senior) => {
        await this.libraryService.fetchLibrary();
        this.libraryService.resetState();
        this.onSuccess(senior);
      })
      .catch(err => this.onError(err))
      .finally(() => this.onComplete());
  }

  ngOnInit() {
    this.buildUserForm();
    this.handleScreenResize();
  }

  ngOnDestroy() {
    this.windowSubscription.unsubscribe();

    if (this.hadImageSizeError) {
      const user = this.storageService.get(storage.userId);
      this.analytics.trackEvent('abandon_ship', { user: user });
    }
  }

  // OnInit: Initialize the create user form
  private buildUserForm() {
    this.createForm = this.formBuilder.group({
      firstname: ['',  Validators.compose([
        Validators.required, Validators.pattern(regex.name)
      ])],
      lastname: ['',  Validators.compose([
        Validators.required, Validators.pattern(regex.name)
      ])],
      school: ['',  Validators.compose([
        Validators.required, Validators.pattern(regex.school)
      ])],
      profileImg: [''],
      comments: ['',  Validators.compose([
        Validators.required, Validators.maxLength(500)
      ])]
    });
  }

  // OnInit: Handle a change in the user's viewport
  private handleScreenResize() {
    this.windowSubscription = this.windowService.large.subscribe(
      (isMobile) => this.mobile = isMobile
    );
  }
}
