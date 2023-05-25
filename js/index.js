//https://www.gutenberg.org/browse/scores/top
//TODO: allow the user to explore the generation with a word-selection GUI (with auto-play if they are inactive) 
//TODO: add fast/slow/pause buttons
let dict;
let previousTexts;
let generator;
let outputGenerator;
let outputElem;
let gConfig;
let gConfigs;
let gSourceText;  //The source text will be saved here once loaded.

/**
 * @param {{ [x: string]: any; }} dict
 */
function* createOutputGenerator(dict) {
  let current = getStartWord(dict);
  while (true) {
    let choices = dict[current];
    yield { word: current, choices: choices };
    current = random(choices);
  }
}

function regenerate() {
  outputGenerator = createOutputGenerator(dict);
  outputElem.innerText = '';
  generateSample(80, gConfig.sep);

  previousTexts.push(outputElem.innerText);

  const histElem = getElementByIdOrFail('history');
  const oneHistElem = document.createElement('div');
  oneHistElem.innerText = outputElem.innerText;
  histElem.prepend(oneHistElem);
}

function resetClicked() {
  outputElem.innerText = "";
  outputGenerator = createOutputGenerator(dict);
}

/**
 * @param {{ [x: string]: string; }} choices
 */
function displayChoices(choices) {
  const choicesElem = getElementByIdOrFail('choices');
  const choicesCountElem = getElementByIdOrFail('choicesCount');
  choicesElem.innerText = '';
  const allChoices = Object.keys(choices);
  allChoices.slice(0, 10).forEach(k => {
    const li = document.createElement('li');
    li.innerText = choices[k];
    choicesElem.appendChild(li);
  });
  choicesCountElem.innerHTML = "" + allChoices.length;
}

function nextClicked() {
  const data = outputGenerator.next().value;
  const spanNode = document.createElement("span");
  displayChoices(data.choices);
  spanNode.innerHTML = `${data.word}${gConfig.sep}`;
  outputElem.appendChild(spanNode);
}

async function fetchAndStoreSourceText() {
  try {
    const response = await fetch("./source.txt");
    gSourceText = await response.text();
  } catch (error) {
    console.error("Problem loading text");
    gSourceText = undefined;
  }
}
function start() {

  fetchAndStoreSourceText().then(() => {
    if (gSourceText === undefined) {
      return;
    }
    outputElem = getElementByIdOrFail('output');
    getElementByIdOrFail('genEmes2Button').addEventListener('click', regenerateWithEmes2);
    getElementByIdOrFail('genEmes3Button').addEventListener('click', regenerateWithEmes3);
    getElementByIdOrFail('genWordsButton').addEventListener('click', regenerateWithWords);
    getElementByIdOrFail('nextButton').addEventListener('click', nextClicked);
    getElementByIdOrFail('resetButton').addEventListener('click', resetClicked);

    previousTexts = [];
    gConfigs = {
      words: { sep: ' ', genGen: wordPairGenerator },
      segments2: { sep: '', segSize: 2, genGen: segmentPairGenerator },
      segments3: { sep: '', segSize: 3, genGen: segmentPairGenerator },
    };

    gConfig = gConfigs.words;

    rebuildIx();
    regenerate();
    resetClicked();
    setInterval(nextClicked, 500);
  })

}

//TODO: don't regenerate indices, cache them
function regenerateWith(config) {
  if (gConfig !== config) {
    gConfig = config;
    rebuildIx();
  }
  regenerate();
}

function regenerateWithEmes2() {
  regenerateWith(gConfigs.segments2);
}
function regenerateWithEmes3() {
  regenerateWith(gConfigs.segments3);
}
function regenerateWithWords() {
  regenerateWith(gConfigs.words);
}

function rebuildIx() {
  generator = gConfig.genGen(gSourceText, gConfig.segSize);
  dict = buildInput(generator);
}

function getStartWord(dict) {
  return random(Object.keys(dict).filter(w => w.charAt(0).toUpperCase() == w.charAt(0)));
}

/**
 * @param {number} sampleLength
 * @param {string} spacer
 */
function generateSample(sampleLength, spacer) {
  for (let i = 0; i < sampleLength; i++) {
    //(The generator is infinite.)
    const { word } = outputGenerator.next().value;
    const spanNode = document.createElement("span");
    spanNode.innerHTML = `${word}${spacer}`;
    outputElem.appendChild(spanNode);
  }
}

/**
 * @param {string} txt
 */
function* wordPairGenerator(txt) {
  const words = txt.split(' ');
  for (let i = 0; i < words.length - 1; i++) {
    yield [words[i], words[i + 1]];
  }
}

/**
 * @param {string} txt
 * @param {number} segSize
 */
function* segmentPairGenerator(txt, segSize) {
  for (let i = 0; i < txt.length - (segSize * 2) + 1; i++) {
    yield [
      txt.slice(i, i + segSize),
      txt.slice(i + segSize, i + 2 * segSize)
    ];
  }
}

/**
 * @param {{ next: () => {value: [string, string], done: boolean}; }} generator
 */
function buildInput(generator) {
  const dict = {};
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

/**
 * @param {string} id
 * @returns element with given id
 */
function getElementByIdOrFail(id) {
  const elem = document.getElementById(id);
  if (!elem) {
    throw new Error("Can't find expected element with id: " + id);
  }
  return elem;
}


/**
 * @param {any[]} arr
 * @returns one element of the given array, at random. Or undefined if the array is empty.
 */
function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}


window.onload = start;