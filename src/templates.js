function createCheck(x, f, p) {

    let rules = []
    let typeof_rules = []

    if (f.params.rules) {
        f.params.rules.forEach(rule => {

            let rawRule = []
            let rawTypeof_rule = []

            if (rule.split("|").length > 1) {

                rawRule[0] = "("
                rawRule[1] = ""
                rawRule[2] = ")"

                rawTypeof_rule[0] = "("
                rawTypeof_rule[1] = ""
                rawTypeof_rule[2] = ")"

                let splitRules = rule.split("|")

                splitRules.forEach((splitRule, index) => {

                    rawRule[1] += `q.${splitRule}`
                    rawTypeof_rule[1] += `typeof q.${splitRule} == "${x.DB.schema.data[splitRule]}"`

                    if (splitRules[index + 1]) {
                        rawRule[1] += "||"
                        rawTypeof_rule[1] += "||"
                    }

                })

                rules.push(rawRule.join(""))
                typeof_rules.push(rawTypeof_rule.join(""))

            } else {
                rules.push(`q.${rule}`)
                typeof_rules.push(`typeof q.${rule} == "${x.DB.schema.data[rule]}"`)
            }

        })
    } else {
        let mNames = Object.keys(x.DB.schema.data)

        mNames.forEach((key, index) => {

            rules.push(`q.${key}`)
            typeof_rules.push(`typeof q.${key} == "${x.DB.schema.data[key]}"`)

        })
    }

    const RULE = rules.join("&&")
    const TYPEOF_RULE = typeof_rules.join("&&")

    let rawF = `
    return new Promise((result, reject) => {
        if (!q) {
            return reject(\`ECHECK: !q\`)
        }

        if (!(${RULE})) {
            return reject(\`ECHECK: ${f.name}_RULE\`)
        }

        if (!(${TYPEOF_RULE})) {
            return reject(\`ECHECK: ${f.name}_TYPEOF_RULE\`)
        }

        result()
    })`

    return Function("q", rawF)
}

function createGet(x, f, p) {

    let checkRaw = ["", ""]
    if (f.params.checkMethod) {
        checkRaw = [`global.dbh.${x.name}.${f.params.checkMethod}(q).then(() => {`, "}).catch(e => { reject(e) })"]
    }

    let cacheRaw = ["", ""]
    if (x.cache.use) {
        cacheRaw = [`global.dbh.${x.name}.${f.params.cacheMethod}(q).then(r => { result(r) }).catch(e => {`, "})"]
    }

    let mainMethod = [`global.dbh.${x.name}.${f.params.mainMethod}(q).then(r => {`, "}).catch(e => { reject(e) })"]

    let rawF = `return new Promise((result, reject) => {
        ${checkRaw[0]}
            ${cacheRaw[0]}
                if (e == \`${"ENO" + x.name.toUpperCase()}\`) {
                    ${mainMethod[0]}
                        return result(r);
                    ${mainMethod[1]}
                } else {
                    return reject(e)
                }
            ${cacheRaw[1]}
        ${checkRaw[1]}
    });`

    return Function("q", rawF)
}

function createCache(x, f, p) {

    let checkRaw = ["", ""]
    if (f.params.checkMethod) {
        checkRaw = [`global.dbh.${x.name}.${f.params.checkMethod}(q).then(() => {`, "}).catch(e => { reject(e) })"]
    }

    let rawF = `return new Promise((result, reject) => {
        ${checkRaw[0]}
            let r = global.dbh.${x.name}.$cache.map.get(q.${x.cache.identification})
            if (r) {
                result(r);
            } else {
                reject(\`${"ENO" + x.name.toUpperCase()}\`)
            }
        ${checkRaw[1]}
    })`

    return Function("q", rawF)

}

function createPost(x, f, p) {

    let checkRaw = ["", ""]
    if (f.params.checkMethod) {
        checkRaw = [`global.dbh.${x.name}.${f.params.checkMethod}(q).then(() => {`, "}).catch(e => { reject(e) })"]
    }

    let mNames = Object.keys(x.DB.schema.data)

    let rawModel = {}

    mNames.forEach(n => {
        rawModel[n] = null
    })

    let saveCache = ""
    if (x.cache.use) {
        saveCache = `global.dbh.${x.name}.$cache.map.set(m.${x.cache.identification}, m);`
    }

    let checkEquals = ["", "", ""]
    if (f.params.checkEquals) {
        f.params.checkEquals.forEach(equal => {

            if (!x.DB.schema.data[equal]) {
                global.dbh.warn(x.name, `${f.name} format params.checkEquals[${equal}] is not defined in prop schema`)
            } else {
                checkEquals[0] += `global.dbh.${x.name}.$model.findOne({"${equal}": q.${equal}}).then(z => {
                    if (z) {
                        return reject(\`EBUSY:${equal}\`);
                    }`
                checkEquals[1] += `}).catch(e => { return reject(e); });`
            }

        })
    }

    let rawF = `return new Promise((result, reject) => {
        ${checkRaw[0]}
            let model = ${JSON.stringify(rawModel)}
            let qNames = Object.keys(q)
            qNames.forEach(n => {
                model[n] = q[n]
            });
            ${checkEquals[0]}
                let m = new global.dbh.${x.name}.$model(model);
                m.save()
                ${saveCache}
                result(m);
            ${checkEquals[1]}
        ${checkRaw[1]}
    });`

    return Function("q", rawF)
}

