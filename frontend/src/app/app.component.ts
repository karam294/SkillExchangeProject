import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ProfileMenuComponent } from './components/profile-menu.component';
import { ApiService } from './services/api.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ProfileMenuComponent],
  template: `
    @if (auth.isLoggedIn()) {
      <nav class="top-nav">
        <div class="nav-links">
          <a routerLink="/home" routerLinkActive="active">Browse</a>
          <a routerLink="/seller" routerLinkActive="active">My listings</a>
          <a routerLink="/reviews" routerLinkActive="active">Reviews</a>
          <a routerLink="/skills" routerLinkActive="active">Skills</a>
        </div>
        <div class="nav-right">
          <app-profile-menu />
          <a href="#" class="nav-logout" (click)="logout($event)">Logout</a>
        </div>
      </nav>
      <main class="container">
        <router-outlet></router-outlet>
      </main>
    } @else {
      <main class="auth-outlet">
        <router-outlet></router-outlet>
      </main>
    }
  `,
})
export class AppComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) return;
    this.api.getProfile().subscribe({
      next: (u) => this.auth.setUser(u),
      error: () => {},
    });
  }

  logout(event: Event): void {
    event.preventDefault();
    this.auth.logout();
    void this.router.navigateByUrl('/');
  }
}
