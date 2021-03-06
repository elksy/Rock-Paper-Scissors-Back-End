// allow choose seed

function generateRoundData(
  userData,
  tournamentID,
  numOfGames,
  includeBots = false,
  shuffleSeed = 0
) {
  let players = Array.from(userData.get(tournamentID).values());
  const rounds = [];
  const numOfRounds = Math.ceil(Math.log2(players.length));
  let numOfMatches = 1;
  let id = 2 ** numOfRounds - 1;
  let roundNameIndex = 0;
  const roundNames = ["Finals", "Semi Finals", "Quarter Finals", "Round of 16"];

  function makeSeed(id) {
    return {
      id: id,
      teams: [
        { name: "", bgColor: "Grey", textColor: "Grey" },
        { name: "", bgColor: "Grey", textColor: "Grey" },
      ],
      score: [0, 0],
    };
  }

  function makeRound(roundNameIndex, seeds) {
    return {
      title: roundNames[roundNameIndex],
      seeds: seeds,
    };
  }

  function createRounds() {
    for (let i = 0; i < numOfRounds; i++) {
      const seeds = [];
      for (let j = 0; j < numOfMatches; j++) {
        seeds.unshift(makeSeed(id));
        id--;
      }
      rounds.unshift(makeRound(roundNameIndex, seeds));
      numOfMatches *= 2;
      roundNameIndex++;
    }
  }

  function fillForMissingPlayers() {
    while (players.length < numOfMatches) {
      if (includeBots) {
        players.push({
          name: "Bot" + players.length,
          bgColor: "Grey",
        });
      } else {
        players.push({
          name: "BYE",
          bgColor: "Grey",
          uuid: "2255",
        });
      }
    }
  }

  function shuffle(array, seed) {
    let currentIndex = array.length;
    let temporaryValue, randomIndex;

    let random = () => {
      var x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    while (0 !== currentIndex) {
      randomIndex = Math.floor(random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }

  function seedPlayers() {
    let index = 0;
    for (let i = 0; i < 2; i++) {
      for (const seed of rounds[0].seeds) {
        seed.teams[i] = players[index];
        index++;
      }
    }
  }

  function resolveByes() {
    for (let i = 0; i < rounds[0].seeds.length; i++) {
      if (rounds[0].seeds[i].teams[1].name === "BYE") {
        if (i % 2) {
          rounds[0].seeds[i].score = [Math.ceil(numOfGames / 2), 0];
          rounds[1].seeds[Math.floor(i / 2)].teams[1] =
            rounds[0].seeds[i].teams[0];
        } else {
          rounds[0].seeds[i].score = [Math.ceil(numOfGames / 2), 0];
          rounds[1].seeds[Math.floor(i / 2)].teams[0] =
            rounds[0].seeds[i].teams[0];
        }
      }
    }
  }

  createRounds();
  players = shuffle(players, shuffleSeed ? shuffleSeed : Date.now());
  fillForMissingPlayers();
  seedPlayers();
  resolveByes();

  return rounds;
}

// function addBotsOrByes(players, addBots = true) {
//   const numOfPlayersNeeded = 2 ** Math.ceil(Math.log2(players.length));
//   if (addBots) {
//     while (players.length < numOfPlayersNeeded) {
//       players.push({ name: "Bot", bgColor: "Grey", textColor: "White" });
//     }
//   } else {
//     while (players.length < numOfPlayersNeeded) {
//       players;
//     }
//   }
// }

export default generateRoundData;
// const players = [
//   { name: "Team A", bgColor: "red", textColor: "black" },
//   { name: "Team B", bgColor: "blue", textColor: "white" },
//   { name: "Team C", bgColor: "green", textColor: "black" },
//   { name: "Team D", bgColor: "orange", textColor: "white" },
//   { name: "Team E", bgColor: "purple", textColor: "red" },
//   { name: "Team F", bgColor: "pink", textColor: "black" },
//   { name: "Team G", bgColor: "yellow", textColor: "black" },
//   { name: "Team H", bgColor: "brown", textColor: "white" },
//   { name: "Team I", bgColor: "black", textColor: "white" },
// ];
