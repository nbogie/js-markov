//https://www.gutenberg.org/browse/scores/top

let dict;
let previousTexts;
let generator;
let outputGenerator;
let outputElem;

function* createOutputGenerator(dict){
  let current = getStartWord(dict);
  while(true){
    let choices = dict[current];
    yield {word: current, choices: choices};
    current = random(choices);
    //continue?  if (current.indexOf('.') > 0 && out.length > 8) {
  }
}

function regenerate() {
  let txt = generateSample(dict, 80);
  outputElem.innerText = txt;

  previousTexts.push(txt);

  let histElem = document.querySelector('#history');
  let oneHistElem = document.createElement('div');
  oneHistElem.innerTextcreateTextNode = txt;
  histElem.prepend(oneHistElem);
}

function resetClicked() {
  outputElem.innerText = "";
  outputGenerator = createOutputGenerator(dict);
}

function displayChoices(word, choices){
  let choicesElem = document.querySelector('#choices');
  choicesElem.innerText = '';
  Object.keys(choices).forEach(k => {
    let li = document.createElement('li');
    li.innerText = choices[k];
    choicesElem.appendChild(li);
  });
}

function nextClicked() {
  let data = outputGenerator.next().value;
  let spanNode = document.createElement("span");
  displayChoices(data.word, data.choices);
  spanNode.innerHTML = `${data.word} `;
  outputElem.appendChild(spanNode);
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  outputElem = document.querySelector('#output');

  document.querySelector('#genButton').addEventListener('click', regenerate);
  document.querySelector('#nextButton').addEventListener('click', nextClicked);
  document.querySelector('#resetButton').addEventListener('click', resetClicked);

  previousTexts = [];

  let inputText = document.querySelector('#input').innerText;

  generator = genWordPairs(inputText);

  dict = buildInput(generator);

  outputGenerator = createOutputGenerator(dict);

  regenerate();
  noLoop();
}

function getStartWord(dict) {
  return random(Object.keys(dict).filter(w => w.charAt(0).toUpperCase() == w.charAt(0)));
}

function generateSample(dict, sampleLength) {
  let out = [];
  let current = getStartWord(dict);
  for (let i = 0; i < sampleLength; i++) {
    out.push(current);
    if (current.indexOf('.') > 0 && out.length > 8) {
      break;
    }
    let choices = dict[current];
    current = random(choices);
  }
  return out.join(" ");
}
function* genWordPairs(txt) {
  let words = txt.split(' ');
  for (let i = 0; i < words.length - 1; i++) {
    yield [words[i], words[i + 1]];
  }
}

function* genSegmentPairs(txt) {
  for (let i = 0; i < txt.length - 3; i++) {
    yield [
      txt[i] + txt[i + 1], 
      txt[i+2]+txt[i+3]
    ];
  }
}

function buildInput(generator) {
  let dict = {};
  let next = generator.next();
  while (!next.done) {
    let [w1, w2] = next.value;
    if (dict[w1]) {
      dict[w1].push(w2);
    } else {
      dict[w1] = [w2];
    }
    next = generator.next();
  }
  return dict;
}

function draw() {
  fill(random(255));
  rect(random(width), random(height), 20, 20);
}