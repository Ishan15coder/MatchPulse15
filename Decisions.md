Why MatchPulse is built the way it is. Each section gives the choice, the reason, and the cost.

DRAFT NOTE (delete before publishing): this draft was written from the project history. Lines marked [CHECK] are things only I can confirm. Rewrite each section in your own words and make sure you can defend every sentence.

1. Data source: football-data.org

I use the free tier of football-data.org. It has a documented REST API, a stable JSON format, and covers the leagues I wanted. The cost is the limits: 10 requests per minute, delayed scores, history only from the 2023 season (older seasons return 403), and no domestic cups, Europa League or Conference League.

I looked at two alternatives and rejected them. API-Football's free plan only serves seasons 2022 to 2024, so it cannot give me the current season. ESPN's hidden API is unofficial and could change or disappear without notice. Because cups are missing, my congestion numbers are understated, and "head-to-head" means league and Champions League meetings since 2023. The app says so.

2. The frontend never calls the data provider or the database

The browser only talks to my own read-only API. Three reasons: the provider's rate limit would be shared by every visitor, the API key must stay on the server, and if the provider has an outage the dashboard keeps working from stored data. The cost is one more service to run (the API on Render).

3. Python for ingestion and analysis, Node and TypeScript for the API

Ingestion and the simulator are numeric work, where Python (pandas, numpy) is the natural fit, and I wanted to learn it. I know JavaScript better, so I wrote the API in TypeScript. The consequence is that the simulation is precomputed by Python and stored in the database, and the API only serves it. A live "what if" simulator would need a third service that runs Python on request, which I left out.

4. Upserts and UTC timestamps

Every write uses INSERT ... ON CONFLICT (external_id) DO UPDATE. A match keeps the provider's id, so loading it again updates the row and does not duplicate it. That makes ingestion safe to rerun after a failure, and lets the scheduled job run four times a day without cleanup.

All kick-off times are stored as timestamptz in UTC. Matches are played in many time zones, and comparing or sorting them is only reliable if they share one reference. Conversion to local time happens only when displaying.

5. How I verified the data

Counting rows proves little, so I checked results against reality. For La Liga 2025 my computed table matched the official one: Barcelona 94 points, Real Madrid 86, Oviedo last on 29, every team on 38 games, and total goals scored equal to total goals conceded (1,024). For the Premier League 2025 table: Arsenal champions on 85, West Ham 18th on 39, Burnley 19th on 22, Wolves 20th on 20, with goals for equal to goals against (1,045). The Barcelona v Real Madrid head-to-head came out at 6 meetings, 3 wins each.

One mistake worth recording: an automated audit once reported the Premier League data as wrong because it compared my season = 2025 rows with the 2024-25 table. My season column is the start year, so 2025 means 2025-26. Lesson: check what a label means on both sides before calling data wrong. I have not backtested or table-checked Serie A or the Champions League to the same standard. [CHECK: have I verified Serie A against its official table? If not, say so.]

6. The model

I model each team with an attack and a defence rating relative to the league average, with home and away goal averages kept separate (about 1.52 home and 1.16 away goals per match in my data). Goals in a match are drawn from a Poisson distribution whose mean is the attacker's rating times the opponent's defence rating times the league average.

Recency weighting: older matches count less, using a weight of 0.5 ** (age_days / 365), so a match loses half its weight after a year. [YOUR REASON: why 365 days? Was it tuned or a reasonable guess?]
Shrinkage: each rating is pulled towards the average by adding 10 "average games". This stops a team with few matches getting an extreme rating from a lucky streak. [CHECK: was 10 tuned on data, or chosen by judgement?]
10,000 simulations: the standard error of a probability estimated from n runs is at most about 0.5 percentage points at n = 10,000, which is smaller than the uncertainty in the ratings themselves. More runs would add cost and no real accuracy.
Ranking: points, then goal difference, then a random tie-break.

I test the simulator by checking that the probabilities add up: title probabilities sum to 1, top-four to 4, relegation to 3. This catches many bugs but does not prove the ratings are good.

7. The backtest and what it does not show

To check the model against reality, I replayed La Liga 2024 and 2025 at the 25%, 50% and 75% marks of each season. At each cut-off, ratings used only matches played before that point, so the model could not see the future (data leakage would make the results look better than they are). I compared the Brier score, the average squared difference between the predicted probability and what happened, with a baseline [CHECK: write exactly what the baseline is]. The model scored 0.0233 against 0.0475 for the title, 0.0069 against 0.1600 for the top four, and 0.0661 against 0.1275 for relegation. Lower is better.

Limits: only two seasons, only La Liga, and the three cut-offs within a season overlap, so the results are not independent. The baseline is weak, so beating it is a low bar. The Premier League and the Champions League are not backtested, and I do not claim they are.

8. The Champions League outlook is experimental

For the league phase of 36 teams I report the chance of finishing first, in the top 8 (direct qualification) and in the bottom 12 (eliminated). The sums check at 1, 8 and 12. The ratings come from all finished matches in my database across La Liga, the Premier League, Serie A and the Champions League together.

This has a real weakness: ratings from different leagues are not normalised against each other, and clubs from leagues I have not loaded, such as Bayern or PSG, get a neutral rating. For that reason the outlook is labelled Experimental in the interface. Loading the Bundesliga and Ligue 1 would reduce the problem. [CHECK: update this section if those leagues have been added.]

9. Marquee fixtures

The featured fixtures are sorted by kick-off time, earliest first. Where two matches start at the same time, the one with the lower combined league position of its two teams comes first. I chose this because it is simple to explain and uses only data already on the page. Its weaknesses: it measures current standing, not team strength, and the standings endpoint does not return team ids, so teams are matched by name. Adding team_id and position to the standings response would fix that.

10. Deployment
Database: Neon with the direct connection string. The pooled connection left the session search_path empty and CREATE TABLE failed with "no schema has been selected to create in". For a small read-only API I do not need pooling.
API: Render free tier. It sleeps when idle, so the first request after a quiet period can take up to a minute. An external monitor pings /health, and the interface shows a "server waking up" state.
Frontend: Vercel. The API address is a VITE_ variable, which Vite copies into the browser bundle. That is safe because the address is public. Passwords and keys never use that prefix.
CORS: the API only accepts the frontend's own origin, set by an environment variable.
Refresh: a scheduled GitHub Actions job runs four times a day, reloads the current season and recomputes the simulations. Secrets live in GitHub, Render and my local .env, never in the repository. GitHub may start scheduled runs late.
TLS: an early shortcut disabled certificate checking to bypass a local SSL error. I replaced it with the operating system's certificate store (truststore). Certificate verification is on everywhere.
11. Known limitations
Cup competitions are missing, so congestion is understated.
The model ignores injuries, transfers and suspensions.
Promoted teams start from a neutral rating, which is probably too generous.
Ratings are treated as exact values, with no uncertainty.
Ties at the end of the season use goal difference; La Liga actually uses head-to-head first.
Free-tier scores are delayed, so the app is not live.
Only the current season is refreshed automatically. The season value must be updated when the next one starts.
12. What I left out on purpose

User accounts, live scores, a calendar export and reminders were cut for time, along with other sports. A live "what if" simulator is not possible without running Python on demand. These are in the README roadmap.