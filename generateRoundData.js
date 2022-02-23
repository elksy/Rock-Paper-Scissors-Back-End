function generateRoundData(players, includeBots = false) {
  const rounds = [];
  const numOfRounds = Math.ceil(Math.log2(players.length));
  let numOfMatches = 1;
  let id = 2 ** numOfRounds - 1;
  let roundNameIndex = 0;
  const roundNames = ["Finals", "Semi Final", "Quarter Finals", "Round of 16"];

  function makeSeed(id) {
    return {
      id: id,
      teams: [],
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

  function shuffle(array, seed = Date.now()) {
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

  function fillForMissingPlayers() {
    while (players.length < numOfMatches) {
      if (includeBots) {
        players.push({
          name: "Bot" + players.length,
          bgColor: "Grey",
          textColor: "White",
        });
      } else {
        players.push(null);
      }
    }
  }

  function seedPlayers() {
    let index = 0;
    for (let i = 0; i < 2; i++) {
      for (const seed of rounds[0].seeds) {
        seed.teams.push(players[index]);
        index++;
      }
    }
  }

  function resolveByes() {
    for (let i = 0; i < rounds[0].seeds.length; i++) {
      if (rounds[0].seeds[i].teams[1] === null) {
        if (i % 2) {
          rounds[1].seeds[Math.floor(i / 2)].teams[1] =
            rounds[0].seeds[i].teams[0];
        } else {
          rounds[1].seeds[Math.floor(i / 2)].teams[0] =
            rounds[0].seeds[i].teams[0];
        }
      }
    }
  }
  function startTournament() {
    createRounds();
    players = shuffle(players);
    fillForMissingPlayers();
    seedPlayers();
    resolveByes();
  }

  startTournament();

  return rounds;
}

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
