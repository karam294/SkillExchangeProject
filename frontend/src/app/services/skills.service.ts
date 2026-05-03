import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SkillsService {

  private apiUrl = 'http://127.0.0.1:8000/api/skills/';

  constructor(private http: HttpClient) {}

  getSkills() {
    return this.http.get(this.apiUrl);
  }
}