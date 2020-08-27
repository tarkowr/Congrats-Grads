import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { CreateComponent } from './create/create.component';
import { LibraryComponent } from './library/library.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { ContactComponent } from './contact/contact.component';
import { TermsComponent } from './terms/terms.component';
import { ProfileComponent } from './profile/profile.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'home', component: HomeComponent },
    { path: 'create', component: CreateComponent },
    { path: 'library', component: LibraryComponent },
    { path: 'profile', component: ProfileComponent },
    { path: 'profile/:id', component: ProfileComponent },
    { path: 'privacy', component: PrivacyComponent },
    { path: 'contact',  component: ContactComponent },
    { path: 'terms', component: TermsComponent },
    { path: '**', component: PageNotFoundComponent }
];