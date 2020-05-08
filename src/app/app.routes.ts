import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { CreateComponent } from './create/create.component';
import { LibraryComponent } from './library/library.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'home', component: HomeComponent },
    { path: 'create', component: CreateComponent },
    { path: 'library', component: LibraryComponent },
    { path: '**', component: PageNotFoundComponent }
];