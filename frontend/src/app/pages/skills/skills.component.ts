import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { SkillsService } from '../../services/skills.service';
import { NgZone } from '@angular/core';

interface Skill {
  id: number;
  title: string;
  description: string;
  category: string;
  image: string | null;
}

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skills.component.html'
})
export class SkillsComponent implements OnInit {

  skills: Skill[] = [];
  loading = true;

  private platformId = inject(PLATFORM_ID);

constructor(
  private skillsService: SkillsService,
  private ngZone: NgZone
) {}
ngOnInit(): void {

  // ✅ Only run in browser
  if (!isPlatformBrowser(this.platformId)) {
    return;
  }

  const token = localStorage.getItem('access');

  if (!token) {
    console.warn('No token found');
    this.loading = false;
    return;
  }

  this.skillsService.getSkills().subscribe({
    next: (res: any) => {
      this.skills = res;
      this.loading = false;
    },
    error: (err) => {
      console.error('SKILLS ERROR:', err);
      this.loading = false;
    }
  });
}
trackById(index: number, skill: any): number {
  return skill.id;
}
}
