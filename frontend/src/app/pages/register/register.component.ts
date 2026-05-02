import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';

  constructor(private http: HttpClient) {}

  register() {
    this.http.post('http://127.0.0.1:8000/api/users/register/', {
      username: this.username,
      email: this.email,
      password: this.password
    }).subscribe({
      next: res => console.log('REGISTER SUCCESS', res),
      error: err => console.log('REGISTER ERROR', err)
    });
  }
}