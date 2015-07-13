module.exports = require('webrtc-core').bdsft.View(AuthenticationView, {
  template: require('../../js/templates'),
  style: require('../../js/styles')
});

var Utils = require('webrtc-core').utils;
var Constants = require('webrtc-core').constants;

function AuthenticationView(authentication) {
  var self = {};

  self.model = authentication;

  self.elements = ['signIn', 'signOut', 'userid', 'authenticationUserid', 'password'];

  self.listeners = function() {
    self.password.keypress(function(e) {
      if (e.keyCode === 13) {
        e.preventDefault();
        self.password.trigger('change');
        authentication.signIn();
      }
    });
    self.signIn.bind('click', function(e) {
      e.preventDefault();
      authentication.signIn();
    });
    self.signOut.bind('click', function(e) {
      e.preventDefault();
      authentication.signOut();
    });

    self.view.bind('keypress', function(e) {
      if (e.which === 13) {
        self.signIn.click();
      }
    });
  };

  return self;
}