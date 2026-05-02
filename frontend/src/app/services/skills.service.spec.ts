import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkillsService } from './skills.service';
interface Skill {
  id?: number;
  name: string;
}

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skills.component.html'
})
export class SkillsComponent {

  skills: Skill[] = [];

  constructor(private skillsService: SkillsService) {}

  ngOnInit() {
    this.skillsService.getSkills().subscribe((res: any) => {
      this.skills = res;
    });
  }
}