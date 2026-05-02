import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { BrowsePageComponent } from './pages/browse-page.component';
import { LoginPageComponent } from './pages/login-page.component';
import { RegisterPageComponent } from './pages/register-page.component';
import { MyReviewsPageComponent } from './pages/my-reviews-page.component';
import { SellerDashboardPageComponent } from './pages/seller-dashboard-page.component';
import { SkillsPageComponent } from './pages/skills-page.component';

export const routes: Routes = [
  { path: '', component: LoginPageComponent },
  { path: 'login', redirectTo: '', pathMatch: 'full' },
  { path: 'register', component: RegisterPageComponent },
  { path: 'home', component: BrowsePageComponent, canActivate: [authGuard] },
  { path: 'seller', component: SellerDashboardPageComponent, canActivate: [authGuard] },
  { path: 'reviews', component: MyReviewsPageComponent, canActivate: [authGuard] },
  { path: 'skills', component: SkillsPageComponent, canActivate: [authGuard] },
];
