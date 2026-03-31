import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface LeetCodeData {
  username: string;
  ranking: number;
  streak: number;
  totalActiveDays: number;
  submissions: { difficulty: string; count: number }[];
  calendar: { [timestamp: string]: number };
  lastUpdated: string;
}

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

@Component({
  selector: 'app-leetcode-contributions',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-24 px-6 max-md:px-4 max-md:py-16">
      <div class="container-custom">
        <div class="mb-8">
          <h2
            class="font-heading text-h2 font-semibold text-text-primary mb-12 flex items-center gap-3"
          >
            <span
              class="inline-flex items-center justify-center w-9 h-9 rounded-lg border"
              style="
                border-color: rgba(192, 192, 192, 0.3);
                background: linear-gradient(135deg, rgba(42, 42, 42, 0.8), rgba(26, 26, 26, 0.6));
              "
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                class="w-4.5 h-4.5"
                style="color: var(--color-metallic-silver)"
              >
                <path
                  d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.662-1.823.662s-1.357-.195-1.824-.662l-4.332-4.363c-.467-.467-.702-1.15-.702-1.863s.235-1.357.702-1.824l4.319-4.38c.467-.467 1.125-.645 1.837-.645s1.357.195 1.823.662l2.697 2.606c.514.515 1.365.497 1.9-.038.535-.536.553-1.387.038-1.901l-2.609-2.636a5.055 5.055 0 0 0-2.445-1.337l2.467-2.503c.516-.514.498-1.366-.037-1.901-.535-.535-1.387-.552-1.902-.038l-10.1 10.101c-.981.982-1.494 2.337-1.494 3.835 0 1.498.513 2.895 1.494 3.875l4.347 4.361c.981.979 2.337 1.452 3.834 1.452s2.853-.512 3.835-1.494l2.609-2.637c.514-.514.496-1.365-.039-1.9s-1.386-.553-1.899-.039zM20.811 13.01H10.666c-.702 0-1.27.604-1.27 1.346s.568 1.346 1.27 1.346h10.145c.701 0 1.27-.604 1.27-1.346s-.569-1.346-1.27-1.346z"
                  fill="currentColor"
                />
              </svg>
            </span>
            DSA Journey
          </h2>
        </div>

        <!-- Stats Row -->
        <div class="flex flex-wrap gap-6 mb-8">
          <!-- Streak Counter -->
          <div class="stats-card flex items-center gap-4 px-5 py-4 rounded-xl">
            <div class="flex items-center justify-center w-12 h-12 rounded-lg icon-bg">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="w-6 h-6"
                style="color: var(--color-metallic-silver)"
              >
                <path
                  d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div>
              <span class="stat-number font-heading text-3xl font-bold">{{ currentStreak() }}</span>
              <span class="block text-sm stat-label mt-0.5">day streak 🔥</span>
            </div>
          </div>

          <!-- Global Rank -->
          <div class="stats-card flex items-center gap-4 px-5 py-4 rounded-xl">
            <div class="flex items-center justify-center w-12 h-12 rounded-lg icon-bg">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="w-6 h-6"
                style="color: var(--color-metallic-silver)"
              >
                <circle cx="12" cy="8" r="6" />
                <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
              </svg>
            </div>
            <div>
              <span class="stat-number font-heading text-3xl font-bold">#{{ ranking() }}</span>
              <span class="block text-sm stat-label mt-0.5">global rank</span>
            </div>
          </div>

          <!-- Total Questions Solved -->
          <div class="stats-card flex items-center gap-4 px-5 py-4 rounded-xl">
            <div class="flex items-center justify-center w-12 h-12 rounded-lg icon-bg">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="w-6 h-6"
                style="color: var(--color-metallic-silver)"
              >
                <path d="M9 11l3 3L22 4" stroke-linecap="round" stroke-linejoin="round" />
                <path
                  d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div>
              <span class="stat-number font-heading text-3xl font-bold">{{
                totalQuestionsSolved()
              }}</span>
              <span class="block text-sm stat-label mt-0.5">questions solved</span>
            </div>
          </div>
        </div>

        <div class="flex xl:flex-row flex-col gap-4">
          <!-- Contribution Calendar -->
          <div class="calendar-container p-6 md:p-8 rounded-lg max-w-fit overflow-x-auto">
            @if (loading()) {
              <div class="flex items-center justify-center h-[137px] w-[897px]">
                <div class="loading-spinner"></div>
              </div>
            } @else if (error()) {
              <div class="flex items-center justify-center h-[137px] text-metallic-silver/60">
                Failed to load contributions
              </div>
            } @else {
              <div class="calendar-scroll">
                <svg
                  [attr.width]="calendarWidth()"
                  height="137"
                  [attr.viewBox]="'0 0 ' + calendarWidth() + ' 137'"
                  class="contribution-calendar"
                >
                  <!-- Month Labels -->
                  <g class="month-labels">
                    @for (month of monthLabels(); track month.name + month.x) {
                      <text [attr.x]="month.x" y="10" class="month-label">{{ month.name }}</text>
                    }
                  </g>

                  <!-- Contribution Grid -->
                  @for (week of weeks(); track $index) {
                    <g [attr.transform]="'translate(' + $index * 17 + ', 22)'">
                      @for (day of week; track day.date) {
                        <rect
                          [attr.x]="0"
                          [attr.y]="getDayY(day.date)"
                          width="13"
                          height="13"
                          rx="2"
                          ry="2"
                          [attr.fill]="getLevelColor(day.level)"
                          [attr.data-date]="day.date"
                          [attr.data-count]="day.count"
                          class="contribution-cell"
                        >
                          <title>{{ day.count }} submissions on {{ day.date }}</title>
                        </rect>
                      }
                    </g>
                  }
                </svg>
              </div>

              <!-- Footer -->
              <footer
                class="calendar-footer mt-4 flex flex-wrap justify-between items-center gap-4"
              >
                <div class="contribution-count text-metallic-silver/80 text-sm">
                  {{ totalContributions() }} submissions in {{ viewModeLabel() }}
                </div>
                <div class="legend-colors flex items-center gap-1">
                  <span class="text-metallic-silver/60 text-sm mr-2">Less</span>
                  @for (level of [0, 1, 2, 3, 4]; track level) {
                    <svg width="13" height="13">
                      <rect
                        width="13"
                        height="13"
                        [attr.fill]="getLevelColor(level)"
                        rx="2"
                        ry="2"
                      ></rect>
                    </svg>
                  }
                  <span class="text-metallic-silver/60 text-sm ml-2">More</span>
                </div>
              </footer>
            }
          </div>

          <!-- Year Selector -->
          <div class="flex justify-start xl:flex-col flex-row flex-wrap gap-2">
            @for (year of availableYears(); track year) {
              <button
                (click)="selectYear(year)"
                [class.active]="year === selectedYear()"
                class="year-button"
                [title]="'View submissions for ' + year"
              >
                {{ year }}
              </button>
            }
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    .text-metallic-silver {
      color: var(--color-metallic-silver, #c0c0c0);
    }

    .stats-card {
      background: linear-gradient(135deg, rgba(42, 42, 42, 0.8), rgba(26, 26, 26, 0.6));
      border: 1px solid rgba(192, 192, 192, 0.15);
    }

    .icon-bg {
      background: rgba(192, 192, 192, 0.1);
    }

    .stat-number {
      background: linear-gradient(135deg, rgba(192, 192, 192, 0.95), rgba(160, 160, 160, 0.85));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .stat-label {
      color: rgba(192, 192, 192, 0.7);
    }

    .calendar-container {
      background: linear-gradient(135deg, rgba(42, 42, 42, 0.8), rgba(26, 26, 26, 0.6));
      border: 1px solid rgba(192, 192, 192, 0.15);
    }

    .calendar-scroll {
      overflow-x: auto;
      scrollbar-width: thin;
      scrollbar-color: rgba(192, 192, 192, 0.3) transparent;
    }

    .calendar-scroll::-webkit-scrollbar {
      height: 6px;
    }

    .calendar-scroll::-webkit-scrollbar-track {
      background: transparent;
    }

    .calendar-scroll::-webkit-scrollbar-thumb {
      background: rgba(192, 192, 192, 0.3);
      border-radius: 3px;
    }

    .month-label {
      fill: rgba(192, 192, 192, 0.7);
      font-size: 12px;
      font-family: inherit;
    }

    .contribution-cell {
      transition: opacity 0.15s ease;
    }

    .contribution-cell:hover {
      opacity: 0.8;
      stroke: rgba(192, 192, 192, 0.5);
      stroke-width: 1;
    }

    .year-button {
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      background: linear-gradient(135deg, rgba(42, 42, 42, 0.8) 0%, rgba(26, 26, 26, 0.6) 100%);
      color: rgba(192, 192, 192, 0.9);
      border: 1px solid rgba(192, 192, 192, 0.15);
      transition: all 0.2s ease;
    }

    .year-button:hover {
      border-color: rgba(192, 192, 192, 0.3);
      background: linear-gradient(135deg, rgba(50, 50, 50, 0.9) 0%, rgba(34, 34, 34, 0.7) 100%);
    }

    .year-button.active {
      background: linear-gradient(
        135deg,
        rgba(192, 192, 192, 0.9) 0%,
        rgba(160, 160, 160, 0.8) 100%
      );
      color: rgba(26, 26, 26, 0.95);
      border-color: transparent;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(192, 192, 192, 0.2);
      border-top-color: rgba(192, 192, 192, 0.8);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .calendar-footer {
      border-top: 1px solid rgba(192, 192, 192, 0.1);
      padding-top: 1rem;
    }
  `,
})
export class LeetcodeContributionsComponent implements OnInit {
  private readonly http = inject(HttpClient);

  // Base streak count (starting from a reference date)
  private readonly BASE_STREAK = 575;
  private readonly BASE_DATE = new Date('2026-03-30');

  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly leetcodeData = signal<LeetCodeData | null>(null);
  protected readonly selectedYear = signal(new Date().getFullYear());

  protected readonly ranking = computed(() => {
    const data = this.leetcodeData();
    return data ? data.ranking.toLocaleString() : '—';
  });

  protected readonly currentStreak = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const baseDate = new Date(this.BASE_DATE);
    baseDate.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - baseDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return this.BASE_STREAK + diffDays;
  });

  protected readonly totalQuestionsSolved = computed(() => {
    const data = this.leetcodeData();
    if (!data) return '—';
    const allSubmissions = data.submissions.find((s) => s.difficulty === 'All');
    const count = allSubmissions ? allSubmissions.count : 0;
    return (count + 101).toLocaleString();
  });

  protected readonly contributions = computed(() => {
    const data = this.leetcodeData();
    if (!data) return [];

    const contributions: ContributionDay[] = [];
    const calendar = data.calendar;

    for (const [timestamp, count] of Object.entries(calendar)) {
      const date = new Date(parseInt(timestamp) * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const level = this.getLevel(count);
      contributions.push({ date: dateStr, count, level });
    }

    return contributions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  // Available years: 2024, 2025, 2026 (contributions started July 2024)
  protected readonly availableYears = computed(() => {
    return [2026, 2025, 2024];
  });

  protected readonly viewModeLabel = computed(() => {
    return this.selectedYear().toString();
  });

  protected readonly filteredContributions = computed(() => {
    const allContributions = this.contributions();
    const year = this.selectedYear();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();

    // Create a map of existing contributions for quick lookup
    const contributionMap = new Map<string, ContributionDay>();
    allContributions.forEach((day) => {
      contributionMap.set(day.date, day);
    });

    // Calculate date range: rolling 1 year window like GitHub
    // For current year: from same date last year to today
    // For past years: full calendar year (Jan 1 to Dec 31)
    let startDate: Date;
    let endDate: Date;

    if (year === currentYear) {
      // Rolling year: from today minus 1 year to today
      endDate = new Date(today);
      startDate = new Date(today);
      startDate.setFullYear(startDate.getFullYear() - 1);
      startDate.setDate(startDate.getDate() + 1); // Start from next day of last year
    } else {
      // Past year: show Jan 1 to Dec 31 of that year
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31);
    }

    // Generate all dates in the range with empty boxes where no data exists
    const result: ContributionDay[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      const existing = contributionMap.get(dateStr);

      if (existing) {
        result.push(existing);
      } else {
        // Empty box - no contributions for this date
        result.push({ date: dateStr, count: 0, level: 0 });
      }

      current.setDate(current.getDate() + 1);
    }

    return result;
  });

  protected readonly totalContributions = computed(() => {
    return this.filteredContributions().reduce((sum, day) => sum + day.count, 0);
  });

  protected readonly weeks = computed(() => {
    const days = this.filteredContributions();
    if (days.length === 0) return [];

    const weeks: ContributionDay[][] = [];
    let currentWeek: ContributionDay[] = [];

    days.forEach((day, index) => {
      const dayOfWeek = new Date(day.date).getDay();

      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      currentWeek.push(day);

      if (index === days.length - 1) {
        weeks.push(currentWeek);
      }
    });

    return weeks;
  });

  protected readonly calendarWidth = computed(() => {
    return this.weeks().length * 17;
  });

  protected readonly monthLabels = computed(() => {
    const weeks = this.weeks();
    if (weeks.length === 0) return [];

    const months: { name: string; x: number }[] = [];
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    let lastMonth = -1;

    weeks.forEach((week, wIndex) => {
      const firstDay = week[0];
      if (firstDay) {
        const month = new Date(firstDay.date).getMonth();
        if (month !== lastMonth) {
          months.push({
            name: monthNames[month],
            x: wIndex * 17,
          });
          lastMonth = month;
        }
      }
    });

    return months;
  });

  ngOnInit(): void {
    this.fetchLeetCodeData();
  }

  private fetchLeetCodeData(): void {
    this.loading.set(true);
    this.error.set(false);

    this.http.get<LeetCodeData>('/data/leetcode.json').subscribe({
      next: (data) => {
        this.leetcodeData.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  protected selectYear(year: number): void {
    this.selectedYear.set(year);
  }

  protected getDayY(date: string): number {
    const dayOfWeek = new Date(date).getDay();
    return dayOfWeek * 17;
  }

  private getLevel(count: number): number {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 10) return 3;
    return 4;
  }

  protected getLevelColor(level: number): string {
    // Green color palette for LeetCode (matching provided design)
    const colors = [
      '#161b22', // Level 0 - Dark background (--fill-tertiary)
      '#0e4429', // Level 1 - Dark green (--green-20)
      '#006d32', // Level 2 - Medium green (--green-60)
      '#26a641', // Level 3 - Bright green (--green-80)
      '#39d353', // Level 4 - Light green
    ];
    return colors[level] || colors[0];
  }
}
