import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { getApiErrorMessage } from '../utils/api-error.util';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="card">
      <h1>Skills catalog</h1>
      <p class="muted">
        Skills are shared listings in the marketplace. Note each skill’s <strong>ID</strong> when you create an
        offer under <strong>My listings</strong>.
      </p>
      <form [formGroup]="searchForm" (ngSubmit)="loadSkills()">
        <div class="row">
          <div>
            <label>Search</label>
            <input formControlName="search" placeholder="title/category/description" />
          </div>
        </div>
        <button>Refresh</button>
      </form>
    </section>

    <section class="card">
      <h3>Create Skill</h3>
      <form [formGroup]="createForm" (ngSubmit)="createSkill()">
        <div class="row">
          <div>
            <label>Title</label>
            <input formControlName="title" />
          </div>
          <div>
            <label>Category</label>
            <input formControlName="category" />
          </div>
          <div>
            <label>Description</label>
            <textarea formControlName="description"></textarea>
          </div>
        </div>
        <button [disabled]="createForm.invalid">Create Skill</button>
      </form>
    </section>

    <section class="card">
      <h3>Skill List</h3>
      <div class="server-error" *ngIf="error" role="alert">{{ error }}</div>
      <ul class="skill-catalog">
        <li *ngFor="let skill of skills">
          <strong>ID {{ skill.id }}</strong> — {{ skill.title }}
          <span class="muted">({{ skill.category }})</span>
        </li>
      </ul>
    </section>
  `,
})
export class SkillsPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly apiService = inject(ApiService);
  skills: any[] = [];
  error = '';

  searchForm = this.fb.nonNullable.group({ search: [''] });
  createForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    category: ['', [Validators.required]],
    description: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor() {
    this.loadSkills();
  }

  loadSkills(): void {
    this.error = '';
    this.apiService.getSkills(this.searchForm.controls.search.value).subscribe({
      next: (skills) => (this.skills = skills),
      error: (err) => (this.error = getApiErrorMessage(err, 'Could not load skills.')),
    });
  }

  createSkill(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    this.apiService.createSkill(this.createForm.getRawValue()).subscribe({
      next: () => {
        this.createForm.reset();
        this.loadSkills();
      },
      error: (err) => (this.error = getApiErrorMessage(err, 'Could not create skill.')),
    });
  }
}
