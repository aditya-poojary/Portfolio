import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EducationComponent } from '../education/education.component';
import { AchievementsComponent } from '../achievements/achievements.component';

@Component({
  selector: 'app-education-achievements',
  imports: [EducationComponent, AchievementsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-24 px-6 max-md:px-4 max-md:py-16">
      <div class="container-custom">
        <app-education />
        <app-achievements />
      </div>
    </section>
  `,
})
export class EducationAchievementsComponent {}
