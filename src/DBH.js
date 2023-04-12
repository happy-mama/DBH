/*
,___  ___     _   _   _   __  _ ____  _    ____ ____
| _ \| _ \   | |_| | / \ |  \| |  _ \| |  | ___| __ \
||_| | _ <   |  _  |/ _ \| . ' | |_| | |__| ___|    /
|___/|___/   |_| |_|_/ \_|_|\__|____/|____|____|_|\_\

*/

const JWT = require("jsonwebtoken");
const mongoose = require("mongoose");
const templates = require("./templates.js");
let GEN = require("./gen.js")
const config = require("./config.json")

class DBH {

    constructor() {
        this.mongoose = mongoose
        this.JWT = JWT
        this.builded = {}
        this.temp = {
            DBNames: []
        }
        this.config = config
    }

    /**
     * Prints message to console by **DBH**
     * @param {string} str **String**
     * @returns {void} 
     */
    log(str) {
        console.log("\x1b[32m" + "[DBH]: " + "\x1b[0m" + "\x1b[1m" + str || "" + "\x1b[0m")
    }

    /**
     * Prints message to console by **DBH:warn**
     * @param {string} name **String**
     * @param {string} str **String**
     * @returns {void} 
     */
    warn(name, str) {
        console.log(`\x1b[33m[DBH:warn]:\x1b[0m` + `\x1b[36m${name || ""}\x1b[0m ` + `\x1b[1m${str || ""}\x1b[0m`)
    }

    /**
     * Prints message to console by **DBH:ERROR**
     * 
     * `this method will STOP process`
     * @param {string} head **String**
     * @param {string} name **String**
     * @param {string} str **String**
     * @returns {void}
     */
    error(head, name, str) {
        console.log("\x1b[41m[DBH:ERROR]" + "\x1b[0m" + ` \x1b[33m${head || ""}\x1b[0m` + ` \x1b[31m${name || ""}\x1b[0m ` + `\x1b[1m${str || ""}\x1b[0m`)
        return this.stop()
    }

    /**
     * `STOPS process`
     * @returns {void}
     */
    stop() {
        mongoose.disconnect()
        process.exit("DBH:ERROR")
    }

    /**
     * Inits DBH class
     * @param {object} myGen **Object** - put your GEN object (if void, used gen.js in src folder)
     * @returns {Promise<void>}
     */
    init(myGen) {
        return new Promise((result, reject) => {

            global.dbh = this
            let timeStart = new Date()
            this.log("Initing...")

            if (myGen) {
                GEN = myGen
            }

            if (!config.JWTS) {
                reject("ENOJWTS")
            }

            if (!(config.DB.database || config.DB.host || config.DB.password || config.DB.user)) {
                reject("ENODBPROPERTIES")
            }

            let gValues = Object.values(GEN.props)

            gValues.forEach(gValue => {
                // building...
                this.gen(gValue)
            })

            this.log(`inited templates in ${new Date() - timeStart}ms`)

            this.log("initing DB connection...")

            mongoose.connect(`mongodb://${config.DB.user}:${config.DB.password}@${config.DB.host}/${config.DB.database}?retryWrites=true`).then(() => {
                this.log("Ready");
                result();
            }).catch(e => { reject(e); });
        });
    }

