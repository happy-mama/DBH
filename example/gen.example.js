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
        format: [ // *formats to be generated
            {
                name: "getUser", // *name of generated method
                type: "get", // *type of template (see config.json)
                params: { // params of template
                    useCheck: true, // allows method to check schema params to valid
                    cacheMethod: "cacheUser", // [needs prop.cache.use : true][format name] chose what cache method will be used
                    mainMethod: "findUser" // *[format name] chose what method will be used
                }
            }, {
                name: "getUserNoCheck",
                type: "get",
                params: {
                    cacheMethod: "cacheUser",
                    mainMethod: "findUser"
                }
            }, {
                name: "postUser",
                type: "post",
                params: {
                    useCheck: true,
                    cacheMethod: "cacheUser"
                }
            }, {
                name: "cacheUser",
                type: "cache",
                params: {
                    useCheck: true,
                    mainMethod: ""
                }
            }, {
                name: "findUser",
                type: "find",
                params: {
                    useCheck: true,
                    cacheMethod: "cacheUser"
                }
            }, {
                name: "putUser",
                type: "put",
                params: {
                    useCheck: true,
                    checkEquals: ["login", "email"], // checks if DB already has this fields equals to edit options
                    mainMethod: "findUser",
                    cacheMethod: "cacheUser"
                }
            }, {
                name: "deleteUser",
                type: "delete",
                params: {
                    useCheck: true,
                    mainMethod: "findUser"
                }
            }, {
                name: "getUserJWT",
                type: "getJWT",
                params: {
                    useCheck: true,
                    cacheMethod: "cacheUser"
                }
            }, {
                name: "postUserJWT",
                type: "postJWT",
                params: {
                    useCheck: true,
                    cacheMethod: "cacheUser"
                }
            }, {
                name: "putUserInOutJWT",
                type: "putInOutJWT",
                params: {
                    useCheck: true,
                    getJWTMethod: "getUserJWT",
                    postJWTMethod: "postUserJWT",
                    mainMethod: "putUser"
                }
            }, {
                name: "getUserInOutJWT",
                type: "getInOutJWT",
                params: {
                    useCheck: true,
                    getJWTMethod: "getUserJWT",
                    postJWTMethod: "postUserJWT",
                    mainMethod: "getUserNoCheck"
                }
            }
        ]
    }
}

module.exports = { props }