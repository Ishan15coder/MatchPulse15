-- Standings reference query (dev/psql use only).
-- Set the two variables below before running:
--   \set competition 'PL'   -- e.g. PL, PD, SA, CL
--   \set season       2025
--
-- In production the API route (api/src/routes/standings.ts) supplies
-- these as parameterised values ($1 / $2); do not change that route.

WITH results AS (

    SELECT m.home_team_id AS team_id,
           m.home_goals   AS gf,
           m.away_goals   AS ga
    FROM matches m
    JOIN competitions c ON c.id = m.competition_id
    WHERE c.code = :'competition' AND m.season = :season AND m.status = 'FINISHED'

     UNION ALL

    SELECT m.away_team_id AS team_id,
           m.away_goals   AS gf,
           m.home_goals   AS ga
    FROM matches m
    JOIN competitions c ON c.id = m.competition_id
    WHERE c.code = :'competition' AND m.season = :season AND m.status = 'FINISHED'
)

SELECT t.name,
       count(*)                          AS played,
       count(*) FILTER (WHERE gf > ga)   AS won,
       count(*) FILTER (WHERE gf = ga)   AS drawn,
       count(*) FILTER (WHERE gf < ga)   AS lost,

       sum(gf)                           AS goals_for,
       sum(ga)                           AS goals_against,
       sum(gf)-sum(ga)                   AS goal_difference,
       (count(*) FILTER (WHERE gf > ga)) * 3 + (count(*) FILTER (WHERE gf = ga)) * 1 AS points
FROM results r
JOIN teams t ON t.id = r.team_id
GROUP BY t.name
ORDER BY points DESC, goal_difference DESC;