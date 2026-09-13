# Project Specification: Local-First Marathon Training Dashboard

## 1. Project Overview

This project is a private, developer-native marathon training dashboard. It serves as a visualizer for a locally managed training program. The source of truth resides entirely in local Markdown files tracked via Git. Data updates, including real training metrics from local FIT files and local AI analysis, are performed locally by the user via IDE skills (Claude Code / GitHub Copilot). The web application acts purely as a static, read-only presentation layer.

## 2. Architecture & Tech Stack

- **Data Source:** Local Markdown files (one per week) with YAML frontmatter.
- **Frontend Framework:** Next.js App Router with TypeScript (Static Export).
- **Hosting:** Vercel.
- **Data Pipeline (Local):** Scripts/IDE AI skills will parse local FIT files and inject analysis into the Markdown files using a strict **upsert** logic (never overwriting manual notes).
- **Styling:** Tailwind CSS (configured to match the strict design system below).

## 3. Data Architecture (The Source of Truth)

The database consists of a `data/` directory containing weekly Markdown files (e.g., `week-01.md`, `week-02.md`). Weeks will be sorted by the `week` value in their frontmatter. Initial development may use a small set of sample weeks; the complete training plan will be added later.

All structured data, including daily metrics, manual notes, and AI analysis, will be stored in the YAML frontmatter of these files to allow easy parsing by Next.js using a library like `gray-matter`. The body of the markdown file can be reserved for weekly summaries or left empty.

### Schema Example (`data/week-01.md`)
```yaml
---
week: 1
phase: "Base Building"
days:
  - day: 1
    date: "2026.09.14"
    sessions:
      - title: "Easy Run"
        specs: "10 km @ 5:10/km, Zone 2"
        guidelines: "Keep heart rate under 145 bpm. Focus on a quick cadence."
        strava_url: "https://www.strava.com/activities/1234567890"
        fit_file: "private/strava/2026-09-14-easy-run.fit"
        real_training: "10.2 km @ 5:08/km, avg HR 142"
        giacomo_notes: "Felt great, weather was crisp in the morning."
        ai_analysis: "Good execution. Heart rate stayed well within Zone 2 bounds with stable cadence."
  - day: 2
    date: "2026.09.15"
    sessions:
      - title: "Intervals"
        specs: "6x 1000m @ 4:00/km with 90s jog rest"
        guidelines: "Don't burn out on the first rep. Even splits are key."
        strava_url: null
        fit_file: null
        real_training: null
        giacomo_notes: ""
        ai_analysis: null
---
  ```

  ## 4. Automation & Data Sync Rules (For Local Scripts)

The developer team should be aware that external local scripts will manipulate these Markdown files.

  **Upsert Logic:** The local FIT/AI scripts will only populate `sessions[].real_training` and `sessions[].ai_analysis` when their current value is `null`. `sessions[].fit_file` and `sessions[].strava_url` are manual inputs. Each session is independent. Automated fields must use `null` when no value is available.

  **Immutability of Manual Data:** `sessions[].giacomo_notes`, `sessions[].title`, `sessions[].specs`, and `sessions[].guidelines` are manual inputs and must never be overwritten by automated scripts.

  ## 5. UI & Design System Guidelines

The interface must prioritize extreme simplicity, scanability, and a highly technical feel. It should look like a research tool or financial worksheet, not a consumer fitness app.

Core Aesthetic
Theme: Restrained editorial-notebook. Almost pure white space, black typography, fine gray rules.

Color Palette:

Background: Pure White (#FFFFFF).

Typography: Pure Black (#000000) for primary text, dark gray (#4B5563) for utility text.

Borders/Dividers: Fine, light gray (#E5E7EB).

States: Muted gray for disabled or unavailable data. Virtually no decorative color.

Typography: Bold, compact sans-serif for headlines. Very small, highly legible sans-serif or mono font for utility text and data tables.

Layout & Composition
Desktop View: A three-column analytical workbench displaying chronological weekly and daily training data. The interface has no filtering or configuration controls; it is dense but orderly.

Whitespace: A large area of empty space below the controls/tables to reinforce a calm, technical, printed-page composition.

Mobile View: The desktop workbench must collapse into a single continuous column without horizontal overflow, preserving the thin dividers and compact spacing.

Components & Elements
Containers: NO cards, NO drop shadows, NO elevated surfaces. Use fine horizontal rules and carefully spaced field groups to separate content.

Controls: The initial dashboard is read-only and has no input controls. Any future controls must use white inputs with thin gray borders and modest 3-4px corner rounding maximum.

Buttons: Black rectangular primary buttons. Subdued, flat gray for disabled states.

Navigation: Minimal and typographic. Active items turn black, inactive links remain soft gray.

Data Display: Tables, result areas, and data inspectors must continue the grid-and-rule language. Emphasize precision over ornament.

6. Implementation Deliverables
Next.js Setup: Configure Next.js with Tailwind CSS, utilizing gray-matter to parse the local Markdown files.

Dashboard View: A chronological, scrollable, static view of the marathon prep, mapping over weeks and days in ascending frontmatter `week` order.

Day/Workout Component: A UI component that cleanly displays the planned specs vs. real training, exposing Giacomo's notes and the AI analysis in a highly readable, editorial format.

Strava Linking: Conditionally render the optional `strava_url` directly if it exists in the data. Never expose `fit_file` or the `private/` directory in the dashboard.

Build Configuration: Ensure the project outputs static files via `next build` configured for Vercel deployment. Markdown data files are committed with the application source; changes deploy through Git and Vercel.