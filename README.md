# Authentication

Handles SIP authentication and registration.

Model : bdsft_webrtc.default.authentication
View : bdsft_webrtc.default.authenticationview
Dependencies : [SIP Stack](https://github.com/BroadSoft-Xtended/Library-WebRTC-SIPStack)

## Elements
<a name="elements"></a>

Element               |Type    |Description
----------------------|--------|----------------------------------------
authenticationUserid  |input   |Input for the authentication username.
password              |input   |Input for the password.
signIn                |button  |Button to sign in.
signOut               |button  |Button to sign out.
userid                |input   |Input for the SIP User ID.

## Properties
<a name="properties"></a>

Property              |Type    |Description
----------------------|--------|--------------------------------------------------------------------------------------------------------------------------------------
authenticationUserid  |string  |The username for the digest authentication as a response to the REGISTER request. If not specified the userid property will be used.
password              |string  |The password for the digest authentication as a response to the REGISTER request.
userid                |string  |The SIP User ID that will be used for the REGISTER request.

## Configuration
<a name="configuration"></a>

Property  |Type     |Default  |Description
----------|---------|---------|-----------------------------------------------------------
register  |boolean  |false    |True if authentication should be shown if not registered.

## Methods
<a name="methods"></a>

Method     |Parameter  |Description
-----------|-----------|---------------------------------------------------------------------
signIn()   |           |Signs in using the userid, password and authenticationUserid.
signOut()  |           |Signs out and clears the userid, password and authenticationUserid.
