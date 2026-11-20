-- 004_history.sql
-- Snapshots of the simulation and the match probabilities, so we can later
-- chart how the title race changes and measure how accurate predictions were.
-- A snapshot is written only when a competition's finished-match count changes.

CREATE TABLE IF NOT EXISTS simulation_history (
  id               BIGSERIAL PRIMARY KEY,
  competition_id   INTEGER      NOT NULL REFERENCES competitions(id),
  season           INTEGER      NOT NULL,
  team_id          INTEGER      NOT NULL REFERENCES teams(id),
  snapshot_at      TIMESTAMPTZ  NOT NULL,   -- one value per run, UTC
  matches_finished INTEGER      NOT NULL,   -- finished matches when this snapshot was taken
  points_now       INTEGER,
  exp_points       NUMERIC(6,2),
  -- For leagues: title, top 4, relegation.
  -- For the Champions League these hold: phase 1st, top 8, eliminated.
  p_title          NUMERIC(6,5),
  p_top4           NUMERIC(6,5),
  p_relegation     NUMERIC(6,5),
  UNIQUE (competition_id, season, team_id, snapshot_at)
);

CREATE INDEX IF NOT EXISTS idx_simhist_comp_season_time
  ON simulation_history (competition_id, season, snapshot_at);

CREATE TABLE IF NOT EXISTS match_probability_history (
  match_id    INTEGER      NOT NULL REFERENCES matches(id),
  snapshot_at TIMESTAMPTZ  NOT NULL,
  prob_home   NUMERIC(5,4) NOT NULL,
  prob_draw   NUMERIC(5,4) NOT NULL,
  prob_away   NUMERIC(5,4) NOT NULL,
  PRIMARY KEY (match_id, snapshot_at)
);

CREATE INDEX IF NOT EXISTS idx_mph_match_time
  ON match_probability_history (match_id, snapshot_at DESC);