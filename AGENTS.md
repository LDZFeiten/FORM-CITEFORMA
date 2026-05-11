# AGENTS.md

This project is a TanStack Start application for a premium mobile RSVP experience for an internal Microsoft event.

## Architecture

- `src/routes/__root.tsx` defines the HTML shell, metadata, global styles, and script injection.
- `src/routes/index.tsx` renders the single-page RSVP experience.
- `src/components/SurveyForm.tsx` contains the full multi-step RSVP flow, including attendance, employee details, guest details, dietary restrictions, and Netlify Forms submission.
- `src/styles.css` contains Tailwind import plus the custom visual system: dark Microsoft-inspired theme, glass panels, digital network effects, motion, responsive phone shell, and control states.
- `public/form-survey.html` declares the Netlify Form fields for deploy-time form detection.

## Key Technologies

- TanStack Start with file-based routing
- React 19 and TypeScript
- Tailwind CSS 4
- Lucide React for interface icons
- Netlify Forms for RSVP submissions

## Coding Conventions

- Use PascalCase for React components.
- Keep route files in `src/routes/`.
- Prefer scoped React state for short-lived UI flow state.
- Use the existing `@/` alias if adding shared imports.
- Keep UI copy in Portuguese for this RSVP flow unless the event direction changes.
- Maintain the dark, restrained Microsoft/Copilot-inspired visual language: deep navy background, subtle blue glow, glassmorphism, minimal technical lines, and no gaming-style visuals.

## Non-Obvious Decisions

- The collaborator details are currently seeded in the client to demonstrate the personalized internal-system flow. Replace these values with real employee data integration if connected to an authenticated source later.
- Netlify Forms is used for persistence of submissions, so no database schema is required for the current request.
- `public/form-survey.html` must remain aligned with the fields submitted by `SurveyForm.tsx`; update both when adding or renaming form fields.
- The final confirmation state is part of the same component so the experience feels continuous after submission.
