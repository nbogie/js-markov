let dict;
let previousTexts;

function regenerate(){
  let outputElem = document.querySelector('#output');
  let txt = generateSample(dict, 40);
  outputElem.innerText = txt;
  
  previousTexts.push(txt);
  
  let histElem = document.querySelector('#history');
  let oneHistElem = document.createElement('div');

  oneHistElem.innerText = txt;
  histElem.prepend(oneHistElem);
}

function setup(){
  createCanvas(windowWidth, windowHeight);
  previousTexts = [];
  let inputText = document.querySelector('#input').innerText;
  dict = buildInput(inputText);
  document.querySelector('#genButton').addEventListener('click', regenerate);
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