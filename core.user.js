// ==UserScript==
// @name         Fix
// @namespace    SDOSDOSDOYEAH
// @version      0.12
// @description  Hello world
// @author       Mozilla
// @grant        GM_setClipboard
// @run-at       document-end
// @match        *://localhost/*
// ==/UserScript==

(function() {
  'use strict';

  var db = [
    ['question', 2,
      [
        ['one', '1'],
        ['two', '2']
      ]
    ],

    ['question', 3, ['answer']],

    ['question', 4, ['answer1', 'answer2']],

    ['question', 1, 'answertext']
  ];

  var qTypes = {
    unknown: 0,
    text: 1,
    select: 2,
    radio: 3,
    checkbox: 4
  };

  init();

  function init() {
    qTypes = Object.freeze(qTypes);

    var questions = getQuestions();

    if (!questions) {
      return;
    }

    questions.forEach(function (q) {
      var qText = getQuestionText(q).trim();
      var aDiv = getAnswerDiv(q);
      var qType = getQuestionType(aDiv);
      var aId = findAnswer(qText, qType);

      if (aId > -1) {
        setAnswer(aDiv, aId, qType);
      }
    });
  }

  function getQuestions() {
    var q = Array.prototype.slice.call(document.getElementsByClassName('que'));

    return q.length > 0 ? q : false;
  }

  function getQuestionText(div) {
    return div.getElementsByClassName('qtext')[0].textContent;
  }

  function getAnswerDiv(div) {
    return div.getElementsByClassName('ablock')[0];
  }

  function getQuestionType(div) {
    // radio
    if (div.querySelector('input[type=radio]')) {
      return qTypes.radio;
    }

    // checkbox
    if (div.querySelector('input[type=checkbox]')) {
      return qTypes.checkbox;
    }

    // text
    if (div.querySelector('input[type=text]')) {
      return qTypes.text;
    }

    // select
    if (div.querySelector('select')) {
      return qTypes.select;
    }

    // ???
    return qTypes.unknown;
  }

  function findAnswer(questionText, questionType) {
    var answerId = -1;

    db.every(function (item, index) {

      if (item[0] === questionText && item[1] === questionType) {
        answerId = index;
        return false;
      }

      return true;
    });

    return answerId;
  }
  
  function setAnswer(answerDiv, answerId, qType) {
    var answer = db[answerId][2];

    switch (qType) {
      case qTypes.unknown: {
        break;
      }

      case qTypes.text: {
        answerDiv.querySelector('input[type=text]').value = answer;
        setClipboard(answer);

        break;
      }

      case qTypes.checkbox: {
        var checks = answerDiv.querySelectorAll('input[type=checkbox]');

        checks.forEach(function (check) {
          var text = check.parentNode.querySelector('label').textContent;

          answer.forEach(function (item) {
            if (item === text) {
              alert(item);
              check.style.marginLeft = '10px';
            }
          });

        });

        break;
      }

      case qTypes.radio: {
        var radios = answerDiv.querySelectorAll('input[type=radio]');

        radios.forEach(function (radio) {
          var text = radio.parentNode.querySelector('label').textContent;

          answer.forEach(function (item) {
            if (item === text) {
              radio.style.marginLeft = '10px';
            }
          });

        });

        break;
      }

      case qTypes.select: {
        var selects = answerDiv.querySelectorAll('select');

        selects.forEach(function (select) {
          var text = select.parentNode.parentNode.querySelector('.text').textContent;

          answer.forEach(function (questionRow) {

            if (questionRow[0] === text) {
              var options = Array.prototype.slice.call(select.querySelectorAll('option'));

              options.forEach(function (option) {
                if (questionRow[1] === option.textContent) {
                  select.value = option.value;
                }
              });
            }

          });

        });

      }
    }
  }

  function setClipboard(text) {
    GM_setClipboard(text);
  }

})();