import { WeeklyScroller } from "../components/weekly-scroller";
import { getTrainingWeeks } from "../lib/training";

export default function Dashboard() {
  const weeks = getTrainingWeeks();

  return <WeeklyScroller weeks={weeks} />;
}