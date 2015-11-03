module.exports = require('bdsft-sdk-model')(Authentication, {
  config: require('../../js/config.js')
});

var Utils = require('webrtc-core').utils;

function Authentication(debug, cookieconfig, sipstack) {
  var self = {};

  var signingOut = false;

  self.props = ['userid', 'authenticationUserid', 'password', 'classes', 'visible'];

  self.bindings = {
    'classes': {
      authentication: ['visible', 'register', 'enableAuthenticationUserid'],
      sipstack: ['callState', 'registered', 'registering', 'sendVideo', 'receiveVideo']
    },
    'cookieconfig': {
      authentication: ['userid', 'password', 'authenticationUserid']
    }
  }

  self.listeners = function(databinder, sipstackDatabinder, cookieconfigDatabinder) {
    cookieconfigDatabinder.onModelPropChange(['userid', 'password', 'authenticationUserid'], function(value, name) {
      if(value) {
        self[name] = value;
      }
    });
    sipstackDatabinder.onModelPropChange('registered', function(value) {
      if(value) {
        self.hide();
      }
    });
    sipstackDatabinder.onModelPropChange('unregistering', function(value) {
      if(!value && signingOut) {
        debug.log('clear authentication after sign out');
        cookieconfig.userid = undefined;
        cookieconfig.authenticationUserid = undefined;
        cookieconfig.password = undefined;
        signingOut = false;
      }
    });
    sipstackDatabinder.onModelPropChange('registrationStatus', function(status) {
      if (status && ((status === "403" && cookieconfig.userid && !cookieconfig.password) || self.register)) {
        self.show();
      }
      // WRTC-16 : use PAI on 404 to register
      if(!self.register && status === '404' && sipstack.pAssertedIdentity) {
        cookieconfig.userid = undefined;
        cookieconfig.authenticationUserid = undefined;
      }
    });
  };

  self.signOut = function() {
    signingOut = true;
    sipstack.unregister();
  };

  self.signIn = function() {
    if (!self.userid) {
      return;
    }
    self.hide();
    cookieconfig.userid = self.userid;
    cookieconfig.authenticationUserid = self.authenticationUserid;
    cookieconfig.password = self.password;
    sipstack.register();
  };

  return self;
}