function createFind(x, f, p) {

    let checkRaw = ["", ""]
    if (f.params.checkMethod) {
        checkRaw = [`global.dbh.${x.name}.${f.params.checkMethod}(q).then(() => {`, "}).catch(e => { reject(e) })"]
    }

    let mNames = Object.keys(x.DB.schema.data)

    let rawModel = {}

    mNames.forEach(n => {
        rawModel[n] = undefined
    })

    let saveCache = ""
    if (x.cache.use) {
        saveCache = `global.dbh.${x.name}.$cache.map.set(d.${x.cache.identification}, d);`
    }

    let rawF = `return new Promise((result, reject) => {
        ${checkRaw[0]}
            let model = ${JSON.stringify(rawModel)}
            let qNames = Object.keys(q);
            qNames.forEach(n => {
                model[n] = q[n]
            });
            global.dbh.${x.name}.$model.findOne(model).then(d => {
                if (!d) {
                    console.log(1)
                    reject(\`${"ENO" + x.name.toUpperCase()}\`)
                } else {
                    ${saveCache}
                    result(d);
                }
            }).catch(e => {
                reject(e)
            });
        ${checkRaw[1]}
    });`

    return Function("q", rawF)
}

function createPut(x, f, p) {

    let checkRaw = ["", "", ""]
    if (f.params.checkMethod) {
        checkRaw[0] = `global.dbh.${x.name}.${f.params.checkMethod}(q.put).then(() => {`
        checkRaw[1] = `global.dbh.${x.name}.${f.params.checkMethod}(q.data).then(() => {`
        checkRaw[2] = "}).catch(e => { reject(e) })"
    }

    let mNames = Object.keys(x.DB.schema.data)

    let rawModel = {}

    mNames.forEach(n => {
        rawModel[n] = undefined
    })

    let checkEqualsStart = ""
    let checkEqualsEnd = ""
    if (f.params.checkEquals) {
        f.params.checkEquals.forEach(equal => {

            if (!x.DB.schema.data[equal]) {
                global.dbh.warn(x.name, `${f.name} format params.checkEquals[${equal}] is not defined in prop schema`)
            } else {
                checkEqualsStart += `global.dbh.${x.name}.$model.findOne({"${equal}": eFound.${equal}}).then(ch => {
                    if (ch) {
                        if (String(ch._id) != String(found._id)) {
                            return reject(\`EBUSY:${equal}\`)
                        }
                    }`
                checkEqualsEnd += `}).catch(e => { return reject(e) })`
            }

        })
    }

    let mainMethod = [`global.dbh.${x.name}.${f.params.mainMethod}`, ""]

    let rawF = `return new Promise((result, reject) => {
        if (!q) {
            return reject(\`ECHECK: q\`)
        }
        ${checkRaw[0]}
            ${checkRaw[1]}
            let model = ${JSON.stringify(rawModel)}
                ${mainMethod[0]}(q.data).then(found => {
                    let eFound = {}
                    let foundNames = Object.keys(q.data)
                    foundNames.forEach(n => {
                        if (n != "_id") {
                            eFound[n] = q.put[n]
                        }
                    })
                    ${checkEqualsStart}
                        ${mainMethod[0]}(eFound).then(x => {
                            return reject(\`EPARAMSBUSY\`)
                        }).catch(e => {
                            if (e == \`${"ENO" + x.name.toUpperCase()}\`) {
                                foundNames.forEach(n => {
                                    if (n != "_id") {
                                        found[n] = eFound[n]
                                    }
                                })
                                found.save()
                                result(found)
                            } else {
                                return reject(e)
                            }
                        })
                    ${checkEqualsEnd}
                }).catch(e => { reject(e) })
            ${checkRaw[2]}
        ${checkRaw[2]}
    })`

    return Function("q", rawF)
}

