module.exports = require('webrtc-core').bdsft.Model(Authentication);

var Utils = require('webrtc-core').utils;

function Authentication(eventbus, debug, configuration, sipstack) {
  var self = {};

  self.props = ['userid', 'alert', 'authUserid', 'password', 'classes', 'visible'];

  self.bindings = {
    'classes': {
      authentication: 'visible',
      sipstack: 'callState'
    }
  }

  self.listeners = function(authenticationDatabinder) {
    authenticationDatabinder.onModelPropChange('visible', function(visible) {
      if (visible) {
        self.authUserid = configuration.authenticationUserid;
        self.userid = configuration.userid;
      }
    });
    eventbus.on('registrationFailed', function(e) {
      var statusCode = e.data.response.status_code;
      debug('registration failed : ' + statusCode + ', ' + configuration.userid + ', ' + configuration.password);
      if ((statusCode === 403 && configuration.userid && !configuration.password) || configuration.register) {
        eventbus.emit('authenticationFailed', self);
      }
    });
  };

  self.authenticate = function() {
    if (!self.userid) {
      self.alert = "Invalid User ID";
      return;
    }
    eventbus.emit('authenticate', {
      userId: self.userid,
      authenticationUserId: self.authUserid,
      password: self.password
    })
    eventbus.once("registered", function() {
      if (self.authUserid && configuration.userid !== self.authUserid) {
        configuration.authenticationUserid = self.authUserid;
      }
      configuration.userid = self.userid;
      configuration.password = self.password;
    });
  };

  return self;
}