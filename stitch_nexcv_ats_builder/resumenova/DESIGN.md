---
name: ResumeNova
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#4b41e1'
  on-secondary: '#ffffff'
  secondary-container: '#645efb'
  on-secondary-container: '#fffbff'
  tertiary: '#006242'
  on-tertiary: '#ffffff'
  tertiary-container: '#007d55'
  on-tertiary-container: '#bdffdb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c3c0ff'
  on-secondary-fixed: '#0f0069'
  on-secondary-fixed-variant: '#3323cc'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-margin: 20px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style
The design system is engineered for a premium, AI-driven SaaS mobile experience. It evokes a sense of high-end craftsmanship, reliability, and professional advancement. The visual language bridges the gap between the structured logic of **Material 3** and the airy, sophisticated aesthetic of modern tech startups.

The style is **Corporate Modern with a "Soft-Tech" edge**:
- **Clarity over Complexity:** High whitespace usage to reduce cognitive load during the resume-building process.
- **Dynamic Intelligence:** Subtle use of gradients and glassmorphism to signify AI-powered features without breaking the professional "Clean" aesthetic.
- **Tactile Softness:** Elements feel physically approachable through generous corner radii and soft, ambient shadows.

## Colors
The palette is rooted in a "Trust-Blue" foundation, utilizing a sophisticated gradient between Primary (Deep Blue) and Secondary (Indigo) to highlight high-value AI interactions and primary call-to-actions.

- **Action Palette:** Primary and Secondary colors are used for interactive states. Use the gradient sparingly for "Magic" or "AI" buttons.
- **Surface Strategy:** The background remains Pure White to maximize contrast. Surfaces (Cards, Input backgrounds) utilize a subtle Slate-tinted Light Gray to create soft containment.
- **Semantic Feedback:** Success Green is reserved for ATS (Applicant Tracking System) optimization scores and "Completed" states. Warning Orange is used for missing resume sections or data errors.

## Typography
The system employs a dual-font strategy to balance personality with extreme legibility. 

- **Display & Headings:** **Plus Jakarta Sans** provides a welcoming, modern geometric feel with slightly wider apertures. Bold weights are preferred for section headers to create a strong visual anchor.
- **Interface & Body:** **Inter** is used for all functional text, resume content inputs, and labels. Its neutral, systematic nature ensures that the user's resume content is the focus, not the UI.
- **Scale:** On mobile devices, use `headline-xl-mobile` for screen titles to ensure content fits above the fold.

## Layout & Spacing
This design system follows a **Fluid Margin, Fixed Gutter** model optimized for mobile-first SaaS.

- **The 4px Grid:** All spacing must be a multiple of 4px.
- **Margins:** A standard 20px horizontal margin is applied to the main viewport.
- **Vertical Rhythm:** Content sections (e.g., Personal Info vs. Experience) are separated by `stack-lg` (24px). Elements within a card (e.g., Label vs. Input) are separated by `stack-sm` (8px).
- **Cards:** Cards should span the full width of the available content area (viewport minus margins).

## Elevation & Depth
Depth is created through **Tonal Layering** and **Ambient Shadows** rather than harsh borders.

- **Level 0 (Background):** Pure White (#FFFFFF).
- **Level 1 (Cards/Surfaces):** Light Gray (#F8FAFC). These use a 1px stroke of Slate 100 (#F1F5F9) to define edges without adding visual weight.
- **Level 2 (Floating/Interactive):** Subtle ambient shadow (Y: 4px, Blur: 12px, Color: Slate 900 at 5% opacity).
- **Overlays (Modals/AI Panels):** Glassmorphism is used with a background blur (12px to 20px) and a semi-transparent white fill (80% opacity). This maintains context while focusing the user's attention.

## Shapes
Shape language is consistently "Soft-Organic." 

- **Standard Elements:** Buttons and Input fields use a 12px-16px radius (`rounded-lg`).
- **Main Containers:** Cards and Modals use a 24px radius (`rounded-xl`) to feel modern and premium.
- **Interactive Feedback:** Selection states (like picking a resume template) should use a thick 2px primary-colored border following the same corner radius.

## Components

- **Buttons:** 
  - *Primary:* Gradient (Deep Blue to Indigo), white text, no border. 
  - *Secondary:* Ghost style with Primary color text and a 1px Slate 200 border.
- **Inputs:** Background-filled (#F8FAFC) with no border in resting state. On focus, transition to a 1px Primary color border with a subtle glow.
- **Resume Progress Chips:** Small, pill-shaped indicators. Use Success Green for "Complete" and Slate 100 for "Pending."
- **AI Action Cards:** Cards featuring a subtle Primary-tinted border and a small "Sparkle" icon to denote AI-assisted content.
- **Navigation:** A clean bottom navigation bar with 60% opacity backdrop blur, using the Primary color for the active icon state.