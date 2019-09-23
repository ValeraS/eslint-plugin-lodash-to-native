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
  create: function() {
    return {
      // callback functions
    };
  },
};
