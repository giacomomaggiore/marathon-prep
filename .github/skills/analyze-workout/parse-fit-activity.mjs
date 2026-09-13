import fs from "node:fs/promises";
import path from "node:path";
import { Decoder, Stream } from "@garmin/fitsdk";

const [fitFile] = process.argv.slice(2);
const privateDirectory = path.join(process.cwd(), "private");

function number(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function isoDate(value) {
  return value instanceof Date && !Number.isNaN(value.getTime()) ? value.toISOString() : null;
}

function average(values) {
  const known = values.filter((value) => value !== null);
  return known.length === 0 ? null : known.reduce((total, value) => total + value, 0) / known.length;
}

function summarizeRecords(records) {
  return records.map((record) => ({
    timestamp: isoDate(record.timestamp),
    distance_m: number(record.distance),
    speed_mps: number(record.enhancedSpeed ?? record.speed),
    heart_rate_bpm: number(record.heartRate),
    cadence_rpm: number(record.cadence),
    altitude_m: number(record.enhancedAltitude ?? record.altitude),
    position_lat_semicircles: number(record.positionLat),
    position_long_semicircles: number(record.positionLong),
  }));
}

function summarizeLaps(laps) {
  return laps.map((lap) => ({
    start_time: isoDate(lap.startTime),
    elapsed_time_s: number(lap.totalElapsedTime),
    timer_time_s: number(lap.totalTimerTime),
    distance_m: number(lap.totalDistance),
    average_speed_mps: number(lap.enhancedAvgSpeed ?? lap.avgSpeed),
    maximum_speed_mps: number(lap.enhancedMaxSpeed ?? lap.maxSpeed),
    average_heart_rate_bpm: number(lap.avgHeartRate),
    maximum_heart_rate_bpm: number(lap.maxHeartRate),
    average_cadence_rpm: number(lap.avgCadence),
    maximum_cadence_rpm: number(lap.maxCadence),
  }));
}

if (!fitFile) {
  throw new Error("Usage: node parse-fit-activity.mjs <fit-file>");
}

const inputPath = path.resolve(process.cwd(), fitFile);
const relativeInputPath = path.relative(privateDirectory, inputPath);

if (relativeInputPath.startsWith("..") || path.isAbsolute(relativeInputPath)) {
  throw new Error("FIT files must be stored inside the private directory.");
}

const file = await fs.readFile(inputPath);
const stream = Stream.fromBuffer(file);

if (!Decoder.isFIT(stream)) {
  throw new Error("The selected file is not a valid FIT file.");
}

const decoder = new Decoder(stream);
const { messages, errors } = decoder.read({ mergeHeartRates: true });

if (errors.length > 0) {
  throw new Error(`FIT decoding failed: ${errors.map((error) => String(error)).join("; ")}`);
}

const records = summarizeRecords(messages.record ?? []);
const laps = summarizeLaps(messages.lap ?? []);
const session = messages.session?.[0] ?? {};
const telemetry = {
  source_file: path.relative(process.cwd(), inputPath),
  parsed_at: new Date().toISOString(),
  session: {
    start_time: isoDate(session.startTime),
    elapsed_time_s: number(session.totalElapsedTime),
    timer_time_s: number(session.totalTimerTime),
    distance_m: number(session.totalDistance),
    average_speed_mps: number(session.enhancedAvgSpeed ?? session.avgSpeed),
    maximum_speed_mps: number(session.enhancedMaxSpeed ?? session.maxSpeed),
    average_heart_rate_bpm: number(session.avgHeartRate),
    maximum_heart_rate_bpm: number(session.maxHeartRate),
    average_cadence_rpm: number(session.avgCadence),
    total_ascent_m: number(session.totalAscent),
    total_descent_m: number(session.totalDescent),
  },
  derived: {
    record_count: records.length,
    average_record_heart_rate_bpm: average(records.map((record) => record.heart_rate_bpm)),
    average_record_cadence_rpm: average(records.map((record) => record.cadence_rpm)),
  },
  laps,
  records,
};

const outputPath = `${inputPath}.json`;
const temporaryPath = `${outputPath}.tmp`;

await fs.writeFile(temporaryPath, `${JSON.stringify(telemetry, null, 2)}\n`, { mode: 0o600 });
await fs.rename(temporaryPath, outputPath);

console.log(`Parsed FIT telemetry: ${path.relative(process.cwd(), outputPath)}`);