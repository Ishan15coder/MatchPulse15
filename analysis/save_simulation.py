import os
import sys
import psycopg
from data import load_finished_matches, load_season_matches   # importing data.py also loads .env
from simulate import simulate, compute_fixture_probabilities, N_SIMS

SEASON = 2026
CODES = [sys.argv[1]] if len(sys.argv) > 1 else ["PD", "SA", "PL", "CL"]

UPSERT = """
INSERT INTO simulation_results
    (competition_id, season, team_id, points_now, exp_points,
     p_title, p_top4, p_relegation, n_sims, run_at)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, now())
ON CONFLICT (competition_id, season, team_id)
DO UPDATE SET points_now   = EXCLUDED.points_now,
              exp_points   = EXCLUDED.exp_points,
              p_title      = EXCLUDED.p_title,
              p_top4       = EXCLUDED.p_top4,
              p_relegation = EXCLUDED.p_relegation,
              n_sims       = EXCLUDED.n_sims,
              run_at       = now();
"""

UPSERT_PROB = """
INSERT INTO match_probabilities
    (match_id, prob_home, prob_draw, prob_away, updated_at)
VALUES (%s, %s, %s, %s, now())
ON CONFLICT (match_id)
DO UPDATE SET prob_home  = EXCLUDED.prob_home,
              prob_draw  = EXCLUDED.prob_draw,
              prob_away  = EXCLUDED.prob_away,
              updated_at = now();
"""

with psycopg.connect(
    host=os.environ.get("POSTGRES_HOST", "127.0.0.1"),
    port=5432,
    dbname=os.environ["POSTGRES_DB"],
    user=os.environ["POSTGRES_USER"],
    password=os.environ["POSTGRES_PASSWORD"],
) as conn:
    with conn.cursor() as cur:
        for code in CODES:
            print(f"Simulating {code} for season {SEASON}...")
            history = load_finished_matches("ALL" if code == "CL" else code)
            season_df = load_season_matches(SEASON, code)
            if len(season_df) == 0:
                print(f"No matches found for {code} season {SEASON}, skipping.")
                continue
            res = simulate(history, season_df, is_ucl=(code == "CL"))
            cur.execute("SELECT id FROM competitions WHERE code = %s", (code,))
            row = cur.fetchone()
            if not row:
                print(f"Competition {code} not found in DB, skipping.")
                continue
            competition_id = row[0]
            for r in res.itertuples():
                cur.execute(UPSERT, (
                    competition_id, SEASON, int(r.team_id), int(r.points_now),
                    float(r.exp_points), float(r.title), float(r.top4),
                    float(r.relegation), N_SIMS,
                ))
            print(f"Saved {len(res)} simulation rows for {code}")

            probs_df = compute_fixture_probabilities(history, season_df)
            for r in probs_df.itertuples():
                cur.execute(UPSERT_PROB, (
                    int(r.match_id), float(r.prob_home), float(r.prob_draw), float(r.prob_away)
                ))
            print(f"Saved {len(probs_df)} fixture probability rows for {code}")