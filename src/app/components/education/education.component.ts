import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

interface EducationEntry {
  period: string;
  title: string;
  subtitle: string;
  description: string;
  highlight?: string;
}

@Component({
  selector: 'app-education',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './education.component.html',
})
export class EducationComponent {
  protected readonly education = signal<EducationEntry[]>([
    {
      period: '2022 — Present',
      title: 'Thakur College of Engineering & Technology',
      subtitle: 'B.E. — Information Technology',
      description: 'Mumbai University | Expected Graduation: 2026',
      highlight: 'CGPA 8.87/10',
    },
    {
      period: '2020 — 2022',
      title: 'Yashodham Junior College',
      subtitle: 'Higher Secondary Education',
      description: '',
      highlight: '63.83%',
    },
    {
      period: '2013 — 2020',
      title: 'St. Thomas High School',
      subtitle: 'Primary & Secondary Education',
      description: '',
      highlight: '83%',
    },
  ]);
}
