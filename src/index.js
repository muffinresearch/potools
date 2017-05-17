var htmlparser = require('htmlparser2');
var walkers = require('walkers');
var render = require('dom-serializer');

const unicodeFrom = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const unicodeTo = 'ȦƁƇḒḖƑƓĦĪĴĶĿḾȠǾƤɊŘŞŦŬṼẆẊẎẐȧƀƈḓḗƒɠħīĵķŀḿƞǿƥɋřşŧŭṽẇẋẏẑ';
const mirrorFrom = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+\\|`~[{]};:'\",<.>/?";
const mirrorTo = "ɐqɔpǝɟƃɥıɾʞʅɯuodbɹsʇnʌʍxʎz∀ԐↃᗡƎℲ⅁HIſӼ⅂WNOԀÒᴚS⊥∩ɅＭX⅄Z0123456789¡@#$%ᵥ⅋⁎)(-_=+\\|,~]}[{;:,„´>.</¿";

// Currently matches:
// %(placeholder)s
// %(placeholder)d
// %s %d
const placeholderRx = /%\([\s\S]+?\)[sd]|%[sd]|\{\w+\}/g;

function splitText(input) {
  const parts = [];
  let pos = 0;
  let match;
  while ((match = placeholderRx.exec(input)) != null) {
    if (pos < match.index) {
      // Push the non-matching string into the list.
      parts.push({value: input.substr(pos, match.index - pos), type: 'text'});
    }
    // push the matching parts piece on the parts array.
    parts.push({value: match[0], type: 'placeholder'});
    pos = match.index + match[0].length;
  }
  if (pos < input.length) {
    parts.push({value: input.substr(pos, input.length - pos), type: 'text'});
  }
  return parts;
}

function mirror(inputString) {
  let trans = '';
  for (var i = inputString.length - 1; i >= 0; i--) {
    let idx = mirrorFrom.indexOf(inputString.charAt(i));
    if (idx > -1) {
      trans += mirrorTo[idx];
    } else {
      trans += inputString[i];
    }
  }
  return trans;
}

function unicode(inputString) {
  let trans = '';
  for (var i = 0, j = inputString.length; i < j; i++) {
    const char = inputString.charAt(i);
    const idx = unicodeFrom.indexOf(char);
    if (idx > 0) {
      trans += unicodeTo[idx];
    } else {
      trans += char;
    }
  }
  return trans;
}

function transformText(input, { format = 'unicode' } = {}) {
  const tokens = splitText(input);
  let string = [];
  for (token of tokens) {
    if (token.type == 'text') {
      string.push(format === 'unicode' ? unicode(token.value) : mirror(token.value));
    } else {
      string.push(token.value);
    }
  }
  if (format === 'mirror') {
    string.reverse();
  }
  return string.join('');
}

function unicodeTransformText(input) {
  return transformText(input, { format: 'unicode' });
}

function mirrorTransformText(input) {
  return transformText(input, { format: 'mirror' });
}

function wrapper(node){
  return {
    name: 'wrapper',
    data: 'wrapper',
    type: 'wrapper',
    children: node,
    next: null,
    prev: null,
    parent: null
  };
}

function walkAst(node, callback, finish, { reverse = false, wrap = true }) {
  if (wrap) {
    node = wrapper(node);
  }
  callback(node);
  if (node.hasOwnProperty('children')) {
    if (reverse) {
      node.children.reverse();
    }
    node = node.children[0];
  } else {
    node = null;
  }
  while (node) {
    walkAst(node, callback, false, { wrap: false, reverse });
    node = reverse ? node.prev : node.next;
  }
  if (typeof finish === 'function') {
    finish();
  }
};

function transform(input, { reverse = false } = {}) {
  let data;
  var handler = new htmlparser.DomHandler((error, dom) => {
    if (error) {
      console.error(error);
    } else {
       walkAst(dom, (node) => {
        if (node.type == 'text') {
          node.data = reverse ? mirrorTransformText(node.data) : unicodeTransformText(node.data);
        }
      }, () => {
        data = dom;
      }, { reverse });
    }
  });
  var parser = new htmlparser.Parser(handler);
  parser.write(input);
  parser.done();
  return render(data);
}

function mirrorTransform(input) {
  return transform(input, { reverse: true });
}

function unicodeTransform(input) {
  return transform(input, { reverse: false });
}

function skadoosh(config) {
  console.log(config);
}

module.exports = {
  skadoosh: skadoosh,
  splitText: splitText,
  unicode: unicode,
  mirror: mirror,
  unicodeTransform: unicodeTransform,
  mirrorTransform: mirrorTransform,
};
