/* eslint-disable class-methods-use-this */
/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */

/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  this.width = width;
  this.height = height;
  this.getArea = function getArea() {
    return this.width * this.height;
  };
}

/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}

/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const obj = JSON.parse(json);
  Object.setPrototypeOf(obj, proto);
  return obj;
}

/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

class CSSSelector {
  constructor() {
    this.selector = '';
    this.hasElement = false;
    this.hasId = false;
    this.hasClass = false;
    this.hasAttr = false;
    this.hasPseudoClass = false;
    this.hasPseudoElement = false;
    this.lastPart = null;
  }

  element(value) {
    if (this.hasElement) {
      throw new Error(
        'Element, id and pseudo-element should not occur more then one time inside the selector',
      );
    }
    this.checkOrder('element');
    const newSelector = new CSSSelector();
    newSelector.selector = this.selector + value;
    newSelector.hasElement = true;
    newSelector.lastPart = 'element';
    return newSelector;
  }

  id(value) {
    if (this.hasId) {
      throw new Error(
        'Element, id and pseudo-element should not occur more then one time inside the selector',
      );
    }
    this.checkOrder('id');
    const newSelector = new CSSSelector();
    newSelector.selector = `${this.selector}#${value}`;
    newSelector.hasId = true;
    newSelector.lastPart = 'id';
    return newSelector;
  }

  class(value) {
    this.checkOrder('class');
    const newSelector = new CSSSelector();
    newSelector.selector = `${this.selector}.${value}`;
    newSelector.lastPart = 'class';
    return newSelector;
  }

  attr(value) {
    this.checkOrder('attribute');
    const newSelector = new CSSSelector();
    newSelector.selector = `${this.selector}[${value}]`;
    newSelector.lastPart = 'attribute';
    return newSelector;
  }

  pseudoClass(value) {
    this.checkOrder('pseudo-class');
    const newSelector = new CSSSelector();
    newSelector.selector = `${this.selector}:${value}`;
    newSelector.lastPart = 'pseudo-class';
    return newSelector;
  }

  pseudoElement(value) {
    if (this.hasPseudoElement) {
      throw new Error(
        'Element, id and pseudo-element should not occur more then one time inside the selector',
      );
    }
    this.checkOrder('pseudo-element');
    const newSelector = new CSSSelector();
    newSelector.selector = `${this.selector}::${value}`;
    newSelector.hasPseudoElement = true;
    newSelector.lastPart = 'pseudo-element';
    return newSelector;
  }

  combine(selector1, combinator, selector2) {
    const newSelector = new CSSSelector();
    newSelector.selector = `${selector1.selector} ${combinator} ${selector2.selector}`;
    return newSelector;
  }

  stringify() {
    return this.selector;
  }

  checkOrder(part) {
    if (
      this.lastPart
      && this.getPartIndex(part) < this.getPartIndex(this.lastPart)
    ) {
      throw new Error(
        `Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element. Invalid order: ${this.lastPart} followed by ${part}`,
      );
    }
  }

  getPartIndex(part) {
    const order = [
      'element',
      'id',
      'class',
      'attribute',
      'pseudo-class',
      'pseudo-element',
    ];
    return order.indexOf(part);
  }
}

const cssSelectorBuilder = {
  element(value) {
    return new CSSSelector().element(value);
  },

  id(value) {
    const selector = new CSSSelector();
    return selector.id(value);
  },

  class(value) {
    const selector = new CSSSelector();
    return selector.class(value);
  },

  attr(value) {
    const selector = new CSSSelector();
    return selector.attr(value);
  },

  pseudoClass(value) {
    const selector = new CSSSelector();
    return selector.pseudoClass(value);
  },

  pseudoElement(value) {
    const selector = new CSSSelector();
    return selector.pseudoElement(value);
  },

  combine(selector1, combinator, selector2) {
    const newSelector = new CSSSelector();
    return newSelector.combine(selector1, combinator, selector2);
  },
};

module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
