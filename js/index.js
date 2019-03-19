//https://www.gutenberg.org/browse/scores/top

let dict;
let previousTexts;
let generator;
let outputElem;
  
function regenerate(){
  let txt = generateSample(dict, 80);
  outputElem.innerText = txt;
  
  previousTexts.push(txt);
  
  let histElem = document.querySelector('#history');
  let oneHistElem = document.createElement('div');
  oneHistElem.innerTextcreateTextNode = txt;
  histElem.prepend(oneHistElem);
}

function resetClicked(){
  outputElem.innerText = "-";  
}

function nextClicked(){
  let [a,b] = generator.next().value;
  let spanNode = document.createElement("span");
  spanNode.innerHTML = `${a}-${b}<br/>`;
  outputElem.appendChild(spanNode);
}

function setup(){
  createCanvas(windowWidth, windowHeight);

  outputElem = document.querySelector('#output');

  document.querySelector('#genButton').addEventListener('click', regenerate);
  document.querySelector('#nextButton').addEventListener('click', nextClicked);
  document.querySelector('#resetButton').addEventListener('click', resetClicked);

  previousTexts = [];

  let inputText = document.querySelector('#input').innerText;
  
  generator = genPairs(inputText);
  
  dict = buildInput(inputText);
  
  regenerate();
  
  noLoop();
}

function getStartWord(dict){
  return random(Object.keys(dict).filter(w => w.charAt(0).toUpperCase() == w.charAt(0)));
}

function generateSample(dict, sampleLength){
  let out = [];
  let current = getStartWord(dict);
  for(let i = 0; i < sampleLength; i++){
    out.push(current);
    if (current.indexOf('.') > 0 && out.length > 8){
      break;
    }
    let choices = dict[current];
    current = random(choices);
  }
  return out.join(" ");
}
function* genPairs(txt){
  let words = txt.split(' ');
  for (let i = 0; i < words.length - 1; i++){
    yield [  words[i], words[i+1]  ];
  }
  return dict;
}

function buildInput(txt){
  let words = txt.split(' ');
  let dict = {};
  for (let i = 0; i < words.length - 1; i++){
    if (dict[words[i]]){
      dict[words[i]].push(words[i+1]);
    }  else {
      dict[words[i]] = [words[i+1]];
    }
  }
  return dict;
}

function draw(){
  fill(random(255));
  rect(random(width), random(height), 20, 20);
}