'use strict';

const rule = require('../../../lib/rules/map');

const RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester();

ruleTester.run('my-rule', rule, {
  valid: [
    {
      code: 'var _= {map: function(){}}; _.map(collection, fn);',
    },
    {
      code: '_.map({ a:1, b:2 }, fn);',
    },
  ],

  invalid: [
    {
      code: '_.map(collection, fn)',
      errors: [{ messageId: 'convertToArrayMap' }],
    },
  ],
});
