CREATE TABLE IF NOT EXISTS match_probabilities (
    match_id   INTEGER PRIMARY KEY REFERENCES matches(id) ON DELETE CASCADE,
    prob_home  NUMERIC(5,4) NOT NULL,
    prob_draw  NUMERIC(5,4) NOT NULL,
    prob_away  NUMERIC(5,4) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