    /**
     * Generates BUILD of prop from gen file, `DO NOT USE THIS METHOD`, it's only for lib
     * @param {object} x **Object** 
     * @returns {void}
     */
    gen(x) {

        // creating prop build
        let p = {
            $schema: {}, // mongoose.schema
            $model: {},  // mongoose.model
            $cache: {
                use: false,         // 
                clear: null,        // become function if cache set true, clears cache.map
                identification: "", // param of schema to be used as key for cache.map
                time: 0,            // time to call cache.clear function
                log: false,         // logs on cache.clear
                map: new Map()      // cache Map
            },
            $JWT: {
                use: false, //
                string: "", // JWT string to encode/decode
                time: 0     // token expired time
            }
        }

        // initing prop DB collection
        if (x.DB) {

            if (!x.DB.name) {
                this.error("DBH.js:gen", x.name, `prop needs DB.name`)
            }

            if (this.temp.DBNames.includes(x.DB.name)) {
                this.error("DBH.js:gen", x.name, `prop.DB.name has already created in another prop`)
            }

            this.temp.DBNames.push(x.DB.name)

            if (typeof x.DB.name != "string") {
                this.error("DBH.js:gen", x.name, `prop DB.name is not a string`)
            }

            if (!Object.values(x.DB.schema.data)) {
                return this.error("DBH.js:gen", x.name, `prop needs DB.schema.data values`)
            }

            p.$schema = new mongoose.Schema(x.DB.schema.data, x.DB.schema.params);
            p.$model = new mongoose.model(x.DB.name, p.$schema);

        } else {
            return this.error("DBH.js:gen", x.name, `prop needs DB.name && DB.schema`)
        }

        // initing prop JWT params
        if (x.JWT) {

            if (x.JWT.use) {
                p.$JWT.use = true
                if (x.JWT.string) {
                    if (typeof x.JWT.string != "string") {
                        return this.error("DBH.js:gen", x.name, "prop JWT.string is not a string")
                    }
                    p.$JWT.string = x.JWT.string
                } else {
                    return this.error("DBH.js:gen", x.name, "prop JWT.string is empty")
                }

                if (x.JWT.time) {
                    if (typeof x.JWT.time != "number") {
                        return this.error("DBH.js:gen", x.name, "prop JWT.time is not a number")
                    }
                    p.$JWT.time = x.JWT.time
                } else {
                    return this.error("DBH.js:gen", x.name, "prop JWT.time is empty")
                }
            }
        }

        // initing prop cache params
        if (x.cache) {
            if (x.cache.use) {
                p.$cache.use = true

                if (!x.cache.identification) {
                    this.error("DBH.js:gen", x.name, "prop cache.identification is empty")
                }

                if (typeof x.cache.identification != "string") {
                    this.error("DBH.js:gen", x.name, "prop cache.identification is not a string")
                }

                p.$cache.identification = x.cache.identification

                if (!x.cache.time) {
                    this.error("DBH.js:gen", x.name, "prop cache.time is empty")
                }

                if (typeof x.cache.time != "number") {
                    this.error("DBH.js:gen", x.name, "prop cache.time is not a number")
                }

                p.$cache.time = x.cache.time

                if (x.cache.log) {
                    if (this.config.debug) {
                        this.warn(x.name, "cache.log:true")
                    }
                    p.$cache.log = true
                }

                let temp = ""
                if (p.$cache.log) {
                    temp = `global.dbh.warn("${x.name}", "cleared cache");`
                }
                let rawF = `global.dbh.${x.name}.$cache.map.clear();${temp}`
                p.$cache.clear = Function("", rawF)
                setInterval(p.$cache.clear, p.$cache.time)
            }
        }

        // creates format que, checks formats params
        let que = []
        x.format.forEach(f => {

            if (!f.params) {
                f.params = {}
            }

            if (!f.name) {
                this.error("DBH.js:gen", x.name, "name is not defined")
            }

            if (typeof f.name != "string") {
                this.error("DBH.js:gen", x.name, "name is not a string")
            }

            if (!f.type) {
                this.error("DBH.js:gen", `${x.name}.${f.name}`, "type is not defined")
            }

            if (typeof f.type != "string") {
                this.error("DBH.js:gen", `${x.name}.${f.name}`, "type is not a string")
            }

            if (!this.config.gen.formats[f.type]) {
                this.error("DBH.js:gen", `${x.name}.${f.name}`, `type:${f.type} not found`)
            }

            if (f.type == "cache") {
                if (p.$cache.use == false) {
                    this.error("DBH.js:gen", `${x.name}.${f.name}`, `prop needs cache.use:true`)
                }
            }

            if (!que[this.config.gen.formats[f.type].que]) {
                que[this.config.gen.formats[f.type].que] = []
            }
            que[global.dbh.config.gen.formats[f.type].que].push(f)
        })

        // initing que
        que.forEach(qu => {
            qu.forEach(f => {
                if (config.gen.formats[f.type]) {

                    let kParams = Object.keys(this.config.gen.formats[f.type].params)
                    let vParams = Object.values(this.config.gen.formats[f.type].params)

                    // checks template params
                    if (kParams) {

                        kParams.forEach(kParam => {

                            switch (kParam) {
                                case "mainMethodType": {

                                    if (!f.params.mainMethod) {
                                        this.error("DBH.js:gen", `${x.name}.${f.name}`, `params.mainMethod is required`)
                                    } else {

                                        if (config.gen.formats[f.type].mainMethodType == "any") {
                                            return
                                        }

                                        if (!p[f.params.mainMethod]) {
                                            this.error("DBH.js:gen", `${x.name}.${f.name}`, `params.mainMethod is not defined`)
                                        }

                                        if (!this.config.gen.formats[f.type].params.mainMethodType == "any") {

                                            x.format.forEach(format => {
                                                if (format.name == f.params.mainMethod) {
                                                    if (format.type != this.config.gen.formats[f.type].params.mainMethodType) {
                                                        this.error("DBH.js:gen", `${x.name}.${f.name}`, `params.mainMethod is not allowed in this format`)
                                                    }
                                                }
                                            })

                                        }
                                    }

                                } break;
                                case "cacheMethodType": {

                                    if (!f.params.cacheMethod) {
                                        this.error("DBH.js:gen", `${x.name}.${f.name}`, `params.cacheMethod is required`)
                                    } else {
                                        if (!p[f.params.cacheMethod]) {
                                            this.error("DBH.js:gen", `${x.name}.${f.name}`, `params.cacheMethod is not defined`)
                                        }

                                        x.format.forEach(format => {
                                            if (format.name == f.params.cacheMethod) {
                                                if (format.type != this.config.gen.formats[f.type].params.cacheMethodType) {
                                                    this.error("DBH.js:gen", `${x.name}.${f.name}`, `params.cacheMethod is not allowed in this format`)
                                                } else {
                                                    return
                                                }
                                            }
                                        })
                                    }

                                } break;
                                case "getJWTMethodType": {

                                    if (!f.params.getJWTMethod) {
                                        this.error("DBH.js:gen", `${x.name}.${f.name}`, `params.getJWTMethod is required`)
                                    } else {
                                        if (!p[f.params.getJWTMethod]) {
                                            this.error("DBH.js:gen", `${x.name}.${f.name}`, `params.getJWTMethod is not defined`)
                                        }

                                        x.format.forEach(format => {
                                            if (format.name == f.params.getJWTMethod) {
                                                if (format.type != this.config.gen.formats[f.type].params.getJWTMethodType) {
                                                    this.error("DBH.js:gen", `${x.name}.${f.name}`, `params.getJWTMethodType is not allowed in this format`)
                                                } else {
                                                    return
                                                }
                                            }
                                        })
                                    }

                                } break;
                                case "postJWTMethodType": {

                                    if (!f.params.postJWTMethod) {
                                        this.error("DBH.js:gen", `${x.name}.${f.name}`, `params.postJWTMethod is required`)
                                    } else {
                                        if (!p[f.params.postJWTMethod]) {
                                            this.error("DBH.js:gen", `${x.name}.${f.name}`, `params.postJWTMethod is not defined`)
                                        }

                                        x.format.forEach(format => {
                                            if (format.name == f.params.postJWTMethod) {
                                                if (format.type != this.config.gen.formats[f.type].params.postJWTMethodType) {
                                                    this.error("DBH.js:gen", `${x.name}.${f.name}`, `params.postJWTMethodType is not allowed in this format`)
                                                } else {
                                                    return
                                                }
                                            }
                                        })
                                    }

                                } break;
                                case "checkEquals": {

                                    if (f.params.checkEquals) {
                                        if (!Array.isArray(f.params.checkEquals)) {
                                            this.error("DBH.js:gen", `${x.name}.${f.name}`, `params.checkEquals is not an Array`)
                                        }
                                    }

                                } break;
                                case "checkMethodType": {

                                    if (f.params.checkMethod) {

                                        if (!p[f.params.checkMethod]) {
                                            this.error("DBH.js:gen", `${x.name}.${f.name}`, `params.checkMethod is not defined`)
                                        }

                                        x.format.forEach(format => {
                                            if (format.name == f.params.checkMethod) {
                                                if (format.type != this.config.gen.formats[f.type].params.checkMethodType) {
                                                    this.error("DBH.js:gen", `${x.name}.${f.name}`, `params.checkMethodType is not allowed in this format`)
                                                } else {
                                                    return
                                                }
                                            }
                                        })

                                    }

                                } break;
                                case "rules": {

                                    if (f.params.rules) {

                                        if (!Array.isArray(f.params.rules)) {
                                            this.error("DBH.js:gen", `${x.name}.${f.name}`, `params.rules is not an Array`)
                                        }

                                        if (f.params.rules.length == 0) {
                                            this.error("DBH.js:gen", `${x.name}.${f.name}`, "params.rules syntax error, rules must be set or not write this option")
                                        }

                                        f.params.rules.forEach(rule => {

                                            if (rule.includes("|")) {

                                                if (rule.split("|").length <= 1) {
                                                    this.error("DBH.js:gen", `${x.name}.${f.name}`, `params.rules syntax error, rule "|" must be like [option1|option2|option3...]`)
                                                }

                                                let splitRules = rule.split("|")

                                                splitRules.forEach(splitRule => {

                                                    if (!x.DB.schema.data[splitRule]) {
                                                        this.error("DBH.js:gen", `${x.name}.${f.name}` `params.rules[${rule}] is not defined in prop schema`)
                                                    }

                                                })

                                            } else {

                                                if (!x.DB.schema.data[rule]) {
                                                    this.error("DBH.js:gen", `${x.name}.${f.name}` `params.rules[${rule}] is not defined in prop schema`)
                                                }

                                            }

                                        })

                                    }

                                } break;
                                default: {
                                    this.warn(`${x.name}.${f.name}`, `param ${kParam} not found`);
                                }
                            }

                        })

                    }

                    // generates method from template
                    let str = `create${f.type.charAt(0).toUpperCase() + f.type.slice(1)}`

                    if (p[f.name]) {
                        this.error("DBH.js:gen", `${x.name}.${f.name}`, "method name already exists")
                    } else {
                        p[f.name] = templates[str](x, f, p)
                    }

                } else {
                    this.warn(f.type, "gen format not found")
                }
            })
        })

        // pushing prop build to dbh
        if (this[x.name]) {
            return this.error("DBH.js:gen", x.name, "BUILD already exists")
        } else {
            this[x.name] = p
        }

        // console logs prop info to console
        if (config.debug) {
            this.warn("Created prop", x.name)

            let temp = ""
            x.format.forEach(c => {
                let str = `           ${c.type}[${c.name}]`
                temp += "\n" + str
            })

            if (temp) {
                this.warn("^ methods", temp)
            }

            temp = ""
            x.format.forEach(c => {
                let strWarn = `           ${c.name}`
                let warns = 0
                if (!c.params.useCheck) {
                    warns++
                    strWarn += "[noCheck]"
                }
                if (warns) {
                    temp += "\n" + strWarn
                }
            })

            if (temp) {
                this.warn("^ NOTE", temp)
            }
        }

    }
}

module.exports = new DBH()