'use strict';

import * as Lam from './lam.js';

document.addEventListener('DOMContentLoaded', () => {
  const app = new Vue({
    el: '#app',

    data: {
      inputLam: '(\\m.\\n.m n) (\\s.\\z.s (s z)) (\\s.\\z.s (s (s z)))',
      outputError: '',
    },

    computed: {
      lamTree() {
        try {
          return Lam.parse(this.inputLam);
        } catch(e) {
          this.outputError = e.toString();
          return null;
        }
      },

      uniqueLamTree() {
        return this.lamTree && Lam.uniqueVar(this.lamTree);
      },

      evalSteps() {
        return Lam.evalSteps(this.uniqueLamTree);
      },
    },
  });
});
