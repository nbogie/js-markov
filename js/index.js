//https://www.gutenberg.org/browse/scores/top
//TODO: allow the user to explore the generation with a word-selection GUI (with auto-play if they are inactive) 
let dict;
let previousTexts;
let generator;
let outputGenerator;
let outputElem;
let gConfig;
let gConfigs;

function* createOutputGenerator(dict){
  let current = getStartWord(dict);
  while(true){
    let choices = dict[current];
    yield {word: current, choices: choices};
    current = random(choices);
  }
}

function regenerate() {
  outputGenerator = createOutputGenerator(dict);
  outputElem.innerText = '';
  generateSample(outputGenerator, 80, gConfig.sep);
  
  previousTexts.push(outputElem.innerText);

  let histElem = document.querySelector('#history');
  let oneHistElem = document.createElement('div');
  oneHistElem.innerText = outputElem.innerText;
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
  spanNode.innerHTML = `${data.word}${gConfig.sep}`;
  outputElem.appendChild(spanNode);
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  outputElem = document.querySelector('#output');

  document.querySelector('#genEmes2Button').addEventListener('click', regenerateWithEmes2);
  document.querySelector('#genEmes3Button').addEventListener('click', regenerateWithEmes3);
  document.querySelector('#genWordsButton').addEventListener('click', regenerateWithWords);
  document.querySelector('#nextButton').addEventListener('click', nextClicked);
  document.querySelector('#resetButton').addEventListener('click', resetClicked);

  previousTexts = [];
  gConfigs = {
    words: {sep: ' ', genGen: wordPairGenerator},
    segments2: {sep: '', segSize: 2, genGen: segmentPairGenerator},
    segments3: {sep: '', segSize: 3, genGen: segmentPairGenerator},
  };

  gConfig = gConfigs.words;
  
  rebuildIx();
  regenerate();

  noLoop();
  resetClicked();
  setInterval(nextClicked, 500);
}

//TODO: don't regenerate indices, cache them
function regenerateWith(config){
  if (gConfig !== config){
    gConfig = config;
    rebuildIx();
  }
  regenerate();
}

function regenerateWithEmes2(){
  regenerateWith(gConfigs.segments2);
}
function regenerateWithEmes3(){
  regenerateWith(gConfigs.segments3);
}
function regenerateWithWords(){
  regenerateWith(gConfigs.words);
}

function rebuildIx(){
  let inputText = document.querySelector('#input').innerText;
  generator = gConfig.genGen(inputText, gConfig.segSize);
  dict = buildInput(generator);
}

function getStartWord(dict) {
  return random(Object.keys(dict).filter(w => w.charAt(0).toUpperCase() == w.charAt(0)));
}

function generateSample(gen, sampleLength, gSpacer) {  
  for (let i = 0; i < sampleLength; i++) {
    //generator is infinite.
    let data = outputGenerator.next().value;
    if (data.word.indexOf('.') > 0 && i.length > 8) {
      break;
    }
    let spanNode = document.createElement("span");
    spanNode.innerHTML = `${data.word}${gSpacer}`;
    outputElem.appendChild(spanNode);
  }
}

function* wordPairGenerator(txt) {
  let words = txt.split(' ');
  for (let i = 0; i < words.length - 1; i++) {
    yield [words[i], words[i + 1]];
  }
}

function* segmentPairGenerator(txt, segSize) {
  for (let i = 0; i < txt.length - (segSize * 2) + 1; i++) {
    yield [
      txt.slice(i, i+segSize), 
      txt.slice(i+segSize, i+2*segSize)
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