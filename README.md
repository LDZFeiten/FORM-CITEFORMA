# Microsoft Internal RSVP

Mobile-first RSVP experience for an internal Microsoft event themed "One Room. One Network." The application presents attendance confirmation as a premium, connected digital system instead of a conventional form.

## Technologies

- TanStack Start and TanStack Router
- React 19
- TypeScript
- Tailwind CSS 4 with custom global CSS
- Netlify Forms for RSVP submission capture
- Lucide React icons

## Local Development

Install dependencies, then start the development server:

```bash
npm install
npm run dev
```

The Vite development server runs on port `3000` by default. For Netlify feature emulation, use Netlify CLI:

```bash
netlify dev
```

## Form Handling

The RSVP form submits to Netlify Forms using the `microsoft-internal-rsvp` form name. The static declaration in `public/form-survey.html` exists so Netlify can detect the form fields during deployment.
