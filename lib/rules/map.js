'use strict';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'convert lodash map to array map',
    },
    messages: {
      convertToArrayMap: 'Convert to array map',
    },
    fixable: 'code',
    schema: [], // no options
  },
  create: function(context) {
    return {
      CallExpression: function(node) {
        if (
          isLodashMap(node, context) &&
          !isConverted(node) &&
          node.arguments[0].type !== 'ObjectExpression' &&
          node.arguments[0].type !== 'Literal'
        ) {
          context.report({
            node: node,
            messageId: 'convertToArrayMap',

            fix: function(fixer) {
              return fixer.replaceText(node, replaceWith(node, context));
            },
          });
        }
      },
    };
  },
};

function isLodashMap(node, context) {
  return (
    node.type === 'CallExpression' &&
    node.callee.type === 'MemberExpression' &&
    node.callee.object.name === '_' &&
    node.callee.property.name === 'map' &&
    node.arguments.length === 2 &&
    isLodash('_', node, context)
  );
}

function isConverted(node) {
  var parent = node.parent;
  var test = parent.test;
  return (
    parent.type === 'ConditionalExpression' &&
    parent.alternate === node &&
    test.type === 'CallExpression' &&
    test.callee.type === 'MemberExpression' &&
    test.callee.object.name === 'Array' &&
    test.callee.property.name === 'isArray' &&
    same(test.arguments[0], node.arguments[0])
  );
}

function same(a, b) {
  if (a.type !== b.type) {
    return false;
  }
  switch (a.type) {
    case 'Identifier':
      return a.name === b.name;

    case 'Literal':
      return a.value === b.value;

    case 'MemberExpression':
      return (
        a.computed === b.computed &&
        same(a.object, b.object) &&
        same(a.property, b.property)
      );
    default:
      return false;
  }
}

function isLodash(lodashName, node, context) {
  var scope = context.getScope(node);
  var reference, currentReference;
  while (scope) {
    for (var i = scope.references.length; i > 0; i--) {
      currentReference = scope.references[i - 1];
      if (
        currentReference.identifier.name === lodashName &&
        currentReference.isWrite() &&
        currentReference.identifier.start < node.start
      ) {
        reference = currentReference;
        break;
      }
    }

    if (reference) break;
    if (scope.set.has(lodashName)) break;

    scope = scope.upper;
  }
  return (
    (!reference && !scope) ||
    (reference && isRequireLodash(reference.writeExpr))
  );
}

function isRequireLodash(node) {
  return (
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    node.callee.name === 'require' &&
    node.arguments[0].type === 'Literal' &&
    /^lodash(\/core|\/collection)?$/.test(node.arguments[0].value)
  );
}

function replaceWith(node, context) {
  var sourceCode = context.getSourceCode();
  var object = sourceCode.getText(node.arguments[0]);
  var callback = sourceCode.getText(node.arguments[1]);
  var currentExpression = sourceCode.getText(node);
  var arrayExpression = object + '.map(' + callback + ')';
  var objectType = node.arguments[0].type;
  // _.map([..], fn) => [..].map(fn)
  if (objectType === 'ArrayExpression') {
    return arrayExpression;
  }

  // _.map(a, fn) => (Array.isArray(a) ? a.map(fn) : _.map(a, fn))
  if (objectType === 'Identifier') {
    return (
      '(Array.isArray(' +
      object +
      ') ? ' +
      arrayExpression +
      ' : ' +
      currentExpression +
      ')'
    );
  }

  // _.map(a(), fn) =>
  // (function() {
  //   Array.isArray(arguments[0])
  //     ? arguments[0].map(fn)
  //     : _.map(arguments[0], fn);
  // })(a())

  // prettier-ignore
  return (
    '(function() {\n' +
    '  return Array.isArray(arguments[0])\n' +
    '    ? arguments[0].map(' + callback + ')\n' +
    '    : _.map(arguments[0],' + callback + ');\n' +
    '})('+ object + ')'
  );
}
