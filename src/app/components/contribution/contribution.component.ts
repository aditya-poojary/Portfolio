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

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface GitHubContributions {
  total: { [year: string]: number };
  contributions: ContributionDay[];
}

@Component({
  selector: 'app-contribution',
  standalone: true,
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
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="w-4.5 h-4.5"
                style="color: var(--color-metallic-silver)"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </span>
            Contribution Graph
          </h2>
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
                          <title>{{ day.count }} contributions on {{ day.date }}</title>
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
                  {{ totalContributions() }} contributions in {{ viewModeLabel() }}
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
                [class.active]="year === selectedYear() && !isLastYearMode()"
                class="year-button"
                [title]="'View Graph for the year ' + year"
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
export class ContributionComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly username = 'aditya-poojary';

  protected readonly loading = signal(true);
  protected readonly error = signal(false);
  protected readonly contributions = signal<ContributionDay[]>([]);
  protected readonly totalsByYear = signal<{ [year: string]: number }>({});
  protected readonly selectedYear = signal(new Date().getFullYear());
  protected readonly isLastYearMode = signal(true); // Start with last year mode

  protected readonly availableYears = computed(() => {
    const years = Object.keys(this.totalsByYear())
      .map((y) => parseInt(y))
      .sort((a, b) => b - a);
    return years.length > 0 ? years : [new Date().getFullYear()];
  });

  protected readonly viewModeLabel = computed(() => {
    if (this.isLastYearMode()) {
      return 'the last year';
    }
    return this.selectedYear().toString();
  });

  protected readonly filteredContributions = computed(() => {
    const allContributions = this.contributions();

    if (this.isLastYearMode()) {
      // Show last ~1 year from today, aligned to week boundaries like GitHub
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today

      // Calculate 1 year ago
      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(today.getFullYear() - 1);

      // Align start date to the previous Sunday (GitHub's week start)
      const dayOfWeek = oneYearAgo.getDay(); // 0 = Sunday
      oneYearAgo.setDate(oneYearAgo.getDate() - dayOfWeek);
      oneYearAgo.setHours(0, 0, 0, 0); // Start of that Sunday

      return allContributions
        .filter((day) => {
          const dayDate = new Date(day.date);
          return dayDate >= oneYearAgo && dayDate <= today;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else {
      // Show specific year
      const year = this.selectedYear();
      return allContributions
        .filter((day) => {
          const dayYear = new Date(day.date).getFullYear();
          return dayYear === year;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
  });

  protected readonly totalContributions = computed(() => {
    if (this.isLastYearMode()) {
      // Sum contributions from filtered data
      return this.filteredContributions().reduce((sum, day) => sum + day.count, 0);
    }
    const year = this.selectedYear().toString();
    return this.totalsByYear()[year] || 0;
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
    this.fetchContributions();
  }

  private fetchContributions(): void {
    this.loading.set(true);
    this.error.set(false);

    this.http
      .get<GitHubContributions>(`https://github-contributions-api.jogruber.de/v4/${this.username}`)
      .subscribe({
        next: (data) => {
          this.contributions.set(data.contributions);
          this.totalsByYear.set(data.total);
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        },
      });
  }

  protected selectYear(year: number): void {
    this.isLastYearMode.set(false);
    this.selectedYear.set(year);
  }

  protected getDayY(date: string): number {
    const dayOfWeek = new Date(date).getDay();
    return dayOfWeek * 17;
  }

  protected getLevelColor(level: number): string {
    // Purple/blue color palette for GitHub (matching provided design)
    const colors = [
      '#1a1625', // Level 0 - Dark purple background
      '#222351', // Level 1 - Dark blue
      '#2b4580', // Level 2 - Medium blue
      '#3d3fe5', // Level 3 - Bright blue
      '#4673ff', // Level 4 - Light blue
    ];
    return colors[level] || colors[0];
  }
}
