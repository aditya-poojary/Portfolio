import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AboutMeComponent } from '../about-me/about-me.component';
import { ExperienceComponent } from '../experience/experience.component';
import { PersonalProjectsComponent } from '../personal-projects/personal-projects.component';
import { TechStackComponent } from '../tech-stack/tech-stack.component';
import { EducationComponent } from '../education/education.component';
import { AchievementsComponent } from '../achievements/achievements.component';
import { ProblemSolvingComponent } from '../problem-solving/problem-solving.component';

@Component({
  selector: 'app-layout',
  imports: [
    AboutMeComponent,
    ExperienceComponent,
    PersonalProjectsComponent,
    TechStackComponent,
    EducationComponent,
    AchievementsComponent,
    ProblemSolvingComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full min-h-dvh">
      <app-about-me />
      <app-experience />
      <app-personal-projects />
      <app-tech-stack />
      <app-education />
      <app-achievements />
      <app-problem-solving />
    </div>
  `,
})
export class LayoutComponent {}
