Hawk — Pytong 2014
==================

----

.. image:: logo.png

.. class:: center

    **Authenticate your HTTP requests**

    Rémy Hubscher - natim@mozilla.com - @natim


----

How does Authentication works?
==============================

----

How does Authentication works?
==============================

1. The client register to get a session (usually `POST /login` with login/password)

2. The server get back a session (usually using a `Set-Cookie` header)

3. We use this session on each HTTP request (usually header `Cookie`, `Authorization`)

4. We use POST /logout to destroy the session

----

How does Hawk works?
====================

1. The client register to get a session
2. The server store a new Hawk account with an id and a key and return it to the client.
3. Each time the client make a new request, he builds the Authorization header.
4. Each time the server answers he builds the Server-Authorization header back.

----

Hawk credentials
================

This are the hawk credentials:

.. code-block:: yaml

    id: dh37fgj492je
    key: werxhqb98rpaxn39848xrunpaw3489ruxnpa98w4rxn
    algorithm: sha256

Basicaly an **id**, **key** and **algorithm**.

Mozilla defined the **Hawk-Session-Token** protocol to let you share this
credentials in a protected way.

----

The Hawk-Session-Token sharing protocol
=======================================

- You create a new **Hawk-Session-Token** as a hex string of 16 random bytes that you can share and store.
- Then you use the **HKDF** sha256 algorithm to get a 32 bytes long string.
- The 16 first bytes are the credentials id
- The 16 last bytes are the credentials key

The derivation keyword for this protocol is set to "identity.mozilla.com/picl/v1/sessionToken"

Note that an hex digit is called a nibble and that a byte is made of two nibble.

----

The Hawk-Session-Token sharing protocol
=======================================

.. code-block:: python

    def get_hawk_credentials(token=None):
        if token is None:
            token = os.urandom(32)
        else:
            token = codecs.decode(token, "hex_codec")
    
        # sessionToken protocol HKDF keyInfo.
        keyInfo = 'identity.mozilla.com/picl/v1/sessionToken'
        keyMaterial = HKDF(token, "", keyInfo, 32*2)
    
        token = codecs.encode(token, "hex_codec").decode("utf-8")
    
        return token, {
            'id': codecs.encode(keyMaterial[:32], "hex_codec").decode("utf-8"),
            'key': codecs.encode(keyMaterial[32:64], "hex_codec").decode("utf-8"),
            'algorithm': 'sha256'
        }

https://github.com/spiral-project/daybed/tree/master/daybed/tokens.py

----

HTTP Hawk Authorization header
==============================

.. code-block:: http

    GET /resource/1?b=1&a=2 HTTP/1.1
    Host: example.com:8000
    Authorization: Hawk id="dh37fgj492je", \
                        ts="1353832234", \
                        nonce="j4h3g2", \
                        ext="some-app-ext-data", \
                        mac="6R4rV5iE+NPoym+WwjeHzjAGXUtLNIxmo1vpMofpLAE="

- **id** is the credentials id given on registration
- **ts** is the exact timestamp of the request, this prevent from replay.
- **nonce** is a random value added to the request
- **mac** is the signature of the request being send to the server with the credentials key.

Two others optional parameters may be added to this:

- **hash** which is an hash of the request payload (POST)
- **ext** which is some app specific data that can be defined

----

HTTP Hawk Authorization header
==============================

The mac is built using a hash of this information:

.. code-block:: text

    hawk.1.header                  |    hawk.1.header
    {timestamp}                    |    1353832234
    {nonce}                        |    j4h3g2
    {method}                       |    GET
    {path-with-querystring}        |    /resource/1?b=1&a=2
    {host}                         |    example.com
    {port}                         |    8000
    {hash}                         |    
    {ext}                          |    some-app-ext-data

This is hmac-ed using the credentials algorithm and the credentials
key and provided as a base64 string.

----

HTTP Server-Authorization header
================================

The payload hash is calculated in sha256 and returned as base64 using:

.. code-block:: text

    hawk.1.payload
    text/plain
    Thank you for flying Hawk

Which gives us::

    Yi9LfIIFRtBEPt74PVmbTF/xVAwPn7ub15ePICfgnuY=

The good thing with Hawk is that the server also provides you a
response signature using the same credentials.

.. code-block:: text

    Server-Authorization: Hawk \
       mac="XIJRsMl/4oL+nn+vKoeVZPdCHXB4yJkNnBbTbHFZUYE=", \
       hash="f9cDF/TDm7TkYRLnGwRMfeDzT6LixQVLvrIKhh0vgmM=", \
       ext="response-specific"

----

Using Hawk in your projects
===========================

**When should I use it?**

- You should really consider working with Hawk for web services API.

**Should I use it in my website?**

- No, for the user front-end but as soon as you have an web API: YES

----

Why is it better to use Hawk?
=============================

- Better security, capturing the request is not enough to use the session.
- Protection against replay attack, because of the timestamp and the nonce.
- Payload signature, the payload received is the one sent by your client.
- No cookie management.

And this even without using SSL.

----

An example with node
====================

----

With node
=========

- We use **express-hawk** to build the express middleware
- Configure how we **store the user** in the database
- Configure how we **get the user** from the database
- Configure how we **provision the request** with new parameters
- Configure all the **hawk options**
- Test using **superagent-hawk**

----

An example with python
======================

We are using **pyramid_hawkauth**.HawkAuthenticationPolicy with **cornice**

For client code we are using **requests-hawk**

----

Javascript client usage
=======================

The Hawk javascript library: https://www.npmjs.org/package/hawk

This gives you:

.. code-block:: javascript

    var hawk = require("hawk");
    var credentials = {
      id: "admin",
      key: "password",
      algorithm: "sha256"
    };

    var hawkHeader = hawk.client.header(url, method, {
      credentials: credentials
    });

    var req = new XMLHttpRequest();
    req.setRequestHeader('Content-Type', 'application/json');
    req.setRequestHeader('Accept', 'application/json');
    req.responseType = 'json';
    req.timeout = 15000;

    req.setRequestHeader('Authorization', hawkHeader.field);

https://github.com/spiral-project/daybed.js/tree/master/index.js


----

OpenSource projet: daybed
=========================

**daybed** is a remote storage with data validation and sync in
between users and devices.

You want to use daybed each time you have an APP (HTML5 or not) with
a desire of cross devices / users usage.

 - Doodle
 - Google Forms
 - Participative map
 - FirefoxOS app
 - Todo list (trello)

With **daybed** you don't need to code another backend for your app.

----

Why Hawk for daybed?
====================

- OpenSource project, people might use it without SSL.
- Token are meaning less and can refer to Device, User, Groups or the three of them
- With the Hawk-Session-Token you don't have to store anything more than a session token.

----

So, will you use Hawk?
======================
