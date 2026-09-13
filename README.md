# Marathon Prep

## Local FIT workflow

The dashboard reads the planned program from `data/week-*.md`. FIT activity files stay local under `private/`, which is ignored by Git and is never rendered by the dashboard.

1. In Strava, download an activity using **Export Original**.
2. Save the file under `private/strava/` using a unique descriptive name, for example `private/strava/2026-09-14-easy-run.fit`.
3. In the matching session in `data/week-*.md`, set `fit_file` to the same relative path. Keep `strava_url` only when a browser link is useful; it is not used for analysis.
4. Run `/analyze-workout YYYY.MM.DD` in your AI assistant. Include the exact workout title when the date has more than one session.

The analysis skill parses `<fit_file>` into `<fit_file>.json`, then compares the local telemetry with the session's `title` and `specs`. It only fills `real_training` and `ai_analysis` when those fields are `null`; manual program fields and notes are preserved.

## Parse a FIT file manually

```sh
node .github/skills/analyze-workout/parse-fit-activity.mjs private/strava/2026-09-14-easy-run.fit
```

The generated JSON includes available session totals, laps, and timestamped records. Missing heart rate, cadence, GPS, or elevation data remains unavailable rather than being inferred.