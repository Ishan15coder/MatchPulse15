/**
 * types.ts — response interfaces that mirror the API route TypeScript interfaces.
 * Field names and types are taken verbatim from api/src/routes/*.ts.
 * Do not guess or invent fields here.
 */

// ── /teams ─────────────────────────────────────────────────────────────────
export interface TeamRow {
  id: number;
  name: string;
  short_name: string | null;
  crest_url: string | null;
}

// ── /standings ─────────────────────────────────────────────────────────────
export interface StandingsRow {
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

// ── /form ──────────────────────────────────────────────────────────────────
export interface FormRow {
  name: string;
  played: number;
  points_last_n: number;
  form: string;
}

// ── /simulation ────────────────────────────────────────────────────────────
export interface SimulationTeam {
  team_id: number;
  name: string;
  short_name: string | null;
  crest_url: string | null;
  points_now: number;
  exp_points: number;
  p_title: number;
  p_top4: number;
  p_relegation: number;
}

export interface SimulationResponse {
  run_at: string | null;
  n_sims: number | null;
  teams: SimulationTeam[];
}

// ── /coverage ──────────────────────────────────────────────────────────────
export interface CoverageRow {
  competition_code: string;
  competition_name: string;
  season: number;
  match_count: number;
  finished_count: number;
  earliest_kickoff: string | null;
  latest_kickoff: string | null;
  last_ingested: string | null;
}

export interface CoverageResponse {
  coverage: CoverageRow[];
  limitations: string[];
}

// ── /congestion ────────────────────────────────────────────────────────────
export interface CongestionRow {
  name: string;
  matches: number;
  avg_rest_days: number;
  min_rest_days: number;
  short_rest_matches: number;
}

// ── /matches ───────────────────────────────────────────────────────────────
export interface MatchRow {
  id: number;
  external_id: number;
  season: number;
  matchday: number;
  stage: string;
  kickoff_utc: string;
  status: string;
  home_goals: number | null;
  away_goals: number | null;
  last_updated: string;
  competition_code: string;
  competition_name: string;
  home_team_id: number;
  home_team_name: string;
  home_team_short_name: string | null;
  home_team_crest_url: string | null;
  away_team_id: number;
  away_team_name: string;
  away_team_short_name: string | null;
  away_team_crest_url: string | null;
  prob_home?: number | null;
  prob_draw?: number | null;
  prob_away?: number | null;
}

// ── API error envelope ─────────────────────────────────────────────────────
export interface ApiError {
  error: string;
}
