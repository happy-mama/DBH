// MAIN generator config file
// * means ALWAYS required properties

const props = {
    users: {
        name: "User", // *name of prop
        cache: { // cache properties
            use: true, // *turns cache on
            identification: "login", // *property ID to save objects to Map
            time: 1000 * 60 * 5, // *time to clear cache
            log: true // logs cache to console
        },
        JWT: {
            use: true, // *
            string: "FAY1PgHoitbaMzYdIECt1odR", // *JWT string to decode/code prop
            time: 1000 * 60 * 24 * 7 // *JWT expire time
        },
        DB: { // DB properties
            name: "Users", // *name of DB collection
            schema: {
                data: { // collection schema*
                    login: "String",
                    email: "String",
                    password: "String"
                },
                params: { // collection params
                    versionKey: false
                }
            }
        },
        format: { // *formats to be generated
            checkAll: { // *name of generated method
                type: "check", // *type of template (see config.json)
                params: {}, // params of template
                errors: { // errors of template (see config.json)
                    q: "E_UserQ", 
                    TYPEOF_RULE: "E_UserTRE",
                    RULE: "E_UserRE"
                }
            },
            checkLorEP: {
                type: "check",
                params: {
                    rules: ["login|email", "password"] // ables method to be called without some properties
                }
            },
            login: {
                type: "get",
                params: {
                    useCheck: true, // allows method to check schema params to valid
                    checkMethod: "checkLorEP",
                    cacheMethod: "cacheUser", // [needs prop.cache.use : true][format name] chose what cache method will be used
                    mainMethod: "findUser", // *[format name] chose what method will be used
                }
            },
            auth: {
                type: "get",
                params: {
                    cacheMethod: "cacheUser",
                    mainMethod: "findUser"
                }
            },
            authJWT: {
                type: "inJWT",
                params: {
                    mainMethod: "auth",
                    getJWTMethod: "getJWTUser"
                }
            },
            register: {
                type: "post",
                params: {
                    checkEquals: ["login", "email"],
                    checkMethod: "checkLorEP",
                    cacheMethod: "cacheUser",
                    disableCopies: true // throws error on try to create copy of Object in DB
                },
                errors: {
                    disableCopies: "E_UserDC",
                    checkEquals: "E_UserCE:%equal%" // this error has %equal% option that will be replaced with DB property that is incorrect
                }
            },
            cacheUser: {
                type: "cache",
                params: {},
                errors: {
                    main: "E_UserNull"
                }
            },
            findUser: {
                type: "find",
                params: {},
                errors: {
                    main: "E_UserNF"
                }
            },
            deleteUser: {
                type: "delete",
                params: {
                    checkMethod: "checkAll",
                    mainMethod: "findUser"
                }
            },
            postJWTUser: {
                type: "postJWT",
                params: {
                    cacheMethod: "cacheUser"
                }
            },
            getJWTUser: {
                type: "getJWT",
                params: {
                    cacheMethod: "cacheUser"
                },
                errors: {
                    q: "E_q",
                    JWTstring: "E_UserJWTINAS",
                    JWTerror: "E_UserJWTE"
                }
            },
            putUser: {
                type: "put",
                params: {
                    checkMethod: "checkLorEP",
                    mainMethod: "findUser",
                    checkEquals: ["login", "email"]
                },
                errors: {
                    main: "E_UserPB",
                    q: "E_q",
                    checkEquals: "E_UserCE:%equal%"
                }
            },
            getbyId: {
                type: "getById",
                params: {},
                errors: {
                    q: "E_q",
                    main: "E_UserNF"
                }
            }
        }
    }
}

module.exports = props