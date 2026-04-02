import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
  ViewChild,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import gsap from 'gsap';

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

interface GitHubContributions {
  total: { [year: string]: number };
  contributions: ContributionDay[];
}

interface LeetCodeData {
  username: string;
  ranking: number;
  streak: number;
  totalActiveDays: number;
  submissions: { difficulty: string; count: number }[];
  calendar: { [timestamp: string]: number };
  lastUpdated: string;
}

type Platform = 'github' | 'leetcode';

@Component({
  selector: 'app-contributions-unified',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="problem-solving" class="scroll-mt-28 py-24 px-6 max-md:px-4 max-md:py-16">
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

        <!-- Platform Toggle Buttons -->
        <div class="flex gap-3 mb-8">
          <button
            (click)="selectPlatform('github')"
            [class.active]="activePlatform() === 'github'"
            class="platform-button flex items-center gap-2 px-5 py-2.5 rounded-lg"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
              />
            </svg>
            GitHub
          </button>
          <button
            (click)="selectPlatform('leetcode')"
            [class.active]="activePlatform() === 'leetcode'"
            class="platform-button flex items-center gap-2 px-5 py-2.5 rounded-lg"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
              <path
                d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.662-1.823.662s-1.357-.195-1.824-.662l-4.332-4.363c-.467-.467-.702-1.15-.702-1.863s.235-1.357.702-1.824l4.319-4.38c.467-.467 1.125-.645 1.837-.645s1.357.195 1.823.662l2.697 2.606c.514.515 1.365.497 1.9-.038.535-.536.553-1.387.038-1.901l-2.609-2.636a5.055 5.055 0 0 0-2.445-1.337l2.467-2.503c.516-.514.498-1.366-.037-1.901-.535-.535-1.387-.552-1.902-.038l-10.1 10.101c-.981.982-1.494 2.337-1.494 3.835 0 1.498.513 2.895 1.494 3.875l4.347 4.361c.981.979 2.337 1.452 3.834 1.452s2.853-.512 3.835-1.494l2.609-2.637c.514-.514.496-1.365-.039-1.9s-1.386-.553-1.899-.039zM20.811 13.01H10.666c-.702 0-1.27.604-1.27 1.346s.568 1.346 1.27 1.346h10.145c.701 0 1.27-.604 1.27-1.346s-.569-1.346-1.27-1.346z"
              />
            </svg>
            LeetCode
          </button>
        </div>

        <!-- GitHub Contribution Graph -->
        @if (activePlatform() === 'github') {
          <div class="flex xl:flex-row flex-col gap-4">
            <div class="calendar-container p-6 md:p-8 rounded-lg max-w-fit overflow-x-auto">
              @if (githubLoading()) {
                <div class="flex items-center justify-center h-[137px] w-[897px]">
                  <div class="loading-spinner"></div>
                </div>
              } @else if (githubError()) {
                <div class="flex items-center justify-center h-[137px] text-metallic-silver/60">
                  Failed to load contributions
                </div>
              } @else {
                <div class="calendar-scroll">
                  <svg
                    [attr.width]="githubCalendarWidth()"
                    height="137"
                    [attr.viewBox]="'0 0 ' + githubCalendarWidth() + ' 137'"
                    class="contribution-calendar"
                  >
                    <g class="month-labels">
                      @for (month of githubMonthLabels(); track month.name + month.x) {
                        <text [attr.x]="month.x" y="10" class="month-label">{{ month.name }}</text>
                      }
                    </g>
                    @for (week of githubWeeks(); track $index) {
                      <g [attr.transform]="'translate(' + $index * 17 + ', 22)'">
                        @for (day of week; track day.date) {
                          <rect
                            [attr.x]="0"
                            [attr.y]="getDayY(day.date)"
                            width="13"
                            height="13"
                            rx="2"
                            ry="2"
                            [attr.fill]="getGitHubLevelColor(day.level)"
                            class="contribution-cell"
                          >
                            <title>{{ day.count }} contributions on {{ day.date }}</title>
                          </rect>
                        }
                      </g>
                    }
                  </svg>
                </div>
                <footer
                  class="calendar-footer mt-4 flex flex-wrap justify-between items-center gap-4"
                >
                  <div class="contribution-count text-metallic-silver/80 text-sm">
                    {{ githubTotalContributions() }} contributions in {{ githubViewModeLabel() }}
                  </div>
                  <div class="legend-colors flex items-center gap-1">
                    <span class="text-metallic-silver/60 text-sm mr-2">Less</span>
                    @for (level of [0, 1, 2, 3, 4]; track level) {
                      <svg width="13" height="13">
                        <rect
                          width="13"
                          height="13"
                          [attr.fill]="getGitHubLevelColor(level)"
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
            <div class="flex justify-start xl:flex-col flex-row flex-wrap gap-2">
              @for (year of githubAvailableYears(); track year) {
                <button
                  (click)="selectGitHubYear(year)"
                  [class.active]="year === githubSelectedYear() && !isGitHubLastYearMode()"
                  class="year-button"
                >
                  {{ year }}
                </button>
              }
            </div>
          </div>
        }

        <!-- LeetCode Contribution Graph -->
        @if (activePlatform() === 'leetcode') {
          <!-- LeetCode Stats Cards -->
          <div #statsCards class="stats-cards-container flex flex-wrap gap-6 mb-8">
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
                <span class="stat-number font-heading text-3xl font-bold">{{
                  leetcodeStreak()
                }}</span>
                <span class="block text-sm stat-label mt-0.5">day streak 🔥</span>
              </div>
            </div>
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
                <span class="stat-number font-heading text-3xl font-bold"
                  >#{{ leetcodeRanking() }}</span
                >
                <span class="block text-sm stat-label mt-0.5">global rank</span>
              </div>
            </div>
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
                  leetcodeTotalQuestions()
                }}</span>
                <span class="block text-sm stat-label mt-0.5">questions solved</span>
              </div>
            </div>
          </div>

          <div class="flex xl:flex-row flex-col gap-4">
            <div class="calendar-container p-6 md:p-8 rounded-lg max-w-fit overflow-x-auto">
              @if (leetcodeLoading()) {
                <div class="flex items-center justify-center h-[137px] w-[897px]">
                  <div class="loading-spinner"></div>
                </div>
              } @else if (leetcodeError()) {
                <div class="flex items-center justify-center h-[137px] text-metallic-silver/60">
                  Failed to load contributions
                </div>
              } @else {
                <div class="calendar-scroll">
                  <svg
                    [attr.width]="leetcodeCalendarWidth()"
                    height="137"
                    [attr.viewBox]="'0 0 ' + leetcodeCalendarWidth() + ' 137'"
                    class="contribution-calendar"
                  >
                    <g class="month-labels">
                      @for (month of leetcodeMonthLabels(); track month.name + month.x) {
                        <text [attr.x]="month.x" y="10" class="month-label">{{ month.name }}</text>
                      }
                    </g>
                    @for (week of leetcodeWeeks(); track $index) {
                      <g [attr.transform]="'translate(' + $index * 17 + ', 22)'">
                        @for (day of week; track day.date) {
                          <rect
                            [attr.x]="0"
                            [attr.y]="getDayY(day.date)"
                            width="13"
                            height="13"
                            rx="2"
                            ry="2"
                            [attr.fill]="getLeetCodeLevelColor(day.level)"
                            class="contribution-cell"
                          >
                            <title>{{ day.count }} submissions on {{ day.date }}</title>
                          </rect>
                        }
                      </g>
                    }
                  </svg>
                </div>
                <footer
                  class="calendar-footer mt-4 flex flex-wrap justify-between items-center gap-4"
                >
                  <div class="contribution-count text-metallic-silver/80 text-sm">
                    {{ leetcodeTotalContributions() }} submissions in {{ leetcodeViewModeLabel() }}
                  </div>
                  <div class="legend-colors flex items-center gap-1">
                    <span class="text-metallic-silver/60 text-sm mr-2">Less</span>
                    @for (level of [0, 1, 2, 3, 4]; track level) {
                      <svg width="13" height="13">
                        <rect
                          width="13"
                          height="13"
                          [attr.fill]="getLeetCodeLevelColor(level)"
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
            <div class="flex justify-start xl:flex-col flex-row flex-wrap gap-2">
              @for (year of leetcodeAvailableYears(); track year) {
                <button
                  (click)="selectLeetCodeYear(year)"
                  [class.active]="year === leetcodeSelectedYear()"
                  class="year-button"
                >
                  {{ year }}
                </button>
              }
            </div>
          </div>
        }
      </div>
    </section>
  `,
  styles: `
    .text-metallic-silver {
      color: var(--color-metallic-silver, #c0c0c0);
    }

    .platform-button {
      background: linear-gradient(135deg, rgba(42, 42, 42, 0.8) 0%, rgba(26, 26, 26, 0.6) 100%);
      color: rgba(192, 192, 192, 0.8);
      border: 1px solid rgba(192, 192, 192, 0.15);
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .platform-button:hover {
      border-color: rgba(192, 192, 192, 0.3);
      background: linear-gradient(135deg, rgba(50, 50, 50, 0.9) 0%, rgba(34, 34, 34, 0.7) 100%);
      color: rgba(192, 192, 192, 1);
    }

    .platform-button.active {
      background: linear-gradient(
        135deg,
        rgba(192, 192, 192, 0.9) 0%,
        rgba(160, 160, 160, 0.8) 100%
      );
      color: rgba(26, 26, 26, 0.95);
      border-color: transparent;
    }

    .platform-button.active svg {
      color: rgba(26, 26, 26, 0.95);
    }

    .stats-cards-container {
      opacity: 1;
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
export class ContributionsUnifiedComponent implements OnInit, AfterViewInit {
  @ViewChild('statsCards') statsCardsRef!: ElementRef<HTMLDivElement>;

  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly githubUsername = 'aditya-poojary';

  // Platform selection
  protected readonly activePlatform = signal<Platform>('github');

  // GitHub state
  protected readonly githubLoading = signal(true);
  protected readonly githubError = signal(false);
  protected readonly githubContributions = signal<ContributionDay[]>([]);
  protected readonly githubTotalsByYear = signal<{ [year: string]: number }>({});
  protected readonly githubSelectedYear = signal(new Date().getFullYear());
  protected readonly isGitHubLastYearMode = signal(true);

  // LeetCode state
  protected readonly leetcodeLoading = signal(true);
  protected readonly leetcodeError = signal(false);
  protected readonly leetcodeData = signal<LeetCodeData | null>(null);
  protected readonly leetcodeSelectedYear = signal(new Date().getFullYear());

  // LeetCode base values for streak calculation
  private readonly BASE_STREAK = 575;
  private readonly BASE_DATE = new Date('2026-03-30');

  private animationTriggered = false;

  constructor() {
    // Effect to trigger animation when switching to LeetCode
    effect(() => {
      const platform = this.activePlatform();
      if (platform === 'leetcode' && !this.animationTriggered) {
        setTimeout(() => this.animateStatsCards(), 50);
        this.animationTriggered = true;
      } else if (platform === 'github') {
        this.animationTriggered = false;
      }
    });
  }

  // GitHub computed values
  protected readonly githubAvailableYears = computed(() => {
    const years = Object.keys(this.githubTotalsByYear())
      .map((y) => parseInt(y))
      .sort((a, b) => b - a);
    return years.length > 0 ? years : [new Date().getFullYear()];
  });

  protected readonly githubViewModeLabel = computed(() => {
    if (this.isGitHubLastYearMode()) {
      return 'the last year';
    }
    return this.githubSelectedYear().toString();
  });

  protected readonly githubFilteredContributions = computed(() => {
    const allContributions = this.githubContributions();

    if (this.isGitHubLastYearMode()) {
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      const dayOfWeek = oneYearAgo.getDay();
      oneYearAgo.setDate(oneYearAgo.getDate() - dayOfWeek);
      oneYearAgo.setHours(0, 0, 0, 0);

      return allContributions
        .filter((day) => {
          const dayDate = new Date(day.date);
          return dayDate >= oneYearAgo && dayDate <= today;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else {
      const year = this.githubSelectedYear();
      return allContributions
        .filter((day) => new Date(day.date).getFullYear() === year)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
  });

  protected readonly githubTotalContributions = computed(() => {
    if (this.isGitHubLastYearMode()) {
      return this.githubFilteredContributions().reduce((sum, day) => sum + day.count, 0);
    }
    const year = this.githubSelectedYear().toString();
    return this.githubTotalsByYear()[year] || 0;
  });

  protected readonly githubWeeks = computed(() => {
    return this.generateWeeks(this.githubFilteredContributions());
  });

  protected readonly githubCalendarWidth = computed(() => {
    return this.githubWeeks().length * 17;
  });

  protected readonly githubMonthLabels = computed(() => {
    return this.generateMonthLabels(this.githubWeeks());
  });

  // LeetCode computed values
  protected readonly leetcodeStreak = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const baseDate = new Date(this.BASE_DATE);
    baseDate.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - baseDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return this.BASE_STREAK + diffDays;
  });

  protected readonly leetcodeRanking = computed(() => {
    const data = this.leetcodeData();
    return data ? data.ranking.toLocaleString() : '—';
  });

  protected readonly leetcodeTotalQuestions = computed(() => {
    const data = this.leetcodeData();
    if (!data) return '—';
    const allSubmissions = data.submissions.find((s) => s.difficulty === 'All');
    const count = allSubmissions ? allSubmissions.count : 0;
    return (count + 101).toLocaleString();
  });

  protected readonly leetcodeContributions = computed(() => {
    const data = this.leetcodeData();
    if (!data) return [];

    const contributions: ContributionDay[] = [];
    const calendar = data.calendar;

    for (const [timestamp, count] of Object.entries(calendar)) {
      const date = new Date(parseInt(timestamp) * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const level = this.getLeetCodeLevel(count);
      contributions.push({ date: dateStr, count, level });
    }

    return contributions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  protected readonly leetcodeAvailableYears = computed(() => {
    return [2026, 2025, 2024];
  });

  protected readonly leetcodeViewModeLabel = computed(() => {
    return this.leetcodeSelectedYear().toString();
  });

  protected readonly leetcodeFilteredContributions = computed(() => {
    const allContributions = this.leetcodeContributions();
    const year = this.leetcodeSelectedYear();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();

    const contributionMap = new Map<string, ContributionDay>();
    allContributions.forEach((day) => {
      contributionMap.set(day.date, day);
    });

    let startDate: Date;
    let endDate: Date;

    if (year === currentYear) {
      endDate = new Date(today);
      startDate = new Date(today);
      startDate.setFullYear(startDate.getFullYear() - 1);
      startDate.setDate(startDate.getDate() + 1);
    } else {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31);
    }

    const result: ContributionDay[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      const existing = contributionMap.get(dateStr);

      if (existing) {
        result.push(existing);
      } else {
        result.push({ date: dateStr, count: 0, level: 0 });
      }

      current.setDate(current.getDate() + 1);
    }

    return result;
  });

  protected readonly leetcodeTotalContributions = computed(() => {
    return this.leetcodeFilteredContributions().reduce((sum, day) => sum + day.count, 0);
  });

  protected readonly leetcodeWeeks = computed(() => {
    return this.generateWeeks(this.leetcodeFilteredContributions());
  });

  protected readonly leetcodeCalendarWidth = computed(() => {
    return this.leetcodeWeeks().length * 17;
  });

  protected readonly leetcodeMonthLabels = computed(() => {
    return this.generateMonthLabels(this.leetcodeWeeks());
  });

  ngOnInit(): void {
    this.fetchGitHubContributions();
    this.fetchLeetCodeData();
  }

  ngAfterViewInit(): void {
    // Initial animation if starting with LeetCode (unlikely but handling it)
    if (this.activePlatform() === 'leetcode') {
      setTimeout(() => this.animateStatsCards(), 100);
    }
  }

  private animateStatsCards(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const cards = this.statsCardsRef?.nativeElement?.querySelectorAll('.stats-card');
    if (!cards || cards.length === 0) return;

    gsap.from(cards, {
      y: -30,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out',
    });
  }

  protected selectPlatform(platform: Platform): void {
    if (this.activePlatform() !== platform) {
      this.animationTriggered = false;
      this.activePlatform.set(platform);
    }
  }

  protected selectGitHubYear(year: number): void {
    this.isGitHubLastYearMode.set(false);
    this.githubSelectedYear.set(year);
  }

  protected selectLeetCodeYear(year: number): void {
    this.leetcodeSelectedYear.set(year);
  }

  private fetchGitHubContributions(): void {
    this.githubLoading.set(true);
    this.githubError.set(false);

    this.http
      .get<GitHubContributions>(
        `https://github-contributions-api.jogruber.de/v4/${this.githubUsername}`,
      )
      .subscribe({
        next: (data) => {
          this.githubContributions.set(data.contributions);
          this.githubTotalsByYear.set(data.total);
          this.githubLoading.set(false);
        },
        error: () => {
          this.githubError.set(true);
          this.githubLoading.set(false);
        },
      });
  }

  private fetchLeetCodeData(): void {
    this.leetcodeLoading.set(true);
    this.leetcodeError.set(false);

    this.http.get<LeetCodeData>('/data/leetcode.json').subscribe({
      next: (data) => {
        this.leetcodeData.set(data);
        this.leetcodeLoading.set(false);
      },
      error: () => {
        this.leetcodeError.set(true);
        this.leetcodeLoading.set(false);
      },
    });
  }

  private generateWeeks(days: ContributionDay[]): ContributionDay[][] {
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
  }

  private generateMonthLabels(weeks: ContributionDay[][]): { name: string; x: number }[] {
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
  }

  protected getDayY(date: string): number {
    const dayOfWeek = new Date(date).getDay();
    return dayOfWeek * 17;
  }

  private getLeetCodeLevel(count: number): number {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 10) return 3;
    return 4;
  }

  protected getGitHubLevelColor(level: number): string {
    const colors = ['#1a1625', '#222351', '#2b4580', '#3d3fe5', '#4673ff'];
    return colors[level] || colors[0];
  }

  protected getLeetCodeLevelColor(level: number): string {
    const colors = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];
    return colors[level] || colors[0];
  }
}
