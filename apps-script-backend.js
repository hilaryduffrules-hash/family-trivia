// ═══════════════════════════════════════════════════════════════════════
// Trivia Night Backend — Google Apps Script
// Paste this into Extensions > Apps Script on your Google Sheet
// ═══════════════════════════════════════════════════════════════════════

const ADMIN_PASS = 'hilary21';

const ANSWERS = [
  ["1989","Gold","206","Andorra","The mitochondria","2007","Julius Caesar","Antarctica","The femur","France","12","Saturn","1998","Tea","SOS"],
  ["Appa","1995","Robin Williams","Buddy Pine","Auguste Gusteau","Sid Phillips","Rufus","Waste Allocation Load Lifter Earth-Class","A meerkat","Joy Sadness Anger Fear Disgust","Cynthia","Mr. Krabs","Casita","Bandit","Doofenshmirtz Evil Incorporated"],
  ["Poor Unfortunate Souls The Little Mermaid","For the First Time in Forever Frozen","I Won't Say I'm in Love Hercules","Can You Feel the Love Tonight The Lion King","Colors of the Wind Pocahontas","Go the Distance Hercules","Friend Like Me Aladdin","How Far I'll Go Moana","Shiny Moana","When She Loved Me Toy Story 2","This Is Halloween Nightmare Before Christmas","Surface Pressure Encanto","Try Everything Zootopia","Mother Knows Best Tangled","Touch the Sky Brave"]
];

const QUESTIONS = [
  ["What year did the Berlin Wall fall?","Which chemical element has the symbol Au?","How many bones are in the adult human body?","What is the only country that borders both France and Spain?","What is the powerhouse of the cell?","What year did the first iPhone launch?","Which Shakespeare play features 'Et tu, Brute'?","What is the largest desert in the world by total area?","What is the longest bone in the human body?","Which country gifted the Statue of Liberty to the United States?","How many sides does a dodecagon have?","Which planet has the most confirmed moons?","What year did Google officially launch?","What is the most consumed beverage after water?","In Morse code, what does ··· — ··· represent?"],
  ["In Avatar, what is Aang's flying sky bison called?","What year did the original Toy Story release?","Who voiced Genie in the original 1992 Aladdin?","In The Incredibles, what is Syndrome's real birth name?","In Ratatouille, what chef does Remy idolize?","What is the full name of the bully in Toy Story?","In Kim Possible, what is her naked mole rat sidekick called?","What does WALL-E stand for?","In The Lion King, what type of animal is Timon?","Name all 5 original emotions in Pixar's Inside Out.","In Rugrats, what is Angelica's favourite doll called?","In SpongeBob, who owns the Krusty Krab?","In Encanto, what is the Madrigal family's magical home called?","What is the name of Bluey's dad?","In Phineas and Ferb, what does Doofenshmirtz's jingle always end with?"],
  ["Clip 1 — Name the song & movie!","Clip 2 — Name the song & movie!","Clip 3 — Name the song & movie!","Clip 4 — Name the song & movie!","Clip 5 — Name the song & movie!","Clip 6 — Name the song & movie!","Clip 7 — Name the song & movie!","Clip 8 — Name the song & movie!","Clip 9 — Name the song & movie!","Clip 10 — Name the song & movie!","Clip 11 — Name the song & movie!","Clip 12 — Name the song & movie!","Clip 13 — Name the song & movie!","Clip 14 — Name the song & movie!","Clip 15 — Name the song & movie!"]
];

const ROUND_TITLES = ["Round 1: General Trivia","Round 2: Cartoons & Kids' Movies","Round 3: Name That Tune"];

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'current';
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  if (action === 'current') {
    const state = ss.getSheetByName('State').getRange('A2:B2').getValues()[0];
    const round = parseInt(state[0]) || 1;
    const qNum = parseInt(state[1]) || 1;
    return json_({
      round, questionNum: qNum, totalQuestions: 15,
      roundTitle: ROUND_TITLES[round-1],
      question: QUESTIONS[round-1] ? QUESTIONS[round-1][qNum-1] || null : null,
      correctAnswer: ANSWERS[round-1] ? ANSWERS[round-1][qNum-1] || null : null
    });
  }

  if (action === 'scores') {
    const data = ss.getSheetByName('Answers').getDataRange().getValues();
    const teams = {};
    for (let i = 1; i < data.length; i++) {
      const [ts, team, round, qNum, answer, points] = data[i];
      if (!team) continue;
      const key = team.toLowerCase().trim();
      if (!teams[key]) teams[key] = {name: team, score: 0, answers: 0};
      teams[key].score += (parseFloat(points) || 0);
      teams[key].answers++;
    }
    const board = Object.values(teams).sort((a,b) => b.score - a.score);
    return json_(board);
  }

  return json_({});
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  if (data.action === 'next') {
    if (data.password !== ADMIN_PASS) return json_({error:'unauthorized'});
    const stateSheet = ss.getSheetByName('State');
    let round = parseInt(stateSheet.getRange('A2').getValue()) || 1;
    let qNum = parseInt(stateSheet.getRange('B2').getValue()) || 1;
    if (qNum < 15) { qNum++; } else if (round < 3) { round++; qNum = 1; }
    stateSheet.getRange('A2').setValue(round);
    stateSheet.getRange('B2').setValue(qNum);
    return json_({round, question: qNum});
  }

  if (data.action === 'goto') {
    if (data.password !== ADMIN_PASS) return json_({error:'unauthorized'});
    const stateSheet = ss.getSheetByName('State');
    stateSheet.getRange('A2').setValue(Math.max(1,Math.min(3, parseInt(data.round)||1)));
    stateSheet.getRange('B2').setValue(Math.max(1,Math.min(15, parseInt(data.question)||1)));
    return json_({ok:true});
  }

  if (data.action === 'submit') {
    const { team, round, questionNum, answer, points, correctAnswer, feedback } = data;
    ss.getSheetByName('Answers').appendRow([
      new Date().toISOString(), team, 'Round '+round, questionNum,
      answer, points || 0, correctAnswer || '', feedback || ''
    ]);
    return json_({ok:true});
  }

  if (data.action === 'reset') {
    if (data.password !== ADMIN_PASS) return json_({error:'unauthorized'});
    const answersSheet = ss.getSheetByName('Answers');
    const lastRow = answersSheet.getLastRow();
    if (lastRow > 1) answersSheet.deleteRows(2, lastRow - 1);
    const stateSheet = ss.getSheetByName('State');
    stateSheet.getRange('A2').setValue(1);
    stateSheet.getRange('B2').setValue(1);
    return json_({ok:true});
  }

  return json_({error:'unknown action'});
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
