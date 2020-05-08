import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router'
import { UserService } from '../services/user.service';

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

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,) { }

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
      comments: ['',  Validators.compose([
        Validators.required, Validators.pattern(/^.{1,500}$/)
      ])]
    })
  }

  onSubmit() {
    this.submitted = true;

    if (this.createForm.invalid) {
      return;
    }

    this.loading = true;

    this.userService.create(this.f.firstname.value, this.f.lastname.value, this.f.school.value, this.f.comments.value)
      .then(data => {
        this.submitted = false;
        this.createForm.reset();

        this.message = 'Successfully Uploaded!'
        this.showSnackbar = true;
        this.error = false;
      })
      .catch(err => {
        this.message = 'Unable to Upload'
        this.showSnackbar = true;
        this.error = true;
      })
      .finally(() => {
        this.loading = false;

        setTimeout(() => {
          this.showSnackbar = false;
          if (!this.error) {
            this.router.navigate(['library']);
          }
        }, 3000);
      });
  }

  ngOnInit() {
    this.buildUserForm();
  }
}
