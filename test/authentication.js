var jsdom = require('mocha-jsdom');
expect = require('expect');
jsdom({});

describe('authentication', function() {

    before(function() {
        core = require('webrtc-core');
        testUA = core.testUA;
        testUA.createCore('configuration');
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
        configuration.userid = '12345';
        testUA.connect();
        testUA.registrationFailed(403);
        expect(authentication.visible).toEqual(true);
        expect(authenticationview.userid.val()).toEqual('12345');
        expect(authenticationview.authUserid.val()).toEqual('');
        expect(authenticationview.password.val()).toEqual('');
        testUA.val(authenticationview.password, "121212");
        authenticationview.ok.trigger("click");
        expect(authentication.visible).toEqual(false);
        expect(sipstack.ua.configuration.uri.toString()).toEqual('sip:12345@' + core.defaults.domainFrom);
        expect(sipstack.ua.configuration.authorization_user).toEqual('12345');
        expect(configuration.userid).toEqual('12345', 'should NOT change configuration userId : ' + configuration.userid);
        expect(configuration.authenticationUserid).toEqual(undefined, 'should NOT set configuration authenticationUserId : ' + configuration.authenticationUserid);
        expect(configuration.password).toEqual(undefined, 'should NOT set configuration password : ' + configuration.password);
        testUA.registered();
        expect(configuration.userid).toEqual('12345', 'should NOT change configuration userId : ' + configuration.userid);
        expect(configuration.authenticationUserid).toEqual(undefined, 'should NOT set configuration authenticationUserId as same as userId : ' + configuration.authenticationUserid);
        expect(configuration.password).toEqual('121212', 'should set configuration password : ' + configuration.password);
    });

    it('on 403 : with settingUserId and settingAuthenticationUserId:', function() {
        configuration.userid = '12345';
        configuration.authenticationUserid = '54321';
        configuration.password = '';
        testUA.connect();
        expect(authentication.visible).toEqual(false);
        testUA.registrationFailed(403);
        testUA.val(authenticationview.password, "121212");
        expect(authentication.password).toEqual('121212');
        authenticationview.ok.trigger("click");
        expect(authentication.visible).toEqual(false);
        expect(sipstack.ua.configuration.uri.toString()).toEqual('sip:12345@' + core.defaults.domainFrom);
        expect(sipstack.ua.configuration.authorization_user).toEqual('54321');
        expect(configuration.userid).toEqual('12345', 'should NOT change configuration userId');
        expect(configuration.authenticationUserid).toEqual('54321', 'should NOT change configuration authenticationUserId');
        expect(configuration.password).toEqual('', 'should NOT set configuration password : ' + configuration.password);
        testUA.registered();
        expect(configuration.userid).toEqual('12345', 'should NOT change configuration userId');
        expect(configuration.authenticationUserid).toEqual('54321', 'should NOT change configuration authenticationUserId as same as userId');
        expect(configuration.password).toEqual('121212', 'should set configuration password');
    });

    it('on 403 : with settingUserId and authUserId changed', function() {
        configuration.userid = '12345';
        testUA.connect();
        testUA.registrationFailed(403);
        testUA.val(authenticationview.authUserid, "54321");
        testUA.val(authenticationview.password, "121212");
        authenticationview.ok.trigger("click");
        expect(sipstack.ua.configuration.authorization_user).toEqual('54321');
        testUA.registered();
        expect(configuration.userid).toEqual('12345', 'should NOT change configuration userId');
        expect(configuration.authenticationUserid).toEqual('54321', 'should set configuration authenticationUserId');
        expect(configuration.password).toEqual('121212', 'should set configuration password');
    });

    it('on 403 : with settingUserId and userId and authUserId changed', function() {
        configuration.userid = '12345';
        testUA.connect();
        testUA.registrationFailed(403);
        testUA.val(authenticationview.userid, "23456");
        testUA.val(authenticationview.authUserid, "54321");
        testUA.val(authenticationview.password, "121212");
        authenticationview.ok.trigger("click");
        expect(sipstack.ua.configuration.uri.toString()).toEqual('sip:23456@' + core.defaults.domainFrom);
        expect(sipstack.ua.configuration.authorization_user).toEqual('54321');
        testUA.registered();
        expect(configuration.userid).toEqual('23456', 'should change configuration userId');
        expect(configuration.authenticationUserid).toEqual('54321', 'should set configuration authenticationUserId');
        expect(configuration.password).toEqual('121212', 'should set configuration password');
    });

    it('123:on 403 : with settingUserId and configurationAuthenticationUserId and userId changed', function() {
        configuration.userid = '12345';
        configuration.authenticationUserid = '54321';
        testUA.connect();
        testUA.registrationFailed(403);
        testUA.val(authenticationview.userid, "12345");
        testUA.val(authenticationview.authUserid, "98765");
        testUA.val(authenticationview.password, "121212");
        authenticationview.ok.trigger("click");
        expect(sipstack.ua.configuration.authorization_user).toEqual('98765');
        testUA.registered();
        expect(configuration.userid).toEqual('12345', 'should NOT change configuration userId');
        expect(configuration.authenticationUserid).toEqual('98765', 'should change configuration authenticationUserId');
        expect(configuration.password).toEqual('121212', 'should set configuration password');
    });

    it('on 403 : with settingPassword and settingUserId', function() {
        configuration.userid = '12345';
        configuration.password = 'password';
        testUA.connect();
        expect(authentication.visible).toEqual(false);
        testUA.registrationFailed(403);
        expect(authentication.visible).toEqual(false);
    });

    it('on 403 : with settingAuthenticationUserId and settingPassword and settingUserId', function() {
        configuration.userid = '12345';
        configuration.authenticationUserid = '54321';
        configuration.password = 'password';
        testUA.connect();
        expect(authentication.visible).toEqual(false);
        testUA.registrationFailed(403);
        expect(authentication.visible).toEqual(false);
    });

    it('on non 403', function() {
        $.cookie('settingUserId', '12345');
        testUA.connect();
        expect(authentication.visible).toEqual(false);
        testUA.registrationFailed(404);
        expect(authentication.visible).toEqual(false);
    });

    it('authenticate and registered', function() {
        authentication.userid = 'testuserid';
        authentication.password = 'testpassword';
        authentication.authenticate();
        eventbus.emit('registered');
        expect(configuration.password).toEqual('testpassword');
        expect(configuration.userid).toEqual('testuserid');
    });    
});