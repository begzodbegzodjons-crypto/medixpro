---
name: Clinical Precision
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#434653'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#737784'
  outline-variant: '#c3c6d5'
  surface-tint: '#1d59c1'
  primary: '#003c90'
  on-primary: '#ffffff'
  primary-container: '#0f52ba'
  on-primary-container: '#bcceff'
  inverse-primary: '#b0c6ff'
  secondary: '#006a6a'
  on-secondary: '#ffffff'
  secondary-container: '#90efef'
  on-secondary-container: '#006e6e'
  tertiary: '#324257'
  on-tertiary: '#ffffff'
  tertiary-container: '#49596f'
  on-tertiary-container: '#bfd0ea'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#b0c6ff'
  on-primary-fixed: '#001945'
  on-primary-fixed-variant: '#00419c'
  secondary-fixed: '#93f2f2'
  secondary-fixed-dim: '#76d6d5'
  on-secondary-fixed: '#002020'
  on-secondary-fixed-variant: '#004f4f'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-bold:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-max: 1440px
  gutter: 20px
---

## Brand & Style
The design system is engineered for a high-trust, mission-critical Healthcare SaaS environment. The brand personality is authoritative yet empathetic, focusing on clarity, reliability, and efficiency. 

The visual style follows a **Modern Corporate** aesthetic with a lean toward **Minimalism** to manage high data density. It prioritizes a "clinical" cleanliness—utilizing ample white space, a structured grid, and a sophisticated color palette that evokes a sense of sterile safety and professional calm. The emotional response should be one of absolute confidence; users (medical staff and administrators) must feel that the software is an invisible, error-free extension of their workflow.

## Colors
The palette is rooted in "Medical Blues" and "Sterile Whites" to reinforce professional trust. 

- **Primary (Deep Clinical Blue):** Used for primary actions, navigation headers, and brand moments.
- **Secondary (Calming Teal):** Used for health-related accents, success states, and secondary call-to-actions.
- **Neutral (Slate & Ice):** A range of cool greys used for backgrounds, borders, and secondary text to reduce eye strain during long shifts.
- **Status Tones:** Distinct, high-visibility colors for "Waiting" (Amber), "In-Progress" (Blue), "Completed" (Emerald), and "Urgent/Emergency" (Red). 

Backgrounds should primarily use the neutral-50 (#F8FAFC) to maintain a bright, clean environment, while borders use a soft grey (#E2E8F0) to define structure without adding visual noise.

## Typography
This design system utilizes **Inter** for its exceptional legibility in data-heavy interfaces and its neutral, modern tone. 

- **Hierarchy:** Use `display-lg` sparingly for dashboard overviews. `headline-sm` is the standard for card titles and section headers.
- **Data Density:** Use `body-md` for standard form inputs and table rows. `body-sm` is reserved for secondary metadata or helper text.
- **Data Display:** For numerical values (vitals, lab results, billing), ensure `font-feature-settings: 'tnum'` (tabular figures) is enabled to keep numbers aligned in columns.
- **Labels:** Small caps/uppercase with slight tracking should be used for table headers and section labels to differentiate them from interactive content.

## Layout & Spacing
The layout employs a **Fluid Grid** for internal dashboards and a **Fixed Max-Width** for patient record views to ensure readability.

- **Grid:** A 12-column system with a 20px gutter. 
- **Density:** To accommodate the data-dense nature of an ERP, the system uses a 4px baseline rhythm. For "Standard" views (settings, profiles), use `md` (16px) padding. For "Compact" views (patient queues, medical charts), use `sm` (8px) padding.
- **Mobile:** Elements reflow to a single column. Margins reduce from 32px (desktop) to 16px (mobile).
- **Sidebar:** A fixed left-hand navigation (240px wide) provides consistent access to primary modules (Dashboard, Patients, Schedule, Billing).

## Elevation & Depth
The system uses **Tonal Layers** combined with **Ambient Shadows** to create a structured hierarchy.

- **Level 0 (Background):** Neutral-50 (#F8FAFC).
- **Level 1 (Cards/Surface):** White (#FFFFFF) with a 1px border (#E2E8F0). No shadow. Used for the main content areas.
- **Level 2 (Interactive/Floating):** White with a soft, diffused shadow (0px 4px 6px -1px rgba(0, 0, 0, 0.1)). Used for buttons and hover states.
- **Level 3 (Modals/Popovers):** White with a deep shadow (0px 20px 25px -5px rgba(0, 0, 0, 0.1)). 

Depth is primarily communicated through subtle shifts in background color and thin, purposeful borders rather than aggressive shadows, maintaining the "clean" medical feel.

## Shapes
The shape language is **Rounded**, strike a balance between professional rigor and modern approachability.

- **Standard Elements (Buttons, Inputs, Cards):** 0.5rem (8px). This creates a friendly but disciplined appearance.
- **Large Elements (Modals, Feature Containers):** 1rem (16px).
- **Status Pills:** Fully rounded (pill-shaped) to distinguish them from interactive buttons.
- **Avatars:** Circular (100% radius) for patient and doctor portraits to soften the clinical look.

## Components
- **Buttons:** Primary buttons use the Primary Blue with white text. Secondary buttons use a Slate border with Primary Blue text. Ghost buttons are reserved for tertiary actions.
- **Status Badges:** Use a "Light-on-Dark" or "Tinted" style. For example, "Waiting" uses an Amber background at 10% opacity with solid Amber text.
- **Data Tables:** High-density rows (40px height). Zebra-striping is omitted in favor of thin 1px horizontal dividers. The header row should have a subtle grey background (Neutral-100).
- **Input Fields:** 8px corner radius with a 1px Slate-200 border. On focus, the border transitions to Primary Blue with a 2px soft outer glow.
- **Patient Record Cards:** A specialized component featuring a condensed header with Name, DOB, and ID, followed by a segmented control for switching between "History," "Labs," and "Appointments."
- **Doctor Dashboard Widgets:** Square or rectangular cards with `headline-sm` titles. Include a "Quick Action" icon in the top right for adding notes or prescriptions.
- **Breadcrumbs:** Small, Slate-colored text to maintain context within deep patient record hierarchies.