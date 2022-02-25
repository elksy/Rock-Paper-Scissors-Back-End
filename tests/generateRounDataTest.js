import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import generateRoundData from "../generateRoundData.js";
import { updateTournamentBracket } from "../serverTournamentWs.js";

const userData = new Map();

{
  const tournamentPlayers = new Map();
  const playerIds = [1, 2];
  const players = [
    { name: "Team A", bgColor: "red", textColor: "black" },
    { name: "Team B", bgColor: "blue", textColor: "white" },
  ];
  for (let i = 0; i < playerIds.length; i++) {
    tournamentPlayers.set(playerIds[i], players[i]);
  }
  userData.set("twoManTournament", tournamentPlayers);
}

{
  const tournamentPlayers = new Map();
  const playerIds = [1, 2, 3, 4];
  const players = [
    { name: "Team A", bgColor: "red", textColor: "black" },
    { name: "Team B", bgColor: "blue", textColor: "white" },
    { name: "Team C", bgColor: "green", textColor: "black" },
    { name: "Team D", bgColor: "orange", textColor: "white" },
  ];
  for (let i = 0; i < playerIds.length; i++) {
    tournamentPlayers.set(playerIds[i], players[i]);
  }
  userData.set("fourManTournament", tournamentPlayers);
}

{
  const tournamentPlayers = new Map();
  const playerIds = [1, 2, 3, 4, 5];
  const players = [
    { name: "Team A", bgColor: "red", textColor: "black" },
    { name: "Team B", bgColor: "blue", textColor: "white" },
    { name: "Team C", bgColor: "green", textColor: "black" },
    { name: "Team D", bgColor: "orange", textColor: "white" },
    { name: "Team E", bgColor: "purple", textColor: "red" },
  ];
  for (let i = 0; i < playerIds.length; i++) {
    tournamentPlayers.set(playerIds[i], players[i]);
  }
  userData.set("fiveManTournament", tournamentPlayers);
}

{
  const tournamentPlayers = new Map();
  const playerIds = [1, 2, 3, 4, 5, 6, 7, 8];
  const players = [
    { name: "Team A", bgColor: "red", textColor: "black" },
    { name: "Team B", bgColor: "blue", textColor: "white" },
    { name: "Team C", bgColor: "green", textColor: "black" },
    { name: "Team D", bgColor: "orange", textColor: "white" },
    { name: "Team E", bgColor: "purple", textColor: "red" },
    { name: "Team F", bgColor: "pink", textColor: "black" },
    { name: "Team G", bgColor: "yellow", textColor: "black" },
    { name: "Team H", bgColor: "brown", textColor: "white" },
  ];
  for (let i = 0; i < playerIds.length; i++) {
    tournamentPlayers.set(playerIds[i], players[i]);
  }
  userData.set("eightManTournament", tournamentPlayers);
}

{
  const tournamentPlayers = new Map();
  const playerIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
  const players = [
    { name: "Team A", bgColor: "red", textColor: "black" },
    { name: "Team B", bgColor: "blue", textColor: "white" },
    { name: "Team C", bgColor: "green", textColor: "black" },
    { name: "Team D", bgColor: "orange", textColor: "white" },
    { name: "Team E", bgColor: "purple", textColor: "red" },
    { name: "Team F", bgColor: "pink", textColor: "black" },
    { name: "Team G", bgColor: "yellow", textColor: "black" },
    { name: "Team H", bgColor: "brown", textColor: "white" },
    { name: "Team I", bgColor: "red", textColor: "black" },
    { name: "Team J", bgColor: "blue", textColor: "white" },
    { name: "Team K", bgColor: "green", textColor: "black" },
    { name: "Team L", bgColor: "orange", textColor: "white" },
    { name: "Team M", bgColor: "purple", textColor: "red" },
    { name: "Team N", bgColor: "pink", textColor: "black" },
    { name: "Team O", bgColor: "yellow", textColor: "black" },
    { name: "Team P", bgColor: "brown", textColor: "white" },
  ];
  for (let i = 0; i < playerIds.length; i++) {
    tournamentPlayers.set(playerIds[i], players[i]);
  }
  userData.set("sixteenManTournament", tournamentPlayers);
}

Deno.test("2 man Tournament bracket created for when started", () => {
  const bracket = generateRoundData(userData, "twoManTournament");
  assertEquals(bracket.length, 1);
  assertEquals(bracket[0].seeds.length, 1);
  assertEquals(bracket[0].title, "Finals");
});

Deno.test("4 man Tournament bracket created for when started", () => {
  const bracket = generateRoundData(userData, "fourManTournament");
  assertEquals(bracket.length, 2);
  assertEquals(bracket[0].seeds.length, 2);
  assertEquals(bracket[0].title, "Semi Finals");
});

