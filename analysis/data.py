import os
import pandas as pd
import psycopg

if os.path.exists(".env"):
    with open(".env", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


def _query(sql, params=None):
    conn_kwargs = (
        {"conninfo": os.environ["DATABASE_URL"]}
        if "DATABASE_URL" in os.environ
        else {
            "host": os.environ.get("POSTGRES_HOST", "127.0.0.1"),
            "port": 5432,
            "dbname": os.environ["POSTGRES_DB"],
            "user": os.environ["POSTGRES_USER"],
            "password": os.environ["POSTGRES_PASSWORD"],
        }
    )
    with psycopg.connect(**conn_kwargs) as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            columns = [d.name for d in cur.description]
            return pd.DataFrame(cur.fetchall(), columns=columns)


def load_finished_matches(code="PD"):
    if code == "ALL":
        return _query("""
            SELECT m.kickoff_utc, m.season, m.home_team_id, m.away_team_id,
                   m.home_goals, m.away_goals
            FROM matches m
            WHERE m.status = 'FINISHED'
            ORDER BY m.kickoff_utc;
        """)
    return _query("""
        SELECT m.kickoff_utc, m.season, m.home_team_id, m.away_team_id,
               m.home_goals, m.away_goals
        FROM matches m
        JOIN competitions c ON c.id = m.competition_id
        WHERE c.code = %s AND m.status = 'FINISHED'
        ORDER BY m.kickoff_utc;
    """, (code,))


def load_team_names():
    df = _query("SELECT id, name FROM teams;")
    return dict(zip(df["id"], df["name"]))

def load_season_matches(season, code="PD"):
    return _query("""
        SELECT m.id, m.kickoff_utc, m.status, m.home_team_id, m.away_team_id,
               m.home_goals, m.away_goals
        FROM matches m
        JOIN competitions c ON c.id = m.competition_id
        WHERE c.code = %s AND m.season = %s
        ORDER BY m.kickoff_utc;
    """, (code, season))