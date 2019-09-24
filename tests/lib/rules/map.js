'use strict';

var rule = require('../../../lib/rules/map');

var RuleTester = require('eslint').RuleTester;

var ruleTester = new RuleTester();

ruleTester.run('convert lodash map to array map', rule, {
  valid: [
    {
      code: 'var _= {map: function(){}}; _.map(collection, fn);',
    },
    {
      code:
        'var _ = require("lodash"); _= {map: function(){}}; _.map(collection, fn);',
    },
    {
      code: '_.map({ a:1, b:2 }, fn);',
    },
    {
      code: 'function fn(_) { _.map(a, fn); }',
    },
    {
      code: 'Array.isArray(a) ? a.map(fn) : _.map(a, fn)',
    },
  ],

  invalid: [
    {
      code: '_.map(collection, fn)',
      errors: [{ messageId: 'convertToArrayMap' }],
    },
    {
      code:
        '_ = {map: function(){}}; _ = require("lodash"); _.map(collection, fn);',
      errors: [{ messageId: 'convertToArrayMap' }],
    },
    {
      code: '_.map(collection, fn); _.map(collection, fn);',
      errors: [
        { messageId: 'convertToArrayMap' },
        { messageId: 'convertToArrayMap' },
      ],
    },
    {
      code: '_.map(collection, fn); _ = {}; _.map(collection, fn);',
      errors: [{ messageId: 'convertToArrayMap' }],
    },
  ],
});
