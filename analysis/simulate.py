import math
import numpy as np
import pandas as pd
from data import load_finished_matches, load_season_matches, load_team_names
from ratings import compute_ratings

N_SIMS = 10_000


def compute_match_probabilities(lam_h, lam_a, max_goals=10):
    """Sum Poisson probabilities over scorelines 0 to max_goals each.
    Returns (P(Home win), P(Draw), P(Away win)).
    """
    p_h = [math.exp(-lam_h) * (lam_h ** i) / math.factorial(i) for i in range(max_goals + 1)]
    p_a = [math.exp(-lam_a) * (lam_a ** j) / math.factorial(j) for j in range(max_goals + 1)]
    p_home = sum(p_h[i] * p_a[j] for i in range(max_goals + 1) for j in range(max_goals + 1) if i > j)
    p_draw = sum(p_h[i] * p_a[j] for i in range(max_goals + 1) for j in range(max_goals + 1) if i == j)
    p_away = sum(p_h[i] * p_a[j] for i in range(max_goals + 1) for j in range(max_goals + 1) if i < j)
    tot = p_home + p_draw + p_away
    return p_home / tot, p_draw / tot, p_away / tot


def compute_fixture_probabilities(history, season_df, as_of=None):
    """Compute Poisson match outcome probabilities for all unplayed fixtures."""
    if as_of is None:
        todo = season_df[season_df["status"] != "FINISHED"].copy()
    else:
        todo = season_df[season_df["kickoff_utc"] > as_of].copy()

    if len(todo) == 0:
        return pd.DataFrame(columns=["match_id", "prob_home", "prob_draw", "prob_away"])

    ratings, mu_home, mu_away = compute_ratings(history, as_of=as_of)
    team_ids = sorted(set(season_df["home_team_id"]) | set(season_df["away_team_id"]))
    att = ratings["attack"].reindex(team_ids).fillna(1.0)
    dfn = ratings["defence"].reindex(team_ids).fillna(1.0)

    rows = []
    for r in todo.itertuples():
        h_id, a_id = r.home_team_id, r.away_team_id
        lh = float(att.get(h_id, 1.0) * dfn.get(a_id, 1.0) * mu_home)
        la = float(att.get(a_id, 1.0) * dfn.get(h_id, 1.0) * mu_away)
        p_home, p_draw, p_away = compute_match_probabilities(lh, la)
        rows.append({
            "match_id": int(r.id),
            "prob_home": round(p_home, 4),
            "prob_draw": round(p_draw, 4),
            "prob_away": round(p_away, 4),
        })
    return pd.DataFrame(rows)


def simulate(history, season_df, as_of=None, n_sims=N_SIMS, seed=42, is_ucl=False):
    """Simulate the rest of a season.
    history   : finished matches (ratings use only those up to as_of)
    season_df : every match of the season being simulated
    as_of     : pretend 'now'; None means the real now (uses match status)
    is_ucl    : if True, computes UCL League Stage cutoffs (Top 8 R16, Eliminated 25-36)
    """
    if as_of is None:
        played = season_df[season_df["status"] == "FINISHED"]
        todo = season_df[season_df["status"] != "FINISHED"]
    else:
        played = season_df[season_df["kickoff_utc"] <= as_of]
        todo = season_df[season_df["kickoff_utc"] > as_of]
    ratings, mu_home, mu_away = compute_ratings(history, as_of=as_of)

    team_ids = sorted(set(season_df["home_team_id"]) | set(season_df["away_team_id"]))
    idx = {tid: i for i, tid in enumerate(team_ids)}
    T = len(team_ids)

    # points and goal difference already in the bank
    base_pts = np.zeros(T)
    base_gd = np.zeros(T)
    for r in played.itertuples():
        h, a = idx[r.home_team_id], idx[r.away_team_id]
        base_gd[h] += r.home_goals - r.away_goals
        base_gd[a] += r.away_goals - r.home_goals
        if r.home_goals > r.away_goals:
            base_pts[h] += 3
        elif r.home_goals < r.away_goals:
            base_pts[a] += 3
        else:
            base_pts[h] += 1
            base_pts[a] += 1

    # expected goals for every remaining match (unrated teams default to 1.0)
    att = ratings["attack"].reindex(team_ids).fillna(1.0).to_numpy()
    dfn = ratings["defence"].reindex(team_ids).fillna(1.0).to_numpy()
    h_idx = todo["home_team_id"].map(idx).to_numpy()
    a_idx = todo["away_team_id"].map(idx).to_numpy()
    lam_h = att[h_idx] * dfn[a_idx] * mu_home
    lam_a = att[a_idx] * dfn[h_idx] * mu_away

    # Monte Carlo
    rng = np.random.default_rng(seed)
    gh = rng.poisson(lam_h, size=(n_sims, len(todo)))
    ga = rng.poisson(lam_a, size=(n_sims, len(todo)))
    home_pts = 3 * (gh > ga) + (gh == ga)
    away_pts = 3 * (ga > gh) + (gh == ga)
    diff = gh - ga

    pts = np.tile(base_pts, (n_sims, 1))
    gd = np.tile(base_gd, (n_sims, 1))
    for t in range(T):
        hm = h_idx == t
        am = a_idx == t
        pts[:, t] += home_pts[:, hm].sum(axis=1) + away_pts[:, am].sum(axis=1)
        gd[:, t] += diff[:, hm].sum(axis=1) - diff[:, am].sum(axis=1)

    score = pts * 1000 + gd + rng.random((n_sims, T)) * 0.5
    ranks = (-score).argsort(axis=1).argsort(axis=1) + 1

    if is_ucl:
        # UCL League Stage (36 teams):
        # title: finishing 1st in the single table (Phase Winner / Top Seed)
        # top4 column: finishing in Top 8 (Direct Round of 16 qualification)
        # relegation column: finishing 25th-36th (Eliminated from Europe)
        p_title = (ranks == 1).mean(axis=0)
        p_top = (ranks <= 8).mean(axis=0)
        p_bottom = (ranks >= 25).mean(axis=0)
    else:
        # Domestic round-robin leagues:
        p_title = (ranks == 1).mean(axis=0)
        p_top = (ranks <= 4).mean(axis=0)
        p_bottom = (ranks > T - 3).mean(axis=0)

    return pd.DataFrame({
        "team_id": team_ids,
        "points_now": base_pts,
        "exp_points": pts.mean(axis=0),
        "title": p_title,
        "top4": p_top,
        "relegation": p_bottom,
    })


if __name__ == "__main__":
    history = load_finished_matches()
    season_df = load_season_matches(2026)
    names = load_team_names()
    res = simulate(history, season_df)
    res["team"] = res["team_id"].map(names)
    res = res.drop(columns="team_id").sort_values("exp_points", ascending=False)
    pd.set_option("display.width", 200)
    print(res.round(3).to_string(index=False))
    print()
    print("sums (should be 1, 4, 3):",
          round(res["title"].sum(), 3), round(res["top4"].sum(), 3), round(res["relegation"].sum(), 3))