function createDelete(x, f, p) {

    let checkRaw = ["", ""]
    if (f.params.checkMethod) {
        checkRaw = [`global.dbh.${x.name}.${f.params.checkMethod}(q).then(() => {`, "}).catch(e => { reject(e) })"]
    }

    let deleteCache = ""
    if (x.cache.use) {
        deleteCache = `global.dbh.${x.name}.$cache.map.delete(d.${x.cache.identification});`
    }

    let mainMethod = `global.dbh.${f.params.mainMethod}`

    let rawF = `return new Promise((result, reject) => {
        ${checkRaw[0]}
            ${mainMethod}(q).then(d => {
                global.dbh.${x.name}.$model.deleteOne(d).then(() => {
                    ${deleteCache}
                    result()
                }).catch(e => { reject(e); })
            }).catch(e => { return reject(e); })
        ${checkRaw[1]}
    });`

    return Function("q", rawF)

}

function createGetJWT(x, f, p) {

    let rawF = `return new Promise((result, reject) => {
        if (!q) {
            return reject(\`ECHECK: !q\`)
        }
        if (typeof q != "string") {
            return reject(\`ECHECK: JWT is not a string\`)
        }
        global.dbh.JWT.verify(q, "${p.$JWT.string}", function(err, decoded) {
            if (err) {
                return reject(\`EJWTERROR\`)
            }
            result(decoded.data)
        })
    })`

    return Function("q", rawF)
}

function createPostJWT(x, f, p) {

    let checkRaw = ["", ""]
    if (f.params.checkMethod) {
        checkRaw = [`global.dbh.${x.name}.${f.params.checkMethod}(q).then(() => {`, "}).catch(e => { reject(e) })"]
    }

    let rawF = `return new Promise((result, reject) => {
        ${checkRaw[0]}
            global.dbh.JWT.sign({data: q}, "${p.$JWT.string}", {expiresIn: ${p.$JWT.time}}, function(err, token) {
                if (err) {
                    return reject(err)
                }
                result(token)
            })
        ${checkRaw[1]}
    })`

    return Function("q", rawF)
}

function createInOutJWT(x, f, p) {

    let mainMethod = `global.dbh.${x.name}.${f.params.mainMethod}`
    let getJWTMethod = [`global.dbh.${x.name}.${f.params.getJWTMethod}`, ``]
    let postJWTMethod = [`global.dbh.${x.name}.${f.params.postJWTMethod}`, ``]

    let rawF = `return new Promise((result, reject) => {
        ${getJWTMethod}(q).then(t => {
            ${mainMethod}(t).then(d => {
                ${postJWTMethod}(d).then(s => {
                    result(s)
                }).catch(e => { reject(e) })
            }).catch(e => { reject(e) })
        }).catch(e => { reject(e) })
    })`

    return Function("q", rawF)

}

function createInJWT(x, f, p) {

    let mainMethod = `global.dbh.${x.name}.${f.params.mainMethod}`
    let getJWTMethod = `global.dbh.${x.name}.${f.params.getJWTMethod}`

    let rawF = `return new Promise((result, reject) => {
        ${getJWTMethod}(q).then(t => {
            ${mainMethod}(t).then(d => {
                result(d)
            }).catch(e => { reject(e) })
        }).catch(e => { reject(e) })
    })`

    return Function("q", rawF)

}

function createOutJWT(x, f, p) {

    let mainMethod = `global.dbh.${x.name}.${f.params.mainMethod}`
    let postJWTMethod = [`global.dbh.${x.name}.${f.params.postJWTMethod}`, ``]

    let rawF = `return new Promise((result, reject) => {
        ${mainMethod}(q).then(d => {
            ${postJWTMethod}(d).then(s => {
                result(s)
            }).catch(e => { reject(e) })
        }).catch(e => { reject(e) })
    })`

    return Function("q", rawF)

}

function createGetById(x, f, p) {

    let rawF = `return new Promise((result, reject) => {
        if (!q) {
            return reject((\`ECHECK: !q\`))
        }
        q = String(q)
        global.dbh.${x.name}.$model.findById(q).then(data => {
            if (!data) {
                return reject(\`${"ENO" + x.name.toUpperCase()}\`)
            } else {
                return result(data)
            }
        }).catch(e => {
            return reject(\`${"ENO" + x.name.toUpperCase()}\`)
        })
    })`

    return Function("q", rawF)

}

module.exports = { createGetById, createInJWT, createOutJWT, createDelete, createInOutJWT, createGetJWT, createPostJWT, createCheck, createGet, createPost, createCache, createPut, createFind }