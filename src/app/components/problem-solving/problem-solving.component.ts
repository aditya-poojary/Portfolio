import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  selector: 'app-problem-solving',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-24 px-6 max-md:px-4 max-md:py-16">
      <div class="container-custom">
        <h2
          class="font-heading text-h2 font-semibold text-text-primary mb-10 flex items-center gap-3"
        >
          <span
            class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-white/10"
            style="background: rgba(184, 134, 11, 0.15)"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="w-4.5 h-4.5 text-metallic-gold"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </span>
          Problem Solving & Coding Journey
        </h2>

        <!-- Stats grid -->
        <div class="grid grid-cols-3 gap-5 max-md:grid-cols-1 max-md:gap-4">
          <!-- Streak -->
          <div
            class="group relative p-6 rounded-xl border border-white/4 transition-all duration-300 hover:border-white/8 overflow-hidden"
            style="background: linear-gradient(135deg, rgba(34, 34, 34, 0.8), rgba(42, 42, 42, 0.4))"
          >
            <div
              class="absolute top-0 left-0 w-full h-px"
              style="background: linear-gradient(90deg, transparent, var(--color-accent-teal), transparent)"
            ></div>
            <div class="flex items-center gap-3 mb-3">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="w-5 h-5 text-accent-teal-light"
              >
                <path
                  d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"
                />
              </svg>
              <span class="font-label text-xs font-medium tracking-wider text-text-muted uppercase">
                Coding Streak
              </span>
            </div>
            <span
              class="font-heading text-[2.5rem] font-bold leading-none"
              style="
                background: linear-gradient(135deg, var(--color-accent-teal-light), var(--color-text-primary));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
              "
            >
              {{ dsaStats().streak }}
            </span>
            <span class="block font-body text-sm text-text-muted mt-2"
              >days of consistent coding</span
            >
          </div>

          <!-- Problems Solved -->
          <div
            class="group relative p-6 rounded-xl border border-white/4 transition-all duration-300 hover:border-white/8 overflow-hidden"
            style="background: linear-gradient(135deg, rgba(34, 34, 34, 0.8), rgba(42, 42, 42, 0.4))"
          >
            <div
              class="absolute top-0 left-0 w-full h-px"
              style="background: linear-gradient(90deg, transparent, var(--color-accent-ruby), transparent)"
            ></div>
            <div class="flex items-center gap-3 mb-3">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="w-5 h-5 text-accent-ruby-light"
              >
                <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
              </svg>
              <span class="font-label text-xs font-medium tracking-wider text-text-muted uppercase">
                Problems Solved
              </span>
            </div>
            <span
              class="font-heading text-[2.5rem] font-bold leading-none"
              style="
                background: linear-gradient(135deg, var(--color-accent-ruby-light), var(--color-text-primary));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
              "
            >
              {{ dsaStats().problemsSolved }}
            </span>
            <span class="block font-body text-sm text-text-muted mt-2"
              >across coding platforms</span
            >
          </div>

          <!-- Contest Rating -->
          <div
            class="group relative p-6 rounded-xl border border-white/4 transition-all duration-300 hover:border-white/8 overflow-hidden"
            style="background: linear-gradient(135deg, rgba(34, 34, 34, 0.8), rgba(42, 42, 42, 0.4))"
          >
            <div
              class="absolute top-0 left-0 w-full h-px"
              style="background: linear-gradient(90deg, transparent, var(--color-metallic-gold), transparent)"
            ></div>
            <div class="flex items-center gap-3 mb-3">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="w-5 h-5 text-metallic-gold"
              >
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
              <span class="font-label text-xs font-medium tracking-wider text-text-muted uppercase">
                LeetCode Rating
              </span>
            </div>
            <span
              class="font-heading text-[2.5rem] font-bold leading-none"
              style="
                background: linear-gradient(135deg, var(--color-metallic-gold), var(--color-text-primary));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
              "
            >
              {{ dsaStats().contestRating }}
            </span>
            <span class="block font-body text-sm text-text-muted mt-2">highest contest rating</span>
          </div>
        </div>

        <!-- Platforms note -->
        <p class="font-body text-sm text-text-muted mt-6 italic flex items-center gap-2">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="w-4 h-4 text-text-muted shrink-0"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          Active across {{ dsaStats().platforms }}
        </p>
      </div>
    </section>
  `,
})
export class ProblemSolvingComponent {
  protected readonly dsaStats = signal({
    streak: '520+',
    problemsSolved: '720+',
    contestRating: '1510',
    platforms: 'LeetCode, TCET & 10x Hackathons',
  });
}
