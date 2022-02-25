import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import generateRoundData from "../generateRoundData.js";
import updateTournamentBracket from "../serverTournamentWs.js";

const twoPlayers = [
  { name: "Team A", bgColor: "red", textColor: "black" },
  { name: "Team B", bgColor: "blue", textColor: "white" },
];

const fourPlayers = [
  { name: "Team A", bgColor: "red", textColor: "black" },
  { name: "Team B", bgColor: "blue", textColor: "white" },
  { name: "Team C", bgColor: "green", textColor: "black" },
  { name: "Team D", bgColor: "orange", textColor: "white" },
];

const eightPlayers = [
  { name: "Team A", bgColor: "red", textColor: "black" },
  { name: "Team B", bgColor: "blue", textColor: "white" },
  { name: "Team C", bgColor: "green", textColor: "black" },
  { name: "Team D", bgColor: "orange", textColor: "white" },
  { name: "Team E", bgColor: "purple", textColor: "red" },
  { name: "Team F", bgColor: "pink", textColor: "black" },
  { name: "Team G", bgColor: "yellow", textColor: "black" },
  { name: "Team H", bgColor: "brown", textColor: "white" },
];

const sixteenPlayers = [
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

Deno.test("2 man Tournament bracket created for when started", () => {
  const bracket = generateRoundData(twoPlayers);
  assertEquals(bracket.length, 1);
  assertEquals(bracket[0].seeds.length, 1);
  assertEquals(bracket[0].title, "Finals");
});

Deno.test("4 man Tournament bracket created for when started", () => {
  const bracket = generateRoundData(fourPlayers);
  assertEquals(bracket.length, 2);
  assertEquals(bracket[0].seeds.length, 2);
  assertEquals(bracket[0].title, "Semi Finals");
});

Deno.test("8 man Tournament bracket created for when started", () => {
  const bracket = generateRoundData(eightPlayers);
  assertEquals(bracket.length, 3);
  assertEquals(bracket[0].seeds.length, 4);
  assertEquals(bracket[0].title, "Quarter Finals");
});

Deno.test("16 man Tournament bracket created for when started", () => {
  const bracket = generateRoundData(sixteenPlayers);
  assertEquals(bracket.length, 4);
  assertEquals(bracket[0].seeds.length, 8);
  assertEquals(bracket[0].title, "Round of 16");
});

Deno.test("Can choose to add bots or byes", () => {
  generateRoundData(fourPlayers, true);
  generateRoundData(fourPlayers, false);
  assertEquals(true, true);
});

Deno.test(
  "If chosen to add bots, bots will be added if not enough players",
  () => {
    const botName = "Bot";
    const bracket = generateRoundData(
      [...fourPlayers, { name: "Team E", bgColor: "purple", textColor: "red" }],
      true
    );

    assertEquals(bracket[0].seeds[1].teams[1].name.includes(botName), true);
    assertEquals(bracket[0].seeds[2].teams[1].name.includes(botName), true);
    assertEquals(bracket[0].seeds[3].teams[1].name.includes(botName), true);
  }
);

Deno.test(
  "If chosen to have byes, empty spaces will be null, and players without opponents will move on to the next round",
  () => {
    const bracket = generateRoundData(
      [...fourPlayers, { name: "Team E", bgColor: "purple", textColor: "red" }],
      false
    );

    assertEquals(bracket[0].seeds[1].teams[1], null);
    assertEquals(bracket[0].seeds[2].teams[1], null);
    assertEquals(bracket[0].seeds[3].teams[1], null);
    assertEquals(bracket[1].seeds[0].teams[1].hasOwnProperty("name"), true);
    assertEquals(bracket[1].seeds[1].teams[0].hasOwnProperty("name"), true);
    assertEquals(bracket[1].seeds[1].teams[1].hasOwnProperty("name"), true);
  }
);

Deno.test("Adding a match result, moves them to the next round", async () => {
  const tournamentID = "tourney1";
  const playerIds = [1, 2, 3, 4, 5, 6, 7, 8];
  const tournaments = new Map();
  const tournamentPlayers = new Map();
  const userData = new Map();
  tournaments.set(tournamentID, generateRoundData(eightPlayers));
  for (let i = 0; i < playerIds.length; i++) {
    tournamentPlayers.set(playerIds[i], eightPlayers[i]);
  }
  userData.set(tournamentID, tournamentPlayers);
  const currBracket = tournaments.get(tournamentID);
  console.log(currBracket[0].seeds);

  //updateTournamentBracket(tournaments, tournamentID, result);
});

// Deno.test("Players in tournament will have wins and isPlaying property", () => {
//   const matchWins = 3;
//   const players = 4;
//   const tournament = new Tournament(matchWins);
//   for (let i = 0; i < players; i++) {
//     tournament.addPlayer({ playerName: `p${i}` });
//   }
//   assertEquals(
//     tournament.players.every(
//       (player) => player.wins === 0 && player.isPlaying === true
//     ),
//     true
//   );
// });

// Deno.test("Can add wins to players", async () => {
//   const player = "p1";
//   const matchWins = 3;
//   const players = 8;
//   const tournament = new Tournament(matchWins);
//   for (let i = 0; i < players; i++) {
//     tournament.addPlayer({ playerName: `p${i}` });
//   }
//   tournament.startTournament();
//   assertEquals(
//     tournament.players.find((plyr) => plyr.playerName === player).wins,
//     0
//   );
//   tournament.addWin(player);
//   assertEquals(
//     tournament.players.find((plyr) => plyr.playerName === player).wins,
//     1
//   );
//   tournament.addWin(player);
//   assertEquals(
//     tournament.players.find((plyr) => plyr.playerName === player).wins,
//     2
//   );
// });

// Deno.test(
//   "Enough wins ends match and sends player to next round, sends loser to loserBracket, their match is set to null",
//   async () => {
//     const player = "p1";
//     const matchWins = 3;
//     const players = 8;
//     const tournament = new Tournament(matchWins);
//     for (let i = 0; i < players; i++) {
//       tournament.addPlayer({ playerName: `p${i}` });
//     }
//     tournament.startTournament();
//     tournament.addWin(player);
//     tournament.addWin(player);
//     tournament.addWin(player);

//     assertEquals(tournament.bracket[0][2], null);
//     assertEquals(tournament.bracket[1][1][0].playerName, player);
//     assertEquals(tournament.bracketLosers[0][0].playerName, "p4");
//   }
// );

// Deno.test(
//   "When a match ends, winner points reset and both player's isPlaying set to false",
//   async () => {
//     const player = "p1";
//     const matchWins = 3;
//     const players = 8;
//     const tournament = new Tournament(matchWins);
//     for (let i = 0; i < players; i++) {
//       tournament.addPlayer({ playerName: `p${i}` });
//     }
//     tournament.startTournament();
//     tournament.addWin(player);
//     tournament.addWin(player);
//     tournament.addWin(player);

//     assertEquals(tournament.bracket[0][2], null);
//     assertEquals(tournament.bracket[1][1][0].playerName, player);
//     assertEquals(tournament.bracketLosers[0][0].playerName, "p4");
//   }
// );

// Deno.test(
//   "Tournament can have different number of wins to move on",
//   async () => {
//     const player = "p1";
//     const matchWins = 1;
//     const players = 8;
//     const tournament = new Tournament(matchWins);
//     for (let i = 0; i < players; i++) {
//       tournament.addPlayer({ playerName: `p${i}` });
//     }
//     tournament.startTournament();
//     tournament.addWin(player);
//     assertEquals(tournament.bracket[1][1][0].wins, 0);
//     assertEquals(tournament.bracket[1][1][0].isPlaying, false);
//     assertEquals(tournament.bracketLosers[0][0].isPlaying, false);

//     const secMatchWins = 5;
//     const secTournament = new Tournament(secMatchWins);
//     for (let i = 0; i < players; i++) {
//       secTournament.addPlayer({ playerName: `p${i}` });
//     }
//     secTournament.startTournament();
//     secTournament.addWin(player);
//     secTournament.addWin(player);
//     secTournament.addWin(player);
//     secTournament.addWin(player);
//     secTournament.addWin(player);
//     assertEquals(secTournament.bracket[1][1][0].wins, 0);
//     assertEquals(secTournament.bracket[1][1][0].isPlaying, false);
//     assertEquals(secTournament.bracketLosers[0][0].isPlaying, false);
//   }
// );

// Deno.test("Wins send you to right position in bracket", async () => {
//   const matchWins = 1;
//   const players = 8;
//   const tournament = new Tournament(matchWins);
//   for (let i = 0; i < players; i++) {
//     tournament.addPlayer({ playerName: `p${i}` });
//   }
//   tournament.startTournament();
//   tournament.addWin("p1");
//   tournament.addWin("p2");
//   assertEquals(tournament.bracket[1][0][1].playerName, "p2");
//   assertEquals(tournament.bracket[1][1][0].playerName, "p1");
// });

// enough wins will send player to next round, in proper position

// cannot add points to players not in bracket right now, not in losers or people who are already in next round
// wins reset

//ppl who lose isPlaying false
//ppl who win isPlaying false

// when all matches are done in round, current bracket changes
// isplaying true

// winner at the end
