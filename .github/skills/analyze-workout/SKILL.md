---
name: analyze-workout
description: "Use when analyzing a planned running workout against a local FIT file. Invoke as /analyze-workout YYYY.MM.DD or /analyze-workout YYYY.MM.DD workout title. Parses private local telemetry and writes null-only training analysis."
argument-hint: "YYYY.MM.DD [workout title]"
user-invocable: true
disable-model-invocation: true
---

# Analyze Workout

Analyze one running session against its local FIT telemetry and the program stored in `data/week-*.md`.

## Inputs

- A date in `YYYY.MM.DD` format.
- An optional exact workout title. It is required when more than one session exists on that date.
- The matching session's `title`, `specs`, and manual `fit_file`.

## Preconditions

- The session must have a `fit_file` path beneath `private/` that points to a local `.fit` file.
- Use Node 18 or later.

## Procedure

1. Find the session by its date across `data/week-*.md`. If none exists, stop and name the missing date. If multiple sessions exist and no exact title was given, list their titles and stop.
2. Treat clearly non-running titles such as strength, mobility, bike, or rest as unsupported. Return exactly `analytics NA` and do not fetch or edit files.
3. Confirm `fit_file` is present, points beneath `private/`, and its file exists. Never modify `title`, `specs`, `guidelines`, `giacomo_notes`, `strava_url`, or `fit_file`.
4. Parse local telemetry by running [parse-fit-activity.mjs](./parse-fit-activity.mjs):
   ```sh
   node .github/skills/analyze-workout/parse-fit-activity.mjs '<fit_file>'
   ```
   The command intentionally replaces `<fit_file>.json`. The `private/` directory is ignored by Git and must never be exposed in the dashboard.
5. Read the parsed JSON. Missing HR, cadence, GPS, elevation, laps, or records must be reported as unavailable, never inferred.
6. Apply the analysis prompt below. Base all numerical claims on the raw activity file. Clearly label any interpretation, and do not invent intervals when laps/streams cannot support them.
7. Produce `real_training` as a concise factual summary suitable for the dashboard. Produce `ai_analysis` as the complete coaching assessment below. Use a YAML parser or structured frontmatter editor; do not use text replacement.
8. Only populate `real_training` and `ai_analysis` when each existing value is `null`. If either field already has a value, preserve it and report that it was not overwritten. Do not modify any other frontmatter field.

## Analysis Prompt

### Role & Methodology

You are an elite sports scientist and marathon coach. Analyze running workouts by combining exercise physiology with core training frameworks:

- **Jack Daniels (VDOT):** Training intensity zones (E, M, T, I, R) and stimulus validation.
- **Renato Canova:** Specific endurance, race-pace extension, and active recovery float control.
- **Pete Pfitzinger:** Aerobic decoupling ($Pa:HR$ drift), threshold maintenance, and fatigue resistance.

### Inputs

1. **`PLANNED_WORKOUT`**: The session title and target paces, interval structures, and rest periods from `specs`.
2. **`FIT_TELEMETRY`**: The parsed local FIT JSON containing session metrics, laps, records, distance, duration, speed, HR, cadence, elevation, and GPS when available.

### Core Analysis Tasks

1. **Target vs. Actual Alignment:** Map actual intervals to planned reps. Calculate pace deltas ($\text{Actual} - \text{Target}$) and split consistency ($SD_{Pace}$).
2. **Physiological & Biomechanical Metrics:**
   - **Aerobic Decoupling:** Compare Efficiency Factor ($EF = \frac{\text{Speed}}{\text{HR}}$) between the first and second half of the session. More than 5% drift signals aerobic breakdown or fatigue.
   - **GAP & Topography:** Verify whether pacing swings were caused by terrain changes or effort mismanagement.
   - **Cadence Decay:** Track SPM drops across reps to spot neuromuscular fatigue.
3. **Training Stimulus Check:** Identify whether the runner hit the intended adaptation or overcooked early reps into an anaerobic state.

### Response Guidelines

Deliver a concise coaching assessment containing:

- An **Execution Score (0-100%)** and a brief overall summary.
- A **split-by-split comparison table**: planned versus actual pace, HR, and cadence.
- Key **physiological insights**: decoupling, pacing strategy, and energy system targeted.
- Exactly **3 actionable coaching adjustments** for the next workout.