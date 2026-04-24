import { ChangeDetectionStrategy, Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-get-in-touch',
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="contact" class="scroll-mt-28 py-24 px-6 max-md:px-4 max-md:py-16">
      <div class="container-custom">
        <div class="text-center mb-12">
          <h2
            class="font-heading text-h2 font-semibold text-text-primary mb-4 flex items-center justify-center gap-3"
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
                <path
                  d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </span>
            Get In Touch
          </h2>
          <p class="text-metallic-silver/70 text-lg">
            Let's discuss your next project or just say hello!
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          <!-- Contact Info -->
          <div class="space-y-6">
            <div>
              <h3 class="text-2xl font-semibold mb-4 text-metallic-silver">Let's Connect</h3>
              <p class="text-metallic-silver/70 mb-6">
                I'm always open to discussing new opportunities, interesting projects, or just
                having a chat about technology and development.
              </p>
            </div>

            <div class="space-y-4">
              <div class="flex items-center space-x-3">
                <div class="contact-icon-wrapper">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    class="w-5 h-5"
                  >
                    <path
                      d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                    />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm text-metallic-silver/60">Email</p>
                  <p class="text-metallic-silver">adityapoojary07&#64;gmail.com</p>
                </div>
              </div>

              <div class="flex items-center space-x-3">
                <div class="contact-icon-wrapper">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    class="w-5 h-5"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm text-metallic-silver/60">Location</p>
                  <p class="text-metallic-silver">Mumbai, Maharashtra, India</p>
                </div>
              </div>

              <div class="flex items-center space-x-3">
                <div class="contact-icon-wrapper">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    class="w-5 h-5"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <p class="text-sm text-metallic-silver/60">Response Time</p>
                  <p class="text-metallic-silver">Within 24 hours</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Form -->
          <div class="contact-form-card rounded-2xl p-8">
            <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="space-y-6">
              <div class="grid md:grid-cols-2 gap-4">
                <div>
                  <label for="firstName" class="block text-sm font-medium mb-2 text-zinc-300">
                    First Name <span class="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    formControlName="firstName"
                    class="contact-input"
                    placeholder="Your first name"
                  />
                </div>
                <div>
                  <label for="lastName" class="block text-sm font-medium mb-2 text-zinc-300">
                    Last Name <span class="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    formControlName="lastName"
                    class="contact-input"
                    placeholder="Your last name"
                  />
                </div>
              </div>

              <div>
                <label for="email" class="block text-sm font-medium mb-2 text-zinc-300">
                  Email <span class="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  formControlName="email"
                  class="contact-input"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label for="subject" class="block text-sm font-medium mb-2 text-zinc-300">
                  Subject <span class="text-red-500">*</span>
                </label>
                <select id="subject" formControlName="subject" class="contact-input contact-select">
                  <option value="">Select a subject</option>
                  <option value="project-inquiry">Project Inquiry</option>
                  <option value="job-opportunity">Job Opportunity</option>
                  <option value="collaboration">Collaboration</option>
                  <option value="general">General Message</option>
                </select>
              </div>

              <div>
                <label for="message" class="block text-sm font-medium mb-2 text-zinc-300">
                  Message <span class="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  formControlName="message"
                  rows="5"
                  class="contact-input resize-none"
                  placeholder="Tell me about your project or how I can help you..."
                ></textarea>
                <p class="text-xs text-zinc-400 mt-1">
                  💡 Tip: Write a meaningful message with at least 3 words and 10 characters.
                </p>
              </div>

              <button
                type="submit"
                [disabled]="isSubmitting() || contactForm.invalid"
                class="submit-button w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300"
              >
                @if (isSubmitting()) {
                  <span class="flex items-center justify-center gap-2">
                    <svg class="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </span>
                } @else {
                  Send Message
                }
              </button>
            </form>

            <!-- Success/Error Messages -->
            @if (formStatus()) {
              <div
                class="mt-4 p-4 rounded-lg"
                [class.bg-green-100]="formStatus() === 'success'"
                [class.text-green-800]="formStatus() === 'success'"
                [class.bg-red-100]="formStatus() === 'error'"
                [class.text-red-800]="formStatus() === 'error'"
              >
                <p>{{ formMessage() }}</p>
              </div>
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

    .contact-icon-wrapper {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, rgba(192, 192, 192, 0.9), rgba(160, 160, 160, 0.8));
      color: rgba(26, 26, 26, 0.95);
    }

    .contact-form-card {
      background:
        linear-gradient(145deg, rgba(42, 42, 42, 0.92), rgba(30, 30, 30, 0.9)),
        repeating-linear-gradient(
          -45deg,
          rgba(205, 205, 205, 0.07) 0,
          rgba(205, 205, 205, 0.07) 2px,
          rgba(58, 58, 58, 0) 2px,
          rgba(58, 58, 58, 0) 6px
        );
      border: 1px solid rgba(198, 198, 198, 0.24);
      box-shadow:
        0 24px 50px -14px rgba(0, 0, 0, 0.4),
        0 0 0 1px rgba(255, 255, 255, 0.04) inset;
    }

    .contact-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid rgba(205, 205, 205, 0.2);
      border-radius: 0.5rem;
      transition: all 0.2s ease;
      background: linear-gradient(135deg, rgba(52, 52, 52, 0.9), rgba(36, 36, 36, 0.88));
      color: rgba(236, 236, 236, 0.97);
    }

    .contact-input:focus {
      outline: none;
      border-color: rgba(214, 214, 214, 0.48);
      box-shadow: 0 0 0 3px rgba(205, 205, 205, 0.12);
    }

    .contact-input::placeholder {
      color: rgba(220, 220, 220, 0.5);
    }

    .contact-select {
      appearance: none;
      background:
        linear-gradient(135deg, rgba(52, 52, 52, 0.9), rgba(36, 36, 36, 0.88)),
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%23c0c0c0' d='M1 1l4 4 4-4'/%3E%3C/svg%3E");
      background-repeat: no-repeat, no-repeat;
      background-position:
        0 0,
        right 0.9rem center;
      background-size:
        100% 100%,
        10px 6px;
      padding-right: 2.5rem;
    }

    .contact-select option {
      background: #252525;
      color: rgba(236, 236, 236, 0.97);
    }

    .submit-button {
      background: linear-gradient(135deg, rgba(42, 42, 42, 0.95), rgba(26, 26, 26, 0.9));
      color: rgba(192, 192, 192, 0.95);
      border: 1px solid rgba(192, 192, 192, 0.2);
    }

    .submit-button:hover:not(:disabled) {
      background: linear-gradient(135deg, rgba(50, 50, 50, 1), rgba(34, 34, 34, 0.95));
      transform: scale(1.02);
      border-color: rgba(192, 192, 192, 0.4);
    }

    .submit-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .submit-button:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(192, 192, 192, 0.3);
    }
  `,
})
export class GetInTouchComponent {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly isSubmitting = signal(false);
  protected readonly formStatus = signal<'success' | 'error' | null>(null);
  protected readonly formMessage = signal('');

  protected readonly contactForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  protected onSubmit(): void {
    if (this.contactForm.invalid || !isPlatformBrowser(this.platformId)) {
      return;
    }

    this.isSubmitting.set(true);
    this.formStatus.set(null);

    const formData = this.contactForm.value;

    // Using FormSubmit.co service for email sending
    const formSubmitData = new FormData();
    formSubmitData.append('name', `${formData.firstName} ${formData.lastName}`);
    formSubmitData.append('email', formData.email);
    formSubmitData.append('subject', `Portfolio Contact: ${formData.subject}`);
    formSubmitData.append('message', formData.message);
    formSubmitData.append('_subject', 'New message from Aditya Poojary Portfolio!');

    this.http
      .post('https://formsubmit.co/ajax/adityapoojary07@gmail.com', formSubmitData)
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.formStatus.set('success');
          this.formMessage.set(
            'Thank you for your message! I will get back to you within 24 hours.',
          );
          this.contactForm.reset();
        },
        error: () => {
          this.isSubmitting.set(false);
          this.formStatus.set('error');
          this.formMessage.set(
            'Oops! Something went wrong. Please try again or email me directly.',
          );
        },
      });
  }
}
