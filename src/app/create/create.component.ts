import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { LocalStorage } from '../services/localStorage.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent implements OnInit {
  createForm: FormGroup;
  submitted: Boolean = false;
  loading: Boolean = false;
  showSnackbar:Boolean = false;
  message:String;
  error:Boolean = false;
  localStorage: LocalStorage;
  image: any;
  fileMessage: string = "No file chosen";
  maxUpload: Boolean = false;
  missingImage: Boolean = true;
  wrongType: Boolean = false;
  sizeLimit: Boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router) { 
      this.localStorage = new LocalStorage();
    }

  get f() { return this.createForm.controls }

  // Initialize the create user form
  buildUserForm() {
    this.createForm = this.formBuilder.group({
      firstname: ['',  Validators.compose([
        Validators.required, Validators.pattern(/^[a-zA-Z0-9 ]{1,20}$/)
      ])],
      lastname: ['',  Validators.compose([
        Validators.required, Validators.pattern(/^[a-zA-Z0-9 ]{1,20}$/)
      ])],
      school: ['',  Validators.compose([
        Validators.required, Validators.pattern(/^[a-zA-Z0-9 ]{1,40}$/)
      ])],
      profileImg: [''],
      comments: ['',  Validators.compose([
        Validators.required, Validators.pattern(/^.{1,500}$/)
      ])]
    })
  }

  // Handle selected image
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
  validateUploadCount(){
    const max = 2;
    let uploads:[] = this.localStorage.GetUploaded();

    if (!uploads) return true;

    if (uploads.length >= max) return false;
    else return true;
  }

  // Display errors based on type
  handleError(err) {
    if (!err) return;

    switch(err.error) {
      case 1001:
        this.missingImage = true;
        break;
      case 1002: 
        this.wrongType = true;
        break;
      default:
        this.sizeLimit = true;
        break;
    }
  }

  // Successful profile upload
  onSuccess(data) {
    this.submitted = false;
    this.createForm.reset();
    this.message = 'Successfully Uploaded!';
    this.showSnackbar = true;
    this.error = false;
    this.localStorage.SetUploaded(data['id']);
  }

  // Error on profile upload
  onError(err) {
    this.message = 'Unable to Create Profile';
    this.showSnackbar = true;
    this.error = true;
    this.handleError(err);
  }

  // After handling profile upload response
  onComplete() {
    this.loading = false;

    setTimeout(() => {
      this.showSnackbar = false;
      if (!this.error) {
        this.router.navigate(['library']);
      }
    }, (this.error) ? 3000 : 2000);
  }

  // Create form on submit
  onSubmit() {
    this.submitted = true;

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

    this.userService.create(this.f.firstname.value, this.f.lastname.value, this.f.school.value, this.f.comments.value, this.image)
      .then(data => {
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
  }
}
