import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type TrainingSession = {
  title: string;
  specs: string;
  guidelines: string;
  strava_url: string | null;
  fit_file: string | null;
  real_training: string | null;
  giacomo_notes: string | null;
  ai_analysis: string | null;
};

export type TrainingDay = {
  day: number;
  date: string;
  sessions: TrainingSession[];
};

export type TrainingWeek = {
  week: number;
  phase: string;
  days: TrainingDay[];
};

const dataDirectory = path.join(process.cwd(), "data");

function isTrainingWeek(value: unknown): value is TrainingWeek {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const week = value as Partial<TrainingWeek>;
  return typeof week.week === "number" && typeof week.phase === "string" && Array.isArray(week.days);
}

export function getTrainingWeeks(): TrainingWeek[] {
  const files = fs.readdirSync(dataDirectory).filter((file) => file.endsWith(".md"));

  return files
    .map((file) => {
      const source = fs.readFileSync(path.join(dataDirectory, file), "utf8");
      const { data } = matter(source);

      if (!isTrainingWeek(data)) {
        throw new Error(`Invalid training data in ${file}`);
      }

      return data;
    })
    .sort((first, second) => first.week - second.week)
    .map((week) => ({ ...week, days: [...week.days].sort((first, second) => first.day - second.day) }));
}