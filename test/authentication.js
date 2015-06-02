var jsdom = require('mocha-jsdom');
expect = require('expect');
jsdom({});

describe('authentication', function() {

    before(function() {
        core = require('webrtc-core');
        testUA = core.testUA;
        testUA.createCore('cookieconfig');
        testUA.createCore('sipstack');
        testUA.createModelAndView('authentication', {
            authentication: require('../')
        });
        eventbus = bdsft_client_instances.test.eventbus;
        testUA.mockWebRTC();
    });

    it('show and hide', function() {
        authentication.visible = true;
        expect(authentication.classes.indexOf('authentication-shown')).toNotEqual(-1);
        testUA.isVisible(authenticationview.authPopup, true);
        authentication.visible = false;
        testUA.isVisible(authenticationview.authPopup, false);
    });

    it('on 403 : with settingUserId:', function() {
        cookieconfig.userid = '12345';
        testUA.connect();
        testUA.registrationFailed(403);
        expect(authentication.visible).toEqual(true);
        expect(authenticationview.userid.val()).toEqual('12345');
        expect(authenticationview.authUserid.val()).toEqual('');
        expect(authenticationview.password.val()).toEqual('');
        testUA.val(authenticationview.password, "121212");
        authenticationview.ok.trigger("click");
        expect(authentication.visible).toEqual(false);
        expect(sipstack.ua.configuration.uri.toString()).toEqual('sip:12345@' + sipstack.domainFrom);
        expect(sipstack.ua.configuration.authorization_user).toEqual('12345');
        expect(cookieconfig.userid).toEqual('12345', 'should NOT change configuration userId : ' + cookieconfig.userid);
        expect(cookieconfig.authenticationUserid).toEqual(undefined, 'should NOT set configuration authenticationUserId : ' + cookieconfig.authenticationUserid);
        expect(cookieconfig.password).toEqual(undefined, 'should NOT set configuration password : ' + cookieconfig.password);
        testUA.registered();
        expect(cookieconfig.userid).toEqual('12345', 'should NOT change configuration userId : ' + cookieconfig.userid);
        expect(cookieconfig.authenticationUserid).toEqual(undefined, 'should NOT set configuration authenticationUserId as same as userId : ' + cookieconfig.authenticationUserid);
        expect(cookieconfig.password).toEqual('121212', 'should set configuration password : ' + cookieconfig.password);
    });

    it('on 403 : with settingUserId and settingAuthenticationUserId:', function() {
        cookieconfig.userid = '12345';
        cookieconfig.authenticationUserid = '54321';
        cookieconfig.password = '';
        testUA.connect();
        expect(authentication.visible).toEqual(false);
        testUA.registrationFailed(403);
        testUA.val(authenticationview.password, "121212");
        expect(authentication.password).toEqual('121212');
        authenticationview.ok.trigger("click");
        expect(authentication.visible).toEqual(false);
        expect(sipstack.ua.configuration.uri.toString()).toEqual('sip:12345@' + sipstack.domainFrom);
        expect(sipstack.ua.configuration.authorization_user).toEqual('54321');
        expect(cookieconfig.userid).toEqual('12345', 'should NOT change configuration userId');
        expect(cookieconfig.authenticationUserid).toEqual('54321', 'should NOT change configuration authenticationUserId');
        expect(cookieconfig.password).toEqual('', 'should NOT set configuration password : ' + cookieconfig.password);
        testUA.registered();
        expect(cookieconfig.userid).toEqual('12345', 'should NOT change configuration userId');
        expect(cookieconfig.authenticationUserid).toEqual('54321', 'should NOT change configuration authenticationUserId as same as userId');
        expect(cookieconfig.password).toEqual('121212', 'should set configuration password');
    });

    it('on 403 : with settingUserId and authUserId changed', function() {
        cookieconfig.userid = '12345';
        testUA.connect();
        testUA.registrationFailed(403);
        testUA.val(authenticationview.authUserid, "54321");
        testUA.val(authenticationview.password, "121212");
        authenticationview.ok.trigger("click");
        expect(sipstack.ua.configuration.authorization_user).toEqual('54321');
        testUA.registered();
        expect(cookieconfig.userid).toEqual('12345', 'should NOT change configuration userId');
        expect(cookieconfig.authenticationUserid).toEqual('54321', 'should set configuration authenticationUserId');
        expect(cookieconfig.password).toEqual('121212', 'should set configuration password');
    });

    it('on 403 : with settingUserId and userId and authUserId changed', function() {
        cookieconfig.userid = '12345';
        testUA.connect();
        testUA.registrationFailed(403);
        testUA.val(authenticationview.userid, "23456");
        testUA.val(authenticationview.authUserid, "54321");
        testUA.val(authenticationview.password, "121212");
        authenticationview.ok.trigger("click");
        expect(sipstack.ua.configuration.uri.toString()).toEqual('sip:23456@' + sipstack.domainFrom);
        expect(sipstack.ua.configuration.authorization_user).toEqual('54321');
        testUA.registered();
        expect(cookieconfig.userid).toEqual('23456', 'should change configuration userId');
        expect(cookieconfig.authenticationUserid).toEqual('54321', 'should set configuration authenticationUserId');
        expect(cookieconfig.password).toEqual('121212', 'should set configuration password');
    });

    it('123:on 403 : with settingUserId and configurationAuthenticationUserId and userId changed', function() {
        cookieconfig.userid = '12345';
        cookieconfig.authenticationUserid = '54321';
        testUA.connect();
        testUA.registrationFailed(403);
        testUA.val(authenticationview.userid, "12345");
        testUA.val(authenticationview.authUserid, "98765");
        testUA.val(authenticationview.password, "121212");
        authenticationview.ok.trigger("click");
        expect(sipstack.ua.configuration.authorization_user).toEqual('98765');
        testUA.registered();
        expect(cookieconfig.userid).toEqual('12345', 'should NOT change configuration userId');
        expect(cookieconfig.authenticationUserid).toEqual('98765', 'should change configuration authenticationUserId');
        expect(cookieconfig.password).toEqual('121212', 'should set configuration password');
    });

    it('on 403 : with settingPassword and settingUserId', function() {
        cookieconfig.userid = '12345';
        cookieconfig.password = 'password';
        testUA.connect();
        expect(authentication.visible).toEqual(false);
        testUA.registrationFailed(403);
        expect(authentication.visible).toEqual(false);
    });

    it('on 403 : with settingAuthenticationUserId and settingPassword and settingUserId', function() {
        cookieconfig.userid = '12345';
        cookieconfig.authenticationUserid = '54321';
        cookieconfig.password = 'password';
        testUA.connect();
        expect(authentication.visible).toEqual(false);
        testUA.registrationFailed(403);
        expect(authentication.visible).toEqual(false);
    });

    it('on non 403', function() {
        cookieconfig.userid = '12345';
        testUA.connect();
        expect(authentication.visible).toEqual(false);
        testUA.registrationFailed(404);
        expect(authentication.visible).toEqual(false);
    });

    it('authenticate and registered', function() {
        authentication.visible = true;
        authentication.userid = 'testuserid';
        authentication.password = 'testpassword';
        authentication.authenticate();
        eventbus.emit('registered');
        expect(cookieconfig.password).toEqual('testpassword');
        expect(cookieconfig.userid).toEqual('testuserid');
        expect(authentication.visible).toEqual(false);
    });    

    it('on registered', function() {
        authentication.visible = true;
        eventbus.emit('registered');
        expect(authentication.visible).toEqual(false);
    });    
});