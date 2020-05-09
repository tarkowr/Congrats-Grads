import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryComponent implements OnInit {

  seniors: any;
  selected: any = undefined;

  constructor(
    private userService: UserService,
    private router: Router) { }

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

  async ngOnInit() {
    this.seniors = await this.getSeniors();
  }

}