Deno.test("8 man Tournament bracket created for when started", () => {
  const bracket = generateRoundData(userData, "eightManTournament");
  assertEquals(bracket.length, 3);
  assertEquals(bracket[0].seeds.length, 4);
  assertEquals(bracket[0].title, "Quarter Finals");
});

Deno.test("16 man Tournament bracket created for when started", () => {
  const bracket = generateRoundData(userData, "sixteenManTournament");
  assertEquals(bracket.length, 4);
  assertEquals(bracket[0].seeds.length, 8);
  assertEquals(bracket[0].title, "Round of 16");
});

Deno.test("Can choose to add bots or byes", () => {
  generateRoundData(userData, "fourManTournament", true);
  generateRoundData(userData, "fourManTournament", false);
  assertEquals(true, true);
});

Deno.test(
  "If chosen to add bots, bots will be added if not enough players",
  () => {
    const botName = "Bot";
    const bracket = generateRoundData(userData, "fiveManTournament", true);

    assertEquals(bracket[0].seeds[1].teams[1].name.includes(botName), true);
    assertEquals(bracket[0].seeds[2].teams[1].name.includes(botName), true);
    assertEquals(bracket[0].seeds[3].teams[1].name.includes(botName), true);
  }
);

Deno.test(
  "If chosen to have byes, empty spaces will be null, and players without opponents will move on to the next round in the right position",
  () => {
    const bracket = generateRoundData(userData, "fiveManTournament", false);

    assertEquals(bracket[0].seeds[1].teams[1], null);
    assertEquals(bracket[0].seeds[2].teams[1], null);
    assertEquals(bracket[0].seeds[3].teams[1], null);

    const firstPlayer = bracket[0].seeds[1].teams[0];
    const secondPlayer = bracket[0].seeds[2].teams[0];
    const thirdPlayer = bracket[0].seeds[3].teams[0];

    assertEquals(bracket[1].seeds[0].teams[1], firstPlayer);
    assertEquals(bracket[1].seeds[1].teams[0], secondPlayer);
    assertEquals(bracket[1].seeds[1].teams[1], thirdPlayer);
  }
);

Deno.test(
  "Adding a match result, moves them to the next round, in the proper position",
  async () => {
    const tournamentID = "eightManTournament";
    const score = [3, 2];
    const tournaments = new Map();
    tournaments.set(tournamentID, generateRoundData(userData, tournamentID));
    const currBracket = tournaments.get(tournamentID);
    let match = 0;
    for (let i = 0; i < currBracket[0].seeds.length; i++) {
      if (
        currBracket[0].seeds[i].teams.some((team) => team.name === "Team A")
      ) {
        match = i;
        break;
      }
    }
    const result = { winner: 1, round: 0, roundMatch: match, score: score };
    tournaments.set(
      tournamentID,
      await updateTournamentBracket(tournaments, tournamentID, result, userData)
    );
    assertEquals(
      tournaments.get(tournamentID)[1].seeds[Math.floor(match / 2)].teams[
        match % 2
      ].name === "Team A",
      true
    );
  }
);

Deno.test("Match score is updated properly", async () => {
  const tournamentID = "eightManTournament";
  const score = [3, 2];
  const tournaments = new Map();
  tournaments.set(tournamentID, generateRoundData(userData, tournamentID));
  const currBracket = tournaments.get(tournamentID);
  let match = 0;
  for (let i = 0; i < currBracket[0].seeds.length; i++) {
    if (currBracket[0].seeds[i].teams.some((team) => team.name === "Team A")) {
      match = i;
      break;
    }
  }
  const result = { winner: 1, round: 0, roundMatch: match, score: score };
  tournaments.set(
    tournamentID,
    await updateTournamentBracket(tournaments, tournamentID, result, userData)
  );
  assertEquals(tournaments.get(tournamentID)[0].seeds[match].score, [3, 2]);
});

Deno.test("Can play out whole tournament", async () => {
  const tournamentID = "fourManTournament";
  const tournaments = new Map();
  tournaments.set(
    tournamentID,
    generateRoundData(userData, tournamentID, false, 1)
  );
  const result = { winner: 1, round: 0, roundMatch: 1, score: [3, 2] };
  tournaments.set(
    tournamentID,
    await updateTournamentBracket(tournaments, tournamentID, result, userData)
  );
  const result2 = { winner: 4, round: 0, roundMatch: 0, score: [0, 3] };
  tournaments.set(
    tournamentID,
    await updateTournamentBracket(tournaments, tournamentID, result2, userData)
  );
  const result3 = { winner: 4, round: 1, roundMatch: 0, score: [3, 1] };
  tournaments.set(
    tournamentID,
    await updateTournamentBracket(tournaments, tournamentID, result3, userData)
  );
  assertEquals(true, true);
});

// when all matches are done in round, current bracket changes

// winner at the end
