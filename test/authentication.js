test = require('../node_modules/webrtc-sipstack/test/includes/common')(require('../node_modules/webrtc-core/test/includes/common'));
describe('authentication', function() {

    before(function() {
        test.createCore('cookieconfig');
        test.createModelAndView('sipstack', {
            sipstack: require('webrtc-sipstack')
        });
        test.createModelAndView('authentication', {
            authentication: require('../'),
            sipstack: require('webrtc-sipstack')
        });
    });

    it('show and hide', function() {
        authentication.visible = true;
        expect(authentication.classes.indexOf('authentication-shown')).toNotEqual(-1);
        test.isVisible(authenticationview.view.find('.classes:first'), true);
        authentication.visible = false;
        test.isVisible(authenticationview.view.find('.classes:first'), false);
    });

    it('enableAuthenticationUserid', function() {
        var element = authenticationview.view.find('.authenticationUseridRow');
        test.equalCss(element, 'display', 'none');
        authentication.enableAuthenticationUserid = true;
        test.equalCss(element, 'display', '');
        authentication.enableAuthenticationUserid = false;
        test.equalCss(element, 'display', 'none');
    });

    it('persist with userid set:', function() {
        authentication.userid = 'someuserid';
        expect(authenticationview.userid.val()).toEqual('someuserid');
        expect(cookieconfig.userid).toEqual("someuserid");
        expect(cookieconfig.password).toEqual(undefined);
    });

    it('cookieconfig.password change', function() {
        cookieconfig.password = 'testpassword';
        expect(authentication.password).toEqual('testpassword');
        expect(cookieconfig.password).toEqual('testpassword');
        authentication.password = undefined;
    });

    it('persist with password set', function() {
        authentication.password = '121212';
        expect(cookieconfig.password).toEqual('121212');
        expect(authentication.password).toEqual('121212');
        expect(cookieconfig.password).toEqual('121212');
        expect(authentication.password).toEqual('121212');
        authentication.password = undefined;
    });

    it('on 403 : with settingUserId:', function() {
        cookieconfig.userid = '12345';
        test.connect();
        test.registrationFailed(403);
        expect(authentication.visible).toEqual(true);
        expect(authenticationview.userid.val()).toEqual('12345');
        expect(authenticationview.authenticationUserid.val()).toEqual('');
        expect(authenticationview.password.val()).toEqual('');
        test.val(authenticationview.password, "121212");
        authenticationview.signIn.trigger("click");
        expect(authentication.visible).toEqual(false);
        expect(sipstack.ua.configuration.uri.toString()).toEqual('sip:12345@' + sipstack.domainFrom);
        expect(sipstack.ua.configuration.authorization_user).toEqual('12345');
        expect(cookieconfig.userid).toEqual('12345', 'should NOT change configuration userId : ' + cookieconfig.userid);
        expect(cookieconfig.authenticationUserid).toEqual(undefined, 'should NOT set configuration authenticationUserId : ' + cookieconfig.authenticationUserid);
        expect(cookieconfig.password).toEqual('121212', 'should set configuration password : ' + cookieconfig.password);
        test.registered();
        expect(cookieconfig.userid).toEqual('12345', 'should NOT change configuration userId : ' + cookieconfig.userid);
        expect(cookieconfig.authenticationUserid).toEqual(undefined, 'should NOT set configuration authenticationUserId as same as userId : ' + cookieconfig.authenticationUserid);
        expect(cookieconfig.password).toEqual('121212', 'should set configuration password : ' + cookieconfig.password);
    });

    it('on 403 : with settingUserId and settingAuthenticationUserId:', function() {
        authentication.visible = false;
        authentication.userid = '12345';
        authentication.authenticationUserid = '54321';
        authentication.password = undefined;
        test.connect();
        expect(authentication.visible).toEqual(false);
        test.registrationFailed(403);
        test.val(authenticationview.password, "121212");
        expect(authentication.password).toEqual('121212');
        expect(cookieconfig.password).toEqual('121212');
        authenticationview.signIn.trigger("click");
        expect(authentication.visible).toEqual(false);
        expect(sipstack.ua.configuration.uri.toString()).toEqual('sip:12345@' + sipstack.domainFrom);
        expect(sipstack.ua.configuration.authorization_user).toEqual('54321');
        expect(cookieconfig.userid).toEqual('12345', 'should NOT change configuration userId');
        expect(cookieconfig.authenticationUserid).toEqual('54321', 'should NOT change configuration authenticationUserId');
        expect(cookieconfig.password).toEqual('121212', 'should NOT set configuration password : ' + cookieconfig.password);
        test.registered();
        expect(cookieconfig.userid).toEqual('12345', 'should NOT change configuration userId');
        expect(cookieconfig.authenticationUserid).toEqual('54321', 'should NOT change configuration authenticationUserId as same as userId');
        expect(cookieconfig.password).toEqual('121212', 'should set configuration password');
    });

    it('on 403 : with settingUserId and authenticationUserid changed', function() {
        cookieconfig.userid = '12345';
        test.connect();
        test.registrationFailed(403);
        test.val(authenticationview.authenticationUserid, "54321");
        test.val(authenticationview.password, "121212");
        authenticationview.signIn.trigger("click");
        expect(sipstack.ua.configuration.authorization_user).toEqual('54321');
        test.registered();
        expect(cookieconfig.userid).toEqual('12345', 'should NOT change configuration userId');
        expect(cookieconfig.authenticationUserid).toEqual('54321', 'should set configuration authenticationUserId');
        expect(cookieconfig.password).toEqual('121212', 'should set configuration password');
    });

    it('on 403 : with settingUserId and userId and authenticationUserid changed', function() {
        authentication.userid = '12345';
        test.connect();
        test.registrationFailed(403);
        test.val(authenticationview.userid, "23456");
        test.val(authenticationview.authenticationUserid, "54321");
        test.val(authenticationview.password, "121212");
        authenticationview.signIn.trigger("click");
        expect(sipstack.ua.configuration.uri.toString()).toEqual('sip:23456@' + sipstack.domainFrom);
        expect(sipstack.ua.configuration.authorization_user).toEqual('54321');
        test.registered();
        expect(cookieconfig.userid).toEqual('23456', 'should change configuration userId');
        expect(cookieconfig.authenticationUserid).toEqual('54321', 'should set configuration authenticationUserId');
        expect(cookieconfig.password).toEqual('121212', 'should set configuration password');
    });

    it('123:on 403 : with settingUserId and configurationAuthenticationUserId and userId changed', function() {
        authentication.userid = '12345';
        authentication.authenticationUserid = '54321';
        test.connect();
        test.registrationFailed(403);
        test.val(authenticationview.userid, "12345");
        test.val(authenticationview.authenticationUserid, "98765");
        test.val(authenticationview.password, "121212");
        authenticationview.signIn.trigger("click");
        expect(sipstack.ua.configuration.authorization_user).toEqual('98765');
        test.registered();
        expect(cookieconfig.userid).toEqual('12345', 'should NOT change configuration userId');
        expect(cookieconfig.authenticationUserid).toEqual('98765', 'should change configuration authenticationUserId');
        expect(cookieconfig.password).toEqual('121212', 'should set configuration password');
    });

    it('on 403 : with settingPassword and settingUserId', function() {
        authentication.userid = '12345';
        authentication.password = 'password';
        test.connect();
        expect(authentication.visible).toEqual(false);
        test.registrationFailed(403);
        expect(authentication.visible).toEqual(false);
    });

    it('on 403 : with settingAuthenticationUserId and settingPassword and settingUserId', function() {
        authentication.userid = '12345';
        authentication.authenticationUserid = '54321';
        authentication.password = 'password';
        test.connect();
        expect(authentication.visible).toEqual(false);
        test.registrationFailed(403);
        expect(authentication.visible).toEqual(false);
    });

    it('on non 403', function() {
        authentication.userid = '12345';
        test.connect();
        expect(authentication.visible).toEqual(false);
        test.registrationFailed(404);
        expect(authentication.visible).toEqual(false);
    });

    it('WRTC-16 : on 404 with register = false and PAI', function() {
        sipstack.registrationStatus = undefined;
        authentication.visible = false;
        authentication.register = false;
        authentication.userid = 'wronguserid';
        test.connect();
        expect(authentication.visible).toEqual(false);
        test.registrationFailed(404);
        expect(authentication.visible).toEqual(false);
        expect(sipstack.ua.configuration.p_asserted_identity).toEqual('<sip:webguest@broadsoftlabs.com>');
    });

    it('on registrationStatus change', function() {
        authentication.register = true;
        sipstack.registrationStatus = '403'
        expect(authentication.visible).toEqual(true);
        sipstack.registered = true;
        sipstack.registrationStatus = undefined;
        expect(authentication.visible).toEqual(false);
        authentication.register = false;
    });

    it('signIn and registered', function() {
        authentication.visible = true;
        authentication.userid = 'testuserid';
        authentication.password = 'testpassword';
        authentication.signIn();
        test.registered();
        expect(cookieconfig.password).toEqual('testpassword');
        expect(cookieconfig.userid).toEqual('testuserid');
        expect(authentication.visible).toEqual(false);
    });

    it('signOut and unregistered', function() {
        authentication.visible = true;
        authentication.userid = 'testuserid';
        authentication.password = 'testpassword';
        authentication.signIn();
        test.registered();
        authentication.signOut();
        test.unregistered();
        expect(cookieconfig.password).toEqual(undefined);
        expect(cookieconfig.userid).toEqual(undefined);
        expect(authentication.visible).toEqual(false);
    });

    it('on registered', function() {
        sipstack.registered = false;
        authentication.visible = true;
        test.registered();
        expect(authentication.visible).toEqual(false);
    });
});