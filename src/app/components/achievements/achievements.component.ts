import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

interface AchievementEntry {
  period: string;
  title: string;
  subtitle: string;
  description: string;
  bullets?: string[];
  tags?: string[];
}

@Component({
  selector: 'app-achievements',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './achievements.component.html',
})
export class AchievementsComponent {
  protected readonly achievements = signal<AchievementEntry[]>([
    {
      period: 'Feb 2025',
      title: 'Global Hyperloop Competition',
      subtitle: 'IIT Madras — Propulsion Engineer',
      description:
        'Represented the team at the Global Hyperloop Competition hosted by the Indian Institute of Technology, Madras. Competed against 15 national teams in an on-site event.',
      bullets: [
        'Awarded Best Embedded System among 15 national teams',
        'Special Mention for Pod Demonstration — Top 3 teams',
        'Special Mention for Research Blueprint — Top 10 teams',
        'Presented team innovations to jury and a technically proficient audience',
      ],
      tags: ['Embedded Systems', 'Hyperloop', 'IIT-M', 'On-Site'],
    },
    {
      period: 'Jul 2025',
      title: "Mind's Eye Competition",
      subtitle: 'Winner — TCET',
      description:
        "Secured first place in the Mind's Eye competition held at Thakur College of Engineering & Technology, demonstrating creative problem-solving and technical acumen.",
      tags: ['Winner', 'TCET'],
    },
    {
      period: 'Dec 2025',
      title: 'Hacktimus Hackathon',
      subtitle: 'Finalist',
      description:
        'Advanced to the finals of the Hacktimus Hackathon, competing against top teams with an innovative solution built under time constraints.',
      tags: ['Hackathon', 'Finalist'],
    },
  ]);

  protected readonly dsaStats = signal({
    streak: '520+',
    problemsSolved: '720+',
    contestRating: '1510',
    platforms: 'LeetCode, TCET & 10x Hackathons',
  });
}
