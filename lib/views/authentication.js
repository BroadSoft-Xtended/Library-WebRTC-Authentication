module.exports = require('webrtc-core').bdsft.View(AuthenticationView, {
  template: require('../../js/templates'), 
  style: require('../../js/styles')
});

var Utils = require('webrtc-core').utils;
var Constants = require('webrtc-core').constants;

function AuthenticationView(eventbus, authentication) {
  var self = {};

  self.model = authentication;
  
  self.elements = ['ok', 'userid', 'authUserid', 'password', 'alert', 'authPopup'];

  self.listeners = function() {
    self.ok.bind('click', function() {
      authentication.authenticate();
    });

    self.view.bind('keypress', function(e) {
      if (e.which === 13) {
        self.ok.click();
      }
    });
  };

  return self;
}