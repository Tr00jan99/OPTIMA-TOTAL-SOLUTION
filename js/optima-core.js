/* OPTIMA TOTAL SOLUTION - pure interaction logic (no DOM, no dependencies).
 * UMD: window.OptimaCore in the browser, module.exports in Node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.OptimaCore = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var COMPANY_NAME = 'OPTIMA TOTAL SOLUTION';
  var WHATSAPP_NUMBER = '601112234304';
  var MESSAGE_MAX = 1000;
  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Fixed error text. Never contains visitor input.
  var ERRORS = {
    name: 'Enter your name.',
    email: 'Enter a valid email address.',
    subject: 'Enter a subject.',
    message: 'Enter your message.',
    messageTooLong: 'Your message must be 1000 characters or fewer.'
  };

  function str(value) {
    return typeof value === 'string' ? value : (value == null ? '' : String(value));
  }

  /** @returns {{valid: boolean, errors: Object}} errors holds only invalid fields. */
  function validateForm(input) {
    input = input || {};
    var name = str(input.name).trim();
    var email = str(input.email).trim();
    var subject = str(input.subject).trim();
    var message = str(input.message).trim();
    var errors = {};

    if (name === '') errors.name = ERRORS.name;
    if (email === '' || !EMAIL_PATTERN.test(email)) errors.email = ERRORS.email;
    if (subject === '') errors.subject = ERRORS.subject;
    if (message === '') errors.message = ERRORS.message;
    else if (message.length > MESSAGE_MAX) errors.message = ERRORS.messageTooLong;

    return { valid: Object.keys(errors).length === 0, errors: errors };
  }

  /** @returns {string} https://wa.me/601112234304?text=<encoded> */
  function buildWhatsAppUrl(input) {
    input = input || {};
    var lines = [
      'Name: ' + str(input.name).trim(),
      'Email: ' + str(input.email).trim(),
      'Subject: ' + str(input.subject).trim(),
      'Message: ' + str(input.message).trim()
    ];
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
  }

  /** state {open}, event 'toggle' | 'linkSelected' | 'escape' */
  function menuReducer(state, event) {
    var open = !!(state && state.open);
    switch (event) {
      case 'toggle': return { open: !open };
      case 'linkSelected':
      case 'escape': return { open: false };
      default: return { open: open };
    }
  }

  /** state {open, index, count}; event {type:'open', index} | 'close' | 'next' | 'prev'
   *  (events may be given as a string or as {type}). */
  function lightboxReducer(state, event) {
    var count = state && state.count > 0 ? Math.floor(state.count) : 0;
    var index = state && isFinite(state.index) ? Math.floor(state.index) : 0;
    var open = !!(state && state.open);
    var type = event && typeof event === 'object' ? event.type : event;

    if (count === 0) return { open: false, index: 0, count: 0 };
    index = Math.min(Math.max(index, 0), count - 1);

    switch (type) {
      case 'open': {
        var requested = event && typeof event === 'object' && isFinite(event.index)
          ? Math.floor(event.index) : index;
        return { open: true, index: Math.min(Math.max(requested, 0), count - 1), count: count };
      }
      case 'close':
        return { open: false, index: index, count: count };
      case 'next':
        return { open: open, index: (index + 1) % count, count: count };
      case 'prev':
        return { open: open, index: (index - 1 + count) % count, count: count };
      default:
        return { open: open, index: index, count: count };
    }
  }

  function copyrightLine(year) {
    return '\u00A9 ' + year + ' ' + COMPANY_NAME + '. All rights reserved.';
  }

  return {
    COMPANY_NAME: COMPANY_NAME,
    WHATSAPP_NUMBER: WHATSAPP_NUMBER,
    MESSAGE_MAX: MESSAGE_MAX,
    ERRORS: ERRORS,
    validateForm: validateForm,
    buildWhatsAppUrl: buildWhatsAppUrl,
    menuReducer: menuReducer,
    lightboxReducer: lightboxReducer,
    copyrightLine: copyrightLine
  };
}));
