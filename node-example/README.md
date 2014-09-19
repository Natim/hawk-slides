# Node Hawk Example

## To run

    make runserver

## To try please install

    pip install httpie requests-hawk

## To get an hawk token

    $ http POST http://localhost:5000/token

    HTTP/1.1 201 Created
    Access-Control-Allow-Credentials: true
    Connection: keep-alive
    Content-Length: 145
    Content-Type: application/json; charset=utf-8
    Date: Fri, 19 Sep 2014 14:45:55 GMT
    X-Powered-By: Express
    
    {
        "credentials": {
            "algorithm": "sha256", 
            "id": "e9a556de9164dd52f05d05d2159268c3", 
            "key": "74e3c5c3702144291c739744dfa8c752"
        }
    }

## To use the Hawk token

    $ http GET http://localhost:5000/token -v \
       --auth-type hawk \
       --auth "e9a556de9164dd52f05d05d2159268c3:74e3c5c3702144291c739744dfa8c752"

    GET /token HTTP/1.1
    Accept: */*
    Accept-Encoding: gzip, deflate
    Authorization: Hawk mac="W7SyW4HCL0vjLk9PIQPVmMRRBDPjCeEFRkP5NLxY/64=", \
                        hash="B0weSUXsMcb5UhL41FZbrUJCAotzSI3HawE1NPLRUz8=", \
                        id="e9a556de9164dd52f05d05d2159268c3", \
                        ts="1411138221", \
                        nonce="zyLgvS"
    Host: localhost:5000
    User-Agent: HTTPie/0.8.0


    HTTP/1.1 200 OK
    Access-Control-Allow-Credentials: true
    Connection: keep-alive
    Content-Length: 50
    Content-Type: application/json; charset=utf-8
    Date: Fri, 19 Sep 2014 14:55:25 GMT
    ETag: W/"32-4275554287"
    Server-Authorization: Hawk mac="VY1U+wNa4YnStOtz3laeRJXEeed1HYvtCCdvzheSlSQ="
    X-Powered-By: Express
    
    {
        "hawkId": "e9a556de9164dd52f05d05d2159268c3"
    }


## Tokens doesn't have to be randomBytes

    $ http GET http://localhost:5000/token -v \
       --auth-type hawk \
       --auth "admin:password"

    GET /token HTTP/1.1
    Accept: */*
    Accept-Encoding: gzip, deflate
    Authorization: Hawk mac="ErkV04lesPkXZza9F4sNCu1bQVyxGnII6ujXtA5fzn4=", hash="B0weSUXsMcb5UhL41FZbrUJCAotzSI3HawE1NPLRUz8=", id="admin", ts="1411138778", nonce="4WMW8m"
    Host: localhost:5000
    User-Agent: HTTPie/0.8.0
    

    HTTP/1.1 200 OK
    Access-Control-Allow-Credentials: true
    Connection: keep-alive
    Content-Length: 23
    Content-Type: application/json; charset=utf-8
    Date: Fri, 19 Sep 2014 14:59:38 GMT
    ETag: W/"17-2073101504"
    Server-Authorization: Hawk mac="QbqnBaI+QsbN79a6/YyBBqrZ8/0r43t/8HYm63GPMlk="
    X-Powered-By: Express
    
    {
        "hawkId": "admin"
    }

## In case the token doesn't exists

    $ http GET http://localhost:5000/token -v \
        --auth-type hawk \
        --auth "d9341c29f34bf1b40a2f5e71dbc1db27:34660c7d5d960e85a511eea880baef53"

    GET /token HTTP/1.1
    Accept: */*
    Accept-Encoding: gzip, deflate
    Authorization: Hawk \
        mac="Rm7IdG7ryX/VAmD/fangwUwCTLXWLDumQdB2PAWUgrg=", \
        hash="B0weSUXsMcb5UhL41FZbrUJCAotzSI3HawE1NPLRUz8=", \
        id="d9341c29f34bf1b40a2f5e71dbc1db27", \
        ts="1411138861", \
        nonce="1o0G_r"
    Host: localhost:5000
    User-Agent: HTTPie/0.8.0


    HTTP/1.1 401 Unauthorized
    Access-Control-Allow-Credentials: true
    Connection: keep-alive
    Content-Length: 51
    Content-Type: application/json; charset=utf-8
    Date: Fri, 19 Sep 2014 15:01:01 GMT
    ETag: W/"33-1262906520"
    WWW-Authenticate: Hawk error="Unknown credentials"
    X-Powered-By: Express
    
    {
        "code": 401, 
        "error": "Unknown credentials"
    }


## Using the Hawk-Session-Token protocol

    $ http -v POST http://localhost:5000/registration

    POST /registration HTTP/1.1
    Accept: */*
    Accept-Encoding: gzip, deflate
    Content-Length: 0
    Host: localhost:5000
    User-Agent: HTTPie/0.8.0


    HTTP/1.1 200 OK
    Access-Control-Allow-Credentials: true
    Access-Control-Expose-Headers: Hawk-Session-Token
    Connection: keep-alive
    Content-Length: 78
    Content-Type: application/json; charset=utf-8
    Date: Fri, 19 Sep 2014 15:11:14 GMT
    Hawk-Session-Token: c5d6f538a1be86b4820988cc46d9135d49e7080a2f2b8125885082ff5485d3d1
    X-Powered-By: Express
    
    {
        "hawkId": "176fa7af3ee5768b29363ca3380bc6bc8ab2f9200dbcf200ae1e4d39de935e94"
    }


    $ http GET http://localhost:5000/token -v \
        --auth-type hawk
        --auth "c5d6f538a1be86b4820988cc46d9135d49e7080a2f2b8125885082ff5485d3d1:"

    GET /token HTTP/1.1
    Accept: */*
    Accept-Encoding: gzip, deflate
    Authorization: Hawk mac="oJpAdAt/ctjsI9A7CcyuTJD/AIAn6RPYSGiS+ZaMPMk=", hash="B0weSUXsMcb5UhL41FZbrUJCAotzSI3HawE1NPLRUz8=", id="176fa7af3ee5768b29363ca3380bc6bc8ab2f9200dbcf200ae1e4d39de935e94", ts="1411139679", nonce="WGm6CS"
    Host: localhost:5000
    User-Agent: HTTPie/0.8.0


    HTTP/1.1 200 OK
    Access-Control-Allow-Credentials: true
    Connection: keep-alive
    Content-Length: 82
    Content-Type: application/json; charset=utf-8
    Date: Fri, 19 Sep 2014 15:14:39 GMT
    ETag: W/"52-1418187917"
    Server-Authorization: Hawk mac="5rvaOuJMBdNh2CtAr4s5tioWUEv61meqxR3PLOEGYmU="
    X-Powered-By: Express
    
    {
        "hawkId": "176fa7af3ee5768b29363ca3380bc6bc8ab2f9200dbcf200ae1e4d39de935e94"
    }
