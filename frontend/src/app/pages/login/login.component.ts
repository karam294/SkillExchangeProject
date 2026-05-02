import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(private http: HttpClient, private router: Router) {}

  login() {
    this.http.post('http://127.0.0.1:8000/api/token/', {
  username: this.username,
  password: this.password
}).subscribe({
  next: (res: any) => {
    console.log("JWT LOGIN SUCCESS", res);

    // SAVE TOKENS
    localStorage.setItem('access', res.access);
    localStorage.setItem('refresh', res.refresh);

    console.log("User logged in with JWT");
    console.log('ACCESS TOKEN SAVED:', res.access);
console.log('STORAGE VALUE:', localStorage.getItem('access'));
this.router.navigate(['/skills']);
  },
  error: (err) => {
    console.log("LOGIN ERROR", err);
  }
});
  }
}