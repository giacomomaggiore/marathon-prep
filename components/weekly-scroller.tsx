"use client";

import { useEffect, useRef } from "react";
import type { TrainingDay, TrainingSession, TrainingWeek } from "../lib/training";

function Value({ children }: { children: string | null }) {
  return <p className={children ? "value" : "value value--empty"}>{children || "-"}</p>;
}

function Session({ session }: { session: TrainingSession }) {
  const notes = [session.giacomo_notes, session.ai_analysis].filter(Boolean).join(" / ");

  return (
    <div className="session">
      <section className="workout__section">
        <h3 title={session.title}>{session.title}</h3>
        <Value>{session.specs}</Value>
      </section>
      <section className="workout__section">
        <Value>{session.real_training}</Value>
        {session.strava_id && (
          <a className="strava-link" href={`https://www.strava.com/activities/${session.strava_id}`} target="_blank" rel="noreferrer">
            Strava
          </a>
        )}
      </section>
      <section className="workout__section">
        <Value>{notes || null}</Value>
      </section>
    </div>
  );
}

function Workout({ day }: { day: TrainingDay }) {
  return (
    <article className="workout">
      <p className="workout__date">{day.date}</p>
      <div className="workout__sessions">
        {day.sessions.map((session, index) => <Session key={`${day.date}-${index}`} session={session} />)}
      </div>
    </article>
  );
}

function dateValue(date: string) {
  return new Date(`${date.replaceAll(".", "-")}T12:00:00`).getTime();
}

export function WeeklyScroller({ weeks }: { weeks: TrainingWeek[] }) {
  const weekRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const today = Date.now();
    const index = weeks.reduce((currentIndex, week, weekIndex) => {
      const start = dateValue(week.days[0]?.date ?? "9999.01.01");
      return start <= today ? weekIndex : currentIndex;
    }, 0);

    weekRefs.current[index]?.scrollIntoView({ block: "start" });
  }, [weeks]);

  return (
    <main className="dashboard">
      {weeks.map((week, index) => (
        <section className="week" key={week.week} ref={(element) => { weekRefs.current[index] = element; }}>
          <header className="masthead">
            <div>
              <p className="eyebrow">TRAINING LOG / 2026</p>
              <h1>Marathon Prep</h1>
            </div>
            <div className="week__identity">
              <h2>WEEK {String(week.week).padStart(2, "0")}</h2>
              <p>{week.phase}</p>
            </div>
          </header>
          <div className="column-labels" aria-hidden="true">
            <span>PLAN</span>
            <span>ACTUAL</span>
            <span>NOTES + AI</span>
          </div>
          <div className="week__workouts">
            {week.days.map((day) => <Workout key={`${week.week}-${day.day}`} day={day} />)}
          </div>
        </section>
      ))}
    </main>
  );
}