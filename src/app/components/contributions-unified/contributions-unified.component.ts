import {
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

interface VerticalWeekRow {
  monthLabel: string;
  week: (ContributionDay | null)[];
}

type Platform = 'github' | 'leetcode';

@Component({
  selector: 'app-contributions-unified',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="problem-solving" class="scroll-mt-28 py-24 px-6 max-md:px-4 max-md:py-16">
      <div class="container-custom">
        <!-- Header -->
        <div class="mb-6">
          <h2
            class="font-heading text-h2 font-semibold text-text-primary mb-4 flex items-center gap-3"
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

        <!-- Platform Toggle Buttons - Under subtitle -->
        <div class="flex flex-wrap gap-3 mb-6">
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
          <div class="calendar-wrapper">
            <div class="calendar-with-years">
              <div class="calendar-container p-4 md:p-6 rounded-xl">
                @if (githubLoading()) {
                  <div class="flex items-center justify-center h-[200px]">
                    <div class="loading-spinner"></div>
                  </div>
                } @else if (githubError()) {
                  <div class="flex items-center justify-center h-[200px] text-metallic-silver/60">
                    Failed to load contributions
                  </div>
                } @else {
                  <div class="graph-mobile">
                    <div class="vertical-graph">
                      @for (row of githubVerticalRows(); track row.monthLabel + '-' + $index) {
                        <div class="month-row">
                          <span class="month-label-vertical">{{ row.monthLabel }}</span>
                          <div class="month-weeks">
                            <div class="week-row">
                              @for (day of row.week; track $index) {
                                @if (day) {
                                  <div
                                    class="contribution-cell"
                                    [style.background-color]="getGitHubLevelColor(day.level)"
                                    [title]="day.count + ' contributions on ' + day.date"
                                  ></div>
                                } @else {
                                  <div class="contribution-cell contribution-cell-empty"></div>
                                }
                              }
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                  </div>

                  <div class="graph-desktop-layout">
                    <div class="graph-horizontal">
                      <div class="horizontal-grid">
                        <div class="weeks-area">
                          <div class="month-label-track">
                            @for (week of githubWeeks(); track $index) {
                              @if (getMonthLabelForWeek(githubWeeks(), $index)) {
                                <span
                                  class="month-label-horizontal"
                                  [style.left]="
                                    'calc(' +
                                    $index +
                                    ' * (var(--h-cell-size) + var(--h-week-gap)))'
                                  "
                                >
                                  {{ getMonthLabelForWeek(githubWeeks(), $index) }}
                                </span>
                              }
                            }
                          </div>
                          <div class="weeks-row">
                            @for (week of githubWeeks(); track $index) {
                              <div class="week-column">
                                @for (day of week; track day.date) {
                                  <div
                                    class="contribution-cell horizontal-cell"
                                    [style.background-color]="getGitHubLevelColor(day.level)"
                                    [title]="day.count + ' contributions on ' + day.date"
                                  ></div>
                                }
                              </div>
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Footer with legend -->
                  <footer
                    class="calendar-footer mt-4 flex flex-wrap justify-between items-center gap-4"
                  >
                    <div class="contribution-count text-metallic-silver/80 text-sm">
                      {{ githubTotalContributions() }} contributions in {{ githubViewModeLabel() }}
                    </div>
                    <div class="legend-colors flex items-center gap-1.5">
                      <span class="text-metallic-silver/60 text-xs mr-1">Less</span>
                      @for (level of [0, 1, 2, 3, 4]; track level) {
                        <div
                          class="legend-cell"
                          [style.background-color]="getGitHubLevelColor(level)"
                        ></div>
                      }
                      <span class="text-metallic-silver/60 text-xs ml-1">More</span>
                    </div>
                  </footer>
                }
              </div>

              <div class="year-buttons-side">
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

            <!-- Year buttons at the bottom -->
            <div class="year-buttons-bottom-mobile flex justify-center flex-wrap gap-2 mt-4">
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
          <div class="calendar-wrapper mb-8">
            <div class="calendar-with-years">
              <div class="calendar-container p-4 md:p-6 rounded-xl">
                @if (leetcodeLoading()) {
                  <div class="flex items-center justify-center h-[200px]">
                    <div class="loading-spinner"></div>
                  </div>
                } @else if (leetcodeError()) {
                  <div class="flex items-center justify-center h-[200px] text-metallic-silver/60">
                    Failed to load contributions
                  </div>
                } @else {
                  <div class="graph-mobile">
                    <div class="vertical-graph">
                      @for (row of leetcodeVerticalRows(); track row.monthLabel + '-' + $index) {
                        <div class="month-row">
                          <span class="month-label-vertical">{{ row.monthLabel }}</span>
                          <div class="month-weeks">
                            <div class="week-row">
                              @for (day of row.week; track $index) {
                                @if (day) {
                                  <div
                                    class="contribution-cell"
                                    [style.background-color]="getLeetCodeLevelColor(day.level)"
                                    [title]="day.count + ' submissions on ' + day.date"
                                  ></div>
                                } @else {
                                  <div class="contribution-cell contribution-cell-empty"></div>
                                }
                              }
                            </div>
                          </div>
                        </div>
                      }
                    </div>
                  </div>

                  <div class="graph-desktop-layout">
                    <div class="graph-horizontal">
                      <div class="horizontal-grid">
                        <div class="weeks-area">
                          <div class="month-label-track">
                            @for (week of leetcodeWeeks(); track $index) {
                              @if (getMonthLabelForWeek(leetcodeWeeks(), $index)) {
                                <span
                                  class="month-label-horizontal"
                                  [style.left]="
                                    'calc(' +
                                    $index +
                                    ' * (var(--h-cell-size) + var(--h-week-gap)))'
                                  "
                                >
                                  {{ getMonthLabelForWeek(leetcodeWeeks(), $index) }}
                                </span>
                              }
                            }
                          </div>
                          <div class="weeks-row">
                            @for (week of leetcodeWeeks(); track $index) {
                              <div class="week-column">
                                @for (day of week; track day.date) {
                                  <div
                                    class="contribution-cell horizontal-cell"
                                    [style.background-color]="getLeetCodeLevelColor(day.level)"
                                    [title]="day.count + ' submissions on ' + day.date"
                                  ></div>
                                }
                              </div>
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Footer with legend -->
                  <footer
                    class="calendar-footer mt-4 flex flex-wrap justify-between items-center gap-4"
                  >
                    <div class="contribution-count text-metallic-silver/80 text-sm">
                      {{ leetcodeTotalContributions() }} submissions in
                      {{ leetcodeViewModeLabel() }}
                    </div>
                    <div class="legend-colors flex items-center gap-1.5">
                      <span class="text-metallic-silver/60 text-xs mr-1">Less</span>
                      @for (level of [0, 1, 2, 3, 4]; track level) {
                        <div
                          class="legend-cell"
                          [style.background-color]="getLeetCodeLevelColor(level)"
                        ></div>
                      }
                      <span class="text-metallic-silver/60 text-xs ml-1">More</span>
                    </div>
                  </footer>
                }
              </div>

              <div class="year-buttons-side">
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

            <!-- Year buttons at the bottom -->
            <div class="year-buttons-bottom-mobile flex justify-center flex-wrap gap-2 mt-4">
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

          <!-- LeetCode Stats Cards -->
          <div #statsCards class="stats-cards-container flex flex-wrap gap-6">
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
        }
      </div>
    </section>
  `,
  styles: `
    .text-metallic-silver {
      color: var(--color-metallic-silver, #c0c0c0);
    }

    /* Platform buttons */
    .platform-button {
      background: linear-gradient(135deg, rgba(42, 42, 42, 0.8) 0%, rgba(26, 26, 26, 0.6) 100%);
      color: rgba(192, 192, 192, 0.8);
      border: 1px solid rgba(192, 192, 192, 0.15);
      font-weight: 500;
      transition: all 0.2s ease;
      flex-shrink: 0;
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

    /* Stats cards */
    .stats-cards-container {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      opacity: 1;
      will-change: transform, opacity;
    }

    .stats-card {
      background: linear-gradient(135deg, rgba(42, 42, 42, 0.8), rgba(26, 26, 26, 0.6));
      border: 1px solid rgba(192, 192, 192, 0.15);
      flex: 1 1 200px;
      min-width: 0;
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

    /* Calendar wrapper */
    .calendar-wrapper {
      width: 100%;
      overflow-x: clip;
    }

    .calendar-container {
      background: linear-gradient(135deg, rgba(42, 42, 42, 0.8), rgba(26, 26, 26, 0.6));
      border: 1px solid rgba(192, 192, 192, 0.15);
      box-sizing: border-box;
      overflow: hidden;
      width: fit-content;
      max-width: 100%;
      margin-inline: auto;
    }

    .graph-mobile {
      display: none;
    }

    .graph-horizontal {
      display: block;
      width: 100%;
      max-width: 100%;
    }

    .graph-desktop-layout {
      display: block;
    }

    .calendar-with-years {
      display: flex;
      gap: clamp(10px, 1.4vw, 18px);
      align-items: flex-start;
      width: 100%;
    }

    .horizontal-grid {
      --h-cell-size: clamp(10px, 0.52vw + 6px, 16px);
      --h-cell-gap: clamp(2px, 0.15vw + 1px, 4px);
      --h-week-gap: clamp(2px, 0.15vw + 1px, 4px);
      display: flex;
      gap: 0;
      width: 100%;
      align-items: flex-start;
    }

    .weeks-area {
      display: block;
      width: 100%;
      overflow: hidden;
      min-width: 0;
    }

    .month-label-track {
      position: relative;
      height: clamp(18px, 1.3vw, 24px);
      margin-bottom: clamp(4px, 0.5vw, 8px);
      width: 100%;
    }

    .month-label-horizontal {
      position: absolute;
      font-size: clamp(10px, 0.28vw + 8px, 12px);
      color: rgba(192, 192, 192, 0.75);
      white-space: nowrap;
      min-width: max-content;
    }

    .weeks-row {
      display: flex;
      gap: var(--h-week-gap);
      width: 100%;
      justify-content: flex-start;
      min-width: 0;
    }

    .week-column {
      display: grid;
      grid-template-rows: repeat(7, var(--h-cell-size));
      gap: var(--h-cell-gap);
      width: var(--h-cell-size);
    }

    .vertical-graph {
      --cell-size: 12px;
      --cell-gap: 4px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .month-row {
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }

    .month-label-vertical {
      width: clamp(22px, 7vw, 30px);
      font-size: 11px;
      color: rgba(192, 192, 192, 0.8);
      text-align: right;
      line-height: var(--cell-size);
      flex-shrink: 0;
    }

    .month-weeks {
      display: block;
    }

    .week-row {
      display: grid;
      grid-template-columns: repeat(7, var(--cell-size));
      gap: var(--cell-gap);
    }

    .contribution-cell {
      width: var(--cell-size);
      height: var(--cell-size);
      border-radius: 2px;
      transition:
        transform 0.15s ease,
        box-shadow 0.15s ease;
      cursor: pointer;
    }

    .horizontal-cell {
      width: var(--h-cell-size);
      height: var(--h-cell-size);
    }

    .contribution-cell:hover {
      transform: scale(1.15);
      box-shadow: 0 0 8px rgba(192, 192, 192, 0.35);
    }

    .contribution-cell-empty {
      background: transparent;
      cursor: default;
    }

    .contribution-cell-empty:hover {
      transform: none;
      box-shadow: none;
    }

    /* Legend cells */
    .legend-cell {
      width: 11px;
      height: 11px;
      border-radius: 2px;
    }

    .year-buttons-side {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex-shrink: 0;
      padding-top: clamp(18px, 1.3vw, 24px);
    }

    .year-buttons-bottom-mobile {
      display: none;
      flex-shrink: 0;
    }

    .year-button {
      min-width: clamp(54px, 4.6vw, 78px);
      padding: clamp(0.42rem, 0.5vw, 0.55rem) clamp(0.9rem, 1vw, 1.25rem);
      border-radius: 0.5rem;
      font-size: clamp(0.78rem, 0.22vw + 0.7rem, 0.9rem);
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

    @media (max-width: 1024px) {
      .calendar-with-years {
        display: block;
      }

      .horizontal-grid {
        --h-cell-size: clamp(8px, 0.9vw + 1px, 12px);
        --h-cell-gap: clamp(1px, 0.2vw, 3px);
        --h-week-gap: clamp(1px, 0.2vw, 3px);
      }

      .calendar-container {
        width: 100%;
      }

      .month-label-horizontal {
        max-width: calc(100% - 2px);
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .month-label-horizontal {
        font-size: clamp(9px, 0.25vw + 7px, 11px);
      }

      .year-buttons-side {
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        padding-top: 0.75rem;
      }

      .year-button {
        min-width: 52px;
        padding: 0.38rem 0.72rem;
        font-size: 0.78rem;
      }

      .contribution-count {
        font-size: 0.76rem;
      }
    }

    /* Mobile View Styles */
    @media (max-width: 419px) {
      .graph-mobile {
        display: block;
      }

      .graph-horizontal {
        display: none;
      }

      .year-buttons-side {
        display: none;
      }

      .year-buttons-bottom-mobile {
        display: flex;
      }

      .calendar-container {
        width: 100%;
        max-width: 100%;
      }

      .vertical-graph {
        --cell-size: clamp(10px, calc((100vw - 102px) / 7), 15px);
        --cell-gap: clamp(1px, 0.45vw, 3px);
      }

      .calendar-footer {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
      }

      .contribution-count {
        max-width: 100%;
        white-space: normal;
      }

      .legend-cell {
        width: 9px;
        height: 9px;
      }
    }

    /* Small mobile adjustments */
    @media (max-width: 480px) {
      .vertical-graph {
        --cell-size: clamp(9px, calc((100vw - 92px) / 7), 12px);
        --cell-gap: clamp(1px, 0.35vw, 2px);
      }

      .month-label-vertical {
        width: clamp(20px, 6.5vw, 24px);
        font-size: 10px;
      }

      .legend-cell {
        width: 8px;
        height: 8px;
      }
    }

    /* Stats cards on small screens */
    @media (max-width: 640px) {
      .stats-cards-container {
        flex-direction: column;
      }

      .stats-card {
        flex: 1 1 auto;
      }
    }

    @media (max-width: 768px) {
      .stats-card {
        padding: 0.65rem 0.85rem;
      }

      .stats-card .icon-bg {
        width: 2.25rem;
        height: 2.25rem;
      }

      .stats-card .icon-bg svg {
        width: 1.15rem;
        height: 1.15rem;
      }

      .stat-number {
        font-size: 1.35rem !important;
      }
    }
  `,
})
export class ContributionsUnifiedComponent implements OnInit {
  @ViewChild('statsCards') statsCardsRef!: ElementRef<HTMLDivElement>;

  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly githubUsername = 'aditya-poojary';

  // Month names
  private readonly monthNames = [
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
      .filter((y) => y !== 2023) // Exclude 2023
      .sort((a, b) => b - a);
    return years.length > 0 ? years : [new Date().getFullYear()];
  });

  protected readonly githubViewModeLabel = computed(() => {
    if (this.isGitHubLastYearMode()) {
      return 'last year';
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

  protected readonly githubWeeks = computed(() =>
    this.generateWeeks(this.githubFilteredContributions()),
  );

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

  protected readonly leetcodeWeeks = computed(() =>
    this.generateWeeks(this.leetcodeFilteredContributions()),
  );

  // Vertical monthly rows (continuous puzzle flow on mobile)
  protected readonly githubVerticalRows = computed(() =>
    this.generateVerticalRows(this.githubFilteredContributions()),
  );

  protected readonly leetcodeVerticalRows = computed(() =>
    this.generateVerticalRows(this.leetcodeFilteredContributions()),
  );

  ngOnInit(): void {
    this.fetchGitHubContributions();
    this.fetchLeetCodeData();
  }

  private animateStatsCards(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const cards = this.statsCardsRef?.nativeElement?.querySelectorAll('.stats-card');
    if (!cards || cards.length === 0) return;

    gsap.fromTo(
      cards,
      {
        y: 26,
        opacity: 0,
        filter: 'blur(6px)',
      },
      {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.65,
        stagger: 0.1,
        ease: 'power3.out',
        clearProps: 'all',
      },
    );
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

  protected getMonthLabelForWeek(weeks: ContributionDay[][], weekIndex: number): string {
    const week = weeks[weekIndex];
    if (!week || week.length === 0) return '';

    const currentMonth = new Date(week[0].date).getMonth();
    const previousWeek = weekIndex > 0 ? weeks[weekIndex - 1] : null;
    const previousMonth =
      previousWeek && previousWeek.length > 0 ? new Date(previousWeek[0].date).getMonth() : -1;

    return currentMonth !== previousMonth ? this.monthNames[currentMonth] : '';
  }

  private generateVerticalRows(days: ContributionDay[]): VerticalWeekRow[] {
    if (days.length === 0) return [];

    const sortedDays = [...days].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    const rows: VerticalWeekRow[] = [];

    let currentWeek: (ContributionDay | null)[] = new Array(7).fill(null);
    let currentMonthLabel = '';
    let isFirstRowOfMonth = true;

    sortedDays.forEach((day, index) => {
      const date = new Date(day.date);
      const dow = date.getDay();
      const dayMonthLabel = this.monthNames[date.getMonth()];

      if (!currentMonthLabel) {
        currentMonthLabel = dayMonthLabel;
      }

      if (dayMonthLabel !== currentMonthLabel && dow === 0) {
        if (currentWeek.some((cell) => cell !== null)) {
          rows.push({
            monthLabel: isFirstRowOfMonth ? currentMonthLabel : '',
            week: currentWeek,
          });
        }
        currentWeek = new Array(7).fill(null);
        currentMonthLabel = dayMonthLabel;
        isFirstRowOfMonth = true;
      }

      currentWeek[dow] = day;

      const isWeekEnd = dow === 6;
      const isLastItem = index === sortedDays.length - 1;

      if (isWeekEnd || isLastItem) {
        rows.push({
          monthLabel: isFirstRowOfMonth ? currentMonthLabel : '',
          week: currentWeek,
        });
        currentWeek = new Array(7).fill(null);
        isFirstRowOfMonth = false;
      }
    });

    return rows;
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
