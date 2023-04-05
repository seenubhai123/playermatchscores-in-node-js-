const express = require("express");
const app = express();
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

let dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;

app.use(express.json());

let initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running successfully");
    });
  } catch (e) {
    console.log(`Database Error : ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/players", async (request, response) => {
  let sql_query = `
        SELECT player_id AS playerId,
        player_name AS playerName
        FROM player_details;`;
  let result = await db.all(sql_query);
  response.send(result);
});

app.get("/players/:playerId", async (request, response) => {
  let { playerId } = request.params;
  let sql_query = `
        SELECT
            player_id AS playerId,
            player_name AS playerName
        FROM
            player_details
        WHERE
            player_id = ${playerId};`;
  let result = await db.get(sql_query);
  response.send(result);
});

app.put("/players/:playerId", async (request, response) => {
  let { playerId } = request.params;
  let { playerName } = request.body;
  let update_sql_query = `
        UPDATE
            player_details
        SET
            player_name = '${playerName}'
        WHERE
            player_id = ${playerId};`;
  await db.run(update_sql_query);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId", async (request, response) => {
  let { matchId } = request.params;
  let sql_query = `
        SELECT
            match_id AS matchId,
            match,
            year
        FROM
            match_details
        WHERE
            match_id = ${matchId};`;
  let result = await db.get(sql_query);
  response.send(result);
});

app.get("/players/:playerId/matches", async (request, response) => {
  let { playerId } = request.params;
  let sql_query = `
    SELECT
        match_id AS matchId,
        match,
        year
    FROM
        player_match_score NATURAL JOIN match_details
    WHERE
        player_id = ${playerId};`;
  let result = await db.all(sql_query);
  response.send(result);
});

app.get("/matches/:matchId/players", async (request, response) => {
  let { matchId } = request.params;
  let sql_query = `
    SELECT
        player_id AS playerId,
        player_name AS playerName
    FROM
        player_details NATURAL JOIN player_match_score
    WHERE
        match_id = ${matchId};`;
  let result = await db.all(sql_query);
  response.send(result);
});

app.get("/players/:playerId/playerScores", async (request, response) => {
  let { playerId } = request.params;
  let sql_query = `
        SELECT
            player_id AS playerId,
            player_name AS playerName,
            SUM(score) AS totalScore,
            SUM(fours) AS totalFours,
            SUM(sixes) AS totalSixes
        FROM
            player_details NATURAL JOIN player_match_score
        WHERE
            player_id = ${playerId};`;
  let result = await db.get(sql_query);
  response.send(result);
});

module.exports = app;
