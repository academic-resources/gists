function _toConsumableArray(a) {
    if (Array.isArray(a)) {
        for (var b = 0, c = Array(a.length); b < a.length; b++) c[b] = a[b];
        return c
    }
    return Array.from(a)
}

function _classCallCheck(a, b) {
    if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function")
}

function _classCallCheck(a, b) {
    if (!(a instanceof b)) throw new TypeError("Cannot call a class as a function")
}

function _objectWithoutProperties(a, b) {
    var c = {};
    for (var d in a) b.indexOf(d) >= 0 || Object.prototype.hasOwnProperty.call(a, d) && (c[d] = a[d]);
    return c
}
define("core/utils/getEmbeddedData", [], function() {
    "use strict";
    return function(a) {
        var b = window.document.getElementById("disqus-" + a);
        try {
            return b && JSON.parse(b.textContent || b.innerHTML)
        } catch (c) {
            return null
        }
    }
}), define("core/utils/cookies", [], function() {
    "use strict";
    var a = {
        _doc: window.document,
        create: function(b, c, d) {
            d || (d = {});
            var e = b + "=" + c + "; path=" + (d.path || "/"),
                f = d.domain,
                g = d.expiresIn;
            if (f && (e += "; domain=." + f), "[object Number]" === Object.prototype.toString.call(g)) {
                var h = new Date((new Date).getTime() + g);
                e += "; expires=" + h.toGMTString()
            }
            "https:" === a._doc.location.protocol && (e += "; secure"), e += "; SameSite=None", a._doc.cookie = e
        },
        read: function(b) {
            for (var c, d = b + "=", e = a._doc.cookie.split(";"), f = 0; f < e.length; f++)
                if (c = e[f].replace(/^\s+/, ""), 0 === c.indexOf(d)) return c.substring(d.length);
            return null
        },
        erase: function(b, c) {
            var d = {};
            for (var e in c) c.hasOwnProperty(e) && (d[e] = c[e]);
            return d.expiresIn = -1, a.create(b, "", d)
        },
        supported: function() {
            return a.create("cookie_support", "1"), "1" === a.read("cookie_support") && (a.erase("cookie_support"), !0)
        }
    };
    return a
}), define("core/utils/fingerprint", [], function() {
    "use strict";

    function a(a) {
        a = a || {};
        var b = a.Math || window.Math,
            c = a.Date || window.Date;
        try {
            var d = (new c).getTimezoneOffset(),
                e = 1,
                f = window.screen;
            f && f.availWidth ? e = f.availWidth * f.availHeight + f.colorDepth : f && f.width && (e = f.width * f.height);
            var g = window.document.documentElement,
                h = g.clientWidth * g.clientHeight;
            return b.abs(17 * d + 25 * e - h)
        } catch (i) {
            return 1
        }
    }
    return {
        get: a
    }
}), define("core/utils/guid", ["core/utils/fingerprint"], function(a) {
    "use strict";

    function b(a) {
        a = a || {};
        var b = a.Uint32Array || window.Uint32Array,
            c = a.crypto || window.crypto,
            d = a.Math || window.Math;
        try {
            var e = new b(1);
            return c.getRandomValues(e), e[0]
        } catch (f) {
            return d.floor(1e9 * d.random())
        }
    }

    function c() {
        var a = window.performance,
            b = a && a.timing;
        if (!b) return 1e5;
        var c = b.domainLookupEnd - b.domainLookupStart,
            d = b.connectEnd - b.connectStart,
            e = b.responseStart - b.navigationStart;
        return 11 * c + 13 * d + 17 * e
    }

    function d(d) {
        d = d || {};
        var e = d.Math || window.Math,
            f = Number((new Date).getTime().toString().substring(3)),
            g = e.abs(f + c() - a.get()).toString(32);
        return g += b(d).toString(32)
    }
    return {
        generate: d
    }
}), define("core/utils/hash", [], function() {
    "use strict";
    var a = function(a) {
        var b, c, d, e = 0;
        if (0 === a.length) return e;
        for (b = 0, c = a.length; b < c; b++) d = a.charCodeAt(b), e = (e << 5) - e + d, e |= 0;
        return e
    };
    return {
        calculate: a
    }
}), define("core/analytics/identity", ["exports", "core/utils/cookies", "core/utils/guid", "core/utils/hash", "core/utils/fingerprint"], function(a, b, c, d, e) {
    "use strict";
    var f = !1,
        g = a.ImpressionManager = function() {
            this.isPrivate = !0, this.impId = c.generate()
        };
    g.prototype.COOKIE_NAME = "__jid", g.prototype.TTL = 18e5, g.prototype.init = function(a) {
        this.isPrivate = a && a.isPrivate, this.isPrivate || (this.prevImp = b.read(this.COOKIE_NAME)), this.persist()
    }, g.prototype.setImpressionId = function(a) {
        this.impId = a, this.persist()
    }, g.prototype.persist = function() {
        return this.isPrivate ? void b.erase(this.COOKIE_NAME) : void b.create(this.COOKIE_NAME, this.impId, {
            expiresIn: this.TTL
        })
    };
    var h = a.UniqueManager = function() {
        this.isPrivate = !0
    };
    h.prototype.COOKIE_NAME = "disqus_unique", h.prototype.TTL = 31536e6, h.prototype.init = function(a) {
        return this.isPrivate = a && a.isPrivate, this.isPrivate ? void b.erase(this.COOKIE_NAME, {
            domain: window.location.host.split(":")[0]
        }) : (this.value = b.read(this.COOKIE_NAME) || c.generate(), void b.create(this.COOKIE_NAME, this.value, {
            domain: window.location.host.split(":")[0],
            expiresIn: this.TTL
        }))
    }, h.prototype.isPersistent = function() {
        return !this.isPrivate && b.read(this.COOKIE_NAME) === this.value
    }, a.init = function(b, c) {
        f && !c || (a.impression.init(b), a.unique.init(b), f = !0)
    }, a.reset = function() {
        f = !1, a.impression = new g, a.unique = new h
    }, a.reset(), a.clientId = function() {
        var b, c = a.unique;
        return c.isPersistent() && (b = c.value), b || e.get().toString()
    }, a.getPercentBucketForString = function(a, b) {
        var c = 100,
            e = Math.abs(d.calculate(a));
        if (b) {
            var f = Math.pow(10, b);
            return e % (c * f) / f
        }
        return e % c
    }, a.clientPercent = function() {
        return a.getPercentBucketForString(a.clientId())
    }
}), define("core/config/urls", ["common/urls"], function(a) {
    "use strict";
    return a
}), define("core/analytics/jester", ["jquery", "underscore", "backbone", "core/analytics/identity", "core/config/urls"], function(a, b, c, d, e) {
    "use strict";
    var f = c.Model.extend({
            url: e.jester + "/event.js",
            defaults: {
                experiment: "default",
                variant: "control"
            },
            setHostReferrer: function(a) {
                a ? a.indexOf("http") === -1 || this.set("page_referrer", a) : this.set("page_referrer", "direct")
            },
            decoratePayload: function(c) {
                c.event || (c.event = "activity"), c = b.extend(this.toJSON(), c), b.extend(c, {
                    imp: d.impression.impId,
                    prev_imp: d.impression.prevImp
                }), c.section || (c.section = "default"), c.area || (c.area = "n/a");
                var e = a.param(c).length;
                if (e > 2048 && this.has("page_referrer")) {
                    var f = window.document.createElement("a");
                    f.href = this.get("page_referrer");
                    var g = f.hostname;
                    g && (c.page_referrer_domain = g), delete c.page_referrer
                }
                return c
            },
            emit: function(c) {
                return a.ajax({
                    url: b.result(this, "url"),
                    data: this.decoratePayload(c),
                    dataType: "script",
                    cache: !0
                })
            }
        }),
        g = function(b) {
            var c = new window.Image;
            return c.src = e.jester + "/stat.gif?" + a.param({
                event: b
            }), c
        },
        h = function(c, d) {
            if (!b.any(d, function(a) {
                    return a < 0
                })) {
                b.each(d, function(a, b) {
                    d[b] = Math.round(a)
                });
                var f = new window.Image;
                return f.src = e.jester + "/telemetry/" + c + ".gif?" + a.param(d), f
            }
        },
        i = new f;
    return i.setHostReferrer(window.document.referrer), {
        ActivityClient: f,
        client: i,
        logStat: g,
        telemetry: h
    }
}), define("core/utils/urls", [], function() {
    "use strict";
    var a = {},
        b = window.document.createElement("a");
    return a.getOrigin = function(a) {
        b.href = a;
        var c = b.href.split("/");
        return c[0] + "//" + c[2]
    }, a.getHostName = function(a) {
        return b.href = a, b.hostname
    }, a.getDomainPart = function(b, c) {
        "undefined" == typeof c && (c = 0);
        var d = a.getHostName(b),
            e = d.split(".").reverse();
        return e[c]
    }, a.getQuery = function(a) {
        return b.href = a, b.search
    }, a.getPathname = function(a) {
        return b.href = a, b.pathname
    }, a
}), define("core/frameBus", ["jquery", "underscore", "backbone", "core/utils/urls"], function(a, b, c, d) {
    "use strict";
    var e = window.opener || window.parent,
        f = window.name,
        g = window.document.referrer,
        h = {};
    h.client = d.getOrigin(window.document.location.href), h.secureClient = h.client.replace(/^\w+:\/\//, "https://"), h.host = g ? d.getOrigin(g) : h.client;
    var i = {
        origins: h,
        messageHandler: function(a) {
            a = a.originalEvent;
            var b;
            try {
                b = JSON.parse(a.data)
            } catch (c) {
                return
            }
            b.name && "!" === b.name[0] && a.origin !== h.client && a.origin !== h.secureClient || "client" === b.scope && i.trigger(b.name, b.data)
        },
        postMessage: function(a) {
            a = JSON.stringify(a), e.postMessage(a, "*")
        },
        sendHostMessage: function(a, b) {
            b = b || [], i.postMessage({
                scope: "host",
                sender: f,
                name: a,
                data: b
            })
        }
    };
    return b.extend(i, c.Events), a(window).on("message", i.messageHandler), a(window).on("unload", function() {
        i.sendHostMessage("die")
    }), window.DISQUS = window.DISQUS || {}, window.DISQUS.Bus = i, i
}), define("core/bus", ["backbone", "underscore", "core/frameBus"], function(a, b, c) {
    "use strict";
    var d = b.extend({}, a.Events);
    return d.frame = c, d
}), define("core/utils/storage", [], function() {
    "use strict";
    var a = function(a) {
            var b = "_dsqstorage_";
            try {
                return a.localStorage.setItem(b, b), a.localStorage.getItem(b), a.localStorage.removeItem(b), !0
            } catch (c) {
                return !1
            }
        }(window),
        b = function() {
            var a = {};
            return {
                getItem: function(b) {
                    return a.hasOwnProperty(b) ? a[b] : null
                },
                setItem: function(b, c) {
                    a[b] = String(c)
                },
                removeItem: function(b) {
                    delete a[b]
                },
                clear: function() {
                    a = {}
                }
            }
        }();
    return {
        get: function(a) {
            var b = null;
            try {
                return b = this.backend.getItem(a), JSON.parse(b)
            } catch (c) {
                return b
            }
        },
        set: function(a, b) {
            try {
                this.backend.setItem(a, JSON.stringify(b))
            } catch (c) {}
        },
        remove: function(a) {
            try {
                this.backend.removeItem(a)
            } catch (b) {}
        },
        clear: function() {
            try {
                this.backend.clear()
            } catch (a) {}
        },
        backend: a ? window.localStorage : b,
        isPersistent: a
    }
}), define("core/utils/auth", ["core/utils/cookies"], function(a) {
    "use strict";
    var b = {},
        c = "disqusauth";
    return b.getFromCookie = function() {
        var b = (a.read(c) || "").replace(/"/g, "").split("|");
        !b || b[1] && b[6] || (b = [], a.erase(c, {}));
        var d = parseInt(b[6] || "0", 10);
        return {
            avatarUrl: b[7] ? decodeURIComponent(b[7]) : void 0,
            datetimeFormatting: parseInt(b[4], 10) ? "absolute" : "relative",
            id: d,
            isModerator: parseInt(b[8], 10) > 0,
            staff: Boolean(parseInt(b[2], 10)),
            tzOffset: b[5],
            username: b[1],
            isAuthenticated: Boolean(d && "0" !== d)
        }
    }, b
}), define("core/switches", ["underscore", "remote/config", "core/analytics/identity", "core/utils/storage", "core/utils/auth"], function(a, b, c, d, e) {
    "use strict";
    var f = "switch:",
        g = {},
        h = {};
    return h._getKey = function(a) {
        return f + a
    }, h.disableFeature = function(a) {
        g[a] = !1
    }, h.resetFeature = function(a) {
        g[a] = null
    }, h.forceFeature = function(a) {
        g[a] = !0
    }, h.getSwitchContext = function(a) {
        var c = d.get(this._getKey(a));
        if (null !== c) return c;
        var e = g[a];
        return null != e ? e : (b.lounge && b.lounge.switches || {})[a]
    }, h.isFeatureActive = function(b, d) {
        var f = h.getSwitchContext(b);
        if (a.isBoolean(f)) return f;
        if (!f) return !1;
        var g = e.getFromCookie(),
            i = {
                percent: c.clientPercent(),
                user_id: g.id,
                username: g.username,
                is_staff: g.staff,
                is_moderator: g.isModerator
            },
            j = a.defaults(d || {}, i);
        return a.any(f, function(b, d) {
            var e = j[d];
            if (/percent$/.test(d) && a.isNumber(b)) {
                if (a.isNumber(e)) return b > e;
                if (a.isString(e)) {
                    var f = 0;
                    return b !== Math.round(b) && (f = b.toString().split(".").pop().length), b > c.getPercentBucketForString(e, f)
                }
                return !1
            }
            return a.isArray(b) ? a.contains(b, e) : b === e
        })
    }, h
}), define("core/utils/url/serializeArgs", ["require", "exports", "module", "core/utils/collection/each"], function(a, b, c) {
    "use strict";
    var d = a("core/utils/collection/each");
    c.exports = function(a) {
        var b = [];
        return d(a, function(a, c) {
            void 0 !== a && b.push(encodeURIComponent(c) + (null === a ? "" : "=" + encodeURIComponent(a)))
        }), b.join("&")
    }
}), define("core/utils/url/serialize", ["require", "exports", "module", "core/utils/url/serializeArgs"], function(a, b, c) {
    "use strict";
    var d = a("core/utils/url/serializeArgs");
    c.exports = function e(a, b, c) {
        if (b && (a.indexOf("?") === -1 ? a += "?" : "&" !== a.charAt(a.length - 1) && (a += "&"), a += d(b)), c) {
            var f = {};
            return f[(new Date).getTime()] = null, e(a, f)
        }
        var g = a.length;
        return "&" === a.charAt(g - 1) ? a.slice(0, g - 1) : a
    }
}), define("core/utils/isAdBlockEnabled", [], function() {
    "use strict";

    function a() {
        var a = d.createElement("div");
        return a.setAttribute("class", "pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links ad-text adSense adBlock adContent adBanner"), a.setAttribute("style", "width: 1px !important; height: 1px !important; position: absolute !important; left: -10000px !important; top: -1000px !important;"), a
    }

    function b(a) {
        if (null === a.offsetParent || 0 === a.offsetHeight || 0 === a.offsetLeft || 0 === a.offsetTop || 0 === a.offsetWidth || 0 === a.clientHeight || 0 === a.clientWidth) return !0;
        if (void 0 !== window.getComputedStyle) {
            var b = window.getComputedStyle(a, null);
            if (b && ("none" === b.getPropertyValue("display") || "hidden" === b.getPropertyValue("visibility"))) return !0
        }
        return !1
    }
    var c = 100,
        d = window.document;
    return function(e) {
        var f = a();
        d.body.appendChild(f), setTimeout(function() {
            var a = b(f);
            d.body.removeChild(f), e(a)
        }, c)
    }
}), define("core/utils/html/toRGBColorString", [], function() {
    "use strict";
    var a = "Color components should be numbers.";
    return function(b) {
        var c = Number(b.red),
            d = Number(b.green),
            e = Number(b.blue);
        if (isNaN(c) || isNaN(d) || isNaN(e)) throw new Error(a);
        var f = "rgb",
            g = [c, d, e],
            h = b.alpha;
        if (h) {
            if (h = Number(h), isNaN(h)) throw new Error(a);
            f += "a", g.push(h)
        }
        return f + "(" + g + ")"
    }
}), define("core/utils/lang/isString", [], function() {
    "use strict";
    return function(a) {
        return "[object String]" === Object.prototype.toString.call(a)
    }
}), define("core/utils/html/setInlineStyle", ["require", "core/utils/collection/each", "core/utils/lang/isString", "core/utils/object/extend"], function(a) {
    "use strict";

    function b(a) {
        return a.replace(/\s+/g, "").toLowerCase()
    }
    var c = a("core/utils/collection/each"),
        d = a("core/utils/lang/isString"),
        e = a("core/utils/object/extend");
    return function(a, f, g) {
        var h = {};
        d(f) ? h[f] = g : h = f;
        var i = e({}, h);
        c(i, function(a, c) {
            var d = b(c);
            d !== c && (delete i[c], i[d] = a), null === a && (i[d] = ""), void 0 === a && delete i[d]
        });
        var j = a.style;
        c(i, function(a, b) {
            j.setProperty(b, String(a), "important")
        })
    }
}), define("core/utils/html/parseColor", ["require", "core/utils/html/setInlineStyle"], function(a) {
    "use strict";

    function b(a) {
        return a.replace(/\s+/g, "").toLowerCase()
    }

    function c(a) {
        return a = a.replace(/^#([a-f0-9])([a-f0-9])([a-f0-9])$/, "#$1$1$2$2$3$3"), a = a.slice(1), {
            red: parseInt(a.slice(0, 2), 16),
            green: parseInt(a.slice(2, 4), 16),
            blue: parseInt(a.slice(4, 6), 16)
        }
    }

    function d(a) {
        var b = a.match(/^rgb\((\d+),(\d+),(\d+)\)$/);
        return {
            red: parseInt(b[1], 10),
            green: parseInt(b[2], 10),
            blue: parseInt(b[3], 10)
        }
    }

    function e(a) {
        var b = a.match(/^rgba\((\d+),(\d+),(\d+),([\d.]+)\)$/);
        return {
            red: parseInt(b[1], 10),
            green: parseInt(b[2], 10),
            blue: parseInt(b[3], 10),
            alpha: parseFloat(b[4])
        }
    }

    function f(a, b, c, d) {
        return b = window.document.createElement(b), h(b, {
            visibility: "hidden",
            color: c
        }), a.appendChild(b), c = d(b), a.removeChild(b), c
    }

    function g(a, c) {
        c = c || {};
        var e = c.container || window.document.body;
        return window.getComputedStyle ? (a = f(e, "span", a, function(a) {
            return window.getComputedStyle(a, null).getPropertyValue("color")
        }), d(b(a))) : (a = f(e, "textarea", a, function(a) {
            return a.createTextRange().queryCommandValue("ForeColor")
        }), {
            red: 255 & a,
            blue: a >>> 16,
            green: (65280 & a) >>> 8
        })
    }
    var h = a("core/utils/html/setInlineStyle");
    return function(a, f) {
        a = b(a);
        var h;
        if ("transparent" === a) return {
            red: 0,
            green: 0,
            blue: 0,
            alpha: 0
        };
        if ("#" === a.charAt(0)) h = c;
        else if ("rgba(" === a.slice(0, 5)) h = e;
        else if ("rgb(" === a.slice(0, 4)) h = d;
        else {
            if (!/^[a-z]+$/.test(a)) throw new Error("parseColor received unparseable color: " + a);
            h = g
        }
        return h(a, f)
    }
}), define("core/host/globalFromSandbox", ["require"], function(a) {
    "use strict";
    var b = window.document,
        c = b.createElement("iframe");
    return c.style.display = "none",
        function(a, d) {
            var e = d && d[a] || null;
            try {
                return c.parentNode !== b.body && b.body.appendChild(c), c.contentWindow[a] || e
            } catch (f) {
                return e
            }
        }
}), define("core/host/utils", ["require", "core/utils/browser", "core/utils/lang/isString", "core/utils/html/getCurrentStyle", "core/utils/html/parseColor", "core/host/globalFromSandbox"], function(a) {
    "use strict";

    function b(a) {
        for (var b = [/(https?:)?\/\/(www\.)?disqus\.com\/forums\/([\w_-]+)/i, /(https?:)?\/\/(www\.)?([\w_-]+)\.disqus\.com/i, /(https?:)?\/\/(www\.)?dev\.disqus\.org\/forums\/([\w_-]+)/i, /(https?:)?\/\/(www\.)?([\w_-]+)\.dev\.disqus\.org/i], c = 0; c < b.length; c++) {
            var d = a.match(b[c]);
            if (d && d.length && 4 === d.length) return d[3]
        }
        return null
    }

    function c(a, c, d) {
        var e = a.querySelector('script[src*="disqus"][src$="' + c + '"]');
        if (e) {
            var f = e.getAttribute ? e.getAttribute("src") : e.src;
            d = d || b;
            var g = d(f);
            return g ? g.toLowerCase() : null
        }
        return null
    }

    function d(a, b) {
        var c, d, e = 0,
            f = new Array(a.length);
        for (c = 0; c <= a.length; c++)
            for (f[c] = new Array(b.length), d = 0; d <= b.length; d++) f[c][d] = 0;
        for (c = 0; c < a.length; c++)
            for (d = 0; d < b.length; d++) a[c] === b[d] && (f[c + 1][d + 1] = f[c][d] + 1, f[c + 1][d + 1] > e && (e = f[c + 1][d + 1]));
        return e
    }

    function e() {
        for (var a = s.getElementsByTagName("h1"), b = s.title, c = b.length, e = b, f = .6, g = function(a) {
                var g, h = a.textContent || a.innerText;
                null !== h && void 0 !== h && (g = d(b, h) / c, g > f && (f = g, e = h))
            }, h = 0; h < a.length; h++) g(a[h]);
        return e
    }

    function f(a) {
        return a.toLowerCase().replace(/^\s+|\s+$/g, "").replace(/['"]/g, "")
    }

    function g(a) {
        var b = 0,
            c = 1,
            d = 2;
        if (!r("atob") || !r("requestAnimationFrame")) return c;
        try {
            a.postMessage("ping", "*")
        } catch (e) {
            return d
        }
        return b
    }

    function h(a, b, c) {
        c = c || b;
        var d = p(a, b, c);
        return !d || /color/i.test(b) && 0 === q(d).alpha ? a && h(a.parentNode, b, c) || d : d || null
    }

    function i(a, b, c, d) {
        o(b) && (b = s.createElement(b));
        var e = null;
        return b.style.visibility = "hidden", a.appendChild(b), e = h(b, c, d), a.removeChild(b), e
    }

    function j(a) {
        for (var b, c = i(a, "span", "font-family", "fontFamily"), d = c.split(","), e = {
                courier: 1,
                times: 1,
                "times new roman": 1,
                georgia: 1,
                palatino: 1,
                serif: 1
            }, g = 0; g < d.length; g++)
            if (b = f(d[g]), e.hasOwnProperty(b)) return !0;
        return !1
    }

    function k(a) {
        var b = s.createElement("a");
        return b.href = Number(new Date), q(i(a, b, "color"), {
            container: a
        })
    }

    function l(a) {
        var b = a.red,
            c = a.green,
            d = a.blue;
        if (a.hasOwnProperty("alpha")) {
            var e = a.alpha,
                f = function(a) {
                    return Math.round(a * e + 255 * (1 - e))
                };
            b = f(b), c = f(c), d = f(d)
        }
        return (299 * b + 587 * c + 114 * d) / 1e3
    }

    function m(a) {
        var b = i(a, "span", "background-color", "backgroundColor"),
            c = q(b, {
                container: a
            });
        return 0 === c.alpha ? "light" : l(c) < 128 ? "dark" : "light"
    }
    var n = a("core/utils/browser"),
        o = a("core/utils/lang/isString"),
        p = a("core/utils/html/getCurrentStyle"),
        q = a("core/utils/html/parseColor"),
        r = a("core/host/globalFromSandbox"),
        s = window.document,
        t = function() {
            var a, b, c = function() {
                return !1
            };
            if ("hidden" in s) a = "hidden", b = "visibilitychange";
            else {
                if (!("webkitHidden" in s)) return {
                    isHidden: c,
                    listen: c,
                    stopListening: c
                };
                a = "webkitHidden", b = "webkitvisibilitychange"
            }
            return {
                isHidden: function() {
                    return s[a]
                },
                listen: function(a) {
                    return s.addEventListener(b, a)
                },
                stopListening: function(a) {
                    return s.removeEventListener(b, a)
                }
            }
        }(),
        u = function() {
            var a = s.createElement("div");
            a.style.visibility = "hidden", a.style.width = "100px", a.style.msOverflowStyle = "scrollbar", s.body.appendChild(a);
            var b = a.offsetWidth;
            a.style.overflow = "scroll";
            var c = s.createElement("div");
            c.style.width = "100%", a.appendChild(c);
            var d = c.offsetWidth;
            return a.parentNode.removeChild(a), b - d
        },
        v = {
            getItem: function(a) {
                try {
                    return window.localStorage.getItem(a)
                } catch (b) {}
            },
            setItem: function(a, b) {
                try {
                    return window.localStorage.setItem(a, b)
                } catch (c) {}
            }
        },
        w = 1,
        x = function(a) {
            if (a.nodeType === w) {
                var b = p(a, "max-height", "maxHeight"),
                    c = p(a, "overflow-y", "overflowY");
                return b && "none" !== b && c && "visible" !== c
            }
        },
        y = 4,
        z = function(a) {
            if (a.nodeType === w) return a.scrollHeight - a.clientHeight > y
        },
        A = function() {
            if (s.querySelector) {
                var a = s.querySelector("link[rel=canonical]");
                if (a) return a.href
            }
        };
    return {
        MAX_Z_INDEX: 2147483647,
        getShortnameFromUrl: b,
        getForum: c,
        guessThreadTitle: e,
        getContrastYIQ: l,
        getColorScheme: m,
        getElementStyle: i,
        getAnchorColor: k,
        normalizeFontValue: f,
        isSerif: j,
        getBrowserSupport: g,
        pageVisibility: t,
        getScrollbarWidth: u,
        browser: n,
        storage: v,
        appearsToHideContent: x,
        hasOverflow: z,
        getCanonicalUrl: A
    }
}), define("common/utils", ["jquery", "underscore", "loglevel", "common/main", "common/urls", "core/host/utils", "core/utils/cookies", "core/utils/html/parseColor"], function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = window.document,
        j = {};
    j.globalUniqueId = function(a) {
        return b.uniqueId(a) + "_" + Number(new Date)
    }, j.setPublisherColor = function(a) {
        i.documentElement.style.setProperty("--publisher-color", a);
        var b = f.getContrastYIQ(h(a));
        b > 5 && b < 250 && i.documentElement.style.setProperty("--publisher-color-safe", a)
    }, j.addStylesheetRules = function(a) {
        function c() {
            var e = b.find(i.styleSheets, function(a) {
                var b = a.ownerNode || a.owningElement;
                return b.id === d
            });
            if (!e) return void setTimeout(c, 50);
            for (var f = 0, g = a.length; f < g; f++) {
                var h = 1,
                    j = a[f],
                    k = j[0],
                    l = "";
                "[object Array]" === Object.prototype.toString.call(j[1][0]) && (j = j[1], h = 0);
                for (var m = j.length; h < m; h++) {
                    var n = j[h];
                    l += n[0] + ":" + n[1] + (n[2] ? " !important" : "") + ";\n"
                }
                e.insertRule ? e.insertRule(k + "{" + l + "}", e.cssRules.length) : e.addRule(k, l, -1)
            }
        }
        var d = "css_" + (new Date).getTime(),
            e = i.createElement("style");
        e.id = d, i.getElementsByTagName("head")[0].appendChild(e), window.createPopup || e.appendChild(i.createTextNode("")), c()
    };
    var k = j.CORS = {
        handler: function(a, b, c) {
            a && c >= 200 && c < 300 ? a() : b && (c < 200 || c >= 300) && b()
        },
        XHR2: function(a, b, c, d) {
            var e = k.handler,
                f = new window.XMLHttpRequest;
            return f.open(a, b, !0), f.onreadystatechange = function() {
                f.readyState === window.XMLHttpRequest.DONE && e(c, d, f.status)
            }, f
        }
    };
    k.request = function() {
        return "withCredentials" in new window.XMLHttpRequest ? k.XHR2 : function() {
            return null
        }
    }(), j.isWindowClosed = function(a) {
        if (!a) return !0;
        try {
            return a.closed || void 0 === a.closed
        } catch (b) {
            return !0
        }
    }, j.truncate = function(a, b, c) {
        return c = c || "...", a.length > b ? a.slice(0, b) + c : a
    }, j.extractDomainForCookies = function(a) {
        return a.split("/")[2].replace(/:[0-9]+/, "")
    }, j.cookies = {
        domain: j.extractDomainForCookies(e.root),
        create: function(a, b) {
            var c = 31536e6;
            g.create(a, b, {
                domain: j.cookies.domain,
                expiresIn: c
            })
        },
        read: g.read,
        erase: function(a) {
            g.erase(a, {
                domain: j.cookies.domain
            })
        }
    }, j.updateURL = function(a, c) {
        var d, e = i.createElement("a");
        return c = c || {}, e.href = a, c.hostname && c.hostname.match(/\.$/) && (c.hostname += e.hostname), d = b.extend({
            protocol: e.protocol,
            hostname: e.hostname,
            pathname: e.pathname,
            search: e.search
        }, c), d.pathname.match(/^\//) || (d.pathname = "/" + d.pathname), d.protocol + "//" + d.hostname + d.pathname + d.search
    }, j.injectBaseElement = function(a, b) {
        b = b || i;
        var c = b.getElementsByTagName("base")[0] || b.createElement("base");
        c.target = "_parent", a ? c.href = a : c.removeAttribute("href"), c.parentNode || (b.head || b.getElementsByTagName("head")[0]).appendChild(c)
    }, j.syntaxHighlighter = function() {
        var c = 1,
            e = 2,
            f = null,
            g = null,
            h = [],
            i = {
                highlight: function(a) {
                    null === g && i._load(), h.push(a), g === e && i.scheduleHighlight()
                },
                _highlight: function(b) {
                    var c = a(b).html();
                    a(b).html(c.replace(/^<br>/, "")), f.highlightBlock(b), i.scheduleHighlight()
                },
                scheduleHighlight: function() {
                    var a = h.shift();
                    a && window.requestAnimationFrame(b.bind(i._highlight, i, a))
                },
                _load: function() {
                    g = c, d.loadCss("https://c.disquscdn.com/next/embed/styles/highlight.3128dd90ecaebd8542ac3442033f3f00.css"), require(["common/vendor_extensions/highlight"], function(a) {
                        g = e, f = a, i.scheduleHighlight()
                    })
                }
            };
        return i
    }();
    var l = a("html");
    j.getPageHeight = function() {
        var b = a("#tos__message"),
            c = b.outerHeight();
        return c && (c += b.offset().top), Math.max(c, l.height())
    }, j.calculatePositionFullscreen = function() {
        return {
            pageOffset: a(window).scrollTop(),
            height: i.documentElement.clientHeight,
            frameOffset: {
                left: 0,
                top: 0
            }
        }
    }, j.triggerClick = function(a, b) {
        var c, d, e = a[0],
            f = {
                altKey: !1,
                button: 0,
                ctrlKey: !1,
                metaKey: !1,
                shiftKey: !1
            };
        if (i.createEvent) {
            if (c = i.createEvent("MouseEvents"), b)
                for (d in f) f.hasOwnProperty(d) && b.hasOwnProperty(d) && (f[d] = b[d]);
            c.initMouseEvent("click", !0, !0, window, 0, 0, 0, 0, 0, f.ctrlKey, f.altKey, f.shiftKey, f.metaKey, 0, null), e.dispatchEvent && e.dispatchEvent(c)
        } else if (i.createEventObject) {
            if (c = i.createEventObject(), c.eventType = "click", b)
                for (d in f) f.hasOwnProperty(d) && b.hasOwnProperty(d) && (c[d] = b[d]);
            e.fireEvent("onclick", c)
        }
    }, j.delayLinkClick = function(a, c) {
        a.preventDefault(), b.delay(b.bind(j.triggerClick, this, c, a.originalEvent), 100)
    }, j.mixin = function(a, c, d) {
        var e = a.prototype,
            f = b.extend({}, c, d);
        if (b.defaults(e, f), b.defaults(e.events, f.events), void 0 !== e.initialize && void 0 !== f.initialize) {
            var g = e.initialize;
            e.initialize = function() {
                var a = g.apply(this, arguments);
                return f.initialize.apply(this, arguments), a
            }
        }
        return a
    }, j.extractService = function(b, c) {
        var d = "[data-action^=" + c + "]",
            e = a(b);
        e = e.is(d) && e || e.closest(d);
        var f = e.attr("data-action") || ":",
            g = f.split(":")[1];
        return g
    }, j.getConfigFromHash = function(a) {
        var d, e = a.location.hash;
        try {
            d = JSON.parse(decodeURIComponent(String(e).substr(1)))
        } catch (f) {
            c.debug("Failed to parse config from URL hash", f)
        }
        return b.isObject(d) ? d : {}
    };
    var m = /[<>]|:\/\//;
    return j.isPlainText = function(a) {
        return !a.match(m)
    }, j.isDNTEnabled = function(a) {
        return a || (a = window), "1" === a.navigator.doNotTrack || "yes" === a.navigator.doNotTrack || "1" === a.navigator.msDoNotTrack
    }, j.shouldSample = function(a) {
        var b = parseInt(a, 10);
        return !!b && (!(b > 100) && Math.random() < b / 100)
    }, j.decorate = function() {
        var a, c = b.toArray(arguments),
            d = c.pop();
        return b.isFunction(d) || (a = d, d = c.pop()), b.reduceRight(c, function(b, c) {
            return c.call(a || this, b)
        }, function() {
            return d.apply(a || this, arguments)
        })
    }, j
}), define("lounge/common", [], function() {
    "use strict";
    var a, b = function(b) {
            a = b
        },
        c = function() {
            return a
        };
    return {
        setLounge: b,
        getLounge: c
    }
}), define("lounge/tracking", ["jquery", "underscore", "raven", "core/analytics/identity", "core/analytics/jester", "core/bus", "common/urls", "core/switches", "core/utils", "core/utils/hash", "core/utils/url/serialize", "core/utils/isAdBlockEnabled", "core/utils/html/toRGBColorString", "remote/config", "common/utils", "common/main", "lounge/common"], function(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q) {
    "use strict";

    function r(n, q) {
        function r(a, c, f) {
            var i = {
                abe: f ? "1" : "0",
                embed_hidden: q.config.isBehindClick ? "1" : "0",
                integration: q.config.integration,
                load_time: Number(new Date) - p.timings.initStart - (p.timings.renderStart && p.timings.bootstrapStart ? p.timings.renderStart - p.timings.bootstrapStart : 0)
            };
            if (h.isFeatureActive("init_embed_activity")) b.extend(i, {
                verb: "load",
                object_type: "product",
                object_id: "embed"
            }), e.client.emit(i);
            else {
                var j = a.user.id,
                    l = o.isDNTEnabled();
                b.extend(i, {
                    event: "init_embed",
                    thread: C,
                    forum: z,
                    forum_id: A,
                    imp: d.impression.impId,
                    prev_imp: d.impression.prevImp,
                    thread_slug: B.get("slug"),
                    user_type: a.user.get("user_type") || "anon",
                    referrer: n.document.referrer,
                    theme: "next",
                    dnt: l ? "1" : "0",
                    tracking_enabled: c ? "1" : "0"
                }, q.config.experiment), j && "0" !== j && (i.user_id = j);
                var m = y.get("settings");
                m && b.has(m, "adsProductLinksEnabled") && b.extend(i, {
                    promoted_enabled: m.adsProductLinksEnabled,
                    max_enabled: m.adsPositionTopEnabled
                }), (new n.Image).src = k(g.jester + "/event.gif", i, !1)
            }
            if (B.isModerator(a.user)) {
                var r = n.document.createElement("iframe");
                r.src = "https://disqusads.com/enable-logging", r.style.display = "none", n.document.body.appendChild(r)
            }
        }

        function t(a) {
            w = !0, x = a, s.shouldTrack(y, q.session.user) && (d.init({}, !0), s.load3rdParties(B, q))
        }
        var y = q.forum,
            z = y.id,
            A = y.get("pk"),
            B = q.thread,
            C = B.id;
        q.session.on("change:id", function(a) {
            e.client.set("user_id", a.id)
        }), q.session.once("change:id", function() {
            var b = this,
                c = s.shouldTrack(y, this.user);
            if (q.config.isPrivate && this.user && this.user.get("hasAcceptedGdprTerms") && d.init({
                    isPrivate: !1
                }, !0), c && s.load3rdParties(B, q), !v && y.get("settings").adsEnabled && h.isFeatureActive("zyncOnly")) {
                var e = s.shouldTrack(y, this.user, !0);
                e && (a("body").append(a("<img>").hide().attr("src", g.zyncPixelImage + "&cid=c" + d.unique.value)), v = !0)
            }
            l(function(a) {
                r(b, c, a)
            }), f.frame.sendHostMessage("tracking:init", {
                shouldTrack: c,
                isMobile: i.isMobileUserAgent(n),
                hostIdentityActive: h.isFeatureActive("hostIdentityActive", {
                    forum: y.id,
                    forumPercent: y.id
                })
            })
        }), e.client.set({
            product: "embed",
            thread: C,
            thread_id: C,
            forum: z,
            forum_id: A,
            zone: "thread",
            version: p.version
        }), q.once("bootstrap:complete", function() {
            e.client.set({
                page_url: q.config.referrer
            });
            var a = q.config.experiment;
            a && e.client.set({
                experiment: a.experiment,
                variant: a.variant,
                service: a.service
            }), e.client.setHostReferrer(q.config.hostReferrer)
        });
        var D = {
            inViewport: function() {
                var c = q.config,
                    d = {
                        color_scheme: c.colorScheme,
                        anchor_color: m(c.anchorColor),
                        typeface: c.typeface,
                        width: a(n.document).width()
                    };
                d = b.pick(d, function(a, c) {
                    switch (c) {
                        case "width":
                            return b.isNumber(a);
                        default:
                            return b.isString(a) && "" !== a
                    }
                }), e.client.emit({
                    verb: "view",
                    object_type: "product",
                    object_id: "embed",
                    extra_data: JSON.stringify(d)
                }), q.off("inViewport")
            },
            "uiCallback:postCreated": function(a, c) {
                c = c || {}, b.extend(c, {
                    object_type: "post",
                    object_id: a.id,
                    verb: "post"
                }), a.has("parent") && (c.target_type = "post", c.target_id = a.get("parent")), e.client.emit(c)
            },
            "uiCallback:postUpdated": function(a, c) {
                c = c || {}, b.extend(c, {
                    object_type: "post",
                    object_id: a.id,
                    verb: "update"
                }), e.client.emit(c)
            },
            "uiAction:postStartUpdate": function(a, c) {
                c = c || {}, b.extend(c, {
                    verb: "click",
                    adjective: "edit",
                    object_type: "link",
                    object_id: a.id
                }), e.client.emit(c)
            },
            "uiAction:seeMore": function(a) {
                e.client.emit({
                    verb: "open",
                    object_type: "section",
                    object_id: "thread/page-" + a
                })
            },
            "uiAction:seeMoreChildren": function(a) {
                e.client.emit({
                    verb: "click",
                    object_type: "link",
                    object_id: "show_more_comments",
                    area: s.getEventTrackingArea(a)
                })
            },
            "uiAction:postUpvote": function(a, b) {
                e.client.emit({
                    verb: "like",
                    object_type: "post",
                    object_id: a.id,
                    area: s.getEventTrackingArea(b)
                })
            },
            "uiAction:postUnvote": function(a, b) {
                e.client.emit({
                    verb: "unlike",
                    object_type: "post",
                    object_id: a.id,
                    area: s.getEventTrackingArea(b)
                })
            },
            "uiAction:postDownvote": function(a, b) {
                e.client.emit({
                    verb: "dislike",
                    object_type: "post",
                    object_id: a.id,
                    area: s.getEventTrackingArea(b)
                })
            },
            "uiAction:threadUnlike": function() {
                e.client.emit({
                    verb: "unlike",
                    object_type: "thread",
                    zone: "thread"
                })
            },
            "uiAction:threadLike": function() {
                e.client.emit({
                    verb: "like",
                    object_type: "thread"
                })
            },
            "uiAction:postShare": function(a, b) {
                e.client.emit({
                    verb: "share",
                    object_type: "post",
                    object_id: a.id,
                    target_type: "service",
                    target_id: b
                })
            },
            "uiAction:threadShare": function(a) {
                e.client.emit({
                    verb: "share",
                    object_type: "thread",
                    target_type: "service",
                    target_id: a
                })
            },
            "uiAction:clickLink": function(a, b) {
                e.client.emit({
                    verb: "click",
                    object_type: "link",
                    object_id: a[0].href,
                    area: s.getEventTrackingArea(b)
                })
            },
            "uiAction:followUser": function(a) {
                e.client.emit({
                    verb: "follow",
                    object_type: "user",
                    object_id: a.id
                })
            },
            "uiAction:unfollowUser": function(a) {
                e.client.emit({
                    verb: "stop-following",
                    object_type: "user",
                    object_id: a.id
                })
            },
            "uiAction:openLogin": function(a) {
                e.client.emit({
                    verb: "open",
                    object_type: "login",
                    object_id: a
                })
            },
            "uiAction:onboardAlertShow": function() {
                e.client.emit({
                    verb: "view",
                    object_type: "area",
                    object_id: "onboard_alert"
                })
            },
            "uiAction:onboardAlertDismiss": function() {
                e.client.emit({
                    verb: "close",
                    object_type: "area",
                    object_id: "onboard_alert"
                })
            },
            "uiAction:openHome": function(a, b) {
                e.client.emit({
                    verb: "open",
                    object_type: "product",
                    object_id: b ? "bridge" : "home",
                    section: a
                })
            },
            "uiAction:viewBanUser": function() {
                e.client.emit({
                    verb: "view",
                    object_type: "area",
                    object_id: "ban_user"
                })
            },
            "uiAction:clickBanUser": function(a) {
                e.client.emit({
                    verb: "click",
                    object_type: "button",
                    object_id: "ban_user",
                    extra_data: a
                })
            },
            "uiAction:viewFlagPost": function() {
                e.client.emit({
                    verb: "view",
                    object_type: "area",
                    object_id: "flag_post"
                })
            },
            "uiAction:clickFlagPost": function() {
                e.client.emit({
                    verb: "click",
                    object_type: "button",
                    object_id: "flag_post"
                })
            },
            "uiAction:viewBlockUser": function() {
                e.client.emit({
                    verb: "view",
                    object_type: "area",
                    object_id: "block_user"
                })
            },
            "uiAction:clickBlockUser": function() {
                e.client.emit({
                    verb: "click",
                    object_type: "button",
                    object_id: "block_user"
                })
            },
            "uiAction:viewUpgradeCard": function() {
                e.client.emit({
                    verb: "hover",
                    object_type: "icon",
                    object_id: "disqus_pro",
                    organization_id: y.get("organizationId")
                })
            },
            "uiAction:clickUpgrade": function() {
                e.client.emit({
                    verb: "click",
                    object_type: "button",
                    object_id: "subscriptions",
                    organization_id: y.get("organizationId")
                })
            },
            "uiAction:clickCommentPolicy": function(a) {
                e.client.emit({
                    verb: "click",
                    object_type: "link",
                    section: "comment_policy",
                    object_id: a
                })
            },
            "uiAction:clickThreadPremoderate": function() {
                e.client.emit({
                    verb: "click",
                    object_type: "button",
                    object_id: "premoderate_thread"
                })
            },
            viewActivity: function(a, b) {
                var c = {
                    verb: "view",
                    object_type: a,
                    object_id: b
                };
                e.client.emit(c)
            },
            "uiAction:loadEmailSubscriptionPrompt": function(a) {
                e.client.emit({
                    verb: "load",
                    object_type: "section",
                    object_id: "email_subscriptions",
                    section: "email_subscriptions",
                    extra_data: JSON.stringify({
                        user_verified: Boolean(q.session.user && q.session.user.get("isVerified")),
                        email_subscription_prompt: a
                    })
                })
            },
            "uiAction:viewEmailSubscriptionPrompt": function(a) {
                e.client.emit({
                    verb: "view",
                    object_type: "section",
                    object_id: "email_subscriptions",
                    section: "email_subscriptions",
                    extra_data: JSON.stringify({
                        user_verified: Boolean(q.session.user && q.session.user.get("isVerified")),
                        email_subscription_prompt: a
                    })
                })
            },
            "uiAction:clickEmailSubscriptionPromptSubscribe": function(a) {
                e.client.emit({
                    verb: "click",
                    object_type: "button",
                    object_id: "subscribe",
                    section: "email_subscriptions",
                    extra_data: JSON.stringify({
                        user_verified: Boolean(q.session.user && q.session.user.get("isVerified")),
                        email_subscription_prompt: a
                    })
                })
            },
            "uiAction:clickEmailSubscriptionPromptDismiss": function(a) {
                e.client.emit({
                    verb: "click",
                    object_type: "button",
                    object_id: "hide_this_message",
                    section: "email_subscriptions",
                    extra_data: JSON.stringify({
                        user_verified: Boolean(q.session.user && q.session.user.get("isVerified")),
                        email_subscription_prompt: a
                    })
                })
            },
            "uiAction:viewReactionsPromotion": function() {
                e.client.emit({
                    verb: "view",
                    object_type: "section",
                    object_id: "reactions_onboarding",
                    zone: "thread",
                    section: "reactions_onboarding"
                })
            },
            "uiAction:reactionsEnable": function() {
                e.client.emit({
                    verb: "click",
                    object_type: "button",
                    object_id: "enable_reactions",
                    zone: "thread",
                    section: "reactions_onboarding"
                })
            },
            "uiAction:reactionsDefer": function() {
                e.client.emit({
                    verb: "click",
                    object_type: "button",
                    object_id: "maybe_later",
                    zone: "thread",
                    section: "reactions_onboarding"
                })
            },
            "uiAction:reactionsVote": function(a) {
                e.client.emit({
                    verb: "vote",
                    object_type: "thread",
                    adjective: a.get("text"),
                    zone: "thread",
                    section: "reactions",
                    extra_data: JSON.stringify({
                        reaction_id: a.id
                    })
                })
            },
            "uiAction:gifsClickButton": function() {
                e.client.emit({
                    verb: "click",
                    object_type: "button",
                    adjective: "gif_picker",
                    object_id: "thread",
                    zone: "thread"
                })
            },
            "uiAction:gifsScrollToBottom": function() {
                e.client.emit({
                    verb: "view",
                    adverb: "results",
                    object_type: "zone",
                    adjective: "end",
                    object_id: "thread",
                    zone: "thread"
                })
            },
            "uiAction:loadLiveComments": function() {
                e.client.emit({
                    verb: "click",
                    adverb: "comments",
                    object_type: "notification",
                    adjective: "realtime",
                    object_id: "thread",
                    zone: "thread"
                })
            },
            "uiAction:loadLiveReplies": function() {
                e.client.emit({
                    verb: "click",
                    adverb: "replies",
                    object_type: "notification",
                    adjective: "realtime",
                    object_id: "thread",
                    zone: "thread"
                })
            },
            "uiAction:clickBadge": function(a, b) {
                e.client.emit({
                    verb: "click",
                    object_type: "badge",
                    object_id: b,
                    section: "profile/badges",
                    zone: "thread",
                    area: s.getEventTrackingArea(a)
                })
            },
            "uiAction:viewBadgeModal": function() {
                e.client.emit({
                    verb: "view",
                    object_type: "modal",
                    object_id: "badge",
                    section: "manage_badges",
                    zone: "thread"
                })
            },
            "uiAction:awardBadge": function(a) {
                e.client.emit({
                    verb: "award",
                    object_type: "badge",
                    object_id: a,
                    section: "manage_badges",
                    zone: "thread"
                })
            },
            "uiAction:removeBadge": function(a) {
                e.client.emit({
                    verb: "remove",
                    object_type: "badge",
                    object_id: a,
                    section: "manage_badges",
                    zone: "thread"
                })
            },
            "uiAction:behindClickButton": function() {
                e.client.emit({
                    verb: "click",
                    object_type: "button",
                    adjective: "behind_click",
                    object_id: "thread",
                    zone: "thread"
                })
            }
        };
        q.on(D), f.on(D), f.frame.once("cmp.consent", t), f.frame.once("tracking.hostIdentity", function(b) {
            if (!u) {
                var e = [j.calculate(b.domain), b.id, d.unique.value],
                    f = a("body"),
                    h = g.logger + "/1/" + n.btoa(JSON.stringify(e));
                try {
                    f.append(a("<img>").hide().attr("src", h))
                } catch (i) {
                    c.captureException(i)
                }
                u = !0
            }
        })
    }
    var s = {},
        t = !1,
        u = !1,
        v = !1,
        w = !1,
        x = {};
    return s.init = function(a) {
        r(window, a)
    }, s.getEventTrackingArea = function(b) {
        return a(b.currentTarget).closest("[data-tracking-area]").attr("data-tracking-area")
    }, s.load3rdParties = function(d, e) {
        if (g.glitter && !t) {
            var f = n.lounge.tracking || {},
                h = f.iframe_limit || 0,
                i = {
                    postCount: d.get("posts") || 0,
                    likeCount: d.get("likes") || 0,
                    postVoteCount: b.reduce(d.posts.pluck("likes"), function(a, b) {
                        return a + b
                    }, 0),
                    referrer: encodeURIComponent(e.config.referrer),
                    tcString: x.tcString || ""
                };
            a.ajax({
                dataType: "jsonp",
                cache: !0,
                url: g.glitter,
                data: {
                    forum_shortname: d.forum.id,
                    thread_id: d.id,
                    referer: e.config.hostReferrer
                },
                jsonpCallback: "dsqGlitterResponseHandler",
                success: function(d) {
                    var e = a("body");
                    b.each(d, function(d) {
                        if (!("img" !== d.type && "iframe" !== d.type || "iframe" === d.type && (h -= 1, h < 0))) {
                            var f;
                            try {
                                f = d.url.replace(/\{\{(.+?)\}\}/g, function(a, c) {
                                    var d = c.trim();
                                    if (!i.hasOwnProperty(d)) throw new Error("Unknown template variable in tracker URL: " + d);
                                    return b.escape(i[d])
                                }), e.append(a("<" + d.type + ">").hide().attr("src", f))
                            } catch (g) {
                                c.captureException(g)
                            }
                        }
                    })
                }
            }), t = !0
        }
    }, s.shouldTrack = function(a, b) {
        var c = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
        return !(Boolean(a && a.get("settings").disable3rdPartyTrackers ^ c) || b && b.get("disable3rdPartyTrackers") || "1" === o.cookies.read("disqus_tracking_optout") || o.isDNTEnabled() || s.isPrivate(b))
    }, s.isPrivate = function(a) {
        return q.getLounge().config.isPrivate && (!a || !a.get("hasAcceptedGdprTerms")) && !w
    }, s.reset = function() {
        t = !1, u = !1, v = !1, w = !1, x = {}
    }, s
}), define("common/jsxUtils", ["underscore"], function(a) {
    "use strict";
    return {
        append: function(b, c) {
            var d = function e(c) {
                if (null !== c) return a.isArray(c) ? void c.forEach(e) : a.isElement(c) || c && c.nodeType === window.Node.DOCUMENT_FRAGMENT_NODE ? void b.appendChild(c) : void b.appendChild(window.document.createTextNode(c))
            };
            d(c)
        }
    }
});
var _extends = Object.assign || function(a) {
    for (var b = 1; b < arguments.length; b++) {
        var c = arguments[b];
        for (var d in c) Object.prototype.hasOwnProperty.call(c, d) && (a[d] = c[d])
    }
    return a
};
define("react", ["jquery", "underscore", "common/jsxUtils"], function(a, b, c) {
    "use strict";
    var d = window.document;
    return {
        createElement: function(e, f) {
            for (var g = arguments.length, h = Array(g > 2 ? g - 2 : 0), i = 2; i < g; i++) h[i - 2] = arguments[i];
            if ("function" == typeof e) {
                h.length > 0 && (f = _extends({
                    children: 1 === h.length ? h[0] : h
                }, f));
                var j = e(f);
                if (b.isArray(j)) {
                    var k = d.createDocumentFragment();
                    return c.append(k, j), k
                }
                return j
            }
            if ("string" != typeof e) throw new Error("Unknown type");
            var l = d.createElement(e),
                m = !1;
            return f && Object.keys(f).forEach(function(b) {
                var c = f[b];
                if (/^(?:data-|aria-|role$)/.test(b)) null !== c && l.setAttribute(b, c);
                else if ("dangerouslySetInnerHTML" === b) m = !0, l.innerHTML = c && c.__html || "";
                else if ("style" === b) Object.keys(c).forEach(function(a) {
                    l.style[a] = c[a]
                });
                else if (/^on[A-Z]/.test(b)) c && a(l).on(b.slice(2).toLowerCase(), c);
                else if ("key" === b);
                else try {
                    l[b] = c
                } catch (d) {}
            }), m || c.append(l, h), l
        }
    }
}), define("react-dom", ["common/jsxUtils"], function(a) {
    "use strict";
    return {
        render: function(b, c, d) {
            return c && (c.innerHTML = "", a.append(c, b)), d && d(), null
        }
    }
}), define("core/shared/urls", ["require", "core/utils/object/extend", "core/utils/url/serialize", "core/utils/url/serializeArgs"], function(a) {
    "use strict";
    var b = a("core/utils/object/extend"),
        c = a("core/utils/url/serialize"),
        d = a("core/utils/url/serializeArgs"),
        e = "default",
        f = {
            lounge: "http://disqus.com/embed/comments/",
            home: "https://disqus.com/home/".replace("home/", ""),
            recommendations: "http://disqus.com/recommendations/"
        },
        g = function(a) {
            return "https://" + a.replace(/^\s*(\w+:)?\/\//, "")
        },
        h = function(a, h, i) {
            var j = f[a];
            if (!j) throw new Error("Unknown app: " + a);
            var k = g(j),
                l = b({
                    base: e
                }, h || {}),
                m = i ? "#" + d(i) : "";
            return c(k, l) + m
        };
    return {
        BASE: e,
        apps: f,
        get: h,
        ensureHTTPSProtocol: g
    }
}), define("core/apps/BaseApp", ["require", "core/Events", "core/utils/object/extend", "core/utils/object/has", "core/utils/uniqueId"], function(a) {
    "use strict";
    var b = a("core/Events"),
        c = a("core/utils/object/extend"),
        d = a("core/utils/object/has"),
        e = a("core/utils/uniqueId"),
        f = function(a) {
            this.uid = e("dsq-app"), this.settings = a || {};
            var b = [],
                c = this.constructor.prototype;
            do b.unshift(c), c = c.constructor.__super__; while (c);
            for (var f = 0, g = b.length; f < g; f++) c = b[f], d(c, "events") && this.on(c.events, this), d(c, "onceEvents") && this.once(c.onceEvents, this)
        };
    return c(f.prototype, b), f.prototype.destroy = function() {
        this.off(), this.stopListening()
    }, f.extend = function(a, b) {
        var e, f = this;
        e = a && d(a, "constructor") ? a.constructor : function() {
            return f.apply(this, arguments)
        }, c(e, f, b);
        var g = function() {
            this.constructor = e
        };
        return g.prototype = f.prototype, e.prototype = new g, a && c(e.prototype, a), e.__super__ = f.prototype, e
    }, f
}), define("core/common/kernel/utils", ["require"], function(a) {
    "use strict";

    function b(a) {
        return e.getElementById(a) || e.body || e.documentElement
    }

    function c(a) {
        return f.href = a, f.hostname
    }

    function d(a, b) {
        b = b || e.documentElement;
        for (var c = a, d = 0, f = 0; c && c !== b;) d += c.offsetLeft, f += c.offsetTop, c = c.offsetParent;
        return {
            top: f,
            left: d,
            height: a.offsetHeight,
            width: a.offsetWidth
        }
    }
    var e = window.document,
        f = e.createElement("a");
    return {
        getContainer: b,
        getHost: c,
        getOffset: d
    }
}), define("core/host/json", ["require", "core/host/globalFromSandbox"], function(a) {
    "use strict";
    var b, c = window,
        d = a("core/host/globalFromSandbox");
    return b = "[object JSON]" === c.Object.prototype.toString.call(c.JSON) ? c.JSON : d("JSON", c), b ? b : {}
}), define("core/common/kernel/WindowBase", ["require", "core/Events", "core/utils/object/extend", "core/utils/uniqueId", "core/common/kernel/utils", "core/host/json"], function(a) {
    "use strict";
    var b = a("core/Events"),
        c = a("core/utils/object/extend"),
        d = a("core/utils/uniqueId"),
        e = a("core/common/kernel/utils"),
        f = a("core/host/json"),
        g = function(a) {
            a = a || {}, this.state = g.INIT, this.uid = a.uid || d("dsq-frame"), this.origin = a.origin, a.useSourcelessFrame ? this.host = e.getHost(window.location.href) : this.host = e.getHost(this.origin), this.target = a.target, this.sandbox = a.sandbox, this.window = null, g.windows[this.uid] = this, this.on("ready", function() {
                this.state = g.READY
            }, this), this.on("die", function() {
                this.state = g.KILLED
            }, this)
        };
    return c(g, {
        INIT: 0,
        READY: 1,
        KILLED: 2,
        windows: {},
        postMessage: function(a, b, c) {
            return a.postMessage(b, c)
        }
    }), c(g.prototype, b), g.prototype.requiresWindow = function(a) {
        var b = this;
        return function() {
            var c = Array.prototype.slice.call(arguments),
                d = function() {
                    var e = b.window;
                    e ? a.apply(b, c) : setTimeout(d, 500)
                };
            b.isReady() ? d() : b.on("ready", d)
        }
    }, g.prototype.sendMessage = function(a, b) {
        var c = f.stringify({
            scope: "client",
            name: a,
            data: b
        });
        this.requiresWindow(function(a) {
            g.postMessage(this.window, a, this.origin)
        })(c)
    }, g.prototype.hide = function() {}, g.prototype.show = function() {}, g.prototype.url = function() {
        return this.target
    }, g.prototype.destroy = function() {
        this.state = g.KILLED, this.off()
    }, g.prototype.isReady = function() {
        return this.state === g.READY
    }, g.prototype.isKilled = function() {
        return this.state === g.KILLED
    }, g
}), define("core/common/kernel/Iframe", ["require", "core/utils/html/setInlineStyle", "core/utils/object/extend", "core/common/kernel/WindowBase", "core/common/kernel/utils"], function(a) {
    "use strict";
    var b = a("core/utils/html/setInlineStyle"),
        c = a("core/utils/object/extend"),
        d = a("core/common/kernel/WindowBase"),
        e = a("core/common/kernel/utils"),
        f = window.document,
        g = function(a) {
            d.call(this, a), this.styles = a.styles || {}, this.tabIndex = a.tabIndex || 0, this.title = a.title || "Disqus", this.sandbox = a.sandbox, this.container = a.container, this.elem = null
        };
    return c(g.prototype, d.prototype), g.prototype.load = function() {
        var a = this.elem = f.createElement("iframe");
        a.setAttribute("id", this.uid), a.setAttribute("name", this.uid), a.setAttribute("allowTransparency", "true"), a.setAttribute("frameBorder", "0"), a.setAttribute("scrolling", "no"), this.role && a.setAttribute("role", this.role), a.setAttribute("tabindex", this.tabIndex), a.setAttribute("title", this.title), "string" == typeof this.sandbox && a.setAttribute("sandbox", this.sandbox), this.setInlineStyle(this.styles)
    }, g.prototype.getOffset = function(a) {
        return e.getOffset(this.elem, a)
    }, g.prototype.setInlineStyle = function(a, c) {
        return b(this.elem, a, c)
    }, g.prototype.removeInlineStyle = function(a) {
        var b = this.elem.style;
        return "removeProperty" in b ? void b.removeProperty(a) : void(b[a] = "")
    }, g.prototype.hide = function() {
        this.setInlineStyle("display", "none")
    }, g.prototype.show = function() {
        this.removeInlineStyle("display")
    }, g.prototype.destroy = function() {
        return this.elem && this.elem.parentNode && (this.elem.parentNode.removeChild(this.elem), this.elem = null), d.prototype.destroy.call(this)
    }, g
}), define("core/host/kernel", ["require", "exports", "module", "core/Events", "core/utils/lang/isString", "core/utils/object/has", "core/utils/object/extend", "core/common/kernel/Iframe", "core/common/kernel/utils", "core/common/kernel/WindowBase", "core/host/json", "core/utils/function/throttle"], function(a, b) {
    "use strict";
    var c = a("core/Events"),
        d = a("core/utils/lang/isString"),
        e = a("core/utils/object/has"),
        f = a("core/utils/object/extend"),
        g = a("core/common/kernel/Iframe"),
        h = a("core/common/kernel/utils"),
        i = a("core/common/kernel/WindowBase"),
        j = a("core/host/json"),
        k = window.document;
    b.throttle = a("core/utils/function/throttle"), window.addEventListener("message", function(a) {
        var c;
        try {
            c = j.parse(a.data)
        } catch (d) {
            return
        }
        var f = c.sender,
            g = e(i.windows, f) && i.windows[f];
        g && h.getHost(a.origin) === g.host && (a.origin !== g.origin && (g.origin = a.origin), "host" === c.scope && g.trigger(c.name, c.data), "error" === c.name && b.trigger("error", c.data))
    }), window.addEventListener("hashchange", function() {
        b.trigger("window.hashchange", {
            hash: window.location.hash
        })
    }), window.addEventListener("resize", b.throttle(function() {
        b.trigger("window.resize")
    }, 250, 50)), k.addEventListener("mousemove", b.throttle(function() {
        b.trigger("window.mousemove")
    }, 250, 50));
    var l = function() {
        b.trigger("window.scroll")
    };
    window.addEventListener("scroll", b.throttle(l, 250, 50), !1), k.addEventListener("click", function() {
        b.trigger("window.click")
    });
    var m = b.Popup = function(a) {
        a.uid = a.windowName, i.call(this, a)
    };
    f(m.prototype, i.prototype), m.prototype.load = function() {
        var a = this.window = window.open("", this.uid || "_blank");
        a.location = this.url()
    }, m.prototype.isKilled = function() {
        return i.prototype.isKilled() || this.window.closed
    };
    var n = b.Channel = function(a) {
        var b = this;
        b.window = null, g.call(b, a), this.insertBeforeEl = a.insertBeforeEl, this.insertAfterEl = a.insertAfterEl, b.useSourcelessFrame = a.useSourcelessFrame, b.styles = f({
            width: "1px",
            "min-width": "100%",
            border: "none",
            overflow: "hidden",
            height: "0"
        }, a.styles || {})
    };
    f(n.prototype, g.prototype), n.prototype.load = function(a) {
        var b = this;
        g.prototype.load.call(b);
        var c = b.elem;
        if (c.setAttribute("width", "100%"), b.useSourcelessFrame) {
            var e = function() {
                var a = new window.XMLHttpRequest;
                a.open("GET", b.url()), a.onreadystatechange = function() {
                    c.contentWindow && a.readyState === c.contentWindow.XMLHttpRequest.DONE && 200 === a.status && (c.contentWindow.document.open(), c.contentWindow.document.write(a.responseText), c.contentWindow.document.close())
                }, a.send()
            };
            b.on("redirect", function(a) {
                b.target = a, e()
            }), e()
        } else c.setAttribute("src", b.url());
        c.addEventListener("load", function() {
            b.window = c.contentWindow, a && a()
        });
        var f = d(b.container) ? h.getContainer(b.container) : b.container,
            i = (b.insertAfterEl ? b.insertAfterEl.nextSibling : b.insertBeforeEl) || null;
        f.insertBefore(c, i)
    }, n.prototype.destroy = function() {
        return this.window = null, g.prototype.destroy.call(this)
    }, b.on = c.on, b.off = c.off, b.trigger = c.trigger
}), define("core/apps/WindowedApp", ["require", "core/utils/object/extend", "core/shared/urls", "core/apps/BaseApp", "core/host/kernel"], function(a) {
    "use strict";
    var b = a("core/utils/object/extend"),
        c = a("core/shared/urls"),
        d = a("core/apps/BaseApp"),
        e = a("core/host/kernel"),
        f = window.document,
        g = d.extend({
            name: null,
            loaderVersion: null,
            frame: null,
            origin: c.ensureHTTPSProtocol("https://disqus.com"),
            state: null,
            getUrl: function(a, d) {
                return this.loaderVersion && (d = b({
                    version: this.loaderVersion
                }, d)), c.ensureHTTPSProtocol(c.get(this.name, a, d))
            },
            getFrameSettings: function() {
                var a = {
                        target: this.getUrl(),
                        origin: this.origin,
                        uid: this.uid,
                        sandbox: this.sandbox
                    },
                    b = this.settings;
                return b.windowName ? a.windowName = b.windowName : a.container = b.container || f.body, b.styles && (a.styles = b.styles), a.useSourcelessFrame = b.useSourcelessFrame, a
            },
            getFrame: function() {
                var a = this.getFrameSettings(),
                    b = a.windowName ? e.Popup : e.Channel;
                return new b(a)
            },
            setState: function(a) {
                var b = this.constructor;
                return a in b.states && (this.state = b.states[a], void this.trigger("state:" + a))
            },
            init: function() {
                var a, b = this;
                b.frame = a = this.getFrame(), b.listenTo(a, "all", function(c, d) {
                    b.trigger("frame:" + c, d, a)
                }), b.listenTo(a, "resize", function(a) {
                    b.lastResizedHeight = a.height
                }), b.trigger("change:frame", a), b.frame.load(function() {
                    b.setState("LOADED")
                }), b.setState("INIT")
            },
            destroy: function() {
                var a = this.frame;
                a && (this.stopListening(a), a.destroy()), this.setState("KILLED"), this.frame = null, d.prototype.destroy.call(this)
            },
            events: {
                "frame:ready": function() {
                    this.setState("READY")
                }
            }
        }, {
            states: {
                INIT: 0,
                LOADED: 1,
                READY: 2,
                RUNNING: 3,
                KILLED: 4
            }
        });
    return g
}), define("core/utils/OnceTimer", ["require", "exports", "module"], function(a, b, c) {
    "use strict";
    c.exports = function(a, b) {
        var c = null,
            d = !1;
        this.start = function() {
            d || (c = setTimeout(function() {
                d = !0, a()
            }, b))
        }, this.clear = function() {
            clearTimeout(c)
        }
    }
}), define("core/utils/html/toHexColorString", [], function() {
    "use strict";

    function a(a) {
        if (a = Number(a), isNaN(a) || a > 255) throw new Error("Color components should be numbers less than 256");
        return a = a.toString(16), 1 === a.length ? "0" + a : String(a)
    }
    return function(b) {
        return "#" + a(b.red) + a(b.green) + a(b.blue)
    }
}), define("core/utils/sandbox", [], function() {
    "use strict";
    var a = ["allow-forms", "allow-pointer-lock", "allow-popups", "allow-same-origin", "allow-scripts", "allow-top-navigation"],
        b = function(b) {
            return b ? a.reduce(function(a, c) {
                return b[c] && (a += c + " "), a
            }, "").trim() : ""
        };
    return {
        getAttribute: b
    }
}), define("core/utils/url/parseQueryString", ["core/utils/collection/each"], function(a) {
    "use strict";
    return function(b) {
        "undefined" == typeof b && (b = window.location.search);
        var c = {};
        return a(b.substr(1).split("&"), function(a) {
            var b = a.split("=").map(function(a) {
                return decodeURIComponent(a.replace(/\+/g, "%20"))
            });
            b[0] && (c[b[0]] = b[1])
        }), c
    }
}), define("core/analytics/reporting", ["require", "core/utils/collection/each", "core/utils/url/serialize", "core/config/urls"], function(a) {
    "use strict";

    function b(a) {
        var b = a.split("."),
            c = b.length > 2 ? b[b.length - 2] : "";
        return c.match(/^[0-9a-f]{32}$/i) && c
    }

    function c(a) {
        (new window.Image).src = g(i + "/stat.gif", {
            event: a
        })
    }

    function d(a) {
        (new window.Image).src = g(i + "/event.gif", a)
    }

    function e(a) {
        var b = new window.URLSearchParams;
        f(a, function(a, c) {
            void 0 !== a && b.append(c, a)
        });
        var c = new window.XMLHttpRequest;
        c.open("POST", i + "/event.json", !0), c.withCredentials = !0, c.send(b)
    }
    var f = a("core/utils/collection/each"),
        g = a("core/utils/url/serialize"),
        h = a("core/config/urls"),
        i = h.jester;
    return {
        getLoaderVersionFromUrl: b,
        logStat: c,
        reportJester: d,
        reportJesterPOST: e
    }
}), define("core/ads/safeFrameUtils", [], function() {
    "use strict";
    var a = function(a) {
            return null !== a && !isNaN(Number(a)) && isFinite(a)
        },
        b = function(a) {
            return Math.min.apply(Math, _toConsumableArray(a)) || 0
        },
        c = function(a) {
            return Math.max.apply(Math, _toConsumableArray(a)) || 0
        };
    return {
        min: b,
        max: c,
        isNumeric: a
    }
});
var _createClass = function() {
    function a(a, b) {
        for (var c = 0; c < b.length; c++) {
            var d = b[c];
            d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), Object.defineProperty(a, d.key, d)
        }
    }
    return function(b, c, d) {
        return c && a(b.prototype, c), d && a(b, d), b
    }
}();
define("core/ads/NodeRect", ["core/ads/safeFrameUtils"], function(a) {
    "use strict";
    var b = function() {
        function b() {
            return _classCallCheck(this, b), 1 !== arguments.length || a.isNumeric(arguments[0]) ? void this.fromArray(arguments) : Array.isArray(arguments[0]) ? this.fromArray(arguments[0]) : this.fromObject(arguments[0])
        }
        return _createClass(b, [{
            key: "fromArray",
            value: function(a) {
                this.reset(), a.length >= 6 ? (this.top = a[0], this.right = a[1], this.bottom = a[2], this.left = a[3], this.width = a[4], this.height = a[5]) : a.length >= 4 ? (this.top = a[0], this.right = a[1], this.bottom = a[2], this.left = a[3]) : 3 === a.length ? (this.top = a[0], this.right = a[1], this.bottom = a[2], this.left = 0) : 2 === a.length ? (this.top = a[0], this.right = a[1], this.bottom = a[0], this.left = a[1]) : (this.top = a[0], this.right = a[0], this.bottom = a[0], this.left = a[0]), this.update()
            }
        }, {
            key: "fromObject",
            value: function(a) {
                return this.fromArray([a.top, a.right, a.bottom, a.left, a.width, a.height])
            }
        }, {
            key: "update",
            value: function() {
                this.width || (this.width = this.right - this.left), this.height || (this.height = this.bottom - this.top)
            }
        }, {
            key: "reset",
            value: function(a) {
                a = a || 0, this.top = a, this.right = a, this.bottom = a, this.left = a, this.width = a, this.height = a
            }
        }, {
            key: "getArea",
            value: function() {
                return (this.right - this.left) * (this.bottom - this.top)
            }
        }]), b
    }();
    return b.getOverlapRect = function(c, d) {
        var e = a.max([c.left, d.left]),
            f = a.min([c.left + c.width, d.left + d.width]),
            g = a.max([c.top, d.top]),
            h = a.min([c.top + c.height, d.top + d.height]);
        return f >= e && h >= g && new b(g, f, h, e, f - e, h - g)
    }, b.getOverlapArea = function(b, c) {
        var d = a.max([0, a.min([b.right, c.right]) - a.max([b.left, c.left])]),
            e = a.max([0, a.min([b.bottom, c.bottom]) - a.max([b.top, c.top])]);
        return d * e
    }, b
}), define("core/ads/domUtils", ["core/ads/NodeRect"], function(a) {
    "use strict";
    var b = 9,
        c = function(a) {
            return a && a.parentNode
        },
        d = function(a, b) {
            if (!a) return null;
            var c = window.document.defaultView.getComputedStyle(a);
            return b && c.hasOwnProperty(b) ? c[b] : c
        },
        e = function() {
            return {
                x: window.pageXOffset,
                y: window.pageYOffset
            }
        },
        f = function(b) {
            var c = void 0;
            if (b && b.style) {
                var d = b.style.display;
                b.style.display = "block", c = b.getBoundingClientRect(), b.style.display = d, c = new a(c);
                var f = e();
                c.left += f.x, c.right += f.x, c.top += f.y, c.bottom += f.y
            } else c = new a(0);
            return c
        },
        g = function(a, b) {
            var c = f(a);
            if (b) {
                var d = f(b);
                c.top = d.top - d.top + b.scrollTop, c.bottom = c.top + c.height + b.scrollTop, c.left = c.left - d.left + b.scrollLeft, c.right = c.left + c.width + b.scrollLeft
            }
            return c
        },
        h = function() {
            var b = e(),
                c = b.y,
                d = b.x + window.innerWidth,
                f = b.y + window.innerHeight,
                g = b.x,
                h = window.innerWidth,
                i = window.innerHeight;
            return new a(c, d, f, g, h, i)
        },
        i = function(a) {
            try {
                return a.nodeType === b ? a : a.ownerDocument
            } catch (c) {
                return null
            }
        },
        j = function(a) {
            var b = i(a),
                c = void 0;
            try {
                b && (c = b.parentWindow || b.defaultView || window)
            } catch (d) {
                c = window
            }
            return c
        },
        k = function(b) {
            var c = j(b),
                d = new a(0, c.innerWidth, c.innerHeight, 0, c.innerWidth, c.innerHeight),
                f = e();
            return d.left += f.x, d.right += f.x, d.top += f.y, d.bottom += f.y, d
        },
        l = function(a) {
            var b = i(a);
            if (b) return b.documentElement || b.body
        },
        m = function(b) {
            var c = l(b) || {},
                d = new a;
            return d.right = d.width = c.scrollWidth || 0, d.bottom = d.height = c.scrollHeight || 0, d
        },
        n = function(a, b) {
            for (; b;) {
                if (b === a) return !0;
                b = b.parentNode
            }
            return !1
        },
        o = function(a) {
            var b = d(a);
            return "inline-block" === b.display || "none" !== b["float"] || "absolute" === b.position || "fixed" === b.position || "auto" !== b.width || "auto" !== b.height
        },
        p = function(a) {
            var b = d(a),
                c = {};
            return "scroll" === b.overflowX || "auto" === b.overflowX ? c.xscroll = a.offsetWidth - a.clientWidth : c.xscroll = 0, "scroll" === b.overflowY || "auto" === b.overflowY ? c.yscroll = a.offsetHeight - a.clientHeight : c.yscroll = 0, c.xhidden = "hidden" === b.overflowX, c.yhidden = "hidden" === b.overflowY, c
        },
        q = function(a) {
            var b = d(a);
            return !!(b.clip && "auto" !== b.clip || b.clipPath && "none" !== b.clipPath)
        };
    return {
        getParentNode: c,
        getWindow: j,
        getScroll: e,
        getRect: f,
        getRectRelativeTo: g,
        getViewportRect: h,
        getDocument: i,
        getWindowRect: k,
        getRootNode: l,
        getRootRect: m,
        getNodeStyle: d,
        isParentOf: n,
        hasLayout: o,
        getNodeOverflow: p,
        isNodeClipped: q
    }
});
var _createClass = function() {
    function a(a, b) {
        for (var c = 0; c < b.length; c++) {
            var d = b[c];
            d.enumerable = d.enumerable || !1, d.configurable = !0, "value" in d && (d.writable = !0), Object.defineProperty(a, d.key, d)
        }
    }
    return function(b, c, d) {
        return c && a(b.prototype, c), d && a(b, d), b
    }
}();
define("core/ads/Geom", ["core/ads/domUtils", "core/ads/safeFrameUtils"], function(a, b) {
    "use strict";
    var c = 1,
        d = function() {
            function d(b) {
                _classCallCheck(this, d), this.node = b, this.document = a.getDocument(b), this.window = a.getWindow(b), this.root = a.getRootNode(b), this.ref = this.getRefNode(b.parentNode)
            }
            return _createClass(d, [{
                key: "getRefNode",
                value: function(b) {
                    for (; b && b.nodeType === c;) {
                        var d = a.getNodeStyle(b);
                        if (a.hasLayout(b) || "block" === d.display || "none" !== d.clear) {
                            var e = a.getNodeOverflow(b);
                            if (e.xscroll || e.yscroll || e.xhidden || e.yhidden) return b;
                            if (a.isNodeClipped(b)) return b
                        }
                        b = b.parentNode
                    }
                    return this.root
                }
            }, {
                key: "getNodesOver",
                value: function(d, e) {
                    e = e || 1;
                    var f = [],
                        g = a.getRect(d),
                        h = a.getRect(this.ref),
                        i = a.getViewportRect(d);
                    if (!window.document.elementFromPoint) return f;
                    for (var j = {
                            top: b.max([g.top, h.top]) - i.top,
                            right: b.min([g.right, h.right]) - i.left,
                            bottom: b.min([g.bottom, h.bottom]) - i.top,
                            left: b.max([g.left, h.left]) - i.left
                        }, k = (j.right - j.left) / 10, l = (j.bottom - j.top) / 10, m = j.left; m < j.right; m += k)
                        for (var n = j.top; n < j.bottom; n += l) {
                            for (var o = window.document.elementFromPoint(m, n); o && o.nodeType === c;) {
                                var p = a.getNodeStyle(o);
                                if (a.hasLayout(o) || "block" === p.display || "none" !== p.clear) break;
                                o = o.parentNode
                            }
                            o && o.nodeType === c && o !== this.node && o !== this.root && !a.isParentOf(o, this.node) && (f.push(o), f.length >= e && (m = j.right, n = j.bottom))
                        }
                    return f
                }
            }, {
                key: "getWindowGeom",
                value: function() {
                    var a = this.window.innerHeight || 0,
                        b = this.window.innerWidth || 0,
                        c = this.window.screenY || this.window.screenTop || 0,
                        d = c + a,
                        e = this.window.screenX || this.window.screenLeft || 0,
                        f = e + b;
                    return {
                        t: c,
                        r: f,
                        b: d,
                        l: e,
                        w: b,
                        h: a
                    }
                }
            }, {
                key: "getSelfGeom",
                value: function() {
                    var c = a.getRect(this.node),
                        d = a.getRect(this.ref),
                        e = a.getNodeStyle(this.node),
                        f = a.getWindowRect(this.node),
                        g = c.width,
                        h = c.height;
                    this.ref !== this.root && (g = b.max([0, b.min([c.right, d.right]) - b.max([c.left, d.left])]), h = b.max([0, b.min([c.bottom, d.bottom]) - b.max([c.top, d.top])]));
                    var i = b.max([0, b.min(c.right, f.right) - b.max([c.left, f.left])]),
                        j = b.max([0, b.min([c.bottom, f.bottom]) - b.max([c.top, f.top])]),
                        k = b.min([g, i]),
                        l = b.min([h, j]),
                        m = c.width ? k / c.width : 0,
                        n = c.height ? l / c.height : 0,
                        o = k * l / (c.width * c.height),
                        p = 1,
                        q = this.getNodesOver(this.node, p);
                    if (q.length) {
                        var r = a.getRect(q[0]),
                            s = b.max([0, b.min([r.right, c.right]) - b.max([r.left, c.left])]),
                            t = b.max([0, b.min([r.bottom, c.bottom]) - b.max([r.top, c.top])]);
                        o = b.max([0, (k * l - s * t) / (c.width * c.height)])
                    }
                    var u = a.getScroll();
                    return {
                        t: c.top - u.y,
                        r: c.right - u.x,
                        b: c.bottom - u.y,
                        l: c.left - u.x,
                        z: e.zIndex,
                        w: c.width,
                        h: c.height,
                        xiv: 1 === m ? "1" : Number(m).toFixed(2),
                        yiv: 1 === n ? "1" : Number(n).toFixed(2),
                        iv: 1 === o ? "1" : Number(o).toFixed(2)
                    }
                }
            }, {
                key: "getExpandGeom",
                value: function() {
                    var c = a.getRect(this.ref),
                        d = a.getRect(this.node),
                        e = a.getWindowRect(this.node),
                        f = {
                            top: b.max([c.top, e.top]),
                            right: b.min([c.right, e.right]),
                            bottom: b.min([c.bottom, e.bottom]),
                            left: b.max([c.left, e.left])
                        },
                        g = a.getNodeOverflow(this.ref);
                    return {
                        t: b.max([0, d.top - f.top]),
                        r: b.max([0, f.right - d.right]),
                        b: b.max([0, f.bottom - d.bottom]),
                        l: b.max([0, d.left - f.left]),
                        xs: Boolean(g.yscroll),
                        yx: Boolean(g.xscroll)
                    }
                }
            }, {
                key: "getGeom",
                value: function() {
                    return {
                        win: this.getWindowGeom(),
                        self: this.getSelfGeom(),
                        exp: this.getExpandGeom()
                    }
                }
            }]), d
        }(),
        e = {
            get: function(a) {
                var b = new d(a);
                return b.getGeom()
            }
        };
    return e
}), define("core/ads/ads", ["require", "core/shared/urls", "core/apps/WindowedApp", "core/host/json", "stance/main", "stance/utils", "core/common/kernel/WindowBase", "core/utils/OnceTimer", "core/utils/html/toHexColorString", "core/utils/object/extend", "core/utils/sandbox", "core/utils/url/parseQueryString", "core/utils/url/serialize", "core/utils/urls", "core/utils/urls", "core/analytics/reporting", "core/ads/Geom"], function(a) {
    "use strict";
    var b = a("core/shared/urls"),
        c = a("core/apps/WindowedApp"),
        d = a("core/host/json"),
        e = a("stance/main"),
        f = a("stance/utils"),
        g = a("core/common/kernel/WindowBase"),
        h = a("core/utils/OnceTimer"),
        i = a("core/utils/html/toHexColorString"),
        j = a("core/utils/object/extend"),
        k = a("core/utils/sandbox"),
        l = a("core/utils/url/parseQueryString"),
        m = a("core/utils/url/serialize"),
        n = a("core/utils/urls").getOrigin,
        o = a("core/utils/urls").getQuery,
        p = a("core/analytics/reporting"),
        q = a("core/ads/Geom"),
        r = c.extend({
            name: "ads",
            origin: void 0,
            onceEvents: {
                "view:enter": function() {
                    this._reportLegacy({
                        verb: "view",
                        adverb: "0ms-no50perc"
                    })
                },
                "view:iab": function() {
                    this._reportLegacy({
                        verb: "view",
                        adverb: "iab-scroll"
                    })
                }
            },
            events: {
                "frame:ready": function(a) {
                    this.forumId = a.forumId, this._reportLegacy({
                        verb: "load",
                        extra_data: a.extraData,
                        advertisement_id: a.advertisement_id,
                        provider: a.provider
                    }), this.bindViewEvents(), this.triggerGeomUpdate()
                },
                "frame:resize": function(a) {
                    this.frame.setInlineStyle("height", a.height + "px"), 0 === a.height ? this.trigger("ad-placement-empty") : this.trigger("ad-placement-filled"), this.triggerGeomUpdate()
                },
                "frame:click": function() {
                    this._reportOnce({
                        verb: "click"
                    }, "click")
                },
                "frame:hover": function() {
                    this._reportOnce({
                        verb: "hover"
                    }, "hover")
                },
                "frame:error-provider-not-ready": function(a) {
                    this._reportLegacy({
                        verb: "fail",
                        object_type: "provider",
                        object_id: a.provider || this.getProvider(),
                        adverb: "provider_not_ready"
                    })
                },
                "frame:error-no-height": function(a) {
                    this._reportLegacy({
                        verb: "fail",
                        object_type: "provider",
                        object_id: a.provider || this.getProvider(),
                        adverb: "no_height"
                    })
                },
                "frame:clearSandbox": function() {
                    this.frame.elem.hasAttribute("sandbox") && this.frame.elem.removeAttribute("sandbox")
                },
                "frame:$sf-init": function() {
                    this.settings.isOnHostPage && (this.isSafeframe = !0)
                },
                "frame:error": function(a) {
                    this.settings.isOnHostPage && this.postMessageDirect({
                        event: "error",
                        data: {
                            error: a
                        }
                    })
                }
            },
            constructor: function() {
                c.apply(this, arguments), this.origin = n(this.settings.adUrl), this._reportOnceHistory = {}, this.settings.isOnHostPage && (this.detectLazyload = this.detectLazyload.bind(this), window.addEventListener("scroll", this.detectLazyload)), this.settings.useSourcelessFrame = this.settings.sourcelessIframe && this.settings.isOnHostPage && (!this.settings.defaultPlacementUrl || !this.settings.adBlockEnabled)
            },
            init: function() {
                if (this.settings.forum = l(o(this.settings.adUrl)).shortname, this.settings.forum) {
                    var a = this.settings.disableAds,
                        d = this.settings.isInHome || this.settings.isOnHostPage && 0 === window.location.href.indexOf(b.apps.home);
                    if (!d && a && this.settings.canDisableAds) return void this.trigger("prevented-ad-load");
                    this._reportOnce({
                        verb: "call",
                        object_type: "provider",
                        object_id: this.getProvider(),
                        adjective: 1
                    }, "call"), this.settings.sandboxAds && (this.sandbox = k.getAttribute({
                        "allow-scripts": !0,
                        "allow-same-origin": !0,
                        "allow-forms": !0,
                        "allow-popups": !0
                    })), c.prototype.init.call(this)
                }
            },
            detectLazyload: function() {
                if (this.frame && this.settings.isOnHostPage) {
                    var a = this.frame.elem.getBoundingClientRect().top,
                        b = a - window.innerHeight,
                        c = window.innerHeight * this.settings.lazyloadViewports;
                    b < c && (this.postMessageDirect({
                        event: "lazyload"
                    }), window.removeEventListener("scroll", this.detectLazyload))
                }
            },
            getProvider: function() {
                if (this._provider) return this._provider;
                var a = this.settings.adUrl.match(/provider=(\w+)/);
                return a && (this._provider = a[1]), this._provider
            },
            getUrl: function() {
                var a, b = this.settings;
                return a = "inthreaddisqusadstxt" === b.experiment.experiment && "active" === b.experiment.variant && "inthread" === b.placement ? window.document.location.href : b.isOnHostPage ? b.url || window.document.location.href : b.url || b.referrer, m(b.adUrl, {
                    anchorColor: i(b.anchorColor),
                    colorScheme: b.colorScheme,
                    sourceUrl: a,
                    typeface: b.typeface,
                    canonicalUrl: b.canonicalUrl,
                    disqus_version: b.version
                })
            },
            triggerGeomUpdate: function() {
                if (this.frame.elem && this.isSafeframe && this.settings.isOnHostPage) {
                    var a = q.get(this.frame.elem);
                    this.postMessageDirect({
                        event: "geom-update",
                        data: {
                            geom: a
                        }
                    })
                }
            },
            bindViewEvents: function() {
                if (!this._viewEventsBound) {
                    this._viewEventsBound = !0, e.bindWindowEvents(!0);
                    var a = this,
                        b = function(b, c) {
                            a.postMessageDirect({
                                event: b,
                                percentViewable: c
                            })
                        },
                        c = 1e3,
                        d = new h(function() {
                            a.trigger("view:iab"), b("view:iab")
                        }, c),
                        g = !1;
                    this.listenTo(e({
                        el: this.frame.elem
                    }), {
                        enter: function() {
                            a.trigger("view:enter"), b("view:enter"), a.triggerGeomUpdate()
                        },
                        exit: function() {
                            b("view:exit"), g && (g = !1, b("view:50out"), d.clear()), a.triggerGeomUpdate()
                        },
                        visible: function(c, e) {
                            var h = f.visiblePercent(e, c.offset()),
                                i = 50;
                            h >= i && !g ? (g = !0, b("view:50in"), d.start()) : h < i && g && (g = !1, b("view:50out"), d.clear()), b("view", h), a.triggerGeomUpdate()
                        }
                    })
                }
            },
            postMessageDirect: function(a) {
                this.frame.requiresWindow(function(a) {
                    var b = d.stringify(j({}, a, {
                        space: "disqus"
                    }));
                    g.postMessage(this.window, b, this.origin), g.postMessage(this.window, "disqus." + a.event, this.origin)
                })(a)
            },
            _report: function(a) {
                var b = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
                    c = this.settings,
                    d = b.provider || this.getProvider();
                a.forum_id = c.forumId || this.forumId;
                var e;
                e = c.placement && c.placement.indexOf("timeline") > -1 ? "home" : "recommendations" === c.placement ? "recommendations" : "embed";
                var f = b.usePOST ? "reportJesterPOST" : "reportJester";
                p[f](j({
                    imp: c.impressionId,
                    experiment: c.experiment.experiment,
                    variant: c.experiment.variant,
                    service: c.experiment.service,
                    area: c.placement,
                    product: e,
                    forum: c.forum,
                    zone: "thread",
                    version: c.loaderVersion,
                    page_url: c.referrer || window.document.location.href,
                    page_referrer: c.hostReferrer || window.document.referrer,
                    object_type: "advertisement",
                    provider: d,
                    event: "activity"
                }, a))
            },
            _reportLegacy: function(a) {
                var b = this.settings;
                this._report(j({
                    ad_product_name: "iab_display",
                    ad_product_layout: "iab_display",
                    bin: "embed:promoted_discovery:" + b.experiment.service + ":" + b.experiment.experiment + ":" + b.experiment.variant,
                    object_id: a.advertisement_id ? "[" + a.advertisement_id + "]" : "",
                    section: "default"
                }, a))
            },
            _reportOnce: function(a, b) {
                this._reportOnceHistory[b] || (this._reportLegacy(a), this._reportOnceHistory[b] = !0)
            },
            getFrameSettings: function() {
                var a = c.prototype.getFrameSettings.call(this);
                return a.insertBeforeEl = this.settings.insertBeforeEl, a.insertAfterEl = this.settings.insertAfterEl, a
            }
        }),
        s = function(a) {
            return a = a || {}, a.experiment || (a.experiment = {
                experiment: a.experimentName,
                variant: a.experimentVariant,
                service: a.experimentService
            }), new r(a)
        };
    return {
        Ads: s
    }
}), define("core/api", ["jquery", "underscore", "backbone", "core/config", "core/utils"], function(a, b, c, d, e) {
    "use strict";

    function f(a) {
        return l.href = a, l.origin || l.protocol + "//" + l.hostname + (l.port ? ":" + l.port : "")
    }

    function g(a) {
        return a.replace(/^(http:)?\/\//, "https://")
    }

    function h(c) {
        c = b.defaults(c, m), c.traditional = !0, f(window.location.href) !== f(c.url) && (c.xhrFields = {
            withCredentials: !0
        }), c.omitDisqusApiKey || (c.data = c.data || {}, window.FormData && c.data instanceof window.FormData ? c.url = e.serialize(c.url, {
            api_key: d.keys.api
        }) : c.data.api_key = d.keys.api);
        var g = c.error;
        return c.error = function(a) {
            n.trigger("error", a), b.isFunction(g) && g(a)
        }, a.ajax(c)
    }

    function i(a) {
        return /(https?:)?\/\//.test(a) ? g(a) : d.urls.api + a
    }

    function j(a, c) {
        return c = c || {}, c.url = i(a), c.omitDisqusApiKey || (c.data = b.extend(c.data || {}, {
            api_key: d.keys.api
        })), n.trigger("call", c), h(c).always(b.bind(this.trigger, this, "complete", c))
    }
    var k = window.document,
        l = k.createElement("a"),
        m = {},
        n = {
            ERROR_CODES: {
                OBJ_NOT_FOUND: 8,
                MAX_ITEMS_REACHED: 24
            },
            ajax: h,
            call: j,
            getURL: i,
            defaults: function(a) {
                Object.keys(a).forEach(function(c) {
                    var d = a[c],
                        e = m[c];
                    b.isObject(d) && b.isObject(e) ? b.extend(e, d) : m[c] = d;
                })
            },
            headers: function(a) {
                var c = b.extend({}, m.headers, a);
                return m.headers = b.pick(c, Boolean), m.headers
            },
            makeHttps: g
        };
    return b.extend(n, c.Events), n
}), define("core/mediaConfig", ["underscore", "backbone"], function(a, b) {
    "use strict";

    function c() {
        var b = window.document.body.offsetWidth,
            c = d,
            e = c.length;
        return a.find(c, function(a, d) {
            return d + 1 === e || Math.abs(c[d + 1] - b) > Math.abs(c[d] - b)
        })
    }
    var d = [320, 480, 600, 800],
        e = new b.Model({
            collapsed: !1,
            defaultIframeHeight: 300,
            mediaPersistedWidths: d,
            loadedThumbnailWidth: c()
        });
    return e.findClosestThumbnailSize = c, e
}), define("core/mixins/appliesPublisherClasses", ["jquery", "underscore", "remote/config"], function(a, b, c) {
    "use strict";

    function d() {
        this._getStyleProperty = function(a) {
            var b = this.forum.get(a);
            return this.config.forceAutoStyles || "auto" === b ? this.config[a] : b
        }, this.getTypeface = function() {
            return this._getStyleProperty("typeface")
        }, this.getColorScheme = function() {
            return this._getStyleProperty("colorScheme")
        }, this.getFont = function() {
            return this.forum.get("customFont")
        }, this.convertFontToClass = function(a) {
            return a ? a.toLowerCase().replace(/\+/g, "-") : ""
        }, this.convertFontToStyle = function(a) {
            return a ? a.replace(/\+/g, " ") : ""
        }, this.isFontAllowed = function(a) {
            return !(!a || !c.lounge.font_options) && c.lounge.font_options.some(function(b) {
                return a === b.name
            })
        }, this.downloadFont = function(a) {
            var b = window.document,
                c = b.createElement("style");
            c.type = "text/css";
            var d = this.convertFontToClass(a.name),
                e = this.convertFontToStyle(a.name),
                f = a.category,
                g = '@import url("https://fonts.googleapis.com/css2?family=' + a.name + ':ital,wght@0,400;0,500;0,600;0,700;1,400;1,700&display=swap"); ',
                h = ["", "input", "select", "textarea"].map(function(a) {
                    return "." + d + " " + a
                }).join(", ");
            g += h + " { font-family: " + e + ", " + f + "; }", c.styleSheet ? c.styleSheet.cssText = g : c.appendChild(b.createTextNode(g));
            var i = b.head || b.getElementsByTagName("head")[0] || b.body;
            i.appendChild(c)
        }, this.applyPublisherClasses = function() {
            var d = a("body"),
                e = this.getFont(),
                f = e && b.find(c.lounge.font_options, function(a) {
                    return a.name === e
                });
            f ? (this.downloadFont(f), d.addClass(this.convertFontToClass(f.name))) : "serif" === this.getTypeface() ? d.addClass("serif") : d.addClass("sans-serif"), "dark" === this.getColorScheme() && d.addClass("dark")
        }
    }
    return d
}), define("core/templates/handlebars.partials", ["handlebars"], function(a) {
    a.registerPartial("cardGuestUser", a.template({
        1: function(a, b, c, d, e) {
            var f, g = null != b ? b : a.nullContext || {},
                h = a.lambda,
                i = a.escapeExpression,
                j = a.lookupProperty || function(a, b) {
                    if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
                };
            return '<li class="user ' + (null != (f = j(c, "if").call(g, null != b ? j(b, "highlight") : b, {
                name: "if",
                hash: {},
                fn: a.program(2, e, 0),
                inverse: a.noop,
                data: e,
                loc: {
                    start: {
                        line: 2,
                        column: 16
                    },
                    end: {
                        line: 2,
                        column: 49
                    }
                }
            })) ? f : "") + '" data-role="guest">\n<span class="avatar" title="' + i(h(null != b ? j(b, "guestText") : b, b)) + '">\n<img src="' + i(h(null != b ? j(b, "guestAvatarUrl") : b, b)) + '" alt="' + i(j(c, "gettext").call(g, "Avatar", {
                name: "gettext",
                hash: {},
                data: e,
                loc: {
                    start: {
                        line: 4,
                        column: 35
                    },
                    end: {
                        line: 4,
                        column: 55
                    }
                }
            })) + '" />\n</span>\n<span class="username" title="' + i(h(null != b ? j(b, "guestText") : b, b)) + '">\n' + i(h(null != b ? j(b, "guestText") : b, b)) + "\n</span>\n</li>\n"
        },
        2: function(a, b, c, d, e) {
            return "highlight"
        },
        compiler: [8, ">= 4.3.0"],
        main: function(a, b, c, d, e) {
            var f, g = a.lookupProperty || function(a, b) {
                if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
            };
            return null != (f = g(c, "if").call(null != b ? b : a.nullContext || {}, null != b ? g(b, "guestCount") : b, {
                name: "if",
                hash: {},
                fn: a.program(1, e, 0),
                inverse: a.noop,
                data: e,
                loc: {
                    start: {
                        line: 1,
                        column: 0
                    },
                    end: {
                        line: 10,
                        column: 7
                    }
                }
            })) ? f : ""
        },
        useData: !0
    })), a.registerPartial("cardGuestVoterText", a.template({
        1: function(a, b, c, d, e) {
            var f = a.lookupProperty || function(a, b) {
                if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
            };
            return " " + a.escapeExpression(f(c, "gettext").call(null != b ? b : a.nullContext || {}, "%(guestCount)s Guest Votes", {
                name: "gettext",
                hash: {
                    guestCount: null != b ? f(b, "guestCount") : b
                },
                data: e,
                loc: {
                    start: {
                        line: 1,
                        column: 26
                    },
                    end: {
                        line: 1,
                        column: 90
                    }
                }
            })) + " "
        },
        3: function(a, b, c, d, e) {
            var f = a.lookupProperty || function(a, b) {
                if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
            };
            return " " + a.escapeExpression(f(c, "gettext").call(null != b ? b : a.nullContext || {}, "1 Guest Vote", {
                name: "gettext",
                hash: {},
                data: e,
                loc: {
                    start: {
                        line: 1,
                        column: 100
                    },
                    end: {
                        line: 1,
                        column: 126
                    }
                }
            })) + " "
        },
        compiler: [8, ">= 4.3.0"],
        main: function(a, b, c, d, e) {
            var f, g = null != b ? b : a.nullContext || {},
                h = a.lookupProperty || function(a, b) {
                    if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
                };
            return (null != (f = h(c, "if").call(g, h(c, "gt").call(g, null != b ? h(b, "guestCount") : b, 1, {
                name: "gt",
                hash: {},
                data: e,
                loc: {
                    start: {
                        line: 1,
                        column: 6
                    },
                    end: {
                        line: 1,
                        column: 23
                    }
                }
            }), {
                name: "if",
                hash: {},
                fn: a.program(1, e, 0),
                inverse: a.program(3, e, 0),
                data: e,
                loc: {
                    start: {
                        line: 1,
                        column: 0
                    },
                    end: {
                        line: 1,
                        column: 134
                    }
                }
            })) ? f : "") + "\n"
        },
        useData: !0
    })), a.registerPartial("cardOtherUserText", a.template({
        1: function(a, b, c, d, e) {
            var f = a.lookupProperty || function(a, b) {
                if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
            };
            return " " + a.escapeExpression(f(c, "gettext").call(null != b ? b : a.nullContext || {}, "%(guestCount)s Others", {
                name: "gettext",
                hash: {
                    guestCount: null != b ? f(b, "guestCount") : b
                },
                data: e,
                loc: {
                    start: {
                        line: 1,
                        column: 26
                    },
                    end: {
                        line: 1,
                        column: 85
                    }
                }
            })) + " "
        },
        3: function(a, b, c, d, e) {
            var f = a.lookupProperty || function(a, b) {
                if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
            };
            return " " + a.escapeExpression(f(c, "gettext").call(null != b ? b : a.nullContext || {}, "1 Other", {
                name: "gettext",
                hash: {},
                data: e,
                loc: {
                    start: {
                        line: 1,
                        column: 95
                    },
                    end: {
                        line: 1,
                        column: 116
                    }
                }
            })) + " "
        },
        compiler: [8, ">= 4.3.0"],
        main: function(a, b, c, d, e) {
            var f, g = null != b ? b : a.nullContext || {},
                h = a.lookupProperty || function(a, b) {
                    if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
                };
            return (null != (f = h(c, "if").call(g, h(c, "gt").call(g, null != b ? h(b, "guestCount") : b, 1, {
                name: "gt",
                hash: {},
                data: e,
                loc: {
                    start: {
                        line: 1,
                        column: 6
                    },
                    end: {
                        line: 1,
                        column: 23
                    }
                }
            }), {
                name: "if",
                hash: {},
                fn: a.program(1, e, 0),
                inverse: a.program(3, e, 0),
                data: e,
                loc: {
                    start: {
                        line: 1,
                        column: 0
                    },
                    end: {
                        line: 1,
                        column: 124
                    }
                }
            })) ? f : "") + "\n"
        },
        useData: !0
    })), a.registerPartial("cardUser", a.template({
        1: function(a, b, c, d, e) {
            return "highlight"
        },
        3: function(a, b, c, d, e) {
            return 'data-action="profile"'
        },
        5: function(a, b, c, d, e) {
            var f, g = a.lambda,
                h = a.escapeExpression,
                i = a.lookupProperty || function(a, b) {
                    if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
                };
            return '<span class="avatar">\n<img src="' + h(g(null != (f = null != b ? i(b, "avatar") : b) ? i(f, "cache") : f, b)) + '" alt="' + h(i(c, "gettext").call(null != b ? b : a.nullContext || {}, "Avatar", {
                name: "gettext",
                hash: {},
                data: e,
                loc: {
                    start: {
                        line: 5,
                        column: 33
                    },
                    end: {
                        line: 5,
                        column: 53
                    }
                }
            })) + '" />\n</span>\n<span class="username">\n' + h(g(null != b ? i(b, "name") : b, b)) + "\n</span>\n"
        },
        7: function(a, b, c, d, e) {
            var f, g = a.lambda,
                h = a.escapeExpression,
                i = a.lookupProperty || function(a, b) {
                    if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
                };
            return '<a class="avatar" href="' + h(g(null != b ? i(b, "profileUrl") : b, b)) + '" title="' + h(g(null != b ? i(b, "name") : b, b)) + '" target="_blank" rel="noopener noreferrer">\n<img src="' + h(g(null != (f = null != b ? i(b, "avatar") : b) ? i(f, "cache") : f, b)) + '" alt="' + h(i(c, "gettext").call(null != b ? b : a.nullContext || {}, "Avatar", {
                name: "gettext",
                hash: {},
                data: e,
                loc: {
                    start: {
                        line: 12,
                        column: 33
                    },
                    end: {
                        line: 12,
                        column: 53
                    }
                }
            })) + '" />\n</a>\n<a class="username" href="' + h(g(null != b ? i(b, "profileUrl") : b, b)) + '" title="' + h(g(null != b ? i(b, "name") : b, b)) + '" target="_blank" rel="noopener noreferrer">\n' + h(g(null != b ? i(b, "name") : b, b)) + "\n</a>\n"
        },
        compiler: [8, ">= 4.3.0"],
        main: function(a, b, c, d, e) {
            var f, g = null != b ? b : a.nullContext || {},
                h = a.lookupProperty || function(a, b) {
                    if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
                };
            return '<li class="user ' + (null != (f = h(c, "if").call(g, null != b ? h(b, "highlight") : b, {
                name: "if",
                hash: {},
                fn: a.program(1, e, 0),
                inverse: a.noop,
                data: e,
                loc: {
                    start: {
                        line: 1,
                        column: 16
                    },
                    end: {
                        line: 1,
                        column: 49
                    }
                }
            })) ? f : "") + '" ' + (null != (f = h(c, "unless").call(g, h(c, "switch").call(g, "sso_less_branding", {
                name: "switch",
                hash: {
                    forum: null != b ? h(b, "forumId") : b
                },
                data: e,
                loc: {
                    start: {
                        line: 1,
                        column: 61
                    },
                    end: {
                        line: 1,
                        column: 103
                    }
                }
            }), {
                name: "unless",
                hash: {},
                fn: a.program(3, e, 0),
                inverse: a.noop,
                data: e,
                loc: {
                    start: {
                        line: 1,
                        column: 51
                    },
                    end: {
                        line: 1,
                        column: 137
                    }
                }
            })) ? f : "") + ' data-username="' + a.escapeExpression(a.lambda(null != b ? h(b, "username") : b, b)) + '">\n' + (null != (f = h(c, "if_all").call(g, h(c, "switch").call(g, "sso_less_branding", {
                name: "switch",
                hash: {
                    forum: null != b ? h(b, "forumId") : b
                },
                data: e,
                loc: {
                    start: {
                        line: 3,
                        column: 10
                    },
                    end: {
                        line: 3,
                        column: 52
                    }
                }
            }), h(c, "ne").call(g, null != b ? h(b, "isSSOProfileUrl") : b, !0, {
                name: "ne",
                hash: {},
                data: e,
                loc: {
                    start: {
                        line: 3,
                        column: 53
                    },
                    end: {
                        line: 3,
                        column: 78
                    }
                }
            }), {
                name: "if_all",
                hash: {},
                fn: a.program(5, e, 0),
                inverse: a.program(7, e, 0),
                data: e,
                loc: {
                    start: {
                        line: 3,
                        column: 0
                    },
                    end: {
                        line: 17,
                        column: 11
                    }
                }
            })) ? f : "") + "</li>\n"
        },
        useData: !0
    })), a.registerPartial("carouselArrowLeft", a.template({
        compiler: [8, ">= 4.3.0"],
        main: function(a, b, c, d, e) {
            return '<button class="carousel-control carousel-control__previous"><span class="icon icon-right-bracket icon-flipped"></span></button>\n'
        },
        useData: !0
    })), a.registerPartial("carouselArrowRight", a.template({
        compiler: [8, ">= 4.3.0"],
        main: function(a, b, c, d, e) {
            return '<button class="carousel-control carousel-control__next"><span class="icon icon-right-bracket"></span></button>\n'
        },
        useData: !0
    })), a.registerPartial("channelsHeader", a.template({
        compiler: [8, ">= 4.3.0"],
        main: function(a, b, c, d, e) {
            var f = null != b ? b : a.nullContext || {},
                g = a.escapeExpression,
                h = a.lookupProperty || function(a, b) {
                    if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
                };
            return '<div class="align-inline spacing-top">\n<div class="module-header__icon icon-colorful spacing-right">\n<svg class="icon-discover" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 18 18" enable-background="new 0 0 18 18" xml:space="preserve" width="26" height="26"><rect x="14" width="4" height="4" class="dot"/><rect x="14" y="7" width="4" height="4" class="dot"/><rect x="14" y="14" width="4" height="4" class="dot"/><rect x="7" width="4" height="4" class="dot"/><rect x="7" y="7" width="4" height="4" class="dot"/><rect x="7" y="14" width="4" height="4" class="dot"/><rect width="4" height="4" class="dot"/><rect y="7" width="4" height="4" class="dot"/><rect y="14" width="4" height="4" class="dot"/></g></svg>\n</div>\n<div class="module-header__title">\n<h1 class="text-larger text-darker">' + g(h(c, "gettext").call(f, "Channels", {
                name: "gettext",
                hash: {},
                data: e,
                loc: {
                    start: {
                        line: 6,
                        column: 36
                    },
                    end: {
                        line: 6,
                        column: 58
                    }
                }
            })) + '</h1>\n</div>\n</div>\n<p class="text-medium text-gray spacing-bottom-narrow">' + g(h(c, "gettext").call(f, "Places to start your own discussions.", {
                name: "gettext",
                hash: {},
                data: e,
                loc: {
                    start: {
                        line: 9,
                        column: 55
                    },
                    end: {
                        line: 9,
                        column: 106
                    }
                }
            })) + "</p>\n"
        },
        useData: !0
    })), a.registerPartial("genericFollowButton", a.template({
        1: function(a, b, c, d, e) {
            return " active"
        },
        compiler: [8, ">= 4.3.0"],
        main: function(a, b, c, d, e) {
            var f, g = null != b ? b : a.nullContext || {},
                h = a.escapeExpression,
                i = a.lookupProperty || function(a, b) {
                    if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
                };
            return '<button class="button btn-follow' + (null != (f = i(c, "if").call(g, null != b ? i(b, "isFollowing") : b, {
                name: "if",
                hash: {},
                fn: a.program(1, e, 0),
                inverse: a.noop,
                data: e,
                loc: {
                    start: {
                        line: 1,
                        column: 32
                    },
                    end: {
                        line: 1,
                        column: 65
                    }
                }
            })) ? f : "") + '" data-action="toggle-follow">\n<span class="symbol-default"><span class="icon-plus"></span></span><span class="text-default">' + h(i(c, "gettext").call(g, "Follow", {
                name: "gettext",
                hash: {},
                data: e,
                loc: {
                    start: {
                        line: 3,
                        column: 94
                    },
                    end: {
                        line: 3,
                        column: 114
                    }
                }
            })) + '</span><span class="symbol-following"><span class="icon-checkmark"></span></span><span class="text-following">' + h(i(c, "gettext").call(g, "Following", {
                name: "gettext",
                hash: {},
                data: e,
                loc: {
                    start: {
                        line: 3,
                        column: 224
                    },
                    end: {
                        line: 3,
                        column: 247
                    }
                }
            })) + "</span>\n</button>\n"
        },
        useData: !0
    }))
}), define("core/extensions/helpers/eq", [], function() {
    "use strict";
    return function(a, b) {
        return a === b
    }
}), define("core/extensions/helpers/ne", [], function() {
    "use strict";
    return function(a, b) {
        return a !== b
    }
}), define("core/extensions/helpers/gt", [], function() {
    "use strict";
    return function(a, b) {
        return a > b
    }
}), define("core/extensions/helpers/lt", [], function() {
    "use strict";
    return function(a, b) {
        return a < b
    }
}), define("core/extensions/helpers/ge", [], function() {
    "use strict";
    return function(a, b) {
        return a >= b
    }
}), define("core/extensions/helpers/le", [], function() {
    "use strict";
    return function(a, b) {
        return a <= b
    }
}), define("core/extensions/helpers/typeof", [], function() {
    "use strict";
    return function(a, b) {
        return typeof a === b
    }
}), define("core/extensions/helpers/notNull", [], function() {
    "use strict";
    return function(a) {
        return null !== a
    }
}), define("core/extensions/helpers/any", [], function() {
    "use strict";
    return function() {
        for (var a = arguments.length, b = 0; b < a - 1; b++)
            if (arguments[b]) return arguments[b]
    }
}), define("core/extensions/helpers/if_any", [], function() {
    "use strict";
    return function() {
        for (var a = arguments.length, b = arguments[a - 1], c = 0; c < a - 1; c++)
            if (arguments[c]) return b.fn(this);
        return b.inverse(this)
    }
}), define("core/extensions/helpers/if_all", [], function() {
    "use strict";
    return function() {
        for (var a = arguments.length, b = arguments[a - 1], c = 0; c < a - 1; c++)
            if (!arguments[c]) return b.inverse(this);
        return b.fn(this)
    }
}), define("core/extensions/helpers/switch", ["core/switches", "core/utils/object/extend"], function(a, b) {
    "use strict";
    return function(c, d) {
        return a.isFeatureActive(c, b({}, d.hash))
    }
}), define("core/extensions/helpers/partial", ["handlebars"], function(a) {
    "use strict";
    return function(b, c) {
        a.registerPartial(b, c.fn)
    }
}), define("core/extensions/helpers/getPartial", ["handlebars"], function(a) {
    "use strict";
    return function(b, c, d) {
        return "undefined" == typeof d && (d = c, c = this, a.Utils.extend(c, d.hash)), new a.SafeString(a.partials[b](c, d))
    }
}), define("core/extensions/helpers/gettext", ["handlebars", "core/strings"], function(a, b) {
    "use strict";
    return function() {
        var c, d, e, f, g = arguments.length,
            h = arguments[g - 1],
            i = h.hash,
            j = arguments[0],
            k = a.partials;
        j = a.Utils.escapeExpression(b.get(j));
        for (e in i) i.hasOwnProperty(e) && (d = new RegExp("%\\((" + e + ")\\)s", "gm"), c = i[e], f = c && c.executePartial, f && (c = k[c.partial].call(this, c.context, h)), void 0 === c || null === c || "number" == typeof c && isNaN(c) ? c = "" : f || (c = a.Utils.escapeExpression(c)), j = j.replace(d, c.toString()));
        return new a.SafeString(j)
    }
}), define("core/utils/object/get", [], function() {
    "use strict";
    return function(a, b, c) {
        for (var d = 0, e = b.length; a && d < e;) a = a[b[d]], d += 1;
        return d < e || void 0 === a ? c : a
    }
}), define("core/extensions/helpers/urlfor", ["core/config/urls", "core/utils/object/get"], function(a, b) {
    "use strict";
    return function(c) {
        return b(a, c.split("."))
    }
}), define("core/extensions/helpers/html", ["handlebars"], function(a) {
    "use strict";
    return function(b) {
        return new a.SafeString(b || "")
    }
}), define("core/extensions/helpers/with", [], function() {
    "use strict";
    return function() {
        var a = arguments.length,
            b = arguments[a - 1],
            c = arguments[0];
        return 3 === a ? (c = {}, c[arguments[0]] = arguments[1]) : "_window_" === c && (c = window), b.fn(c)
    }
}), define("core/extensions/helpers/each", ["handlebars"], function(a) {
    "use strict";
    return function(b, c) {
        var d, e, f, g = c.fn,
            h = c.inverse,
            i = 0,
            j = "";
        if (c.data && (d = a.createFrame(c.data)), b && "object" == typeof b)
            if ("[object Array]" === Object.prototype.toString.call(b))
                for (f = b.length; i < f; i++) d && (d.index = i, d.length = b.length), j += g(b[i], {
                    data: d
                });
            else
                for (e in b) b.hasOwnProperty(e) && (d && (d.key = e), j += g(b[e], {
                    data: d
                }), i += 1);
        return 0 === i && (j = h(this)), j
    }
}), define("core/extensions/helpers/log", [], function() {
    "use strict";
    return function(a) {
        console.log(a, this)
    }
}), define("core/extensions/helpers/debug", [], function() {
    "use strict";
    return function() {}
}), define("core/extensions/helpers/geturl", [], function() {
    "use strict";
    return window.geturl || function(a) {
        return a
    }
}), define("core/extensions/helpers/tag", ["handlebars"], function(a) {
    "use strict";
    return function(b, c) {
        var d = ["<" + b],
            e = c.hash.text;
        delete c.hash.text;
        for (var f in c.hash) c.hash.hasOwnProperty(f) && d.push(" " + f + '="' + a.escapeExpression(c.hash[f]) + '"');
        return d.push(">" + a.escapeExpression(e) + "</" + b + ">"), new a.SafeString(d.join(""))
    }
}), define("core/extensions/helpers/now", ["moment"], function(a) {
    "use strict";
    return function(b) {
        return a().format(b)
    }
}), define("core/extensions/helpers/ternary", [], function() {
    "use strict";
    return function(a, b, c) {
        return a ? b : c
    }
}), define("core/extensions/handlebars.helpers", ["require", "handlebars", "./helpers/eq", "./helpers/ne", "./helpers/gt", "./helpers/lt", "./helpers/ge", "./helpers/le", "./helpers/typeof", "./helpers/notNull", "./helpers/any", "./helpers/if_any", "./helpers/if_all", "./helpers/switch", "./helpers/partial", "./helpers/getPartial", "./helpers/gettext", "./helpers/urlfor", "./helpers/html", "./helpers/with", "./helpers/each", "./helpers/log", "./helpers/debug", "./helpers/geturl", "./helpers/tag", "./helpers/now", "./helpers/ternary"], function(a) {
    "use strict";
    var b = a("handlebars");
    return b.registerHelper("eq", a("./helpers/eq")), b.registerHelper("ne", a("./helpers/ne")), b.registerHelper("gt", a("./helpers/gt")), b.registerHelper("lt", a("./helpers/lt")), b.registerHelper("ge", a("./helpers/ge")), b.registerHelper("le", a("./helpers/le")), b.registerHelper("typeof", a("./helpers/typeof")), b.registerHelper("notNull", a("./helpers/notNull")), b.registerHelper("any", a("./helpers/any")), b.registerHelper("if_any", a("./helpers/if_any")), b.registerHelper("if_all", a("./helpers/if_all")), b.registerHelper("switch", a("./helpers/switch")), b.registerHelper("partial", a("./helpers/partial")), b.registerHelper("getPartial", a("./helpers/getPartial")), b.registerHelper("gettext", a("./helpers/gettext")), b.registerHelper("urlfor", a("./helpers/urlfor")), b.registerHelper("html", a("./helpers/html")), b.registerHelper("with", a("./helpers/with")), b.registerHelper("each", a("./helpers/each")), b.registerHelper("log", a("./helpers/log")), b.registerHelper("debug", a("./helpers/debug")), b.registerHelper("geturl", a("./helpers/geturl")), b.registerHelper("tag", a("./helpers/tag")), b.registerHelper("now", a("./helpers/now")), b.registerHelper("ternary", a("./helpers/ternary")), b
}), define("core/templates/alert", ["handlebars", "core/templates/handlebars.partials", "core/extensions/handlebars.helpers"], function(a) {
    return a.template({
        1: function(a, b, c, d, e) {
            var f = a.lookupProperty || function(a, b) {
                if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
            };
            return '<span class="icon icon-' + a.escapeExpression(a.lambda(null != b ? f(b, "iconType") : b, b)) + '"></span>\n'
        },
        3: function(a, b, c, d, e) {
            var f, g = a.lookupProperty || function(a, b) {
                if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
            };
            return (null != (f = a.lambda(null != b ? g(b, "message") : b, b)) ? f : "") + "\n"
        },
        5: function(a, b, c, d, e) {
            var f = a.lookupProperty || function(a, b) {
                if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
            };
            return a.escapeExpression(a.lambda(null != b ? f(b, "message") : b, b)) + "\n"
        },
        compiler: [8, ">= 4.3.0"],
        main: function(a, b, c, d, e) {
            var f, g = null != b ? b : a.nullContext || {},
                h = a.lookupProperty || function(a, b) {
                    if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
                };
            return '<a class="close" data-action="dismiss" title="' + a.escapeExpression(h(c, "gettext").call(g, "Dismiss", {
                name: "gettext",
                hash: {},
                data: e,
                loc: {
                    start: {
                        line: 1,
                        column: 46
                    },
                    end: {
                        line: 1,
                        column: 67
                    }
                }
            })) + '">×</a>\n<span>\n' + (null != (f = h(c, "if").call(g, null != b ? h(b, "icon") : b, {
                name: "if",
                hash: {},
                fn: a.program(1, e, 0),
                inverse: a.noop,
                data: e,
                loc: {
                    start: {
                        line: 3,
                        column: 0
                    },
                    end: {
                        line: 5,
                        column: 7
                    }
                }
            })) ? f : "") + (null != (f = h(c, "if").call(g, null != b ? h(b, "safe") : b, {
                name: "if",
                hash: {},
                fn: a.program(3, e, 0),
                inverse: a.program(5, e, 0),
                data: e,
                loc: {
                    start: {
                        line: 6,
                        column: 0
                    },
                    end: {
                        line: 10,
                        column: 7
                    }
                }
            })) ? f : "") + "</span>\n"
        },
        useData: !0
    })
}), define("core/views/AlertView", ["backbone", "core/templates/alert"], function(a, b) {
    "use strict";
    var c = a.View.extend({
        defaultClassName: "alert",
        events: {
            "click [data-action=dismiss]": "dismiss"
        },
        initialize: function(a) {
            this.options = a, this.message = a.message, this.safe = a.safe, this.type = a.type, this.className = a.className || this.defaultClassName
        },
        render: function() {
            var a = this.$el;
            return a.html(b({
                message: this.message,
                safe: this.safe,
                icon: Boolean(this.type),
                iconType: "error" === this.type || "warn" === this.type ? "warning" : this.type
            })), a.attr("class", this.className), this.type && a.addClass(this.type), this
        },
        dismiss: function(a) {
            a && a.preventDefault && a.preventDefault(), this.remove(), this.trigger("dismiss")
        }
    });
    return c
}), define("core/mixins/withAlert", ["underscore", "core/views/AlertView"], function(a, b) {
    "use strict";
    var c = {
            alert: function(c, d) {
                a.isObject(d) || (d = {});
                var e = d.target || this._alertSelector;
                this.dismissAlert();
                var f = this._alert = new b(a.extend({
                    message: c
                }, d));
                if (this.listenToOnce(this._alert, "dismiss", function() {
                        this._alert = null
                    }), f.render(), e) {
                    var g = this.$el.find(e);
                    g.length ? g.prepend(f.el) : this.listenToOnce(this, "threadView:render", function() {
                        return this.alert(c, d)
                    })
                } else this.el.parentNode && this.el.parentNode.insertBefore(f.el, this.el);
                return f
            },
            dismissAlert: function(a) {
                this._alert && (a && !a(this._alert) || (this.stopListening(this._alert), this._alert.dismiss(), this._alert = null))
            },
            getAlert: function() {
                return this._alert || null
            },
            setAlertSelector: function(a) {
                this._alertSelector = a
            }
        },
        d = function() {
            return a.extend(this, c)
        };
    return d
}), define("core/models/ThreadVote", ["backbone"], function(a) {
    "use strict";
    var b = a.Model.extend({
        defaults: {
            score: 0
        }
    });
    return b
}), define("core/models/Vote", ["backbone"], function(a) {
    "use strict";
    var b = a.Model.extend({
        defaults: {
            score: 0
        }
    });
    return b
}), define("core/constants/voteConstants", ["exports"], function(a) {
    "use strict";
    a.VOTING_TYPES = {
        DETAILED: 0,
        DOWNVOTE_LIMITED: 1,
        DOWNVOTE_DISABLED: 2,
        DISABLED: 3
    }, a.DEFAULT_VOTING_TYPE = a.VOTING_TYPES.DETAILED
}), define("core/time", [], function() {
    "use strict";

    function a(a) {
        return a.indexOf("+") >= 0 ? a : a + "+00:00"
    }
    var b = "YYYY-MM-DDTHH:mm:ssZ";
    return {
        ISO_8601: b,
        assureTzOffset: a
    }
}), define("core/models/BaseUser", ["backbone", "core/config"], function(a, b) {
    "use strict";
    var c = a.Model.extend({
        defaults: {
            about: null,
            avatar: {
                cache: b.urls.avatar.generic,
                permalink: b.urls.avatar.generic
            },
            connections: {},
            badges: [],
            email: null,
            isAnonymous: !0,
            isFollowedBy: null,
            isFollowing: null,
            joinedAt: null,
            name: null,
            profileUrl: null,
            url: null,
            username: null,
            numPosts: null,
            numFollowing: null,
            numForumsFollowing: null,
            numFollowers: null,
            numLikesReceived: null,
            isFlagged: null
        },
        hasValidAvatar: function(a) {
            var b = a ? a.avatar : this.get("avatar");
            return b && b.cache
        },
        isAnonymous: function() {
            return !this.get("id")
        },
        isRegistered: function() {
            return !this.isAnonymous()
        },
        validate: function(a) {
            if (!this.hasValidAvatar(a)) return "None of the avatar related properties can be null, undefined or empty on User models."
        },
        toJSON: function() {
            var b = a.Model.prototype.toJSON.apply(this, arguments);
            return b.thread = {}, this.hasValidAvatar() || (b.avatar = this.defaults.avatar), b.isRegistered = this.isRegistered(), b
        }
    });
    return c
}), define("core/models/User", ["jquery", "underscore", "moment", "core/config", "core/time", "core/utils", "core/strings", "core/api", "core/models/BaseUser"], function(a, b, c, d, e, f, g, h, i) {
    "use strict";

    function j(a, b, c) {
        a[b] = a[b] || [], a[b].push(c)
    }
    var k = g.get,
        l = i.extend({
            url: h.getURL("users/details"),
            validate: function(c) {
                var d = {};
                if (c.display_name && (c.display_name = a.trim(c.display_name)), c.display_name || j(d, "display_name", k("Please enter your name.")), c.email || j(d, "email", k("Please enter your email address.")), f.validateEmail(c.email) || j(d, "email", k("Invalid email address.")), this.isNew() && (c.password ? c.password.length < l.MIN_PASSWORD_LEN && j(d, "password", k("Password must have at least 6 characters.")) : j(d, "password", k("Please enter a password."))), c.name && (c.name.length < l.MIN_NAME_LEN && j(d, "name", g.interpolate(k("Name must have at least %(minLength)s characters."), {
                        minLength: l.MIN_NAME_LEN
                    })), c.name.length > l.MAX_NAME_LEN && j(d, "name", g.interpolate(k("Name must have less than %(maxLength)s characters."), {
                        maxLength: l.MAX_NAME_LEN
                    }))), c.location && c.location.length > l.MAX_LOCATION_LEN && j(d, "location", g.interpolate(k("Location must have less than %(maxLength)s characters."), {
                        maxLength: l.MAX_LOCATION_LEN
                    })), c.url && (c.url.length > l.MAX_URL_LEN && j(d, "url", g.interpolate(k("Site must have less than %(maxLength)s characters."), {
                        maxLength: l.MAX_URL_LEN
                    })), f.isUrl(c.url) || j(d, "url", k("Please enter a valid site."))), !b.isEmpty(d)) return d
            },
            prepareFetchOptions: function(a) {
                a = a ? b.clone(a) : {};
                var c = {};
                return this.get("id") ? c.user = this.get("id") : this.get("username") && (c.user = "username:" + this.get("username")), b.extend(c, a.data), a.data = c, a
            },
            fetch: function(a) {
                return a = this.prepareFetchOptions(a), i.prototype.fetch.call(this, a)
            },
            parse: function(a) {
                var b = a.response || a;
                return b = this.handleBadgesUpdate(b)
            },
            register: function(a) {
                var c = this;
                return a = a || {}, h.call("internal/users/register.json", {
                    data: b.extend(this.toRegisterJSON(), {
                        gRecaptchaResponse: a.gRecaptchaResponse
                    }),
                    method: "POST",
                    success: function(d) {
                        h.call("users/acceptTerms", {
                            method: "POST"
                        }), c.set(b.extend({}, d.response, {
                            hasAcceptedGdprTerms: !0
                        })), a.success && a.success(d)
                    },
                    error: a.error
                })
            },
            saveAvatar: function(a) {
                var b = new window.FormData;
                return b.append("avatar_file", a), b.append("api_key", d.keys.api), h.call("internal/users/updateAvatar.json", {
                    method: "post",
                    data: b,
                    cache: !1,
                    contentType: !1,
                    processData: !1
                })
            },
            saveProfile: function() {
                return h.call("users/updateProfile.json", {
                    method: "POST",
                    data: {
                        name: this.get("name"),
                        about: this.get("about"),
                        location: this.get("location"),
                        url: this.get("url")
                    }
                })
            },
            toRegisterJSON: function() {
                return b.pick(this.toJSON(), "display_name", "email", "password")
            },
            isSession: function(a) {
                return a.user.id && a.user.id === this.id
            },
            isEditable: function(a) {
                return this.isSession(a) && !this.get("remote")
            },
            toJSON: function(a) {
                a = a || {};
                var b = i.prototype.toJSON.call(this),
                    c = this.collection && this.collection.thread;
                return b.thread.canModerate = Boolean(c && c.isModerator(this)), a.session && (b.isSession = this.isSession(a.session), b.isEditable = this.isEditable(a.session)), b
            },
            _changeFollowState: function(a) {
                this.set({
                    isFollowing: a,
                    numFollowers: Math.max(0, this.get("numFollowers") + (a ? 1 : -1))
                });
                var b = "users/" + (a ? "follow" : "unfollow"),
                    c = this;
                return h.call(b + ".json", {
                    data: {
                        target: this.get("id")
                    },
                    method: "POST",
                    success: function(a) {
                        c.trigger("sync", c, a, {})
                    }
                })
            },
            follow: function() {
                return this._changeFollowState(!0)
            },
            unfollow: function() {
                return this._changeFollowState(!1)
            },
            _changeBlockState: function(a) {
                var b = "users/block/" + (a ? "create" : "delete"),
                    c = this;
                return h.call(b + ".json", {
                    data: {
                        user: this.get("id")
                    },
                    method: "POST",
                    success: function(a) {
                        c.set(a.response)
                    }
                })
            },
            block: function() {
                return this._changeBlockState(!0)
            },
            unblock: function() {
                return this._changeBlockState(!1)
            },
            report: function(a) {
                var b = this;
                return h.call("users/report.json", {
                    data: {
                        reason: a,
                        user: this.get("id")
                    },
                    method: "POST",
                    success: function() {
                        b.set("isFlagged", !0)
                    }
                })
            },
            toggleFollowState: function() {
                return this._changeFollowState(!this.get("isFollowing"))
            },
            registeredLessThan: function(a, b) {
                var d = e.assureTzOffset(this.get("joinedAt")),
                    f = c().subtract(a, b);
                return c(d).isAfter(f)
            },
            registeredToday: function() {
                return this.registeredLessThan(1, "day")
            },
            registeredThisWeek: function() {
                return this.registeredLessThan(1, "week")
            },
            shouldHomeOnboard: function() {
                return !this.get("homeOnboardingComplete")
            },
            setHomeOnboardComplete: function(a) {
                this.updateFlags({
                    homeOnboardingComplete: a
                }), a && this.listenTo(this, "change:homeOnboardingComplete", b.bind(this.set, this, "homeOnboardingComplete", a, {
                    silent: !0
                }))
            },
            handleBadgesUpdate: function(a) {
                if (this.collection && this.collection.thread && this.collection.thread.forum && this.collection.thread.forum.get("badges")) {
                    var b = this.collection.thread.forum.get("badges");
                    a.badges = a.badges ? a.badges.filter(function(a) {
                        return b[a.id]
                    }) : []
                }
                return a
            },
            updateFlags: function(a) {
                return this.set(a), h.call("internal/users/updateFlags.json", {
                    data: b.mapObject(a, function(a) {
                        return a ? 1 : 0
                    }),
                    method: "POST"
                })
            }
        }, {
            MIN_PASSWORD_LEN: 6,
            MIN_NAME_LEN: 2,
            MAX_NAME_LEN: 30,
            MAX_LOCATION_LEN: 255,
            MAX_URL_LEN: 200
        });
    return l
}), define("core/utils/html", [], function() {
    "use strict";
    var a = "...",
        b = a.length,
        c = function(a) {
            var b;
            try {
                b = (new window.DOMParser).parseFromString("<!doctype html><meta charset=utf-8><title> </title>", "text/html")
            } catch (c) {}
            return b || (b = window.document.implementation.createHTMLDocument("")), b.body && (b.body.innerHTML = a), b
        };
    return {
        stripTags: function(a) {
            var b = c(a).body;
            return (b.textContent || b.innerText).replace(/\r?\n/g, " ")
        },
        replaceAnchors: function(a, d) {
            var e = c(a);
            return [].forEach.call(e.querySelectorAll("a"), function(a) {
                var c = a.getAttribute("href") || "",
                    e = a.innerHTML,
                    f = d(a);
                0 === c.indexOf(e.slice(0, -b)) ? e = f : c.length && e.indexOf(c) !== -1 ? e = e.replace(c, f) : e += " " + f, a.insertAdjacentHTML("afterend", e), a.parentNode.removeChild(a)
            }), e.body.innerHTML.trim()
        }
    }
}), define("core/advice", ["underscore"], function(a) {
    "use strict";

    function b() {
        a.each(["before", "after", "around"], function(a) {
            this[a] = function(b, d) {
                return "function" == typeof this[b] ? this[b] = c[a](this[b], d) : this[b] = d, this[b]
            }
        }, this)
    }
    var c = {
        around: function(b, c) {
            return function() {
                var d = a.toArray(arguments);
                return c.apply(this, [a.bind(b, this)].concat(d))
            }
        },
        before: function(b, d) {
            return c.around(b, function() {
                var b = a.toArray(arguments),
                    c = b.shift();
                return d.apply(this, b), c.apply(this, b)
            })
        },
        after: function(b, d) {
            return c.around(b, function() {
                var b = a.toArray(arguments),
                    c = b.shift(),
                    e = c.apply(this, b);
                return d.apply(this, b), e
            })
        }
    };
    return {
        withAdvice: b
    }
}), define("core/models/mixins", ["underscore", "moment", "core/time"], function(a, b, c) {
    "use strict";

    function d() {
        b.locale("en", {
            relativeTime: {
                future: "%s from now",
                past: "%s ago",
                s: "a few seconds",
                ss: "%d seconds",
                m: "a minute",
                mm: "%d minutes",
                h: "an hour",
                hh: "%d hours",
                d: "a day",
                dd: "%d days",
                M: "a month",
                MM: "%d months",
                y: "a year",
                yy: "%d years"
            }
        }), this._getCreatedMoment = a.memoize(function(a) {
            var d = this.get(a || "createdAt");
            if (d) return b(c.assureTzOffset(d), c.ISO_8601)
        }, function(a) {
            return this.get(a || "createdAt")
        }), this.getRelativeCreatedAt = function(a) {
            var b = this._getCreatedMoment(a);
            return b && b.from(Number(new Date))
        }, this.getFormattedCreatedAt = a.memoize(function(a) {
            var b = this._getCreatedMoment(a);
            return b && b.format("LLLL")
        }, function(a) {
            return this.get(a || "createdAt")
        })
    }
    return {
        withCreatedAt: d
    }
}), define("core/collections/UserCollection", ["jquery", "backbone", "core/models/User"], function(a, b, c) {
    "use strict";
    var d = b.Collection.extend({
        model: c,
        initialize: function(a, c) {
            b.Collection.prototype.initialize.apply(this, arguments), this.thread = c && c.thread
        },
        fetch: function() {
            return a.when(!0)
        }
    });
    return d
}), define("core/collections/VotersUserCollection", ["underscore", "backbone", "core/api", "core/collections/UserCollection"], function(a, b, c, d) {
    "use strict";
    var e = d.extend({
        LIMIT: 50,
        url: function() {
            return c.getURL("posts/listUsersVotedPost")
        },
        initialize: function(a, b) {
            this.postId = b.postId, this.threadId = b.threadId
        },
        fetch: function(c) {
            return b.Collection.prototype.fetch.call(this, a.extend({
                data: {
                    post: this.postId,
                    thread: this.threadId,
                    vote: c.vote,
                    limit: this.LIMIT
                }
            }, c))
        }
    });
    return e
}), define("core/collections/VoteCollection", ["backbone", "core/models/Vote"], function(a, b) {
    "use strict";
    var c = a.Collection.extend({
        model: b
    });
    return c
}), define("core/models/Post", ["jquery", "underscore", "backbone", "moment", "core/config/urls", "core/api", "core/strings", "core/time", "core/utils", "core/utils/html", "core/advice", "remote/config", "core/models/mixins", "core/collections/VotersUserCollection", "core/collections/VoteCollection"], function(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o) {
    "use strict";
    var p = 1e3,
        q = 0,
        r = function() {
            var b = a.now();
            return !(b - q < p) && (q = b, !0)
        },
        s = g.get,
        t = c.Model.extend({
            votersCollectionClass: n,
            defaults: function() {
                return {
                    createdAt: d().format(h.ISO_8601),
                    editableUntil: d().add(l.max_post_edit_days, "days").format(h.ISO_8601),
                    dislikes: 0,
                    isApproved: !0,
                    isDeleted: !1,
                    isEdited: !1,
                    isFlagged: !1,
                    isFlaggedByUser: !1,
                    isHighlighted: !1,
                    isRealtime: !1,
                    isImmediateReply: !1,
                    isMinimized: null,
                    hasMedia: !1,
                    message: null,
                    raw_message: null,
                    likes: 0,
                    media: [],
                    parent: null,
                    points: 0,
                    depth: 0,
                    userScore: 0,
                    rating: null
                }
            },
            initialize: function() {
                this.votes = new o
            },
            messageText: function() {
                var a = this.get("message");
                return a && j.stripTags(a)
            },
            permalink: function(a, b) {
                var c = this.id;
                if (!c || !a) return "";
                var d = b !== !1 && a.currentUrl || a.permalink(),
                    e = window.document.createElement("a");
                return e.href = d, e.hash = "#comment-" + c, e.href
            },
            shortLink: function() {
                return e.shortener + "/p/" + Number(this.id).toString(36)
            },
            twitterText: function(a) {
                var b = 140,
                    c = this.author.get("name") || this.author.get("username");
                b -= c.length + 3, b -= a.length + 1, b -= 2;
                var d = i.niceTruncate(this.messageText(), b);
                return '"' + d + '" — ' + c
            },
            toJSON: function(a) {
                var b = c.Model.prototype.toJSON.call(this);
                if (a) {
                    var d = a.session,
                        e = a.thread;
                    b.canBeEdited = this.canBeEdited(d, e),
                        b.canBeRepliedTo = this.canBeRepliedTo(d, e), b.canBeShared = this.canBeShared(), b.permalink = this.permalink(e)
                }
                return b.shortLink = this.shortLink(), b.isMinimized = this.isMinimized(), b.plaintext = this.messageText(), b.relativeCreatedAt = this.getRelativeCreatedAt(), b.formattedCreatedAt = this.getFormattedCreatedAt(), b.cid = this.cid, b
            },
            isPublic: function() {
                return !(!this.get("isHighlighted") && !this.get("isSponsored")) || !this.get("isDeleted") && this.get("isApproved")
            },
            isMinimized: function() {
                return !this.get("isHighlighted") && (this.get("isMinimized") !== !1 && !this.get("isApproved"))
            },
            isAuthorSessionUser: function() {
                return !1
            },
            canBeEdited: function() {
                return !1
            },
            canBeRepliedTo: function() {
                return !1
            },
            canBeShared: function() {
                return !1
            },
            validateMessage: function(a) {
                if (b.isString(a.raw_message)) {
                    if ("" === a.raw_message) return s("Comments can't be blank.");
                    if (a.raw_message.length < 2) return s("Comments must have at least 2 characters.")
                }
            },
            validate: function(c) {
                if (!this.id && !c.id) {
                    var d = this.validateMessage(c);
                    return d ? d : (c.author_email && (c.author_email = a.trim(c.author_email)), c.author_name && (c.author_name = a.trim(c.author_name)), "" === c.author_email && "" === c.author_name ? s("Please sign in or enter a name and email address.") : "" === c.author_email || "" === c.author_name ? s("Please enter both a name and email address.") : b.isString(c.author_email) && !this.validateEmail(c.author_email) ? s("Invalid email address format.") : void 0)
                }
            },
            validateEmail: function(a) {
                return i.validateEmail(a)
            },
            report: function(a) {
                this.set("isFlagged", !0);
                var b = {
                    post: this.id
                };
                a && (b.reason = a), f.call("posts/report.json", {
                    data: b,
                    method: "POST"
                })
            },
            _highlight: function(a) {
                this.set("isHighlighted", a), f.call("posts/" + (a ? "highlight" : "unhighlight") + ".json", {
                    data: {
                        post: this.id
                    },
                    method: "POST"
                })
            },
            highlight: function() {
                this._highlight(!0)
            },
            unhighlight: function() {
                this._highlight(!1)
            },
            getThreadId: function() {
                return this.get("thread")
            },
            getUpvotersUserCollection: b.memoize(function() {
                var a = this.votersCollectionClass;
                return new a((void 0), {
                    postId: this.id,
                    threadId: this.getThreadId()
                })
            }, function() {
                return [this.id, "1"].join("")
            }),
            getDownvotersUserCollection: b.memoize(function() {
                var a = this.votersCollectionClass;
                return new a((void 0), {
                    postId: this.id,
                    threadId: this.getThreadId()
                })
            }, function() {
                return [this.id, "-1"].join("")
            }),
            _vote: function(a, b, c) {
                var d = a - b,
                    e = {
                        likes: this.get("likes"),
                        dislikes: this.get("dislikes"),
                        points: this.get("points")
                    };
                return 0 === d ? d : (a > 0 ? (e.likes += a, e.dislikes += b) : a < 0 ? (e.dislikes -= a, e.likes -= b) : b > 0 ? e.likes -= b : e.dislikes += b, e.points += d, c && (1 === a ? (this.getUpvotersUserCollection().add(c), this.getDownvotersUserCollection().remove(c)) : (this.getDownvotersUserCollection().add(c), this.getUpvotersUserCollection().remove(c))), this.set(e), d)
            },
            vote: function(a) {
                if (!r()) return 0;
                var b = this,
                    c = b._vote(a, b.get("userScore"));
                if (0 !== c) {
                    var d = b.author ? b.author.get("numLikesReceived") : 0;
                    1 === b.get("userScore") ? d -= 1 : 1 === a && (d += 1), b.set("userScore", a), f.call("posts/vote.json", {
                        data: {
                            post: b.id,
                            vote: a
                        },
                        method: "POST",
                        success: function(c) {
                            b.votes.add({
                                id: c.response.id,
                                score: a
                            }, {
                                merge: !0
                            }), b.author && b.author.set("numLikesReceived", d)
                        }
                    })
                }
            },
            _delete: function() {
                return this.set({
                    isApproved: !1,
                    isDeleted: !0
                }), f.call("posts/remove.json", {
                    data: {
                        post: this.id
                    },
                    method: "POST"
                })
            },
            spam: function() {
                this.set({
                    isApproved: !1,
                    isDeleted: !0,
                    isSpam: !0
                }), this.trigger("spam"), f.call("posts/spam.json", {
                    data: {
                        post: this.id
                    },
                    method: "POST"
                })
            },
            _create: function(a, b) {
                var c = this,
                    d = a.attributes,
                    e = {
                        thread: d.thread,
                        message: d.raw_message,
                        rating: d.rating
                    };
                return d.parent && (e.parent = d.parent), d.author_name && (e.author_name = d.author_name, e.author_email = d.author_email), f.call("posts/create.json", {
                    data: e,
                    method: "POST",
                    success: function(a) {
                        c.set(a.response), b.success && b.success()
                    },
                    error: b.error
                })
            },
            _update: function(a, b) {
                var c = this,
                    d = a.attributes,
                    e = {
                        post: d.id,
                        message: d.raw_message,
                        rating: d.rating
                    };
                return f.call("posts/update.json", {
                    data: e,
                    method: "POST",
                    success: function(a) {
                        c.set(a.response), b.success && b.success()
                    },
                    error: b.error
                })
            },
            _read: function(a, b) {
                var c = this;
                return b = b || {}, f.call("posts/details.json", {
                    data: {
                        post: c.id
                    },
                    method: "GET",
                    success: function(a) {
                        c.set(a.response), b.success && b.success()
                    },
                    error: b.error
                })
            },
            sync: function(a, b, c) {
                c = c || {};
                var d = c.error;
                switch (d && (c.error = function(a) {
                    var b = {};
                    try {
                        b = JSON.parse(a.responseText)
                    } catch (c) {}
                    d(b)
                }), a) {
                    case "create":
                        return this._create(b, c);
                    case "update":
                        return this._update(b, c);
                    case "delete":
                        return this._delete();
                    case "read":
                        return this._read(b, c);
                    default:
                        return null
                }
            },
            storageKey: function() {
                if (this.isNew() && this.getThreadId()) return ["drafts", "thread", this.getThreadId(), "parent", this.get("parent") || 0].join(":")
            }
        }, {
            formatMessage: function() {
                var a = /(?:\r\n|\r|\n){2,}/,
                    c = /\r\n|\r|\n/;
                return function(d) {
                    var e = b.chain(d.split(a)).compact().value(),
                        f = b.map(e, function(a) {
                            return b.chain(a.split(c)).compact().map(b.escape).join("<br>").value()
                        }).join("</p><p>");
                    return "<p>" + f + "</p>"
                }
            }()
        });
    return m.withCreatedAt.call(t.prototype), k.withAdvice.call(t.prototype), t.withAuthor = function(a) {
        this.around("set", function(c, d, e, f) {
            var g;
            if (null == d) return this;
            "object" == typeof d ? (g = d, f = e) : (g = {}, g[d] = e);
            var h = g.author;
            if (h) {
                if (b.isString(h) || b.isNumber(h)) {
                    var i = h;
                    h = {}, h[a.prototype.idAttribute || "id"] = i
                }
                var j = this.collection || this.author && this.author.collection,
                    k = j && j.thread && j.thread.forum;
                if (this.author && this.author.get("badges").length && this.author.get("badges")[0].id) h.badges = this.author.get("badges");
                else if (k && k.get("badges") && h.badges) {
                    var l = [],
                        m = h.badges || [],
                        n = k.get("badges");
                    m.forEach(function(a) {
                        n[a] && l.push(n[a])
                    }), h.badges = l
                }
                this.author = new a(h), this.trigger("changeRelated:author"), delete g.author
            }
            return c.call(this, g, f)
        }), this.around("toJSON", function(a) {
            var c = a.apply(this, b.rest(arguments));
            return this.author && (c.author = this.author.toJSON()), c
        })
    }, t.withMediaCollection = function(a) {
        this.after("set", function(c) {
            c && "string" != typeof c && (b.isUndefined(c.media) || (this.media ? this.media.reset(c.media) : this.media = new a(c.media), delete c.media))
        }), this.around("toJSON", function(a) {
            var c = a.apply(this, b.rest(arguments));
            return this.media && (c.media = this.media.toJSON()), c
        })
    }, t
}), define("core/utils/threadRatingsHelpers", ["core/utils/object/get"], function(a) {
    "use strict";
    var b = {};
    return b.isThreadRatingsEnabled = function(b, c) {
        return !!(b && b.forum && c && c.id === b.forum) && Boolean(a(b, ["ratingsEnabled"]) && a(c, ["settings", "threadRatingsEnabled"]) && a(c, ["features", "threadRatings"]))
    }, b.isThreadModelRatingsEnabled = function(a) {
        if (!a || !a.forum) return !1;
        var b = a.forum.get("settings"),
            c = a.forum.get("features");
        return Boolean(a.get("ratingsEnabled") && b && b.threadRatingsEnabled && c && c.threadRatings)
    }, b.isForumRatingsEnabled = function(b) {
        return !!b && Boolean(a(b, ["settings", "threadRatingsEnabled"]) && a(b, ["features", "threadRatings"]))
    }, b.isForumModelRatingsEnabled = function(a) {
        if (!a) return !1;
        var b = a.get("settings"),
            c = a.get("features");
        return Boolean(b && b.threadRatingsEnabled && c && c.threadRatings)
    }, b
}), define("core/models/Thread", ["underscore", "backbone", "loglevel", "core/config/urls", "core/utils", "core/api", "core/config", "core/advice", "core/UniqueModel", "core/utils/threadRatingsHelpers", "core/models/User"], function(a, b, c, d, e, f, g, h, i, j, k) {
    "use strict";
    var l = b.Model,
        m = l.prototype,
        n = l.extend({
            defaults: {
                author: null,
                category: null,
                createdAt: null,
                forum: null,
                identifiers: [],
                ipAddress: null,
                isClosed: !1,
                isDeleted: !1,
                hasStreaming: !1,
                link: null,
                message: null,
                slug: null,
                title: null,
                userSubscription: !1,
                posts: 0,
                likes: 0,
                dislikes: 0,
                userScore: 0
            },
            initialize: function(a, b) {
                b = b || {}, this.moderators = b.moderators, this.forum = b.forum, this.on("change:userScore", function() {
                    var a = this.get("userScore");
                    a > 0 && 0 === this.get("likes") && this.set("likes", a)
                }, this)
            },
            _vote: function(a, b) {
                var c = a - b;
                return 0 === c ? c : (this.set("likes", this.get("likes") + c), c)
            },
            vote: function(a) {
                var b = this,
                    c = b._vote(a, b.get("userScore"));
                0 !== c && (this.set("userScore", a), f.call("threads/vote.json", {
                    data: {
                        thread: this.id,
                        vote: a
                    },
                    method: "POST",
                    success: function(a) {
                        a.response.id && b.trigger("vote:success", a)
                    }
                }))
            },
            fetch: function(a) {
                var b, d = this,
                    e = d.attributes;
                a = a || {}, b = e.identifier ? "ident:" + e.identifier : "link:" + e.url, f.call("threads/details.json", {
                    data: {
                        thread: b,
                        forum: e.forum
                    },
                    success: function(b) {
                        d.set(b.response), a.success && a.success()
                    },
                    error: function() {
                        g.debug ? d.save({}, {
                            success: a.success
                        }) : c.info("Couldn't find thread; not creating in production.")
                    }
                })
            },
            _toggleState: function(a, b) {
                b || (b = {});
                var c = a ? "open.json" : "close.json";
                return this.set("isClosed", !a), f.call("threads/" + c, {
                    method: "POST",
                    data: {
                        thread: this.id
                    },
                    success: b.success,
                    error: b.error
                })
            },
            open: function(a) {
                return this._toggleState(!0, a)
            },
            close: function(a) {
                return this._toggleState(!1, a)
            },
            premoderate: function(b, c) {
                return this.set("validateAllPosts", b), f.call("threads/update", a.extend({}, c, {
                    method: "POST",
                    data: a.extend({
                        thread: this.id,
                        validateAllPosts: b ? 1 : 0
                    }, c && c.data)
                }))
            },
            sync: function() {
                var a = this,
                    b = a.attributes;
                f.call("threads/create.json", {
                    data: {
                        title: b.title,
                        forum: b.forum,
                        identifier: b.identifier,
                        url: b.url
                    },
                    method: "POST",
                    success: function(b) {
                        a.set(b.response)
                    }
                })
            },
            fetchRatings: function() {
                var a = this,
                    b = {
                        thread: a.id
                    };
                return f.call("threads/ratingsSummary.json", {
                    data: b,
                    method: "GET",
                    success: function(b) {
                        a.set("ratings", b.response)
                    }
                })
            },
            toggleRatingsEnabled: function() {
                var a = this;
                if (j.isForumModelRatingsEnabled(a.forum)) {
                    var b = a.get("ratingsEnabled"),
                        c = {
                            thread: a.id,
                            ratingsEnabled: b ? 0 : 1
                        };
                    return a.set("ratingsEnabled", !b), f.call("threads/update.json", {
                        data: c,
                        method: "POST"
                    })
                }
            },
            incrementPostCount: function(a) {
                var b = this.get("posts") + a;
                this.set("posts", b > 0 ? b : 0)
            },
            isModerator: function(b) {
                var c;
                if (this.moderators) return c = b instanceof k || a.isObject(b) ? b.id : b, c = parseInt(c, 10), a(this.moderators).contains(c)
            },
            subscribe: function(a) {
                a = a !== !1;
                var b = this.get("userSubscription");
                if (b !== a) {
                    this.set("userSubscription", a);
                    var c = a ? "subscribe.json" : "unsubscribe.json",
                        d = {
                            thread: this.id
                        };
                    return f.call("threads/" + c, {
                        data: d,
                        method: "POST"
                    })
                }
            },
            twitterText: function(a) {
                var b = 140 - (a.length + 1),
                    c = this.get("clean_title");
                return c = e.niceTruncate(c, b)
            },
            permalink: function() {
                return this.get("url") || this.get("link") || this.currentUrl
            },
            shortLink: function() {
                return d.shortener + "/t/" + Number(this.id).toString(36)
            },
            toJSON: function() {
                var a = m.toJSON.call(this);
                return a.permalink = this.permalink(), a.shortLink = this.shortLink(), a
            },
            getDiscussionRoute: function(a) {
                var b = ["", "home", "discussion", this.forum.id, this.get("slug"), ""];
                return a = a || this.forum.channel, a && (a = a.attributes || a, b.splice(2, 0, "channel", a.slug)), b.join("/")
            }
        });
    return h.withAdvice.call(n.prototype), n.withThreadVoteCollection = function(a) {
        this.after("initialize", function() {
            this.votes = new a, this.on("vote:success", function(a) {
                this.votes.get(a.response.id) || this.votes.add({
                    id: a.response.id,
                    score: a.response.vote,
                    currentUser: !0
                })
            }, this)
        })
    }, n.withPostCollection = function(b) {
        this.after("initialize", function(c) {
            c = c || {}, this.posts = new b(c.posts, {
                thread: this,
                cursor: c.postCursor,
                order: c.order,
                perPage: this.postsPerPage
            }), this.listenTo(this.posts, "add reset", function(b) {
                b = b.models ? b.models : [b], this.users && a.each(b, function(a) {
                    this.users.get(a.author.id) || this.users.add(a.author)
                }), this.recalculatePostCount()
            }), this.listenTo(this.posts, "change:isDeleted change:isFlagged", function(a, b) {
                b && this.incrementPostCount(-1)
            })
        }), this.recalculatePostCount = function() {
            var a = this.get("posts");
            a > 50 || (a = this.posts.reduce(function(a, b) {
                return b.isPublic() ? a + 1 : a
            }, 0), this.set("posts", a))
        }
    }, i.addType("Thread", n), n
}), define("core/models/Forum", ["backbone", "core/UniqueModel", "core/api"], function(a, b, c) {
    "use strict";
    var d = a.Model.extend({
        defaults: {
            settings: {},
            badges: [],
            followUrl: "forums/follow",
            unfollowUrl: "forums/unfollow",
            isFollowing: !1
        },
        initialize: function(a, b) {
            b && b.channel && (this.channel = b.channel), this.getFeatures(), this.on("change:id", this.getFeatures), this.on("change:id", this.getBadges)
        },
        _changeFollowingState: function(a) {
            return c.call(a, {
                method: "POST",
                data: {
                    target: this.get("id")
                }
            })
        },
        follow: function() {
            return this.set("isFollowing", !0), this._changeFollowingState(this.get("followUrl"))
        },
        unfollow: function() {
            return this.set("isFollowing", !1), this._changeFollowingState(this.get("unfollowUrl"))
        },
        toggleFollowed: function() {
            if (this.channel && this.channel.get("options").isCurationOnlyChannel) return this.channel.toggleFollowed();
            var a = this.get("isFollowing") ? this.unfollow() : this.follow();
            return this.trigger("toggled:isFollowing"), a
        },
        getFeatures: function() {
            var a = this;
            a.id && c.call("forums/details", {
                data: {
                    forum: this.id,
                    attach: "forumFeatures"
                },
                success: function(b) {
                    b && b.response && a.set("features", b.response.features)
                }
            })
        },
        getBadges: function() {
            if (this.id && this.get("badges")) {
                var a = {},
                    b = {};
                b.id = this.get("pk"), b.url = this.get("id"), this.get("badges").forEach(function(c) {
                    c.forum = b, a[c.id] = c
                }), this.set("badges", a)
            }
        }
    });
    return b.addType("Forum", d), d
}), define("core/models/Media", ["underscore", "backbone", "core/api", "core/UniqueModel"], function(a, b, c, d) {
    "use strict";
    var e = b.Model.extend({
        idAttribute: "url",
        defaults: {
            mediaType: null,
            html: "",
            htmlWidth: null,
            htmlHeight: null,
            thumbnailUrl: "",
            thumbnailWidth: null,
            thumbnailHeight: null,
            url: "",
            urlRedirect: "",
            resolvedUrl: "",
            resolvedUrlRedirect: "",
            title: "",
            description: "",
            providerName: ""
        },
        parse: function(a) {
            return a.response
        },
        sync: function(b, d, e) {
            if ("read" !== b) throw new Error('Media models do not support methods other than "read".');
            return c.call("media/details.json", a.extend({
                method: "POST",
                data: {
                    url: this.get("url"),
                    forum: e.forum
                }
            }, e))
        }
    }, {
        MEDIA_TYPES: {
            IMAGE: "1",
            IMAGE_UPLOAD: "2",
            YOUTUBE_VIDEO: "3",
            WEBPAGE: "4",
            TWITTER_STATUS: "5",
            FACEBOOK_PAGE: "6",
            FACEBOOK_POST: "7",
            FACEBOOK_PHOTO: "8",
            FACEBOOK_VIDEO: "9",
            SOUNDCLOUD_SOUND: "10",
            GOOGLE_MAP: "11",
            VIMEO_VIDEO: "12",
            VINE_VIDEO: "14",
            GIF_VIDEO: "15"
        },
        WEBPAGE_TYPES: ["4", "6", "7"]
    });
    return d.addType("Media", e), e
}), define("core/collections/MediaCollection", ["backbone", "core/models/Media"], function(a, b) {
    "use strict";
    var c = a.Collection.extend({
        model: b
    });
    return c
}), define("common/models", ["require", "jquery", "underscore", "backbone", "modernizr", "core/api", "core/UniqueModel", "core/models/User", "core/models/Post", "core/models/Thread", "core/models/Forum", "core/collections/MediaCollection", "core/utils/object/get", "core/utils/url/serialize", "core/utils/guid", "common/utils", "core/utils", "common/urls", "core/shared/urls", "backbone.uniquemodel"], function(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s) {
    "use strict";
    var t = k.extend({
            defaults: {
                settings: {}
            },
            toJSON: function() {
                return c.extend(d.Model.prototype.toJSON.apply(this, arguments), {
                    homeUrl: s.apps.home + "home/forums/" + this.id + "/"
                })
            }
        }),
        u = j.extend({
            initialize: function(b, d) {
                j.prototype.initialize.apply(this, arguments), d = d || {};
                var e = this,
                    f = a("common/collections");
                e.users = new f.UserCollection(d.users, {
                    thread: e
                }), e.forum && (e.moderatorList = new f.ModeratorCollection(null, {
                    forum: e.forum.get("id")
                })), e.posts = new f.SubpaginatedPostCollection(d.posts, {
                    thread: e,
                    cursor: d.postCursor,
                    order: d.order,
                    perPage: q.isMobileUserAgent() ? 20 : 50
                }), e.votes = new f.ThreadVoteCollection, e.posts.on("add reset", function(a) {
                    a = a.models ? a.models : [a], c.each(a, function(a) {
                        e.users.get(a.author.id) || e.users.add(a.author)
                    }), e.recalculatePostCount()
                }), e.listenTo(e.posts, "change:isDeleted change:isFlagged", function(a, b) {
                    b && e.incrementPostCount(-1)
                }), e.queue = new f.QueuedPostCollection(null, {
                    thread: e
                })
            },
            recalculatePostCount: function() {
                var a = this.get("posts");
                a > 50 || (a = this.posts.buffer.reduce(function(a, b) {
                    var c = b.isPublic() && (!b.get("sb") || b.isAuthorSessionUser());
                    return c ? a + 1 : a
                }, 0), this.set("posts", a))
            },
            toJSON: function() {
                var a = this.get("forum"),
                    b = c.isObject(a) ? a.id : a;
                return c.extend(j.prototype.toJSON.apply(this, arguments), {
                    homeUrl: s.apps.home + "home/discussions/" + b + "/" + this.get("slug") + "/"
                })
            }
        });
    j.withThreadVoteCollection.call(u.prototype, d.Collection);
    var v = i.extend({
        initialize: function() {
            i.prototype.initialize.apply(this, arguments);
            var b = a("common/collections");
            this.usersTyping = new b.TypingUserCollection
        },
        isAuthorSessionUser: function(b) {
            var c = a("common/Session"),
                d = m(b, ["user", "id"]) || c.fromCookie().id;
            return !!(d && this.author && this.author.id) && this.author.id.toString() === d.toString()
        },
        canBeEdited: function(a, b) {
            var c = this.get("editableUntil"),
                d = (new Date).toISOString();
            return !b.get("isClosed") && !this.get("isDeleted") && a.isLoggedIn() && this.isAuthorSessionUser(a) && this.get("raw_message") && !this.get("isHighlighted") && !this.get("isSponsored") && d < c
        },
        canBeRepliedTo: function(a, b) {
            return !b.get("isClosed") && a.get("canReply") && !this.get("isDeleted") && (this.get("isApproved") || b.isModerator(a.user))
        },
        canBeShared: function() {
            return !this.get("isDeleted") && !this.get("isSponsored")
        },
        getParent: function() {
            var a = this.get("parent");
            if (a) return new g(v, {
                id: String(a)
            })
        }
    }, {
        fetchContext: function(a, d, e) {
            e = e || {};
            var h = b.Deferred();
            return f.call("posts/getContext.json", {
                method: "GET",
                data: {
                    post: a,
                    order: d.posts.buffer.order
                },
                success: function(a) {
                    var b = c.filter(a.response, function(a) {
                        return a.thread === d.get("id")
                    });
                    return b ? (c.each(b, function(a) {
                        d.posts.get(a.id) && delete a.hasMore, a = new g(v, a), e.requestedByPermalink && (a.requestedByPermalink = !0), d.posts.add(a)
                    }), void h.resolve(b)) : void h.reject()
                }
            }), h.promise()
        }
    });
    i.withAuthor.call(v.prototype, g.wrap(h)), i.withMediaCollection.call(v.prototype, l), g.addType("Post", v);
    var w = d.Model.extend({
            defaults: {
                user: null,
                message: null,
                parentId: null,
                immedReply: !1,
                createdAt: void 0
            },
            getVisibleParent: function(a) {
                for (var b, c = this; c.get("parentId");) {
                    if (b = a.posts.get(c.get("parentId"))) return b;
                    if (c = a.queue.get(c.get("parentId")), !c) return null
                }
                return null
            },
            toPost: function(a) {
                var b = this,
                    c = a.posts.get(b.get("parentId")),
                    d = c ? c.get("depth") + 1 : 0,
                    e = new g(v, {
                        id: b.id,
                        forum: a.get("forum"),
                        thread: a.id,
                        message: b.get("message"),
                        parent: b.get("parentId"),
                        depth: d,
                        createdAt: b.get("createdAt"),
                        isRealtime: !0,
                        media: b.get("media"),
                        isImmediateReply: b.get("immedReply")
                    });
                return e.author = b.get("user"), e
            }
        }),
        x = d.Model.extend({
            defaults: {
                user: null,
                post: null,
                thread: null,
                client_context: null,
                typing: !0
            },
            idAttribute: "client_context",
            set: function() {
                return this.lastModified = new Date, d.Model.prototype.set.apply(this, arguments)
            },
            sync: function() {
                var a = this.toJSON(),
                    b = n(r.realertime + "/api/typing", a);
                try {
                    p.CORS.request("GET", b).send()
                } catch (c) {}
            }
        }, {
            make: function(a) {
                return a.client_context || (a.client_context = o.generate()), new g(x, a)
            }
        });
    g.addType("TypingUser", x);
    var y = h.prototype.toJSON;
    c.extend(h.prototype, {
        getFollowing: function() {
            var b = a("common/collections/profile");
            return this.following || (this.following = new b.FollowingCollection(null, {
                user: this
            }))
        },
        hasDisqusProfileUrl: function() {
            var a = y.apply(this, arguments);
            if (!a.profileUrl) return !1;
            var b = a.profileUrl.match(/^https?:\/\/([^/?#]+)(?:[/?#]|$)/i);
            return b && b.length >= 2 && ("disqus.com" === b[1] || "dev.disqus.org:8000" === b[1])
        },
        toJSON: function() {
            var b = y.apply(this, arguments),
                c = a("common/Session"),
                d = c.get(),
                e = d && d.get("sso") && d.get("sso").profile_url;
            e && (e = String(e), 0 === e.indexOf("//") && (e = "https:" + e), /https?:\/\//.test(e) || (e = null), /\{username\}/.test(e) && b.name || (e = null));
            var f = this.hasDisqusProfileUrl();
            return b.isSSOProfileUrl = !f || Boolean(e), f && e && (b.profileUrl = e.replace(/\{username\}/gi, encodeURIComponent(b.name))), b
        }
    }), g.addType("User", h);
    var z = h.extend({
            defaults: c.extend({
                numPosts: 0
            }, h.prototype.defaults)
        }),
        A = e.sessionstorage ? "sessionStorage" : null,
        B = d.UniqueModel(h, "User", A),
        C = d.UniqueModel(z, "User", A),
        D = d.Model.extend({}),
        E = d.Model.extend({
            defaults: {
                id: "",
                title: "",
                rating: "g",
                "default": {
                    url: "",
                    height: "",
                    width: ""
                },
                fixedWidth200: {
                    url: "",
                    height: "",
                    width: ""
                },
                fixedWidth100: {
                    url: "",
                    height: "",
                    width: ""
                }
            }
        });
    return {
        Forum: t,
        Thread: u,
        Post: v,
        QueuedPost: w,
        TypingUser: x,
        User: h,
        TopUser: z,
        Switch: D,
        SyncedUser: B,
        SyncedTopUser: C,
        GifObject: E
    }
}), define("core/models/Channel", ["underscore", "backbone", "core/UniqueModel", "core/api", "core/models/Forum", "core/strings"], function(a, b, c, d, e, f) {
    "use strict";
    var g = f.get,
        h = b.Model.extend({
            defaults: {
                primaryForum: {},
                slug: null,
                name: null,
                options: {},
                followUrl: "channels/follow",
                unfollowUrl: "channels/unfollow"
            },
            idAttribute: "slug",
            initialize: function(a, b) {
                this.buildPrimaryForum(b), this.listenTo(this, "change:primaryForum", this.updatePrimaryForum), this.listenTo(this, "change:primaryCategory", this.updatePrimaryCategory)
            },
            buildPrimaryForum: function() {
                if (!this.primaryForum) {
                    var a = this.get("primaryForum");
                    a && (this.primaryForum = new c(e, a, {
                        channel: this
                    }), this.unset("primaryForum"))
                }
            },
            updatePrimaryForum: function() {
                var a = this.get("primaryForum");
                a && (this.primaryForum || this.buildPrimaryForum(), this.primaryForum.set(a), this.unset("primaryForum"))
            },
            updatePrimaryCategory: function() {
                var a = this.get("primaryCategory"),
                    b = this.primaryCategory;
                null === a ? this.primaryCategory = void 0 : b ? b.set(a) : this.primaryCategory = new c(h, a), this.unset("primaryCategory"), this.trigger("changeRelated:primaryCategory")
            },
            fetch: function(c) {
                return c = c ? a.clone(c) : {}, c.data = this.buildFetchData(c.data), b.Model.prototype.fetch.call(this, c)
            },
            buildFetchData: function(b) {
                var c = b ? a.clone(b) : {};
                return this.id && (c.channel = this.id), c
            },
            url: function(a) {
                return d.getURL(this.constructor.URLS[a] || this.constructor.URLS.read)
            },
            sync: function(c, d, e) {
                var f = d.attributes;
                e = a.extend({
                    url: this.url(c),
                    emulateHTTP: !0
                }, e);
                var g = {
                    bannerColor: f.bannerColor,
                    description: f.description,
                    primaryCategory: d.primaryCategory && d.primaryCategory.get("slug") || ""
                };
                switch ("default" === e.avatarType ? g.avatar = "" : f.avatar && !a.isString(f.avatar) && (g.avatar = f.avatar), "file" !== e.bannerType ? g.banner = "" : f.banner && !a.isString(f.banner) && (g.banner = f.banner), c) {
                    case "create":
                        e.processData = !1, e.contentType = !1, g.name = f.name, e.data = this.toFormData(a.extend({}, g, e.data));
                        break;
                    case "update":
                        e.processData = !1, e.contentType = !1, g.channel = f.slug, e.data = this.toFormData(a.extend({}, g, e.data))
                }
                return b.sync(c, d, e)
            },
            toFormData: function(b) {
                return a.reduce(b, function(b, c, d) {
                    return b.append(d, a.isString(c) ? c.trim() : c), b
                }, new window.FormData)
            },
            parse: function(a) {
                return a.response || a
            },
            shouldFetch: function() {
                return !this.get("name") || !this.get("dateAdded")
            },
            ensureFetched: function() {
                this.shouldFetch() && this.fetch()
            },
            validate: function(b) {
                var c = [],
                    d = b.name.trim();
                d.length < this.constructor.MIN_NAME_LENGTH ? c.push({
                    attrName: "name",
                    message: f.interpolate(g("Name must have at least %(minLength)s characters."), {
                        minLength: this.constructor.MIN_NAME_LENGTH
                    })
                }) : d.length > this.constructor.MAX_NAME_LENGTH && c.push({
                    attrName: "name",
                    message: f.interpolate(g("Name must have less than %(maxLength)s characters."), {
                        maxLength: this.constructor.MAX_NAME_LENGTH
                    })
                });
                var e = b.description.trim();
                if (e.length < this.constructor.MIN_DESCRIPTION_LENGTH ? c.push({
                        attrName: "description",
                        message: f.interpolate(g("Description must have at least %(minLength)s characters."), {
                            minLength: this.constructor.MIN_DESCRIPTION_LENGTH
                        })
                    }) : e.length > this.constructor.MAX_DESCRIPTION_LENGTH && c.push({
                        attrName: "description",
                        message: f.interpolate(g("Description must have less than %(maxLength)s characters."), {
                            maxLength: this.constructor.MAX_DESCRIPTION_LENGTH
                        })
                    }), this.constructor.BANNER_COLORS[b.bannerColor] || c.push({
                        attrName: "bannerColor",
                        message: f.interpolate(g("Banner color must be one of " + a.invoke(a.values(this.constructor.BANNER_COLORS), "toLowerCase").join(", ")) + ".")
                    }), !a.isEmpty(c)) return c
            },
            _changeFollowingState: function(b, c) {
                return c = c || {}, c.type = "POST", c.data = a.extend({
                    target: this.get("slug")
                }, c.data), d.call(b, c)
            },
            follow: function(a) {
                return this.primaryForum.set("isFollowing", !0), this._changeFollowingState(this.get("followUrl"), a)
            },
            unfollow: function(a) {
                return this.primaryForum.set("isFollowing", !1), this._changeFollowingState(this.get("unfollowUrl"), a)
            },
            toggleFollowed: function() {
                if (this.get("options").isCurationOnlyChannel && this.primaryForum) {
                    var a = this.primaryForum.get("isFollowing") ? this.unfollow() : this.follow();
                    return this.primaryForum.trigger("toggled:isFollowing"), a
                }
            },
            toJSON: function() {
                var c = b.Model.prototype.toJSON.call(this);
                return a.defaults({
                    primaryCategory: this.primaryCategory ? this.primaryCategory.toJSON() : {}
                }, c)
            }
        }, {
            URLS: {
                read: "channels/details",
                create: "channels/create",
                update: "channels/update"
            },
            BANNER_COLORS: {
                gray: g("Gray"),
                blue: g("Blue"),
                green: g("Green"),
                yellow: g("Yellow"),
                orange: g("Orange"),
                red: g("Red"),
                purple: g("Purple")
            },
            MIN_NAME_LENGTH: 3,
            MAX_NAME_LENGTH: 100,
            MIN_DESCRIPTION_LENGTH: 5,
            MAX_DESCRIPTION_LENGTH: 200
        });
    return c.addType("Channel", h), h
}), define("core/utils/objectExpander", ["underscore", "core/UniqueModel", "core/models/Channel", "core/models/Thread"], function(a, b, c, d) {
    "use strict";
    return {
        Channel: c,
        Thread: d,
        parseObject: function(b, c) {
            return a.isString(c) ? b[c] : c
        },
        buildThread: function(c, d) {
            if (d instanceof this.Thread) return d;
            if (d = this.parseObject(c, d), a.isString(d.author)) {
                var e = d.author.replace("auth.User?id=", "");
                d.author = c["auth.User?id=" + e] || e
            }
            return new b(this.Thread, d, {
                forum: this.parseObject(c, d.forum),
                author: d.author
            })
        },
        buildChannel: function(a, c) {
            return c instanceof this.Channel ? c : (c = this.parseObject(a, c), new b(this.Channel, c))
        }
    }
}), define("core/collections/PaginatedCollection", ["underscore", "backbone"], function(a, b) {
    "use strict";
    var c = b.Collection.extend({
        PER_PAGE: 30,
        initialize: function(b, c) {
            this.cid = a.uniqueId("collection"), c = c || {}, this.cursor = c.cursor || {}
        },
        ensureFetched: a.memoize(function() {
            return this.fetch()
        }, function() {
            return this.cid
        }),
        fetch: function(c) {
            return c = c || {}, c.data = a.defaults(c.data || {}, {
                cursor: c.cursor || "",
                limit: c.limit || this.PER_PAGE
            }), b.Collection.prototype.fetch.call(this, c)
        },
        hasPrev: function() {
            return this.cursor.hasPrev
        },
        hasNext: function() {
            return this.cursor.hasNext
        },
        next: function(b) {
            return this.cursor.hasNext ? this.fetch(a.extend({}, b, {
                add: !0,
                remove: !0,
                cursor: this.cursor.next
            })) : void this.trigger("nodata")
        },
        prev: function(b) {
            return this.cursor.hasPrev ? this.fetch(a.extend({}, b, {
                add: !0,
                remove: !0,
                cursor: this.cursor.prev
            })) : void this.trigger("nodata")
        },
        more: function(b) {
            function c(a) {
                f.push(a)
            }
            var d = this;
            if (b = b || {}, b.post ? !b.post.attributes.hasMore : !this.cursor.hasNext) return void d.trigger("nodata");
            var e, f = [];
            if (b.post) {
                var g = this.postCursors[b.post.id];
                e = g && g.cursor ? g.cursor.next : ""
            } else e = this.cursor.next;
            return this.on("add", c), this.fetch(a.extend({}, b, {
                add: !0,
                remove: !1,
                cursor: e,
                limit: this.PER_PAGE || this.perPage,
                success: function() {
                    d.trigger("add:many", f, d, b), d.off("add", c), b.success && b.success.apply(this, arguments)
                }
            }))
        },
        parse: function(c) {
            return Array.isArray(c) && a.every(c, function(a) {
                return a instanceof b.Model
            }) ? c : (this.cursor = c.cursor || {
                hasNext: !1
            }, c.response)
        },
        getLength: function() {
            return this.length
        }
    });
    return c
}), define("core/collections/ChannelCollection", ["underscore", "core/collections/PaginatedCollection", "core/UniqueModel", "core/api", "core/models/Channel", "core/utils/objectExpander"], function(a, b, c, d, e, f) {
    "use strict";
    var g = b.extend({
        url: d.getURL("channels/list"),
        model: c.boundModel(e),
        initialize: function(a, c) {
            b.prototype.initialize.call(this, a, c), c = c || {}, this.listName = c.listName
        },
        fetch: function(c) {
            return c = c || {}, this.listName && (c.data = a.extend({
                listName: this.listName
            }, c.data)), b.prototype.fetch.call(this, c)
        },
        parse: function(c) {
            return Boolean(c) && Boolean(c.response) && a.isArray(c.response) && (c = a.defaults({
                response: a.filter(c.response, function(a) {
                    return !a || !a.primaryForum || !a.primaryForum.id || "channel-discussdisqus" === a.primaryForum.id
                })
            }, c)), c = b.prototype.parse.call(this, c), c.items ? a.map(c.items, function(a) {
                return f.buildChannel(c.objects, a.reference)
            }) : c
        }
    });
    return g
}), define("core/common/cached-storage", ["underscore", "core/utils/storage"], function(a, b) {
    "use strict";
    var c = function(a, b) {
        this.namespace = a, this.ttl = b || 300, this.cache = this.getFromStorage()
    };
    return a.extend(c.prototype, {
        getItem: function(a) {
            var b = this.cache[a];
            if (b) {
                if (!this.isExpired(b)) return b.value;
                delete this.cache[a]
            }
        },
        getCurrentTime: function() {
            return Math.floor((new Date).getTime() / 1e3)
        },
        persist: function() {
            b.set(this.namespace, this.cache)
        },
        getFromStorage: function() {
            var c = b.get(this.namespace);
            return a.isObject(c) ? c : {}
        },
        isExpired: function(a) {
            return this.getCurrentTime() > a.expiry
        },
        setItem: function(a, b) {
            this.cache[a] = {
                value: b,
                expiry: this.getCurrentTime() + this.ttl
            }, this.persist()
        },
        removeItem: function(a) {
            delete this.cache[a], this.persist()
        },
        getAll: function() {
            var b = a.chain(this.cache).map(function(a, b) {
                return this.getItem(b)
            }, this).compact().value();
            return this.persist(), b
        }
    }), c
}), define("common/collections", ["underscore", "backbone", "moment", "core/api", "core/utils/objectExpander", "core/utils/storage", "core/collections/UserCollection", "core/collections/PaginatedCollection", "core/collections/ChannelCollection", "core/models/ThreadVote", "core/UniqueModel", "common/models", "core/common/cached-storage", "core/constants/voteConstants", "lounge/common"], function(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o) {
    "use strict";
    var p = b.Collection.extend({
            model: j
        }),
        q = h.extend({
            PER_PAGE: 50,
            model: k.wrap(l.Post),
            url: d.getURL("threads/listPostsThreaded"),
            initialize: function(a, b) {
                h.prototype.initialize.apply(this, arguments), b = b || {}, this.thread = b.thread, this.setOrder(b.order)
            },
            fetch: function(b) {
                return b = b || {}, a.extend(b, {
                    data: {
                        limit: this.PER_PAGE,
                        thread: this.thread.id,
                        forum: this.thread.get("forum"),
                        order: this.getOrder()
                    }
                }), h.prototype.fetch.call(this, b)
            },
            getOrder: function() {
                return this.order
            },
            setOrder: function(a) {
                "popular" === a && this.thread.forum.get("votingType") === n.VOTING_TYPES.DISABLED ? this.order = "desc" : this.order = a
            }
        }),
        r = b.Collection.extend({
            collection: b.Collection,
            initialize: function(a, b) {
                this.lounge = o.getLounge(), this.thread = b.thread, this.perPage = b.perPage || 20, this.buffer = new this.collection(a, b), this.resetPage(), this.listenTo(this.buffer, "reset", this.resetPage)
            },
            resetPage: function(c, d) {
                d = d || {};
                var e = a.isUndefined(d.customThreadLength) ? this.perPage : Math.min(d.customThreadLength, this.perPage),
                    f = this.buffer.slice(0, e);
                return this.postCursors = {}, this.fetchedReplies = 0, this.trigger("set:done", f), b.Collection.prototype.reset.call(this, f, d)
            },
            currentPage: function() {
                var a = Math.floor((this.length - this.fetchedReplies) / this.perPage);
                return (this.length - this.fetchedReplies) % this.perPage && (a += 1), a
            },
            setPageFor: function(a, b) {
                var c = this.buffer.get(a),
                    d = this.perPage;
                c && (d = this.perPage * Math.floor(this.buffer.indexOf(c) / this.perPage + 1)), this.add(this.buffer.slice(0, d), b)
            },
            hasNext: function() {
                return this.buffer.length > this.length || this.buffer.hasNext()
            },
            more: function(a) {
                a = a || {};
                var b = this,
                    c = b.length + b.perPage,
                    d = a.success;
                a.success = function() {
                    a.post || b.add(b.buffer.slice(0, c)), b.trigger("set:done", b.models), d && d()
                };
                var e = a.post ? b.get(a.post.id) : null;
                e && e.attributes.hasMore ? b.collection.prototype.more.call(b, a) : !e && b.buffer.length < b.length + b.perPage && b.buffer.hasNext() ? (b.add(b.buffer.slice(0, c)), b.buffer.more(a)) : a.success()
            }
        });
    a.each(["setOrder", "getOrder", "reset"], function(a) {
        r.prototype[a] = function() {
            return this.buffer[a].apply(this.buffer, arguments)
        }
    }), a.each(["add", "remove"], function(a) {
        r.prototype[a] = function() {
            return this.buffer[a].apply(this.buffer, arguments), b.Collection.prototype[a].apply(this, arguments)
        }
    });
    var s = r.extend({
            model: q.prototype.model,
            collection: q,
            initialize: function() {
                r.prototype.initialize.apply(this, arguments), this.postCursors = {}, this.fetchedReplies = 0, this.submittedPostsCache = new m("submitted_posts_cache"), this.on("set:done", this.mapStartPosts)
            },
            restoreFromCache: function() {
                var b = this.submittedPostsCache.getAll(),
                    c = this;
                this.add(a.chain(b).reject(function(a) {
                    return c.thread.get("id") !== a.thread || a.parent && !c.get(a.parent)
                }).map(function(a) {
                    return a.isCached = !0, a
                }).value())
            },
            removeFromCache: function(a) {
                this.submittedPostsCache.removeItem(a.id)
            },
            saveToCache: function(a) {
                this.submittedPostsCache.setItem(a.id, a.toJSON())
            },
            mapStartPosts: function(c) {
                if (null !== c) {
                    var d = this;
                    c = Array.isArray(c) ? c : [c], a.forEach(c.slice().reverse(), function(a) {
                        var c = a instanceof b.Model ? a.get("parent") : a.parent;
                        c && !d.postCursors[c] && (d.postCursors[c] = Object.defineProperty({}, "startPost", {
                            value: a.id,
                            writeable: !1
                        }))
                    })
                }
            },
            fetch: function(c) {
                if (c = c || {}, !c.post) return this.buffer.fetch(c);
                var e = this;
                return c = a.extend({
                    url: d.getURL("posts/getDescendants"),
                    data: {
                        limit: c.limit || this.perPage,
                        order: this.getOrder(),
                        post: c.post.id,
                        start_post: this.postCursors[c.post.id] ? e.postCursors[c.post.id].startPost : "",
                        cursor: c.cursor || ""
                    }
                }, c), b.Collection.prototype.fetch.call(e, c)
            },
            parse: function(a, b) {
                if (!(b.url && b.url.indexOf("posts/getDescendants") > -1)) return this.buffer.parse(a, b);
                this.postCursors[b.data.post] || (this.postCursors[b.data.post] = {}), this.postCursors[b.data.post].cursor = a.cursor, b.post.set("hasMore", a.cursor.hasNext), this.fetchedReplies += a.response.length;
                var c = this.buffer.indexOf(b.post),
                    d = this.getDescendantsFromBuffer(b.post);
                return d && this.add(d, {
                    at: c
                }), this.buffer.add(a.response, {
                    at: c + d.length
                }), a.response
            },
            getDescendantsFromBuffer: function(b) {
                var c = {};
                c[b.id] = b;
                var d = this.buffer.slice(this.buffer.indexOf(b) + 1);
                return a.some(d, function(a) {
                    var b = a.get("parent");
                    return !b || !c[b] || (c[a.id] = a, !1)
                }), a.values(c)
            }
        }),
        t = b.Collection.extend({
            model: l.QueuedPost,
            initialize: function(a, b) {
                var c = this;
                c.thread = b.thread, c.counters = {
                    comments: 0,
                    replies: {}
                }, c.on("add", function(a) {
                    var b = a.getVisibleParent(c.thread),
                        d = c.counters.replies;
                    b ? (d[b.id] = (d[b.id] || 0) + 1, b.id === a.get("parentId") && a.set("immedReply", !0)) : c.counters.comments += 1
                })
            },
            comparator: function(a) {
                return parseInt(a.id, 10)
            },
            isDescendant: function(b, c) {
                var d = b.get("parentId"),
                    e = d ? this.get(d) : null,
                    f = {};
                for (a.each(c, function(a) {
                        f[a] = !0
                    }); e;) {
                    if (f[e.get("id")] === !0) return !0;
                    d = e.get("parentId"), e = d ? this.get(d) : null
                }
                return !1
            },
            drain: function D(b) {
                function c(a) {
                    var b = [];
                    e.each(function(a) {
                        null === a.get("parentId") && b.push(a.get("id"))
                    }), e.reset(e.filter(function(c) {
                        return null === c.get("parentId") || e.isDescendant(c, b) ? void a(c) : c
                    })), e.counters.comments = 0
                }

                function d(c) {
                    var d, f = [];
                    d = e.filter(function(a) {
                        var c = a.getVisibleParent(e.thread);
                        return c && c.get("id") === b ? void f.push(a) : a
                    }), f = a.sortBy(f, function(a) {
                        return parseInt(a.get("id"), 10)
                    }), a.each(f, function(a) {
                        c(a)
                    }), e.reset(d), e.counters.replies[b] = 0
                }
                var e = this,
                    D = b ? d : c;
                return D(function(a) {
                    e.thread.posts.add(a.toPost(e.thread))
                })
            }
        }),
        u = b.Collection.extend({
            models: l.TypingUser,
            initialize: function() {
                var b = this;
                b.gc = null, b.on("add remove reset", function() {
                    var c = b.count();
                    return c > 0 && null === b.gc ? void(b.gc = setInterval(a.bind(b.cleanup, b), 6e4)) : void(c <= 0 && null !== b.gc && (clearInterval(b.gc), b.gc = null))
                }, b)
            },
            count: function(a) {
                var b = this.filter(function(b) {
                    return !(a && b.id === a) && b.get("typing")
                });
                return b.length
            },
            cleanup: function() {
                var a = c();
                this.reset(this.filter(function(b) {
                    return a.diff(b.lastModified, "minutes") < 5
                }))
            }
        }),
        v = h.extend({
            model: k.wrap(l.Post),
            url: d.getURL("users/listPostActivity")
        }),
        w = h.extend({
            model: l.Thread,
            url: d.getURL("timelines/ranked"),
            initialize: function(a, b) {
                b = b || {}, this.type = b.type, this.target = b.target
            },
            fetch: function(b) {
                return b = b || {}, b.data = a.extend({
                    type: this.type,
                    target: this.target
                }, b.data), h.prototype.fetch.call(this, b)
            },
            parse: function(b) {
                return b = h.prototype.parse.call(this, b), a.map(b.activities, function(a) {
                    return e.buildThread(b.objects, a.items[0].object)
                })
            }
        }),
        x = b.Collection.extend({
            model: l.SyncedTopUser,
            url: d.getURL("forums/listMostActiveUsers"),
            initialize: function(a, b) {
                this.forum = b.forum, this.limit = b.limit
            },
            fetch: function(c) {
                return b.Collection.prototype.fetch.call(this, a.extend({
                    data: {
                        forum: this.forum,
                        limit: this.limit
                    }
                }, c))
            },
            parse: function(b) {
                return a.filter(b.response, function(a) {
                    if (parseFloat(a.rep) > .7) return a
                })
            }
        });
    g.prototype.model = k.wrap(l.User);
    var y = b.Collection.extend({
            model: l.SyncedUser,
            url: d.getURL("forums/listModerators"),
            initialize: function(a, b) {
                this.forum = b.forum
            },
            fetch: function(c) {
                return b.Collection.prototype.fetch.call(this, a.extend({
                    data: {
                        forum: this.forum
                    }
                }, c))
            },
            parse: function(b) {
                return a.map(b.response, function(a) {
                    return a.user
                })
            }
        }),
        z = "reaction-vote",
        A = b.Collection.extend({
            url: d.getURL("threadReactions/loadReactions"),
            initialize: function(a, b) {
                this.thread = b.thread, this.enabled = Boolean(a.length), this.eligible = Boolean(b.eligible), this.userIsAnonymous = b.userIsAnonymous
            },
            fetch: function(c) {
                return b.Collection.prototype.fetch.call(this, a.extend({
                    data: {
                        thread: this.thread.id
                    }
                }, c))
            },
            parse: function(a) {
                var b = a.response,
                    c = b.reactions,
                    d = b.selected && b.selected.id;
                if (!d && this.userIsAnonymous) {
                    var e = f.get(z);
                    d = e && e[this.thread.get("id")]
                }
                if (d) {
                    var g = c.filter(function(a) {
                        return a.id === d
                    });
                    g.length && (g[0].isSelected = !0, g[0].votes || (g[0].votes = 1))
                }
                return this.enabled = Boolean(c.length), this.eligible = b.eligible, this.prompt = b.prompt, c
            },
            toggleEnabled: function() {
                var a = this;
                d.call("threadReactions/disableForThread", {
                    method: "POST",
                    data: {
                        thread: this.thread.get("id"),
                        enable: this.enabled ? 0 : 1
                    },
                    success: function() {
                        a.enabled = !a.enabled, a.trigger("change:enabled"), a.enabled && !a.length && a.fetch()
                    }
                })
            },
            vote: function(b, c) {
                var e = this.at(b);
                if (e && !e.get("isSelected")) {
                    c = c || {}, this.trigger("vote:start");
                    var g = this;
                    d.call("threadReactions/vote", a.extend({}, c, {
                        method: "POST",
                        data: {
                            thread: this.thread.get("id"),
                            reaction: e.get("id")
                        },
                        success: function() {
                            if (g.forEach(function(a, c) {
                                    var d = c === b,
                                        e = a.get("votes");
                                    d && (e += 1), a.get("isSelected") && (e = Math.max(0, e - 1)), a.set({
                                        isSelected: d,
                                        votes: e
                                    })
                                }, g), g.trigger("vote:end"), g.userIsAnonymous) {
                                var a = f.get(z) || {};
                                a[g.thread.get("id")] = e.get("id"), f.set(z, a)
                            }
                            c.success && c.success()
                        },
                        error: function() {
                            g.trigger("vote:end"), c.error && c.error()
                        }
                    }))
                }
            }
        }),
        B = b.Collection.extend({
            url: d.getURL("gifs/search"),
            model: l.GifObject,
            query: null,
            page: null,
            fetch: function(c) {
                return c.query === this.query ? this.page += 1 : this.page = 1, b.Collection.prototype.fetch.call(this, a.extend({
                    data: {
                        forum: c.forum,
                        query: c.query,
                        page: this.page
                    }
                }, c))
            },
            parse: function(a, b) {
                var c = a.response,
                    d = this.toJSON();
                return b.query === this.query ? d.concat(c) : (this.query = b.query, c)
            },
            reset: function() {
                return this.query = null, this.page = null, b.Collection.prototype.reset.call(this)
            }
        }),
        C = b.Collection.extend({
            url: d.getURL("mentions/listUsers"),
            model: l.SyncedUser,
            LIMIT: 5,
            query: null,
            cursor: null,
            initialize: function(a, b) {
                this.threadId = b && b.threadId
            },
            fetch: function(c) {
                var d = this.cursor && this.cursor.hasNext;
                if (this.query !== c.query || d) return b.Collection.prototype.fetch.call(this, a.extend({
                    data: {
                        thread: this.threadId,
                        cursor: c.next && d && this.cursor.next ? this.cursor.next.slice(2) : null,
                        query: c.query,
                        limit: c.limit || this.LIMIT
                    }
                }, c))
            },
            parse: function(a, c) {
                var d = a.response,
                    e = a.cursor,
                    f = this.toJSON();
                return f = c.query === this.query ? f.concat(d) : d, this.query = c.query, this.cursor = e, this.set(f), b.Collection.prototype.parse.call(this, f), f
            },
            reset: function() {
                return this.query = null, this.cursor = null, b.Collection.prototype.reset.call(this)
            }
        });
    return {
        PaginatedCollection: h,
        UserCollection: g,
        ChannelCollection: i,
        PostCollection: q,
        SubpaginatedPostCollection: s,
        TypingUserCollection: u,
        TopUserCollection: x,
        RankedThreadCollection: w,
        ThreadVoteCollection: p,
        PostActivityCollection: v,
        QueuedPostCollection: t,
        ModeratorCollection: y,
        ReactionsCollection: A,
        GifObjectsCollection: B,
        UserSuggestionsCollection: C
    }
}), define("core/models/Session", ["jquery", "underscore", "backbone", "moment", "core/api", "core/bus", "core/config", "core/time", "core/utils", "core/utils/cookies", "core/utils/guid", "core/utils/auth", "core/models/BaseUser", "core/models/User"], function(a, b, c, d, e, f, g, h, i, j, k, l, m, n) {
    "use strict";
    var o = function() {
            return l.getFromCookie()
        },
        p = c.Model.extend({
            initialize: function() {
                this.constructor.fromCookie = b.once(o), this.user = this.getAnonUserInstance()
            },
            setUser: function(a) {
                this.user && this.stopListening(this.user), this.user = a, this.setIfNewUser(), this.listenTo(a, "all", this.trigger), this.trigger("change:id", a)
            },
            isLoggedOut: function() {
                return !this.isLoggedIn()
            },
            isLoggedIn: function() {
                return Boolean(this.user.get("id"))
            },
            fetch: function(a) {
                var c = a || {};
                return e.call("users/details.json", {
                    data: c.data,
                    success: b.bind(function(a) {
                        a = a.response, a.id && this.setUser(this.getUserInstance(a)), c.success && c.success(a), c.complete && c.complete(a)
                    }, this),
                    error: function(a) {
                        c.error && c.error(a), c.complete && c.complete(a)
                    }
                })
            },
            getAnonUserInstance: function(a) {
                return new m(a)
            },
            getUserInstance: function(a) {
                return new n(a)
            },
            getCsrfToken: function() {
                var a = j.read("csrftoken");
                return a || (a = k.generate().replace(/\W/g, ""), j.create("csrftoken", a, {
                    domain: window.location.hostname,
                    expiresIn: 31536e6
                })), a
            },
            authenticate: function(c) {
                var d = this.authServices[c];
                if (d) {
                    if (b.isFunction(d)) return d.call(this);
                    f.trigger("uiAction:openLogin", c);
                    var e = this.getAuthWindowArgs(d),
                        g = d.url;
                    g += (g.indexOf("?") > -1 ? "&" : "?") + a.param(e), this.openAuthWindow(g, d.width, d.height)
                }
            },
            authServices: {
                disqus: {
                    url: g.urls.login,
                    width: 460,
                    height: 355,
                    attachExperiment: !0
                },
                twitter: {
                    url: g.urls.oauth.twitter,
                    width: 650,
                    height: 680,
                    csrf: !0,
                    attachExperiment: !0
                },
                facebook: {
                    url: g.urls.oauth.facebook,
                    width: 550,
                    height: 300,
                    csrf: !0,
                    attachExperiment: !0
                },
                google: {
                    url: g.urls.oauth.google,
                    width: 445,
                    height: 635,
                    csrf: !0,
                    attachExperiment: !0
                }
            },
            getAuthWindowArgs: function(a) {
                var c = {};
                return a.csrf && (c.ctkn = this.getCsrfToken()), b.extend(c, a.params), c
            },
            openAuthWindow: function(a, b, c) {
                return i.openWindow(a, "_blank", {
                    width: b,
                    height: c
                })
            },
            setIfNewUser: function() {
                var a = this.user.get("joinedAt");
                if (this.user.get("isAnonymous") || !a) return void this.user.set("joinedRecently", !1);
                var b = h.assureTzOffset(a);
                this.user.set("joinedRecently", d().subtract(10, "seconds").isBefore(b))
            }
        });
    return p.fromCookie = o, p.isKnownToBeLoggedOut = function() {
        return !p.fromCookie().id
    }, p
}), define("core/WindowBus", ["jquery", "underscore", "backbone", "modernizr"], function(a, b, c, d) {
    "use strict";
    var e = c.Model.extend({
        initialize: function() {
            d.localstorage && a(window).on("storage", b.bind(this.onStorageEvent, this))
        },
        broadcast: function(a, b) {
            if (d.localstorage) {
                var c = JSON.stringify({
                    name: a,
                    data: b,
                    time: (new Date).getTime()
                });
                try {
                    window.localStorage.setItem(this.constructor.STORAGE_KEY, c)
                } catch (e) {}
            }
        },
        onStorageEvent: function(a) {
            var b = a.originalEvent.key,
                c = a.originalEvent.newValue;
            if (c && b === this.constructor.STORAGE_KEY) try {
                c = JSON.parse(c), this.trigger(c.name, c.data)
            } catch (d) {}
        }
    }, {
        STORAGE_KEY: "disqus.bus"
    });
    return e
}), define("templates/lounge/threadVotes", ["react", "core/config/urls", "core/strings", "core/utils/object/get"], function(a, b, c, d) {
    "use strict";
    var e = c.gettext,
        f = function(c) {
            return a.createElement("div", null, a.createElement("a", {
                href: "#",
                "data-action": "favorite",
                title: e("Favorite this discussion"),
                className: "dropdown-toggle " + (d(c.thread, ["userScore"]) ? "upvoted" : "")
            }, a.createElement("span", {
                className: "label label-default"
            }, a.createElement("span", {
                className: "favorite-icon icon-heart-empty"
            }), " ", e("Favorite")), a.createElement("span", {
                className: "label label-favorited"
            }, a.createElement("span", {
                className: "favorite-icon icon-heart"
            }), " ", e("Favorite")), " ", d(c.thread, ["likes"]) ? a.createElement("span", {
                className: "label label-count"
            }, d(c.thread, ["likes"], null)) : null), a.createElement("ul", {
                className: "dropdown-menu dropdown-menu--coachmark"
            }, a.createElement("li", null, c.loggedIn ? a.createElement("div", null, a.createElement("h2", {
                className: "coachmark__heading"
            }, e("Your 1st favorited discussion!")), a.createElement("p", {
                className: "coachmark__description"
            }, e("Favoriting means this is a discussion worth sharing. It gets shared to your followers' %(Disqus)s feeds if you log in, and gives the creator kudos!", {
                Disqus: "Disqus"
            }))) : a.createElement("div", null, a.createElement("h2", {
                className: "coachmark__heading"
            }, e("Discussion Favorited!")), a.createElement("p", {
                className: "coachmark__description"
            }, e("Favoriting means this is a discussion worth sharing. It gets shared to your followers' %(Disqus)s feeds, and gives the creator kudos!", {
                Disqus: "Disqus"
            }))), " ", a.createElement("a", {
                href: (b.root || "") + "/home/?utm_source=disqus_embed&utm_content=recommend_btn",
                className: "btn btn-primary coachmark__button",
                target: "_blank",
                rel: "noopener noreferrer"
            }, e(c.loggedIn ? "See Your Feed" : "Find More Discussions")))))
        };
    return f
}), define("lounge/views/favorite-button", ["backbone", "core/utils/storage", "templates/lounge/threadVotes"], function(a, b, c) {
    "use strict";
    var d = a.View.extend({
        className: "thread-likes",
        events: {
            "click [data-action=favorite]": "favoriteHandler"
        },
        initialize: function(a) {
            this.session = a.session, this.thread = a.thread, this.loggedOutFavoriteFlag = this.session.getLoggedOutUserFlags().get(d.ONBOARDING_KEY), this.listenTo(this.thread, "change:userScore", this.render), this.listenTo(this.thread, "change:likes", this.render), this.listenTo(this.session, "change:id", this.startFavoriteOnboarding), this.setTooltipEnabled()
        },
        setTooltipEnabled: function() {
            this.tooltipEnabled = this.session.isLoggedIn() ? b.get(d.ONBOARDING_KEY) : !this.loggedOutFavoriteFlag.isRead()
        },
        render: function() {
            return this.$el.html(c({
                thread: this.thread.toJSON(),
                user: this.session.toJSON(),
                loggedIn: this.session.isLoggedIn()
            })), this
        },
        startFavoriteOnboarding: function() {
            this.session.user.get("joinedRecently") && b.set(d.ONBOARDING_KEY, "true"), this.setTooltipEnabled()
        },
        favoriteHandler: function(a) {
            a.stopPropagation(), a.preventDefault();
            var b = 0 === this.thread.get("userScore");
            this.trigger(b ? "vote:like" : "vote:unlike"), this.thread.vote(b ? 1 : 0), this.toggleTooltip(b), this.tooltipEnabled && b && this.markAsSeen()
        },
        markAsSeen: function() {
            this.session.isLoggedIn() ? b.remove(d.ONBOARDING_KEY) : this.loggedOutFavoriteFlag.markRead()
        },
        toggleTooltip: function(a) {
            this.tooltipEnabled && (a ? this.$el.parent().addClass("open") : this.$el.parent().removeClass("open"))
        }
    }, {
        ONBOARDING_KEY: "showRecommendOnboarding"
    });
    return d
}), define("common/collections/LoggedOutCache", ["backbone", "core/common/cached-storage", "lounge/views/favorite-button"], function(a, b, c) {
    "use strict";
    var d = [{
            id: "welcome",
            title: "",
            body: ""
        }],
        e = [{
            id: c.ONBOARDING_KEY
        }],
        f = new b("notes", 7776e3),
        g = a.Model.extend({
            markRead: function() {
                f.setItem(this.id, !0)
            },
            isRead: function() {
                return Boolean(f.getItem(this.id))
            }
        }),
        h = a.Collection.extend({
            initialize: function(a, b) {
                this.session = b.session
            },
            model: g,
            markAllRead: function() {
                return this.each(function(a) {
                    a.markRead()
                }), this.session.set("notificationCount", 0), this
            },
            getUnread: function() {
                return this.filter(function(a) {
                    return !a.isRead()
                })
            }
        });
    return {
        storage: f,
        Collection: h,
        Model: g,
        LOGGED_OUT_NOTES: d,
        LOGGED_OUT_FLAGS: e
    }
}), define("common/Session", ["jquery", "underscore", "core/analytics/jester", "core/api", "core/bus", "core/config", "common/models", "common/urls", "core/models/Session", "core/UniqueModel", "core/utils/cookies", "core/utils/url/serialize", "core/WindowBus", "common/collections/LoggedOutCache", "common/keys", "common/utils", "lounge/common", "lounge/tracking"], function(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r) {
    "use strict";
    var s, t = 3500,
        u = {},
        v = new m,
        w = i.extend({
            _defaults: {
                canReply: !0,
                canModerate: !1,
                audienceSyncVerified: !1,
                sso: null
            },
            socialLoginProviders: {
                facebook: function() {
                    var b = a.Deferred();
                    return require(["fb"], b.resolve.bind(b), b.reject.bind(b)), b.promise().then(function() {
                        window.FB.init({
                            appId: o.facebook,
                            xfbml: !1,
                            status: !0,
                            version: "v2.8"
                        });
                        var b = a.Deferred();
                        return window.FB.getLoginStatus(function(a) {
                            "connected" === a.status ? b.resolve(a) : b.reject()
                        }), b.promise()
                    }).then(function(a) {
                        c.logStat("lounge.auto_login.fb");
                        var b = a.authResponse;
                        return {
                            grant_type: "urn:disqus:params:oauth:grant-type:facebook-login",
                            client_id: o.embedAPI,
                            expires: b.expiresIn,
                            fb_access_token: b.accessToken
                        }
                    })
                },
                google: function() {
                    var b = a.Deferred();
                    return require(["gapi"], function(a) {
                        setTimeout(b.reject.bind(b), t), a.load("auth2", b.resolve.bind(b, a))
                    }, b.reject.bind(b)), b.promise().then(function(b) {
                        var c = b.auth2.init({
                                client_id: o.google,
                                fetch_basic_profile: !1,
                                scope: "profile email"
                            }),
                            d = a.Deferred();
                        return c.then(function() {
                            c.isSignedIn.get() ? d.resolve(c.currentUser.get()) : d.reject()
                        }), d.promise()
                    }).then(function(a) {
                        c.logStat("lounge.auto_login.google");
                        var b = a.getAuthResponse();
                        return {
                            grant_type: "urn:disqus:params:oauth:grant-type:google-login",
                            client_id: o.embedAPI,
                            expires: b.expires_in,
                            google_access_token: JSON.stringify(b)
                        }
                    })
                }
            },
            defaults: function() {
                var a = new n.Collection(n.LOGGED_OUT_NOTES, {
                    session: this
                });
                return b.extend(this._defaults, {
                    notificationCount: a.getUnread().length
                })
            },
            start: function(b) {
                var c = b || {};
                if (this.set(c), this.listenTo(v, "auth:success", this.fetch), this.listenTo(e.frame, {
                        "!auth:success": function(a) {
                            a && (a.sessionId && d.headers({
                                "X-Sessionid": a.sessionId
                            }), a.message && this.trigger("alert", a.message, {
                                type: "info"
                            }), a.logEvent && e.trigger("uiAction:" + a.logEvent)), v.broadcast("auth:success"), this.fetch()
                        }
                    }), this.bindAudienceSyncHandlers(), this.shouldFetchSession()) this.fetch();
                else if (k.read("no_auto_login") || r.isPrivate()) this.loginAsAnon();
                else {
                    var f = this.socialLoginProviders,
                        g = !1,
                        h = 0,
                        i = a.Deferred(),
                        j = Object.keys(f).map(function(a) {
                            return f[a].call(this)
                        }, this),
                        l = function(a) {
                            g || (g = !0, i.resolve(a))
                        },
                        m = function(a) {
                            h += 1, h === j.length && i.reject(a)
                        };
                    j.forEach(function(a) {
                        a.then(l).fail(m)
                    }), i.promise().then(function(b) {
                        return a.post("https://disqus.com/api/oauth/2.0/access_token/", b)
                    }).then(function(a) {
                        this.fetch({
                            data: {
                                access_token: a.access_token
                            }
                        })
                    }.bind(this)).fail(this.loginAsAnon.bind(this))
                }
            },
            stop: function() {
                this.stopListening(), this.off()
            },
            loginAsAnon: function() {
                this.setUser(this.getAnonUserInstance())
            },
            shouldFetchSession: function() {
                return Boolean(this.get("remoteAuthS3") || u.fromCookie().id)
            },
            getUserInstance: function(a) {
                return new j(g.User, a)
            },
            toJSON: function() {
                var a = this.user.toJSON.apply(this.user, arguments);
                return a.thread.canReply = this.get("canReply"), a.thread.canModerate || (a.thread.canModerate = this.get("canModerate")), a
            },
            fetch: function(a) {
                var b = this,
                    c = a || {};
                b.has("thread") && (c.thread = b.get("thread"));
                var d = c.thread ? b.fetchThreadDetails(c) : i.prototype.fetch.call(b, c);
                return d.done(function() {
                    b.set("notificationCount", 0)
                }), d
            },
            fetchNotificationCount: function() {
                var b = this;
                return b.isLoggedIn() ? d.call("timelines/getUnreadCount.json", {
                    data: {
                        type: "notifications",
                        routingVersion: f.feedApiVersion
                    }
                }).done(function(a) {
                    b.set("notificationCount", a.response)
                }) : a.Deferred().resolve()
            },
            fetchThreadDetails: function(a) {
                var c = this,
                    e = a.thread;
                c._request && (c._request.abort(), c._request = null);
                var f = {
                    thread: e.id,
                    post: e.posts.pluck("id")
                };
                return c._request = d.call("embed/threadDetails.json", {
                    data: f,
                    success: function(a) {
                        var d = a.response,
                            f = {};
                        d.user && (b.extend(f, d.user, {
                            votes: d.votes
                        }), f = b.omit(f, "badges")), c.set(d.session), f.id ? (c.setUser(new j(g.User, f)), e.users.add(c.user), d.thread && (e.set("userScore", d.thread.userScore), e.set("userSubscription", d.thread.userSubscription), e.set("userRating", d.thread.userRating))) : c.loginAsAnon(), d.blockedUsers && b.each(d.blockedUsers, function(a) {
                            new j(g.User, {
                                id: a
                            }).set({
                                isBlocked: !0
                            })
                        }), c.trigger("fetchThreadDetails:success")
                    },
                    complete: function() {
                        c._request = null
                    }
                }), c._request
            },
            logout: function() {
                var a = this.get("sso");
                this.isSSO() && a && a.logout ? e.frame.sendHostMessage("navigate", a.logout) : this.locationReplace(l(h.logout, {
                    redirect: window.location.href
                }))
            },
            locationReplace: function(a) {
                window.location.replace(a)
            },
            isSSO: function() {
                return this.user && "sso" === this.user.get("user_type")
            },
            getAuthWindowArgs: function(a) {
                var c = i.prototype.getAuthWindowArgs.call(this, a),
                    d = q.getLounge().config;
                if (a.attachExperiment && d && d.experiment) {
                    var e = d.experiment;
                    c.evs = window.btoa([e.experiment, e.variant, e.service].join(":"))
                }
                return b.defaults({
                    forum: this.get("thread") && this.get("thread").forum.id
                }, c)
            },
            openAuthWindow: function(a, b, c) {
                try {
                    var d = this.get("thread"),
                        e = d && d.currentUrl;
                    window.sessionStorage && e && window.sessionStorage.setItem("discussionUrl", e)
                } catch (f) {}
                return i.prototype.openAuthWindow.call(this, a, b, c)
            },
            authServices: b.defaults({
                disqusDotcom: {
                    url: h.dotcomLogin,
                    width: 478,
                    height: 590,
                    params: {
                        next: h.login
                    },
                    attachExperiment: !0
                },
                sso: function x() {
                    var x = this.get("sso"),
                        a = parseInt(x.width || "800", 10),
                        c = parseInt(x.height || "500", 10),
                        d = this.openAuthWindow(x.url, a, c);
                    ! function f() {
                        p.isWindowClosed(d) ? e.frame.sendHostMessage("reload") : b.delay(f, 500)
                    }()
                }
            }, i.prototype.authServices),
            bindAudienceSyncHandlers: function() {
                this.listenTo(this, "change:id change:audienceSyncVerified", function() {
                    this.get("audienceSyncVerified") && e.frame.sendHostMessage("session.identify", this.user.id)
                }), this.listenTo(e.frame, {
                    "!audiencesync:grant": function() {
                        this.set("audienceSyncVerified", !0)
                    }
                })
            },
            getAudienceSyncUrl: function() {
                var a = {
                    client_id: this.get("apiKey"),
                    response_type: "audiencesync",
                    forum_id: this.get("thread").forum.id
                };
                return "https:" === window.location.protocol && (a.ssl = 1), l(h.authorize, a)
            },
            audienceSync: function() {
                this.openAuthWindow(this.getAudienceSyncUrl(), 460, 355)
            },
            needsAudienceSyncAuth: function(a) {
                return a.get("settings").audienceSyncEnabled && this.isLoggedIn() && !this.get("audienceSyncVerified")
            },
            getLoggedOutUserFlags: function() {
                return this._loggedOutUserFlags ? this._loggedOutUserFlags : (this._loggedOutUserFlags = new n.Collection(n.LOGGED_OUT_FLAGS, {
                    session: this
                }), this._loggedOutUserFlags)
            }
        });
    return b.extend(u, b.chain(w).keys().map(function(a) {
        return [a, w[a]]
    }).object().value(), {
        get: function() {
            return s = s || new w
        },
        setDefaults: function(a) {
            if (s) throw new Error("Session defaults cannot be changed after a session instance is created!");
            return w._defaults = b.extend(w.prototype._defaults, a), w._defaults
        },
        forget: function() {
            s && (s.stop(), s = null)
        }
    }), u
}), define("common/views/mixins", ["jquery", "underscore", "core/bus", "common/Session"], function(a, b, c, d) {
    "use strict";
    var e = {
            proxyViewEvents: function(a) {
                this.listenTo(a, "all", function(a) {
                    0 === a.indexOf("uiAction:") && this.trigger.apply(this, arguments)
                }, this)
            }
        },
        f = {
            updateUserAvatarHelper: function(b, c) {
                a("img[data-user=" + b + '][data-role="user-avatar"]').attr("src", c)
            },
            updateUserNameHelper: function(c, d) {
                var e = '[data-username="' + c + '"][data-role=username]';
                a("a" + e + ", span" + e).html(b.escape(d))
            },
            bindProfileUIListeners: function(a) {
                this.listenTo(a, {
                    "change:avatar": function() {
                        this.updateUserAvatarHelper(a.user.id, a.user.get("avatar").cache)
                    },
                    "change:name": function() {
                        this.updateUserNameHelper(a.user.get("username"), a.user.get("name"))
                    }
                })
            }
        },
        g = {
            toggleFollow: function(b) {
                b.preventDefault(), b.stopPropagation();
                var c = b && a(b.target).closest("a[data-user]").attr("data-user"),
                    e = this.collection && c ? this.collection.get(c) : this.user,
                    f = d.get();
                return f.isLoggedOut() ? (this.trigger("authenticating"), this.listenToOnce(f, "change:id", function() {
                    f.isLoggedIn() && this.follow(e)
                }), f.get("sso") && f.get("sso").url ? void f.authenticate("sso") : void f.authenticate("disqusDotcom")) : void(e.get("isFollowing") ? this.unfollow(e) : this.follow(e))
            },
            unfollow: function(a) {
                a.unfollow(), c.trigger("uiAction:unfollowUser", a)
            },
            follow: function(a) {
                a.follow(), c.trigger("uiAction:followUser", a)
            }
        };
    return {
        FollowButtonMixin: g,
        UiActionEventProxy: e,
        ProfileHtmlHelpers: f
    }
}), define("core/utils/isIframed", [], function() {
    "use strict";
    return function(a) {
        try {
            return a.self !== a.top
        } catch (b) {
            return !0
        }
    }
}), define("core/viglink", ["remote/config"], function(a) {
    "use strict";
    var b = {},
        c = null;
    return b.resetVersion = function() {
        c = null
    }, b.forceVersion = function(a) {
        c = a
    }, b.getVersion = function() {
        return c ? c : a.lounge && a.lounge.viglink && a.lounge.viglink.version || "none"
    }, b.getExperimentVersion = function() {
        return a.lounge && a.lounge.viglink && a.lounge.viglink.experiment_version || "none"
    }, b
}), define("common/outboundlinkhandler", ["jquery", "underscore", "core/utils", "common/utils"], function(a, b, c, d) {
    "use strict";

    function e() {
        this.handlers = [], this.locked = {}, this.timeout = 1e3
    }
    return b.extend(e.prototype, {
        handleClick: function(d) {
            var e = a(d.currentTarget),
                f = this.getLinkTrackingId(e);
            if (this.shouldHandleClick(d, e, f)) {
                var g = b.chain(this.handlers).map(function(a) {
                    return a[0].call(a[1], d, e)
                }).compact().value();
                c.willOpenNewWindow(d, e) || (d.preventDefault(), this.setLatestClick(f), this.delayNavigation(d, e, g))
            }
        },
        delayNavigation: function(c, e, f) {
            this.lockLink(this.getLinkTrackingId(e));
            var g = b.bind(function() {
                this.isLatestClick(this.getLinkTrackingId(e)) && d.triggerClick(e, c.originalEvent)
            }, this);
            b.delay(g, this.timeout), a.when.apply(a, f).always(g)
        },
        registerBeforeNavigationHandler: function(a, b) {
            this.handlers.push([a, b])
        },
        getLinkTrackingId: function(a) {
            var c = a.attr("data-tid");
            return c || (c = b.uniqueId(), a.attr("data-tid", c)), c
        },
        shouldHandleClick: function(a, b) {
            if (!this.isLinkLocked(this.getLinkTrackingId(b))) {
                if (a.isDefaultPrevented()) return !1;
                if (!b.is("a")) return !1;
                var c = /#.*/,
                    d = (b.attr("href") || "").replace(c, "");
                return !!d
            }
        },
        setLatestClick: function(a) {
            this.latestLinkId = a
        },
        isLatestClick: function(a) {
            return this.latestLinkId === a
        },
        lockLink: function(a) {
            this.locked[a] = !0
        },
        isLinkLocked: function(a) {
            return this.locked[a]
        }
    }), e
}), define("core/mixins/withEmailVerifyLink", ["jquery", "underscore", "core/config", "core/utils"], function(a, b, c, d) {
    "use strict";
    var e = d.preventDefaultHandler,
        f = {
            events: {
                "click [data-action=verify-email]": "showVerifyEmailPopup"
            },
            showVerifyEmailPopup: e(function(b) {
                var e = a(b.target).attr("data-forum"),
                    f = c.urls.verifyEmail;
                return e && (f = f + "?f=" + e), d.openWindow(f, "_blank", {
                    width: 460,
                    height: 355
                })
            })
        };
    return function() {
        this.events = b.defaults({}, this.events, f.events), b.extend(this, b.pick(f, "showVerifyEmailPopup"))
    }
}), define("core/constants/behindClickConstants", ["exports", "core/strings"], function(a, b) {
    "use strict";
    var c = b.get;
    a.DEFAULT_BUTTON_TEXT = b.interpolate(c("Show Comments (%(count)s)"), {
        count: "{postCount}"
    })
}), define("core/templates/react/BehindClickTemplate", ["react", "core/constants/behindClickConstants"], function(a, b) {
    "use strict";

    function c(a) {
        if (!a || a.indexOf(":") === -1) return {};
        var b = {},
            c = a.split(";");
        return c.forEach(function(a) {
            var c = a.split(":").map(function(a) {
                return a.trim()
            });
            if (c[0].indexOf("-") > 0) {
                var d = c[0].split("-");
                c[0] = d[0] + d[1].charAt(0).toUpperCase() + d[1].slice(1)
            }
            b[c.splice(0, 1)[0]] = c.join(":")
        }), b
    }

    function d(a, b) {
        return a ? a.replace("{postCount}", b.toLocaleString()) : a
    }
    var e = function(e) {
        var f = e.postCount,
            g = e.buttonText,
            h = e.buttonCSS,
            i = e.titleEnabled,
            j = e.titleText,
            k = e.titleCSS;
        return a.createElement("div", {
            id: "behind-click__container"
        }, i ? a.createElement("h3", {
            id: "behind-click__title",
            style: c(k)
        }, d(j, f)) : null, a.createElement("button", {
            id: "thread-visibility__button",
            className: "btn alert",
            "data-action": "toggle-thread-visibility",
            style: c(h)
        }, g ? d(g, f) : d(b.DEFAULT_BUTTON_TEXT, f)))
    };
    return e
}), define("templates/lounge/partials/badgesMessage", ["react", "core/strings", "core/bus"], function(a, b, c) {
    "use strict";
    var d = b.gettext,
        e = function(b) {
            var e = b.url;
            return a.createElement("a", {
                href: e,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "policy-link publisher-anchor-color",
                onClick: function(a) {
                    a.stopPropagation(), c.trigger("uiAction:clickBadgesMessage", e)
                }
            }, d("See the available badges"))
        },
        f = function(b) {
            var c = b.forum,
                f = b.forumBadgesLink;
            return a.createElement("div", {
                id: "badges-message",
                className: "badges-message comment-policy publisher-anchor-color"
            }, a.createElement("span", {
                "data-action": "close-badges-message",
                className: "badges-message-close",
                tabIndex: "0"
            }), a.createElement("div", {
                className: "content"
            }, a.createElement("p", {
                className: "comment-policy-title text-bold"
            }, d("Earn badges on %(forumName)s!", {
                forumName: c.name
            })), a.createElement("p", {
                className: "comment-policy-text"
            }, d("Badges are awarded for commenting, receiving upvotes, and other conditions established by the publisher. Awarded badges will be displayed next to your name in comments on this site as well as on your profile."), a.createElement("p", {
                className: "comment-policy-link"
            }, a.createElement(e, {
                url: f
            })))), a.createElement("span", {
                "aria-hidden": "true",
                className: "badges-message-icon"
            }))
        };
    return f
}), define("templates/lounge/partials/commentPolicy", ["react", "core/strings", "core/bus"], function(a, b, c) {
    "use strict";
    var d = b.gettext,
        e = function(b) {
            var d = b.url,
                e = b.className,
                f = void 0 === e ? "" : e,
                g = b.children;
            return a.createElement("a", {
                href: d,
                target: "_blank",
                rel: "noopener noreferrer",
                className: f + " policy-link",
                onClick: function(a) {
                    a.stopPropagation(), c.trigger("uiAction:clickCommentPolicy", d)
                }
            }, g)
        },
        f = function(b) {
            var c = b.forum;
            if (!c.commentPolicyLink) return null;
            var f = d("Please read our %(commentPolicyLink)s before commenting.", {
                commentPolicyLink: a.createElement(e, {
                    url: c.commentPolicyLink
                }, d("Comment Policy"))
            });
            return f
        },
        g = function(b) {
            var c = b.forum;
            return c.commentPolicyText || c.commentPolicyLink ? a.createElement("div", {
                id: "comment-policy",
                className: "comment-policy publisher-anchor-color"
            }, a.createElement("div", {
                className: "content"
            }, a.createElement("p", {
                className: "comment-policy-title text-bold"
            }, d("%(forumName)s Comment Policy", {
                forumName: c.name
            })), a.createElement("p", {
                className: "comment-policy-text"
            }, c.commentPolicyText ? c.commentPolicyText : null, a.createElement("p", {
                className: "comment-policy-link"
            }, a.createElement(f, {
                forum: c
            })))), a.createElement("span", {
                "aria-hidden": "true",
                className: "icon icon-chat-bubble"
            })) : null
        };
    return g
}), define("templates/lounge/partials/postCount", ["react", "core/strings"], function(a, b) {
    "use strict";
    var c = b.gettext,
        d = function(b) {
            return a.createElement("a", {
                className: "publisher-nav-color"
            }, a.createElement("span", {
                className: "comment-count"
            }, 1 === b.count ? c("1 comment") : c("%(numPosts)s comments", {
                numPosts: b.count
            })), a.createElement("span", {
                className: "comment-count-placeholder"
            }, c("Comments")))
        };
    return d
}), define("templates/lounge/partials/topNavigation", ["react", "core/strings", "core/switches", "core/utils/object/get", "templates/lounge/partials/postCount"], function(a, b, c, d, e) {
    "use strict";
    var f = b.gettext,
        g = function(b) {
            return a.createElement("nav", {
                className: "nav nav-primary"
            }, a.createElement("ul", null, a.createElement("li", {
                className: "nav-tab nav-tab--primary tab-conversation active",
                "data-role": "post-count"
            }, b.inHome ? null : a.createElement(e, {
                count: d(b.thread, ["posts", "count"], null)
            })), b.inHome || c.isFeatureActive("sso_less_branding", {
                forum: b.forum.id
            }) ? null : a.createElement("li", {
                className: "nav-tab nav-tab--primary tab-general"
            }, a.createElement("a", {
                href: d(b.forum, ["homeUrl"], ""),
                className: "publisher-nav-color",
                "data-action": "community-sidebar",
                "data-forum": d(b.forum, ["id"], ""),
                id: "community-tab",
                name: d(b.forum, ["name"], null)
            }, a.createElement("span", {
                className: "community-name"
            }, a.createElement("strong", null, d(b.forum, ["name"], null))), a.createElement("strong", {
                className: "community-name-placeholder"
            }, f("Community")))), c.isFeatureActive("removePrivacyPolicy", {
                forum: b.forum.id
            }) ? "" : a.createElement("li", {
                className: "nav-tab nav-tab--primary tab-general"
            }, a.createElement("a", {
                href: "https://help.disqus.com/customer/portal/articles/466259-privacy-policy",
                rel: "nofollow noopener noreferrer",
                target: "_blank",
                className: "publisher-nav-color privacy-policy",
                title: "Disqus' Privacy Policy"
            }, a.createElement("i", {
                "aria-hidden": "true",
                className: "icon icon-lock"
            }), a.createElement("span", {
                className: "clip privacy-policy-full hidden-md"
            }, " ", f("Disqus' Privacy Policy")), a.createElement("span", {
                className: "clip privacy-policy-short"
            }, " ", f("Privacy Policy")))), a.createElement("li", {
                className: "nav-tab nav-tab--primary tab-user"
            }, a.createElement("ul", null, a.createElement("li", {
                className: "nav-tab nav-tab--primary notification-menu",
                "data-role": "notification-menu"
            }), a.createElement("li", {
                className: "nav-tab nav-tab--primary dropdown user-menu",
                "data-role": "logout"
            })))))
        };
    return g
}), define("templates/lounge/partials/postSort", ["react", "core/strings"], function(a, b) {
    "use strict";
    var c = b.gettext,
        d = function(b) {
            var d = b.votingDisabled && "popular" === b.order ? "desc" : b.order;
            return a.createElement("li", {
                "data-role": "post-sort",
                className: "nav-tab nav-tab--secondary dropdown sorting pull-right"
            }, a.createElement("a", {
                href: "#",
                className: "dropdown-toggle",
                "data-toggle": "dropdown"
            }, "popular" === d ? c("Sort by Best") : null, "desc" === d ? c("Sort by Newest") : null, "asc" === d ? c("Sort by Oldest") : null, a.createElement("span", {
                className: "caret"
            })), a.createElement("ul", {
                className: "dropdown-menu pull-right"
            }, a.createElement("li", {
                className: "popular" === d ? "selected" : ""
            }, b.votingDisabled ? null : a.createElement("a", {
                href: "#",
                "data-action": "sort",
                "data-sort": "popular"
            }, c("Best"), a.createElement("i", {
                "aria-hidden": "true",
                className: "icon-checkmark"
            }))), a.createElement("li", {
                className: "desc" === d ? "selected" : ""
            }, a.createElement("a", {
                href: "#",
                "data-action": "sort",
                "data-sort": "desc"
            }, c("Newest"), a.createElement("i", {
                "aria-hidden": "true",
                className: "icon-checkmark"
            }))), a.createElement("li", {
                className: "asc" === d ? "selected" : ""
            }, a.createElement("a", {
                href: "#",
                "data-action": "sort",
                "data-sort": "asc"
            }, c("Oldest"), a.createElement("i", {
                "aria-hidden": "true",
                className: "icon-checkmark"
            })))))
        };
    return d
}), define("templates/lounge/partials/secondaryNavigation", ["react", "templates/lounge/partials/postSort"], function(a, b) {
    "use strict";
    var c = function(c) {
        return a.createElement("div", {
            className: "nav nav-secondary",
            "data-tracking-area": "secondary-nav"
        }, a.createElement("ul", null, a.createElement("li", {
            id: "favorite-button",
            className: "nav-tab nav-tab--secondary favorite dropdown"
        }), a.createElement("li", {
            id: "thread-share-bar",
            className: "nav-tab nav-tab--secondary share-bar hidden-sm"
        }), c.inHome ? null : a.createElement(b, {
            order: c.order,
            votingDisabled: c.votingDisabled
        })))
    };
    return c
}), define("core/templates/react/ThreadTemplate", ["react", "core/constants/voteConstants", "core/strings", "core/switches", "core/utils/object/get", "templates/lounge/partials/badgesMessage", "templates/lounge/partials/commentPolicy", "templates/lounge/partials/topNavigation", "templates/lounge/partials/secondaryNavigation"], function(a, b, c, d, e, f, g, h, i) {
    "use strict";
    var j = c.gettext,
        k = function(c) {
            return a.createElement("div", {
                id: "thread__wrapper"
            }, a.createElement("div", {
                id: "placement-top",
                "data-tracking-area": "discovery-north"
            }), a.createElement("div", {
                id: "onboard",
                "data-tracking-area": "onboard"
            }), a.createElement("div", {
                id: "reactions__container"
            }), a.createElement("div", {
                id: "ratings__container"
            }), a.createElement(g, {
                forum: c.forum
            }), a.createElement("div", {
                id: "badges-message__container"
            }), a.createElement("div", {
                id: "highlighted-post",
                "data-tracking-area": "highlighted",
                className: "highlighted-post"
            }), a.createElement("div", {
                id: "global-alert"
            }), a.createElement("div", {
                id: "tos__container"
            }), c.inHome ? null : a.createElement("header", {
                id: "main-nav",
                "data-tracking-area": "main-nav"
            }, a.createElement(h, {
                inHome: c.inHome,
                forum: c.forum,
                thread: c.thread
            })), a.createElement("section", {
                id: "conversation",
                "data-role": "main",
                "data-tracking-area": "main"
            }, a.createElement(i, {
                inHome: c.inHome,
                order: c.order,
                votingDisabled: e(c.forum, ["votingType"], b.VOTING_TYPES.DEFAULT_VOTING_TYPE) === b.VOTING_TYPES.DISABLED
            }), a.createElement("div", {
                id: "posts"
            }, a.createElement("div", {
                id: "form",
                className: "textarea-outer-wrapper--top-level"
            }), a.createElement("button", {
                className: "alert alert--realtime",
                style: {
                    display: "none"
                },
                "data-role": "realtime-notification"
            }), a.createElement("div", {
                id: "email-signup"
            }), a.createElement("div", {
                id: "no-posts",
                style: {
                    display: "none"
                }
            }), a.createElement("ul", {
                id: "post-list",
                className: "post-list loading"
            }), a.createElement("div", {
                className: "load-more",
                "data-role": "more",
                style: {
                    display: "none"
                }
            }, a.createElement("a", {
                href: "#",
                "data-action": "more-posts",
                className: "btn load-more__button"
            }, j("Load more comments"))))), a.createElement("div", {
                id: "placement-bottom",
                "data-tracking-area": "discovery-south"
            }), c.hideFooter ? null : a.createElement("footer", {
                id: "footer",
                "data-tracking-area": "footer",
                className: "disqus-footer__wrapper"
            }, a.createElement("div", {
                className: "disqus-footer"
            }, a.createElement("ul", {
                className: "disqus-footer__list"
            }, d.isFeatureActive("sso_less_branding", {
                forum: c.forum.id
            }) ? null : a.createElement("li", {
                id: "thread-subscribe-button",
                className: "email disqus-footer__item"
            }, a.createElement("div", {
                className: "default"
            }, a.createElement("a", {
                href: "#",
                rel: "nofollow",
                "data-action": "subscribe",
                title: j("Subscribe and get email updates from this discussion"),
                className: "disqus-footer__link"
            }, a.createElement("i", {
                "aria-hidden": "true",
                className: "icon icon-mail"
            }), a.createElement("span", {
                className: "clip"
            }, j("Subscribe")), a.createElement("i", {
                "aria-hidden": "true",
                className: "icon icon-checkmark"
            })))), e(c.forum, ["disableDisqusBranding"], null) ? null : a.createElement("li", {
                className: "install disqus-footer__item"
            }, a.createElement("a", {
                href: "https://publishers.disqus.com/engage?utm_source=" + e(c.forum, ["id"], "") + "&utm_medium=Disqus-Footer",
                rel: "nofollow noopener noreferrer",
                target: "_blank",
                className: "disqus-footer__link"
            }, a.createElement("i", {
                "aria-hidden": "true",
                className: "icon icon-disqus"
            }), a.createElement("span", {
                className: "clip hidden-md"
            }, j("Add Disqus to your site")), a.createElement("span", {
                className: "clip visible-md hidden-xs"
            }, j("Add Disqus")), a.createElement("span", {
                className: "clip visible-xs"
            }, j("Add")))), d.isFeatureActive("removePrivacyPolicy", {
                forum: c.forum.id
            }) ? "" : a.createElement("li", {
                className: "do-not-sell disqus-footer__item"
            }, a.createElement("a", {
                href: "https://disqus.com/data-sharing-settings/",
                rel: "nofollow noopener noreferrer",
                target: "_blank",
                className: "disqus-footer__link"
            }, a.createElement("i", {
                "aria-hidden": "true",
                className: "icon icon-warning"
            }), a.createElement("span", {
                className: "clip"
            }, j("Do Not Sell My Data"))))), e(c.forum, ["disableDisqusBranding"], null) ? null : a.createElement("span", {
                className: "disqus-footer__logo"
            }, a.createElement("a", {
                href: "https://disqus.com",
                rel: "nofollow",
                title: j("Powered by Disqus"),
                className: "disqus-footer__link"
            }, j("Powered by Disqus"))))))
        };
    return k
}), define("lounge/menu-handler", ["jquery", "core/bus"], function(a, b) {
    "use strict";
    return {
        init: function(c) {
            function d() {
                a(".dropdown").removeClass("open")
            }
            a("html").on("click", d), a("body").delegate("[data-toggle]", "click", function(b) {
                b.stopPropagation(), b.preventDefault();
                var e = a(b.currentTarget),
                    f = e.closest("." + e.attr("data-toggle")),
                    g = "disabled" !== f.attr("data-dropdown") && !f.hasClass("open");
                if (f.attr("data-dropdown", "enabled"), d(), g) {
                    f.addClass("open");
                    var h = f.data("view-id");
                    h && c.trigger("opened:" + h, f)
                }
            }), b.frame.on("window.click", d)
        }
    }
}), define("lounge/mixins", ["core/utils/url/serialize"], function(a) {
    "use strict";
    var b = {
            _sharePopup: function(a, b) {
                return window.open(a, "_blank", b || "width=550,height=520")
            },
            share: function(a) {
                this.sharers[a].call(this)
            },
            sharers: {
                twitter: function() {
                    var b = "https://twitter.com/intent/tweet",
                        c = this.model.shortLink();
                    this._sharePopup(a(b, {
                        url: c,
                        text: this.model.twitterText(c)
                    }))
                },
                facebook: function() {
                    this._sharePopup(a("https://www.facebook.com/sharer.php", {
                        u: this.model.shortLink()
                    }), "width=655,height=352")
                }
            }
        },
        c = function() {
            function a() {
                return this.collapseTarget && this.collapseTarget.length || (this.collapseTarget = this.collapseTargetSelector ? this[this.collapseScope].find(this.collapseTargetSelector) : this[this.collapseScope]), this.collapseTarget
            }

            function b() {
                var b = this;
                if (b.isCollapseAllowed) {
                    var c = a.call(b);
                    c && c.length && (c.height(b.collapsedHeight), e.call(b))
                }
            }

            function c(a) {
                var b = this;
                if (b.collapseTarget && b.collapseTarget.length) {
                    var c = b.collapseTarget;
                    c.css("height", "auto"), c.css("maxHeight", "none"), f.call(b), a || (b.isCollapseAllowed = !1)
                }
            }

            function d() {
                return this.seeMoreButton && this.seeMoreButton.length || (this.seeMoreButton = a.call(this).siblings("[data-action=see-more]")), this.seeMoreButton
            }

            function e() {
                var a = this;
                d.call(this).removeClass("hidden").on("click", function() {
                    a.expand()
                })
            }

            function f() {
                d.call(this).addClass("hidden").off("click")
            }
            return function(a) {
                var d = this;
                d.isCollapseAllowed = !0, d.collapsedHeight = a.collapsedHeight, d.collapseTargetSelector = a.collapseTargetSelector, d.collapseScope = a.collapseScope || "$el", d.collapse = b, d.expand = c
            }
        }();
    return {
        ShareMixin: b,
        asCollapsible: c
    }
}), define("lounge/realtime", ["underscore", "backbone", "loglevel", "remote/config", "common/urls", "core/utils/url/serialize", "common/utils"], function(a, b, c, d, e, f, g) {
    "use strict";

    function h() {
        s.apply(this, arguments), this.marker = 0, this.interval = m, this._boundOnError = a.bind(this.onError, this), this._boundOnLoad = a.bind(this.onLoad, this), this._boundOnProgress = a.bind(this.onProgress, this)
    }

    function i() {
        s.apply(this, arguments), this.handshakeSuccess = null, this.interval = m, this.handshakeFails = 0, this._boundOnOpen = a.bind(this.onOpen, this), this._boundError = a.bind(this.onError, this), this._boundClose = a.bind(this.onClose, this), this._boundMessage = a.compose(a.bind(this.onMessage, this), function(a) {
            return JSON.parse(a.data)
        })
    }
    var j = d.lounge.REALTIME || {},
        k = j.EXP_BASE || 2,
        l = j.BACKOFF_LIMIT || 300,
        m = j.BACKOFF_INTERVAL || 1,
        n = j.MAX_HANDSHAKE_FAILS || 1,
        o = j.WEBSOCKETS_ENABLED !== !1 && window.WebSocket && 2 === window.WebSocket.CLOSING,
        p = j.XHR_ENABLED !== !1,
        q = function() {},
        r = function() {
            throw new Error("Pipe class cannot be used directly.")
        },
        s = function(b) {
            this.channel = b, this.connection = null, this.paused = !1, this._msgBuffer = [], this._boundOpen = a.bind(this.open, this)
        };
    a.extend(s.prototype, b.Events, {
        getUrl: function(b) {
            var c = {};
            return a.extend(c, b), f(this.baseUrl + this.channel, c)
        },
        onMessage: function(a) {
            var b = a.message_type,
                d = a.firehose_id;
            this.lastEventId = d, c.debug("RT: new message:", b, d);
            var e = {
                type: b,
                data: a.message_body,
                lastEventId: d
            };
            this.trigger(b, e)
        },
        _msgToBuffer: function() {
            this._msgBuffer.push(a.toArray(arguments))
        },
        pause: function(a) {
            this.paused || (this.paused = !0, this._trigger = this.trigger, this.trigger = a === !1 ? q : this._msgToBuffer, c.debug("RT: paused, buffered: %s", a !== !1))
        },
        resume: function() {
            if (this.paused) {
                this.paused = !1, this.trigger = this._trigger, c.debug("RT: resumed, buffered messages: %s", this._msgBuffer.length);
                for (var a; a = this._msgBuffer.shift();) this.trigger.apply(this, a)
            }
        },
        open: r,
        close: function() {
            var a = this.connection;
            return !!a && (this.connection = null, a)
        }
    }), a.extend(h.prototype, s.prototype, {
        baseUrl: e.realertime + "/api/2/",
        onError: function() {
            this.connection && (this.connection = null, this.trigger("error", this), this.interval <= l && (this.interval *= k), c.info("RT: Connection error, backing off %s secs", this.interval), a.delay(this._boundOpen, 1e3 * this.interval))
        },
        onLoad: function() {
            this.connection && (this.connection = null, this.trigger("success", this), a.defer(this._boundOpen))
        },
        onProgress: function() {
            if (this.connection) {
                var a, b, d, e, f = this.connection.responseText,
                    g = 0;
                if (f && !(this.marker >= f.length)) {
                    a = f.slice(this.marker).split("\n");
                    for (var h = a.length, i = 0; i < h; i++)
                        if (b = a[i], g += b.length + 1, d = b.replace(/^\s+|\s+$/g, "")) {
                            try {
                                e = JSON.parse(d)
                            } catch (j) {
                                if (i === h - 1) {
                                    g -= b.length + 1;
                                    break
                                }
                                c.debug("RT: unable to parse: ", d, b);
                                continue
                            }
                            this.onMessage(e)
                        } else c.debug("RT: ignoring empty row...");
                    g > 0 && (this.marker += g - 1)
                }
            }
        },
        open: function() {
            this.close();
            var a = this.connection = g.CORS.request("GET", this.getUrl(), this._boundOnLoad, this._boundOnError);
            if (!a) return void c.debug("RT: Cannot use any cross-domain request tool with StreamPipe. Bailing out.");
            a.onprogress = this._boundOnProgress, this.connection = a, this.marker = 0;
            try {
                a.send()
            } catch (b) {
                this.connection = null, c.debug("RT: Attempt to send a CORS request failed.")
            }
        },
        close: function() {
            var a = s.prototype.close.apply(this);
            return a && a.abort()
        }
    }), a.extend(i.prototype, s.prototype, {
        baseUrl: "wss:" + e.realertime + "/ws/2/",
        onOpen: function() {
            c.debug("RT: [Socket] Connection established."), this.handshakeSuccess = !0
        },
        onError: function() {
            if (!this.handshakeSuccess) {
                if (this.handshakeFails >= n) return c.debug("RT: [Socket] Error before open, bailing out."), void this.trigger("fail");
                this.handshakeFails += 1
            }
            this.connection && (this.connection = null, this.trigger("error"), this.interval <= l && (this.interval *= k), c.error("RT: Connection error, backing off %s secs", this.interval), a.delay(this._boundOpen, 1e3 * this.interval))
        },
        onClose: function(a) {
            if (this.connection) {
                if (!a.wasClean) return this.onError();
                this.connection = null, c.debug("RT: [Socket] Connection closed. Restarting..."), this.trigger("close"), this.open()
            }
        },
        open: function() {
            this.close();
            try {
                this.connection = new window.WebSocket(this.getUrl())
            } catch (a) {
                return this.onError()
            }
            var b = this.connection;
            b.onopen = this._boundOnOpen, b.onerror = this._boundError, b.onmessage = this._boundMessage, b.onclose = this._boundClose
        },
        close: function() {
            var a = s.prototype.close.apply(this);
            return a && a.close()
        }
    });
    var t = {
        _wsSupported: o,
        initialize: function(b, c, d) {
            this.close(), this._initArgs = [b, c, d];
            var e = this._wsSupported,
                f = e && i || p && h;
            if (f) {
                var g = this.pipe = new f(b);
                a.chain(c).pairs().each(function(a) {
                    g.on(a[0], a[1], d)
                }), e && g.on("fail", function() {
                    this._wsSupported = !1, g.off(), this.initialize.apply(this, this._initArgs)
                }, this), g.open()
            }
        },
        pause: function(a) {
            this.pipe && this.pipe.pause(a)
        },
        resume: function() {
            this.pipe && this.pipe.resume()
        },
        close: function() {
            this.pipe && (this.pipe.close(), this.pipe = null)
        }
    };
    return window.addEventListener("unload", a.bind(t.close, t)), {
        Pipe: s,
        StreamPipe: h,
        SocketPipe: i,
        Manager: t,
        MAX_HANDSHAKE_FAILS: n
    }
}), define("lounge/views/badges-message", ["jquery", "underscore", "backbone", "react", "react-dom", "core/switches", "core/common/cached-storage", "templates/lounge/partials/badgesMessage"], function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = new g("badges-message", 7776e3);
    i.getAll();
    var j = c.View.extend({
        events: {
            "click [data-action=close-badges-message]": "handleDismiss",
            "keyup [data-action=close-badges-message]": "handleDismiss"
        },
        initialize: function(a) {
            b.extend(this, b.pick(a, ["forum", "session"])), this.model = new c.Model({
                dismissed: Boolean(i.getItem(this.forum.id))
            }), this.handleDismiss = this.handleDismiss.bind(this), this.listenTo(this.model, "change", this.render)
        },
        handleDismiss: function(a) {
            var b = 13;
            if (!a.keyCode || a.keyCode === b) return this.model.set("dismissed", !0), i.setItem(this.forum.id, !0), Promise.resolve()
        },
        render: function() {
            var a = this.forum.get("badges");
            if (!a || !Object.keys(a).length || this.model.get("dismissed")) return this.$el.empty(), this;
            var b = "//disqus.com/home/forum/" + this.forum.get("id") + "/badges";
            return e.render(d.createElement(h, {
                forum: this.forum.toJSON(),
                forumBadgesLink: b
            }), this.el), this
        }
    });
    return j
}), define("core/templates/react/aet/EmailSignupComplete", ["react"], function(a) {
    "use strict";
    var b = function(b) {
        var c = b.forum,
            d = b.isVerified,
            e = b.onDismiss;
        return a.createElement("div", {
            className: "newsletter-box spacing-bottom-large text-center"
        }, a.createElement("div", {
            className: "text-medium spacing-bottom-small"
        }, a.createElement("strong", null, "Thanks for subscribing!")), d ? a.createElement("div", {
            className: "spacing-bottom-small"
        }, (c.aetBannerConfirmation || "").split("\n").map(function(b, c) {
            return a.createElement("div", {
                key: c
            }, b)
        })) : a.createElement("div", {
            className: "spacing-bottom-small"
        }, "To begin receiving email updates from ", c.name, ", please click the link in the confirmation email we've sent to your inbox."), a.createElement("a", {
            className: "newsletter-box__hide",
            href: "#",
            onClick: function(a) {
                a.preventDefault(), e()
            }
        }, "Dismiss this message"))
    };
    return b
}), define("core/templates/react/aet/EmailSignupForm", ["react", "core/strings"], function(a, b) {
    "use strict";
    var c = b.gettext,
        d = function(b) {
            var d = b.forum,
                e = b.isLoading,
                f = b.isLoggedIn,
                g = b.onDismiss,
                h = b.onSubscribe,
                i = b.allowEmpty;
            return a.createElement("div", {
                className: "newsletter-box spacing-bottom-large"
            }, a.createElement("div", {
                className: "text-medium spacing-bottom-small"
            }, a.createElement("strong", null, d.aetBannerTitle)), f ? a.createElement("button", {
                className: "button button-fill--brand button-padding-wider pull-right",
                disabled: e,
                onClick: function() {
                    h && h()
                }
            }, "Subscribe") : null, a.createElement("div", {
                className: "spacing-bottom"
            }, (d.aetBannerDescription || "").split("\n").map(function(b, c) {
                return a.createElement("div", {
                    key: c
                }, b)
            })), a.createElement("div", {
                className: "align align--wrap"
            }, f ? null : a.createElement("form", {
                className: "align__item--grow",
                onSubmit: function(a) {
                    a.preventDefault();
                    var b = a.target.elements.email.value.trim();
                    (b || i) && h && h(b)
                }
            }, a.createElement("div", {
                className: "newsletter-box__input-group"
            }, a.createElement("span", {
                className: "icon icon-mail text-large newsletter-box__input-group__icon"
            }), a.createElement("input", {
                type: "email",
                name: "email",
                placeholder: c("Enter email address")
            })), a.createElement("input", {
                type: "submit",
                className: "button button-fill--brand button-padding-wider",
                disabled: e,
                value: c("Subscribe")
            })), a.createElement("a", {
                href: "#",
                className: "newsletter-box__hide publisher-anchor-color",
                onClick: function(a) {
                    a.preventDefault(), g && g()
                }
            }, c("Hide this message"))))
        };
    return d
}), define("lounge/views/email-signup", ["backbone", "react", "react-dom", "stance", "core/api", "core/bus", "core/templates/react/aet/EmailSignupComplete", "core/templates/react/aet/EmailSignupForm", "core/common/cached-storage"], function(a, b, c, d, e, f, g, h, i) {
    "use strict";
    var j = 0,
        k = 2,
        l = new i("aet-dismiss");
    l.getAll();
    var m = a.View.extend({
        initialize: function(b) {
            var c = b.forum,
                d = b.session;
            this.forum = c, this.session = d, this.model = new a.Model({
                dismissed: Boolean(l.getItem(this.forum.id)),
                loading: !1,
                signupComplete: !1
            }), this._isFirstRender = !0, this.handleCompleteDismiss = this.handleCompleteDismiss.bind(this), this.handleDismiss = this.handleDismiss.bind(this), this.handleSubscribe = this.handleSubscribe.bind(this), this.listenTo(this.model, "change", this.render), this.listenTo(this.session, "change", this.render)
        },
        getTrackingCopy: function() {
            return {
                title: this.forum.get("aetBannerTitle"),
                description_copy: this.forum.get("aetBannerDescription"),
                confirmation_copy: this.forum.get("aetBannerConfirmation")
            }
        },
        isLoggedIn: function() {
            return Boolean(this.session.user && this.session.user.id)
        },
        handleDismiss: function() {
            return this.model.set("dismissed", !0), f.trigger("uiAction:clickEmailSubscriptionPromptDismiss", this.getTrackingCopy()), this.isLoggedIn() ? Promise.resolve(e.call("aet/dismiss", {
                data: {
                    forum: this.forum.id
                },
                method: "POST"
            })) : (l.setItem(this.forum.id, !0), Promise.resolve())
        },
        handleCompleteDismiss: function() {
            this.model.set("dismissed", !0)
        },
        handleSubscribe: function() {
            var a = this,
                b = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : null;
            if (!this.model.get("loading")) return f.trigger("uiAction:clickEmailSubscriptionPromptSubscribe", this.getTrackingCopy()), this.model.set("loading", !0), Promise.resolve(b ? e.call("aet/anonymousSubscribe", {
                data: {
                    email: b,
                    forum: this.forum.id
                },
                method: "POST"
            }) : e.call("aet/subscribe", {
                data: {
                    forum: this.forum.id
                },
                method: "POST"
            })).then(function(b) {
                return a.model.set({
                    loading: !1,
                    signupComplete: !0
                }), b
            })["catch"](function() {
                a.model.set("loading", !1)
            })
        },
        reportView: function() {
            f.trigger("uiAction:viewEmailSubscriptionPrompt", this.getTrackingCopy())
        },
        render: function() {
            if (!this.forum.get("aetEnabled") || this.model.get("dismissed")) return this.$el.empty(), this;
            var a = this.session.shouldFetchSession() ? this.session.get("aetBannerStatus") : j;
            switch (a) {
                case j:
                case k:
                    if (this.model.get("signupComplete") || a === k ? c.render(b.createElement(g, {
                            forum: this.forum.toJSON(),
                            isVerified: Boolean(this.session.user && this.session.user.get("isVerified")),
                            onDismiss: this.handleCompleteDismiss
                        }), this.el) : c.render(b.createElement(h, {
                            forum: this.forum.toJSON(),
                            isLoading: this.model.get("loading"),
                            isLoggedIn: this.isLoggedIn(),
                            onDismiss: this.handleDismiss,
                            onSubscribe: this.handleSubscribe
                        }), this.el), this._isFirstRender) {
                        this._isFirstRender = !1, f.trigger("uiAction:loadEmailSubscriptionPrompt", this.getTrackingCopy());
                        var e = d(this);
                        e.isVisible() ? this.reportView() : this.listenToOnce(e, "enter", this.reportView)
                    }
                    break;
                default:
                    this.$el.empty()
            }
            return this
        }
    });
    return m
}), define("react-dom/server", ["underscore"], function(a) {
    "use strict";
    var b = function c(b) {
        if (null === b) return "";
        if (a.isArray(b)) return b.map(c).join("");
        if (a.isElement(b)) return b.outerHTML;
        if (b && b.nodeType === window.Node.DOCUMENT_FRAGMENT_NODE) {
            var d = window.document.createElement("div");
            return d.appendChild(b), d.innerHTML
        }
        return a.escape(String(b))
    };
    return {
        renderToString: b,
        renderToStaticMarkup: b
    }
}), define("core/utils/media/upload", ["underscore", "exports", "core/api", "core/models/Media", "core/UniqueModel"], function(a, b, c, d, e) {
    "use strict";
    b.uploadSupported = Boolean(window.FormData), b._extractFirstImageFile = function(b) {
        return a.find(b, function(a) {
            return a.type.match(/^image\//)
        })
    }, b._uploadViaApi = function(a, b, d) {
        return Promise.resolve(c.call(a, {
            data: b,
            contentType: !1,
            processData: !1,
            method: "POST",
            xhr: function() {
                var a = new window.XMLHttpRequest,
                    b = d && d.onProgress;
                return b && a.upload.addEventListener("progress", function(a) {
                    a.total && b(100 * a.loaded / a.total)
                }), a
            }
        }))
    }, b.UPLOAD_URL = "https://uploads.services.disqus.com/api/3.0/media/create.json", b.uploadMediaUrl = function(c, f) {
        var g, h = new window.FormData,
            i = b._extractFirstImageFile(c);
        return i ? (h.append("upload", i), h.append("permanent", 1), b._uploadViaApi(b.UPLOAD_URL, h, f).then(function(b) {
            var c = b.response,
                f = a.first(a.values(c));
            if (!f || !f.ok) throw g = new Error("Upload failed"), g.code = f && f["error-code"], g;
            return new e(d, {
                mediaType: d.MEDIA_TYPES.IMAGE_UPLOAD,
                url: f.url,
                thumbnailUrl: f.url
            })
        }, function(a) {
            if (a.responseJSON && 4 === a.responseJSON.code) throw g = new Error("Upload failed"), g.code = "not-authenticated", g;
            throw a
        })) : (g = new Error("No image file to upload"), g.code = "invalid-content-type", Promise.reject(g))
    }
}), define("core/views/media/DragDropUploadView", ["underscore", "backbone", "core/utils"], function(a, b, c) {
    "use strict";
    var d = c.stopEventHandler,
        e = b.View.extend({
            events: {
                dragover: "_dragOn",
                dragenter: "_dragOn",
                dragleave: "_dragOff",
                dragexit: "_dragOff",
                drop: "_drop"
            },
            _dragOn: d(function() {
                this.trigger("uploader:dragEnter"), this._toggleDragPlaceholder(!0)
            }),
            _dragOff: d(function() {
                this._toggleDragPlaceholder(!1)
            }),
            _drop: d(function(a) {
                this._toggleDragPlaceholder(!1);
                var b = a.originalEvent.dataTransfer.files;
                return b.length ? void this.trigger("uploader:attachMedia", b) : void this.trigger("uploader:dropError", "No files")
            }),
            _toggleDragPlaceholder: a.throttle(function(a) {
                a ? this.trigger("uploader:showPlaceholder") : this.trigger("uploader:hidePlaceholder")
            }, 50)
        });
    return e
}), define("core/templates/postMediaUploadButton", ["handlebars", "core/templates/handlebars.partials", "core/extensions/handlebars.helpers"], function(a) {
    return a.template({
        compiler: [8, ">= 4.3.0"],
        main: function(a, b, c, d, e) {
            var f = a.lookupProperty || function(a, b) {
                if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
            };
            return '<a href="#" tabindex="-1" data-action="attach" class="attach" title="' + a.escapeExpression(f(c, "gettext").call(null != b ? b : a.nullContext || {}, "Upload Images", {
                name: "gettext",
                hash: {},
                data: e,
                loc: {
                    start: {
                        line: 1,
                        column: 69
                    },
                    end: {
                        line: 1,
                        column: 96
                    }
                }
            })) + '">\n<div class="wysiwyg__attach wysiwyg__attach-dims"\nrole="img"\naria-label="A"\n/>\n</a>\n<input type="file" data-role="media-upload" tabindex="-1" accept="image/*">\n'
        },
        useData: !0
    })
}), define("core/views/media/UploadButtonView", ["jquery", "underscore", "backbone", "core/templates/postMediaUploadButton", "core/utils"], function(a, b, c, d, e) {
    "use strict";
    var f = e.stopEventHandler,
        g = "input[type=file][data-role=media-upload]",
        h = c.View.extend({
            events: function() {
                var a = {
                    "click [data-action=attach]": "_attachMedia"
                };
                return a["change " + g] = "_selectorChange", a
            }(),
            initialize: function(a) {
                this.template = a && a.template || this.generateImageUploadButton
            },
            generateImageUploadButton: function() {
                return d({
                    imageUrl: "https://c.disquscdn.com/next/embed/assets/img/attach.03c320b14aa9c071da30c904d0a0827f.svg"
                })
            },
            render: function() {
                return this.$el.html(this.template()), this
            },
            _attachMedia: f(b.throttle(function() {
                this.$(g).click()
            }, 1e3, {
                trailing: !1
            })),
            _selectorChange: function(b) {
                var c = b.target,
                    d = c.files;
                d.length && (this.trigger("uploader:attachMedia", d), a(c).replaceWith(c.cloneNode()))
            }
        });
    return h
}), define("core/templates/postMediaUploadProgress", ["handlebars", "core/templates/handlebars.partials", "core/extensions/handlebars.helpers"], function(a) {
    return a.template({
        1: function(a, b, c, d, e) {
            var f = a.lookupProperty || function(a, b) {
                if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
            };
            return '<li>\n<div class="media-progress-box">\n<div class="media-progress">\n<div class="bar" style="right: ' + a.escapeExpression(a.lambda(null != b ? f(b, "remainingPerc") : b, b)) + '%"></div>\n</div>\n</div>\n</li>\n'
        },
        compiler: [8, ">= 4.3.0"],
        main: function(a, b, c, d, e) {
            var f, g = a.lookupProperty || function(a, b) {
                if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
            };
            return null != (f = g(c, "each").call(null != b ? b : a.nullContext || {}, null != b ? g(b, "collection") : b, {
                name: "each",
                hash: {},
                fn: a.program(1, e, 0),
                inverse: a.noop,
                data: e,
                loc: {
                    start: {
                        line: 1,
                        column: 0
                    },
                    end: {
                        line: 9,
                        column: 9
                    }
                }
            })) ? f : ""
        },
        useData: !0
    })
}), define("core/views/media/UploadsProgressSubView", ["backbone", "core/templates/postMediaUploadProgress"], function(a, b) {
    "use strict";
    var c = a.View.extend({
        initialize: function() {
            this.collection = new a.Collection, this.listenTo(this.collection, "add remove change", this.render)
        },
        hasVisible: function() {
            return Boolean(this.collection.length)
        },
        render: function() {
            return this.$el.html(b({
                collection: this.collection.toJSON()
            })), this
        }
    });
    return c
}), define("core/templates/postMediaUploadRich", ["handlebars", "core/templates/handlebars.partials", "core/extensions/handlebars.helpers"], function(a) {
    return a.template({
        1: function(a, b, c, d, e) {
            var f, g = a.lookupProperty || function(a, b) {
                if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
            };
            return a.escapeExpression(a.lambda(null != (f = null != b ? g(b, "media") : b) ? g(f, "title") : f, b))
        },
        3: function(a, b, c, d, e) {
            var f = a.lookupProperty || function(a, b) {
                if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
            };
            return a.escapeExpression(f(c, "gettext").call(null != b ? b : a.nullContext || {}, "Media attachment", {
                name: "gettext",
                hash: {},
                data: e,
                loc: {
                    start: {
                        line: 6,
                        column: 81
                    },
                    end: {
                        line: 6,
                        column: 111
                    }
                }
            }))
        },
        compiler: [8, ">= 4.3.0"],
        main: function(a, b, c, d, e) {
            var f, g = a.lambda,
                h = a.escapeExpression,
                i = a.lookupProperty || function(a, b) {
                    if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
                };
            return '<li class="publisher-border-color">\n<div class="media-box">\n<div class="media-ct">\n<div class="media-surface">\n<a href="' + h(g(null != (f = null != b ? i(b, "media") : b) ? i(f, "url") : f, b)) + '" target="_blank">\n<img src="' + h(g(null != (f = null != b ? i(b, "media") : b) ? i(f, "thumbnailUrl") : f, b)) + '" alt="' + (null != (f = i(c, "if").call(null != b ? b : a.nullContext || {}, null != (f = null != b ? i(b, "media") : b) ? i(f, "title") : f, {
                name: "if",
                hash: {},
                fn: a.program(1, e, 0),
                inverse: a.program(3, e, 0),
                data: e,
                loc: {
                    start: {
                        line: 6,
                        column: 39
                    },
                    end: {
                        line: 6,
                        column: 118
                    }
                }
            })) ? f : "") + '">\n</a>\n</div>\n</div>\n</div>\n</li>\n'
        },
        useData: !0
    })
}), define("core/views/media/UploadsRichSubView", ["underscore", "backbone", "core/models/Media", "core/UniqueModel", "core/utils", "core/templates/postMediaUploadRich"], function(a, b, c, d, e, f) {
    "use strict";
    var g = b.View.extend({
        initialize: function() {
            this._hasVisible = !1, this.collection = new b.Collection([], {
                model: c,
                comparator: "index"
            }), this.listenTo(this.collection, "add remove reset sort change:thumbnailUrl change:mediaType change:editsFinished", this.render), this.listenTo(this.collection, "change:index", a.bind(this.collection.sort, this.collection))
        },
        render: function() {
            return this.$el.empty(), this._hasVisible = !1, this.collection.each(function(b) {
                b.get("thumbnailUrl") && (a.contains(c.WEBPAGE_TYPES, b.get("mediaType")) || b.get("editsFinished") && (this.$el.append(f({
                    media: b.toJSON()
                })), this._hasVisible = !0))
            }, this), this
        },
        hasVisible: function() {
            return this._hasVisible
        },
        addMedia: function(a, b) {
            var e = d.get(c, a.url);
            if (e) e.set(a);
            else {
                if (!a.editsFinished) return;
                e = new d(c, a), e.fetch(b)
            }
            return this.collection.add(e), e
        },
        updateFromText: function(b, c, d) {
            if (!b) return void this.collection.reset();
            var f = e.bleachFindUrls(b);
            f = a.uniq(f, !1, function(a) {
                return a.url
            });
            var g = {};
            a.each(f, function(e) {
                g[e.url] = !0;
                var f = a.pick(e, "index", "url"),
                    h = e.index < c && c <= e.endIndex || "." === b[e.endIndex];
                h && !d.isPasteEvent || (f.editsFinished = !0), this.addMedia(f, d)
            }, this);
            var h = this.collection.pluck("url");
            g = a.keys(g);
            var i = a.difference(h, g);
            this.collection.remove(this.collection.filter(function(b) {
                return a.contains(i, b.get("url"))
            }))
        }
    });
    return g
}), define("core/templates/postMediaUploads", ["handlebars", "core/templates/handlebars.partials", "core/extensions/handlebars.helpers"], function(a) {
    return a.template({
        compiler: [8, ">= 4.3.0"],
        main: function(a, b, c, d, e) {
            var f = a.lookupProperty || function(a, b) {
                if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
            };
            return '<ul data-role="media-progress-list"></ul>\n<ul data-role="media-rich-list"></ul>\n<div class="media-expanded empty" data-role="media-preview-expanded">\n<img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="\ndata-role="media-preview-expanded-image" alt="' + a.escapeExpression(f(c, "gettext").call(null != b ? b : a.nullContext || {}, "Media preview placeholder", {
                name: "gettext",
                hash: {},
                data: e,
                loc: {
                    start: {
                        line: 6,
                        column: 46
                    },
                    end: {
                        line: 6,
                        column: 85
                    }
                }
            })) + '">\n</div>\n'
        },
        useData: !0
    })
}), define("core/views/media/UploadsView", ["backbone", "core/views/media/UploadsProgressSubView", "core/views/media/UploadsRichSubView", "core/templates/postMediaUploads"], function(a, b, c, d) {
    "use strict";
    var e = a.View.extend({
        initialize: function() {
            this.richView = new c, this.rich = this.richView.collection, this.uploadProgressView = new b, this.uploadProgress = this.uploadProgressView.collection, this.listenTo(this.rich, "all", this._updateEmpty), this.listenTo(this.uploadProgress, "all", this._updateEmpty)
        },
        render: function() {
            return this.richView.$el.detach(), this.uploadProgressView.$el.detach(), this.$el.html(d()), this._updateEmpty(), this.richView.setElement(this.$("[data-role=media-rich-list]")[0]), this.uploadProgressView.setElement(this.$("[data-role=media-progress-list]")[0]), this
        },
        clear: function() {
            this.rich.reset(), this.uploadProgress.reset()
        },
        _updateEmpty: function() {
            this.richView.hasVisible() || this.uploadProgressView.hasVisible() ? this.$el.removeClass("empty") : this.$el.addClass("empty")
        }
    });
    return e
}), define("core/mixins/withUploadForm", ["underscore", "backbone", "core/strings", "core/utils", "core/utils/media/upload", "core/utils/storage", "core/views/media/DragDropUploadView", "core/views/media/UploadButtonView", "core/views/media/UploadsView"], function(a, b, c, d, e, f, g, h, i) {
    "use strict";
    var j = c.get,
        k = function() {
            a.defaults(this, k.bothProto, k.uploadsProto, k.previewsProto)
        },
        l = {
            "invalid-image-file": j("Unfortunately your image upload failed. Please verify that the file is valid and in a supported format (JPEG, PNG, or GIF)."),
            "invalid-content-type": j("Unfortunately your image upload failed. Please verify that the file is in a supported format (JPEG, PNG, or GIF)."),
            "file-too-large": j("Unfortunately your image upload failed. Please verify that your image is under 5MB."),
            "not-authenticated": j("You must be logged in to upload an image.")
        },
        m = j("Unfortunately your image upload failed. Please verify that your image is in a supported format (JPEG, PNG, or GIF) and under 5MB. If you continue seeing this error, please try again later.");
    return k.previewsProto = {
        initMediaPreviews: function(b, c) {
            this.mediaUploadsView = new i({
                el: b[0]
            }), this.mediaUploadsView.render(), this.updateLiveMediaDebounced = a.partial(a.debounce(this.updateLiveMedia, 500), c, !1), this.stopListening(c, "keychange"), this.stopListening(c, "paste"), this.listenTo(c, {
                keychange: this.updateLiveMediaDebounced,
                paste: function(b, d) {
                    d && d.fake || a.defer(a.bind(this.updateLiveMedia, this, c, !0))
                }
            }), this.updateLiveMedia(c, !0)
        },
        clearMediaPreviews: function() {
            this.mediaUploadsView && this.mediaUploadsView.clear()
        },
        updateLiveMedia: function(a, b) {
            if (this.mediaUploadsView) {
                var c = a.get(),
                    d = a.offset();
                this.mediaUploadsView.richView.updateFromText(c, d, {
                    isPasteEvent: b,
                    forum: this.thread.forum.id
                })
            }
        }
    }, k.uploadsProto = {
        initMediaUploads: function(a, b, c) {
            this.mediaDragDropView && this.stopListening(this.mediaDragDropView), this.mediaDragDropView = new g({
                el: b[0]
            }), this.listenTo(this.mediaDragDropView, {
                "uploader:attachMedia": function() {
                    f.set("usedDragDrop", 1), this.handleAttachMedia.apply(this, arguments)
                },
                "uploader:dragEnter": function() {
                    this.$el.addClass("expanded")
                },
                "uploader:showPlaceholder": function() {
                    a.show()
                },
                "uploader:hidePlaceholder": function() {
                    a.hide()
                },
                "uploader:dropError": function() {
                    var a = j("Sorry we didn't catch that. Try again?");
                    this.alert(a, {
                        type: "error",
                        isUploadError: !0
                    })
                }
            }), this.mediaUploadButtonView && this.stopListening(this.mediaUploadButtonView), this.mediaUploadButtonView = new h({
                el: c[0]
            }), this.listenTo(this.mediaUploadButtonView, {
                "uploader:attachMedia": this.handleUploadViaButton
            }), this.mediaUploadButtonView.render()
        },
        handleUploadViaButton: function(a) {
            if (a && f.isPersistent && !f.get("usedDragDrop") && !d.isMobileUserAgent()) {
                var b = this.alert(j("Did you know you can drag and drop images too? Try it now!"));
                this.listenToOnce(b, "dismiss", function() {
                    f.set("usedDragDrop", 1)
                })
            }
            this.handleAttachMedia.apply(this, arguments)
        },
        handleAttachMedia: function(c, d) {
            var f = this,
                g = new b.Model({
                    remainingPerc: 100
                });
            f.mediaUploadsView.uploadProgress.add(g), d = a.extend(d || {}, {
                onProgress: function(a) {
                    g.set("remainingPerc", 100 - a)
                }
            });
            var h = function() {
                f.mediaUploadsView.uploadProgress.remove(g)
            };
            e.uploadMediaUrl(c, d).then(function(a) {
                a.fetch({
                    forum: f.thread.forum.id
                }), f.textarea.insertAtCursor(a.get("url")), f.updateLiveMedia(f.textarea, !0), f.dismissUploadError()
            })["catch"](function(a) {
                var b;
                a && a.code && (b = l[a.code]), b || (b = m), f.alert(b, {
                    type: "error",
                    isUploadError: !0
                })
            }).then(h, h)
        },
        dismissUploadError: function() {
            this.dismissAlert(function(a) {
                return a.options && a.options.isUploadError
            })
        },
        uploadSupported: e.uploadSupported,
        isUploadInProgress: function() {
            return this.mediaUploadsView && this.mediaUploadsView.uploadProgress.length
        }
    }, k.bothProto = {
        initMediaViews: function(a) {
            (a.mediaembedEnabled || a.gifPickerEnabled) && this.initMediaPreviews(this.$("[data-role=media-preview]"), a.textarea), a.allowUploads && this.initMediaUploads(this.$("[data-role=drag-drop-placeholder]"), this.$("[data-role=textarea]"), this.$("[data-role=media-uploader]"))
        }
    }, k
}), define("core/editable", [], function() {
    "use strict";

    function a(a) {
        return a.replace(e, " ")
    }

    function b(c, d, e) {
        var f, h, i, j, k = "",
            l = [];
        for ("string" != typeof e && (e = "\n\n"), j = 0; j < c.length; ++j) h = c[j], f = h.nodeName.toLowerCase(), 1 === h.nodeType ? (i = d && d(h), i ? k += i : g.hasOwnProperty(f) ? (k && l.push(k), k = b(h.childNodes, d, e)) : k += "br" === f ? "\n" : b(h.childNodes, d, e)) : 3 === h.nodeType && (k += a(h.nodeValue));
        return l.push(k), l.join(e)
    }
    var c = window.document,
        d = "character",
        e = new RegExp(String.fromCharCode(160), "gi"),
        f = "h1 h2 h3 h4 h5 h6 p pre blockquote address ul ol dir menu li dl div form".split(" "),
        g = {},
        h = 0;
    for (h = 0; h < f.length; h++) g[f[h]] = !0;
    var i = function(a, b, c) {
        var d = this;
        if (!a || !a.contentEditable) throw new Error("First argument must be contentEditable");
        this.elem = a, this.emulateTextarea = a.getAttribute("plaintext-only") || b, this.emulateTextarea && (this.pasteHandler = function(a) {
            var b = a && a.clipboardData || window.clipboardData;
            b && !b.getData("text") && (a.preventDefault(), a.stopPropagation());
            var c = d.plainTextReformat,
                e = function() {
                    c.timeout = null, c.call(d)
                };
            c.timeout && clearTimeout(c.timeout), c.timeout = setTimeout(e, 0)
        }, a.addEventListener("paste", this.pasteHandler));
        for (var e in c) c.hasOwnProperty(e) && (this[e] = c[e])
    };
    return i.prototype = {
        insertHTML: function(a) {
            if (c.all) {
                var b = c.selection.createRange();
                return b.pasteHTML(a), b.collapse(!1), b.select()
            }
            return c.execCommand("insertHTML", !1, a)
        },
        insertNode: function(a) {
            var b, d, e;
            window.getSelection ? (b = window.getSelection(), b.getRangeAt && b.rangeCount && (d = b.getRangeAt(0), d.deleteContents(), d.insertNode(a), d.collapse(!1), b.removeAllRanges(), b.addRange(d))) : c.selection && c.selection.createRange && (d = c.selection.createRange(), e = 3 === a.nodeType ? a.data : a.outerHTML, d.pasteHTML(e), d.collapse(!1))
        },
        getTextNodes: function(a) {
            var b = this.elem;
            a && a.nodeType ? a = [a] : a || (a = b.childNodes);
            for (var c, d = [], e = 0; e < a.length; ++e)
                if (c = a[e]) switch (c.nodeType) {
                    case 1:
                        d = d.concat(this.getTextNodes(c.childNodes));
                        break;
                    case 3:
                        /^\n\s+/.test(c.nodeValue) || d.push(c)
                }
            return d
        },
        text: function(a) {
            var c, d, e, f = this.elem;
            try {
                d = Array.prototype.slice.call(f.childNodes)
            } catch (g) {
                for (d = [], e = 0; e < f.childNodes.length; ++e) d.push(f.childNodes[e])
            }
            return c = b(d, a, this.emulateTextarea && "\n"), c.replace(/^\s+|\s+$/g, "")
        },
        setText: function(a) {
            a = a || "";
            var b, d, e, f = c.createDocumentFragment(),
                g = [a],
                h = g && g.length;
            for (b = 0; b < h; b++) d = g[b], e = this.createParagraph(d), f.appendChild(e);
            if (f.lastChild.appendChild(c.createElement("br")), this.elem.innerHTML = "", this.elem.appendChild(f), "WebkitAppearance" in c.documentElement.style && window.navigator.userAgent.indexOf("Firefox") === -1 && window.navigator.userAgent.indexOf("MSIE") === -1) {
                var i = window.getSelection && window.getSelection();
                i && i.anchorNode === this.elem && i.modify && i.modify("move", "forward", "line")
            }
        },
        createParagraph: function(a) {
            var b, d, e, f, g, h, i, j = c.createElement("p");
            for (e = a.split(/\r\n|\r|\n/), d = 0, g = e.length; d < g; d++) {
                for (f = e[d], i = this.getHtmlElements(f), b = 0, h = i.length; b < h; b++) j.appendChild(i[b]);
                j.appendChild(c.createElement("br"))
            }
            return j.lastChild && j.removeChild(j.lastChild), j
        },
        getHtmlElements: function(a) {
            return [c.createTextNode(a)]
        },
        plainTextReformat: function() {
            if (!(this.elem.getElementsByTagName("p").length <= 1)) {
                this.emulateTextarea = !1;
                var a = this.text();
                this.emulateTextarea = !0, this.setText(a)
            }
        },
        removeNode: function(a) {
            var b, d, e;
            window.getSelection ? (b = a.previousSibling, a.parentNode.removeChild(a), d = window.getSelection(), e = c.createRange(), b && (e.setStart(b, b.length), e.setEnd(b, b.length)), d.addRange(e)) : a.parentNode.removeChild(a)
        },
        selectedTextNode: function() {
            var b, e, f, g, h, i, j, k, l, m = this.elem;
            if (window.getSelection) return b = window.getSelection(), b.anchorNode;
            if (c.selection.createRange) {
                for (e = c.selection.createRange().duplicate(); e.moveStart(d, -1e3) === -1e3;) continue;
                var n = e.text;
                for (k = 0; k < m.childNodes.length; ++k)
                    for (f = m.childNodes[k], h = this.getTextNodes(f), l = 0; l < h.length; ++l)
                        if (g = h[l], j = a(g.nodeValue), n.indexOf(j) > -1) i = g, n = n.replace(j, "");
                        else if (j.indexOf(n) > -1) return g;
                return i
            }
        },
        selectedTextNodeOffset: function(b) {
            var e, f, g;
            if (window.getSelection) {
                var h = window.getSelection();
                h && h.anchorOffset && (g = h.anchorOffset)
            } else if (b && c.selection.createRange) {
                var i = a(b.nodeValue);
                e = c.selection.createRange();
                var j = e.duplicate(),
                    k = j.parentElement();
                for (f = 0; 0 !== e.moveStart(d, -1) && (0 !== i.indexOf(a(e.text)) && k === e.parentElement()); f++) j = e.duplicate(), k = j.parentElement();
                g = f
            }
            return isNaN(g) ? 0 : g
        },
        offset: function() {
            function b(d, e) {
                function f(a) {
                    i += a[0];
                    for (var b = 1; b < a.length; ++b) h.push(i), i = a[b]
                }
                "string" != typeof e && (e = "\n\n");
                for (var h = [], i = "", j = 0; j < d.length; ++j) {
                    var k = d[j],
                        l = k.nodeName.toLowerCase();
                    1 === k.nodeType ? g.hasOwnProperty(l) ? (i && (i += e), f(b(k.childNodes, e))) : "br" === l ? i += "\n" : f(b(k.childNodes, e)) : 3 === k.nodeType && (k === c.anchorNode ? (i += a(k.nodeValue.slice(0, c.anchorOffset)), h.push(i), i = a(k.nodeValue.slice(c.anchorOffset))) : i += a(k.nodeValue))
                }
                return h.push(i), h
            }
            var c = window.getSelection();
            if (!c || !c.anchorNode || 3 !== c.anchorNode.nodeType) return 0;
            var d, e = this.elem;
            try {
                d = Array.prototype.slice.call(e.childNodes)
            } catch (f) {
                d = [];
                for (var h = 0; h < e.childNodes.length; ++h) d.push(e.childNodes[h])
            }
            var i = b(d, this.emulateTextarea && "\n");
            if (1 === i.length) return 0;
            var j = i[0].length,
                k = i.join(""),
                l = k.match(/\s+$/);
            if (l) {
                var m = l[0].length;
                j = Math.min(j, k.length - m)
            }
            var n = k.match(/^\s+/);
            if (n) {
                var o = n[0].length;
                j -= o
            }
            return j
        },
        selectNodeText: function(b, e, f) {
            var g, h, i = this.elem;
            if (window.getSelection) return g = window.getSelection(), g.removeAllRanges(), h = c.createRange(), h.setStart(b, e), h.setEnd(b, f), g.addRange(h), g;
            if (c.selection.createRange) {
                h = c.selection.createRange();
                var j = a(b.nodeValue);
                if ("body" === h.parentElement().nodeName.toLowerCase()) {
                    for (i.focus(), h = c.selection.createRange(); h.moveStart(d, -1e3) === -1e3;) continue;
                    for (; 1e3 === h.moveEnd(d, 1e3);) continue;
                    var k = a(h.text),
                        l = k.indexOf(j);
                    l > 0 && h.moveStart(d, l + 2), h.collapse()
                }
                for (; h.moveStart(d, -1) === -1 && 0 !== j.indexOf(a(h.text));) continue;
                for (; 1 === h.moveEnd(d, 1) && j !== a(h.text);) continue;
                return h.moveStart(d, e), h.moveEnd(d, -1 * (f - e - h.text.length)), h.select(), h
            }
        }
    }, i.normalizeSpace = a, i
}), define("core/utils/html/nodeTypes", [], function() {
    "use strict";
    var a = function(a) {
            return "p" === a.nodeName.toLowerCase()
        },
        b = function(a) {
            return "div" === a.nodeName.toLowerCase()
        },
        c = function(a) {
            return "#text" === a.nodeName.toLowerCase()
        },
        d = function(a) {
            return "br" === a.nodeName.toLowerCase()
        },
        e = function(a) {
            return "button" === a.nodeName.toLowerCase()
        },
        f = function(a) {
            return "br" === a.nodeName.toLowerCase() || "#text" === a.nodeName.toLowerCase() && "\n" === a.nodeValue
        },
        g = function(a) {
            return "p" === a.nodeName.toLowerCase() || "div" === a.nodeName.toLowerCase()
        };
    return {
        isP: a,
        isDiv: b,
        isText: c,
        isBr: d,
        isButton: e,
        isNewline: f,
        isPorDiv: g
    }
}), define("core/CappedStorage", ["core/utils/storage"], function(a) {
    "use strict";
    var b = function(a, b) {
        this.max = a || 10, this.queueKey = b || "__queue", this.getQueue() || this.setQueue([])
    };
    return b.prototype.set = function(b, c) {
        var d = this.getQueue() || this.setQueue([]);
        d.length === this.max && a.remove(d.shift()), a.set(b, c), d.push(b), this.setQueue(d)
    }, b.prototype.get = function(b) {
        return a.get(b)
    }, b.prototype.remove = function(b) {
        a.remove(b);
        for (var c = this.getQueue() || [], d = 0; d < c.length; d++)
            if (c[d] === b) {
                c.splice(d, 1);
                break
            }
        this.setQueue(c)
    }, b.prototype.clear = function() {
        a.clear(), this.setQueue([])
    }, b.prototype.getQueue = function() {
        return a.get(this.queueKey)
    }, b.prototype.setQueue = function(b) {
        return a.set(this.queueKey, b), b
    }, b
}), define("core/extensions/jquery.autoresize", ["jquery", "underscore"], function(a, b) {
    "use strict";
    return a.fn.autoresize = function(c) {
        var d = b.extend({
            extraSpace: 0,
            maxHeight: 1e3
        }, c);
        return this.each(function() {
            var c = a(this).css({
                    resize: "none",
                    overflow: "hidden"
                }),
                e = "true" === String(c[0].contentEditable) ? "html" : "val",
                f = "html" === e ? "<br>" : "\n",
                g = c.height(),
                h = function() {
                    var d = {};
                    b.each(d, function(a, b) {
                        d[b] = c.css(b)
                    });
                    var e = a(c[0].cloneNode(!0));
                    return e.removeAttr("id").removeAttr("name").css({
                        visibility: "hidden",
                        position: "absolute",
                        top: "-9999px",
                        left: "-9999px",
                        contentEditable: !1
                    }).css(d).attr("tabIndex", "-1"), e.insertAfter(c[0]), e
                }(),
                i = null,
                j = function() {
                    h[0].style.height = 0, h[e](c[e]() + f), h.scrollTop(h[0].scrollHeight);
                    var a = Math.max(h[0].scrollHeight, g) + parseInt(d.extraSpace, 10);
                    d.maxHeight && (a >= d.maxHeight ? (c.css("overflow", ""), a = d.maxHeight) : c.css("overflow", "hidden")), i !== a && (i = a, c.height(a), c.trigger && c.trigger("resize"))
                },
                k = b.throttle(j, 500),
                l = function(a) {
                    13 === a.keyCode ? j() : k()
                };
            c.bind("keyup", l).bind("paste", j).css("overflow", "hidden"), j()
        })
    }, a
}), define("core/views/TextareaView", ["underscore", "jquery", "backbone", "core/utils", "core/utils/html/nodeTypes", "core/CappedStorage", "core/extensions/jquery.autoresize"], function(a, b, c, d, e, f) {
    "use strict";
    var g = c.View.extend({
        events: {
            "keydown  [data-role=editable]": "handleKeyDown",
            "keyup    [data-role=editable]": "handleKeyUp",
            "paste    [data-role=editable]": "handlePaste",
            "focusin  [data-role=editable]": "handleFocusIn",
            "blur     [data-role=editable]": "handleBlur"
        },
        initialize: function(b) {
            b = b || {}, this.storageKey = b.storageKey, this.value = b.value || this.getDraft()[0], this.history = [this.value], this.historyPosition = 0, this.placeholder = b.placeholder, this.selectionIndices = {
                start: 0,
                end: 0,
                endElemInd: 0,
                endElemSelectionInd: 0,
                startElemInd: 0,
                startElemSelectionInd: 0
            }, this.inputFixed = !1, this.listenTo(this, "keychange", a.debounce(this.saveDraft, this.constructor.SAVE_DRAFT_INTERVAL))
        },
        render: function() {
            return this.$input = this.createInput(), this.set(this.value), this.$el.append(this.$input), this.$input.autoresize({
                maxHeight: this.constructor.MAX_TEXTAREA_HEIGHT
            }), this
        },
        createInput: function() {
            return b("<textarea>").attr({
                "class": "textarea",
                placeholder: this.placeholder,
                "data-role": "editable"
            })
        },
        resize: function() {
            this.$input.trigger("paste", {
                fake: !0
            })
        },
        get: function() {
            return this.$input.val().replace(/^\s+|\s+$/g, "")
        },
        getSelected: function() {
            var a = this.$input[0];
            return "number" == typeof a.selectionStart ? this.$input.val().substring(a.selectionStart, a.selectionEnd) : ""
        },
        offset: function() {
            var a = this.$input[0],
                b = this.$input.val(),
                c = "number" == typeof a.selectionStart ? a.selectionStart : 0,
                d = b.match(/\s+$/);
            if (d) {
                var e = d[0].length;
                c = Math.min(c, b.length - e)
            }
            var f = b.match(/^\s+/);
            if (f) {
                var g = f[0].length;
                c = Math.max(c - g, 0)
            }
            return c
        },
        insertAtCursor: function(a) {
            this.focus();
            var b = this.get(),
                c = this.offset(),
                e = d.insertWithWhitespace(b, c, a),
                f = this.$input[0];
            if (this.set(e), f.setSelectionRange) {
                var g = e.indexOf(a, c) + a.length + 1;
                f.setSelectionRange(g, g)
            }
        },
        insertAroundSelection: function(a, b) {
            this.focus();
            var c, d, e = this.$input[0];
            "number" == typeof e.selectionStart ? (c = e.selectionStart, d = e.selectionEnd) : c = d = 0;
            var f = this.get(),
                g = f.substring(0, c) + a + f.substring(c, d) + b + f.substring(d);
            this.set(g), e.setSelectionRange && e.setSelectionRange(c + a.length, d + a.length)
        },
        set: function(a) {
            this.$input.val(a)
        },
        clear: function() {
            this.set("")
        },
        focus: function() {
            this.$input.focus()
        },
        handleKeyDown: function(a) {
            this.trigger("keydown", a)
        },
        handleKeyUp: function(a) {
            this.trigger("keychange", a)
        },
        handlePaste: function(a, b) {
            b = b || {}, this.trigger(b.fake ? "paste" : "paste keychange"), this.$input.trigger("resize")
        },
        handleFocusIn: function() {
            this.fixInputStructure(), this.trigger("focus")
        },
        handleBlur: function() {
            this.trigger("blur")
        },
        saveDraft: function() {
            if (this.storageKey) return b.trim(this.get()) ? void this.constructor.storage.set(this.storageKey, this.toJSON()) : void this.removeDraft()
        },
        toJSON: function() {
            return [this.get(), b.now()]
        },
        getDraft: function() {
            var a = [""];
            if (!this.storageKey) return a;
            var c = this.constructor.storage.get(this.storageKey);
            if (!c) return a;
            if (a = c, !a.length) return [""];
            var d = b.now() - a[1] >= this.constructor.DRAFT_MAX_AGE;
            return d ? (this.removeDraft(), [""]) : a
        },
        removeDraft: function() {
            this.storageKey && this.constructor.storage.remove(this.storageKey)
        },
        fixInputStructure: function() {
            var a, b, c, f, g, h, i, j = !1,
                k = !1,
                l = window.document,
                m = this.$input[0];
            if (m.type && "textarea" === m.type);
            else if (d.browser.isChrome()) 0 === m.childNodes.length ? (b = m.appendChild(l.createElement("p")), b.appendChild(l.createTextNode("\n")), j = !0) : (a = m.childNodes[0], a.childNodes.forEach(function(b) {
                e.isBr(b) && a.replaceChild(l.createTextNode("\n"), b)
            }));
            else if (d.browser.isIE()) {
                if (0 === m.childNodes.length) c = l.createElement("p"), c.appendChild(l.createTextNode("")), m.appendChild(c), j = !0;
                else
                    for (g = m.childNodes.length, i = 0; i < g; i++)
                        if (e.isP(m.childNodes[i]))
                            if (f = m.childNodes[i].childNodes.length, 0 === f) m.childNodes[i].appendChild(l.createTextNode("")), 1 === g && (j = !0);
                            else if (1 === f) e.isBr(m.childNodes[i].childNodes[0]) && (m.childNodes[i].replaceChild(l.createTextNode(""), m.childNodes[i].childNodes[0]), 1 === g && (j = !0));
                else
                    for (; f > 0;) h = m.childNodes[i].childNodes[0], 1 === f && e.isBr(h) ? (m.childNodes[i].replaceChild(l.createTextNode(""), h), f -= 1) : 2 === f && e.isBr(h) && e.isText(m.childNodes[i].childNodes[1]) && this.inputFixed ? (c = l.createElement("p"), c.appendChild(l.createTextNode("")), m.insertBefore(c, m.childNodes[i]), i += 1, g += 1, m.childNodes[i].removeChild(h), f -= 2, this.selectionIndices = {
                        startElemInd: i,
                        endElemInd: i,
                        startElemSelectionInd: 0,
                        endElemSelectionInd: 0
                    }, k = !0) : 2 === f && e.isText(h) && e.isBr(m.childNodes[i].childNodes[1]) ? (this.inputFixed && (c = l.createElement("p"), c.appendChild(l.createTextNode("")), i === g - 1 ? m.appendChild(c) : m.insertBefore(c, m.childNodes[i + 1]), g += 1, this.selectionIndices = {
                        startElemInd: i + 1,
                        endElemInd: i + 1,
                        startElemSelectionInd: 0,
                        endElemSelectionInd: 0
                    }, k = !0), m.childNodes[i].removeChild(m.childNodes[i].childNodes[1]), f -= 2) : f > 2 && e.isText(h) && e.isBr(m.childNodes[i].childNodes[1]) ? (c = l.createElement("p"), c.appendChild(l.createTextNode(h.nodeValue)), m.insertBefore(c, m.childNodes[i]), i += 1, g += 1, m.childNodes[i].removeChild(m.childNodes[i].childNodes[1]), m.childNodes[i].removeChild(h), f -= 2) : f -= 1
            } else if (d.browser.isFirefox()) {
                if (1 === m.childNodes.length && e.isP(m.childNodes[0]) && m.childNodes[0].childNodes.length > 2) {
                    for (f = m.childNodes[0].childNodes.length, i = 0; i < f; i++) h = m.childNodes[0].childNodes[i], e.isText(h) ? (c = l.createElement("p"), c.appendChild(l.createTextNode(h.nodeValue)), i < f - 1 && e.isBr(m.childNodes[0].childNodes[i + 1]) && (i += 1)) : e.isBr(h) && (c = l.createElement("p"), c.appendChild(l.createElement("br"))), m.appendChild(c);
                    m.removeChild(m.childNodes[0])
                } else 1 === m.childNodes.length && e.isBr(m.childNodes[0]) ? (m.removeChild(m.childNodes[0]), c = l.createElement("p"), c.appendChild(l.createElement("br")), m.appendChild(c)) : 0 === m.childNodes.length && (c = l.createElement("p"), c.appendChild(l.createElement("br")), m.appendChild(c), j = !0);
                for (i = 0; i < m.childNodes.length; i++) {
                    var n = m.childNodes[i];
                    e.isP(n) && 1 === n.childNodes.length && e.isBr(n.childNodes[0]) ? n.insertBefore(l.createTextNode(""), n.childNodes[0]) : e.isDiv(n) && (c = l.createElement("p"), 1 === n.childNodes.length && e.isBr(n.childNodes[0]) ? (c.appendChild(l.createTextNode("")), c.appendChild(l.createElement("br"))) : 2 === n.childNodes.length && e.isText(n.childNodes[0]) && n.childNodes[0].nodeValue.length > 0 && e.isBr(n.childNodes[1]) && c.appendChild(l.createTextNode(n.childNodes[0].nodeValue)), m.replaceChild(c, n))
                }
            } else if (d.browser.isSafari() || d.browser.isEdge())
                if (0 !== m.childNodes.length && e.isP(m.childNodes[0])) {
                    for (a = m.childNodes[0], f = a.childNodes.length, i = 0; i < f; i += 1) e.isBr(a.childNodes[i]) && (0 === i || e.isBr(a.childNodes[i - 1])) && (a.insertBefore(l.createTextNode(""), a.childNodes[i]), i === f - 1 && (j = !0));
                    for (i = 0; i < f - 1; i += 1) e.isText(a.childNodes[i]) && "" === a.childNodes[i].nodeValue && e.isText(a.childNodes[i + 1]) && (a.removeChild(a.childNodes[i]), i -= 1, f -= 1)
                } else {
                    for (c = l.createElement("p"), c.appendChild(l.createTextNode("")), c.appendChild(l.createElement("br")); m.firstChild;) m.removeChild(m.firstChild);
                    m.appendChild(c), j = !0
                }
            else if (d.browser.isOpera())
                if (0 === m.childNodes.length) c = l.createElement("p"), c.appendChild(l.createTextNode("\n")), m.appendChild(c), j = !0;
                else
                    for (a = m.childNodes[0], i = 0; i < a.childNodes.length; i++) e.isBr(a.childNodes[i]) && a.replaceChild(l.createTextNode("\n"), a.childNodes[i]);
            this.inputFixed = !0, k ? this.selectText() : j && this.focusEndOfText()
        },
        focusEndOfText: function() {
            var a, b = this.$input[0],
                c = 0,
                f = 0,
                g = 0,
                h = 0;
            d.browser.isChrome() || d.browser.isOpera() ? (a = b.childNodes[0], c = f = a.childNodes.length - 1, g = h = a.childNodes[c].nodeValue.length) : d.browser.isSafari() || d.browser.isEdge() ? (a = b.childNodes[0], c = f = e.isText(a.childNodes[a.childNodes.length - 1]) ? a.childNodes.length - 1 : a.childNodes.length - 2, g = h = a.childNodes[c].nodeValue.length) : (d.browser.isFirefox() || d.browser.isIE()) && (c = f = b.childNodes.length - 1, g = b.childNodes[c].childNodes[0].nodeValue.length, h = g), this.selectionIndices = {
                startElemInd: c,
                startElemSelectionInd: g,
                endElemInd: f,
                endElemSelectionInd: h
            }, this.selectText()
        },
        getWhichChildIndex: function(a, b) {
            for (var c = 0; c < a.childNodes.length; c++)
                if (a.childNodes[c] === b) return c;
            return -1
        },
        getNodeLength: function(a) {
            return e.isBr(a) ? 1 : a.nodeValue.length
        },
        placeholderSetSelection: function() {
            var a, b, c = window.getSelection();
            this.$input[0].type && "textarea" === this.$input[0].type ? (a = this.$input[0].selectionStart, b = this.$input[0].selectionEnd) : "DIV" === c.anchorNode.tagName ? (a = 0, b = this.get().length) : "P" === c.anchorNode.tagName ? a = b = this.get().length : (a = Math.min(c.focusOffset, c.anchorOffset), b = Math.max(c.focusOffset, c.anchorOffset)), this.selectionIndices = {
                start: a,
                end: b,
                endElemInd: 0,
                endElemSelectionInd: 0,
                startElemInd: 0,
                startElemSelectionInd: 0
            }
        },
        setSelection: function() {
            var a, b, c, f, g, h, i;
            this.fixInputStructure();
            var j = this.$input[0],
                k = !1,
                l = window.getSelection();
            if (j.type && "textarea" === j.type) b = j.selectionStart, c = j.selectionEnd;
            else if (l.rangeCount) {
                var m = l.getRangeAt(0);
                if (d.browser.isChrome()) {
                    for (a = j.childNodes[0], b = f = 0; a.childNodes[f] !== m.startContainer;) b += this.getNodeLength(a.childNodes[f]), f += 1;
                    if (h = m.startOffset, b += m.startOffset, m.collapsed) g = f, c = b, i = h;
                    else if (m.startContainer === m.endContainer) g = f, i = m.endOffset, c = b + (m.endOffset - m.startOffset);
                    else {
                        for (g = f, c = b - m.startOffset; a.childNodes[g] !== m.endContainer;) c += this.getNodeLength(a.childNodes[g]), g += 1;
                        e.isNewline(a.childNodes[g]) ? (i = this.getNodeLength(a.childNodes[g - 1]), g -= 1) : (c += m.endOffset, i = m.endOffset)
                    }
                } else if (d.browser.isIE()) e.isDiv(m.startContainer) && e.isDiv(m.endContainer) && m.collapsed ? (f = j.childNodes.length - 1, g = j.childNodes.length - 1, h = j.childNodes[f].childNodes[0].nodeValue.length, i = j.childNodes[g].childNodes[0].nodeValue.length, k = !0) : e.isDiv(m.startContainer) && e.isDiv(m.endContainer) && !m.collapsed ? (f = m.startOffset, g = m.endOffset - 1, h = 0, i = j.childNodes[g].childNodes[0].nodeValue.length) : e.isText(m.startContainer) && e.isText(m.endContainer) ? (f = this.getWhichChildIndex(j, m.startContainer.parentNode), g = this.getWhichChildIndex(j, m.endContainer.parentNode), h = m.startOffset, i = m.endOffset) : e.isText(m.startContainer) && e.isDiv(m.endContainer) ? (f = this.getWhichChildIndex(j, m.startContainer.parentNode), g = m.endOffset - 1, h = m.startOffset, i = j.childNodes[g].childNodes[0].nodeValue.length) : (f = 0, g = 0, h = 0, i = 0);
                else if (d.browser.isFirefox()) e.isDiv(m.startContainer) && e.isDiv(m.endContainer) && m.startContainer === j && m.endContainer === j && m.collapsed ? (f = j.childNodes.length - 1, g = j.childNodes.length - 1, h = j.childNodes[f].childNodes[0].nodeValue.length, i = j.childNodes[g].childNodes[0].nodeValue.length, k = !0) : e.isDiv(m.startContainer) && e.isDiv(m.endContainer) && m.startContainer === j && m.endContainer === j && !m.collapsed ? (f = m.startOffset, g = m.endOffset - 1, h = 0, i = j.childNodes[g].childNodes[0].nodeValue.length) : e.isDiv(m.startContainer) && e.isText(m.endContainer) && m.startContainer === j ? (f = 0, g = this.getWhichChildIndex(j, m.endContainer.parentNode), h = 0, i = m.endOffset) : e.isDiv(m.startContainer) && e.isP(m.endContainer) && m.startContainer === j ? (f = 0, g = this.getWhichChildIndex(j, m.endContainer), h = 0, i = j.childNodes[g].childNodes[0].nodeValue.length) : e.isText(m.startContainer) && e.isText(m.endContainer) ? (f = this.getWhichChildIndex(j, m.startContainer.parentNode), g = this.getWhichChildIndex(j, m.endContainer.parentNode), h = m.startOffset, i = m.endOffset) : e.isText(m.startContainer) && e.isP(m.endContainer) ? (f = this.getWhichChildIndex(j, m.startContainer.parentNode), g = this.getWhichChildIndex(j, m.endContainer), h = m.startOffset, i = f === g ? j.childNodes[g].childNodes[0].nodeValue.length : 0) : e.isP(m.startContainer) && e.isText(m.endContainer) ? (f = this.getWhichChildIndex(j, m.startContainer), g = this.getWhichChildIndex(j, m.endContainer.parentNode), h = 0, i = m.endOffset) : e.isP(m.startContainer) && e.isP(m.endContainer) ? (f = this.getWhichChildIndex(j, m.startContainer), g = this.getWhichChildIndex(j, m.endContainer), h = 0, i = j.childNodes[g].childNodes[0].nodeValue.length) : (f = 0, g = 0, h = 0, i = 0);
                else if (d.browser.isSafari() || d.browser.isEdge()) a = j.childNodes[0], e.isText(m.startContainer) ? (f = this.getWhichChildIndex(a, m.startContainer), h = m.startOffset) : e.isP(m.startContainer) ? (f = m.startOffset < a.childNodes.length && e.isText(a.childNodes[m.startOffset]) ? m.collapsed ? m.startOffset : m.startOffset - 2 : m.startOffset - 1, h = a.childNodes[f].nodeValue.length) : e.isDiv(m.startContainer) && (m.collapsed ? (f = e.isText(a.childNodes[a.childNodes.length - 1]) ? a.childNodes.length - 1 : a.childNodes.length - 2, h = a.childNodes[f].nodeValue.length) : (f = 0, h = 0)), e.isText(m.endContainer) ? (g = this.getWhichChildIndex(a, m.endContainer), i = m.endOffset) : e.isP(m.endContainer) ? (g = m.endOffset < a.childNodes.length && e.isText(a.childNodes[m.endOffset]) ? m.collapsed ? m.endOffset : m.endOffset - 2 : m.endOffset - 1 < a.childNodes.length && e.isText(a.childNodes[m.endOffset - 1]) ? m.endOffset - 1 : m.endOffset - 1 < a.childNodes.length && e.isBr(a.childNodes[m.endOffset - 1]) ? m.endOffset - 2 : a.childNodes.length - 2, i = a.childNodes[g].nodeValue.length) : e.isDiv(m.endContainer) && (g = e.isText(a.childNodes[a.childNodes.length - 1]) ? a.childNodes.length - 1 : a.childNodes.length - 2, i = a.childNodes[f].nodeValue.length);
                else {
                    if (!d.browser.isOpera()) return this.placeholderSetSelection();
                    a = j.childNodes[0], f = this.getWhichChildIndex(a, m.startContainer), g = this.getWhichChildIndex(a, m.endContainer), h = m.startOffset, i = m.endOffset
                }
            } else this.focusEndOfText();
            this.selectionIndices = {
                start: b,
                end: c,
                startElemInd: f,
                startElemSelectionInd: h,
                endElemInd: g,
                endElemSelectionInd: i
            }, k && this.selectText()
        },
        addTagTextarea: function(a) {
            var b, c, d, e = this.selectionIndices.start,
                f = this.selectionIndices.end,
                g = this.selectionIndices.startElemInd,
                h = this.selectionIndices.endElemInd,
                i = this.selectionIndices.startElemSelectionInd,
                j = this.selectionIndices.endElemSelectionInd;
            switch (a) {
                case "a":
                    b = '<a href="#">', c = "</a>";
                    break;
                default:
                    b = "<" + a + ">", c = "</" + a + ">"
            }
            var k = this.get(),
                l = k.slice(0, e),
                m = k.slice(e, f),
                n = k.slice(f),
                o = new RegExp("<" + a + "[^<>]*>"),
                p = new RegExp(c + "$"),
                q = m.match(o),
                r = m.match(p);
            q && r && 0 === q.index && r.index === f - e - c.length ? (d = m.replace(o, "").replace(p, ""), f -= q[0].length + r[0].length, j -= q[0].length + r[0].length) : (d = b + m + c, f += b.length + c.length, j += b.length + c.length), this.selectionIndices = {
                start: e,
                end: f,
                startElemInd: g,
                endElemInd: h,
                startElemSelectionInd: i,
                endElemSelectionInd: j
            }, this.set(l + d + n), this.debouncedSaveHistory(), this.selectText()
        },
        addTag: function(a) {
            var b, c, e, f, g, h, i, j, k, l, m, n, o, p = window.document,
                q = this.$input[0],
                r = this.selectionIndices.start,
                s = this.selectionIndices.end,
                t = this.selectionIndices.startElemInd,
                u = this.selectionIndices.endElemInd,
                v = this.selectionIndices.startElemSelectionInd,
                w = this.selectionIndices.endElemSelectionInd;
            switch (a) {
                case "a":
                    b = '<a href="#">', c = "</a>";
                    break;
                default:
                    b = "<" + a + ">", c = "</" + a + ">"
            }
            var x = new RegExp("<" + a + "[^<>]*>"),
                y = new RegExp(c + "$");
            if (q.type && "textarea" === q.type) return this.addTagTextarea(a);
            if (d.browser.isChrome() || d.browser.isSafari() || d.browser.isOpera() || d.browser.isEdge()) k = q.childNodes[0], l = k.childNodes[t], m = k.childNodes[u], n = l.nodeValue, o = m.nodeValue, f = n.slice(v).match(x), g = o.slice(0, w).match(y), f && g && 0 === f.index && g.index === w - c.length ? (t === u ? (h = n.slice(0, v) + n.slice(v, w).replace(x, "").replace(y, "") + n.slice(w), k.replaceChild(p.createTextNode(h), l), w -= f[0].length + g[0].length) : (i = n.slice(0, v) + n.slice(v).replace(x, ""), j = o.slice(0, w).replace(y, "") + o.slice(w), k.replaceChild(p.createTextNode(i), l), k.replaceChild(p.createTextNode(j), m), w -= g[0].length), s -= f[0].length + g[0].length) : (t === u ? (h = n.slice(0, v) + b + n.slice(v, w) + c + n.slice(w), k.replaceChild(p.createTextNode(h), l), w += b.length + c.length) : (i = n.slice(0, v) + b + n.slice(v), j = o.slice(0, w) + c + o.slice(w), k.replaceChild(p.createTextNode(i), l), k.replaceChild(p.createTextNode(j), m), w += c.length), s += b.length + c.length);
            else if (d.browser.isFirefox() || d.browser.isIE()) {
                var z = q.childNodes[this.selectionIndices.startElemInd],
                    A = q.childNodes[this.selectionIndices.endElemInd];
                l = z.childNodes[0], m = A.childNodes[0], n = l.nodeValue, o = m.nodeValue, f = n.slice(v).match(x), g = o.slice(0, w).match(y), f && g && 0 === f.index && g.index === w - c.length ? (t === u ? (h = n.slice(0, v) + n.slice(v, w).replace(x, "").replace(y, "") + n.slice(w), z.replaceChild(p.createTextNode(h), l), w -= f[0].length + g[0].length) : (i = n.slice(0, v) + n.slice(v).replace(x, ""), j = o.slice(0, w).replace(y, "") + o.slice(w), z.replaceChild(p.createTextNode(i), l), A.replaceChild(p.createTextNode(j), m), w -= g[0].length), s -= f[0].length + g[0].length) : (t === u ? (h = n.slice(0, v) + b + n.slice(v, w) + c + n.slice(w), z.replaceChild(p.createTextNode(h), l), w += b.length + c.length) : (i = n.slice(0, v) + b + n.slice(v), j = o.slice(0, w) + c + o.slice(w), z.replaceChild(p.createTextNode(i), l), A.replaceChild(p.createTextNode(j), m), w += c.length), s += b.length + c.length)
            } else {
                var B = this.get(),
                    C = B.slice(0, r),
                    D = B.slice(r, s),
                    E = B.slice(s);
                f = D.match(x), g = D.match(y), f && g && 0 === f.index && g.index === s - r - c.length ? (e = D.replace(x, "").replace(y, ""), s = s - f[0].length - g[0].length) : (e = b + D + c, s = s + b.length + c.length), this.set(C + e + E)
            }
            this.debouncedSaveHistory(), this.selectionIndices = {
                start: r,
                end: s,
                startElemInd: t,
                startElemSelectionInd: v,
                endElemInd: u,
                endElemSelectionInd: w
            }, this.selectText()
        },
        selectText: function() {
            var a, b, c, e, f = this.$input[0],
                g = window.document.createRange(),
                h = this.selectionIndices.start,
                i = this.selectionIndices.end,
                j = f.childNodes[0],
                k = window.getSelection();
            if (f.type && "textarea" === f.type) f.setSelectionRange(h, i);
            else if (d.browser.isChrome() || d.browser.isSafari() || d.browser.isOpera() || d.browser.isEdge()) a = j.childNodes[this.selectionIndices.startElemInd], b = this.selectionIndices.startElemSelectionInd, c = j.childNodes[this.selectionIndices.endElemInd], e = this.selectionIndices.endElemSelectionInd, g.setStart(a, b), g.setEnd(c, e), k.removeAllRanges(), k.addRange(g);
            else if (d.browser.isFirefox() || d.browser.isIE()) a = f.childNodes[this.selectionIndices.startElemInd].childNodes[0], b = this.selectionIndices.startElemSelectionInd, c = f.childNodes[this.selectionIndices.endElemInd].childNodes[0], e = this.selectionIndices.endElemSelectionInd, g.setStart(a, b), g.setEnd(c, e), (!d.browser.isIE() || k.rangeCount > 0 && k.getRangeAt(0).getClientRects().length > 0) && k.removeAllRanges(), k.addRange(g);
            else {
                var l = j.childNodes[0];
                g.setStart(l, h), g.setEnd(l, i), k.removeAllRanges(), k.addRange(g)
            }(d.browser.isEdge() || f.type && "textarea" === f.type) && this.focus()
        },
        debouncedSaveHistory: a.debounce(function() {
            var a = this.toJSON()[0];
            a !== this.history[this.historyPosition] && (this.historyPosition !== this.history.length - 1 && (this.history = this.history.slice(0, this.historyPosition + 1)), this.history.push(a), this.historyPosition += 1)
        }, 200),
        undoTextarea: function() {
            this.historyPosition > 0 && (this.historyPosition -= 1, this.set(this.history[this.historyPosition]), this.fixInputStructure(), this.focusEndOfText())
        },
        redoTextarea: function() {
            this.historyPosition < this.history.length - 1 && (this.historyPosition += 1, this.set(this.history[this.historyPosition]), this.fixInputStructure(), this.focusEndOfText())
        }
    }, {
        MAX_TEXTAREA_HEIGHT: 350,
        SAVE_DRAFT_INTERVAL: 500,
        DRAFT_MAX_AGE: 864e5,
        storage: new f(5, "drafts.queue")
    });
    return g
}), define("core/views/ContentEditableView", ["jquery", "underscore", "core/editable", "core/views/TextareaView"], function(a, b, c, d) {
    "use strict";
    var e = window.document,
        f = d,
        g = f.prototype,
        h = f.extend({
            events: b.defaults({
                "focusout [data-role=editable]": "handleFocusOut",
                "click .placeholder": "handlePlaceholderClick"
            }, g.events),
            initialize: function() {
                g.initialize.apply(this, arguments), this.hasFocus = !1, this._selectionRange = null
            },
            saveSelection: function() {
                var a = window.getSelection();
                this._selectionRange = a && a.rangeCount && a.getRangeAt(0)
            },
            restoreSelection: function() {
                if (this._selectionRange) {
                    var a = window.getSelection();
                    a.removeAllRanges(), a.addRange(this._selectionRange), this._selectionRange = null
                }
            },
            render: function() {
                return this.$input = this.createInput(), this.$el.append(this.$input), this.set(this.value), this.renderPlaceholder(), this
            },
            createInput: function() {
                var b = a("<div>").attr({
                        "class": "textarea",
                        tabIndex: 0,
                        role: "textbox",
                        "aria-multiline": "true",
                        contenteditable: "PLAINTEXT-ONLY",
                        "data-role": "editable"
                    }).css({
                        overflow: "auto",
                        "word-wrap": "break-word",
                        "max-height": this.constructor.MAX_TEXTAREA_HEIGHT + "px"
                    }),
                    d = b[0];
                return "plaintext-only" !== d.contentEditable && (d.contentEditable = "true"), this.content = new c(d, (!0)), b
            },
            renderPlaceholder: function() {
                var b = this.placeholder;
                b && (this.$input.attr("aria-label", b), this.$placeholder = a('<span class="placeholder">' + b + "</span>"), this.updatePlaceholderDisplay())
            },
            updatePlaceholderDisplay: function() {
                this.$placeholder && (this.hasFocus || this.content.text() ? this.$placeholder.remove() : this.$el.prepend(this.$placeholder))
            },
            handlePlaceholderClick: function() {
                this.$input.focus()
            },
            handleFocusIn: function() {
                g.handleFocusIn.call(this), this.restoreSelection(), this.hasFocus = !0, this.updatePlaceholderDisplay()
            },
            handleFocusOut: function() {
                this.saveSelection(), this.hasFocus = !1, this.updatePlaceholderDisplay()
            },
            get: function() {
                return this.content.text()
            },
            getSelected: function() {
                return this.hasFocus && window.getSelection ? window.getSelection().toString() : this._selectionRange ? this._selectionRange.toString() : ""
            },
            offset: function() {
                return this.content.offset()
            },
            set: function(a) {
                this.content.setText(a), this.resize(), this.updatePlaceholderDisplay()
            },
            insertAtCursor: function(a) {
                this.focus();
                var b = " " + a + " ";
                e.queryCommandSupported && e.queryCommandSupported("insertText") && e.execCommand("insertText", !1, b) || this.content.insertNode(e.createTextNode(b))
            },
            clear: function() {
                g.clear.call(this), b.defer(function(a) {
                    a.$input.blur()
                }, this)
            },
            insertAroundSelection: function(a, b) {
                this.focus();
                var c = window.getSelection();
                if (c.rangeCount) {
                    var d = c.getRangeAt(0),
                        f = d.cloneRange();
                    f.collapse(!1);
                    var g = e.createTextNode(b);
                    f.insertNode(g);
                    var h = d.cloneRange();
                    h.collapse(!0);
                    var i = e.createTextNode(a);
                    h.insertNode(i), d.setStart(i, a.length), d.setEnd(g, 0), c.removeAllRanges(), c.addRange(d)
                }
            }
        });
    return h
}), define("core/views/PostReplyView", ["jquery", "underscore", "backbone", "modernizr", "moment", "core/UniqueModel", "core/mixins/withAlert", "core/mixins/withUploadForm", "core/models/Post", "core/models/User", "core/strings", "core/time", "core/utils", "core/views/ContentEditableView", "core/views/TextareaView", "core/utils/threadRatingsHelpers"], function(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p) {
    "use strict";
    var q = k.get,
        r = m.preventDefaultHandler,
        s = c.View.extend({
            tagName: "form",
            className: "reply",
            events: {
                submit: "submitForm"
            },
            postboxAlertSelector: "[role=postbox-alert]",
            initialize: function(a) {
                this.session = a.session, this.parent = a.parent, this.thread = a.thread, this.gifPickerEnabled = Boolean(this.thread) && Boolean(this.thread.forum) && Boolean(this.thread.forum.get("settings").gifPickerEnabled), this.post = this.makePostInstance(), this.setAlertSelector("[role=alert]"), this.shouldShowEmailAlertInForm = a.shouldShowEmailAlertInForm, this.parentView = a.parentView, this._isHidden = !1, this.parent && (s.open[this.parent.cid] = this), this.mediaembedEnabled = this.thread.forum.get("settings").mediaembedEnabled, this.allowUploads = this.mediaembedEnabled && this.uploadSupported, this.listenTo(this.session, "change:id", this.redraw), this.listenTo(this.thread, "change:userRating", this.redraw)
            },
            redraw: function() {
                var b = this.$el.hasClass("expanded"),
                    c = this.el,
                    d = this.$el.find("textarea").val();
                this.render(), this.$el.find("textarea").val(d), b && this.$el.addClass("expanded"), 0 !== a(c).parent().length && c.parentNode.replaceChild(this.el, c)
            },
            getPlaceholderText: function() {
                return this.thread.get("posts") ? this.thread.forum.get("commentsPlaceholderTextPopulated") || q("Join the discussion…") : this.thread.forum.get("commentsPlaceholderTextEmpty") || q("Start the discussion…")
            },
            getTemplateData: function() {
                return {
                    user: this.session.toJSON(),
                    displayMediaPreviews: this.mediaembedEnabled || this.gifPickerEnabled,
                    displayMediaUploadButton: this.allowUploads,
                    gifPickerEnabled: this.gifPickerEnabled
                }
            },
            render: function() {
                return this.$el.html(this.template(this.getTemplateData())), this.initTextEditor(null, !0), this.parent ? this.$el.addClass("expanded") : this.$el.removeClass("expanded"), this.initTextarea(), this.initMediaViews({
                    mediaembedEnabled: this.mediaembedEnabled,
                    gifPickerEnabled: this.gifPickerEnabled,
                    allowUploads: this.allowUploads,
                    textarea: this.textarea
                }), this.constructor.mustVerifyEmailToPost(this.session.user, this.thread.forum) && this._alertMustVerify(this.shouldShowEmailAlertInForm), this._isHidden && this.$el.addClass("hidden"), this.initStarRatings(), this
            },
            createTextarea: function() {
                var a = {
                    placeholder: this.getPlaceholderText(),
                    storageKey: this.post.storageKey()
                };
                return this.constructor.canUseContentEditable ? new this.constructor.ContentEditableView(a) : new this.constructor.TextareaView(a)
            },
            initTextarea: function() {
                var a = this.textarea = this.createTextarea();
                this.$("[data-role=textarea]").prepend(a.render().el), this.listenTo(a, {
                    keydown: function(a) {
                        !a || !a.ctrlKey && !a.metaKey || 13 !== a.keyCode && 10 !== a.keyCode || this.submitForm(), this.session.get("banned") && this.alertBannedError()
                    },
                    focus: function() {
                        this.$el.hasClass("expanded") || this.$el.addClass("expanded")
                    }
                })
            },
            resize: function() {
                this.textarea.resize()
            },
            focus: function() {
                this.textarea.focus()
            },
            clear: function() {
                var a = this;
                a.textarea.clear(), a.clearMediaPreviews(), a.$el.removeClass("expanded"), b.delay(function() {
                    a.resize()
                }, 200), a.parent && a.hide()
            },
            restore: function(a) {
                var c = this;
                c.textarea.set(a.get("raw_message")), c.textarea.handleFocusIn(), b.delay(function() {
                    c.resize()
                }, 200), c.parent && c.show()
            },
            _alertMustVerify: function(a) {
                var b = this.emailVerifyAlertTemplate({
                    user: this.session.user.toJSON(),
                    forumName: this.thread.forum.get("name"),
                    forumId: this.thread.forum.id
                });
                this.alert(b, {
                    safe: !0,
                    type: a ? "error" : "warn",
                    target: a ? this.postboxAlertSelector : null
                })
            },
            submitForm: r(function() {
                return this.dismissAlert(), this.initiatePost()
            }),
            makePostInstance: function() {
                return new f(this.constructor.Post, {
                    thread: this.thread.id,
                    depth: this.parent ? this.parent.get("depth") + 1 : 0,
                    parent: this.parent ? this.parent.id : null
                })
            },
            getPostParams: function() {
                var a = {
                    raw_message: this.textarea.get(),
                    rating: this.rating
                };
                b.extend(a, this.getAuthorParams());
                var c = this.mediaUploadsView;
                return c && (a.media = c.rich.invoke("toJSON")), a
            },
            getAuthorParams: function() {
                return {
                    author_id: this.session.user.id
                }
            },
            initiatePost: function() {
                this.createPost(this.getPostParams())
            },
            createPost: function(c) {
                var d = this,
                    e = this.post;
                this.dismissAlert();
                var f = a.now();
                if (!this.shouldAbortCreatePost(e, c)) return this.listenTo(e, {
                    error: this._onCreateError,
                    sync: b.partial(this._onCreateSync, f)
                }), e.save(c, {
                    success: function() {
                        b.isNumber(d.rating) && p.isThreadModelRatingsEnabled(d.thread) && (d.thread.set("userRating", d.rating), b.delay(b.bind(d.thread.fetchRatings, d.thread), 500))
                    }
                }), this.attachAuthorToPost(e, c), e.created = !0, this.addPostToThread(e), this.clear(), e
            },
            shouldAbortCreatePost: function(a, b) {
                return this.isUploadInProgress() ? (this.alert(q("Please wait until your images finish uploading."), {
                    type: "error",
                    target: this.postboxAlertSelector
                }), !0) : !a.set(b, {
                    validate: !0
                }) && (this.alert(a.validationError, {
                    type: "error",
                    target: this.postboxAlertSelector
                }), !0)
            },
            alertBannedError: function() {
                var a = {
                    blocker: this.session.user.get("isOnGlobalBlacklist") ? "Disqus" : this.thread.forum.get("name")
                };
                if (this.session.get("banExpires")) {
                    var b = e(l.assureTzOffset(this.session.get("banExpires")), l.ISO_8601);
                    if (b.isBefore(e())) return;
                    a.expirationRelative = b.fromNow()
                }
                this.alert(this.blacklistErrorMessageTemplate(a), {
                    type: "error",
                    target: this.postboxAlertSelector,
                    safe: !0
                })
            },
            _onCreateError: function(a, c) {
                12 === c.code && /not have permission to post on this thread/.test(c.response) ? this.alertBannedError() : 12 === c.code && /verify/.test(c.response) ? this._alertMustVerify(!0) : b.isString(c.response) ? this.alert(c.response, {
                    type: "error",
                    target: this.postboxAlertSelector
                }) : this.alert(q("Oops! We're having trouble posting your comment. Check your internet connection and try again."), {
                    type: "error",
                    target: this.postboxAlertSelector
                }), this.thread.posts.remove(a), this.restore(a)
            },
            _onCreateSync: function(b, c) {
                this.textarea.removeDraft(), this.thread.trigger("create", c), this.trigger("uiCallback:postCreated", c, {
                    duration: a.now() - b
                }), this.parentView && this.parentView.toggleReplyLink(!1), this.stopListening(c, "error", this._onCreateError), this.stopListening(c, "sync", this._onCreateSync), this.post = this.makePostInstance(), this.trigger("domReflow")
            },
            attachAuthorToPost: function(a, b) {
                this.session.isLoggedIn() ? a.author = this.session.user : a.author = new f(this.constructor.User, {
                    name: b.author_name,
                    email: b.author_email
                })
            },
            addPostToThread: function(a) {
                this.thread.posts.add(a)
            },
            remove: function() {
                this.parent && delete s.open[this.parent.cid], c.View.prototype.remove.call(this)
            },
            toggle: function() {
                this.isOpen() ? this.hide() : this.show()
            },
            show: function() {
                var a = this;
                a._isHidden = !1, a.$el.removeClass("hidden"), a.trigger("show")
            },
            hide: function() {
                var a = this;
                a._isHidden = !0, a.dismissAlert(), a.$el.addClass("hidden"), a.trigger("hide")
            },
            isOpen: function() {
                return !this._isHidden
            }
        }, {
            mustVerifyEmailToPost: function(a, b) {
                if (a.isAnonymous()) return !1;
                var c = b.get("settings").mustVerifyEmail,
                    d = a.get("isVerified");
                return c && !d
            },
            canUseContentEditable: d.contenteditable && !m.isMobileUserAgent() && !(window.opera && window.opera.version),
            TextareaView: o,
            ContentEditableView: n,
            User: j,
            Post: i,
            open: {}
        });
    return g.call(s.prototype), h.call(s.prototype), s
}), define("constants/gifPickerConstants", [], function() {
    "use strict";
    return {
        GIF_PICKER_CATEGORIES: {
            LEFT: [{
                title: "Trending",
                gifUrl: "https://media.giphy.com/media/WsV5AoDeKePw4/200w_d.gif",
                width: 200,
                height: 113
            }, {
                title: "OMG",
                gifUrl: "https://media.giphy.com/media/5VKbvrjxpVJCM/200w_d.gif",
                width: 200,
                height: 160
            }, {
                title: "No",
                gifUrl: "https://media.giphy.com/media/z5WtAAaFpnIgU/200w_d.gif",
                width: 200,
                height: 150
            }, {
                title: "Slow clap",
                gifUrl: "https://media.giphy.com/media/58FMN3DmsmYta2m0aB/200w_d.gif",
                width: 200,
                height: 150
            }, {
                title: "Love",
                gifUrl: "https://media.giphy.com/media/Xf7g5BjIIMun8fR14k/200w_d.gif",
                width: 200,
                height: 199
            }, {
                title: "Eye roll",
                gifUrl: "https://media.giphy.com/media/sbwjM9VRh0mLm/200w_d.gif",
                width: 200,
                height: 142
            }],
            RIGHT: [{
                title: "Applause",
                gifUrl: "https://media.giphy.com/media/fnK0jeA8vIh2QLq3IZ/200w_d.gif",
                width: 200,
                height: 201
            }, {
                title: "Agree",
                gifUrl: "https://media.giphy.com/media/3og0ILzGlzG26yNINq/200w_d.gif",
                width: 200,
                height: 166
            }, {
                title: "Ok",
                gifUrl: "https://media.giphy.com/media/mgqefqwSbToPe/200w_d.gif",
                width: 200,
                height: 150
            }, {
                title: "Thumbs up",
                gifUrl: "https://media.giphy.com/media/j5QcmXoFWl4Q0/200w_d.gif",
                width: 200,
                height: 125
            }, {
                title: "Thumbs down",
                gifUrl: "https://media.giphy.com/media/KUrgyFtn9bQNW/200w_d.gif",
                width: 200,
                height: 128
            }, {
                title: "Thank you",
                gifUrl: "https://media.giphy.com/media/QAsBwSjx9zVKoGp9nr/200w_d.gif",
                width: 200,
                height: 144
            }]
        }
    }
}), define("templates/lounge/gifsView", ["react"], function(a) {
    "use strict";
    var b = function(b) {
        return a.createElement("div", {
            className: "gif-picker__gifs-view"
        }, a.createElement("div", {
            className: "gif-picker__gifs-view-left"
        }, b.gifsLeft ? b.gifsLeft.map(function(b) {
            return a.createElement("div", {
                key: b.id,
                className: "gif-picker__image",
                "data-action": "gif-picker-image",
                "data-tag": b["default"].url
            }, a.createElement("img", {
                src: b.fixedWidth200.url,
                title: b.title,
                style: {
                    height: parseInt(b.fixedWidth200.height, 10) + "px",
                    width: parseInt(b.fixedWidth200.width, 10) + "px"
                }
            }))
        }) : null), a.createElement("div", {
            className: "gif-picker__gifs-view-right"
        }, b.gifsRight ? b.gifsRight.map(function(b) {
            return a.createElement("div", {
                key: b.fixedWidth200.url,
                className: "gif-picker__image",
                "data-action": "gif-picker-image",
                "data-tag": b["default"].url
            }, a.createElement("img", {
                src: b.fixedWidth200.url,
                title: b.title,
                style: {
                    height: parseInt(b.fixedWidth200.height, 10) + "px",
                    width: parseInt(b.fixedWidth200.width, 10) + "px"
                }
            }))
        }) : null))
    };
    return b
}), define("templates/lounge/gifsCategory", ["react", "core/strings"], function(a, b) {
    "use strict";
    var c = b.get,
        d = function(d) {
            return a.createElement("div", {
                className: "gif-picker__gifs-view gif-picker__categories"
            }, a.createElement("div", {
                className: "gif-picker__gifs-view-left"
            }, d.categoriesLeft ? d.categoriesLeft.map(function(d) {
                return a.createElement("div", {
                    key: d.title,
                    className: "gif-picker__image",
                    "data-action": "gif-picker-category",
                    "data-tag": d.title
                }, a.createElement("img", {
                    src: d.gifUrl,
                    className: "gif-picker__category-gif",
                    style: {
                        height: d.height + "px",
                        width: d.width + "px"
                    }
                }), a.createElement("div", {
                    className: "gif-picker__category-overlay"
                }), a.createElement("div", {
                    className: "gif-picker__category-title align align--middle align--center"
                }, a.createElement("b", null, b.interpolate(c("%(title)s"), {
                    title: d.title
                }))))
            }) : null), a.createElement("div", {
                className: "gif-picker__gifs-view-right"
            }, d.categoriesRight ? d.categoriesRight.map(function(d) {
                return a.createElement("div", {
                    key: d.title,
                    className: "gif-picker__image",
                    "data-action": "gif-picker-category",
                    "data-tag": d.title
                }, a.createElement("img", {
                    src: d.gifUrl,
                    className: "gif-picker__category-gif",
                    style: {
                        height: d.height + "px",
                        width: d.width + "px"
                    }
                }), a.createElement("div", {
                    className: "gif-picker__category-overlay"
                }), a.createElement("div", {
                    className: "gif-picker__category-title align align--middle align--center"
                }, a.createElement("b", null, b.interpolate(c("%(title)s"), {
                    title: d.title
                }))))
            }) : null))
        };
    return d
}), define("templates/lounge/gifsPopout", ["react", "core/strings"], function(a, b) {
    "use strict";
    var c = b.get,
        d = function() {
            return a.createElement("div", {
                className: "gif-picker__popout"
            }, a.createElement("textarea", {
                className: "gif-picker__search-bar",
                placeholder: c("Search for gifs"),
                "data-role": "gif-picker-input",
                wrap: "soft",
                rows: "1"
            }), a.createElement("div", {
                className: "gif-picker__gifs-view-container",
                "data-role": "gifs-view-container"
            }), a.createElement("img", {
                className: "gif-picker__powered-by",
                src: "https://c.disquscdn.com/next/embed/assets/img/powered-by-giphy.b72f56fe31b44adb55a65c343c691d63.png"
            }))
        };
    return d
}), define("lounge/mixins/asGifPicker", ["jquery", "underscore", "core/bus", "core/strings", "constants/gifPickerConstants", "templates/lounge/gifsView", "templates/lounge/gifsCategory", "templates/lounge/gifsPopout", "common/collections"], function(a, b, c, d, e, f, g, h, i) {
    "use strict";
    var j = d.get,
        k = {
            events: {
                "mousedown  [data-role=gif-picker-toggle]": "toggleGifPicker",
                "mousedown  [data-action=gif-picker-image]": "pickGif",
                "mousedown  [data-action=gif-picker-category]": "pickGifCategory",
                "keydown    [data-role=gif-picker-input]": "onKeydown",
                "keyup      [data-role=gif-picker-input]": "onKeyup"
            },
            initialize: function(a, b) {
                b = b || {}, a.call(this, b)
            },
            initGifPicker: function() {
                this.gifPicker = this.$(".gif-picker"), this.toggle = this.$("[data-role=gif-picker-toggle]"), this.gifsCollection = new i.GifObjectsCollection, this.popoutContainer = this.$("[data-role=gif-picker-popout-container]"), this.categories = e.GIF_PICKER_CATEGORIES, this.gifPickerQuery = null, this.rescrollToTop = 0, this.popoutTemplate = h({}), this.popoutContainer.html(this.popoutTemplate), this.renderCategoriesView(), this.revealGifPicker(), this.listenTo(this.gifsCollection, "sync", this.syncGifsCollection)
            },
            fetchGifObjectsCollection: function(a) {
                this.gifsCollection.fetch({
                    forum: this.thread.forum.id,
                    query: a
                })
            },
            syncGifsCollection: function() {
                this.renderGifsView(), this.positionGifPickerPopout(), this.gifsView[0].scrollTo({
                    top: this.rescrollToTop
                })
            },
            dismissGifPicker: function(b) {
                this.gifPicker.length && !this.gifPicker[0].contains(b.target) && (this.hideGifPicker(), a(window).off("mousedown", this.dismissGifPicker))
            },
            toggleGifPicker: function() {
                this.popoutTemplate ? this.popoutContainer.hasClass("hidden") ? this.revealGifPicker() : this.hideGifPicker() : this.initGifPicker()
            },
            pickGif: function(a) {
                this.textarea.set(this.textarea.get() + " " + a.currentTarget.getAttribute("data-tag")), b.delay(b.bind(function() {
                    this.hideGifPicker()
                }, this), 500)
            },
            pickGifCategory: function(a) {
                var b = a.currentTarget.getAttribute("data-tag");
                b = "Trending" === b ? "" : d.interpolate(j("%(category)s"), {
                    category: b
                }), this.gifPickerQuery = b, this.rescrollToTop = 0, this.fetchGifObjectsCollection(b), this.gifsInput.val(b)
            },
            revealGifPicker: function() {
                this.popoutContainer.removeClass("hidden"), a(window).on("mousedown", b.bind(this.dismissGifPicker, this)), this.positionGifPickerPopout(), this.triggerClick()
            },
            hideGifPicker: function() {
                this.popoutContainer.addClass("hidden")
            },
            onKeydown: function(a) {
                13 === a.keyCode && a.preventDefault()
            },
            onKeyup: function(a) {
                a.target.value !== this.gifPickerQuery && (this.gifPickerQuery = "" === a.target.value ? null : a.target.value, this.rescrollToTop = 0, this.debouncedSearch())
            },
            debouncedSearch: b.debounce(function() {
                this.gifPickerQuery || "" === this.gifPickerQuery ? this.fetchGifObjectsCollection(this.gifPickerQuery) : this.renderCategoriesView()
            }, 250),
            renderCategoriesView: function() {
                this.gifsCollection.reset(), this.gifsContainer = this.$("[data-role=gifs-view-container]"), this.gifsInput = this.$("[data-role=gif-picker-input]"), this.gifCategories ? (this.gifsContainer.html(this.gifCategories), this.gifsView = this.gifCategories) : (this.gifsContainer.html(g({
                    categoriesLeft: this.categories.LEFT,
                    categoriesRight: this.categories.RIGHT
                })), this.gifCategories = this.gifsView = this.gifsContainer.children())
            },
            renderGifsView: function() {
                var a = this.gifsCollection && this.gifsCollection.toJSON(),
                    c = [],
                    d = [],
                    e = 0,
                    g = 0;
                b.forEach(a, function(a) {
                    var b = parseInt(a.fixedWidth200.height, 10) + 10;
                    g >= e ? (c.push(a), e += b) : (d.push(a), g += b)
                }), this.gifsContainer.html(f({
                    gifsLeft: c,
                    gifsRight: d
                })), this.gifsView = this.gifsContainer.children()
            },
            positionGifPickerPopout: function() {
                var b = this,
                    c = 450,
                    d = 800,
                    e = 0,
                    f = 0,
                    g = d,
                    h = !1,
                    i = 873,
                    j = 236,
                    k = 73,
                    l = 20,
                    m = this.toggle.outerWidth() + 2,
                    n = this.popoutContainer.height() + l,
                    o = this.toggle.outerHeight(),
                    p = this.toggle.offset().left,
                    q = this.toggle.offset().top + o - 2,
                    r = a(window.document).height(),
                    s = a(window.document).width();
                if (n > r || n < i && n < r && r < i ? (g = Math.min(r, i) - k, e = -q + o, f = m, h = !0) : r > i && r - q < i ? (e = r - q - Math.max(n, i) + o, f = m, h = !0) : r - q > i && (h = !0, e = o, f = Math.min(0, s - (this.toggle.offset().left + j))), s < c) {
                    this.popoutContainer.find(".gif-picker__popout").css({
                        padding: "4px 4px 4px"
                    });
                    var t = this.popoutContainer.outerWidth() - this.gifsView.outerWidth(),
                        u = s - (p + t + f + 10),
                        v = u / 2;
                    this.popoutContainer.find(".gif-picker__image > img").each(function() {
                        a(this).css({
                            width: v,
                            height: v * a(this).height() / a(this).width()
                        })
                    }), h = !0
                }
                h && (this.gifsView.css("maxHeight", g), this.popoutContainer.css({
                    top: e,
                    left: f
                })), this.lastScrollTop = 0, this.gifsView[0].onscroll = function(a) {
                    var c = a.target.scrollHeight - a.target.scrollTop - g,
                        d = a.target.scrollTop > b.lastScrollTop;
                    b.lastScrollTop = a.target.scrollTop, b.rescrollToTop = a.target.scrollTop, d && null !== b.gifPickerQuery && c < Math.min(1e3, .5 * g) && b.throttledOnScrollToBottom(a.target.scrollTop)
                }
            },
            throttledOnScrollToBottom: b.throttle(function() {
                this.debouncedSearch()
            }, 500, {
                trailing: !1
            }),
            triggerClick: function() {
                c.trigger("uiAction:gifsClickButton")
            },
            triggerScroll: function() {
                c.trigger("uiAction:gifsScrollToBottom")
            }
        };
    return function() {
        this.events = b.defaults({}, this.events, k.events), this.initialize = b.wrap(this.initialize, k.initialize), b.extend(this, b.pick(k, ["initGifPicker", "fetchGifObjectsCollection", "syncGifsCollection", "toggleGifPicker", "dismissGifPicker", "pickGif", "pickGifCategory", "revealGifPicker", "hideGifPicker", "onKeydown", "onKeyup", "debouncedSearch", "renderCategoriesView", "renderGifsView", "positionGifPickerPopout", "throttledOnScrollToBottom", "triggerClick", "triggerScroll"]))
    }
}), define("core/constants/textEditorConstants", ["exports"], function(a) {
    "use strict";
    a.EDITOR_BUTTONS_ORDER = ["b", "spoiler", "i", "s", "u", "a", "code", "blockquote"], a.GIF_PICKER_BUTTON = "gif-picker", a.MEDIA_UPLOADER_BUTTON = "media-uploader"
}), define("lounge/mixins/asTextEditor", ["jquery", "underscore", "core/constants/textEditorConstants"], function(a, b, c) {
    "use strict";
    var d = {
        events: {
            "mousedown [data-action=text-editor-tag]": "textEditorTag",
            "mouseup   [data-action=text-editor-buttons]": "textEditorForceSelectText",
            "mousedown [data-role=editable]": "textEditorMouseDown",
            "keyup     [data-role=editable]": "textEditorKeyUp",
            "keydown   [data-role=editable]": "textEditorKeyDown"
        },
        initialize: function(c, d) {
            d = d || {}, c.call(this, d), this.textEditorMouseUp = b.bind(this.textEditorMouseUp, this), this.editBox = this.el && this.el.className && this.el.className.indexOf("edit") > -1, a(window).on("resize", b.bind(this.initTextEditor, this)), this.mostRecentPostBoxWidth = null
        },
        textEditorTag: function(a) {
            this.textarea.addTag(a.currentTarget.getAttribute("data-tag"))
        },
        textEditorForceSelectText: function() {
            this.textarea.selectText()
        },
        textEditorMouseDown: function() {
            a(window).on("mouseup", this.textEditorMouseUp)
        },
        textEditorMouseUp: function() {
            a(window).off("mouseup", this.textEditorMouseUp), setTimeout(b.bind(this.textarea.setSelection, this.textarea), 200)
        },
        textEditorKeyUp: function() {
            this.textarea.setSelection()
        },
        textEditorKeyDown: function(a) {
            !a.ctrlKey && !a.metaKey || "z" !== a.key && "y" !== a.key && "Z" !== a.key && "Y" !== a.key ? this.textarea.debouncedSaveHistory() : (a.preventDefault(), this.textarea.debouncedSaveHistory(), "y" === a.key || "Y" === a.key || a.shiftKey && ("z" === a.key || "Z" === a.key) ? this.textarea.redoTextarea() : "z" !== a.key && "Z" !== a.key || this.textarea.undoTextarea())
        },
        getTextEditorTemplateData: function() {
            var a = [],
                b = !this.editBox && this.gifPickerEnabled,
                d = !this.editBox && this.allowUploads,
                e = this.$(".post-actions").outerWidth() || 0;
            this.mostRecentPostBoxWidth = e;
            var f = this.$(".wysiwyg__item").outerWidth(!0) || 0,
                g = (this.$(".edit-button").outerWidth() || 0) + (this.$(".post-action__cancel").outerWidth(!0) || 0),
                h = this.$(".full-size-button").outerWidth() || 0,
                i = this.$(".small-size-button").outerWidth() || 0,
                j = b || d ? this.$(".vertical-separator").outerWidth() || 30 : 0,
                k = c.EDITOR_BUTTONS_ORDER.length + (!this.editBox && this.gifPickerEnabled ? 1 : 0) + (!this.editBox && this.allowUploads ? 1 : 0),
                l = h + j + (k + 1) * f >= e,
                m = l ? i : h,
                n = this.editBox ? g : m,
                o = Math.floor((e - n - j) / f) || 0;
            return b && o > a.length && (a = a.concat([c.GIF_PICKER_BUTTON])), o > a.length && (a = a.concat(c.EDITOR_BUTTONS_ORDER.slice(0, 1))), d && o > a.length && (a = a.concat([c.MEDIA_UPLOADER_BUTTON])), o > a.length && (a = a.concat(c.EDITOR_BUTTONS_ORDER.slice(1, o - a.length))), {
                user: this.session.toJSON(),
                displayMediaPreviews: this.mediaembedEnabled || this.gifPickerEnabled,
                displayMediaUploadButton: this.allowUploads,
                gifPickerEnabled: this.gifPickerEnabled,
                useSmallPostButton: l,
                buttonsToShow: a,
                edit: this.editBox
            }
        },
        initTextEditor: function(a, b) {
            var c = this.$(".post-actions").outerWidth();
            if (!(a && "resize" === a.type && this.mostRecentPostBoxWidth && c && c === this.mostRecentPostBoxWidth)) return this.$(".text-editor-container").html(this.textEditorTemplate(this.getTextEditorTemplateData())), b && null === c ? void this.initTextEditor(null, !1) : void(!this.editBox && this.textarea && this.initMediaViews({
                mediaembedEnabled: this.mediaembedEnabled,
                gifPickerEnabled: this.gifPickerEnabled,
                allowUploads: this.allowUploads,
                textarea: this.textarea
            }))
        }
    };
    return function() {
        this.events = b.defaults({}, this.events, d.events), this.initialize = b.wrap(this.initialize, d.initialize), b.extend(this, b.pick(d, ["textEditorTag", "textEditorForceSelectText", "textEditorMouseDown", "textEditorMouseUp", "textEditorKeyUp", "textEditorKeyDown", "getTextEditorTemplateData", "initTextEditor"]))
    }
}), define("templates/lounge/rate", ["react", "core/strings"], function(a, b) {
    "use strict";
    var c = b.gettext,
        d = function(b) {
            return a.createElement("div", {
                className: "ratings-rate"
            }, a.createElement("div", {
                className: "ratings-text"
            }, c(b.submitted ? "You rated this" : "Rate and comment")), a.createElement("div", {
                className: "ratings-stars"
            }, a.createElement("div", {
                className: "stars animation-star-container"
            }, a.createElement("div", {
                className: "animation-star"
            }, a.createElement("div", {
                className: "rating-star"
            }, "★"), a.createElement("div", {
                className: "rating-star"
            }, "★"), a.createElement("div", {
                className: "rating-star"
            }, "★"), a.createElement("div", {
                className: "rating-star"
            }, "★"), a.createElement("div", {
                className: "rating-star"
            }, "★"))), b.selected ? a.createElement("div", {
                className: "stars selection-stars",
                style: {
                    width: 20 * b.selectedValue + "%"
                }
            }, a.createElement("div", {
                className: "rating-star"
            }, "★"), a.createElement("div", {
                className: "rating-star"
            }, "★"), a.createElement("div", {
                className: "rating-star"
            }, "★"), a.createElement("div", {
                className: "rating-star"
            }, "★"), a.createElement("div", {
                className: "rating-star"
            }, "★")) : null, a.createElement("div", {
                className: "stars voting-stars"
            }, a.createElement("div", {
                className: "rating-star",
                "data-action": "rateThread",
                "data-tag": "1",
                tabIndex: "0"
            }, "★"), a.createElement("div", {
                className: "rating-star",
                "data-action": "rateThread",
                "data-tag": "2",
                tabIndex: "0"
            }, "★"), a.createElement("div", {
                className: "rating-star",
                "data-action": "rateThread",
                "data-tag": "3",
                tabIndex: "0"
            }, "★"), a.createElement("div", {
                className: "rating-star",
                "data-action": "rateThread",
                "data-tag": "4",
                tabIndex: "0"
            }, "★"), a.createElement("div", {
                className: "rating-star",
                "data-action": "rateThread",
                "data-tag": "5",
                tabIndex: "0"
            }, "★")), a.createElement("div", {
                className: "stars base-stars"
            }, a.createElement("div", {
                className: "rating-star"
            }, "★"), a.createElement("div", {
                className: "rating-star"
            }, "★"), a.createElement("div", {
                className: "rating-star"
            }, "★"), a.createElement("div", {
                className: "rating-star"
            }, "★"), a.createElement("div", {
                className: "rating-star"
            }, "★"))))
        };
    return d
}), define("lounge/mixins/withStarRatings", ["underscore", "core/strings", "core/utils/threadRatingsHelpers", "templates/lounge/rate"], function(a, b, c, d) {
    "use strict";
    var e = b.gettext,
        f = 13,
        g = {
            events: {
                "click     [data-action=rateThread]": "rateThread",
                "keydown   [data-action=rateThread]": function(a) {
                    a.keyCode && a.keyCode === f && (a.preventDefault(), this.rateThread(a))
                },
                "mouseover [data-action=rateThread]": "highlightRating",
                "mouseout  [data-action=rateThread]": "unhighlightRating",
                "focusin   [data-action=rateThread]": "highlightRating",
                "focusout  [data-action=rateThread]": "unhighlightRating"
            },
            initialize: function(a, b) {
                b = b || {}, a.call(this, b), this.rateTemplate = d, this.rating = null, this.ratingsEnabled = !this.post.get("parent") && c.isThreadModelRatingsEnabled(this.thread), this.listenTo(this.thread, "change", function() {
                    var a = this.thread.changedAttributes();
                    return void 0 !== a.ratingsEnabled ? (this.ratingsEnabled = !this.post.get("parent") && c.isThreadModelRatingsEnabled(this.thread), this.initStarRatings(this.thread.get("userRating"))) : a.userRating && a.userRating !== this.rating ? this.initStarRatings(a.userRating) : void 0
                }), this.listenToOnce(this.thread.forum, "change:features", function() {
                    return this.ratingsEnabled = !this.post.get("parent") && c.isThreadModelRatingsEnabled(this.thread), this.initStarRatings(this.thread.get("userRating"))
                })
            },
            initStarRatings: function(b) {
                if (!this.ratingsEnabled) {
                    var c = this.$("[data-role=ratings-container]");
                    return void(c.length && this.$("[data-role=ratings-container]").empty())
                }
                return this.rating = a.isNumber(b) ? b : this.thread.get("userRating"), this.$("[data-role=ratings-container]").html(this.rateTemplate({
                    selected: a.isNumber(this.rating),
                    submitted: Boolean(this.thread.get("userRating")),
                    selectedValue: this.rating
                }))
            },
            rateThread: function(a) {
                var b = this,
                    c = parseInt(a.currentTarget.getAttribute("data-tag"), 10);
                Promise.resolve(this.initStarRatings(c)).then(function() {
                    var a = b.$(".animation-star-container"),
                        d = b.$(".animation-star-container > .animation-star");
                    d.children().slice(c).remove(), a.addClass("animate-star"), d.css({
                        position: "absolute",
                        left: "0",
                        width: 20 * c + "%"
                    }), setTimeout(function() {
                        a.removeClass("animate-star")
                    }, 500)
                }).then(function() {
                    return b.textarea.focus()
                }).then(function() {
                    return !b.postEditMode && b.alert(e("Please post a comment to submit your rating."), {
                        type: "info",
                        target: b.postboxAlertSelector
                    })
                })
            },
            highlightRating: function(a) {
                this.$(a.currentTarget).addClass("selected-star"), this.$(a.currentTarget).prevAll().addClass("selected-star")
            },
            unhighlightRating: function(a) {
                this.$(a.currentTarget).removeClass("selected-star"), this.$(a.currentTarget).prevAll().removeClass("selected-star")
            }
        };
    return function() {
        this.events = a.defaults({}, this.events, g.events), this.initialize = a.wrap(this.initialize, g.initialize), a.extend(this, a.pick(g, ["initStarRatings", "rateThread", "highlightRating", "unhighlightRating"]))
    }
}), define("lounge/mixins/post-reply", ["underscore", "common/models", "lounge/common"], function(a, b, c) {
    "use strict";
    var d = {
            initialize: function() {
                this.canBindTypingHandlers() && this.bindTypingHandlers()
            },
            canBindTypingHandlers: function() {
                return this.parent && c.getLounge().isRealtimeEnabled() && this.session && this.thread && this.thread.forum
            },
            bindTypingHandlers: function() {
                return a.map([
                    [this, "show", this.typingStart],
                    [this, "hide", this.typingStop]
                ], function(a) {
                    return this.listenTo.apply(this, a), a
                }, this)
            },
            syncTyping: function(a) {
                this.typingUser && (void 0 !== a && this.typingUser.set("typing", a), this.typingUser.sync())
            },
            typingStart: function() {
                var a = this.parent;
                this.typingUser || (this.typingUser = b.TypingUser.make({
                    user: this.session.user.id,
                    post: a.id,
                    thread: this.thread.id,
                    forum: this.thread.forum.id
                }), a.usersTyping.add(this.typingUser)), this.syncTyping(!0)
            },
            typingStop: function() {
                this.syncTyping(!1)
            }
        },
        e = function(b) {
            var c = b.initialize,
                e = b.remove;
            a.extend(b, d), b.initialize = function() {
                c.apply(this, arguments), d.initialize.call(this)
            }, b.remove = function() {
                return this.parent && this.typingStop(), e.call(this)
            }
        };
    return {
        asRealtimeTyping: e
    }
}), define("templates/lounge/suggestions", ["react", "core/strings"], function(a, b) {
    "use strict";
    var c = b.gettext,
        d = function() {
            return a.createElement("ul", {
                className: "user-mention__list",
                id: "user-mention-list"
            }, a.createElement("li", {
                className: "header user-mention__header"
            }, a.createElement("h5", null, c("in this conversation"))))
        };
    return d
}), define("templates/lounge/suggestedUser", ["react", "core/strings", "core/utils/object/get"], function(a, b, c) {
    "use strict";
    var d = b.gettext,
        e = function(b) {
            return a.createElement("li", {
                className: "user-mention__item",
                "data-cid": b.cid || ""
            }, a.createElement("img", {
                src: c(b.avatar, ["cache"], ""),
                className: "avatar",
                alt: d("Avatar")
            }), a.createElement("span", null, b.name || b.username || null))
        };
    return e
}), define("lounge/views/posts/SuggestionView", ["jquery", "underscore", "backbone", "templates/lounge/suggestions", "templates/lounge/suggestedUser"], function(a, b, c, d, e) {
    "use strict";
    var f = c.View.extend({
        events: {
            "click li": "handleClick"
        },
        initialize: function(a) {
            this.active = !1, this.userSuggestions = a.userSuggestions, this.scrollListener = null, this.userHtmlCache = {}, this.userSuggestions && this.userSuggestions.userCollection && this.listenTo(this.userSuggestions.userCollection, "sync", this.syncUserCollection)
        },
        syncUserCollection: function() {
            this.active && (this.userSuggestions.userCollection.models.length ? this.renderUsers(this.userSuggestions.userCollection.models) : this.clear())
        },
        suggest: function(a, b) {
            return a ? (this.userSuggestions.find(a, b), this.currTerms = a, this.active = !0, void this.$el.show()) : void this.clear()
        },
        throttledSuggestMore: b.throttle(function() {
            this.suggest(this.currTerms, !0)
        }, 200, {
            trailing: !1
        }),
        render: function() {
            var a = this;
            return this.$el.html(d()), this.active || this.$el.hide(), this.scrollListener || (this.scrollListener = this.$el.find("#user-mention-list")[0].onscroll = function(b) {
                b.target.scrollHeight - b.target.scrollTop === b.target.clientHeight && a.throttledSuggestMore()
            }), this
        },
        renderUsers: function(c) {
            var d = b.reduce(c, function(b, c) {
                var d = this.userHtmlCache[c.cid];
                return void 0 === d && (this.userHtmlCache[c.cid] = d = a(this.renderSingleUser(c))), b.appendChild(d[0]), b
            }, window.document.createDocumentFragment(), this);
            this.$(".header").siblings().remove().end().after(d).siblings().removeClass("active").first().addClass("active")
        },
        renderSingleUser: function(a) {
            var b = a.toJSON();
            return b.cid = a.cid, e(b)
        },
        clear: function() {
            this.active = !1, this.$el.hide()
        },
        handleClick: function(b) {
            var c = a(b.currentTarget);
            this.select(c.attr("data-cid"))
        },
        select: function(a) {
            this.active && (a || (a = this.$el.find(".active").attr("data-cid")), this.trigger("select", a), this.clear())
        },
        move: function(a) {
            if (this.active) {
                var b = this.$el.find(".active"),
                    c = "up" === a ? "prev" : "next",
                    d = b[c]();
                d.length && d.attr("data-cid") && (b.removeClass("active"), d.addClass("active"))
            }
        }
    }, {
        MAX_SUGGESTIONS: 5
    });
    return f
}), define("lounge/views/posts/ContentEditableView", ["jquery", "underscore", "core/editable", "core/views/ContentEditableView", "common/collections", "lounge/common", "lounge/views/posts/SuggestionView"], function(a, b, c, d, e, f, g) {
    "use strict";
    var h = window.document,
        i = d,
        j = i.prototype,
        k = i.extend({
            initialize: function(a) {
                j.initialize.call(this, a), a = a || {}, this.userSuggestions = a.userSuggestions, this.mentionsCache = new e.UserCollection, this.restoreMentionedUsers(), this.suggestions = new g({
                    userSuggestions: this.userSuggestions,
                    mentions: this.mentionsCache
                }), this.listenTo(this.suggestions, "select", this.insertMention), this.reset(), this.$input = null
            },
            restoreMentionedUsers: function() {
                var a = this.getDraft()[2];
                a && !b.isEmpty(a) && this.userSuggestions.addRemote(new e.UserCollection(a))
            },
            reset: function() {
                this.anchorNode = null, this.anchorOffset = null, this.anchorLength = 0, this.suggestions.clear()
            },
            render: function() {
                return d.prototype.render.call(this), this.$el.append(this.suggestions.render().el), this
            },
            createInput: function() {
                var a = d.prototype.createInput.call(this);
                return this.content.getHtmlElements = b.bind(this.getHtmlElements, this), a
            },
            getHtmlElements: function(a) {
                if (!a) return a;
                var c = [a],
                    d = this.getMentionNodes(a);
                return b.each(d, function(a, d) {
                    for (var e = 0; e < c.length; e++) {
                        var f, g = c[e],
                            h = e;
                        if (b.isString(g)) {
                            for (;
                                (f = g.indexOf(d)) > -1;) f > 0 && (c.splice(e, 0, g.substring(0, f)), e += 1), c.splice(e, 0, a.cloneNode(!0)), e += 1, g = g.substring(f + d.length);
                            g && g !== c[h] && (c.splice(e, 0, g), e += 1), h !== e && c.splice(e, 1)
                        }
                    }
                }), c = b.map(c, function(a) {
                    return b.isString(a) ? h.createTextNode(a) : a
                })
            },
            getMentionNodes: function(a) {
                var b = k.MENTIONS_RE_GROUPED,
                    c = {};
                b.lastIndex = 0;
                for (var d = b.exec(a); d;) {
                    var e = d[1],
                        f = this.userSuggestions.all().findWhere({
                            username: e
                        });
                    if (f) {
                        var g = k.getMentionDom(f),
                            h = d[0];
                        c[h] = g, this.updateCache(f, f.cid)
                    }
                    d = b.exec(a)
                }
                return c
            },
            handleKeyDown: function(a) {
                switch (d.prototype.handleKeyDown.call(this, a), a.keyCode) {
                    case 9:
                        this.suggestions.active && (this.suggestions.select(), a.preventDefault(), a.stopPropagation());
                        break;
                    case 10:
                    case 13:
                    case 38:
                    case 40:
                        this.suggestions.active && (a.preventDefault(), a.stopPropagation())
                }
            },
            handleKeyUp: function(a) {
                switch (d.prototype.handleKeyUp.call(this, a), a.preventDefault(), a.stopPropagation(), this.setSelection(), this.checkExistingMentions(), a.keyCode) {
                    case 10:
                    case 13:
                        this.suggestions.select();
                        break;
                    case 27:
                        this.reset(a);
                        break;
                    case 38:
                        this.suggestions.move("up");
                        break;
                    case 40:
                        this.suggestions.move("down");
                        break;
                    default:
                        this.throttledSuggest(a)
                }
            },
            handleFocusIn: function() {
                var a = f.getLounge();
                a && this.$input && this.$input.on("transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd resize", function() {
                    a.resize()
                }), j.handleFocusIn.call(this)
            },
            suggest: function() {
                var a = this.parseSearchTerms();
                this.suggestions.suggest(a)
            },
            throttledSuggest: b.throttle(function() {
                this.suggest()
            }, 250),
            insertMention: function(a) {
                var c = this.userSuggestions.get(a);
                if (c) {
                    this.selectSearchString(c), this.updateCache(c, a);
                    var d = k.getMentionDom(c);
                    this.content.insertNode(d);
                    var e = this.$el.find("span[data-cid]");
                    b.each(e, function(a) {
                        a.contentEditable !== !1 && (a.contentEditable = !1)
                    })
                }
            },
            updateCache: function(a, b) {
                this.mentionsCache.get(b) || this.mentionsCache.add(a)
            },
            selectSearchString: function() {
                this.content.selectNodeText(this.anchorNode, this.anchorOffset - 1, this.anchorOffset + this.anchorLength)
            },
            get: function() {
                function a(a) {
                    return c(a, !0) ? b.mentionToText(a) : null
                }
                var b = this,
                    c = k.isMention;
                return this.content.text(a)
            },
            parseSearchTerms: function() {
                var a = this.content.selectedTextNode(),
                    b = a ? a.nodeValue : "",
                    d = c.normalizeSpace;
                if (b) {
                    var e = this.content.selectedTextNodeOffset(a),
                        f = c.normalizeSpace(b.slice(0, e).split("").reverse().join("")),
                        g = f.indexOf("@");
                    if (g === -1) return null;
                    this.anchorNode = a, this.anchorOffset = e - g, this.anchorLength = g;
                    var h = d(b.slice(this.anchorOffset - 1, e)).match(k.MENTIONS_RE);
                    return h ? h[0].slice(1).split(" ") : 0 === g ? [""] : void 0
                }
            },
            checkExistingMentions: function() {
                var d = c.normalizeSpace,
                    e = this.$el.find("span"),
                    f = b.filter(e, k.isMention),
                    g = this.mentionsCache,
                    h = {};
                b.each(f, function(c) {
                    var e = a(c).attr("data-cid"),
                        f = b.reduce(this.content.getTextNodes(c), function(a, b) {
                            return a + d(b.nodeValue)
                        }, ""),
                        i = g.get(e);
                    i && i.get("name") !== f ? (this.mentionsCache.remove(i), this.content.removeNode(c), this.content.insertHTML(" "), this.reset()) : h[e] = c
                }, this), g.each(function(a) {
                    h[a.cid] || g.remove(a)
                })
            },
            mentionToText: function(b) {
                var c = a(b).attr("data-cid"),
                    d = this.mentionsCache.get(c),
                    e = b.innerText || b.textContent;
                return d && d.get("username") && (e = d.get("username")), ["@", e, ":", "disqus"].join("")
            },
            toJSON: function() {
                var a = d.prototype.toJSON.call(this);
                return a.push(this.mentionsCache.models), a
            }
        }, {
            MENTIONS_RE: new RegExp("@\\w+\\s?(?:\\w+\\s?){0,5}(?:\\w+)?$"),
            MENTIONS_RE_GROUPED: /@([\d\w]+)\s?(:\s?(\w+))?/gi,
            isMention: function(b, c) {
                var d;
                do {
                    if (d = a(b), d.hasClass("mention") && d.attr("data-cid")) return !0;
                    b = b.parentElement
                } while (c && b);
                return !1
            },
            getMentionDom: function(a) {
                var b = h.createDocumentFragment(),
                    c = h.createElement("span"),
                    d = h.createElement("span"),
                    e = h.createTextNode(a.get("name") || a.get("username"));
                return c.setAttribute("contenteditable", !0), d.setAttribute("contenteditable", !1), d.setAttribute("data-cid", a.cid), d.className = "mention", d.appendChild(e), c.appendChild(d), b.appendChild(c), b.appendChild(h.createTextNode(" ")), b
            }
        });
    return k
}), define("core/views/common/LoginFormView", ["underscore", "backbone", "core/strings"], function(a, b, c) {
    "use strict";
    var d = c.get,
        e = b.View.extend({
            initialize: function() {
                this.model = new this.User
            },
            parseRegistrationErrorResponse: function(a) {
                if (a.responseJSON) {
                    var b = a.responseJSON.response;
                    return window.grecaptcha && window.grecaptcha.reset(), /Unable to create user/i.test(b) ? {
                        email: [d("That email address is already registered with a Disqus account. Log in or enter another email.")]
                    } : /The e-mail address you specified is already in use./i.test(b) ? {
                        email: [d("The e-mail address you specified is already in use.") + '<br><a class="link" href="#" data-action="auth:disqus">' + d("Try logging in.") + "</a>"]
                    } : (/You must re-submit this request with a response to the captcha challenge/i.test(b) && this.showCaptcha && this.showCaptcha(null, !0), {
                        all: [b]
                    })
                }
            },
            getPassword: function() {
                var a = this.$el.find("input[name=password]");
                return a.length ? a.val() : null
            },
            getDisplayName: function() {
                return this.$el.find("input[name=display_name]").val()
            },
            getEmail: function() {
                return this.$el.find("input[name=email]").val()
            },
            disableForm: function() {
                this.$("[data-role=submit-btn-container]").addClass("is-submitting")
            },
            enableForm: function() {
                this.$("[data-role=submit-btn-container]").removeClass("is-submitting")
            },
            handleRegistrationErrorResponse: function(a) {
                this.handleRegistrationError(this.parseRegistrationErrorResponse(a))
            },
            registerUser: function() {
                return this.model.set({
                    display_name: this.$el.find("input[name=display_name]").val(),
                    email: this.$el.find("input[name=email]").val(),
                    password: this.getPassword()
                }), this.model.isValid() ? (this.disableForm(), void this.model.register({
                    gRecaptchaResponse: this.captchaShown && window.grecaptcha && window.grecaptcha.getResponse(),
                    error: a.bind(this.handleRegistrationErrorResponse, this),
                    success: a.bind(this.handleRegistrationSuccess, this)
                }).always(a.bind(this.enableForm, this))) : void this.handleRegistrationError(this.model.validationError)
            }
        });
    return e
}), define("templates/lounge/partials/audienceSync", ["react", "core/config/urls", "core/strings"], function(a, b, c) {
    "use strict";
    var d = c.gettext,
        e = function(c) {
            return a.createElement("div", {
                className: "audiencesync"
            }, a.createElement("h6", null, d("Connect with %(forumName)s", {
                forumName: c.forumName
            })), a.createElement("div", {
                className: "services"
            }, a.createElement("div", {
                className: "audiencesync__icons"
            }, a.createElement("img", {
                className: "icon",
                alt: "Disqus",
                src: "https://c.disquscdn.com/next/embed/assets/img/audiencesync/sync-icon.74333606cf6b545eb92a69a61b112481.png"
            }), a.createElement("i", {
                className: "icon icon-proceed"
            }), a.createElement("img", {
                className: "icon",
                alt: c.forumName,
                src: (b.root || "") + "/api/applications/icons/" + (c.apiKey || "") + ".png"
            })), a.createElement("p", null, d("%(forumName)s needs permission to access your account.", {
                forumName: c.forumName
            }))), a.createElement("button", {
                type: "button",
                "data-action": "audiencesync",
                className: "proceed btn submit"
            }, d("Next")))
        };
    return e
}), define("templates/lounge/partials/guestForm", ["react", "core/strings", "core/utils/object/get"], function(a, b, c) {
    "use strict";
    var d = b.gettext,
        e = function() {
            return a.createElement("div", {
                className: "acceptance-wrapper"
            }, a.createElement("p", null, a.createElement("label", null, a.createElement("input", {
                type: "checkbox",
                name: "tos"
            }), a.createElement("span", {
                className: "spacing-left-small"
            }, d("I agree to Disqus' %(terms)s", {
                terms: a.createElement("a", {
                    href: "https://help.disqus.com/customer/portal/articles/466260-terms-of-service",
                    target: "_blank",
                    rel: "noopener noreferrer"
                }, d("Terms of Service"))
            })))), a.createElement("p", null, a.createElement("label", null, a.createElement("input", {
                type: "checkbox",
                name: "privacy-policy"
            }), a.createElement("span", {
                className: "spacing-left-small"
            }, d("I agree to Disqus' processing of email and IP address, and the use of cookies, to facilitate my authentication and posting of comments, explained further in the %(policy)s", {
                policy: a.createElement("a", {
                    href: "https://help.disqus.com/customer/portal/articles/466259-privacy-policy",
                    target: "_blank",
                    rel: "noopener noreferrer"
                }, d("Privacy Policy"))
            })))), a.createElement("p", null, a.createElement("label", null, a.createElement("input", {
                type: "checkbox",
                name: "data-sharing"
            }), a.createElement("span", {
                className: "spacing-left-small"
            }, d("I agree to additional processing of my information, including first and third party cookies, for personalized content and advertising as outlined in our %(policy)s", {
                policy: a.createElement("a", {
                    href: "https://disqus.com/data-sharing-settings/"
                }, d("Data Sharing Policy"))
            })))))
        },
        f = function(b) {
            return a.createElement("div", {
                className: "guest"
            }, a.createElement("h6", {
                className: "guest-form-title"
            }, a.createElement("span", {
                className: "register-text"
            }, " ", d("or sign up with Disqus"), " "), a.createElement("span", {
                className: "guest-text"
            }, " ", d("or pick a name"), " ")), " ", a.createElement("button", {
                type: "button",
                className: "help-tooltip__wrapper help-icon",
                name: "guest_tooltip",
                tabIndex: 0
            }, a.createElement("div", {
                id: "rules",
                className: "help-tooltip__container",
                "data-role": "guest-form-tooltip"
            }, a.createElement("div", {
                className: "tooltip show help-tooltip"
            }, a.createElement("h3", {
                className: "help-tooltip__heading"
            }, d("Disqus is a discussion network")), a.createElement("ul", {
                className: "help-tooltip__list"
            }, a.createElement("li", null, a.createElement("span", null, d("Don't be a jerk or do anything illegal. Everything is easier that way.")))), a.createElement("p", {
                className: "clearfix"
            }, a.createElement("a", {
                href: "https://docs.disqus.com/kb/terms-and-policies/",
                className: "btn btn-small help-tooltip__button",
                rel: "noopener noreferrer",
                target: "_blank"
            }, d("Read full terms and conditions")))))), a.createElement("p", {
                className: "input-wrapper"
            }, a.createElement("input", {
                dir: "auto",
                type: "text",
                placeholder: d("Name"),
                name: "display_name",
                id: (b.cid || "") + "_display_name",
                maxLength: "30",
                className: "input--text",
                "aria-label": "name"
            })), a.createElement("div", {
                className: "guest-details " + (c(b.sso, ["url"]) ? "expanded" : ""),
                "data-role": "guest-details"
            }, a.createElement("p", {
                className: "input-wrapper"
            }, a.createElement("input", {
                dir: "auto",
                type: "email",
                placeholder: d("Email"),
                name: "email",
                id: (b.cid || "") + "_email",
                className: "input--text",
                "aria-label": "email"
            })), a.createElement("p", {
                className: "input-wrapper"
            }, a.createElement("input", {
                dir: "auto",
                disabled: !c(b.sso, ["url"]),
                type: c(b.sso, ["url"]) ? "password" : "text",
                className: "register-text input--text",
                placeholder: d("Password"),
                name: "password",
                "aria-label": "password",
                id: (b.cid || "") + "_password"
            })), b.isPrivate ? a.createElement(e, null) : a.createElement("p", null, a.createElement("label", null, a.createElement("span", null, d("Please access our %(policy)s to learn what personal data Disqus collects and your choices about how it is used.  All users of our service are also subject to our %(terms)s.", {
                policy: a.createElement("a", {
                    href: "https://help.disqus.com/customer/portal/articles/466259-privacy-policy",
                    target: "_blank",
                    rel: "noopener noreferrer"
                }, d("Privacy Policy")),
                terms: a.createElement("a", {
                    href: "https://help.disqus.com/customer/portal/articles/466260-terms-of-service",
                    target: "_blank",
                    rel: "noopener noreferrer"
                }, d("Terms of Service"))
            })))), b.allowAnonPost ? a.createElement("div", {
                className: "guest-checkbox"
            }, a.createElement("label", null, a.createElement("input", {
                type: "checkbox",
                name: "author-guest"
            }), " ", d("I'd rather post as a guest"))) : a.createElement("input", {
                type: "checkbox",
                name: "author-guest",
                style: {
                    display: "none"
                }
            }), a.createElement("div", {
                className: "g-recaptcha",
                "data-role": "grecaptcha-container"
            }), a.createElement("div", {
                className: "proceed",
                "data-role": "submit-btn-container"
            }, b.allowAnonPost ? a.createElement("div", null, a.createElement("button", {
                type: "submit",
                className: "proceed__button btn submit",
                "aria-label": d("Post")
            }, a.createElement("span", {
                className: "icon-proceed"
            }), a.createElement("div", {
                className: "spinner"
            })), a.createElement("button", {
                type: "submit",
                className: "proceed__button btn next",
                "aria-label": d("Next")
            }, a.createElement("span", {
                className: "icon-proceed"
            }), a.createElement("div", {
                className: "spinner"
            }))) : a.createElement("button", {
                type: "submit",
                className: "proceed__button btn submit",
                "aria-label": d("Next")
            }, a.createElement("span", {
                className: "icon-proceed"
            }), a.createElement("div", {
                className: "spinner"
            })))))
        };
    return f
}), define("templates/lounge/partials/loginButtons", ["react", "core/utils/object/get"], function(a, b) {
    "use strict";
    var c = function(c) {
        return a.createElement("ul", {
            "data-role": "login-menu",
            className: "services login-buttons"
        }, b(c.sso, ["url"]) ? a.createElement("li", {
            className: "sso"
        }, a.createElement("button", {
            type: "button",
            "data-action": "auth:sso",
            title: b(c.sso, ["name"], ""),
            className: "sso__button " + (b(c.sso, ["button"]) ? "image" : "no-image")
        }, b(c.sso, ["button"]) ? a.createElement("img", {
            alt: b(c.sso, ["name"], ""),
            src: b(c.sso, ["button"], "")
        }) : b(c.sso, ["name"], null))) : null, a.createElement("li", {
            className: "auth-disqus"
        }, a.createElement("button", {
            type: "button",
            "data-action": "auth:disqus",
            title: "Disqus",
            className: "connect__button"
        }, a.createElement("i", {
            className: "icon-disqus"
        }))), a.createElement("li", {
            className: "auth-facebook"
        }, a.createElement("button", {
            type: "button",
            "data-action": "auth:facebook",
            title: "Facebook",
            className: "connect__button"
        }, a.createElement("i", {
            className: "icon-facebook-circle"
        }))), a.createElement("li", {
            className: "auth-twitter"
        }, a.createElement("button", {
            type: "button",
            "data-action": "auth:twitter",
            title: "Twitter",
            className: "connect__button"
        }, a.createElement("i", {
            className: "icon-twitter-circle"
        }))), a.createElement("li", {
            className: "auth-google"
        }, a.createElement("button", {
            type: "button",
            "data-action": "auth:google",
            title: "Google",
            className: "connect__button"
        }, a.createElement("i", {
            className: "icon-google-plus-circle"
        }))))
    };
    return c
}), define("templates/lounge/loginForm", ["react", "core/strings", "core/utils/object/get", "templates/lounge/partials/audienceSync", "templates/lounge/partials/guestForm", "templates/lounge/partials/loginButtons"], function(a, b, c, d, e, f) {
    "use strict";
    var g = b.gettext,
        h = function(b) {
            return a.createElement("div", null, c(b.user, ["isAnonymous"]) ? a.createElement("section", {
                className: "auth-section logged-out__display"
            }, a.createElement("div", {
                className: "connect"
            }, a.createElement("h6", null, g("Log in with")), a.createElement(f, {
                sso: b.sso
            })), a.createElement(e, {
                cid: b.cid,
                sso: b.sso,
                allowAnonPost: b.allowAnonPost,
                isPrivate: b.isPrivate,
                captcha_site_key: b.captcha_site_key
            })) : null, b.audienceSyncRequired ? a.createElement("section", {
                className: "auth-section"
            }, a.createElement(d, {
                apiKey: b.apiKey,
                forumName: b.forumName
            })) : null)
        };
    return h
}), define("lounge/views/posts/LoginFormView", ["underscore", "jquery", "remote/config", "core/bus", "core/api", "core/views/common/LoginFormView", "common/models", "lounge/common", "templates/lounge/loginForm"], function(a, b, c, d, e, f, g, h, i) {
    "use strict";
    var j = f.extend({
        events: {
            "click input[name=author-guest]": "updateLoginForm",
            "focusin input[name=display_name]": "expandGuestForm",
            "change input[name=tos], input[name=privacy-policy]": "updateEnabled",
            "keyup input[name=display_name]": "showCaptcha",
            "click button[name=guest_tooltip]": "toggleGuestFormTooltip"
        },
        User: g.User,
        initialize: function(b) {
            f.prototype.initialize.call(this, b), this.thread = b.thread, this.session = b.session, this.alert = b.alert, this.config = a.property("config")(h.getLounge()) || {}
        },
        expandGuestForm: function() {
            this.$("[data-role=guest-details]").hasClass("expanded") || (this.$("[data-role=guest-details]").addClass("expanded"), this.$("input[name=password]").attr("type", "password").removeAttr("disabled"), this.$("[name=display_name]").focus())
        },
        retractGuestForm: function() {
            this.$("[data-role=guest-details]").hasClass("expanded") && this.$("[data-role=guest-details]").removeClass("expanded")
        },
        toggleGuestFormTooltip: function() {
            this.$("[data-role=guest-form-tooltip]").hasClass("expanded") ? this.$("[data-role=guest-form-tooltip]").removeClass("expanded") : this.$("[data-role=guest-form-tooltip]").addClass("expanded")
        },
        showCaptcha: function(d, e) {
            !this.captchaShown && this.$("input[name=display_name]").val().trim().length && (c.register.ENABLE_CAPTCHA || e) && (window.onCaptchaChange = a.bind(this.updateEnabled, this), window.onCaptchaLoad = a.bind(function() {
                window.grecaptcha && (this.captchaId = window.grecaptcha.render(this.$("[data-role=grecaptcha-container]")[0], {
                    sitekey: "6Lfx6u0SAAAAAI1QkeTW397iQv1MsBfbDaYlwxK_",
                    callback: "onCaptchaChange",
                    "expired-callback": "onCaptchaChange"
                }), a.delay(function() {
                    b('iframe[title|="recaptcha challenge"]').parent().parent().addClass("recaptcha-challenge-container")
                }, 1e3))
            }, this), b("<script>").attr("src", "https://www.google.com/recaptcha/api.js?onload=onCaptchaLoad&render=explicit").appendTo(b("head")), this.captchaShown = !0)
        },
        shouldRegisterUser: function() {
            return this.session.isLoggedOut() && !this.$("input[name=author-guest]").is(":checked")
        },
        render: function() {
            return this.$el.html(i({
                user: this.session.toJSON(),
                forumName: this.thread.forum.get("name"),
                audienceSyncRequired: this.session.needsAudienceSyncAuth(this.thread.forum),
                allowAnonPost: this.thread.forum.get("settings").allowAnonPost,
                apiKey: this.config.apiKey || "",
                sso: this.session.get("sso"),
                cid: this.cid,
                isPrivate: Boolean(this.config.isPrivate)
            })), this.updateEnabled(), this
        },
        updateEnabled: function() {
            this.$("button[type=submit]").attr("disabled", Boolean(this.config.isPrivate) && (!this.$("input[name=tos]").prop("checked") || !this.$("input[name=privacy-policy]").prop("checked")) || Boolean(this.captchaShown && window.grecaptcha && !window.grecaptcha.getResponse(this.captchaId)))
        },
        handleRegistrationSuccess: function() {
            var a = this.$("input[name=data-sharing]");
            a.length && e.call("internal/users/setDNT", {
                method: "POST",
                data: {
                    value: a.prop("checked") ? 0 : 1
                }
            }), this.session.setUser(this.model), d.frame.trigger("onboardAlert.show"), this.retractGuestForm()
        },
        handleRegistrationError: function(b) {
            var c = this;
            c.clearRegistrationErrors(), a.isString(b) && (b = {
                all: [b]
            }), a.has(b, "all") && (c.alert && c.alert(b.all[0], {
                type: "error"
            }), b = a.omit(b, "all")), a.each(b, function(a, b) {
                var d = c.$("input[name=" + b + "]");
                d.attr("aria-invalid", "true").after('<label for="' + d.attr("id") + '" class="input-label">' + a[0] + "</label>").parent(".input-wrapper").addClass("has-error")
            }), c.$("[aria-invalid]").first().focus()
        },
        updateLoginForm: function() {
            var a = this.$el,
                b = a.find("input[name=author-guest]").is(":checked"),
                c = a.find(".guest"),
                d = a.find("input[name=password]");
            d.val(""), c.toggleClass("is-guest", b), this.clearRegistrationErrors()
        },
        clearRegistrationErrors: function() {
            this.$(".input-wrapper.has-error").removeClass("has-error").find(".input-label").remove(), this.$("[aria-invalid]").removeAttr("aria-invalid")
        }
    });
    return j
});
var _extends = Object.assign || function(a) {
    for (var b = 1; b < arguments.length; b++) {
        var c = arguments[b];
        for (var d in c) Object.prototype.hasOwnProperty.call(c, d) && (a[d] = c[d])
    }
    return a
};
define("templates/lounge/partials/profileLink", ["react", "core/switches", "core/utils/object/get"], function(a, b, c) {
    "use strict";
    var d = function(d) {
        var e = d.children,
            f = d.user,
            g = d.forumId,
            h = d.profileTab,
            i = _objectWithoutProperties(d, ["children", "user", "forumId", "profileTab"]),
            j = c(f, ["isSSOProfileUrl"]);
        if (!j && b.isFeatureActive("sso_less_branding", {
                forum: g
            })) return a.createElement("span", i, e);
        var k = c(f, ["profileUrl"], ""),
            l = "profile";
        return j ? l = null : k && h && (k = "" + k + h), a.createElement("a", _extends({
            href: k,
            "data-action": l,
            "data-tab": h || "",
            "data-username": c(f, ["username"], ""),
            target: "_blank",
            rel: "noopener noreferrer"
        }, i), e)
    };
    return d
}), define("templates/lounge/partials/userAvatar", ["react", "core/strings", "core/utils/object/get", "templates/lounge/partials/profileLink"], function(a, b, c, d) {
    "use strict";
    var e = b.gettext,
        f = function(b) {
            var f = b.defaultAvatarUrl,
                g = b.forum,
                h = b.user,
                i = void 0;
            if (void 0 === h.avatar.isCustom || h.avatar.isCustom === !0) i = c(h, ["avatar", "cache"], "");
            else {
                var j = c(g, ["avatar", "large", "cache"], "");
                i = j ? j : f
            }
            return a.createElement(d, {
                user: h,
                forumId: g.id,
                className: "user"
            }, a.createElement("img", {
                "data-role": "user-avatar",
                "data-user": c(h, ["id"], ""),
                src: f || i,
                "data-src": f ? i : null,
                alt: e("Avatar")
            }))
        };
    return f
}), define("templates/lounge/form", ["react", "core/strings", "core/utils/object/get", "templates/lounge/partials/userAvatar"], function(a, b, c, d) {
    "use strict";
    var e = b.gettext,
        f = function(b) {
            return a.createElement("div", {
                className: "postbox"
            }, a.createElement("div", {
                role: "alert"
            }), a.createElement("div", {
                className: "ratings-wrapper",
                "data-role": "ratings-container"
            }), a.createElement("div", {
                className: "compose-wrapper"
            }, a.createElement("div", {
                className: "avatar"
            }, c(b.user, ["isRegistered"]) ? a.createElement(d, {
                forum: b.forum,
                user: b.user
            }) : a.createElement("span", {
                className: "user"
            }, a.createElement("img", {
                "data-role": "user-avatar",
                src: c(b.forum, ["avatar", "large", "cache"], ""),
                alt: e("Avatar")
            }))), a.createElement("div", {
                className: "textarea-outer-wrapper"
            }, a.createElement("div", {
                className: "textarea-wrapper",
                "data-role": "textarea",
                dir: "auto"
            }, a.createElement("div", {
                "data-role": "drag-drop-placeholder",
                className: "media-drag-hover",
                style: {
                    display: "none"
                }
            }, a.createElement("div", {
                className: "drag-text"
            }, "⬇ ", e("Drag and drop your images here to upload them."))), b.displayMediaPreviews ? a.createElement("div", {
                className: "media-preview empty",
                "data-role": "media-preview"
            }) : null, a.createElement("div", {
                className: "edit-alert",
                role: "postbox-alert"
            }), a.createElement("div", {
                className: "text-editor-container"
            })))), a.createElement("div", {
                "data-role": "login-form"
            }))
        };
    return f
}), define("templates/lounge/textEditor", ["react", "core/constants/textEditorConstants", "core/strings", "core/utils/object/get"], function(a, b, c, d) {
    "use strict";
    var e = c.gettext,
        f = function(b) {
            return a.createElement("div", {
                className: "temp-post"
            }, a.createElement("button", {
                className: "btn post-action__button full-size-button" + (d(b.user, ["isRegistered"]) && !b.useSmallPostButton ? "" : " hidden")
            }, e("Post as %(name)s", {
                name: a.createElement("span", {
                    "data-username": d(b.user, ["username"], ""),
                    "data-role": "username"
                }, d(b.user, ["name"], null))
            })), a.createElement("button", {
                className: "btn post-action__button small-size-button" + (d(b.user, ["isRegistered"]) && b.useSmallPostButton ? "" : " hidden")
            }, e("Post")))
        },
        g = function(b) {
            return a.createElement("div", {
                className: "logged-in"
            }, a.createElement("section", null, b.edit ? a.createElement("div", {
                className: "temp-post"
            }, a.createElement("button", {
                className: "btn post-action__button edit-button",
                type: "submit"
            }, e("Save Edit")), a.createElement("a", {
                className: "cancel post-action__cancel",
                href: "#",
                "data-action": "edit"
            }, e("Cancel"))) : a.createElement(f, b)))
        },
        h = function(c) {
            return a.createElement("div", {
                className: "wysiwyg"
            }, c.buttonsToShow.indexOf(b.GIF_PICKER_BUTTON) > -1 ? a.createElement("div", {
                className: "gif-picker"
            }, a.createElement("div", {
                className: "wysiwyg__item",
                "data-role": "gif-picker-toggle",
                title: e("GIF")
            }, a.createElement("div", {
                className: "wysiwyg__gif",
                title: e("GIF"),
                role: "img",
                "aria-label": "GIF"
            })), a.createElement("div", {
                className: "hidden gif-picker__popout-container",
                "data-role": "gif-picker-popout-container"
            }), a.createElement("div", {
                className: "new-feature-badge-star",
                title: e("New")
            }, a.createElement("div", {
                className: "wysiwyg__star-badge wysiwyg__star-badge-dims"
            }))) : null, c.buttonsToShow.indexOf(b.MEDIA_UPLOADER_BUTTON) > -1 ? a.createElement("div", {
                className: "media-uploader"
            }, a.createElement("li", {
                className: "wysiwyg__item",
                "data-role": "media-uploader"
            })) : null, (c.buttonsToShow.indexOf(b.GIF_PICKER_BUTTON) > -1 || c.buttonsToShow.indexOf(b.MEDIA_UPLOADER_BUTTON) > -1) && c.buttonsToShow.length > 1 ? a.createElement("div", {
                className: "vertical-separator"
            }) : null, a.createElement("div", {
                "data-action": "text-editor-buttons"
            }, a.createElement("div", {
                className: "wysiwyg__item" + (c.buttonsToShow.indexOf("b") > -1 ? "" : " hidden"),
                "data-action": "text-editor-tag",
                "data-tag": "b"
            }, a.createElement("div", {
                className: "wysiwyg__bold",
                title: e("Bold"),
                role: "img",
                "aria-label": "B"
            })), a.createElement("div", {
                className: "wysiwyg__item" + (c.buttonsToShow.indexOf("i") > -1 ? "" : " hidden"),
                "data-action": "text-editor-tag",
                "data-tag": "i"
            }, a.createElement("div", {
                className: "wysiwyg__italic",
                title: e("Italic"),
                role: "img",
                "aria-label": "I"
            })), a.createElement("div", {
                className: "wysiwyg__item" + (c.buttonsToShow.indexOf("u") > -1 ? "" : " hidden"),
                "data-action": "text-editor-tag",
                "data-tag": "u"
            }, a.createElement("div", {
                className: "wysiwyg__underline",
                title: e("Underline"),
                role: "img",
                "aria-label": "U"
            })), a.createElement("div", {
                className: "wysiwyg__item" + (c.buttonsToShow.indexOf("s") > -1 ? "" : " hidden"),
                "data-action": "text-editor-tag",
                "data-tag": "s"
            }, a.createElement("div", {
                className: "wysiwyg__strikethrough",
                title: e("Strikethrough"),
                role: "img",
                "aria-label": "S"
            })), a.createElement("div", {
                className: "wysiwyg__item" + (c.buttonsToShow.indexOf("a") > -1 ? "" : " hidden"),
                "data-action": "text-editor-tag",
                "data-tag": "a"
            }, a.createElement("div", {
                className: "wysiwyg__link",
                title: e("Link"),
                role: "img",
                "aria-label": "L"
            })), a.createElement("div", {
                className: "wysiwyg__item" + (c.buttonsToShow.indexOf("spoiler") > -1 ? "" : " hidden"),
                "data-action": "text-editor-tag",
                "data-tag": "spoiler"
            }, a.createElement("div", {
                className: "wysiwyg__spoiler",
                title: e("Spoiler"),
                role: "img",
                "aria-label": "Sp"
            })), a.createElement("div", {
                className: "wysiwyg__item" + (c.buttonsToShow.indexOf("code") > -1 ? "" : " hidden"),
                "data-action": "text-editor-tag",
                "data-tag": "code"
            }, a.createElement("div", {
                className: "wysiwyg__code",
                title: e("Code"),
                role: "img",
                "aria-label": "C"
            })), a.createElement("div", {
                className: "wysiwyg__item" + (c.buttonsToShow.indexOf("blockquote") > -1 ? "" : " hidden"),
                "data-action": "text-editor-tag",
                "data-tag": "blockquote"
            }, a.createElement("div", {
                className: "wysiwyg__blockquote",
                title: e("Quote"),
                role: "img",
                "aria-label": "Q"
            }))))
        },
        i = function(b) {
            return a.createElement("div", {
                className: "post-actions"
            }, a.createElement(h, b), a.createElement(g, b))
        };
    return i
}), define("templates/lounge/blacklistErrorMessage", ["react", "core/strings"], function(a, b) {
    "use strict";
    var c = b.gettext,
        d = function(b) {
            return [b.expirationRelative ? c("We are unable to post your comment because %(blocker)s has placed your account in a timeout. You will be able to comment again when your timeout expires %(expirationRelative)s.", {
                blocker: b.blocker,
                expirationRelative: b.expirationRelative
            }) : c("We are unable to post your comment because you have been banned by %(blocker)s.", {
                blocker: b.blocker
            }), " ", a.createElement("a", {
                key: "error-link",
                target: "_blank",
                href: "https://help.disqus.com/customer/portal/articles/466223-who-deleted-or-removed-my-comment-"
            }, c("Find out more."))]
        };
    return d
}), define("templates/lounge/emailVerifyAlert", ["react", "core/strings", "core/utils/object/get"], function(a, b, c) {
    "use strict";
    var d = b.gettext,
        e = function(b) {
            return [d("%(forumName)s requires you to verify your email address before posting.", {
                forumName: b.forumName
            }), " ", a.createElement("a", {
                key: "alert-link",
                "data-action": "verify-email",
                "data-forum": b.forumId,
                title: d("Verify Email"),
                href: "/verify"
            }, d("Send verification email to %(email)s", {
                email: c(b.user, ["email"], "")
            }))]
        };
    return e
}), define("lounge/views/posts/PostReplyView", ["jquery", "underscore", "react", "react-dom/server", "core/utils", "core/bus", "core/switches", "core/views/PostReplyView", "common/models", "lounge/mixins/asGifPicker", "lounge/mixins/asTextEditor", "lounge/mixins/withStarRatings", "lounge/mixins/post-reply", "lounge/common", "lounge/views/posts/ContentEditableView", "lounge/views/posts/LoginFormView", "templates/lounge/form", "templates/lounge/textEditor", "templates/lounge/blacklistErrorMessage", "templates/lounge/emailVerifyAlert"], function(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t) {
    "use strict";
    var u = e.preventDefaultHandler,
        v = h,
        w = v.prototype,
        x = v.extend({
            initialize: function(a) {
                w.initialize.call(this, a), this.listenTo(this.session, "change:audienceSyncVerified", this.redraw), this.userSuggestions = a.userSuggestions, this.loginFormView = new p({
                    thread: this.thread,
                    session: this.session,
                    alert: b.bind(this.alert, this)
                });
                var e = n.getLounge();
                b.each(["uiCallback:postCreated", "domReflow"], function(a) {
                    this.listenTo(this, a, b.bind(e.trigger, e, a))
                }, this), this.template = q, this.textEditorTemplate = r, this.blacklistErrorMessageTemplate = function(a) {
                    return d.renderToStaticMarkup(c.createElement(s, a))
                }, this.emailVerifyAlertTemplate = function(a) {
                    return d.renderToStaticMarkup(c.createElement(t, a))
                }, this.postEditMode = !1
            },
            getTemplateData: function() {
                var a = w.getTemplateData.call(this);
                return a.audienceSyncRequired = this.session.needsAudienceSyncAuth(this.thread.forum), a.forum = this.thread.forum.toJSON(), a
            },
            render: function() {
                return this.loginFormView.$el.detach(), w.render.call(this), this.loginFormView.render(), this.loginFormView.$el.appendTo(this.$("[data-role=login-form]")), this.session.user.id ? this.$el.addClass("authenticated") : this.$el.removeClass("authenticated"), this
            },
            createTextarea: function() {
                var a = {
                    placeholder: this.getPlaceholderText(),
                    storageKey: this.post.storageKey()
                };
                return this.constructor.canUseContentEditable ? (a.userSuggestions = this.userSuggestions, new this.constructor.ContentEditableView(a)) : new this.constructor.TextareaView(a)
            },
            getPostParams: function() {
                var b = a.Deferred(),
                    c = w.getPostParams.call(this);
                return g.isFeatureActive("before_comment_callback", {
                    forum: this.thread.forum.id
                }) ? (f.frame.sendHostMessage("posts.beforeCreate", {
                    raw_message: c.raw_message
                }), this.listenToOnce(f.frame, "posts.beforeCreate.response", function(a) {
                    a && (c.raw_message = a), b.resolve(c)
                })) : b.resolve(c), b.promise()
            },
            getAuthorParams: function() {
                return this.session.isLoggedIn() ? {
                    author_id: this.session.user.id
                } : {
                    author_name: this.loginFormView.getDisplayName(),
                    author_email: this.loginFormView.getEmail()
                }
            },
            initiatePost: function() {
                var a = b.bind(this.createPost, this);
                this.getPostParams().done(a)
            },
            shouldAbortCreatePost: function(a, c) {
                return this.constructor.mustVerifyEmailToPost(this.session.user, this.thread.forum) ? (this.session.fetch().always(b.bind(function() {
                    this.constructor.mustVerifyEmailToPost(this.session.user, this.thread.forum) ? this._alertMustVerify(!0) : this.createPost(c)
                }, this)), !0) : w.shouldAbortCreatePost.call(this, a, c)
            },
            _onCreateError: function(a, b) {
                w._onCreateError.call(this, a, b), this.thread.incrementPostCount(-1)
            },
            _onCreateSync: function(a, b) {
                w._onCreateSync.call(this, a, b), this.thread.posts.saveToCache(b)
            },
            addPostToThread: function(a) {
                this.thread.incrementPostCount(1), this.thread.posts.add(a)
            },
            remove: function() {
                return this.loginFormView && (this.loginFormView.remove(), this.loginFormView = null), w.remove.call(this)
            },
            submitForm: u(function() {
                return this.dismissAlert(), this.loginFormView.shouldRegisterUser() ? void this.loginFormView.registerUser() : this.initiatePost()
            })
        }, {
            ContentEditableView: o,
            User: i.User,
            Post: i.Post
        });
    return m.asRealtimeTyping(x.prototype), l.call(x.prototype), k.call(x.prototype), j.call(x.prototype), x
}), define("core/constants/badgesConstants", ["exports"], function(a) {
    "use strict";
    a.ACTION_TYPES = {
        AWARD: "award",
        REMOVE: "remove"
    }, a.BADGES_CRITERIA = {
        MANUAL: "MANUAL",
        COMMENTS: "COMMENTS",
        FEATURED_COMMENTS: "FEATURED_COMMENTS",
        COMMENT_UPVOTES: "COMMENT_UPVOTES"
    }, a.MAX_BADGE_COUNT = 8
}), define("core/models/RichMediaViewModel", ["backbone"], function(a) {
    "use strict";
    return a.Model.extend({
        defaults: {
            deferred: !0,
            showButtons: !0,
            activated: !1,
            kind: "image",
            deferredHeight: 0,
            providerExpandMessage: "",
            providerCollapseMessage: "",
            providerIcon: "icon-proceed",
            respectSettings: !0
        }
    })
}), define("core/templates/postMediaInlineLink", ["handlebars", "core/templates/handlebars.partials", "core/extensions/handlebars.helpers"], function(a) {
    return a.template({
        1: function(a, b, c, d, e) {
            var f, g = a.lookupProperty || function(a, b) {
                if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
            };
            return null != (f = g(c, "if").call(null != b ? b : a.nullContext || {}, null != b ? g(b, "hasUserText") : b, {
                name: "if",
                hash: {},
                fn: a.program(2, e, 0),
                inverse: a.noop,
                data: e,
                loc: {
                    start: {
                        line: 2,
                        column: 0
                    },
                    end: {
                        line: 5,
                        column: 7
                    }
                }
            })) ? f : ""
        },
        2: function(a, b, c, d, e) {
            var f = a.lambda,
                g = a.escapeExpression,
                h = a.lookupProperty || function(a, b) {
                    if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
                };
            return '<a href="' + g(f(null != b ? h(b, "href") : b, b)) + '" rel="nofollow">' + g(f(null != b ? h(b, "text") : b, b)) + "</a>\n"
        },
        4: function(a, b, c, d, e) {
            var f, g = a.lambda,
                h = a.escapeExpression,
                i = null != b ? b : a.nullContext || {},
                j = a.lookupProperty || function(a, b) {
                    if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
                };
            return '<a href="' + h(g(null != b ? j(b, "href") : b, b)) + '" class="post-media-link" data-action="expand-collapse-media" rel="nofollow">' + (null != (f = j(c, "if").call(i, null != (f = null != b ? j(b, "model") : b) ? j(f, "providerIcon") : f, {
                name: "if",
                hash: {},
                fn: a.program(5, e, 0),
                inverse: a.noop,
                data: e,
                loc: {
                    start: {
                        line: 10,
                        column: 3
                    },
                    end: {
                        line: 10,
                        column: 74
                    }
                }
            })) ? f : "") + h(g(null != b ? j(b, "mediaLinkText") : b, b)) + (null != (f = j(c, "if").call(i, null != b ? j(b, "domain") : b, {
                name: "if",
                hash: {},
                fn: a.program(7, e, 0),
                inverse: a.noop,
                data: e,
                loc: {
                    start: {
                        line: 14,
                        column: 3
                    },
                    end: {
                        line: 14,
                        column: 87
                    }
                }
            })) ? f : "") + "</a>\n"
        },
        5: function(a, b, c, d, e) {
            var f, g = a.lookupProperty || function(a, b) {
                if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
            };
            return '<i class="' + a.escapeExpression(a.lambda(null != (f = null != b ? g(b, "model") : b) ? g(f, "providerIcon") : f, b)) + '"></i>'
        },
        7: function(a, b, c, d, e) {
            var f = a.lookupProperty || function(a, b) {
                if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
            };
            return '<span class="post-media-link-domain"> &mdash; ' + a.escapeExpression(a.lambda(null != b ? f(b, "domain") : b, b)) + "</span>"
        },
        compiler: [8, ">= 4.3.0"],
        main: function(a, b, c, d, e) {
            var f, g = a.lookupProperty || function(a, b) {
                if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
            };
            return null != (f = g(c, "if").call(null != b ? b : a.nullContext || {}, null != (f = null != b ? g(b, "model") : b) ? g(f, "deferred") : f, {
                name: "if",
                hash: {},
                fn: a.program(1, e, 0),
                inverse: a.program(4, e, 0),
                data: e,
                loc: {
                    start: {
                        line: 1,
                        column: 0
                    },
                    end: {
                        line: 16,
                        column: 7
                    }
                }
            })) ? f : ""
        },
        useData: !0
    })
}), define("core/views/RichMediaLinkView", ["backbone", "core/utils", "core/templates/postMediaInlineLink"], function(a, b, c) {
    "use strict";
    return a.View.extend({
        tagName: "span",
        events: {
            "click [data-action=expand-collapse-media]": "handleToggle"
        },
        initialize: function(a) {
            this.media = a.media;
            var c = a.$link;
            this.linkText = c.text(), this.linkHref = c.attr("href"), this.linkDomain = b.getDomain(this.linkHref), this.linkHasUserText = this.isUserText(c), this.hasGenericMessage = !1, this.linkHasUserText ? this.mediaLinkText = this.linkText : this.media.get("title") ? this.mediaLinkText = b.niceTruncate(this.media.get("title"), 60) : (this.hasGenericMessage = !0, this.mediaLinkText = this.model.get("providerExpandMessage")), this.listenTo(this.model, "change:deferred", this.render), this.listenTo(this.model, "change:activated", this.onChangeActivated)
        },
        isUserText: function(a) {
            if ("A" !== a[0].nodeName) return !1;
            var b = (a.text() || "").toLowerCase();
            if (!b) return !1;
            if (0 === b.indexOf("http") || 0 === b.indexOf("www")) return !1;
            b = b.replace(/\.\.\.$/, "");
            var c = (a.attr("href") || "").toLowerCase();
            return c.indexOf(b) === -1
        },
        render: function() {
            var a = this.mediaLinkText;
            return this.hasGenericMessage && this.model.get("activated") && (a = this.model.get("providerCollapseMessage")), this.$el.html(c({
                model: this.model.toJSON(),
                text: this.linkText,
                href: this.linkHref,
                mediaLinkText: a,
                domain: this.linkDomain,
                hasUserText: this.linkHasUserText
            })), this
        },
        onChangeActivated: function() {
            this.hasGenericMessage && this.render()
        },
        handleToggle: function(a) {
            this.model.get("deferred") || (this.model.set("activated", !this.model.get("activated")), a && a.preventDefault && a.preventDefault())
        }
    })
}), define("core/templates/postMedia", ["handlebars", "core/templates/handlebars.partials", "core/extensions/handlebars.helpers"], function(a) {
    return a.template({
        1: function(a, b, c, d, e) {
            var f, g = a.lookupProperty || function(a, b) {
                if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
            };
            return (null != (f = g(c, "if").call(null != b ? b : a.nullContext || {}, null != (f = null != b ? g(b, "media") : b) ? g(f, "providerName") : f, {
                name: "if",
                hash: {},
                fn: a.program(2, e, 0),
                inverse: a.noop,
                data: e,
                loc: {
                    start: {
                        line: 5,
                        column: 26
                    },
                    end: {
                        line: 5,
                        column: 90
                    }
                }
            })) ? f : "") + a.escapeExpression(a.lambda(null != (f = null != b ? g(b, "media") : b) ? g(f, "title") : f, b))
        },
        2: function(a, b, c, d, e) {
            var f, g = a.lookupProperty || function(a, b) {
                if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
            };
            return a.escapeExpression(a.lambda(null != (f = null != b ? g(b, "media") : b) ? g(f, "providerName") : f, b)) + " &ndash; "
        },
        4: function(a, b, c, d, e) {
            var f, g = a.lookupProperty || function(a, b) {
                if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
            };
            return '<i class="' + a.escapeExpression(a.lambda(null != (f = null != b ? g(b, "model") : b) ? g(f, "providerIcon") : f, b)) + ' publisher-background-color"></i>'
        },
        6: function(a, b, c, d, e) {
            return "media-video"
        },
        compiler: [8, ">= 4.3.0"],
        main: function(a, b, c, d, e) {
            var f, g = a.lambda,
                h = a.escapeExpression,
                i = null != b ? b : a.nullContext || {},
                j = a.lookupProperty || function(a, b) {
                    if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
                };
            return '\n<a class="media-button media-button-expand publisher-color publisher-border-color" href="' + h(g(null != (f = null != b ? j(b, "media") : b) ? j(f, "url") : f, b)) + '" rel="nofollow" target="_blank" data-action="expand"\ntitle="' + (null != (f = j(c, "if").call(i, null != (f = null != b ? j(b, "media") : b) ? j(f, "title") : f, {
                name: "if",
                hash: {},
                fn: a.program(1, e, 0),
                inverse: a.noop,
                data: e,
                loc: {
                    start: {
                        line: 5,
                        column: 7
                    },
                    end: {
                        line: 5,
                        column: 112
                    }
                }
            })) ? f : "") + '">\n' + (null != (f = j(c, "if").call(i, null != (f = null != b ? j(b, "model") : b) ? j(f, "providerIcon") : f, {
                name: "if",
                hash: {},
                fn: a.program(4, e, 0),
                inverse: a.noop,
                data: e,
                loc: {
                    start: {
                        line: 6,
                        column: 0
                    },
                    end: {
                        line: 6,
                        column: 98
                    }
                }
            })) ? f : "") + "\n" + h(g(null != (f = null != b ? j(b, "model") : b) ? j(f, "providerExpandMessage") : f, b)) + '\n</a>\n<a class="media-button media-button-contract publisher-color publisher-border-color" href="#" target="_blank" data-action="contract">\n<i class="icon-cancel publisher-background-color"></i> ' + h(g(null != (f = null != b ? j(b, "model") : b) ? j(f, "providerCollapseMessage") : f, b)) + '\n</a>\n<div class="media-content-loader" data-role="content-loader"></div>\n<div data-role="content-placeholder" class="media-content-placeholder media-' + h(g(null != (f = null != b ? j(b, "media") : b) ? j(f, "providerName") : f, b)) + " " + (null != (f = j(c, "if").call(i, null != b ? j(b, "isVideo") : b, {
                name: "if",
                hash: {},
                fn: a.program(6, e, 0),
                inverse: a.noop,
                data: e,
                loc: {
                    start: {
                        line: 15,
                        column: 99
                    },
                    end: {
                        line: 15,
                        column: 132
                    }
                }
            })) ? f : "") + '"></div>\n'
        },
        useData: !0
    })
}), define("core/templates/postMediaPlaceholder", ["handlebars", "core/templates/handlebars.partials", "core/extensions/handlebars.helpers"], function(a) {
    return a.template({
        compiler: [8, ">= 4.3.0"],
        main: function(a, b, c, d, e) {
            var f, g = a.lookupProperty || function(a, b) {
                if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
            };
            return '<a href="#" class="media-force-load" data-action="force-load"><i class="' + a.escapeExpression(a.lambda(null != (f = null != b ? g(b, "model") : b) ? g(f, "providerIcon") : f, b)) + '"></i></a>\n'
        },
        useData: !0
    })
}), define("core/constants/mediaTypeConstants", ["exports"], function(a) {
    "use strict";
    a.VIDEO_CODES = ["3", "9", "12", "14"]
}), define("core/views/RichMediaView", ["jquery", "underscore", "backbone", "core/utils", "core/mediaConfig", "core/views/RichMediaLinkView", "core/templates/postMedia", "core/templates/postMediaPlaceholder", "core/constants/mediaTypeConstants"], function(a, b, c, d, e, f, g, h, i) {
    "use strict";
    var j = d.preventDefaultHandler,
        k = function(a, b, c, d) {
            a[b.get(c) ? "addClass" : "removeClass"](d)
        };
    return c.View.extend({
        className: "media-container",
        events: {
            "click [data-action=expand]": "handleExpand",
            "click [data-action=contract]": "handleContract",
            "click [data-action=force-load]": "handleForceLoad"
        },
        template: g,
        initialize: function(a) {
            this.options = a, this.media = a.media, this.template = a.template || this.template, this.$linkEl = null, this.setupMode(), this.listenTo(this.model, "change:activated", this.applyState), this.listenTo(this.model, "change:deferredHeight", this.onChangeDeferredHeight), this.listenTo(this.model, "change:showButtons", this.updateElementClass), this.listenTo(this.model, "change:deferred", this.render), this.listenTo(e, "change:collapsed", this.setupMode)
        },
        getMediaDimensions: function() {
            return {
                width: null,
                height: null
            }
        },
        getAvailableWidth: function() {
            return this.$el.parent().width() || e.get("loadedThumbnailWidth")
        },
        updateDeferredHeight: function() {
            this.model.set("deferredHeight", this.calculateDeferredHeight())
        },
        calculateDeferredHeight: function() {
            var a = this.getMediaDimensions(),
                b = a.width,
                c = a.height;
            if (!b || !c) return c;
            var d = this.getAvailableWidth(),
                e = d * c / b;
            return e
        },
        convertToButton: function(a) {
            this.model.set("showButtons", !1), this.linkSubview && this.linkSubview.remove(), this.linkSubview = new f({
                model: this.model,
                media: this.media,
                $link: a
            }), a.replaceWith(this.linkSubview.$el), this.linkSubview.render()
        },
        applyContentNodeHeight: function(a) {
            this.contentNode.height(a || "auto")
        },
        shouldAutoplay: function() {
            return !this.model.get("deferred")
        },
        generateContentHtml: function() {
            return this.media.get("html")
        },
        createContentNode: function(b) {
            return a(b)
        },
        insertContentNode: function(a) {
            this.contentNode.html(a)
        },
        prepareElementEvents: function() {},
        displayContent: function() {
            this.updateDeferredHeight();
            var a = this.generateContentHtml(),
                b = this.createContentNode(a);
            this.prepareElementEvents(b), this.insertContentNode(b), this.applyContentNodeHeight(null)
        },
        configureDeferred: function() {
            this.enterViewport()
        },
        configureContentFromActivated: function() {
            this.model.get("activated") ? this.displayContent() : this.displayPlaceholder()
        },
        displayPlaceholder: function() {
            this.contentNode.html(h({
                model: this.model.toJSON()
            }))
        },
        updateElementClass: function() {
            var a = this.$el,
                b = this.model;
            k(a, b, "deferred", "media-mode-deferred"), k(a, b, "activated", "media-activated"), k(a, b, "showButtons", "media-show-buttons")
        },
        applyState: function() {
            this.configureDeferred(), this.configureContentFromActivated(), this.updateElementClass()
        },
        render: function() {
            return this.$el.html(this.template({
                model: this.model.toJSON(),
                media: this.media.toJSON(),
                isVideo: b.contains(i.VIDEO_CODES, this.media.get("mediaType"))
            })), this.contentNode = this.$el.find("[data-role=content-placeholder]"), this.applyState(), this
        },
        remove: function() {
            this.linkSubview && this.linkSubview.remove(), c.View.prototype.remove.apply(this, arguments)
        },
        enterViewport: function() {
            this.model.get("deferred") && this.activate()
        },
        activate: function() {
            this.model.set("activated", !0)
        },
        setupMode: function() {
            if (this.model.get("respectSettings")) {
                this.model.set("activated", !1);
                var a = e.get("collapsed");
                a ? this.model.set("deferred", !1) : this.model.set("deferred", !0)
            }
        },
        onChangeDeferredHeight: function() {
            this.model.get("deferred") && !this.model.get("activated") && this.applyContentNodeHeight(this.model.get("deferredHeight"))
        },
        handleExpand: j(function() {
            this.model.set("activated", !0)
        }),
        handleContract: j(function() {
            this.model.set("activated", !1)
        }),
        handleForceLoad: j(function() {
            this.model.get("deferred") && this.model.set("activated", !0)
        })
    })
}), define("core/templates/postMediaImage", ["handlebars", "core/templates/handlebars.partials", "core/extensions/handlebars.helpers"], function(a) {
    return a.template({
        1: function(a, b, c, d, e) {
            var f, g = a.lookupProperty || function(a, b) {
                if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
            };
            return ' height="' + a.escapeExpression(a.lambda(null != (f = null != b ? g(b, "model") : b) ? g(f, "deferredHeight") : f, b)) + '" '
        },
        compiler: [8, ">= 4.3.0"],
        main: function(a, b, c, d, e) {
            var f, g = a.lambda,
                h = a.escapeExpression,
                i = null != b ? b : a.nullContext || {},
                j = a.lookupProperty || function(a, b) {
                    if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
                };
            return '<a href="' + h(g(null != b ? j(b, "imageUrl") : b, b)) + '" target="_blank" rel="nofollow">\n<img src="' + h(g(null != b ? j(b, "thumbnailUrl") : b, b)) + '" alt="' + h(j(c, "gettext").call(i, "Thumbnail", {
                name: "gettext",
                hash: {},
                data: e,
                loc: {
                    start: {
                        line: 3,
                        column: 33
                    },
                    end: {
                        line: 3,
                        column: 56
                    }
                }
            })) + '" ' + (null != (f = j(c, "if").call(i, null != (f = null != b ? j(b, "model") : b) ? j(f, "deferredHeight") : f, {
                name: "if",
                hash: {},
                fn: a.program(1, e, 0),
                inverse: a.noop,
                data: e,
                loc: {
                    start: {
                        line: 3,
                        column: 58
                    },
                    end: {
                        line: 3,
                        column: 128
                    }
                }
            })) ? f : "") + ">\n</a>\n"
        },
        useData: !0
    })
}), define("core/views/ImageRichMediaView", ["core/views/RichMediaView", "core/utils", "core/config", "core/mediaConfig", "core/templates/postMediaImage"], function(a, b, c, d, e) {
    "use strict";
    var f = new RegExp("(^|\\.)" + b.getDomain(c.urls.media).split(".").slice(-2).join("\\.") + "$");
    return a.extend({
        getMediaDimensions: function() {
            return {
                width: this.media.get("thumbnailWidth"),
                height: this.media.get("thumbnailHeight")
            }
        },
        getImageUrl: function() {
            return this.media.get("resolvedUrlRedirect") || this.media.get("urlRedirect") || this.media.get("thumbnailUrl")
        },
        getImageThumbnailUrl: function() {
            var a = this.media.get("thumbnailUrl");
            return this.constructor.isOnDisqusCDN(a) && (a = b.serialize(a, {
                w: d.get("loadedThumbnailWidth"),
                h: this.model.get("deferredHeight")
            })), a
        },
        generateContentHtml: function() {
            return e({
                model: this.model.toJSON(),
                media: this.media.toJSON(),
                thumbnailUrl: this.getImageThumbnailUrl(),
                imageUrl: this.getImageUrl()
            })
        },
        prepareElementEvents: function(a) {
            var b = this,
                c = a.find("img");
            c.on("load.richMediaView error.richMediaView", function(a) {
                b.trigger(a.type), c.off(".richMediaView")
            })
        },
        calculateDeferredHeight: function() {
            var b = Math.floor(a.prototype.calculateDeferredHeight.apply(this, arguments)),
                c = this.getMediaDimensions().height;
            return Math.min(c, b) || null
        }
    }, {
        isOnDisqusCDN: function(a) {
            var c = b.getDomain(a);
            return f.test(c)
        }
    })
}), define("core/views/IframeRichMediaView", ["underscore", "core/mediaConfig", "core/views/RichMediaView"], function(a, b, c) {
    "use strict";
    return c.extend({
        getMediaDimensions: function() {
            return {
                width: this.media.get("htmlWidth"),
                height: this.media.get("htmlHeight")
            }
        },
        _findIframe: function(a) {
            return a.is("iframe") ? a : a.find("iframe")
        },
        configureContentFromActivated: function() {
            c.prototype.configureContentFromActivated.apply(this, arguments), this.model.get("activated") || this.$el.removeClass("media-loading")
        },
        createContentNode: function() {
            var a = c.prototype.createContentNode.apply(this, arguments);
            return a.attr({
                width: "100%",
                height: this.model.get("deferredHeight")
            }), a
        },
        insertContentNode: function(a) {
            this.loaderNode = this.$el.find("[data-role=content-loader]"), this.loaderHeight = this.model.get("deferredHeight") || b.get("defaultIframeHeight"), this.loaderNode.height(this.loaderHeight), this.$el.addClass("media-loading"), c.prototype.insertContentNode.call(this, a)
        },
        prepareElementEvents: function(b) {
            var c = this._findIframe(b);
            c.one("load", a.bind(this.finishLoad, this, c))
        },
        finishLoad: function(a) {
            this.$el.removeClass("media-loading"), a.height(this.loaderHeight), this.trigger("load")
        }
    })
}), define("core/views/FacebookPhotoRichMediaView", ["core/views/ImageRichMediaView"], function(a) {
    "use strict";
    return a.extend({
        getImageThumbnailUrl: function() {
            return this.media.get("metadata").imageUrl || a.prototype.getImageThumbnailUrl.call(this)
        }
    })
}), define("core/views/AutoplayRichMediaView", ["underscore", "jquery", "core/utils", "core/views/IframeRichMediaView"], function(a, b, c, d) {
    "use strict";
    return d.extend({
        createContentNode: function() {
            var a = d.prototype.createContentNode.apply(this, arguments),
                b = a.attr("src");
            return this.shouldAutoplay() && b && !this.model.get("playerjs") && (b = c.serialize(b, {
                auto_play: !0,
                autoplay: 1
            }), a.attr("src", b)), a
        },
        insertContentNode: function(c) {
            if (this.model.get("playerjs")) {
                var e = this._findIframe(c),
                    f = e.attr("src");
                "//" === f.substr(0, 2) && (f = window.location.protocol + f);
                var g = f.split("/");
                g = g[0] + "//" + g[2], this.playerjs = {
                    ready: !1,
                    queue: [],
                    origin: g,
                    $iframe: e
                }, this.model.get("mute") && this.send("mute"), this.shouldAutoplay() && this.send("play");
                var h = a.once(a.bind(function() {
                    this.playerjs.ready = !0;
                    var b = this.playerjs.queue;
                    this.playerjs.queue = [], a.each(b, this.send, this)
                }, this));
                b(window).on("message", function(a) {
                    if (a = a.originalEvent, a.origin === g) {
                        var b;
                        try {
                            b = JSON.parse(a.data)
                        } catch (c) {
                            return
                        }
                        "ready" === b.event && b.value && b.value.src === f && h()
                    }
                })
            }
            return d.prototype.insertContentNode.apply(this, arguments)
        },
        send: function(a) {
            if (this.playerjs) {
                if (!this.playerjs.ready) return void this.playerjs.queue.push(a);
                var b = {
                    context: "player.js",
                    version: "0.0.10",
                    method: a
                };
                this.playerjs.$iframe[0].contentWindow.postMessage(JSON.stringify(b), this.playerjs.origin)
            }
        }
    })
}), define("core/views/DynamicHeightRichMediaView", ["underscore", "core/views/RichMediaView"], function(a, b) {
    "use strict";
    return b.extend({
        insertContentNode: function() {
            b.prototype.insertContentNode.apply(this, arguments), this.finishLoad()
        },
        finishLoad: function() {
            var b = this,
                c = 0,
                d = 150,
                e = 20,
                f = function() {
                    c += 1, c < e ? a.delay(f, d) : b.trigger("load")
                };
            f()
        }
    })
}), define("core/templates/postMediaTwitterContent", ["handlebars", "core/templates/handlebars.partials", "core/extensions/handlebars.helpers"], function(a) {
    return a.template({
        compiler: [8, ">= 4.3.0"],
        main: function(a, b, c, d, e) {
            var f = a.lambda,
                g = a.escapeExpression,
                h = a.lookupProperty || function(a, b) {
                    if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
                };
            return '<meta name="twitter:widgets:csp" content="on">\n<blockquote class="twitter-tweet" data-theme="' + g(f(null != b ? h(b, "theme") : b, b)) + '" data-link-color="' + g(f(null != b ? h(b, "linkColor") : b, b)) + '" lang="' + g(f(null != b ? h(b, "language") : b, b)) + '">\n<a href="' + g(f(null != b ? h(b, "url") : b, b)) + '"></a>\n</blockquote>\n<script src="//platform.twitter.com/widgets.js"></script>\n'
        },
        useData: !0
    })
}), define("core/views/TwitterRichMediaView", ["underscore", "core/views/DynamicHeightRichMediaView", "core/templates/postMediaTwitterContent"], function(a, b, c) {
    "use strict";
    var d = b.extend({
        generateContentHtml: function() {
            var b = window.document.documentElement.lang;
            b = b && b.substring(0, 2);
            var e = this.media.get("url");
            return this.media.get("resolvedUrl").indexOf("/status") !== -1 && (e = this.media.get("resolvedUrl")), c({
                url: e,
                theme: a.result(d, "theme"),
                linkColor: a.result(d, "linkColor"),
                language: b
            })
        }
    }, {
        theme: "light",
        linkColor: "#2e9fff"
    });
    return d
}), define("core/views/SoundCloudRichMediaView", ["core/views/AutoplayRichMediaView"], function(a) {
    "use strict";
    return a.extend({
        getMediaDimensions: function() {
            return {
                width: null,
                height: this.media.get("htmlHeight")
            }
        }
    })
}), define("core/views/VineRichMediaView", ["core/views/AutoplayRichMediaView", "core/utils"], function(a, b) {
    "use strict";
    return a.extend({
        createContentNode: function() {
            var c = a.prototype.createContentNode.apply(this, arguments),
                d = c.attr("src");
            return this.shouldAutoplay() && d && (d = b.serialize(d, {
                audio: 1
            }), c.attr("src", d)), c
        }
    })
}), define("core/views/IframeGifRichMediaView", ["core/views/IframeRichMediaView"], function(a) {
    "use strict";
    return a.extend({
        insertContentNode: function(b) {
            a.prototype.insertContentNode.call(this, b), this.loaderNode.width(this.getMediaDimensions().width)
        },
        createContentNode: function() {
            var b = a.prototype.createContentNode.apply(this, arguments);
            return b.attr(this.getMediaDimensions()), b
        },
        calculateDeferredHeight: function() {
            return this.getMediaDimensions().height
        },
        displayPlaceholder: function() {
            a.prototype.displayPlaceholder.call(this);
            var b = this.getMediaDimensions();
            this.contentNode.height(b.height).width(b.width)
        }
    })
}), define("core/media", ["underscore", "core/strings", "core/models/Media", "core/models/RichMediaViewModel", "core/views/ImageRichMediaView", "core/views/IframeRichMediaView", "core/views/FacebookPhotoRichMediaView", "core/views/AutoplayRichMediaView", "core/views/TwitterRichMediaView", "core/views/SoundCloudRichMediaView", "core/views/VineRichMediaView", "core/views/IframeGifRichMediaView"], function(a, b, c, d, e, f, g, h, i, j, k, l) {
    "use strict";
    var m = b.get,
        n = {
            PLAY_HIDE: {
                kind: "html",
                providerExpandMessage: m("Play"),
                providerCollapseMessage: m("Hide")
            },
            VIEW_HIDE: {
                kind: "html",
                providerExpandMessage: m("View"),
                providerCollapseMessage: m("Hide")
            },
            VIEW_IMAGE: {
                kind: "image",
                providerIcon: "icon-images",
                providerExpandMessage: m("View"),
                providerCollapseMessage: m("Hide")
            }
        },
        o = function(b) {
            var m = function(b, c) {
                    return a.defaults({
                        providerIcon: c
                    }, n[b])
                },
                o = null,
                p = null,
                q = c.MEDIA_TYPES;
            switch (b.get("mediaType")) {
                case q.IMAGE:
                case q.IMAGE_UPLOAD:
                    o = n.VIEW_IMAGE;
                    break;
                case q.FACEBOOK_PHOTO:
                    p = g, o = n.VIEW_IMAGE;
                    break;
                case q.GIF_VIDEO:
                    p = l, o = n.VIEW_HIDE;
                    break;
                case q.VIMEO_VIDEO:
                case q.YOUTUBE_VIDEO:
                    p = h, o = m("PLAY_HIDE", "icon-video");
                    break;
                case q.TWITTER_STATUS:
                    p = i, o = m("VIEW_HIDE", "icon-twitter");
                    break;
                case q.VINE_VIDEO:
                    p = k, o = m("PLAY_HIDE", "icon-video");
                    break;
                case q.FACEBOOK_VIDEO:
                    o = m("VIEW_HIDE", "icon-video");
                    break;
                case q.SOUNDCLOUD_SOUND:
                    p = j, o = m("PLAY_HIDE", "icon-music");
                    break;
                case q.GOOGLE_MAP:
                    o = m("VIEW_HIDE", "icon-map");
                    break;
                default:
                    return null
            }
            if (null === p) switch (o.kind) {
                case "webpage":
                    return null;
                case "html":
                    p = f;
                    break;
                case "image":
                    p = e
            }
            var r = new d(o);
            return {
                Cls: p,
                mediaViewModel: r
            }
        },
        p = function(a) {
            var b = o(a);
            return b ? new b.Cls({
                model: b.mediaViewModel,
                media: a
            }) : null
        },
        q = function(a) {
            return new e({
                model: new d(n.VIEW_IMAGE),
                media: a
            })
        };
    return {
        instantiateRichMediaView: p,
        instantiateRichMediaThumbnail: q,
        getRichMediaViewConfig: o
    }
}), define("core/mixins/withRichMedia", ["underscore", "jquery", "core/collections/MediaCollection", "core/media"], function(a, b, c, d) {
    "use strict";

    function e(a) {
        var c = {};
        return a.length ? (a.find("a").each(function(a, d) {
            var e = d.href;
            c[e] || (c[e] = b(d))
        }), c) : c
    }

    function f() {
        a.extend(this, g)
    }
    var g = {
        renderRichMedia: function(a, f, g) {
            return g = g || {}, a = a instanceof c ? a : new c(a), a.chain().map(function(a) {
                return d.instantiateRichMediaView(a)
            }).without(null).map(function(a) {
                var c = a.media.get("urlRedirect");
                g.normalize && (c = g.normalize.call(this, c));
                var d = e(this.$("[data-role=message]")),
                    h = d[c];
                return g.beforeRender && g.beforeRender.call(this, a), a.render(), h ? g.convertLinkToButton ? (h.after(a.$el), a.convertToButton(h)) : h.replaceWith(a.$el) : (f = f || this.$("[data-role=post-media-list]"), f.append(b("<li>").append(a.$el))), a
            }, this).value()
        }
    };
    return f
}), define("core/views/common/HoverCard", ["jquery", "underscore", "backbone", "core/bus", "core/utils"], function(a, b, c, d, e) {
    "use strict";
    var f = c.View.extend({
        events: {
            mouseenter: "enter",
            mouseleave: "leave"
        },
        initialize: function() {
            this._id = b.uniqueId(), this._rendered = !1, this._hoverState = "out", this._visible = !1, this._enterTimeout = null, this._leaveTimeout = null, f.open = {}, this.events = this.events || {}, this.events["click [data-action=profile]"] = "handleShowProfile", this.listenTo(this, "authenticating", this.keepOpen)
        },
        render: function() {
            return this.hide(), a("body").append(this.el), this
        },
        target: function(a) {
            a.on("mouseenter", b.bind(this.enter, this, a)), a.on("mouseleave", b.bind(this.leave, this))
        },
        enter: function(a) {
            var c = this;
            a.originalEvent && (a = null), a && (c.$target = a), c._leaveTimeout && clearTimeout(c._leaveTimeout), "in" !== c._hoverState && (c._hoverState = "in", c._enterTimeout = b.delay(function() {
                "in" === c._hoverState && c.show(), c._enterTimeout = null
            }, f.DELAY_ENTER), f.open[this.uid] = this)
        },
        leave: function() {
            var a = this;
            a._enterTimeout && clearTimeout(a._enterTimeout), "out" !== a._hoverState && (a._hoverState = "out", a._leaveTimeout = b.delay(function() {
                "out" === a._hoverState && a.hide(), a._leaveTimeout = null
            }, f.DELAY_LEAVE), f.open[this.uid] && delete f.open[this.uid])
        },
        show: function() {
            var a = this;
            a._rendered || (a._rendered = !0, a.render()), a.moveTo(a.$target), a.$el.show(), a._visible = !0, a.trigger("show")
        },
        moveTo: function(a) {
            if (a) {
                var b = f.POSITION_OFFSET,
                    c = a.offset(),
                    d = this.$el,
                    e = d.height(),
                    g = this.getContainerPosition();
                c.top -= b;
                var h = c.top + e + g.containerOffset.top,
                    i = g.pageOffset + g.containerHeight;
                h <= i ? d.css("top", c.top) : d.css("top", c.top - e + 2 * b), d.css("left", c.left + b)
            }
        },
        getContainerPosition: function() {
            return {
                pageOffset: a(window).scrollTop(),
                containerOffset: {
                    top: 0,
                    height: a(window).height()
                },
                containerHeight: a(window).height()
            }
        },
        hide: function() {
            this._keepOpen || (this._enterTimeout && clearTimeout(this._enterTimeout), this.$el.hide(), this._visible = !1)
        },
        keepOpen: function() {
            this._keepOpen = !0, this.setupKeepOpenCanceler()
        },
        setupKeepOpenCanceler: function() {
            var c = this,
                e = function() {
                    "out" === c._hoverState && (c.stopListening(d, "window.click", e), a("body").off("click", e), c._keepOpen = !1, c.hide())
                };
            b.delay(function() {
                c.listenTo(d, "window.click", e), a("body").on("click", e)
            }, 100)
        },
        isVisible: function() {
            return this._visible
        },
        handleShowProfile: e.preventDefaultHandler(function() {
            this.hide()
        })
    }, {
        open: {},
        instances: {},
        DELAY_ENTER: 350,
        DELAY_LEAVE: 175,
        POSITION_OFFSET: 20,
        exitAll: function() {
            b.invoke(f.open, "leave")
        },
        create: function(a, b, c, d) {
            var e = f.instances[c];
            e || (f.instances[c] = e = {});
            var g = e[a];
            return g || (g = new d(b), e[a] = g), b.targetElement && g.target(b.targetElement), g
        }
    });
    return function() {
        a(window.document).on("mouseout", b.debounce(function(a) {
            var b = a.relatedTarget || a.toElement;
            b && "HTML" !== b.nodeName || f.exitAll()
        }, 10))
    }(), f
}), define("core/utils/views", ["underscore"], function(a) {
    "use strict";
    var b = function(b, c, d) {
        var e = b.prototype,
            f = a.extend({}, c, d);
        if (a.defaults(e, f), a.defaults(e.events, f.events), void 0 !== e.initialize && void 0 !== f.initialize) {
            var g = e.initialize;
            e.initialize = function() {
                var a = g.apply(this, arguments);
                return f.initialize.apply(this, arguments), a
            }
        }
    };
    return {
        mixin: b
    }
}), define("core/views/common/mixins/LocalScroll", [], function() {
    "use strict";
    var a = {
        events: {
            mousewheel: "handleScrollEvent",
            wheel: "handleScrollEvent"
        },
        scrollMeasureSelector: "",
        getScrollMeasure: function() {
            return this.scrollMeasure || (this.scrollMeasure = this.$el, this.scrollMeasureSelector && (this.scrollMeasure = this.$el.find(this.scrollMeasureSelector))), this.scrollMeasure
        },
        handleScrollEvent: function(a) {
            var b = a.originalEvent,
                c = b.wheelDeltaY || -b.deltaY,
                d = this.$el,
                e = d.height(),
                f = this.getScrollMeasure(),
                g = f.height(),
                h = f.parent()[0].scrollTop,
                i = h >= g - e,
                j = 0 === h;
            (i && c < 0 || j && c > 0) && a.preventDefault()
        }
    };
    return a
}), define("core/templates/usersCard", ["handlebars", "core/templates/handlebars.partials", "core/extensions/handlebars.helpers"], function(a) {
    return a.template({
        1: function(a, b, c, d, e) {
            return "guests-only"
        },
        3: function(a, b, c, d, e, f, g) {
            var h, i = a.lookupProperty || function(a, b) {
                if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
            };
            return null != (h = i(c, "each").call(null != b ? b : a.nullContext || {}, null != b ? i(b, "users") : b, {
                name: "each",
                hash: {},
                fn: a.program(4, e, 0, f, g),
                inverse: a.noop,
                data: e,
                loc: {
                    start: {
                        line: 4,
                        column: 0
                    },
                    end: {
                        line: 6,
                        column: 9
                    }
                }
            })) ? h : ""
        },
        4: function(a, b, c, d, e, f, g) {
            var h, i = a.lookupProperty || function(a, b) {
                if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
            };
            return null != (h = a.invokePartial(i(d, "cardUser"), b, {
                name: "cardUser",
                hash: {
                    forumId: null != g[1] ? i(g[1], "forumId") : g[1],
                    highlight: null != g[1] ? i(g[1], "highlight") : g[1]
                },
                data: e,
                helpers: c,
                partials: d,
                decorators: a.decorators
            })) ? h : ""
        },
        compiler: [8, ">= 4.3.0"],
        main: function(a, b, c, d, e, f, g) {
            var h, i = null != b ? b : a.nullContext || {},
                j = a.lookupProperty || function(a, b) {
                    if (Object.prototype.hasOwnProperty.call(a, b)) return a[b]
                };
            return '<div class="tooltip voters ' + (null != (h = j(c, "unless").call(i, null != (h = null != b ? j(b, "users") : b) ? j(h, "length") : h, {
                name: "unless",
                hash: {},
                fn: a.program(1, e, 0, f, g),
                inverse: a.noop,
                data: e,
                loc: {
                    start: {
                        line: 1,
                        column: 27
                    },
                    end: {
                        line: 1,
                        column: 73
                    }
                }
            })) ? h : "") + '">\n<ul class="scroll-measure" data-role="content">\n' + (null != (h = j(c, "if").call(i, null != (h = null != b ? j(b, "users") : b) ? j(h, "length") : h, {
                name: "if",
                hash: {},
                fn: a.program(3, e, 0, f, g),
                inverse: a.noop,
                data: e,
                loc: {
                    start: {
                        line: 3,
                        column: 0
                    },
                    end: {
                        line: 7,
                        column: 7
                    }
                }
            })) ? h : "") + '</ul>\n</div>\n<div class="tooltip-point hidden"></div>\n'
        },
        usePartial: !0,
        useData: !0,
        useDepths: !0
    })
}), define("core/views/UsersCard", ["jquery", "underscore", "handlebars", "core/config", "core/bus", "core/utils/views", "core/views/common/HoverCard", "core/views/common/mixins/LocalScroll", "core/templates/usersCard"], function(a, b, c, d, e, f, g, h, i) {
    "use strict";
    var j = function(a) {
            return a.get("isAnonymous") || a.get("isBlocked")
        },
        k = g.extend({
            guestTextPartialName: "cardOtherUserText",
            className: "tooltip-outer voters-outer",
            initialize: function(a) {
                g.prototype.initialize.call(this, a), this.collection = this.collection || a.collection, this.session = a.session, this.numUsers = a.numUsers, this.voteType = a.voteType, this.listenTo(this.collection, "add", this.addUser), this.listenTo(this.collection, "change:isBlocked", this.render), this.listenTo(this.collection, "remove", this.removeUser), this.listenTo(this.collection, "reset", this.render)
            },
            addUser: function(a) {
                j(a) ? this.updateGuests() : this.$listEl && this.$listEl.length && (this.$listEl.prepend(c.partials.cardUser(this.getUserTemplateData(a))), this.stopHighlightUsername())
            },
            removeUser: function(a) {
                if (j(a)) this.updateGuests();
                else {
                    var b = this.$el.find("[data-username=" + a.get("username") + "]");
                    b.length && b.remove()
                }
            },
            stopHighlightUsername: b.debounce(function() {
                var a = this.$el.find(".highlight");
                a.removeClass("highlight")
            }, 1100),
            getGuestCount: function() {
                return Math.max(this.numUsers - this.collection.reject(j).length, 0)
            },
            updateGuests: function() {
                var a = this.$el.find("[data-role=guest]"),
                    b = this.getGuestCount(),
                    e = c.partials[this.guestTextPartialName]({
                        guestCount: b
                    }),
                    f = {
                        guestCount: b,
                        guestAvatarUrl: d.urls.avatar.generic,
                        highlight: a.length,
                        guestText: e
                    },
                    g = c.partials.cardGuestUser(f);
                a.length ? (a.replaceWith(g), this.stopHighlightUsername()) : this.$listEl && this.$listEl.length && this.$listEl.append(g)
            },
            getTemplateData: function() {
                return {
                    users: b.invoke(this.collection.reject(j), "toJSON"),
                    highlight: !1
                }
            },
            getUserTemplateData: function(a) {
                return b.extend({
                    highlight: !0
                }, a.toJSON())
            },
            render: function() {
                delete this.pointEl, this.$el.html(i(this.getTemplateData())), g.prototype.render.call(this), this.$listEl = this.$el.find(".voters ul"), this.updateGuests()
            },
            show: function() {
                this.numUsers && !this.isVisible() && (g.prototype.show.call(this), e.trigger("uiAction:userCardShow"))
            },
            showPoint: function(a) {
                var c = ["tl", "bl"];
                this.pointEl || (this.pointEl = this.$el.find(".tooltip-point"), this.pointEl.removeClass("hidden")), b.each(c, function(a) {
                    this.pointEl.removeClass("point-position-" + a)
                }, this), this.pointEl.addClass("point-position-" + a)
            },
            moveTo: function(a, b) {
                if (a) {
                    var c = g.POSITION_OFFSET,
                        d = a.offset(),
                        e = this.$el,
                        f = e.height(),
                        h = this.getContainerPosition();
                    b && (f += e.find("li.user").height() + 10), d.top - f - c >= 0 && d.top - f + h.containerOffset.top >= h.pageOffset ? (e.css({
                        bottom: h.containerOffset.height - d.top + c,
                        top: "inherit"
                    }), this.showPoint("bl")) : (e.css({
                        bottom: "inherit",
                        top: d.top + 2 * c
                    }), this.showPoint("tl")), e.css("left", d.left - c)
                }
            },
            handleShowProfile: function(b) {
                g.prototype.handleShowProfile.call(this, b);
                var c = a(b.currentTarget),
                    d = c.attr("data-username");
                e.trigger("uiCallback:showProfile", d)
            }
        }, {
            create: function(a, b) {
                return g.create(a, b, "UsersCard", k)
            }
        });
    return f.mixin(k, h, {
        scrollMeasureSelector: "[data-role=content]"
    }), k
}), define("core/views/VotersCard", ["underscore", "core/views/common/HoverCard", "core/views/UsersCard", "core/utils"], function(a, b, c, d) {
    "use strict";
    var e = d.preventDefaultHandler,
        f = c.extend({
            guestTextPartialName: "cardGuestVoterText",
            initialize: function(b) {
                this.voteType = b.voteType;
                var d = b.model,
                    e = 1 === this.voteType ? d.getUpvotersUserCollection() : d.getDownvotersUserCollection();
                a.extend(b, {
                    collection: e,
                    numUsers: 1 === this.voteType ? d.get("likes") : d.get("dislikes")
                }), c.prototype.initialize.call(this, b), this.model = d, this.session = b.session, this.likes = d.get("likes"), this.dislikes = d.get("dislikes"), this.hadLikes = Boolean(this.likes), this.hadDislikes = Boolean(this.dislikes), this._fetched = !1, this._rendered = !1, this.listenTo(this.model, "change:userScore", this.updateUserSet), 1 === this.voteType ? this.listenTo(this.model, "change:likes", this.updateGuests) : this.listenTo(this.model, "change:dislikes", this.updateGuests)
            },
            updateGuests: function() {
                this.numUsers = (1 === this.voteType ? this.model.get("likes") : this.model.get("dislikes")) || 0, c.prototype.updateGuests.call(this)
            },
            updateUserSet: function() {
                var a = this.session.user,
                    b = this.likes,
                    c = this.dislikes,
                    d = !1;
                this.likes = this.model.get("likes"), this.dislikes = this.model.get("dislikes"), this.model.get("userScore") === this.voteType ? (this.session.isLoggedIn() && this.collection.add(a), 1 === this.voteType && this.likes && !b || this.voteType === -1 && this.dislikes && !c ? (this._rendered = !1, this.show()) : d = !!this.session.isLoggedOut() || Boolean((1 === this.voteType ? this.likes : this.dislikes) - 1 - this.collection.length)) : (this.collection.remove(a), (1 === this.voteType && !this.likes || this.voteType === -1 && !this.dislikes) && this.hide()), this.updateGuests(), this.moveTo(this.$target, d)
            },
            show: function() {
                if (!(1 === this.voteType && !this.likes || this.voteType === -1 && !this.dislikes || this.isVisible())) {
                    if ((1 === this.voteType && !this.hadLikes || this.voteType === -1 && !this.hadDislikes) && (this._fetched = !0), !this._fetched) return void this.collection.fetch({
                        vote: this.voteType
                    }).done(a.bind(function() {
                        this._fetched = !0, this.show()
                    }, this));
                    var b = this.session.user;
                    this.model.get("userScore") === this.voteType && this.session.isLoggedIn() && !this.collection.contains(b) && this.collection.add(b), c.prototype.show.call(this)
                }
            },
            handleShowProfile: e(function(a) {
                c.prototype.handleShowProfile.call(this, a)
            }),
            getTemplateData: function() {
                var b = c.prototype.getTemplateData.apply(this, arguments);
                return a.extend({}, b, {
                    forumId: this.model.get("forum")
                })
            },
            getUserTemplateData: function() {
                var b = c.prototype.getUserTemplateData.apply(this, arguments);
                return a.extend({}, b, {
                    forumId: this.model.get("forum")
                })
            }
        }, {
            create: function(a) {
                var c = a.model;
                if (c.has("id")) return b.create([c.get("id"), "-", a.voteType].join(""), a, "VotersCard", f)
            }
        });
    return f
}), define("templates/lounge/contextCard", ["react", "core/strings", "core/utils/object/get", "templates/lounge/partials/profileLink"], function(a, b, c, d) {
    "use strict";
    var e = b.gettext,
        f = function(b) {
            return a.createElement("img", {
                src: c(b.post, ["author", "avatar", "cache"], ""),
                className: "user",
                alt: e("Avatar")
            })
        },
        g = function(b) {
            return a.createElement("div", {
                className: "tooltip"
            }, a.createElement("div", {
                className: "notch"
            }), c(b.post, ["author", "isAnonymous"]) ? a.createElement("div", {
                className: "avatar"
            }, a.createElement(f, {
                post: b.post
            })) : a.createElement(d, {
                className: "avatar",
                user: c(b.post, ["author"]),
                forumId: b.post.forum
            }, a.createElement(f, {
                post: b.post
            })), a.createElement("div", {
                className: "tooltip__content"
            }, a.createElement("h3", null, c(b.post, ["author", "isAnonymous"]) ? a.createElement("h3", null, c(b.post, ["author", "name"], null)) : a.createElement(d, {
                user: c(b.post, ["author"]),
                forumId: b.post.forum
            }, a.createElement("h3", null, c(b.post, ["author", "name"], null)))), a.createElement("p", null, c(b.post, ["excerpt"], null))))
        };
    return g
}), define("templates/lounge/partials/followButtonSmall", ["react", "core/config/urls", "core/strings", "core/utils/object/get"], function(a, b, c, d) {
    "use strict";
    var e = c.gettext,
        f = function(c) {
            return d(c.user, ["isSession"]) ? d(c.user, ["isEditable"]) ? a.createElement("a", {
                href: b.editProfile || "",
                target: "_blank",
                className: c.buttonAsLink ? "publisher-anchor-color follow-link" : "btn btn-small"
            }, e("Edit profile")) : null : d(c.user, ["isPrivate"]) ? a.createElement("span", {
                className: "btn btn-small follow-btn private"
            }, a.createElement("i", {
                "aria-hidden": "true",
                className: "icon-lock"
            }), " ", a.createElement("span", {
                className: "btn-text"
            }, e("Private"))) : a.createElement("a", {
                href: d(c.user, ["profileUrl"], ""),
                className: "" + (c.buttonAsLink ? "publisher-anchor-color follow-link" : "btn btn-small follow-btn") + (d(c.user, ["isFollowing"]) ? " following" : ""),
                "data-action": "toggleFollow",
                "data-user": d(c.user, ["id"], ""),
                target: "_blank",
                rel: "noopener noreferrer"
            }, a.createElement("span", {
                className: "btn-text following-text"
            }, e("Following")), a.createElement("span", {
                className: "btn-text follow-text"
            }, e("Follow")), a.createElement("i", {
                "aria-hidden": "true",
                className: "icon-checkmark"
            }))
        };
    return f
}), define("templates/lounge/partials/hovercardActions", ["react", "core/strings", "templates/lounge/partials/followButtonSmall", "templates/lounge/partials/profileLink"], function(a, b, c, d) {
    "use strict";
    var e = b.gettext,
        f = function(b) {
            return a.createElement("div", null, a.createElement(d, {
                user: b.user,
                forumId: null,
                className: "full-profile"
            }, e("Full profile")), b.showFollowButton ? a.createElement(c, {
                user: b.user,
                buttonAsLink: b.buttonAsLink
            }) : null, " ")
        };
    return f
}), define("templates/lounge/partials/hovercardCounters", ["react", "core/strings", "core/utils/object/get"], function(a, b, c) {
    "use strict";
    var d = b.gettext,
        e = function(b) {
            return a.createElement("div", null, 1 === c(b.user, ["numPosts"]) ? d("1 comment") : d("%(numPosts)s comments", {
                numPosts: c(b.user, ["numPosts"], "")
            }), " ", a.createElement("span", {
                className: "bullet"
            }, "•"), " ", 1 === c(b.user, ["numLikesReceived"]) ? d("1 vote") : d("%(numLikesReceived)s votes", {
                numLikesReceived: c(b.user, ["numLikesReceived"], "")
            }))
        };
    return e
}), define("templates/lounge/hovercard", ["react", "core/strings", "core/utils/object/get", "templates/lounge/partials/hovercardActions", "templates/lounge/partials/hovercardCounters", "templates/lounge/partials/profileLink"], function(a, b, c, d, e, f) {
    "use strict";
    var g = b.gettext,
        h = function(b, c) {
            return b.length <= c ? b : a.createElement("span", null, b.slice(0, c), "…")
        },
        i = function(b) {
            return a.createElement("div", {
                className: "tooltip"
            }, a.createElement("div", {
                className: "notch"
            }), a.createElement(f, {
                user: b.user,
                forumId: null,
                className: "avatar"
            }, a.createElement("img", {
                "data-user": c(b.user, ["id"], ""),
                "data-role": "user-avatar",
                src: c(b.user, ["avatar", "cache"], ""),
                className: "user",
                alt: g("Avatar")
            })), a.createElement("div", {
                className: "tooltip__content"
            }, a.createElement("h3", null, a.createElement(f, {
                user: b.user,
                forumId: null,
                "data-role": "username"
            }, c(b.user, ["name"], null)), " ", c(b.user, ["thread", "canModerate"]) ? a.createElement("span", {
                className: "badge moderator"
            }, g("MOD")) : null), c(b.user, ["about"]) ? a.createElement("p", {
                className: "bio"
            }, h(c(b.user, ["about"], ""), 80)) : null, a.createElement("p", {
                className: "stats",
                "data-role": "counters"
            }, null !== c(b.user, ["numPosts"], null) && null !== c(b.user, ["numLikesReceived"], null) ? a.createElement(e, {
                user: b.user
            }) : null), a.createElement("div", {
                className: "hovercard-badges",
                "data-role": "hovercard-badges"
            })), a.createElement("footer", {
                className: "tooltip__footer",
                "data-role": "actions"
            }, a.createElement(d, {
                user: b.user,
                buttonAsLink: b.buttonAsLink,
                showFollowButton: b.showFollowButton
            })))
        };
    return i
}), define("templates/lounge/upgradeCard", ["react", "core/strings", "core/utils/object/get"], function(a, b, c) {
    "use strict";
    var d = b.gettext,
        e = function(b) {
            return a.createElement("div", {
                className: "tooltip"
            }, a.createElement("div", {
                className: "notch"
            }), a.createElement("div", null, a.createElement("p", {
                className: "text-normal"
            }, d("Disqus Pro gives you access to exclusive features like auto-moderation, shadow banning, and customization options.")), a.createElement("a", {
                href: ["https://disqus.com/admin/", b.organization ? "orgs/" + c(b.organization, ["id"]) + "/" + c(b.organization, ["slug"], "sites") + "/" : "", "settings/subscription/"].join(""),
                target: "_blank",
                rel: "noopener noreferrer",
                className: "btn btn-small",
                "data-role": "upgrade-link"
            }, d("Subscriptions and Billing"))))
        };
    return e
}), define("templates/lounge/partials/userBadges", ["react", "core/bus", "templates/lounge/partials/profileLink"], function(a, b, c) {
    "use strict";
    var d = function(b) {
            var d = b.badge,
                e = b.user,
                f = b.forumId,
                g = b.context,
                h = b.trackClick;
            return d.image ? a.createElement(c, {
                user: e,
                forumId: f,
                profileTab: "badges",
                id: g + "-badge_" + e.id + "-" + d.id,
                className: "user-badge badge-tooltip__wrapper",
                "data-role": "user-badge",
                "data-badge": d.id,
                onClick: function(a) {
                    return h(a, d.id)
                },
                tabIndex: 0
            }, a.createElement("img", {
                className: "user-badge-image",
                src: d.image,
                alt: d.name
            }), a.createElement("div", {
                className: "badge-tooltip__container"
            }, a.createElement("div", {
                className: "tooltip show badge-tooltip"
            }, a.createElement("span", {
                className: "badge-tooltip__content"
            }, d.name)))) : null
        },
        e = function(a, b) {
            return b.badges ? b.badges.filter(function(b) {
                return a.badges[b.id]
            }) : []
        },
        f = function(f) {
            var g = f.forum,
                h = f.user,
                i = f.context,
                j = f.limit;
            if (!(g.settings.badgesEnabled && g.badges && Object.keys(g.badges).length && h)) return null;
            var k = e(g, h),
                l = function(a, c) {
                    b.trigger("uiAction:clickBadge", a, c)
                },
                m = k.length > j,
                n = m ? j - 1 : j;
            return k.length ? a.createElement("span", {
                "data-role": "badges",
                className: "user-badges-collection",
                "data-tracking-area": i
            }, k.map(function(b, c) {
                return c < n ? a.createElement(d, {
                    key: c,
                    badge: b,
                    user: h,
                    forumId: g.id,
                    context: i,
                    trackClick: l
                }) : null
            }), m ? a.createElement(c, {
                user: h,
                forumId: g.id,
                profileTab: "badges",
                className: "user-badge truncate-badge publisher-background-color",
                "data-role": "user-badge",
                onClick: function(a) {
                    return l(a, "more")
                },
                tabIndex: 0
            }, a.createElement("span", {
                className: "user-badge-more"
            }, "+", k.length - n)) : null) : a.createElement("span", {
                "data-role": "badges",
                className: "user-badges-collection"
            })
        };
    return f
}), define("lounge/views/cards", ["jquery", "underscore", "lounge/common", "core/utils", "common/models", "common/views/mixins", "core/constants/badgesConstants", "core/views/common/HoverCard", "core/views/VotersCard", "templates/lounge/contextCard", "templates/lounge/hovercard", "templates/lounge/upgradeCard", "templates/lounge/partials/hovercardActions", "templates/lounge/partials/hovercardCounters", "templates/lounge/partials/userBadges"], function(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o) {
    "use strict";
    h.prototype.getContainerPosition = function() {
            var a = c.getLounge().getPosition();
            return {
                pageOffset: a.pageOffset,
                containerOffset: a.frameOffset,
                containerHeight: a.height
            }
        },
        function() {
            var c = 10;
            a(window.document).on("mouseout", b.debounce(function(a) {
                var b = a.relatedTarget || a.toElement;
                b && "HTML" !== b.nodeName || h.exitAll()
            }, c))
        }();
    var p = h.extend({
        className: "tooltip-outer profile-card",
        events: b.defaults({
            "click [data-action=toggleFollow]": "toggleFollow"
        }, h.prototype.events),
        initialize: function(a) {
            var b = this;
            h.prototype.initialize.call(b, a), b.session = a.session, b.user = a.user, b._fetched = !1, b.listenTo(b.session, "change:id", function() {
                this._rendered && this.render()
            })
        },
        onFetch: function(a) {
            this.user = new e.SyncedUser(a.attributes), this.updateCounters(), this.updateActions(), this.updateBadges(), this.listenTo(this.user, {
                "change:numPosts change:numLikesReceived": b.debounce(function() {
                    this.updateCounters()
                }),
                "change:isFollowing": this.updateActions
            })
        },
        serialize: function() {
            var a = this.user.toJSON({
                session: this.session
            });
            return a.numLikesReceived = a.numLikesReceived || this.user.get("numVotes") || 0, {
                user: a,
                showFollowButton: this.user.has("isFollowing") || this.session.isLoggedOut()
            }
        },
        render: function() {
            this.$el.html(k(this.serialize())), h.prototype.render.call(this)
        },
        setBadges: function(a) {
            this._fetched && (this.user.set("badges", a), this.updateBadges())
        },
        updateBadges: function() {
            var a = this.session.get("thread") && this.session.get("thread").forum,
                b = Boolean(a && a.get("settings") && a.get("settings").badgesEnabled && a.get("badges")),
                c = Boolean(b && this.user.get("badges") && this.user.get("badges").length);
            c && !this.el.classList.contains("has-badges") ? this.el.classList.add("has-badges") : !c && this.el.classList.contains("has-badges") && this.el.classList.remove("has-badges"), b && this.$el.find("[data-role=hovercard-badges]").html(o({
                forum: a.attributes,
                user: this.user.attributes,
                context: "hovercard",
                limit: g.MAX_BADGE_COUNT
            }))
        },
        updateCounters: function() {
            this.$el.find("[data-role=counters]").html(n(this.serialize()))
        },
        updateActions: function() {
            this.$el.find("[data-role=actions]").html(m(this.serialize()))
        },
        show: function() {
            this._fetched || (this._fetched = !0, this.user.fetch({
                success: b.bind(this.onFetch, this)
            })), h.prototype.show.call(this)
        }
    }, {
        create: function(a) {
            var b = a.user;
            return h.create(b.id, a, "ProfileCard", p)
        }
    });
    b.extend(p.prototype, f.FollowButtonMixin);
    var q = h.extend({
            className: "context-card tooltip-outer",
            initialize: function(a) {
                var b = this;
                h.prototype.initialize.call(b, a), b.post = a.post
            },
            render: function() {
                var a = this.post,
                    b = a.toJSON();
                b.excerpt = d.niceTruncate(b.plaintext, 40), this.$el.html(j({
                    post: b
                })), h.prototype.render.call(this)
            }
        }, {
            create: function(a) {
                var b = a.post;
                return h.create(b.id, a, "ContextCard", q)
            }
        }),
        r = h.extend({
            className: "tooltip-outer upgrade-card",
            events: b.defaults({
                "click [data-role=upgrade-link]": "onClickUpgrade"
            }, h.prototype.events),
            initialize: function(a) {
                h.prototype.initialize.call(this, a), this.organization = a.organization
            },
            render: function() {
                this.$el.html(l({
                    organization: this.organization
                })), h.prototype.render.call(this)
            },
            onClickUpgrade: function(a) {
                this.trigger("click:upgrade", a)
            }
        }, {
            create: function(a) {
                var b = a.organization;
                return h.create(b ? b.id : "upgrade", a, "UpgradeCard", r)
            }
        });
    return {
        HoverCard: h,
        ProfileCard: p,
        ContextCard: q,
        VotersCard: i,
        UpgradeCard: r
    }
}), define("core/views/SourcelessIframeRichMediaView", ["jquery", "core/mediaConfig", "core/views/RichMediaView"], function(a, b, c) {
    "use strict";
    return c.extend({
        createContentNode: function(b) {
            return a("<iframe>").attr({
                frameBorder: 0,
                scrolling: "no",
                width: "100%",
                height: this.model.get("deferredHeight"),
                "data-src": b,
                src: 'javascript:window.frameElement.getAttribute("data-src");'
            })
        },
        insertContentNode: function(a) {
            c.prototype.insertContentNode.apply(this, arguments);
            var d = this.model.get("deferredHeight") || b.get("defaultIframeHeight");
            a.height(d)
        }
    })
}), define("lounge/views/media", ["underscore", "stance", "core/utils", "core/utils/storage", "core/utils/html/toHexColorString", "core/media", "core/mediaConfig", "core/models/RichMediaViewModel", "core/views/RichMediaLinkView", "core/views/RichMediaView", "core/views/IframeRichMediaView", "core/views/SoundCloudRichMediaView", "core/views/AutoplayRichMediaView", "core/views/SourcelessIframeRichMediaView", "core/views/DynamicHeightRichMediaView", "core/views/TwitterRichMediaView", "core/views/ImageRichMediaView", "core/views/FacebookPhotoRichMediaView", "core/views/VineRichMediaView", "lounge/common"], function(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t) {
    "use strict";

    function u() {
        var b = d.get("disqus.collapse-media");
        return a.isBoolean(b) || (b = c.isMobileUserAgent()), b
    }
    return a.extend(j.prototype, {
        topEdgeOffset: function() {
            return -t.getLounge().getPosition().height
        },
        configureDeferred: function() {
            this.model.get("deferred") && !this.model.get("activated") && this.listenToOnce(b(this), "enter", function() {
                this.relatedPost && this.listenToOnce(this, "load error", function() {
                    t.getLounge().postsView.onDeferredViewReady(this.relatedPost)
                }), this.enterViewport()
            }), this.listenToOnce(t.getLounge().postsView, "render:end", this.updateDeferredHeight)
        }
    }), p.theme = function() {
        return t.getLounge().config.colorScheme
    }, p.linkColor = function() {
        return e(t.getLounge().config.anchorColor)
    }, g.set({
        collapsed: u()
    }), g.on("change:collapsed", function(b, c) {
        if (a.isObject(c)) {
            if (!c.persist) return;
            c = c.value
        }
        d.set("disqus.collapse-media", c)
    }), {
        settings: g,
        getCollapseDefault: u,
        getDomain: c.getDomain,
        RichMediaLinkView: i,
        RichMediaViewModel: h,
        RichMediaView: j,
        IframeRichMediaView: k,
        SoundCloudRichMediaView: l,
        AutoplayRichMediaView: m,
        SourcelessIframeRichMediaView: n,
        DynamicHeightRichMediaView: o,
        TwitterRichMediaView: p,
        ImageRichMediaView: q,
        FacebookPhotoRichMediaView: r,
        VineRichMediaView: s,
        instantiateRichMediaView: f.instantiateRichMediaView,
        getRichMediaViewConfig: f.getRichMediaViewConfig
    }
}), define("core/templates/react/BadgesManageTemplate", ["react", "underscore", "core/strings", "core/constants/badgesConstants"], function(a, b, c, d) {
    "use strict";
    var e = c.gettext,
        f = d.ACTION_TYPES,
        g = function(b) {
            var c = b.text,
                d = b.value,
                e = b.selected,
                f = b.handleChange;
            return a.createElement("label", {
                className: "padding-default align align__item--grow align__item--equal align--center align--column modal__option" + (e ? " -selected" : "")
            }, a.createElement("input", {
                type: "radio",
                name: "badge_action",
                value: d,
                checked: e,
                onChange: f
            }), a.createElement("p", {
                className: "text-semibold text-center modal__option-text"
            }, c))
        },
        h = function(b) {
            var c = b.badge,
                d = b.selectedBadge,
                e = b.handleChange;
            return a.createElement("span", {
                key: c.id,
                className: "badge-option spacing-right " + (d && d === c.id ? " selected" : "") + (c.disabled ? " disabled" : "")
            }, a.createElement("input", {
                id: "badge-" + c.id + "-input",
                name: "badge",
                type: "radio",
                className: "badge-option_input",
                value: c.id,
                onChange: e,
                disabled: c.disabled,
                tabIndex: "0"
            }), a.createElement("label", {
                htmlFor: "badge-" + c.id + "-input",
                className: "badge-option_label"
            }, a.createElement("span", {
                className: "badge-option_image-wrapper"
            }, a.createElement("img", {
                className: "badge-option_image",
                src: c.image,
                alt: c.name
            })), a.createElement("span", {
                className: "badge-option_title"
            }, c.name)))
        },
        i = function(b) {
            var c = b.badgeAction,
                d = b.formValues,
                i = b.badgeOptions,
                j = b.updateBadgeAction,
                k = b.updateBadgeSelection,
                l = b.handleSubmit,
                m = b.handleClose,
                n = "https://" + d.forum + ".disqus.com/admin/settings/badges";
            return a.createElement("form", {
                className: "badges-manage-form"
            }, a.createElement("div", {
                className: "admin-modal__content padding-bottom"
            }, a.createElement("div", null, a.createElement("div", {
                className: "align align--stretch align--wrap"
            }, a.createElement(g, {
                text: e("Award a Badge"),
                value: f.AWARD,
                selected: c === f.AWARD,
                handleChange: j
            }), a.createElement(g, {
                text: e("Remove a Badge"),
                value: f.REMOVE,
                selected: c === f.REMOVE,
                handleChange: j
            })), a.createElement("div", {
                className: "modal__description border-bottom-dark"
            }, a.createElement("p", {
                className: "modal__option-subtext"
            }, e(c === f.AWARD ? "Select a badge below to award it to this commenter." : "Select one of the manually awarded badges below to remove it from this commenter. Automatically awarded badges can only be removed by removing the badge from your site entirely."), a.createElement("br", null), e("You can manage your site's badges using the "), a.createElement("a", {
                href: n,
                target: "_blank",
                rel: "noopener noreferrer"
            }, e("Badges settings")), e(" in the Disqus Admin."))), a.createElement("div", {
                className: "modal__config"
            }, a.createElement("div", {
                className: "badge-options_list"
            }, i.map(function(b) {
                return a.createElement(h, {
                    key: b.id,
                    badge: b,
                    selectedBadge: d.badge,
                    handleChange: k
                })
            }), c === f.AWARD ? a.createElement("span", {
                className: "badge-option spacing-right create-badge"
            }, a.createElement("a", {
                className: "badge-option_link",
                href: n,
                target: "_blank",
                rel: "noopener noreferrer"
            }, a.createElement("span", {
                className: "badge-option_image-wrapper"
            }, a.createElement("span", {
                className: "icon icon-plus badge-option_add-icon"
            })), a.createElement("span", {
                className: "badge-option_title"
            }, e("Create a new badge")))) : null), c !== f.REMOVE || i.length ? null : a.createElement("div", {
                className: "badge-options_empty"
            }, e("This user doesn't have any badges.")), d.errorMessage ? a.createElement("div", {
                className: "spacing-top-narrow"
            }, a.createElement("p", {
                className: "text-small modal__option-subtext modal__error"
            }, d.errorMessage)) : null))), a.createElement("div", {
                className: "admin-modal__footer clearfix"
            }, a.createElement("button", {
                className: "button button-fill--brand button-small text-capitalized",
                onClick: l
            }, e(c === f.AWARD ? "Award badge" : "Remove badge")), a.createElement("button", {
                className: "button button-fill button-small text-capitalized",
                onClick: m
            }, e("Cancel"))))
        };
    return i
});
var _extends = Object.assign || function(a) {
    for (var b = 1; b < arguments.length; b++) {
        var c = arguments[b];
        for (var d in c) Object.prototype.hasOwnProperty.call(c, d) && (a[d] = c[d])
    }
    return a
};
define("lounge/views/posts/BadgesManageView", ["underscore", "backbone", "core/api", "core/bus", "core/strings", "core/utils", "core/templates/react/BadgesManageTemplate", "core/constants/badgesConstants"], function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = h.ACTION_TYPES,
        j = h.BADGES_CRITERIA,
        k = f.preventDefaultHandler,
        l = e.get,
        m = b.View.extend({
            className: "badges-action",
            initialize: function(a) {
                this.forum = a.forum
            },
            render: function() {
                var a = this.$el;
                return this.badgeAction = this.badgeAction || i.AWARD, this.formValues = _extends({
                    user: this.model.author.id,
                    forum: this.forum.id
                }, this.formValues), a.html(g({
                    badgeAction: this.badgeAction,
                    formValues: this.formValues,
                    badgeOptions: this.getBadgeOptions(),
                    updateBadgeAction: this.updateBadgeAction.bind(this),
                    updateBadgeSelection: this.updateBadgeSelection.bind(this),
                    handleSubmit: this.submit.bind(this),
                    handleClose: this.cancel.bind(this)
                })), this.trigger("render"), this
            },
            updateBadgeAction: function(a) {
                this.formValues.badge = null, this.formValues.errorMessage = null, this.badgeAction = a.target.value, this.render()
            },
            updateBadgeSelection: function(a) {
                this.formValues.errorMessage = null, a.target.disabled || (this.formValues.badge = a.target.value)
            },
            getBadgeOptions: function() {
                var a = [],
                    b = [],
                    c = this.forum.get("badges") ? f.deepClone(this.forum.get("badges")) : [],
                    d = this.model.author.get("badges") || [];
                if (this.badgeAction === i.AWARD) {
                    var e = d.map(function(a) {
                        return a.id
                    });
                    Object.keys(c).forEach(function(d) {
                        var f = c[d];
                        f.criteria === j.MANUAL && (e.indexOf(f.id) > -1 ? (f.disabled = !0, b.push(f)) : a.push(f))
                    })
                } else this.badgeAction === i.REMOVE && d.forEach(function(c) {
                    c.criteria === j.MANUAL ? a.push(c) : (c.disabled = !0, b.push(c))
                });
                return [].concat(a, b)
            },
            submit: k(function() {
                var b = this;
                if (this.formValues.badge) {
                    this.formValues.errorMessage = null;
                    var e = this.badgeAction === i.AWARD ? "uiAction:awardBadge" : "uiAction:removeBadge";
                    c.call("badges/" + this.badgeAction, {
                        method: "POST",
                        data: a.omit(this.formValues, a.isNull),
                        success: function(a) {
                            b.trigger("success", {
                                action: b.badgeAction,
                                badge: a.response
                            }), d.trigger(e, a.response.id)
                        },
                        error: function(a) {
                            b.formValues.errorMessage = a.responseJSON.response, b.render()
                        }
                    })
                } else this.badgeAction === i.AWARD ? this.formValues.errorMessage = l("You must select a badge to award") : this.formValues.errorMessage = l("You must select a badge to remove"), this.render()
            }),
            cancel: k(function() {
                this.trigger("cancel")
            })
        }, {
            defaultFormValues: {
                badge: null,
                errorMessage: null
            }
        });
    return m
}), define("core/constants/moderationUserLists", ["exports", "moment"], function(a, b) {
    "use strict";
    a.LIST_TYPES = {
        WHITELIST: "whitelist",
        BLACKLIST: "blacklist"
    }, a.BAN_TYPES = {
        SHADOW: "shadowban",
        PERMANENT: "permanent",
        TEMP: "temp"
    }, a.RETROACTIVE_ACTION_TYPES = {
        DO_NOTHING: "",
        DELETE: "1",
        MARK_AS_SPAM: "2"
    }, a.DEFAULT_FORM_VALUES = {
        durationHours: "24",
        customDurationAmount: "1",
        customDurationScale: "1"
    }, a.STORAGE_KEY_BAN_TYPE = "defaultBan", a.getDateExpires = function(a) {
        return "custom" === a.durationHours && (a.durationHours = parseInt(a.customDurationAmount, 10) * parseInt(a.customDurationScale, 10)), b().add(a.durationHours, "hours").toISOString()
    }, a.isBanTypeSupported = function(b, c) {
        return !!c && (b === a.BAN_TYPES.SHADOW ? c.shadowBanning : b === a.BAN_TYPES.TEMP ? c.temporaryBanning : Boolean(b))
    }
}), define("core/templates/react/ModerationUserListsTemplate", ["react", "underscore", "core/strings", "core/constants/moderationUserLists"], function(a, b, c, d) {
    "use strict";
    var e = this,
        f = c.gettext,
        g = d.LIST_TYPES,
        h = d.BAN_TYPES,
        i = d.RETROACTIVE_ACTION_TYPES,
        j = 168,
        k = [{
            label: f("1 day"),
            durationHours: "24"
        }, {
            label: f("1 week"),
            durationHours: j.toString()
        }, {
            label: f("2 weeks"),
            durationHours: (2 * j).toString()
        }],
        l = function(c) {
            var d = c.user,
                j = c.listName,
                l = c.ipAddress,
                m = c.formValues,
                n = c.supportsShadowBanning,
                o = c.supportsTempBanning,
                p = c.selectRetroactiveAction,
                q = c.toggleBanTypeCallback,
                r = c.toggleUserValueChecked,
                s = c.toggleIpAddressChecked,
                t = c.updateDuration,
                u = c.updateCustomDurationAmount,
                v = c.updateCustomDurationScale,
                w = c.updateReason,
                x = c.handleSubmit,
                y = c.handleClose,
                z = c.handleChangeValue,
                A = c.closeText,
                B = c.getPlaceholderForValue,
                C = c.itemTypes,
                D = c.itemType,
                E = c.UpgradeIcon,
                F = c.itemValue;
            return j ? a.createElement("form", {
                className: j + "-form"
            }, a.createElement("div", {
                className: "admin-modal__content padding-bottom"
            }, a.createElement("div", null, j === g.WHITELIST ? a.createElement("p", {
                className: "spacing-default"
            }, f("Adding this person to the whitelist will automatically approve his or her new comments from now on.")) : a.createElement("div", {
                className: "align align--stretch align--wrap"
            }, a.createElement("label", {
                className: ["padding-default", "align", "align__item--grow", "align__item--equal", "align--center", "align--column", "modal__option", "ban__option", o ? null : "-disabled", m.type === h.TEMP ? "-selected" : null].join(" ")
            }, a.createElement("input", {
                type: "radio",
                name: "ban_type",
                value: h.TEMP,
                checked: m.type === h.TEMP,
                onChange: q,
                disabled: !o
            }), a.createElement("p", {
                className: "text-semibold text-center modal__option-text ban__option-text"
            }, f("Timeout"), o ? null : a.createElement(E, {
                tooltipClass: "tooltip-timeout"
            }))), j === g.BLACKLIST && m.type === h.TEMP ? a.createElement("div", {
                className: "padding-default modal__description ban__description border-bottom-dark"
            }, a.createElement("div", {
                className: "text-small modal__option-subtext ban__option-subtext"
            }, f("Restrict a user's ability to comment for a period of time. This notifies the user of their timeout. If discussions get heated, enforce timeouts so that users cool off and improve their behavior."), k.map(function(b) {
                return a.createElement("label", {
                    className: "fieldset__block--checkbox text-medium spacing-bottom-small text-semibold text-gray-dark",
                    key: b.durationHours
                }, a.createElement("input", {
                    type: "radio",
                    name: "duration",
                    checked: m.durationHours === b.durationHours,
                    onChange: t,
                    value: b.durationHours,
                    className: "spacing-right-small"
                }), b.label)
            }), a.createElement("div", null, a.createElement("label", {
                className: "text-medium spacing-bottom-small inline__item spacing-right text-semibold text-gray-dark"
            }, a.createElement("input", {
                type: "radio",
                name: "duration",
                checked: "custom" === m.durationHours,
                onChange: t,
                value: "custom",
                className: "spacing-right-small"
            }), f("Custom")), a.createElement("input", {
                name: "customDurationAmount",
                type: "number",
                value: m.customDurationAmount,
                onChange: u,
                onFocus: u,
                onKeyPress: u,
                className: "spacing-right-small -text-small",
                maxLength: "2",
                style: {
                    width: "50px"
                },
                min: "0"
            }), a.createElement("select", {
                value: m.customDurationScale,
                onChange: v
            }, a.createElement("option", {
                value: "1"
            }, "Hour(s)"), a.createElement("option", {
                value: "24"
            }, "Day(s)"), a.createElement("option", {
                value: 168..toString()
            }, "Week(s)"))))) : null, a.createElement("label", {
                className: ["padding-default", "align", "align__item--grow", "align__item--equal", "align--center", "align--column", "modal__option", "ban__option", n ? null : "-disabled", m.type === h.SHADOW ? "-selected" : null].join(" ")
            }, a.createElement("input", {
                type: "radio",
                name: "ban_type",
                value: h.SHADOW,
                checked: m.type === h.SHADOW,
                onChange: q,
                disabled: !n
            }), a.createElement("p", {
                className: "text-semibold text-center modal__option-text ban__option-text"
            }, f("Shadow Ban"), n ? null : a.createElement(E, null))), j === g.BLACKLIST && m.type === h.SHADOW ? a.createElement("div", {
                className: "modal__description ban__description border-bottom-dark"
            }, a.createElement("p", {
                className: "text-small modal__option-subtext ban__option-subtext"
            }, f("Ban a user without them knowing. The user can still comment, however, their posts will only be visible to themselves. Use it against trolls and spammers who attempt to circumvent a ban with new accounts."))) : null, a.createElement("label", {
                className: ["padding-default", "align", "align__item--grow", "align__item--equal", "align--center", "align--column", "modal__option", "ban__option", m.type === h.PERMANENT ? "-selected" : null].join(" ")
            }, a.createElement("input", {
                type: "radio",
                name: "ban_type",
                value: h.PERMANENT,
                checked: m.type === h.PERMANENT,
                onChange: q
            }), a.createElement("p", {
                className: "text-semibold text-center modal__option-text ban__option-text"
            }, "Permanent Ban")), j === g.BLACKLIST && m.type === h.PERMANENT ? a.createElement("div", {
                className: "modal__description ban__description border-bottom-dark"
            }, a.createElement("p", {
                className: "text-small modal__option-subtext ban__option-subtext"
            }, f("Permanently ban the user so they can no longer post, vote, or flag comments on your site. If the user repeatedly violates your comment policy, revoke their ability to participate."), a.createElement("label", {
                className: "fieldset__block--checkbox text-medium spacing-bottom-small"
            }, a.createElement("span", {
                className: "text-semibold text-gray-dark"
            }, f("Last 30 days of comments:"), " "), a.createElement("select", {
                value: m.retroactiveAction,
                onChange: p,
                className: "custom-select"
            }, a.createElement("option", {
                value: i.DO_NOTHING
            }, f("Do nothing")), a.createElement("option", {
                value: i.DELETE
            }, f("Delete")), a.createElement("option", {
                value: i.MARK_AS_SPAM
            }, f("Mark as spam")))))) : null)), a.createElement("div", {
                className: "padding-default modal__config ban__config"
            }, !d || d.isAnonymous ? null : a.createElement("div", {
                className: "align align--stretch access__block spacing-bottom embed-hidden"
            }, a.createElement("a", {
                href: d.profileUrl,
                className: "spacing-right"
            }, a.createElement("img", {
                src: d.avatar.cache,
                alt: d.name,
                className: "comment-__avatar border-radius-sm"
            })), a.createElement("div", {
                className: "access__value"
            }, a.createElement("h4", null, d.name), a.createElement("p", {
                className: "text-gray text-small"
            }, " ", d.username, " "))), d ? a.createElement("label", {
                className: "fieldset__block--checkbox text-medium spacing-bottom-small"
            }, a.createElement("input", {
                type: "checkbox",
                checked: Boolean(m.username),
                onChange: b.partial(r, b, "username"),
                className: "spacing-right-small"
            }), f("User:"), " ", " ", a.createElement("strong", null, " ", d.username, " ")) : a.createElement(a.Fragment, null, a.createElement("div", {
                className: "spacing-top spacing-bottom form-attribute-input"
            }, a.createElement("div", null, a.createElement("h3", {
                className: "text-gray-darker"
            }, "Type")), a.createElement("select", {
                name: "itemType",
                className: "input--select",
                value: e.itemType,
                onChange: z,
                disabled: C.length <= 1
            }, C.map(function(b) {
                return a.createElement("option", {
                    key: b.value,
                    value: b.value
                }, " ", b.displayName, " ")
            }))), a.createElement("div", {
                className: "spacing-top spacing-bottom form-attribute-input"
            }, a.createElement("h3", {
                className: "text-gray-darker"
            }, "Value"), a.createElement("div", null, a.createElement("input", {
                className: "input--textbox",
                name: "itemValue",
                type: "text",
                placeholder: B(D),
                value: F,
                onChange: z
            })))), d && j === g.BLACKLIST ? a.createElement("label", {
                className: "fieldset__block--checkbox text-medium spacing-bottom-small"
            }, a.createElement("input", {
                type: "checkbox",
                checked: Boolean(m.email),
                onChange: b.partial(r, b, "email"),
                className: "spacing-right-small"
            }), f("Email:"), " ", a.createElement("strong", null, " ", d.email, " ")) : null, j === g.BLACKLIST && l ? a.createElement("label", {
                className: "fieldset__block--checkbox text-medium spacing-bottom-small"
            }, a.createElement("input", {
                type: "checkbox",
                checked: Boolean(m.ipAddress),
                onChange: s,
                className: "spacing-right-small"
            }), f("IP Address:"), " ", a.createElement("strong", null, " ", l, " "), a.createElement("div", {
                className: ["spacing-default-narrow", "text-small", "text-gray", "spacing-left-large", "embed-hidden"].join(" ")
            }, a.createElement("strong", null, f("Note:"), " "), f("Adding an IP address to the banned list may also unintentionally block others who may share this IP address."))) : null, j === g.BLACKLIST ? a.createElement("div", null, a.createElement("div", {
                className: "spacing-bottom-small spacing-top-narrow"
            }, a.createElement("label", {
                className: "modal__reason ban__reason"
            }, f("Reason for banning:"), a.createElement("input", {
                name: "reason",
                type: "text",
                value: m.reason || "",
                onChange: w,
                className: "input--textbox -text-small border-gray-light",
                maxLength: "50"
            }))), a.createElement("p", {
                className: "text-small modal__option-subtext ban__option-subtext"
            }, f("You can remove the user from the banned list at any time."))) : null)), a.createElement("div", {
                className: "admin-modal__footer clearfix"
            }, a.createElement("div", null, a.createElement("button", {
                className: ["button", "button-fill--brand", "button-small", "text-capitalized"].join(" "),
                disabled: !(m.email || m.username || m.ipAddress || F),
                onClick: x
            }, f(j === g.WHITELIST ? "Add to Trusted List" : "Add to Banned List")), j === g.BLACKLIST ? a.createElement("button", {
                className: ["button", "button-fill", "button-small", "text-capitalized"].join(" "),
                onClick: y
            }, f(A)) : null))) : null
        };
    return l
}), define("lounge/utils", ["jquery", "core/api"], function(a, b) {
    "use strict";
    var c = {},
        d = function(d) {
            if (c[d]) return c[d];
            var e = a.Deferred();
            return d ? (c[d] = e.promise(), b.call("forums/details", {
                method: "GET",
                data: {
                    forum: d,
                    attach: "forumFeatures"
                }
            }).done(function(a) {
                e.resolve(a.response.features)
            }).fail(function() {
                e.reject({})
            }), e.promise()) : e.reject({})
        };
    return d._clearCache = function() {
        c = {}
    }, {
        getSaasFeatures: d
    }
});
var _extends = Object.assign || function(a) {
    for (var b = 1; b < arguments.length; b++) {
        var c = arguments[b];
        for (var d in c) Object.prototype.hasOwnProperty.call(c, d) && (a[d] = c[d])
    }
    return a
};
define("lounge/views/posts/BlacklistView", ["jquery", "underscore", "backbone", "react", "moment", "core/bus", "core/api", "core/utils", "core/utils/storage", "core/templates/react/ModerationUserListsTemplate", "core/constants/moderationUserLists", "lounge/utils", "lounge/views/cards"], function(a, b, c, d, e, f, g, h, i, j, k, l, m) {
    "use strict";
    var n = k.BAN_TYPES,
        o = k.LIST_TYPES,
        p = k.STORAGE_KEY_BAN_TYPE,
        q = k.RETROACTIVE_ACTION_TYPES,
        r = k.DEFAULT_FORM_VALUES,
        s = k.getDateExpires,
        t = k.isBanTypeSupported,
        u = h.preventDefaultHandler,
        v = c.View.extend({
            className: "moderate",
            initialize: function(b) {
                this.forum = b.forum;
                var c = [l.getSaasFeatures(this.model.get("forum"))];
                this.model.get("ipAddress") && this.model.author.get("email") || c.push(this.model.fetch()), this.loading = a.when.apply(a, c)
            },
            render: function() {
                var a = this,
                    b = this.$el;
                return b.addClass("loading"), f.trigger("uiAction:viewBanUser"), this.loading.always(function(c) {
                    var e = a.model.author,
                        f = i.get(p);
                    a.saasFeatures = c, a.formValues = _extends({}, r, {
                        type: t(f, c) ? f : n.PERMANENT,
                        username: e.get("username"),
                        email: e.get("email"),
                        user: e.get("id"),
                        postId: a.model.id
                    }, a.formValues), b.removeClass("loading"), b.html(j({
                        user: e.toJSON(),
                        listName: o.BLACKLIST,
                        ipAddress: a.model.get("ipAddress"),
                        formValues: a.formValues,
                        supportsShadowBanning: t(n.SHADOW, a.saasFeatures),
                        supportsTempBanning: t(n.TEMP, a.saasFeatures),
                        selectRetroactiveAction: a.selectRetroactiveAction.bind(a),
                        toggleBanTypeCallback: a.toggleBanTypeCallback.bind(a),
                        toggleUserValueChecked: a.toggleUserValueChecked.bind(a),
                        toggleIpAddressChecked: a.toggleIpAddressChecked.bind(a),
                        updateReason: a.updateReason.bind(a),
                        updateDuration: a.updateDuration.bind(a),
                        updateCustomDurationAmount: a.updateCustomDurationAmount.bind(a),
                        updateCustomDurationScale: a.updateCustomDurationScale.bind(a),
                        handleSubmit: a.submit.bind(a),
                        handleClose: a.cancel.bind(a),
                        closeText: "Cancel",
                        UpgradeIcon: function() {
                            return d.createElement("span", {
                                className: "text-largest text-yellow icon-upgrade-arrow-pro media-middle spacing-left upgrade-card",
                                "data-role": "upgrade-card-target"
                            })
                        }
                    })), a.initUpgradeCard()
                }), this.trigger("render"), this
            },
            initUpgradeCard: function() {
                var b = m.UpgradeCard.create({
                    organization: this.forum ? {
                        id: this.forum.get("organizationId")
                    } : null
                });
                this.$("[data-role=upgrade-card-target]").each(function() {
                    b.target(a(this))
                }), this.listenToOnce(b, "show", function() {
                    f.trigger("uiAction:viewUpgradeCard")
                }), this.listenTo(b, "click:upgrade", function(a) {
                    a.stopPropagation(), f.trigger("uiAction:clickUpgrade")
                })
            },
            toggleBanType: function(a, b) {
                t(b, this.saasFeatures) && (this.formValues.type = b, i.set(p, b), this.render())
            },
            toggleBanTypeCallback: function(a) {
                this.toggleBanType(a, a.target.value)
            },
            selectRetroactiveAction: function(a) {
                this.formValues.retroactiveAction = a.target.value || q.DO_NOTHING
            },
            toggleUserValueChecked: function(a, b) {
                this.formValues[b] = a.target.checked ? 1 : 0
            },
            toggleIpAddressChecked: function(a) {
                this.formValues.ipAddress = a.target.checked ? 1 : 0
            },
            updateReason: function(a) {
                this.formValues.reason = a.target.value
            },
            updateDuration: function(a) {
                this.formValues.durationHours = a.target.value
            },
            updateCustomDurationAmount: function(a) {
                var b = this;
                if ("keypress" === a.type && /[^\d]/.test(a.key)) return void a.preventDefault();
                var c = a.target.value,
                    d = "custom";
                this.formValues.customDurationAmount === c && this.formValues.durationHours === d || (this.formValues.customDurationAmount = c, this.formValues.durationHours = d, a.target === window.document.activeElement && this.once("render", function() {
                    b.$("input[name=customDurationAmount]").focus()
                }), this.render())
            },
            updateCustomDurationScale: function(a) {
                this.formValues.customDurationScale = a.target.value, this.formValues.durationHours = "custom", this.render()
            },
            cancel: u(function() {
                this.trigger("cancel")
            }),
            submit: u(function() {
                var a = this,
                    c = this.formValues.type === n.TEMP ? s(this.formValues) : null;
                f.trigger("uiAction:clickBanUser", JSON.stringify({
                    date_expires: c,
                    date_added: e().toISOString()
                }));
                var d = {
                    post: this.formValues.postId,
                    notes: this.formValues.reason,
                    shadowBan: this.formValues.type === n.SHADOW ? 1 : 0,
                    dateExpires: c
                };
                this.formValues.email && (d.banEmail = 1), this.formValues.username && (d.banUser = 1), this.formValues.ipAddress && (d.banIp = 1), this.formValues.type === n.PERMANENT && (d.retroactiveAction = this.formValues.retroactiveAction), d.post && g.call("forums/block/banPostAuthor.json", {
                    method: "POST",
                    data: b.omit(d, b.isNull),
                    success: function() {
                        a.trigger("success")
                    }
                })
            })
        }, {
            defaultFormValues: {
                postId: null,
                username: null,
                email: null,
                ipAddress: null,
                reason: "",
                retroactiveAction: null
            }
        });
    return v
}), define("templates/lounge/edit", ["react"], function(a) {
    "use strict";
    var b = function() {
        return a.createElement("div", {
            className: "textarea-outer-wrapper"
        }, a.createElement("div", {
            className: "ratings-wrapper",
            "data-role": "ratings-container"
        }), a.createElement("div", {
            className: "textarea-wrapper",
            "data-role": "textarea"
        }, a.createElement("div", {
            className: "edit-alert",
            role: "postbox-alert"
        }), a.createElement("div", {
            className: "text-editor-container"
        })))
    };
    return b
}), define("lounge/views/posts/PostEditView", ["backbone", "moment", "underscore", "core/bus", "core/mixins/withAlert", "core/strings", "core/time", "core/views/TextareaView", "core/utils/threadRatingsHelpers", "lounge/common", "lounge/mixins/asTextEditor", "lounge/mixins/withStarRatings", "templates/lounge/edit", "templates/lounge/textEditor"], function(a, b, c, d, e, f, g, h, i, j, k, l, m, n) {
    "use strict";
    var o = f.get,
        p = a.View.extend({
            tagName: "form",
            className: "edit",
            events: {
                submit: "submitForm",
                "click [data-action=cancel]": "cancel"
            },
            initialize: function(a) {
                this.post = a.post, this.session = a.session, this.thread = a.thread, this._alertSelector = "[role=postbox-alert]", this.textEditorTemplate = n, this.postEditMode = !0
            },
            cancel: function() {
                this.trigger("cancel")
            },
            getEditTimeLeft: function() {
                var a, c = b().format(g.ISO_8601);
                return a = c < this.post.get("editableUntil") ? f.interpolate(o("You have until %(editableUntil)s to edit this comment."), {
                    editableUntil: this.post.getRelativeCreatedAt("editableUntil")
                }) : o("The edit period for this comment has expired."), '<div class="edit-time-left">' + a + ' <a class="edit-time-message"href="https://help.disqus.com/commenting/remove-and-edit-your-comments"target="_blank"rel="noopener noreferrer"align="center">' + o("Learn more") + "</a></div>"
            },
            render: function() {
                var a = this.post.toJSON();
                this.$el.html(m({
                    post: a,
                    user: this.session.toJSON(),
                    forum: this.thread.forum
                })), this.initTextEditor();
                var b = this.textarea = new h({
                        value: a.raw_message
                    }),
                    c = this.getEditTimeLeft();
                return this.$("[data-role=textarea]").prepend(b.render().el).after(c), this.initStarRatings(), this
            },
            resize: function() {
                var a = j.getLounge();
                a && this.textarea && this.textarea.$input && this.textarea.$input.on("transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd", function() {
                    a.resize()
                }), this.textarea.resize()
            },
            submitForm: function(a) {
                this.dismissAlert(), a && a.preventDefault() && a.preventDefault();
                var b = this,
                    e = {
                        raw_message: this.textarea.get(),
                        rating: this.rating
                    },
                    f = b.post.validateMessage(e);
                return void 0 !== f ? this.alert(f, {
                    type: "error"
                }) : void b.post.save(e, {
                    success: function() {
                        b.trigger("submitted"), d.trigger("uiCallback:postUpdated", b.post, {
                            area: "main"
                        }), c.isNumber(b.rating) && i.isThreadModelRatingsEnabled(b.thread) && (b.thread.set("userRating", b.rating), c.delay(c.bind(b.thread.fetchRatings, b.thread), 500))
                    },
                    error: function(a, c) {
                        var d;
                        return d = c.response.indexOf("Comment edit period expired") > -1 ? o("You can no longer edit this comment. Comments can only be edited within 7 days after posting.") + ' <a href="https://help.disqus.com/commenting/remove-and-edit-your-comments" target="_blank" rel="noopener noreferrer"style="color:white ! important" >' + o("Learn more") + "</a>" : c.response, b.alert(d, {
                            type: "error",
                            safe: !0
                        })
                    }
                })
            },
            remove: function() {
                this.$el.remove()
            }
        });
    return e.call(p.prototype), l.call(p.prototype), k.call(p.prototype), p
}), define("lounge/views/posts/TypingUserView", ["backbone", "core/strings"], function(a, b) {
    "use strict";
    var c = b.get,
        d = a.View.extend({
            initialize: function(a) {
                this.options = a
            },
            render: function() {
                var a, d = this.options.parentView.reply,
                    e = d && d.typingUser,
                    f = this.model.usersTyping.count(e && e.id);
                return f <= 0 ? void this.$el.hide() : (1 === f ? a = c("One other person is typing…") : (a = c("%(num)s other people are typing…"), a = b.interpolate(a, {
                    num: f
                })), this.$el.text(a), this.$el.show(), this)
            }
        });
    return d
});
var _extends = Object.assign || function(a) {
    for (var b = 1; b < arguments.length; b++) {
        var c = arguments[b];
        for (var d in c) Object.prototype.hasOwnProperty.call(c, d) && (a[d] = c[d])
    }
    return a
};
define("templates/lounge/flaggingReasons", ["react", "core/strings"], function(a, b) {
    "use strict";
    var c = b.gettext,
        d = [{
            id: 6,
            title: c("I disagree with this user")
        }, {
            id: 0,
            title: c("Targeted harassment"),
            description: c("posted or encouraged others to post harassing comments or hate speech targeting me, other individuals, or groups")
        }, {
            id: 1,
            title: c("Spam"),
            description: c("posted spam comments or discussions")
        }, {
            id: 2,
            title: c("Inappropriate profile"),
            description: c("profile contains inappropriate images or text")
        }, {
            id: 3,
            title: c("Threatening content"),
            description: c("posted directly threatening content")
        }, {
            id: 4,
            title: c("Impersonation"),
            description: c("misrepresents themselves as someone else")
        }, {
            id: 5,
            title: c("Private information"),
            description: c("posted someone else's personally identifiable information")
        }],
        e = function(b) {
            var c = b.id,
                d = b.title,
                e = b.description,
                f = b.updateReason;
            return a.createElement("label", {
                className: ["padding-default", "flagging__reason"].join(" ")
            }, a.createElement("input", {
                type: "radio",
                name: "reason",
                value: c,
                onChange: f
            }), a.createElement("p", {
                className: "text-bold flagging__reason-text"
            }, d, e ? a.createElement("span", {
                className: "text-small text-normal"
            }, " — ", e) : null))
        },
        f = function(b) {
            var f = b.updateReason,
                g = b.handleSubmit,
                h = b.handleCancel;
            return a.createElement("form", {
                className: "flagging-form"
            }, a.createElement("div", {
                className: "flagging__title text-semibold"
            }, c("Flag Comment")), a.createElement("div", {
                className: "flagging__content"
            }, a.createElement("p", {
                className: "flagging__subtitle text-semibold"
            }, c("Why are you flagging this comment?")), d.map(function(b) {
                return a.createElement(e, _extends({
                    key: b.id,
                    updateReason: f
                }, b))
            }), a.createElement("p", {
                className: "flagging__reason-subtext"
            }, c("Before flagging, please keep in mind that %(disqus)s does not moderate communities. Your username will be shown to the moderator, so you should only flag this comment for one of the reasons listed above.", {
                disqus: "Disqus"
            }))), a.createElement("div", {
                className: "admin-modal__footer -mobile clearfix"
            }, a.createElement("button", {
                className: "button button-fill--brand",
                onClick: g
            }, c("Flag Comment")), " ", a.createElement("button", {
                className: "button button-fill",
                onClick: h
            }, c("Cancel"))))
        };
    return f
}), define("templates/lounge/flaggingUserBlocking", ["react", "core/strings", "core/switches", "templates/lounge/partials/profileLink"], function(a, b, c, d) {
    "use strict";
    var e = b.gettext,
        f = function(b) {
            var f = b.user,
                g = b.forumId,
                h = b.handleBlock,
                i = b.handleComplete;
            return a.createElement("div", {
                className: "flagging__blocking-form"
            }, a.createElement("div", {
                className: "flagging__title text-semibold"
            }, e("Thanks for your feedback!")), c.isFeatureActive("sso_less_branding", {
                forum: g
            }) ? a.createElement("div", {
                className: "admin-modal__footer -mobile clearfix"
            }, a.createElement("button", {
                className: "button button-fill--brand",
                onClick: i
            }, e("Done"))) : [a.createElement("div", {
                key: "blocking-0",
                className: "flagging__blocking-content"
            }, a.createElement("p", {
                className: "flagging__subtitle text-semibold"
            }, e("Other tools for you:")), a.createElement("p", {
                className: "spacing-bottom"
            }, e("Blocking this user will hide all of their activity and comments from your %(disqus)s content, feeds, and notifications.", {
                disqus: "Disqus"
            })), a.createElement("p", {
                className: "spacing-top spacing-bottom-none"
            }, e("Would you like to block %(user)s?", {
                user: a.createElement(d, {
                    user: f,
                    forumId: g,
                    className: "text-semibold"
                }, f.name)
            }))), a.createElement("div", {
                key: "blocking-1",
                className: "admin-modal__footer -mobile clearfix"
            }, a.createElement("div", null, a.createElement("button", {
                className: "button button-fill--red",
                onClick: h
            }, e("Block User")), " ", a.createElement("button", {
                className: "button button-fill",
                onClick: i
            }, e("No Thanks"))))])
        };
    return f
}), define("templates/lounge/flaggingUserBlocked", ["react", "core/strings"], function(a, b) {
    "use strict";
    var c = b.gettext,
        d = function(b) {
            var d = b.displayName,
                e = b.handleComplete,
                f = b.error;
            return a.createElement("div", {
                className: "flagging__blocking-complete"
            }, a.createElement("div", {
                className: "flagging__title"
            }, c("Blocked User")), a.createElement("div", {
                className: "flagging__blocking-complete-content"
            }, a.createElement("img", {
                className: "flagging-pam",
                alt: "Pam",
                src: "https://c.disquscdn.com/next/embed/assets/img/PamX.fe88e2955f3d594a6cc13c66569ed7d0.svg"
            }), f ? a.createElement("p", {
                className: "spacing-top-bottom"
            }, f) : a.createElement("div", null, a.createElement("p", {
                className: "spacing-top-bottom text-semibold"
            }, c("You've blocked %(user)s.", {
                user: d
            })), a.createElement("p", {
                className: "spacing-top-bottom"
            }, c("You won't see comments from this user on %(disqus)s in discussions, notifications, and more.", {
                disqus: "Disqus"
            })))), a.createElement("div", {
                className: "admin-modal__footer -mobile clearfix"
            }, a.createElement("div", null, a.createElement("button", {
                className: "button button-fill--brand",
                onClick: e
            }, c("Done")), " ", a.createElement("a", {
                className: "button button-fill",
                href: "https://disqus.com/home/settings/blocking/",
                target: "_blank",
                rel: "noopener noreferrer",
                onClick: e
            }, c("Manage Blocked Users")))))
        };
    return d
}), define("lounge/views/posts/FlaggingView", ["backbone", "core/api", "core/utils", "core/bus", "core/strings", "templates/lounge/flaggingReasons", "templates/lounge/flaggingUserBlocking", "templates/lounge/flaggingUserBlocked"], function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = c.preventDefaultHandler,
        j = e.gettext,
        k = a.View.extend({
            className: "moderate",
            render: function() {
                if (this.model.get("isFlaggedByUser"))
                    if (this.blockComplete) {
                        var a = this.model.author;
                        this.$el.html(h({
                            displayName: a.get("name"),
                            error: this.blockError,
                            handleComplete: this.handleComplete.bind(this)
                        }))
                    } else {
                        var b = this.model.author;
                        this.$el.html(g({
                            user: b.toJSON(),
                            forumId: this.model.get("forum"),
                            handleBlock: this.handleBlockUser.bind(this),
                            handleComplete: this.handleComplete.bind(this)
                        })), d.trigger("uiAction:viewBlockUser")
                    }
                else this.$el.html(f({
                    updateReason: this.updateFlaggingReason.bind(this),
                    handleSubmit: this.submitReason.bind(this),
                    handleCancel: this.cancel.bind(this)
                })), d.trigger("uiAction:viewFlagPost");
                return this
            },
            updateFlaggingReason: function(a) {
                this.reason = a.target.value
            },
            cancel: i(function() {
                this.trigger("cancel")
            }),
            handleComplete: function() {
                this.trigger("success")
            },
            submitReason: i(function() {
                this.reason && (d.trigger("uiAction:clickFlagPost"), this.model.report(this.reason), this.model.set("isFlaggedByUser", !0), this.render())
            }),
            handleBlockUser: i(function() {
                var a = this,
                    c = this.model.author;
                return d.trigger("uiAction:clickBlockUser"), c.block().fail(function(c) {
                    var d = j("Something went wrong while trying to block this user. Please try again later."),
                        e = c && c.responseJSON && c.responseJSON.code;
                    e === b.ERROR_CODES.MAX_ITEMS_REACHED && (d = j("Unfortunately this user could not be blocked; you have reached the limit for number of users blocked.")), a.blockError = d
                }).always(function() {
                    a.blockComplete = !0, a.render()
                })
            })
        });
    return k
}), define("core/views/Tooltip", ["jquery", "core/views/common/HoverCard"], function(a, b) {
    "use strict";
    var c = b.extend({
        className: "tooltip-outer message-card",
        initialize: function(a) {
            b.prototype.initialize.call(this, a), this.template = a.template, this.message = a.message
        },
        render: function() {
            if (this.template) this.$el.html(this.template());
            else {
                if (!this.message) return;
                this.$el.html(a("<div>").addClass("tooltip").text(this.message))
            }
            b.prototype.render.call(this)
        },
        moveTo: function(a) {
            if (a) {
                var b = this.constructor.POSITION_OFFSET,
                    c = a.offset(),
                    d = this.getContainerPosition(),
                    e = this.$el.width();
                this.$el.css({
                    bottom: d.containerOffset.height - c.top + b,
                    top: "inherit",
                    left: c.left - e / 2
                })
            }
        }
    }, {
        create: function(a) {
            return b.create(a.id, a, "Tooltip", c)
        },
        POSITION_OFFSET: 10
    });
    return c
}), define("core/views/ClickTooltip", ["underscore", "core/views/common/HoverCard", "core/views/Tooltip"], function(a, b, c) {
    "use strict";
    var d = c.extend({
        target: function(b) {
            b.on("click", a.bind(this.targetClicked, this, b)), b.on("mouseleave", a.bind(this.leave, this))
        },
        targetClicked: function(a) {
            a && (this.$target = a), "in" !== this._hoverState && (this._hoverState = "in", this.show(), c.open[this.uid] = this)
        }
    }, {
        create: function(a) {
            return b.create(a.id, a, "ClickTooltip", d)
        }
    });
    return d
}), define("templates/lounge/partials/postVotes", ["react", "core/constants/voteConstants", "core/strings", "core/utils/object/get"], function(a, b, c, d) {
    "use strict";
    var e = c.gettext,
        f = function(c) {
            return c.votingType === b.VOTING_TYPES.DISABLED ? null : a.createElement("div", {
                className: "post-votes"
            }, a.createElement("a", {
                href: "#",
                className: "vote-up " + (d(c.post, ["userScore"], 0) > 0 ? "upvoted" : "") + " count-" + d(c.post, ["likes"], ""),
                "data-action": "upvote",
                title: d(c.post, ["likes"]) ? "" : e("Vote up"),
                name: e("Vote up")
            }, a.createElement("span", {
                className: "updatable count",
                "data-role": "likes"
            }, d(c.post, ["likes"], null)), " ", a.createElement("span", {
                className: "control"
            }, a.createElement("i", {
                "aria-hidden": "true",
                className: "icon icon-arrow-2"
            }))), c.votingType === b.VOTING_TYPES.DOWNVOTE_DISABLED ? null : a.createElement("div", {
                className: "post-votes__separator"
            }, ""), c.votingType === b.VOTING_TYPES.DOWNVOTE_DISABLED ? null : a.createElement("a", {
                href: "#",
                className: "vote-down " + (d(c.post, ["userScore"], 0) < 0 ? "downvoted" : "") + " count-" + (c.votingType === b.VOTING_TYPES.DOWNVOTE_LIMITED ? 0 : d(c.post, ["dislikes"], "")),
                "data-action": "downvote",
                title: d(c.post, ["dislikes"]) ? "" : e("Vote down"),
                name: e("Vote down")
            }, a.createElement("span", {
                className: "control"
            }, a.createElement("i", {
                "aria-hidden": "true",
                className: "icon icon-arrow"
            })), " ", a.createElement("span", {
                className: "updatable count",
                "data-role": "dislikes"
            }, d(c.post, ["dislikes"], null))))
        };
    return f
}), define("templates/lounge/partials/postFooter", ["react", "core/constants/voteConstants", "core/strings", "core/switches", "core/utils/object/get", "templates/lounge/partials/postVotes"], function(a, b, c, d, e, f) {
    "use strict";
    var g = c.gettext,
        h = function(c) {
            var h = (e(c.session, ["isRegistered"]) || !d.isFeatureActive("sso_less_branding", {
                forum: c.post.forum
            })) && c.votingType !== b.VOTING_TYPES.DISABLED;
            return a.createElement("menu", {
                className: "comment-footer__menu"
            }, h ? [a.createElement("li", {
                key: "vote-0",
                className: "voting",
                "data-role": "voting"
            }, a.createElement(f, {
                post: c.post,
                votingType: c.votingType
            })), a.createElement("li", {
                key: "vote-1",
                className: "bullet",
                "aria-hidden": "true"
            }, "•")] : null, e(c.post, ["canBeEdited"]) ? [a.createElement("li", {
                key: "edit-0",
                className: "edit",
                "data-role": "edit-link"
            }, a.createElement("a", {
                className: "comment-footer__action",
                href: "#",
                "data-action": "edit"
            }, a.createElement("span", {
                className: "text"
            }, g("Edit")))), a.createElement("li", {
                key: "edit-1",
                className: "bullet",
                "aria-hidden": "true"
            }, "•")] : null, e(c.post, ["canBeRepliedTo"]) ? [a.createElement("li", {
                key: "reply-0",
                className: "reply",
                "data-role": "reply-link"
            }, a.createElement("a", {
                className: "comment-footer__action",
                href: "#",
                "data-action": "reply"
            }, a.createElement("span", {
                className: "text"
            }, g("Reply")))), a.createElement("li", {
                key: "reply-1",
                className: "bullet",
                "aria-hidden": "true"
            }, "•")] : null, e(c.post, ["isSponsored"]) && !e(c.post, ["hideViewAllComments"]) ? [a.createElement("li", {
                key: "sponsored-0",
                className: "thread-link",
                "data-role": "thread-link"
            }, a.createElement("a", {
                href: e(c.post, ["permalink"], ""),
                target: "_blank",
                rel: "noopener noreferrer",
                "data-action": "thread"
            }, a.createElement("i", {
                className: "icon icon-mobile"
            }), a.createElement("span", {
                className: "text"
            }, g("View all comments")), a.createElement("span", {
                className: "mobile-text"
            }, g("All Comments")))), a.createElement("li", {
                key: "sponsored-1",
                className: "bullet",
                "aria-hidden": "true"
            }, "•")] : null, e(c.post, ["canBeShared"]) ? a.createElement("li", {
                id: "comment__share-" + e(c.post, ["id"], ""),
                className: "comment__share"
            }, a.createElement("a", {
                className: "toggle",
                href: "#",
                "data-action": "expand-share"
            }, a.createElement("span", {
                className: "text"
            }, g("Share"), " ›")), a.createElement("ul", {
                className: "comment-share__buttons"
            }, c.disableSocialShare ? null : a.createElement("div", {
                className: "comment-share__social-share-buttons"
            }, a.createElement("li", {
                className: "twitter share__button-container"
            }, a.createElement("button", {
                className: "share__button icon icon-twitter",
                "data-action": "share:twitter"
            })), a.createElement("li", {
                className: "facebook share__button-container"
            }, a.createElement("button", {
                className: "share__button icon icon-facebook",
                "data-action": "share:facebook"
            }))), a.createElement("li", {
                className: "link share__button-container"
            }, a.createElement("button", {
                className: "share__button icon icon-link",
                value: e(c.post, ["shortLink"], ""),
                name: g("Link"),
                title: g("Click to copy post link"),
                "data-action": "copy-link"
            }), a.createElement("input", {
                className: "share__button link_url",
                value: e(c.post, ["shortLink"], ""),
                name: g("Link"),
                title: g("Click to copy post link"),
                "data-action": "copy-link",
                readOnly: !0
            })))) : null, e(c.post, ["isDeleted"]) ? null : a.createElement("li", {
                className: "realtime",
                "data-role": "realtime-notification:" + e(c.post, ["id"], "")
            }, a.createElement("span", {
                style: {
                    display: "none"
                },
                className: "realtime-replies"
            }), a.createElement("a", {
                style: {
                    display: "none"
                },
                href: "#",
                className: "realtime-button"
            })), e(c.post, ["isSponsored"]) ? a.createElement("li", {
                className: "feedback"
            }, a.createElement("button", {
                "data-action": "feedback"
            }, g("Leave Feedback"))) : null)
        };
    return h
});
var _extends = Object.assign || function(a) {
    for (var b = 1; b < arguments.length; b++) {
        var c = arguments[b];
        for (var d in c) Object.prototype.hasOwnProperty.call(c, d) && (a[d] = c[d])
    }
    return a
};
define("templates/lounge/partials/postMenu", ["react", "core/config/urls", "core/strings", "core/switches", "core/utils/object/get"], function(a, b, c, d, e) {
    "use strict";
    var f = c.gettext,
        g = function(a, c, d, g) {
            var h = [],
                i = e(c, ["thread", "canModerate"]),
                j = e(c, ["isRegistered"]),
                k = j && e(a, ["author"]) && e(a, ["author", "id"]) === e(c, ["id"]);
            if (i) {
                if (h = [{
                        link: "#",
                        action: "spam",
                        text: f("Mark as Spam")
                    }, {
                        link: "#",
                        action: "delete",
                        text: f("Delete")
                    }, {
                        link: "#",
                        action: "blacklist",
                        text: f("Ban User")
                    }, {
                        link: b.moderate + "approved/search/id:" + e(a, ["id"], ""),
                        action: "moderate",
                        target: "_blank",
                        rel: "noopener noreferrer",
                        text: f("Moderate")
                    }, {
                        link: "#",
                        action: e(a, ["isHighlighted"]) ? "unhighlight" : "highlight",
                        text: f(e(a, ["isHighlighted"]) ? "Stop featuring" : "Feature this comment"),
                        className: "highlight-toggle"
                    }], d && !a.author.isAnonymous) {
                    var l = 4;
                    h.splice(l, 0, {
                        link: "#",
                        action: "manage-badges",
                        text: f("Manage Badges")
                    })
                }
                k || g || h.unshift({
                    link: "#",
                    action: "block-user",
                    text: f("Block User")
                })
            } else k ? h = [{
                link: "#",
                action: "delete",
                text: f("Delete")
            }, {
                link: "#",
                action: "flag",
                text: f(e(a, ["isFlaggedByUser"]) ? "Flagged" : "Flag as inappropriate")
            }] : j && (h = [{
                link: "#",
                action: "block-user",
                text: f("Block User")
            }, {
                link: "#",
                action: "flag",
                text: f(e(a, ["isFlaggedByUser"]) ? "Flagged" : "Flag as inappropriate")
            }]);
            return h
        },
        h = function(b) {
            var c = null,
                h = e(b.session, ["thread", "canModerate"]),
                i = d.isFeatureActive("sso_less_branding", {
                    forum: b.post.forum
                }),
                j = b.forum && b.forum.settings && b.forum.settings.badgesEnabled,
                k = g(b.post, b.session, j, i);
            return e(b.post, ["id"]) && e(b.post, ["isMinimized"]) !== !0 && e(b.post, ["isDeleted"]) !== !0 && e(b.post, ["author", "isBlocked"]) !== !0 && e(b.post, ["sb"]) !== !0 && (k.length ? c = a.createElement("div", null, a.createElement("a", {
                className: "dropdown-toggle",
                "data-toggle": "dropdown",
                href: "#"
            }, a.createElement("b", {
                className: "caret" + (h ? " moderator-menu-options" : "")
            })), a.createElement("ul", {
                className: "dropdown-menu"
            }, k.map(function(b) {
                var c = {};
                return b.rel && (c.rel = b.rel), b.target && (c.target = b.target), a.createElement("li", {
                    key: b.action,
                    className: "dropdown-item " + (b.className || "")
                }, a.createElement("a", _extends({
                    className: "dropdown-link",
                    href: b.link,
                    "data-action": b.action,
                    role: "menuitem"
                }, c), b.text))
            }))) : i || (c = a.createElement("a", {
                className: "dropdown-toggle",
                href: "#",
                "data-action": "flag",
                "data-role": "flag",
                title: f("Flag as inappropriate")
            }, a.createElement("i", {
                "aria-hidden": "true",
                className: "icon icon-flag"
            })))), a.createElement("ul", {
                className: "post-menu dropdown",
                "data-role": "menu",
                "data-view-id": "post-menu",
                "data-post-id": e(b.post, ["id"])
            }, a.createElement("li", {
                className: "post-menu-item collapse"
            }, a.createElement("a", {
                href: "#",
                "data-action": "collapse",
                title: f("Collapse"),
                name: f("Collapse")
            }, a.createElement("span", null, "−"))), a.createElement("li", {
                className: "post-menu-item expand"
            }, a.createElement("a", {
                href: "#",
                "data-action": "collapse",
                title: f("Expand"),
                name: f("Collapse")
            }, a.createElement("span", null, "+"))), null === c ? null : a.createElement("li", {
                className: (h ? "moderator-menu-options" : "") + " post-menu-item",
                role: "menuitem"
            }, c))
        };
    return h
}), define("templates/lounge/partials/postUserAvatar", ["react", "core/strings", "core/utils/object/get", "templates/lounge/partials/userAvatar"], function(a, b, c, d) {
    "use strict";
    var e = b.gettext,
        f = function(b) {
            var f = void 0;
            return f = c(b.post, ["author", "isRegistered"]) && c(b.post, ["isMinimized"]) !== !0 ? a.createElement("div", {
                className: "avatar hovercard"
            }, a.createElement(d, {
                defaultAvatarUrl: b.defaultAvatarUrl,
                forum: b.forum,
                user: b.post.author
            })) : c(b.post, ["author", "hasSponsoredAvatar"]) ? a.createElement("div", {
                className: "avatar"
            }, a.createElement("div", {
                className: "user"
            }, a.createElement("img", {
                src: b.defaultAvatarUrl,
                "data-src": c(b.post, ["author", "avatar", "cache"], ""),
                className: "user",
                alt: e("Avatar")
            }))) : a.createElement("div", {
                className: "avatar"
            }, a.createElement("div", {
                className: "user"
            }, a.createElement("img", {
                src: b.defaultAvatarUrl,
                className: "user",
                alt: e("Avatar")
            })))
        };
    return f
}), define("templates/lounge/partials/postWrapper", ["react", "core/strings", "core/utils/object/get", "templates/lounge/partials/postMenu"], function(a, b, c, d) {
    "use strict";
    var e = b.gettext,
        f = function(b) {
            var f = ["post-content", c(b.post, ["isRealtime"]) && "new", c(b.session, ["isRegistered"]) && c(b.post, ["author", "id"]) === c(b.session, ["id"]) && "authored-by-session-user"].filter(Boolean).join(" ");
            return [a.createElement("div", {
                key: "post-wrapper-content",
                "data-role": "post-content",
                className: f,
                tabIndex: 0
            }, a.createElement("div", {
                className: "indicator"
            }), a.createElement(d, {
                post: b.post,
                session: b.session,
                forum: b.forum
            }), b.children, a.createElement("div", {
                className: "moderate-form blacklist-form",
                "data-role": "blacklist-form"
            }), a.createElement("div", {
                className: "moderate-form flag-form",
                "data-role": "flagging-form"
            }), a.createElement("div", {
                className: "badges-form",
                "data-role": "badges-form"
            }), a.createElement("div", {
                className: "reply-form-container",
                "data-role": "reply-form"
            })), a.createElement("div", {
                className: "children",
                key: "post-wrapper-children"
            }, a.createElement("ul", {
                "data-role": "children"
            }), a.createElement("div", {
                className: "show-children-wrapper " + (b.post.hasMore ? "" : "hidden")
            }, a.createElement("a", {
                className: "show-children",
                id: "post-" + b.post.id + "-show-children",
                "data-action": "show-children",
                href: "#"
            }, e("Show more replies"))))]
        };
    return f
}), define("templates/lounge/post", ["react", "core/constants/voteConstants", "core/strings", "core/utils/object/get", "core/utils/threadRatingsHelpers", "templates/lounge/partials/postFooter", "templates/lounge/partials/postUserAvatar", "templates/lounge/partials/postWrapper", "templates/lounge/partials/profileLink", "templates/lounge/partials/userBadges"], function(a, b, c, d, e, f, g, h, i, j) {
    "use strict";
    var k = c.gettext,
        l = function(b) {
            return d(b.post, ["author", "badge"]) ? a.createElement("span", {
                className: "badge",
                "data-type": "tracked-badge"
            }, d(b.post, ["author", "badge"], null)) : d(b.post, ["author", "thread", "canModerate"]) ? a.createElement("span", {
                className: "badge moderator"
            }, k("Mod")) : null
        },
        m = function(c) {
            return [a.createElement("div", {
                key: "post-alert",
                role: "alert"
            }), a.createElement(h, {
                key: "post-wrapper",
                post: c.post,
                session: c.session,
                forum: c.forum
            }, a.createElement(g, {
                post: c.post,
                forum: c.forum,
                defaultAvatarUrl: c.defaultAvatarUrl
            }), a.createElement("div", {
                className: "post-body"
            }, a.createElement("header", {
                className: "comment__header"
            }, a.createElement("span", {
                className: "post-byline"
            }, d(c.post, ["author", "isRegistered"]) ? a.createElement("span", null, c.isInHome && d(c.post, ["author", "isPowerContributor"]) ? a.createElement("a", {
                href: "#",
                className: "icon__position -inline -allstar",
                "data-toggle": "tooltip",
                "data-role": "allstar",
                title: k("All-Star")
            }, a.createElement("span", {
                className: "icon-allstar allstar__icon"
            })) : null, " ", a.createElement("span", {
                className: "author publisher-anchor-color"
            }, a.createElement(i, {
                user: d(c.post, ["author"]),
                forumId: c.post.forum
            }, d(c.post, ["author", "name"], null))), " ", a.createElement(l, {
                post: c.post
            }), a.createElement(j, {
                forum: c.forum,
                user: d(c.post, ["author"]),
                context: "post",
                limit: 4
            })) : a.createElement("span", {
                className: "author"
            }, d(c.post, ["author", "name"], null)), c.parentPost ? a.createElement("span", null, " ", a.createElement("a", {
                href: d(c.parentPost, ["permalink"], ""),
                className: "parent-link",
                "data-role": "parent-link"
            }, a.createElement("i", {
                "aria-label": "in reply to",
                className: "icon-forward",
                title: "in reply to"
            }), " ", d(c.parentPost, ["author", "name"], null))) : null), " ", a.createElement("span", {
                className: "post-meta"
            }, a.createElement("span", {
                className: "bullet time-ago-bullet",
                "aria-hidden": "true"
            }, "•"), " ", d(c.post, ["id"]) ? a.createElement("a", {
                href: d(c.post, ["permalink"], ""),
                "data-role": "relative-time",
                className: "time-ago",
                title: d(c.post, ["formattedCreatedAt"], "")
            }, d(c.post, ["relativeCreatedAt"], null)) : a.createElement("span", {
                className: "time-ago",
                "data-role": "relative-time",
                title: d(c.post, ["formattedCreatedAt"], "")
            }, d(c.post, ["relativeCreatedAt"], null)), " ", d(c.post, ["isEdited"]) ? a.createElement("span", null, a.createElement("span", {
                className: "bullet time-ago-bullet",
                "aria-hidden": "true"
            }, "•"), " ", a.createElement("span", {
                className: "has-edit",
                "data-role": "has-edit"
            }, "edited")) : null), " ", !d(c, ["parentPost"]) && e.isThreadRatingsEnabled(c.thread, c.forum) && c.post.author.threadRating ? a.createElement("span", {
                className: "post-ratings"
            }, a.createElement("span", {
                className: "bullet time-ago-bullet",
                "aria-hidden": "true"
            }, "•"), a.createElement("span", {
                className: "post-ratings-stars"
            }, a.createElement("div", {
                className: "post-stars active",
                style: {
                    width: Math.round(20 * c.post.author.threadRating) + "%"
                }
            }, a.createElement("div", {
                className: "rating-star"
            }, "★"), a.createElement("div", {
                className: "rating-star"
            }, "★"), a.createElement("div", {
                className: "rating-star"
            }, "★"), a.createElement("div", {
                className: "rating-star"
            }, "★"), a.createElement("div", {
                className: "rating-star"
            }, "★")), a.createElement("div", {
                className: "post-stars inactive"
            }, a.createElement("div", {
                className: "rating-star"
            }, "★"), a.createElement("div", {
                className: "rating-star"
            }, "★"), a.createElement("div", {
                className: "rating-star"
            }, "★"), a.createElement("div", {
                className: "rating-star"
            }, "★"), a.createElement("div", {
                className: "rating-star"
            }, "★")))) : null, " ", c.stateByline ? a.createElement("span", {
                className: "state-byline state-byline-" + d(c.stateByline, ["style"], "")
            }, a.createElement("span", {
                className: "icon-mobile icon-" + d(c.stateByline, ["icon"], ""),
                "aria-hidden": "true"
            }), " ", a.createElement("span", {
                className: "text"
            }, d(c.stateByline, ["text"], null))) : null), a.createElement("div", {
                className: "post-body-inner"
            }, a.createElement("div", {
                className: "post-message-container",
                "data-role": "message-container"
            }, a.createElement("div", {
                className: "publisher-anchor-color",
                "data-role": "message-content"
            }, a.createElement("div", {
                className: "post-message " + (d(c.post, ["message"]) ? "" : "loading"),
                "data-role": "message",
                dir: "auto"
            }, "" === d(c.post, ["message"]) ? a.createElement("p", null, a.createElement("i", null, k("This comment has no content."))) : a.createElement("div", {
                dangerouslySetInnerHTML: {
                    __html: d(c.post, ["message"], "")
                }
            })), a.createElement("span", {
                className: "post-media"
            }, a.createElement("ul", {
                "data-role": "post-media-list"
            })))), a.createElement("a", {
                className: "see-more hidden",
                title: k("see more"),
                "data-action": "see-more"
            }, k("see more"))), a.createElement("footer", {
                className: "comment__footer"
            }, a.createElement(f, {
                post: c.post,
                session: c.session,
                disableSocialShare: d(c.forum, ["settings", "disableSocialShare"], !1),
                votingType: d(c.forum, ["votingType"], b.VOTING_TYPES.DEFAULT_VOTING_TYPE)
            }))))]
        };
    return m
}), define("templates/lounge/postDeleted", ["react", "core/config/urls", "core/strings", "core/utils/object/get", "templates/lounge/partials/postMenu", "templates/lounge/partials/postWrapper"], function(a, b, c, d, e, f) {
    "use strict";
    var g = c.gettext,
        h = function(c) {
            return a.createElement(f, {
                post: c.post,
                session: c.session,
                forum: c.forum
            }, a.createElement("div", {
                className: "avatar"
            }, a.createElement("img", {
                "data-src": d(b, ["avatar", "generic"], ""),
                className: "user",
                alt: g("Avatar")
            })), a.createElement("div", {
                className: "post-body"
            }, a.createElement("div", {
                className: "post-message"
            }, a.createElement("p", null, g("This comment was deleted."))), a.createElement("header", null, a.createElement(e, {
                post: c.post,
                session: c.session,
                forum: c.forum
            }))))
        };
    return h
}), define("templates/lounge/postBlocked", ["react", "core/config/urls", "core/strings", "core/utils/object/get", "templates/lounge/partials/postWrapper"], function(a, b, c, d, e) {
    "use strict";
    var f = c.gettext,
        g = function(c) {
            return a.createElement(e, {
                post: c.post,
                session: c.session,
                forum: c.forum
            }, a.createElement("div", {
                className: "avatar"
            }, a.createElement("img", {
                "data-src": d(b, ["avatar", "generic"], ""),
                className: "user",
                alt: f("Avatar")
            })), a.createElement("div", {
                className: "post-body"
            }, a.createElement("div", {
                className: "post-message"
            }, a.createElement("p", null, f("This user is blocked.")))))
        };
    return g
}), define("templates/lounge/postMinimized", ["react", "core/strings", "core/utils/object/get", "templates/lounge/partials/postMenu", "templates/lounge/partials/postUserAvatar", "templates/lounge/partials/postWrapper"], function(a, b, c, d, e, f) {
    "use strict";
    var g = b.gettext,
        h = function(b) {
            var d = void 0;
            return d = c(b.post, ["isApproved"]) ? a.createElement("p", null, g("Comment score below threshold."), " ", a.createElement("a", {
                href: "#",
                "data-action": "reveal"
            }, g("Show comment."))) : b.created ? a.createElement("p", null, g("Your comment is awaiting moderation."), " ", a.createElement("a", {
                href: "#",
                "data-action": "reveal"
            }, g("See your comment.")), " ", a.createElement("a", {
                href: "https://help.disqus.com/customer/portal/articles/466223",
                className: "help-icon",
                title: g("Why?"),
                target: "_blank",
                rel: "noopener noreferrer"
            }), " ") : a.createElement("p", null, g("This comment is awaiting moderation."), " ", a.createElement("a", {
                href: "#",
                "data-action": "reveal"
            }, g("Show comment.")))
        },
        i = function(b) {
            return a.createElement(f, {
                post: b.post,
                session: b.session,
                forum: b.forum
            }, a.createElement(e, {
                post: b.post,
                forum: b.forum,
                defaultAvatarUrl: b.defaultAvatarUrl
            }), a.createElement("div", {
                className: "post-body"
            }, a.createElement("div", {
                className: "post-message publisher-anchor-color"
            }, a.createElement(h, {
                create: b.created,
                post: b.post
            })), a.createElement("header", null, a.createElement("div", {
                className: "post-meta"
            }, g("This comment is awaiting moderation.")), a.createElement(d, {
                post: b.post,
                session: b.session,
                forum: b.forum
            }))))
        };
    return i
}), define("templates/lounge/postSpam", ["react", "core/config/urls", "core/strings", "core/utils/object/get", "templates/lounge/partials/postMenu", "templates/lounge/partials/postWrapper"], function(a, b, c, d, e, f) {
    "use strict";
    var g = c.gettext,
        h = function(c) {
            return a.createElement(f, {
                post: c.post,
                session: c.session,
                forum: c.forum
            }, a.createElement("div", {
                className: "avatar"
            }, a.createElement("img", {
                "data-src": d(b, ["avatar", "generic"], ""),
                className: "user",
                alt: g("Avatar")
            })), a.createElement("div", {
                className: "post-body"
            }, a.createElement("div", {
                className: "post-message"
            }, a.createElement("p", null, g("This comment was marked as spam."))), a.createElement("header", null, a.createElement(e, {
                post: c.post,
                session: c.session,
                forum: c.forum
            }))))
        };
    return h
}), define("templates/lounge/anonUpvoteCard", ["react", "core/strings"], function(a, b) {
    "use strict";
    var c = b.gettext,
        d = function() {
            return a.createElement("div", {
                className: "vote-action tooltip"
            }, c("You must sign in to up-vote this post."))
        };
    return d
}), define("templates/lounge/anonDownvoteCard", ["react", "core/strings"], function(a, b) {
    "use strict";
    var c = b.gettext,
        d = function() {
            return a.createElement("div", {
                className: "vote-action tooltip"
            }, c("You must sign in to down-vote this post."))
        };
    return d
}), define("lounge/views/post", ["jquery", "underscore", "backbone", "stance", "react", "react-dom", "core/api", "core/constants/badgesConstants", "core/constants/voteConstants", "core/strings", "core/switches", "core/utils", "core/mixins/withAlert", "core/mixins/withRichMedia", "core/WindowBus", "core/bus", "common/urls", "common/utils", "lounge/common", "lounge/mixins", "lounge/views/cards", "lounge/views/media", "lounge/views/posts/BadgesManageView", "lounge/views/posts/BlacklistView", "lounge/views/posts/PostEditView", "lounge/views/posts/PostReplyView", "lounge/views/posts/TypingUserView", "lounge/views/posts/FlaggingView", "core/views/ClickTooltip", "core/views/Tooltip", "templates/lounge/partials/postFooter", "templates/lounge/partials/postMenu", "templates/lounge/partials/userBadges", "templates/lounge/post", "templates/lounge/postDeleted", "templates/lounge/postBlocked", "templates/lounge/postMinimized", "templates/lounge/postSpam", "templates/lounge/anonUpvoteCard", "templates/lounge/anonDownvoteCard"], function(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z, A, B, C, D, E, F, G, H, I, J, K, L, M, N) {
    "use strict";
    var O = l.preventDefaultHandler,
        P = j.get,
        Q = new o,
        R = h.ACTION_TYPES,
        S = 13,
        T = c.View.extend({
            tagName: "li",
            className: "post",
            events: {
                "click > [data-role=post-content] [data-action]": "performAction",
                "keydown > [data-role=post-content] [data-action]": function(a) {
                    a.keyCode && a.keyCode !== S || this.performAction(a)
                },
                "click [data-role=allstar]": function() {
                    Q.broadcast("click:allstar")
                }
            },
            actions: {
                upvote: O(function(a) {
                    this.handleVote(a, 1)
                }),
                downvote: O(function(a) {
                    this.handleVote(a, -1)
                }),
                reply: "handleReply",
                flag: "handleFlag",
                "block-user": "handleBlockUser",
                edit: "handleEdit",
                "delete": "handleDelete",
                spam: "handleSpam",
                blacklist: "handleBlacklist",
                "manage-badges": "handleManageBadges",
                highlight: "handleHighlight",
                unhighlight: "handleUnhighlight",
                collapse: "handleCollapse",
                reveal: "handleReveal",
                "expand-share": "handleExpandShare",
                "share:twitter": "_onShare",
                "share:facebook": "_onShare",
                "copy-link": "handleCopyLink"
            },
            performAction: function(c) {
                var d = this,
                    e = a(c.currentTarget).attr("data-action"),
                    f = d.actions[e];
                if (f) return (b.isFunction(f) ? f : d[f]).call(d, c)
            },
            initialize: function(a) {
                var b = this;
                this.thread = a.thread, this.session = a.session, this.created = Boolean(a.created), this.options = a, this.userSuggestions = a.userSuggestions, this.gifPickerEnabled = Boolean(this.thread) && Boolean(this.thread.forum) && this.thread.forum.get("settings").gifPickerEnabled, this.setAlertSelector("> [role=alert]"), this.listenTo(this.model, {
                    "change:isDeleted spam": this.removeAsDeleted,
                    "change:message": this.stopLoading,
                    "change:points": this.updateVotePoints,
                    "change:userScore": this.updateActiveUserVote,
                    "change:isFlaggedByUser": this.updateMenu,
                    "change:hasMore": this.handleHasMoreChanged,
                    "change:isHighlighted": function() {
                        this.redraw()
                    },
                    change: function() {
                        var a = this.model.changedAttributes();
                        (a.id || a.message) && this.redraw()
                    }
                }), this.model.author && (this.listenTo(this.model.author, "change:isBlocked", function() {
                    return b.flaggingView ? void b.listenToOnce(b.flaggingView, "success cancel", b.redraw) : b.manageBadgeView ? void b.listenToOnce(b.manageBadgeView, "success cancel", b.redraw) : void b.redraw()
                }), this.listenTo(this.model.author, "change:badges", this.updateBadges)), this.thread.forum.get("features") || this.listenToOnce(this.thread.forum, "change:features", this.redraw), this.listenTo(this.thread, "change:ratingsEnabled", this.redraw), !this.model.getParent() && this.model.isAuthorSessionUser(this.session) && this.listenTo(this.thread, "change:userRating", function() {
                    this.model.author.set("threadRating", this.thread.get("userRating")), this.redraw()
                }), this.listenTo(this.model.usersTyping, "add remove reset change", this.updateTypingCount), this.listenTo(this.session, "change:id", function() {
                    this.updateFooter(), this.updateMenu(), this.updateSessionClass()
                }), this.listenTo(s.getLounge(), "opened:post-menu", this.positionMenu), this.listenTo(this.thread, "change:ratingsEnabled", this.render), this.hasVisibleChildren = !1, this.reply = null, this.edit = null, this.parent = a.parent, this.trackPosition = !1, this.offset = {
                    top: -1,
                    height: -1
                }, this.dim = {
                    height: -1,
                    width: -1
                }, this.listenTo(s.getLounge(), "domReflow", this.calcRect), this.isCollapseAllowed = !0, this.haveSubscribedToRichMediaEvents = !1
            },
            calcRect: function() {
                if (!this.trackPosition || !this.visible) return this.offset = {
                    top: -1,
                    height: -1
                }, void(this.dim = {
                    height: -1,
                    width: -1
                });
                var a = this.contentNode;
                this.offset = a.offset(), this.dim = {
                    height: a.height(),
                    width: a.width()
                }
            },
            createTypingUserView: function() {
                var a = this.$el.find("[data-role=realtime-notification\\:" + this.model.id + "] .realtime-replies");
                this.typingUserView = new A({
                    parentView: this,
                    model: this.model,
                    el: a
                })
            },
            updateTypingCount: function() {
                this.typingUserView || this.createTypingUserView(), this.typingUserView.render()
            },
            stopLoading: function() {
                this.contentNode.find(".loading").removeClass("loading")
            },
            updateRelativeTime: function() {
                this.contentNode.find("[data-role=relative-time]").text(this.model.getRelativeCreatedAt())
            },
            updateSessionClass: function() {
                var a = "authored-by-session-user";
                this.model.isAuthorSessionUser(this.session) ? this.contentNode.addClass(a) : this.contentNode.removeClass(a)
            },
            updateActiveUserVote: function() {
                var a = this.model,
                    b = this.contentNode.find("[data-action=upvote]"),
                    c = this.contentNode.find("[data-action=downvote]");
                c.removeClass("downvoted"), b.removeClass("upvoted"), a.get("userScore") > 0 ? b.addClass("upvoted") : a.get("userScore") < 0 && c.addClass("downvoted")
            },
            updateVotePoints: function() {
                var c = this,
                    d = c.model,
                    e = c.contentNode.find("[data-role=likes], [data-role=dislikes]"),
                    f = c.contentNode.find("[data-action=upvote], [data-action=downvote]"),
                    g = function(a) {
                        b.delay(function() {
                            a.addClass("update"), b.delay(function() {
                                a.removeClass("update")
                            }, 1e3)
                        }, 500)
                    };
                b.each(e, function(b, e) {
                    b = a(b);
                    var h = b.html(),
                        j = d.get(b.attr("data-role")),
                        k = a(f[e]);
                    if (j = Math.max(j, 0).toString(), h !== j) {
                        k.removeClass("count-" + h);
                        var l = c.thread.forum.get("votingType"),
                            m = l === i.VOTING_TYPES.DOWNVOTE_LIMITED || l === i.VOTING_TYPES.DOWNVOTE_DISABLED;
                        l === i.VOTING_TYPES.DISABLED || "dislikes" === b.attr("data-role") && m ? k.addClass("count-0") : k.addClass("count-" + j), b.html(j), g(b)
                    }
                })
            },
            updateFooter: function() {
                var a = this.contentNode.find("footer"),
                    b = E({
                        post: this.getPostAttributes(),
                        session: this.session.toJSON(),
                        disableSocialShare: this.thread.forum.get("settings").disableSocialShare,
                        votingType: this.thread.forum.get("votingType")
                    });
                z.open[this.model.cid] && this.toggleReplyLink(!0), a.html(b), this.initVotersCard()
            },
            updateMenu: function() {
                var a = this.contentNode.find("[data-role=menu]"),
                    b = F({
                        session: this.session.toJSON(),
                        post: this.getPostAttributes(),
                        forum: this.thread.forum.toJSON()
                    });
                a.replaceWith(b)
            },
            updateBadges: function() {
                var a = this.getPostAttributes().author,
                    b = this.contentNode.find("[data-role=badges]"),
                    c = G({
                        forum: this.thread.forum.toJSON(),
                        user: a,
                        context: "post",
                        limit: 4
                    });
                b.replaceWith(c), this.profileCard && this.profileCard.setBadges(a.badges)
            },
            updatePostStateClasses: function() {
                var a = this.model,
                    b = a.get("isHighlighted") || a.get("isSponsored");
                this.$el.toggleClass("highlighted", Boolean(b)), this.contentNode.toggleClass("disabled", !a.id)
            },
            getMessageContent: function() {
                return this.messageContent && this.messageContent.length || (this.messageContent = this.contentNode.find("[data-role=message-content]")), this.messageContent
            },
            manageMessageHeight: function(a) {
                var b = this,
                    c = b.getMessageContent(),
                    d = 1.5 * b.collapsedHeight,
                    e = c && c.length && c.height() || 0;
                e += a || 0, e > d && !b.$el.hasClass("collapsed") ? b.collapse() : b.expand(!0)
            },
            preventCollapsing: function(a) {
                a.get("deferred") || (this.expand(), this.isCollapseAllowed = !1)
            },
            markSeen: function() {
                function a() {
                    c.contentNode.addClass("seen"), b.delay(function() {
                        c.contentNode.removeClass("seen"), c.contentNode.removeClass("new")
                    }, 1e4), c.trackPosition = !1
                }
                var c = this,
                    e = d(c);
                e.isVisible() ? a() : this.listenToOnce(e, "enter", a)
            },
            renderMedia: function() {
                var a = this.model.media;
                if (a && a.length) {
                    var c = this.$el.find("[data-role=post-media-list]");
                    this.richMediaViews = this.renderRichMedia(a, c, {
                        convertLinkToButton: !0,
                        beforeRender: function(a) {
                            this.listenTo(a.model, "change:activated", this.preventCollapsing), a.relatedPost = this.model.cid
                        },
                        normalize: function(a) {
                            var b = l.bleachFindUrls(a);
                            return b.length && (a = b[0].url), a
                        }
                    }), !this.haveSubscribedToRichMediaEvents && this.richMediaViews.length && (this.listenTo(v.settings, "change:collapsed", function(a, c) {
                        if (c) this.manageMessageHeight();
                        else {
                            var d = b.reduce(this.richMediaViews, function(a, b) {
                                return a + (b.model.get("deferredHeight") || 0)
                            }, 0);
                            this.manageMessageHeight(d)
                        }
                    }), this.haveSubscribedToRichMediaEvents = !0)
                }
            },
            renderSpoilers: function() {
                this.$el.find("spoiler").each(function() {
                    a(this).attr("tabindex", "0")
                })
            },
            getStateByline: function() {
                var a, b = this.model;
                return b.get("isHighlighted") ? a = {
                    icon: "trophy",
                    text: P("Featured by %(forum)s"),
                    style: "default"
                } : b.get("isSponsored") ? a = {
                    icon: "trophy",
                    text: P("Sponsored on Disqus"),
                    style: "sponsored"
                } : b.isAuthorSessionUser(this.session) && (b.get("isApproved") || (a = {
                    icon: "clock",
                    text: P("Hold on, this is waiting to be approved by %(forum)s."),
                    style: "default"
                })), a && (a.text = j.interpolate(a.text, {
                    forum: this.thread.forum.get("name")
                })), a
            },
            getTemplate: function(a) {
                if (a.isDeleted) return I;
                var b = this.model.isAuthorSessionUser(this.session);
                return a.sb && !b ? I : a.isSpam ? L : this.model.author && this.model.author.get("isBlocked") ? J : b && !a.isApproved ? H : a.isMinimized ? K : H
            },
            getPostAttributes: function() {
                var a = this.model.toJSON({
                        session: this.session,
                        thread: this.thread
                    }),
                    b = this.model.getParent();
                return b && b.get("isSponsored") && (a.canBeRepliedTo = !1, a.hideViewAllComments = b.get("hideViewAllComments")), a
            },
            render: function() {
                var a = this.$el,
                    b = this.getPostAttributes(),
                    c = s.getLounge(),
                    d = this.thread.forum.get("avatar"),
                    g = this.model.getParent(),
                    h = this.getTemplate(b);
                return !b.message && b.raw_message && r.isPlainText(b.raw_message) && (b.message = this.model.constructor.formatMessage(b.raw_message)), f.render(e.createElement(h, {
                    post: b,
                    forumName: this.thread.forum.get("name"),
                    session: this.session.toJSON(),
                    thread: this.thread.toJSON(),
                    forum: this.thread.forum.toJSON(),
                    created: this.created,
                    parentPost: g && g.toJSON({
                        session: this.session,
                        thread: this.thread
                    }),
                    defaultAvatarUrl: d ? d.large.cache : q.avatar.generic,
                    stateByline: this.getStateByline(),
                    isInHome: s.getLounge().isInHome()
                }), this.el), h === H ? a.removeClass("minimized") : a.addClass("minimized"), b.sb && !this.model.isAuthorSessionUser(this.session) ? this.hasVisibleChildren || a.addClass("banned") : this.parent && this.parent.markHasVisibleChildren(), !this.options.excludeAnchor && this.model.id && a.attr("id", "post-" + this.model.id), this.contentNode = a.find("[data-role=post-content]"), this.childrenNode = a.find("[data-role=children]"), this.messageNode = this.contentNode.find("[data-role=message]"), this.highlightSyntax(), this.processMentions(), this.initCards(), this.updatePostStateClasses(), this.renderMedia(), this.renderSpoilers(), this.model.get("isRealtime") && (this.trackPosition = !0, this.listenToOnce(c.postsView, "render:end", this.markSeen)), this.listenToOnce(c.postsView, "render:end", function() {
                    this.markSeen(), this.manageMessageHeight()
                }), this
            },
            positionMenu: function(b) {
                var c = b.data("postId").toString();
                if (c === this.model.id) {
                    var d = this.$(".dropdown-menu", b);
                    if (d.css("top", ""), d.height() + d.offset().top > a(window.document).height()) {
                        var e = d.css("top") || 0;
                        d.css("top", (d.height() + parseInt(e, 10)) * -1)
                    }
                }
            },
            markHasVisibleChildren: function() {
                this.hasVisibleChildren = !0, this.model.get("sb") && (this.$el.removeClass("banned"), this.parent && this.parent.markHasVisibleChildren())
            },
            highlightSyntax: function() {
                var a = this.contentNode.find("pre code");
                a.length && a.each(function() {
                    r.syntaxHighlighter.highlight(this)
                })
            },
            redraw: function() {
                var a = window.document.createDocumentFragment();
                this.childrenNode.children().appendTo(a), this.render(), this.childrenNode.append(a), this.blacklist && this.contentNode.find("[data-role=blacklist-form]").first().append(this.blacklist.el), s.getLounge().postsView.trigger("render:end"), s.getLounge().trigger("domReflow")
            },
            handleHasMoreChanged: function() {
                var b = this.$el.find(".show-children-wrapper");
                a(b[b.length - 1]).toggleClass("hidden", !this.model.get("hasMore"))
            },
            processMentions: function() {
                var b = this.session,
                    c = b && b.get("sso") && b.get("sso").profile_url;
                c && (c = String(c), 0 === c.indexOf("//") && (c = "https:" + c), /https?:\/\//.test(c) || (c = null), /\{username\}/.test(c) || (c = null));
                var d = k.isFeatureActive("sso_less_branding", {
                    forum: this.thread.forum.id
                }) && !c;
                this.contentNode.find("[data-dsq-mention]").each(function() {
                    var b = a(this);
                    if (d) {
                        var e = a("<span />");
                        e.text(b.text()), e.addClass("mention"), b.replaceWith(e)
                    } else {
                        if (c) {
                            var f = c.replace(/\{username\}/gi, encodeURIComponent(b.text()));
                            b.attr("href", f), b.attr("title", f)
                        } else {
                            var g = b.attr("data-dsq-mention").split(":")[0];
                            b.attr("data-action", "profile"), b.attr("data-username", g)
                        }
                        b.addClass("mention")
                    }
                })
            },
            attachChild: function(a) {
                var b = a.model;
                b.created || !b.id || b.get("isImmediateReply") ? this.childrenNode.prepend(a.el) : this.childrenNode.append(a.el)
            },
            toggleReply: function() {
                this.reply && this.reply.isOpen() ? this.hideReply() : this.showReply()
            },
            toggleReplyLink: function(a) {
                this.contentNode.find("[data-role=reply-link]").toggleClass("active", a), this.contentNode.find("[data-role=reply-link]").toggleClass("publisher-anchor-color", a)
            },
            showReply: function() {
                this.reply ? (this.$el.find("[data-role=reply-form]").first().prepend(this.reply.$el), this.reply.show(), this.reply.focus()) : this.getReplyView(), this.toggleReplyLink(!0)
            },
            hideReply: function() {
                this.reply && (this.reply.hide(), this.toggleReplyLink(!1))
            },
            toggleEdit: function() {
                return this.contentNode.find("[data-role=edit-link]").toggleClass("active"), this.edit ? (this.edit.remove(), this.edit = null, void this.messageNode.show()) : void this.showEdit()
            },
            showEdit: function() {
                if (this.session.isLoggedOut()) return void this.listenToOnce(this.session, "change:id", this.toggleEdit);
                if (this.model.canBeEdited(this.session, this.thread) && !this.edit) {
                    this.edit = new y({
                        post: this.model,
                        session: this.session,
                        thread: this.thread
                    }), this.edit.render(), this.listenTo(this.edit, "submitted cancel", this.toggleEdit), this.expand(!0);
                    var a = this.messageNode;
                    a.parent().prepend(this.edit.$el), a.hide(), this.edit.resize();
                    var b = s.getLounge();
                    b && b.scrollToPost(this.model.id), p.trigger("uiAction:postStartUpdate", this.model, {
                        area: "main"
                    })
                }
            },
            removeAsDeleted: function() {
                this.redraw()
            },
            initCards: function() {
                var a = this;
                a.initProfileCard(), a.initContextCard(), a.initVotersCard(), a.initAnonVoteCards(), a.initTooltips()
            },
            initProfileCard: function() {
                if (!l.isMobileUserAgent() && !k.isFeatureActive("sso_less_branding", {
                        forum: this.thread.forum.id
                    })) {
                    var a = this.$el.find(".hovercard");
                    a.length && (this.profileCard = u.ProfileCard.create({
                        session: this.session,
                        user: this.model.author,
                        targetElement: a
                    }))
                }
            },
            initContextCard: function() {
                if (!l.isMobileUserAgent()) {
                    var a = this.parent && this.parent.model;
                    a && !a.get("isDeleted") && (this.contextCard = u.ContextCard.create({
                        post: a,
                        targetElement: this.$el.find("[data-role=parent-link]")
                    }))
                }
            },
            initVotersCard: function() {
                if (!l.isMobileUserAgent()) {
                    var a = this.$el.find("[data-action=upvote]"),
                        b = this.$el.find("[data-action=downvote]"),
                        c = this.thread.forum.get("votingType");
                    a.length && c !== i.VOTING_TYPES.DISABLED && (this.upvotersCard = u.VotersCard.create({
                        session: this.session,
                        model: this.model,
                        targetElement: a,
                        voteType: 1
                    })), !b.length || null !== c && void 0 !== c && c !== i.VOTING_TYPES.DETAILED || (this.downvotersCard = u.VotersCard.create({
                        session: this.session,
                        model: this.model,
                        targetElement: b,
                        voteType: -1
                    }))
                }
            },
            initAnonVoteCards: function() {
                this.session.isLoggedOut() && !this.thread.forum.get("settings").allowAnonVotes && (this.anonVoteCards = this.anonVoteCards || {}, b.each({
                    upvote: M,
                    downvote: N
                }, function(a, b) {
                    this.anonVoteCards[b] && (this.anonVoteCards[b].remove(), this.anonVoteCards[b] = null);
                    var c = this.$("[data-action=" + b + "]");
                    c.length && (this.anonVoteCards[b] = C.create({
                        targetElement: c,
                        template: a,
                        id: "anon" + b + this.model.id
                    }))
                }, this), this.anonVoteCards.upvote && this.listenTo(this.anonVoteCards.upvote, "show", this.closeUpvotersCard), this.anonVoteCards.downvote && this.listenTo(this.anonVoteCards.upvote, "show", this.closeDownvotersCard))
            },
            initTooltips: function() {
                if (!l.isMobileUserAgent()) {
                    var b = this.$el.find("[data-toggle=tooltip]");
                    b.length && b.each(function(b, c) {
                        var d = a(c),
                            e = d.attr("title");
                        d.attr("data-original-title", e).attr("title", ""), D.create({
                            targetElement: d,
                            message: e,
                            id: e
                        })
                    })
                }
            },
            closeUpvotersCard: function() {
                this.upvotersCard && this.upvotersCard.hide()
            },
            closeDownvotersCard: function() {
                this.downvotersCard && this.downvotersCard.hide()
            },
            _onShare: O(function(a) {
                if (!this.thread.forum.get("settings").disableSocialShare) {
                    var b = r.extractService(a.target, "share");
                    b && (s.getLounge().trigger("uiAction:postShare", this.model, b), this.share(b))
                }
            }),
            handleBlacklist: O(function() {
                if (!this.blacklist) {
                    var a = this.blacklist = new x({
                        model: this.model,
                        forum: this.thread.forum
                    });
                    a.render(), this.listenTo(a, "success cancel", function() {
                        this.blacklist.remove(), this.blacklist = null
                    }), this.contentNode.find("[data-role=blacklist-form]").first().append(a.el)
                }
            }),
            handleManageBadges: O(function() {
                if (!this.manageBadgeView) {
                    var a = this.manageBadgeView = new w({
                        model: this.model,
                        forum: this.thread.forum
                    });
                    a.render(), p.trigger("uiAction:viewBadgeModal"), this.listenTo(a, "success cancel", function() {
                        this.manageBadgeView.remove(), this.manageBadgeView = null
                    }), this.listenTo(a, "success", function(a) {
                        var b = this.model.author;
                        b.get("badges") || b.set("badges", []);
                        var c = b.get("badges");
                        a.action === R.AWARD ? c.unshift(a.badge) : a.action === R.REMOVE && b.set("badges", c.filter(function(b) {
                            return b.id !== a.badge.id
                        })), this.thread.trigger("change:badgeAction", b)
                    }), this.contentNode.find("[data-role=badges-form]").first().append(a.el)
                }
            }),
            toggleCollapse: function(a) {
                this.$el.toggleClass("collapsed", a)
            },
            handleCollapse: O(function() {
                this.toggleCollapse()
            }),
            handleHighlight: O(function() {
                this.model.highlight();
                var a = P("You've featured a comment! This comment will now also appear at the top of the discussion.");
                this.alert(a, {
                    safe: !0,
                    type: "success"
                }), this.thread.set("highlightedPost", this.model);
                var b = s.getLounge();
                b && b.scrollToPost(this.model.id)
            }),
            handleUnhighlight: O(function() {
                this.model.unhighlight(), this.dismissAlert(), this.thread.unset("highlightedPost")
            }),
            handleVote: function(a, b) {
                if (this.thread.forum.get("votingType") !== i.VOTING_TYPES.DISABLED && (b !== -1 || this.thread.forum.get("votingType") !== i.VOTING_TYPES.DOWNVOTE_DISABLED)) {
                    if (!this.thread.forum.get("settings").allowAnonVotes && this.session.isLoggedOut()) return void this.queueAuthAction(function() {
                        this.handleVote(a, b)
                    }, this);
                    var c = s.getLounge(),
                        d = this.model.get("userScore") === b;
                    d ? c.trigger("uiAction:postUnvote", this.model, a) : 1 === b ? c.trigger("uiAction:postUpvote", this.model, a) : b === -1 && c.trigger("uiAction:postDownvote", this.model, a), this.model.vote(d ? 0 : b)
                }
            },
            queueAuthAction: function(a, b) {
                this.listenToOnce(this.session, "change:id", function() {
                    this.session.isLoggedIn() && a.call(b)
                }), this.session.get("sso") && this.session.get("sso").url ? this.session.authenticate("sso") : this.session.authenticate("disqusDotcom")
            },
            getReplyView: function() {
                return this.reply ? this.reply : (this.reply = new z({
                    parentView: this,
                    parent: this.model,
                    thread: this.thread,
                    session: this.options.session,
                    userSuggestions: this.userSuggestions,
                    gifPickerEnabled: this.gifPickerEnabled,
                    shouldShowEmailAlertInForm: !0
                }), this.reply.render(), this.showReply(), this.reply)
            },
            handleReply: O(function() {
                this.toggleReply()
            }),
            handleFlag: O(function() {
                if (!this.model.get("isFlaggedByUser") && !this.flaggingView) {
                    if (this.session.isLoggedOut()) {
                        var a = this;
                        return a._pendingFlagComplete = !1, void a.queueAuthAction(function() {
                            a._pendingFlagComplete || (a._pendingFlagComplete = !0, setTimeout(function() {
                                a.handleFlag()
                            }, 400))
                        })
                    }
                    var b = this.flaggingView = new B({
                        model: this.model
                    });
                    b.render(), this.listenTo(b, "cancel success", function() {
                        b.remove(), this.flaggingView = null, this.updateMenu()
                    }), this.contentNode.find("[data-role=flagging-form]").first().append(b.el), p.frame.sendHostMessage("scrollTo", {
                        top: b.$el.offset().top - 80
                    })
                }
            }),
            handleBlockUser: O(function() {
                var a = P("Are you sure you want to block this user?");
                if (window.confirm(a)) {
                    this.dismissAlert(function(a) {
                        return a.options && a.options.isBlockError
                    });
                    var b = this;
                    this.model.author.block().fail(function(a) {
                        var c = P("Something went wrong while trying to block this user. Please try again later."),
                            d = a && a.responseJSON && a.responseJSON.code;
                        d === g.ERROR_CODES.MAX_ITEMS_REACHED && (c = P("Unfortunately this user could not be blocked; you have reached the limit for number of users blocked.")), b.alert(c, {
                            type: "error",
                            isBlockError: !0
                        })
                    })
                }
            }),
            handleEdit: O(function() {
                this.toggleEdit()
            }),
            handleDelete: O(function() {
                var a = P("Are you sure you want to delete this comment? You cannot undo this action.");
                (this.session.user.id !== this.model.author.id || window.confirm(a)) && (this.model.get("isHighlighted") && (this.model.set("isHighlighted", !1), this.thread.unset("highlightedPost")), this.model._delete())
            }),
            handleSpam: O(function() {
                this.model.spam()
            }),
            handleReveal: O(function() {
                this.model.set("isMinimized", !1), this.redraw()
            }),
            handleExpandMessage: O(function() {
                return this.expand()
            }),
            handleExpandShare: O(function() {
                var a = this.$("#comment__share-" + this.model.id + " .comment-share__buttons");
                a.toggleClass("comment-share__buttons-visible")
            }),
            handleCopyLink: function(a) {
                var b = a.target;
                "BUTTON" === a.target.tagName && (b = a.target.nextSibling), b.select(), window.document.execCommand("copy"), window.document.getSelection().removeAllRanges()
            }
        });
    return b.extend(T.prototype, t.ShareMixin), m.call(T.prototype), t.asCollapsible.call(T.prototype, {
        collapsedHeight: 374,
        collapseTargetSelector: "[data-role=message-container]",
        collapseScope: "contentNode"
    }), n.call(T.prototype), T
}), define("lounge/views/posts/collection", ["jquery", "underscore", "backbone", "moment", "core/bus", "core/strings", "core/switches", "common/models", "common/utils", "lounge/views/posts/PostReplyView", "lounge/views/post"], function(a, b, c, d, e, f, g, h, i, j, k) {
    "use strict";
    var l = f.get,
        m = c.View.extend({
            events: {
                "click [data-action=more-posts]": "handleLoadMore",
                "click [data-action=show-children]": "handleLoadMoreChildPosts"
            },
            STREAMING_MAX_VISIBLE: 250,
            initialize: function(a) {
                this.lounge = a.lounge, this.thread = a.thread, this.userSuggestions = a.userSuggestions, this.posts = a.posts, this.postsToAppend = [], this.postsToPrepend = [], this.session = a.session, this.subViews = {}, this.state = {
                    nextPassTimeoutId: null,
                    renderedPosts: [],
                    clearDomAfterRender: !1,
                    totalPostsProcessed: 0,
                    totalElapsedTime: 0
                }, this.addPostsIncremental = b.bind(this.addPostsIncremental, this), this.listenTo(this.posts, {
                    reset: this.redrawPosts,
                    add: this.addPosts,
                    remove: this.removePost
                }), this.listenTo(this.thread, "change:badgeAction", this.handleBadgeAction), this.listenTo(this.thread, "change:highlightedPost", this.handleHasHighlightedState), this.listenToOnce(this.lounge, "threadView:init", function() {
                    this.listenTo(this.thread, "change:isClosed", this.toggleNoPosts), this.listenTo(this.session, "change:id", this.toggleNoPosts), this.listenTo(this.posts, "reset add", this.toggleNoPosts)
                }), this.listenTo(this.posts, "reset add", this.enableTimestampUpdates), this.listenTo(this, "render:end", this.toggleLoadMorePosts), this.listenTo(this, "render:end", this.handleHasHighlightedState), g.isFeatureActive("limit_rendered_posts", {
                    forum: this.thread.forum.id
                }) && this.listenTo(this.lounge, "scroll", b.throttle(this.hideOffscreenPosts, 200))
            },
            handleHasHighlightedState: function() {
                this.$el.toggleClass("has-highlighted-post", this.thread.has("highlightedPost"))
            },
            handleBadgeAction: function(a) {
                var b = this;
                Object.keys(this.subViews).forEach(function(c) {
                    var d = b.subViews[c];
                    d.model.author.id === a.id && d.updateBadges()
                })
            },
            getPostView: function(a) {
                return this.subViews[a]
            },
            bootstrap: function(a, c) {
                this.permalinkOptions = c, this.listenTo(this.posts, "reset", b.bind(this.posts.restoreFromCache, this.posts)), this.listenTo(this.posts, "change:isDeleted", b.bind(this.posts.removeFromCache, this.posts)), this.handleInitialCommentCount(a.posts)
            },
            handleInitialCommentCount: function(a) {
                var c = this.thread.forum.get("initialCommentCount");
                if (!c) {
                    var d = g.getSwitchContext("customCommentCounts") || {};
                    c = d[this.thread.forum.id]
                }
                this.posts.reset(a, {
                    customThreadLength: c
                }), b.invoke(this.subViews, "manageMessageHeight")
            },
            bindUIUpdateHandlers: function() {
                var c = this,
                    d = a(window),
                    e = a(window.document.body),
                    f = e.width(),
                    g = b.debounce(function() {
                        var a = e.width();
                        f !== a && c.subViews && (f = a, b.each(c.subViews, function(a) {
                            a.manageMessageHeight()
                        }))
                    }, 50);
                d.on("resize", g)
            },
            updateTimestamps: function() {
                return !(!this.subViews || b.size(this.subViews) < 1) && (b.invoke(this.subViews, "updateRelativeTime"), !0)
            },
            enableTimestampUpdates: function() {
                var a = this,
                    c = 6e4;
                if (!a.timestampUpdateTimer) {
                    var d = function e() {
                        return a.updateTimestamps() ? void(a.timestampUpdateTimer = b.delay(e, c)) : void(a.timestampUpdateTimer = null)
                    };
                    a.timestampUpdateTimer = b.delay(d, c)
                }
            },
            openReply: function(a) {
                var b = this.posts.get(a);
                if (b) {
                    var c = this.subViews[b.cid];
                    c.showReply()
                }
            },
            openEdit: function(a) {
                var b = this.posts.get(a);
                if (b) {
                    var c = this.subViews[b.cid];
                    c.showEdit()
                }
            },
            toggleLoadMorePosts: function() {
                var a = this.lounge.threadView.$el.find("#posts [data-role=more]"),
                    b = this.posts.hasNext();
                b ? a.show() : a.hide()
            },
            handleLoadMore: function(a) {
                var b = this.posts.currentPage();
                this._loadMore(a), this.lounge.trigger("uiAction:seeMore", b + 1)
            },
            handleLoadMoreChildPosts: function(a) {
                var b = a.currentTarget.id.split("-")[1],
                    c = this.posts.get(b);
                this._loadMore(a, c), this.lounge.trigger("uiAction:seeMoreChildren", a)
            },
            _loadMore: function(b, c) {
                b.preventDefault();
                var d = this,
                    f = a(b.currentTarget);
                f.addClass("busy"), d.posts.more({
                    post: c,
                    success: function() {
                        d.posts.restoreFromCache(), d.once("render:end", function() {
                            f.removeClass("busy")
                        })
                    },
                    error: function() {
                        f.removeClass("busy")
                    }
                }), e.frame.sendHostMessage("posts.paginate")
            },
            renderLayout: a.noop,
            toggleNoPosts: function() {
                var a, b = this.lounge.threadView.$el.find("#no-posts");
                this.posts.models.length ? b.hide() : (a = l(this.thread.get("isClosed") ? "This discussion has been closed." : this.session.get("canReply") ? "Be the first to comment." : "Nothing in this discussion yet."), b.text(a), b.show())
            },
            handleSort: function() {
                a("#posts [data-role=more]").hide(), a("#no-posts").hide(), a("#post-list").addClass("loading").empty()
            },
            redrawPosts: function() {
                var a = this;
                a.subViews = {}, a.once("render:end", function() {
                    b.each(j.open, function(b, c) {
                        var d = a.subViews[c];
                        if (d) {
                            var e = d.getReplyView();
                            e.textarea.set(b.textarea.get()), b.isOpen() ? e.show() : e.hide()
                        }
                    })
                }), a.posts.setPageFor && a.permalinkOptions && a.permalinkOptions.postId && a.posts.setPageFor(a.permalinkOptions.postId, {
                    silent: !0
                }), a.addPosts(a.posts, {
                    clearDom: !0
                })
            },
            hideOffscreenPosts: function(a) {
                var c = a.pageOffset,
                    d = this.lounge.position.frameOffset.top,
                    e = 2 * a.height,
                    f = c - e,
                    g = c + a.height + e;
                b.isNumber(c) && b.isNumber(e) && b.each(this.subViews, function(a) {
                    var b = a.$el,
                        c = b.offset().top + d,
                        e = c + b.outerHeight();
                    e < f || c > g ? b.addClass("invisible") : b.removeClass("invisible")
                })
            },
            postsShouldBePrepended: function(a) {
                var b = a.length && a[0];
                return Boolean(b && (b.created || !b.id || b.get("isRealtime") || b.get("isCached") || b.requestedByPermalink))
            },
            hasQueuedPosts: function() {
                return this.postsToAppend.length || this.postsToPrepend.length
            },
            addPosts: i.decorate(c.collectionAddNormalizer(c.Collection, h.Post), function(a, c, d) {
                var e = this;
                if (d.clearDom && (e.postsToAppend = [], e.postsToPrepend = [], e.postsShouldClearDom = !0), e.postsShouldBePrepended(a)) {
                    var f = [];
                    b.each(a, function(a) {
                        var b = a.get("parent");
                        b && e.posts.get(b) ? e.postsToPrepend.push(a) : f.push(a)
                    }), e.postsToPrepend = f.concat(e.postsToPrepend)
                } else e.postsToAppend = e.postsToAppend.concat(a);
                e.state.nextPassTimeoutId || (e.state.nextPassTimeoutId = b.defer(function() {
                    e.trigger("render:start"), e.addPostsIncremental(!0)
                }))
            }),
            onDeferredViewReady: function(a) {
                var b = this.subViews;
                b.hasOwnProperty(a) && b[a].manageMessageHeight()
            },
            removePost: function(a) {
                if (this.hasQueuedPosts()) return void this.once("render:end", b.bind(this.removePost, this, a));
                var c = this.subViews[a.cid];
                c && (c.remove(), delete this.subViews[a.cid])
            },
            addPostsIncremental: function(a) {
                this.state.nextPassTimeoutId = null, this.discardRenderProgressIfClearDomRequested();
                var b = this.getPostModelsForThePass();
                b.length && this.renderPass(b, a ? m.FIRST_ATTEMPT_TIME_SCALE : void 0), this.finishPass(b), this.scheduleNextPass()
            },
            discardRenderProgressIfClearDomRequested: function() {
                this.postsShouldClearDom && (this.state.clearDomAfterRender = !0, this.postsShouldClearDom = !1, this.state.renderedPosts = [])
            },
            getPostModelsForThePass: function() {
                return this.postsToAppend.length ? this.postsToAppend : this.postsToPrepend
            },
            renderPass: function(a, b) {
                var c = m.TARGET_PROCESS_TIME;
                b && (c *= b);
                for (var d = this.calculatePostsForNextRun(c) || m.MINIMUM_POSTS_PER_RUN; d > 0;) {
                    var e = a.splice(0, d),
                        f = this.timedRenderPosts(e);
                    if (null === f) break;
                    c -= f, d = this.calculatePostsForNextRun(c)
                }
            },
            timedRenderPosts: function(a) {
                if (!a.length) return null;
                var c = Number(new Date);
                this.state.renderedPosts = this.state.renderedPosts.concat(b.map(a, this.createPostView, this));
                var d = Number(new Date) - c;
                return d < 0 && (d = 0), this.state.totalElapsedTime += d, this.state.totalPostsProcessed += a.length, d || null
            },
            createPostView: function(a) {
                var b, c = a.get("parent");
                c && (c = this.posts.get(c), b = c && this.getPostView(c.cid));
                var d = new k({
                    parent: b,
                    model: a,
                    thread: this.thread,
                    session: this.session,
                    created: a.created,
                    userSuggestions: this.userSuggestions
                });
                return this.subViews[a.cid] = d, d.render(), d
            },
            calculatePostsForNextRun: function(a) {
                return a <= 0 ? 0 : this.state.totalElapsedTime <= 0 ? this.state.totalPostsProcessed : Math.floor(a * this.state.totalPostsProcessed / this.state.totalElapsedTime)
            },
            finishPass: function(a) {
                if (!a.length) {
                    if (this.$postList = this.lounge.threadView.$el.find("#post-list"), this.state.clearDomAfterRender && (this.$postList.empty(), this.state.clearDomAfterRender = !1), this.state.renderedPosts.length) {
                        this.removeOldPostsIfRealtime(), this.enablePostTracking(this.state.renderedPosts);
                        var b = a === this.postsToAppend;
                        this.insertPostElements(this.state.renderedPosts, b), this.state.renderedPosts = []
                    }
                    this.$postList.removeClass("loading"), this.postsToPrepend.length || this.postsToAppend.length || this.trigger("render:end")
                }
            },
            removeOldPostsIfRealtime: function() {
                var a = b.any(this.state.renderedPosts, function(a) {
                    return a.model.get("isRealtime")
                });
                a && this.removeOldPosts()
            },
            removeOldPosts: function() {
                var a = b.size(this.subViews) - this.STREAMING_MAX_VISIBLE;
                if (!(a <= 0))
                    for (var c, e = this.posts.sortBy(function(a) {
                            return d(a.get("createdAt")).valueOf()
                        }), f = 0, g = 0; g < e.length && f <= a; g++) c = this.getPostView(e[g].cid), c && 0 === c.childrenNode.children().length && (this.posts.remove(e[g]), f += 1)
            },
            enablePostTracking: function(a) {
                b.each(a, function(a) {
                    a.visible = !0
                })
            },
            insertPostElements: function(a, c) {
                var d = b.groupBy(a, function(a) {
                    return Boolean(a.parent)
                });
                b.each(d["true"], function(a) {
                    a.parent.attachChild(a)
                });
                var e = b.pluck(d["false"], "$el");
                c ? this.$postList.append(e) : this.$postList.prepend(e)
            },
            scheduleNextPass: function() {
                (this.postsToPrepend.length || this.postsToAppend.length) && (this.state.nextPassTimeoutId = b.defer(this.addPostsIncremental))
            }
        });
    return m.TARGET_PROCESS_TIME = 30, m.FIRST_ATTEMPT_TIME_SCALE = .8, m.MINIMUM_POSTS_PER_RUN = 2, {
        PostCollectionView: m
    }
}), define("templates/lounge/onboard", ["react", "core/config/urls", "core/strings", "core/utils/object/get"], function(a, b, c, d) {
    "use strict";
    var e = c.gettext,
        f = function(c) {
            return [a.createElement("div", {
                key: "onboard-notice",
                className: "notice " + (c.showHome ? "notice--brand" : "")
            }, a.createElement("div", {
                className: "notice-wrapper"
            }, a.createElement("span", {
                className: "notice__icon icon icon-disqus"
            }), a.createElement("a", {
                "data-action": "show-home",
                href: (b.home || "") + "explore/?utm_source=embed&utm_medium=onboard_message&utm_content=see_home_msg&forum_id=" + d(c.forum, ["id"], ""),
                target: "_blank",
                className: "notice__message"
            }, e("Welcome to %(Disqus)s! Discover more great discussions just like this one. We're a lot more than comments.", {
                Disqus: "Disqus"
            })), a.createElement("a", {
                "data-action": "show-home",
                href: (b.home || "") + "explore/?utm_source=embed&utm_medium=onboard_message&utm_content=see_home_btn&forum_id=" + d(c.forum, ["id"], ""),
                target: "_blank",
                className: "btn btn-primary notice__button"
            }, e("Get Started")))), a.createElement("a", {
                key: "onboard-link",
                className: "dismiss",
                "data-action": "close",
                href: "#",
                title: e("Dismiss")
            }, "Dismiss ", a.createElement("span", {
                "aria-label": "Dismiss",
                className: "cross"
            }, "×"))]
        };
    return f
}), define("lounge/views/onboard-alert", ["backbone", "react", "react-dom", "common/utils", "templates/lounge/onboard"], function(a, b, c, d, e) {
    "use strict";
    var f = a.View.extend({
        events: {
            "click [data-action=close]": "handleClose",
            "click [data-action=show-home]": "handleShowHome"
        },
        initialize: function(a) {
            this.session = a.session, this.forum = a.forum
        },
        render: function() {
            return this.session.isLoggedIn() && this.shouldShow() && (c.render(b.createElement(e, {
                forum: this.forum.toJSON()
            }), this.el), this.trigger("uiAction:onboardAlertShow")), this
        },
        shouldShow: function() {
            return !1
        },
        getCookie: function() {
            return d.cookies.read(f.COOKIE_NAME)
        },
        setInitialCookie: function() {
            this.session.user.get("joinedRecently") && this.createCookie(f.COOKIE_NEW_USER)
        },
        createCookie: function(a) {
            d.cookies.create(f.COOKIE_NAME, a, {
                expiresIn: 2592e6
            })
        },
        eraseCookie: function() {
            d.cookies.erase(f.COOKIE_NAME)
        },
        handleShowHome: function() {
            this.remove()
        },
        handleClose: function(a) {
            a.preventDefault(), this.remove(), this.trigger("uiAction:onboardAlertDismiss")
        },
        remove: function() {
            this.eraseCookie(), this.session = null, a.View.prototype.remove.call(this)
        }
    }, {
        COOKIE_NAME: "disqus.onboarding",
        COOKIE_NEW_USER: "newUser"
    });
    return {
        OnboardAlert: f
    }
}), define("templates/lounge/notificationMenu", ["react", "core/config/urls"], function(a, b) {
    "use strict";
    var c = function() {
        return a.createElement("a", {
            href: b.homeInbox || "",
            className: "notification-container",
            "data-action": "home",
            "data-home-path": "home/notifications/"
        }, a.createElement("span", {
            className: "notification-icon icon-comment",
            "aria-hidden": !0
        }), a.createElement("span", {
            className: "notification-count",
            "data-role": "notification-count"
        }))
    };
    return c
}), define("lounge/views/notification-menu", ["jquery", "underscore", "backbone", "stance", "core/bus", "core/switches", "core/utils", "templates/lounge/notificationMenu"], function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = c.View.extend({
        events: {
            "click [data-action=home]": "handleShowHome"
        },
        initialize: function(c) {
            var e = a.Deferred();
            this.listenToOnce(d(this), "enter", function() {
                e.resolveWith(this)
            });
            var f = this.session = c.session;
            this.forum = c.forum, this.language = window.document.documentElement.lang, this.listenTo(f, "change:id", this.render), this.listenTo(f, "change:notificationCount", this.updateCount), this.listenTo(f, "change:id", function() {
                e.done(b.bind(f.fetchNotificationCount, f)), e.done(this.preloadSidebar)
            }), this.listenTo(this, {
                "sidebar:open:start": this.startLoadingAnimation,
                "sidebar:open:done": this.stopLoadingAnimation
            })
        },
        startLoadingAnimation: function() {
            this.$el.addClass("notification-loading")
        },
        stopLoadingAnimation: function() {
            this.$el.removeClass("notification-loading")
        },
        preloadSidebar: function() {
            e.trigger("sidebar:preload")
        },
        render: function() {
            return this.forum.get("settings").ssoRequired && this.session.isLoggedOut() || f.isFeatureActive("sso_less_branding", {
                forum: this.forum.id
            }) ? void this.$el.hide() : (this.$el.html(h({})), this.updateCount(),
                this.$el.show(), this)
        },
        handleShowHome: function(b) {
            if (this.session.set("notificationCount", 0), !g.willOpenNewWindow(b)) {
                b.preventDefault();
                var c = a(b.currentTarget).attr("data-home-path");
                e.trigger("sidebar:open", c, this)
            }
        },
        updateCount: function() {
            var a = this.session.get("notificationCount") || 0;
            a > 0 ? (this.$("[data-role=notification-count]").html(a > 9 ? '9<i class="icon icon-plus"></i>' : a), this.$el.addClass("unread")) : (this.$("[data-role=notification-count]").html(""), this.$el.removeClass("unread"))
        }
    });
    return {
        NotificationMenuView: i
    }
}), define("templates/lounge/highlightedPost", ["react", "core/strings"], function(a, b) {
    "use strict";
    var c = b.gettext,
        d = function() {
            return a.createElement("div", null, a.createElement("h2", {
                className: "highlighted-comment-header"
            }, c("Featured Comment")), a.createElement("ul", {
                className: "post-list"
            }))
        };
    return d
}), define("lounge/views/highlighted-post", ["backbone", "underscore", "jquery", "core/UniqueModel", "common/models", "lounge/views/post", "templates/lounge/highlightedPost"], function(a, b, c, d, e, f, g) {
    "use strict";
    var h = a.View.extend({
            template: g,
            itemViewContainer: ".post-list",
            initialize: function(a) {
                b.extend(this, b.pick(a, ["thread", "session", "userSuggestions"])), this.listenTo(this.thread, "change:highlightedPost", this.reset)
            },
            getPost: function() {
                return this.post ? c.Deferred().resolve(this.post) : this.getHighlightedPost()
            },
            _getHighlightedPost: function() {
                var a = this.thread.get("highlightedPost");
                return a ? (a instanceof e.Post || (a = new d(e.Post, a)), a.get("isDeleted") ? null : a.get("sb") && !a.isAuthorSessionUser(this.session) ? null : a.get("isHighlighted") ? a : null) : null
            },
            getHighlightedPost: function() {
                var a, d = this.post = this._getHighlightedPost(),
                    f = c.Deferred();
                return d ? (a = d.getParent()) && !a.author ? e.Post.fetchContext(d.id, this.thread).always(b.bind(f.resolve, f)) : f.resolve() : f.reject(), f.promise()
            },
            reset: function() {
                delete this.post, this.getPost().always(b.bind(this.render, this))
            },
            createPostView: function() {
                return this.post ? new i({
                    model: this.post,
                    thread: this.thread,
                    session: this.session,
                    userSuggestions: this.userSuggestions,
                    excludeAnchor: !0
                }).stopListening(this.post.usersTyping) : null
            },
            render: function() {
                var a = this.createPostView();
                return a ? (a.render(), this.$el.html(this.template()), this.$(this.itemViewContainer).append(a.el), this.$el.show(), this) : (this.$el.hide(), this)
            }
        }),
        i = f.extend({
            getPostAttributes: function() {
                var a = f.prototype.getPostAttributes.apply(this, arguments);
                return a.canBeRepliedTo = !1, a.hasMore = !1, a
            },
            getStateByline: function() {
                return !1
            }
        });
    return {
        HighlightedPostView: h,
        FeaturedPostView: i
    }
}), define("templates/lounge/realtimeCommentNotification", ["core/strings"], function(a) {
    "use strict";
    var b = a.gettext,
        c = function(a) {
            return 1 === a.comments ? b("Show One New Comment") : b("Show %(comments)s New Comments", {
                comments: a.comments
            })
        };
    return c
}), define("templates/lounge/realtimeReplyNotification", ["react", "core/strings"], function(a, b) {
    "use strict";
    var c = b.gettext,
        d = function(b) {
            return [a.createElement("span", {
                key: "indicator",
                className: "indicator"
            }), 1 === b.replies ? c("Show 1 new reply") : c("Show %(replies)s new replies", {
                replies: b.replies
            })]
        };
    return d
}), define("lounge/views/realtime", ["underscore", "backbone", "react", "react-dom", "core/bus", "core/utils", "lounge/common", "templates/lounge/realtimeCommentNotification", "templates/lounge/realtimeReplyNotification"], function(a, b, c, d, e, f, g, h, i) {
    "use strict";
    var j = f.preventDefaultHandler,
        k = b.View.extend({
            events: {
                click: "handleDrain"
            },
            initialize: function(a) {
                this.options = a
            },
            getDirection: function(a) {
                if (this.offset && this.dim) {
                    var b = a.pageOffset,
                        c = b + a.height,
                        d = this.offset.top + a.frameOffset.top,
                        e = d + this.dim.height;
                    return e < b ? 1 : d > c ? -1 : 0
                }
            },
            setCount: function(a) {
                this.options.count = a
            },
            render: function() {
                return 0 === this.options.count ? void this.$el.hide() : (d.render(c.createElement(h, {
                    comments: this.options.count
                }), this.el), this.listenTo(g.getLounge(), "domReflow", a.throttle(function() {
                    0 !== this.options.count && (this.offset = this.$el.offset(), this.dim = {
                        height: this.$el.height(),
                        width: this.$el.width()
                    })
                }, 400)), this.$el.show(), this)
            },
            handleDrain: j(function() {
                this.model.queue.drain(), this.setCount(this.model.queue.counters.comments), this.render(), e.trigger("uiAction:loadLiveComments")
            })
        }),
        l = k.extend({
            events: {
                click: "handleDrain"
            },
            getDirection: function(a) {
                if (this.options.postView.visible) {
                    this.offset = this.options.postView.offset, this.dim = this.options.postView.dim;
                    var b = k.prototype.getDirection.call(this, a);
                    return delete this.offset, delete this.dim, b
                }
            },
            render: function() {
                var b = this,
                    e = b.options.postView;
                return 0 === b.options.count ? (b.$el.hide(), void(e.trackPosition = !1)) : (e.trackPosition = !0, e.calcRect(), d.render(c.createElement(i, {
                    replies: b.options.count
                }), this.el), b.$el.show(), void a.delay(function() {
                    b.$el.addClass("reveal")
                }, 13))
            },
            handleDrain: j(function() {
                var a = this.model.id,
                    b = this.options.postView,
                    c = this.options.thread.queue;
                c.drain(a), this.setCount(c.counters.replies[a]), b.trackPosition = !1, this.render(), e.trigger("uiAction:loadLiveReplies")
            })
        });
    return {
        QueuedPostView: k,
        QueuedReplyView: l
    }
}), define("lounge/views/posts/UserSuggestionsManager", ["underscore", "common/collections"], function(a, b) {
    "use strict";

    function c(a) {
        this.remotes = [], this.threadId = a.threadId, this.userCollection = new b.UserSuggestionsCollection([], {
            threadId: this.threadId
        })
    }
    return a.extend(c.prototype, {
        fetch: function(a, b) {
            this.userCollection.fetch({
                query: a || "",
                next: b
            })
        },
        addRemote: function(a) {
            this.remotes.push(a)
        },
        all: function() {
            var c = new b.UserCollection;
            return c.add(this.userCollection.models), c.add(a.chain(this.remotes).pluck("models").flatten().value()), c
        },
        find: function(a, b) {
            a && a.length && this.fetch(a.join(" ").replace(/[^\w\s]/, ""), b)
        },
        get: function(a) {
            return this.userCollection.get(a)
        }
    }), c
}), define("lounge/views/sidebar", ["underscore", "backbone", "modernizr", "core/bus", "core/switches", "core/utils/url/serialize", "core/shared/urls", "core/utils"], function(a, b, c, d, e, f, g, h) {
    "use strict";
    var i = b.View.extend({
        initialize: function(a) {
            this.forum = a.forum, this.session = a.session, this.config = a.config, this.language = window.document.documentElement.lang, "en" === this.language && (this.language = void 0), this.listenTo(this.session, "change:id", this.destroyHome), this.listenTo(d, {
                "sidebar:open": this.open,
                "sidebar:preload": this.preload
            }), this.iframeAlive = !0, this.iframeReady = !1, this.listenToOnce(d.frame, "home.timeout", this.handleTimeout), this.listenToOnce(d.frame, "home.ready", this.handleReady)
        },
        isIE9: function() {
            return 9 === window.document.documentMode
        },
        shouldUseIframe: function() {
            return !!this.iframeAlive && (this.session.isSSO() || this.config && this.config.disableDisqusBranding || e.isFeatureActive("sso_less_branding", {
                forum: this.forum.id
            }))
        },
        handleTimeout: function() {
            this.iframeAlive = !1
        },
        handleReady: function() {
            this.iframeReady = !0, d.frame.off("home.timeout")
        },
        open: function(b, c) {
            if (this.shouldUseIframe()) {
                if (this.storeHomeSession(), d.frame.sendHostMessage("home.show", {
                        path: b,
                        language: this.language,
                        forum: this.forum && this.forum.id
                    }), this.iframeReady || this.listenToOnce(d.frame, "home.timeout", a.bind(this.open, this, b, c)), c) {
                    c.trigger("sidebar:open:start");
                    var e = a.bind(c.trigger, c, "sidebar:open:done");
                    this.listenToOnce(d.frame, {
                        "home.opened": e,
                        "home.timeout": e
                    })
                }
            } else h.openWindow(f(g.apps.home + b, {
                l: this.language
            }));
            var i = "unknown";
            0 === b.indexOf("home/forums/") ? i = "community" : 0 === b.indexOf("by/") ? i = "profile" : "home/inbox/" === b && (i = "notifications"), d.trigger("uiAction:openHome", i, this.shouldUseIframe())
        },
        destroyHome: function() {
            d.frame.sendHostMessage("home.destroy")
        },
        preload: function() {
            this.session.isLoggedOut() || this.shouldUseIframe() && (this.storeHomeSession(), d.frame.sendHostMessage("home.preload", {
                language: this.language
            }))
        },
        storeHomeSession: function() {
            c.sessionstorage && window.sessionStorage.setItem("home.session", JSON.stringify(this.session.user.toJSON()))
        }
    });
    return i
}), define("core/constants/ratingsConstants", ["exports"], function(a) {
    "use strict";
    a.DEFAULT_RATINGS = {
        average: 0,
        breakdown: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
        },
        count: 0
    }
});
var _slicedToArray = function() {
    function a(a, b) {
        var c = [],
            d = !0,
            e = !1,
            f = void 0;
        try {
            for (var g, h = a[Symbol.iterator](); !(d = (g = h.next()).done) && (c.push(g.value), !b || c.length !== b); d = !0);
        } catch (i) {
            e = !0, f = i
        } finally {
            try {
                !d && h["return"] && h["return"]()
            } finally {
                if (e) throw f
            }
        }
        return c
    }
    return function(b, c) {
        if (Array.isArray(b)) return b;
        if (Symbol.iterator in Object(b)) return a(b, c);
        throw new TypeError("Invalid attempt to destructure non-iterable instance")
    }
}();
define("core/templates/react/RatingsScoreTemplate", ["react", "underscore", "core/strings"], function(a, b, c) {
    "use strict";
    var d = function(b) {
            var c = b.breakdown,
                d = b.totalCount;
            return a.createElement("div", {
                className: "ratings-breakdown-units align align--stretch"
            }, a.createElement("div", {
                className: "align__item--flex-1 align align--column"
            }, c.map(function(b, c) {
                var e = b.rating,
                    f = b.count,
                    g = b.percentage;
                return a.createElement("div", {
                    className: "ratings-breakdown-unit-row align align--middle",
                    key: c
                }, a.createElement("div", {
                    className: "ratings-breakdown-text"
                }, e, " ", a.createElement("div", {
                    className: "rating-star"
                }, "★")), a.createElement("div", {
                    className: "align__item--flex-1 align align--center align--middle"
                }, a.createElement("div", {
                    className: "ratings-breakdown-outer-bar"
                }, a.createElement("div", {
                    className: "ratings-breakdown-inner-bar" + (d && f ? "" : " no-rating"),
                    style: {
                        width: g / 2 + "px"
                    }
                }))))
            })), a.createElement("div", {
                className: "align align--column"
            }, c.map(function(b, c) {
                var d = b.percentage;
                return a.createElement("div", {
                    key: c,
                    className: "ratings-breakdown-unit-row ratings-breakdown-percentage align__item--flex-1 align align--center"
                }, a.createElement("div", {
                    className: "align__item--flex-1 text-right"
                }, d, "%"))
            })), a.createElement("div", {
                className: "align align--column"
            }, c.map(function(b, c) {
                var d = b.count;
                return a.createElement("div", {
                    key: c,
                    className: "ratings-breakdown-unit-row ratings-breakdown-percentage align__item--flex-1 align align--center"
                }, a.createElement("div", {
                    className: "align__item--flex-1 text-left"
                }, "(", d, ")"))
            })))
        },
        e = function(e) {
            var f = e.totalCount,
                g = e.average,
                h = e.breakdown,
                i = e.error,
                j = e.expandClass;
            return a.createElement("div", {
                className: "ratings-score"
            }, a.createElement("div", {
                className: "spacing-top-small align align--center"
            }, 1 === f ? c.gettext("1 Rating") : c.gettext("%(totalCount)s Ratings", {
                totalCount: f
            })), a.createElement("div", {
                className: "ratings-items align align--center align--middle",
                tabIndex: "0"
            }, a.createElement("div", {
                className: "ratings-stars"
            }, a.createElement("div", {
                className: "stars score-stars",
                style: {
                    width: 20 * g + "%"
                }
            }, a.createElement("div", {
                className: "rating-star"
            }, "★"), a.createElement("div", {
                className: "rating-star"
            }, "★"), a.createElement("div", {
                className: "rating-star"
            }, "★"), a.createElement("div", {
                className: "rating-star"
            }, "★"), a.createElement("div", {
                className: "rating-star"
            }, "★")), a.createElement("div", {
                className: "stars base-stars"
            }, a.createElement("div", {
                className: "rating-star"
            }, "★"), a.createElement("div", {
                className: "rating-star"
            }, "★"), a.createElement("div", {
                className: "rating-star"
            }, "★"), a.createElement("div", {
                className: "rating-star"
            }, "★"), a.createElement("div", {
                className: "rating-star"
            }, "★"))), a.createElement("div", {
                className: "ratings-average"
            }, (Math.round(10 * g) / 10).toFixed(1), a.createElement("div", {
                className: "ratings-breakdown " + j
            }, a.createElement("div", {
                className: "ratings-breakdown-notch-border"
            }), a.createElement("div", {
                className: "ratings-breakdown-notch"
            }), a.createElement(d, {
                breakdown: b.sortBy(b.mapObject(h, function(a, b) {
                    return [Number(b), a]
                }), function(a) {
                    return -a[0]
                }).map(function(a) {
                    var b = _slicedToArray(a, 2),
                        c = b[0],
                        d = b[1];
                    return {
                        rating: c,
                        count: d,
                        percentage: f && d ? (100 * d / f).toFixed() : 0
                    }
                }),
                totalCount: f
            })))), a.createElement("div", {
                className: "err text-semibold"
            }, i || ""))
        };
    return e
});
var _extends = Object.assign || function(a) {
    for (var b = 1; b < arguments.length; b++) {
        var c = arguments[b];
        for (var d in c) Object.prototype.hasOwnProperty.call(c, d) && (a[d] = c[d])
    }
    return a
};
define("lounge/views/ratings", ["underscore", "backbone", "react", "react-dom", "core/constants/ratingsConstants", "core/utils/threadRatingsHelpers", "core/templates/react/RatingsScoreTemplate"], function(a, b, c, d, e, f, g) {
    "use strict";
    var h = b.View.extend({
        initialize: function(a) {
            this.session = a.session, this.thread = a.thread, this.error = null, this.listenTo(this.thread, "change:ratingsEnabled change:ratings", this.render), this.thread.forum.get("features") || this.listenToOnce(this.thread.forum, "change:features", this.render)
        },
        setError: function() {
            var b = this;
            this.error = "You must be logged in to rate this page", this.render(), setTimeout(a.bind(function() {
                b.error = null, b.render()
            }, this), 5e3)
        },
        render: function() {
            if (f.isThreadModelRatingsEnabled(this.thread)) {
                var a = this.thread.get("ratings") || e.DEFAULT_RATINGS;
                d.render(c.createElement(g, _extends({}, a, {
                    totalCount: a.count || 0,
                    error: this.error,
                    expandClass: "expand-below"
                })), this.el)
            } else this.$el.empty();
            return this
        }
    });
    return h
}), define("core/utils/reactions", ["jquery", "underscore"], function(a, b) {
    "use strict";
    var c = function() {
            for (var b, c = a("#reactions").width(), d = a(".reaction-item").map(function(b, c) {
                    return a(c).width()
                }).get(), e = 0, f = []; !b && e < a(".reaction-item").length;) {
                e += 1, b = !0;
                var g = Math.ceil(d.length / e);
                f = [];
                for (var h = 0; h < e; h++) {
                    var i = d.slice(g * h, g * (h + 1)),
                        j = i.reduce(function(a, b) {
                            return a + b
                        }, 0);
                    if (j >= c) {
                        b = !1;
                        break
                    }
                    f.push(j)
                }
            }
            a(".reaction-items__container").width(Math.max.apply(null, f) + 1)
        },
        d = function(b) {
            var d = a(".reaction-items").width();
            d !== b._lastReactionsWidth && (b._lastReactionsWidth = d, c())
        },
        e = function(c) {
            c._lastReactionsWidth = a(".reaction-items").width();
            var e = 200;
            c._reactionsResizeListener = b.debounce(b.partial(d, c), e), a(window).resize(c._reactionsResizeListener)
        },
        f = function(b) {
            b._reactionsResizeListener && a(window).off("resize", b._reactionsResizeListener)
        };
    return {
        attachReactionsListener: e,
        formatReactionsItems: c,
        detachReactionsListener: f
    }
}), define("core/constants/reactionConstants", ["exports", "core/strings"], function(a, b) {
    "use strict";
    var c = b.get,
        d = "//c.disquscdn.com/next/current/publisher-admin/assets/img/emoji/";
    a.DEFAULT_REACTIONS = [{
        text: "Upvote",
        imageUrl: d + "upvote-512x512.png"
    }, {
        text: "Funny",
        imageUrl: d + "funny-512x512.png"
    }, {
        text: "Love",
        imageUrl: d + "love-512x512.png"
    }, {
        text: "Surprised",
        imageUrl: d + "surprised-512x512.png"
    }, {
        text: "Angry",
        imageUrl: d + "angry-512x512.png"
    }, {
        text: "Sad",
        imageUrl: d + "sad-512x512.png"
    }], a.DEFAULT_PROMPT = c("What do you think?"), a.DEFAULT_DESCRIPTIONS = ["Upvote", "Funny", "Love", "Surprised", "Angry", "Sad"], a.UPLOAD_IMAGE_ERROR_MESSAGES = {
        "invalid-image-file": "Unfortunately your image upload failed. Please verify that the file is valid and in a supported format (JPEG, PNG, or GIF).",
        "invalid-content-type": "Unfortunately your image upload failed. Please verify that the file is in a supported format (JPEG, PNG, or GIF).",
        "file-too-large": "Unfortunately your image upload failed. Please verify that your image is under 5MB.",
        "not-authenticated": "You must be logged in to upload an image.",
        "default": "Unfortunately your image upload failed. Please verify that your image is in a supported format (JPEG, PNG, or GIF) and under 5MB. If you continue seeing this error, please try again later."
    }
});
var _extends = Object.assign || function(a) {
    for (var b = 1; b < arguments.length; b++) {
        var c = arguments[b];
        for (var d in c) Object.prototype.hasOwnProperty.call(c, d) && (a[d] = c[d])
    }
    return a
};
define("core/templates/react/ReactionItemsPartial", ["react", "core/constants/reactionConstants"], function(a, b) {
    "use strict";
    var c = function(c) {
        var d = c.reactionsList,
            e = c.onSubmitReaction,
            f = c.showVoteCount,
            g = c.readonly,
            h = function(a, b) {
                e && !g && e(a, b)
            },
            i = function(a, b, c) {
                var d = 13;
                a.keyCode === d && h(b, c)
            },
            j = d.map(function(a) {
                if (!a.imageUrl) return a;
                var c = a.imageUrl.split("/"),
                    d = b.DEFAULT_REACTIONS.filter(function(a) {
                        var b = a.imageUrl.split("/");
                        return b[b.length - 1].split("-")[0].split(".")[0] === c[c.length - 1].split("-")[0].split(".")[0]
                    }),
                    e = (d.length ? d[0] : a).imageUrl;
                return _extends({}, a, {
                    imageUrl: e
                })
            });
        return a.createElement("div", {
            className: "align align--center align--wrap reaction-items__container"
        }, j.map(function(b, c) {
            return a.createElement("div", {
                key: c,
                className: ["reaction-item align align--column align--middle spacing-bottom-narrow", e ? "reaction-item__enabled" : "reaction-item__disabled", b.isSelected ? "reaction-item__selected" : ""].join(" ").trim()
            }, a.createElement("div", {
                className: "align align--middle align--column reaction-item__button",
                tabIndex: g ? "-1" : "0",
                onKeyPress: function(a) {
                    return i(a, c, b)
                },
                onClick: function() {
                    return h(c, b)
                }
            }, a.createElement("div", {
                className: "reaction-item__image-wrapper"
            }, b.imageUrl ? a.createElement("img", {
                className: "reaction-item__image",
                src: b.imageUrl,
                title: b.text || "reaction " + c,
                alt: b.text || "reaction " + c
            }) : null, a.createElement("div", {
                className: "reaction-item__votes-wrapper"
            }, void 0 !== b.votes && f ? a.createElement("div", {
                className: "reaction-item__votes"
            }, b.votes || 0) : a.createElement("div", {
                className: "reaction-item__votes"
            }, " "))), b.text && b.text.trim() ? a.createElement("div", {
                className: "reaction-item__text"
            }, b.text) : null))
        }))
    };
    return c
}), define("core/templates/react/ReactionsTemplate", ["react", "core/strings", "core/templates/react/ReactionItemsPartial", "core/constants/reactionConstants"], function(a, b, c, d) {
    "use strict";
    var e = function(e) {
        var f = e.reactionsList,
            g = e.prompt,
            h = e.onSubmitReaction,
            i = e.error,
            j = e.readonly,
            k = e.userCanModerate,
            l = f.reduce(function(a, b) {
                return a + ("number" == typeof b.votes ? b.votes : 0)
            }, 0),
            m = f.some(function(a) {
                return a.isSelected
            });
        return a.createElement("div", {
            id: "reactions"
        }, a.createElement("div", {
            className: "text-bold align align--center spacing-bottom-small"
        }, g && g.trim() || d.DEFAULT_PROMPT), a.createElement("div", {
            className: "align align--center spacing-bottom"
        }, 1 === l ? b.gettext("1 Response") : b.gettext("%(voteCount)s Responses", {
            voteCount: l
        })), a.createElement("div", {
            className: ["reaction-items", j ? "readonly" : "", m ? "has-selection" : "", k || m || j ? "counts-visible" : ""].join(" ").trim()
        }, a.createElement(c, {
            reactionsList: f,
            onSubmitReaction: h,
            showVoteCount: k || m || j,
            readonly: j
        })), a.createElement("div", {
            className: "err text-semibold"
        }, i || ""))
    };
    return e
}), define("lounge/views/reactions", ["backbone", "react", "react-dom", "core/bus", "core/utils/reactions", "core/templates/react/ReactionsTemplate"], function(a, b, c, d, e, f) {
    "use strict";
    var g = a.View.extend({
        initialize: function(a) {
            this.reactions = a.reactions, this.readonly = a.readonly, this.session = a.session, this.userCanModerate = this.session.get("canModerate"), this.listenTo(this.reactions, "sync", this.render), this.listenTo(this.reactions, "vote:start", this.handleSubmitStart), this.listenTo(this.reactions, "vote:end", this.handleSubmitEnd), this.listenTo(this.session, "change:canModerate", this.handleCanModerateChange), e.attachReactionsListener(this)
        },
        handleSubmitStart: function() {
            this.isSubmitting = !0, this.$(".reaction-items").addClass("is-submitting"), this.$(".err").html()
        },
        handleSubmitEnd: function() {
            this.isSubmitting = !1, this.$(".reaction-items").removeClass("is-submitting")
        },
        handleCanModerateChange: function() {
            this.userCanModerate = this.session.get("canModerate"), this.render()
        },
        vote: function(a) {
            if (!this.isSubmitting && !this.readonly) {
                var b = this;
                this.reactions.vote(a, {
                    success: this.render.bind(this),
                    error: function() {
                        b.$(".err").html("An error has occurred while saving your reaction. Please try again later.")
                    }
                }), d.trigger("uiAction:reactionsVote", this.reactions.at(a))
            }
        },
        render: function() {
            return this.reactions.length ? c.render(b.createElement(f, {
                reactionsList: this.reactions.toJSON(),
                prompt: this.reactions.prompt,
                onSubmitReaction: this.vote.bind(this),
                readonly: this.readonly,
                userCanModerate: this.userCanModerate
            }), this.el) : this.$el.html(""), this
        }
    });
    return g
}), define("templates/lounge/reactionsPromotion", ["react", "core/strings", "core/templates/react/ReactionItemsPartial", "core/constants/reactionConstants"], function(a, b, c, d) {
    "use strict";
    var e = b.gettext,
        f = function(b) {
            var f = b.onConfirm,
                g = b.onDefer,
                h = b.forumShortname;
            return a.createElement("div", {
                id: "reactions-promotion"
            }, a.createElement("div", {
                className: "striped-bar"
            }), a.createElement("div", {
                className: "align align--center private"
            }, a.createElement("span", {
                className: "icon icon-lock"
            }), e("Only you can see this")), a.createElement("div", {
                className: "promotion-title text-bold align align--center spacing-top-narrow spacing-bottom"
            }, e("Want to increase engagement? Add Reactions to your articles.")), a.createElement("div", {
                className: "reaction-items"
            }, a.createElement(c, {
                reactionsList: d.DEFAULT_REACTIONS,
                readonly: !0
            })), a.createElement("div", {
                className: "align align--center"
            }, a.createElement("button", {
                className: "btn btn-info",
                onClick: g
            }, e("Maybe later")), a.createElement("a", {
                className: "btn btn-primary spacing-left",
                onClick: f,
                target: "_blank",
                rel: "noopener noreferrer",
                href: "https://" + h + ".disqus.com/admin/settings/reactions/"
            }, "Enable Reactions")))
        };
    return f
}), define("lounge/views/reactions-promotion", ["backbone", "stance", "react", "react-dom", "core/api", "lounge/common", "templates/lounge/reactionsPromotion"], function(a, b, c, d, e, f, g) {
    "use strict";
    var h = a.View.extend({
        initialize: function(a) {
            this.forum = a.forum, this.listenToOnce(b(this), "visible", this.trackView)
        },
        onConfirm: function() {
            f.getLounge().trigger("uiAction:reactionsEnable"), this.onDismiss()
        },
        onDefer: function() {
            f.getLounge().trigger("uiAction:reactionsDefer"), this.onDismiss()
        },
        onDismiss: function() {
            this.dismissed = !0, this.render(), e.call("announcements/messages/view", {
                method: "POST",
                data: {
                    message: "reactionsEmbedPromotion"
                }
            })
        },
        trackView: function() {
            f.getLounge().trigger("uiAction:viewReactionsPromotion")
        },
        render: function() {
            return this.dismissed ? this.$el.html("") : d.render(c.createElement(g, {
                onDefer: this.onDefer.bind(this),
                onConfirm: this.onConfirm.bind(this),
                forumShortname: this.forum.id
            }), this.el), this
        }
    });
    return h
}), define("templates/lounge/userMenu", ["react", "core/config/urls", "core/strings", "core/switches", "core/utils/object/get", "core/utils/threadRatingsHelpers", "templates/lounge/partials/profileLink"], function(a, b, c, d, e, f, g) {
    "use strict";
    var h = c.gettext,
        i = function(c) {
            return [!e(c.user, ["thread", "canReply"]) || !e(c.user, ["thread", "canModerate"]) && d.isFeatureActive("sso_less_branding", {
                forum: c.thread.forum
            }) ? null : a.createElement("a", {
                key: "user-menu-dropdown",
                href: "#",
                className: "dropdown-toggle",
                "data-toggle": "dropdown",
                role: "menuitem",
                name: e(c.user, ["isRegistered"]) ? "User Menu" : h("Login")
            }, a.createElement("span", {
                className: "dropdown-toggle-wrapper"
            }, e(c.user, ["isRegistered"]) ? a.createElement("span", null, a.createElement("span", {
                className: "avatar"
            }, a.createElement("img", {
                "data-role": "user-avatar",
                "data-user": e(c.user, ["id"], ""),
                "data-src": e(c.user, ["avatar", "cache"], ""),
                alt: h("Avatar")
            })), a.createElement("span", {
                className: "username",
                "data-role": "username",
                "data-username": e(c.user, ["username"], "")
            }, e(c.user, ["name"]) || e(c.user, ["username"]) || null)) : a.createElement("span", null, h("Login")), " "), " ", a.createElement("span", {
                className: "caret"
            })), a.createElement("ul", {
                key: "user-menu-menu",
                className: "dropdown-menu"
            }, e(c.user, ["isRegistered"]) ? [e(c.user, ["thread", "canModerate"]) && d.isFeatureActive("sso_less_branding", {
                forum: c.thread.forum
            }) ? null : a.createElement("li", {
                key: "menu-profile"
            }, a.createElement(g, {
                user: c.user,
                forum: c.forum
            }, h("Your Profile"))), a.createElement("li", {
                key: "menu-media"
            }, a.createElement("a", {
                href: "#",
                className: "media-toggle-on",
                "data-action": "toggle-media"
            }, h("Display Media")), a.createElement("a", {
                href: "#",
                className: "media-toggle-off",
                "data-action": "toggle-media"
            }, h("Hide Media"))), e(c.user, ["remote"]) ? null : a.createElement("li", {
                key: "menu-settings"
            }, a.createElement("a", {
                href: e(b, ["editProfile"], "")
            }, h("Edit Settings")))] : [e(c.sso, ["url"]) ? a.createElement("li", {
                key: "menu-auth-sso",
                className: "sso"
            }, a.createElement("a", {
                href: "#",
                "data-action": "auth:sso"
            }, e(c.sso, ["name"], null))) : null, a.createElement("li", {
                key: "menu-auth-disqus"
            }, a.createElement("a", {
                href: "#",
                "data-action": "auth:disqus"
            }, "Disqus")), a.createElement("li", {
                key: "menu-auth-facebook"
            }, a.createElement("a", {
                href: "#",
                "data-action": "auth:facebook"
            }, "Facebook")), a.createElement("li", {
                key: "menu-auth-twitter"
            }, a.createElement("a", {
                href: "#",
                "data-action": "auth:twitter"
            }, "Twitter")), a.createElement("li", {
                key: "menu-auth-google"
            }, a.createElement("a", {
                href: "#",
                "data-action": "auth:google"
            }, "Google"))], e(c.user, ["thread", "canModerate"]) ? [c.forum.settings.validateAllPosts ? null : a.createElement("li", {
                key: "menu-toggle-thread-premoderate"
            }, a.createElement("a", {
                href: "#",
                "data-action": "toggle-thread-premoderate"
            }, h(c.thread.validateAllPosts ? "Don't Premoderate Thread" : "Premoderate Thread"))), a.createElement("li", {
                key: "menu-toggle-thread"
            }, a.createElement("a", {
                href: "#",
                "data-action": "toggle-thread"
            }, h(e(c.thread, ["isClosed"]) ? "Open Thread" : "Close Thread"))), e(c.forum, ["settings", "threadReactionsEnabled"]) && e(c.user, ["thread", "canModerate"]) && c.thread.reactions.eligible ? a.createElement("li", {
                key: "menu-toggle-reactions"
            }, a.createElement("a", {
                href: "#",
                "data-action": "toggle-reactions"
            }, h(c.thread.reactions && c.thread.reactions.enabled ? "Remove Reactions" : "Restore Reactions"))) : null, f.isForumRatingsEnabled(c.forum) ? a.createElement("li", {
                key: "menu-toggle-thread-ratings"
            }, a.createElement("a", {
                href: "#",
                "data-action": "toggle-thread-ratings"
            }, h(c.thread.ratingsEnabled ? "Disable Ratings" : "Enable Ratings"))) : null, e(c.user, ["isGlobalAdmin"]) ? null : a.createElement("li", {
                key: "menu-help"
            }, a.createElement("a", {
                href: "https://help.disqus.com/customer/portal/articles/2538045-commenter-launch-pad"
            }, h("Help")))] : null, e(c.user, ["isGlobalAdmin"]) ? [a.createElement("li", {
                key: "menu-debug"
            }, a.createElement("a", {
                href: "#",
                "data-action": "debug"
            }, h("Debug"))), a.createElement("li", {
                key: "menu-repair"
            }, a.createElement("a", {
                href: "#",
                "data-action": "repair"
            }, h("Repair")))] : null, e(c.user, ["isRegistered"]) && e(c.user, ["thread", "canReply"]) ? a.createElement("li", null, a.createElement("a", {
                href: "#",
                "data-action": "logout"
            }, h("Logout"))) : null)]
        };
    return i
}), define("templates/lounge/threadShareBar", ["react", "core/strings"], function(a, b) {
    "use strict";
    var c = b.gettext,
        d = function() {
            return a.createElement("div", {
                className: "thread-share-bar-buttons"
            }, a.createElement("span", {
                className: "thread-share__button share-twitter",
                "data-action": "share:twitter",
                tabIndex: "0"
            }, a.createElement("span", {
                className: "icon-twitter"
            }), a.createElement("span", {
                className: "share-text"
            }, c("Tweet"))), a.createElement("span", {
                className: "thread-share__button share-facebook",
                "data-action": "share:facebook",
                tabIndex: "0"
            }, a.createElement("span", {
                className: "icon-facebook"
            }), a.createElement("span", {
                className: "share-text"
            }, c("Share"))))
        };
    return d
}), define("templates/lounge/layout", ["react"], function(a) {
    "use strict";
    var b = function(b) {
        var c = b.forum;
        return a.createElement("div", {
            id: "layout",
            "data-tracking-area": "layout"
        }, c.settings.behindClickEnabled ? a.createElement("div", {
            id: "behindclick__container"
        }) : null, a.createElement("div", {
            id: "thread__container"
        }))
    };
    return b
}), define("templates/lounge/inthreadAd", ["react"], function(a) {
    "use strict";
    var b = function() {
        return a.createElement("li", {
            className: "post advertisement"
        }, a.createElement("div", {
            className: "post-content",
            "data-role": "post-content"
        }))
    };
    return b
}), define("templates/lounge/termsOfService", ["react", "core/strings"], function(a, b) {
    "use strict";
    var c = b.gettext,
        d = function() {
            return a.createElement("div", null, a.createElement("div", {
                className: "checkbox-wrapper"
            }, a.createElement("p", null, a.createElement("label", null, a.createElement("input", {
                type: "checkbox",
                name: "tos"
            }), a.createElement("span", {
                className: "spacing-left-small"
            }, c("I agree to Disqus' %(terms)s", {
                terms: a.createElement("a", {
                    href: "https://help.disqus.com/customer/portal/articles/466260-terms-of-service",
                    target: "_blank",
                    rel: "noopener noreferrer"
                }, c("Terms of Service"))
            })))), a.createElement("p", null, a.createElement("label", null, a.createElement("input", {
                type: "checkbox",
                name: "privacy-policy"
            }), a.createElement("span", {
                className: "spacing-left-small"
            }, c("I agree to Disqus' processing of email and IP address, and the use of cookies, to facilitate my authentication and posting of comments, explained further in the %(policy)s", {
                policy: a.createElement("a", {
                    href: "https://help.disqus.com/customer/portal/articles/466259-privacy-policy",
                    target: "_blank",
                    rel: "noopener noreferrer"
                }, c("Privacy Policy"))
            })))), a.createElement("p", null, a.createElement("label", null, a.createElement("input", {
                type: "checkbox",
                name: "data-sharing"
            }), a.createElement("span", {
                className: "spacing-left-small"
            }, c("I agree to additional processing of my information, including first and third party cookies, for personalized content and advertising as outlined in our %(policy)s", {
                policy: a.createElement("a", {
                    href: "https://disqus.com/data-sharing-settings/"
                }, c("Data Sharing Policy"))
            }))))))
        },
        e = function(b) {
            var e = b.onAccept,
                f = b.isPrivate;
            return a.createElement("div", {
                id: "tos__message",
                className: "align align--column align--middle"
            }, a.createElement("h1", null, c("Important Update")), a.createElement("p", null, c("When you log in with Disqus, we process personal data to facilitate your authentication and posting of comments. We also store the comments you post and those comments are immediately viewable and searchable by anyone around the world.")), f ? a.createElement(d, null) : a.createElement("p", null, a.createElement("label", null, a.createElement("span", null, c("Please access our %(policy)s to learn what personal data Disqus collects and your choices about how it is used.  All users of our service are also subject to our %(terms)s.", {
                policy: a.createElement("a", {
                    href: "https://help.disqus.com/customer/portal/articles/466259-privacy-policy",
                    target: "_blank",
                    rel: "noopener noreferrer"
                }, c("Privacy Policy")),
                terms: a.createElement("a", {
                    href: "https://help.disqus.com/customer/portal/articles/466260-terms-of-service",
                    target: "_blank",
                    rel: "noopener noreferrer"
                }, c("Terms of Service"))
            })))), a.createElement("p", {
                className: "align"
            }, a.createElement("button", {
                className: "button button-large",
                onClick: e,
                id: "accept_tos"
            }, c("Proceed"))))
        };
    return e
}), define("common/collections/profile", ["core/api", "common/models", "common/collections"], function(a, b, c) {
    "use strict";
    var d = c.PaginatedCollection.extend({
            initialize: function(a, b) {
                this.user = b.user, c.PaginatedCollection.prototype.initialize.apply(this, arguments)
            },
            fetch: function(a) {
                return a = a || {}, a.data = a.data || {}, a.data.user = this.user.id, c.PaginatedCollection.prototype.fetch.call(this, a)
            }
        }),
        e = d.extend({
            model: b.SyncedUser,
            url: a.getURL("users/listFollowing"),
            PER_PAGE: 20
        });
    return {
        SessionPaginatedCollection: d,
        FollowingCollection: e
    }
});
var _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(a) {
    return typeof a
} : function(a) {
    return a && "function" == typeof Symbol && a.constructor === Symbol && a !== Symbol.prototype ? "symbol" : typeof a
};
define("lounge/views", ["jquery", "underscore", "backbone", "loglevel", "raven", "stance", "moment", "react", "react-dom", "core/ads/ads", "core/analytics/identity", "core/api", "core/mediaConfig", "core/UniqueModel", "core/mixins/appliesPublisherClasses", "core/mixins/withAlert", "core/models/ThreadVote", "core/models/Vote", "core/constants/voteConstants", "remote/config", "common/models", "common/collections", "common/utils", "core/bus", "core/strings", "common/urls", "core/analytics/jester", "common/views/mixins", "common/Session", "common/keys", "core/utils", "core/utils/isIframed", "core/utils/html/toRGBColorString", "core/utils/threadRatingsHelpers", "core/utils/url/serialize", "core/switches", "core/viglink", "core/WindowBus", "common/outboundlinkhandler", "core/mixins/withEmailVerifyLink", "core/templates/react/BehindClickTemplate", "core/templates/react/ThreadTemplate", "core/shared/urls", "lounge/common", "lounge/menu-handler", "lounge/mixins", "lounge/realtime", "lounge/views/badges-message", "lounge/views/email-signup", "lounge/views/posts/PostReplyView", "lounge/views/posts/collection", "lounge/views/media", "lounge/views/onboard-alert", "lounge/views/notification-menu", "lounge/views/highlighted-post", "lounge/views/realtime", "lounge/views/posts/UserSuggestionsManager", "lounge/views/sidebar", "lounge/views/ratings", "lounge/views/reactions", "lounge/views/reactions-promotion", "lounge/views/favorite-button", "lounge/tracking", "templates/lounge/userMenu", "templates/lounge/threadShareBar", "templates/lounge/layout", "templates/lounge/inthreadAd", "templates/lounge/termsOfService", "templates/lounge/partials/postCount", "templates/lounge/partials/postSort", "common/main", "common/collections/profile"], function(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, w, x, y, z, A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z, $, _, aa, ba, ca, da, ea, fa, ga, ha, ia, ja, ka, la, ma, na, oa, pa, qa) {
    "use strict";
    var ra = window.document,
        sa = y.get,
        ta = E.preventDefaultHandler,
        ua = new L,
        va = c.View.extend({
            events: {
                "click [data-action=subscribe]": "subscribe"
            },
            initialize: function(a) {
                this.thread = a.thread, this.session = a.session, this.listenTo(this.thread, "change:userSubscription", this.updateStatus), this.updateStatus()
            },
            updateStatus: function() {
                this.thread.get("userSubscription") ? this.$el.addClass("subscribed") : this.$el.removeClass("subscribed")
            },
            subscribe: ta(function() {
                var a = this.thread.get("userSubscription");
                this.session.isLoggedOut() ? this.subscribeAfterAuthentication() : this.thread.subscribe(!a)
            }),
            subscribeAfterAuthentication: function() {
                this.listenToOnce(this.session, "fetchThreadDetails:success", function() {
                    this.session.isLoggedIn() && this.thread.subscribe()
                }), this.session.get("sso") && this.session.get("sso").url ? this.session.authenticate("sso") : this.session.authenticate("disqusDotcom")
            }
        }),
        wa = c.View.extend({
            topEdgeOffset: function() {
                return -R.getLounge().getPosition().height
            },
            initialize: function(a) {
                this.options = a, this.hasLoaded = null, this.listenToOnce(f(this), "enter", this.loadImage)
            },
            loadImage: function() {
                var a = this;
                if (!a.hasLoaded) {
                    var b = function(b) {
                        return function() {
                            a.trigger(b), a.$el.off(".deferredMediaView"), a.relatedPost && R.getLounge().postsView.onDeferredViewReady(a.relatedPost)
                        }
                    };
                    a.$el.on("load.deferredMediaView", b("load")), a.$el.on("error.deferredMediaView", b("error")), a.$el.attr("src", a.options.url), a.hasLoaded = !0
                }
            }
        }),
        xa = c.View.extend({
            tagName: "ul",
            className: "debug",
            initialize: function(a) {
                this.values = a
            },
            render: function() {
                return this.$el.html(b.reduce(this.values, function(a, b, c) {
                    return a + "<li><strong>" + c + "</strong>: " + b + "</li>"
                }, "")), this
            }
        }),
        ya = c.View.extend({
            initialize: function(a) {
                this.forum = a.forum, this.session = a.session, this.thread = a.thread, this.listenTo(this.session, "change:id", this.render), this.listenTo(this.thread, "change", this.render), this.listenTo(Z.settings, "change:collapsed", this.onMediaCollapseChange), this.listenToReactions()
            },
            listenToReactions: function() {
                this.thread.get("reactions") ? this.listenTo(this.thread.get("reactions"), "sync change:enabled", this.render) : this.listenToOnce(this.thread, "change:reactions", this.listenToReactions)
            },
            render: function() {
                return i.render(h.createElement(ja, {
                    user: this.session.toJSON(),
                    forum: this.forum.toJSON(),
                    thread: this.thread.toJSON(),
                    sso: this.session.get("sso")
                }), this.el), this.onMediaCollapseChange(), this
            },
            onMediaCollapseChange: function() {
                Z.settings.get("collapsed") ? this.$el.addClass("media-collapsed") : this.$el.removeClass("media-collapsed")
            }
        }),
        za = c.View.extend({
            events: {
                "click [data-action=share\\:twitter]": "_onShare",
                "keyup [data-action=share\\:twitter]": "_onShare",
                "click [data-action=share\\:facebook]": "_onShare",
                "keyup [data-action=share\\:facebook]": "_onShare"
            },
            _onShare: ta(function(a) {
                var b = 13;
                if (!a.keyCode || a.keyCode === b) {
                    var c = w.extractService(a.target, "share");
                    c && this.sharers[c] && (R.getLounge().trigger("uiAction:threadShare", c), this.share(c))
                }
            }),
            render: function() {
                return i.render(h.createElement(ka, null), this.el), this
            }
        });
    b.extend(za.prototype, T.ShareMixin);
    var Aa = c.View.extend({
            events: {
                "change input[name=tos], input[name=privacy-policy]": "updateEnabled"
            },
            initialize: function(a) {
                this.isPrivate = a.isPrivate, this.session = a.session
            },
            updateEnabled: function() {
                this.$("#accept_tos").prop("disabled", !!this.isPrivate && !this.areTosAccepted())
            },
            areTosAccepted: function() {
                return this.$("input[name=tos]").prop("checked") && this.$("input[name=privacy-policy]").prop("checked")
            },
            onAccept: function() {
                if (!this.isPrivate || this.areTosAccepted()) {
                    var a = this.$("input[name=data-sharing]");
                    a.length && l.call("internal/users/setDNT", {
                        method: "POST",
                        data: {
                            value: a.prop("checked") ? 0 : 1
                        }
                    }), l.call("users/acceptTerms", {
                        method: "POST"
                    }), this.close()
                }
            },
            close: function() {
                this.remove()
            },
            render: function() {
                return i.render(h.createElement(na, {
                    onAccept: this.onAccept.bind(this),
                    isPrivate: this.isPrivate
                }), this.el), this.updateEnabled(), this
            }
        }),
        Ba = c.View.extend({
            initialize: function(a) {
                this.thread = a.thread, this.postCount = a.thread.get("posts") || 0, this.settings = a.settings
            },
            render: function() {
                return i.render(h.createElement(O, {
                    postCount: this.postCount,
                    titleEnabled: this.settings.title_enabled,
                    titleText: this.settings.title_text,
                    titleCSS: this.settings.title_css,
                    buttonText: this.settings.button_text,
                    buttonCSS: this.settings.button_css
                }), this.el), this
            }
        }),
        Ca = c.View.extend({
            initialize: function(a) {
                this.thread = a.thread, this.forum = a.forum, this.order = a.order, this.inHome = a.inHome, this.hideFooter = a.hideFooter
            },
            render: function() {
                return i.render(h.createElement(P, {
                    thread: this.thread.toJSON(),
                    forum: this.forum.toJSON(),
                    order: this.order,
                    inHome: this.inHome,
                    hideFooter: this.hideFooter
                }), this.el), this
            }
        }),
        Da = c.View.extend({
            events: {
                "click [data-action^=auth\\:]": "handleAuth",
                "click [data-action=logout]": "handleLogout",
                "click [data-action=audiencesync]": "audienceSync",
                "click [data-action=profile]": "handleShowProfile",
                "click [data-action=community-sidebar]": "handleShowCommunitySidebar",
                "click [data-action=sort]": "handleSort",
                "click [data-action=toggle-thread-premoderate]": "toggleThreadPremoderate",
                "click [data-action=toggle-thread]": "toggleThread",
                "click [data-action=toggle-thread-ratings]": "toggleThreadRatingsEnabled",
                "click [data-action=toggle-thread-visibility]": "toggleBehindClick",
                "click [data-action=debug]": "renderDebugInfo",
                "click [data-action=repair]": "repairThread",
                "click [data-action=toggle-media]": "toggleMedia",
                "click [data-action=toggle-reactions]": "toggleReactions",
                "click a": "handleLinkClick"
            },
            initialize: function(c) {
                R.setLounge(this), c = c || {};
                var d = c.jsonData || {};
                this.language = ra.documentElement.lang, this.initialData = d.response || {}, this.cleanInitialData(this.initialData), this.onboardWindowName = w.globalUniqueId("disqus_"), this.initialData.forum && this.initialData.forum.id && (z.moderate = w.updateURL(z.moderate, {
                    hostname: this.initialData.forum.id + "."
                })), this.deferredViews = [], this.unsortedDeferredViews = [], this.inthreadAdApps = [], this.adPromise = a.Deferred().resolve(), C.setDefaults(this.initialData.session), this.session = C.get(), this.forum = new u.Forum, this.forum.set(this.initialData.forum), this.thread = new u.Thread(this.initialData.thread, {
                    forum: this.forum,
                    postCursor: d.cursor,
                    moderators: (this.initialData.thread || {}).moderators,
                    order: d.order
                }), this.initUserSuggestionsManager(), this.postsView = new Y.PostCollectionView({
                    posts: this.thread.posts,
                    thread: this.thread,
                    lounge: this,
                    session: this.session,
                    el: this.el,
                    userSuggestions: this.userSuggestions
                }), this.states = {
                    fullyVisible: !1,
                    realtimeIndicatorsCreated: !1,
                    streamingPaused: !1,
                    inViewport: !1,
                    behindClick: !1
                }, qa.timings.loungeStart = Number(new Date);
                var e = b.bind(this.bootstrap, this);
                F(window) ? (this.listenTo(x.frame, "init", e), this.initThreadView()) : b.defer(e), this.setAlertSelector("#layout"), this.initResizeHandler(), this.initAlertListeners()
            },
            cleanInitialData: function(a) {
                var c = a.thread && a.thread.highlightedPost;
                c && (c.isHighlighted = !0), b.each(a.posts, function(a) {
                    c ? a.isHighlighted = a.id === c.id : a.isHighlighted = !1
                })
            },
            initAlertListeners: function() {
                this.listenTo(this.session, "alert", this.alert)
            },
            initOnboardAlert: function() {
                var a = this.onboardAlert = new $.OnboardAlert({
                    session: this.session,
                    forum: this.forum
                });
                this.proxyViewEvents(this.onboardAlert), this.listenTo(this.session, "change:id", function() {
                    a.setInitialCookie(), a.render().$el.appendTo("#onboard")
                })
            },
            bootstrap: function(a) {
                var c, d = this,
                    e = {};
                d.config = a = a || w.getConfigFromHash(window), a.forceSwitch && J.forceFeature(a.forceSwitch), a.loaderVersion = qa.version, d.states.fullyVisible = a.startedFullyVisible, k.init({
                    isPrivate: a.isPrivate
                });
                var f = a.experiment;
                if (f) {
                    if (f.experiment && f.variant) {
                        var g = f,
                            h = g.experiment,
                            i = g.variant;
                        h = h.replace(/_hidden$/, ""), J.forceFeature(["experiment", h, i].join(":"))
                    }
                } else a.experiment = f = {};
                a.apiKey && (e["X-Disqus-Publisher-API-Key"] = a.apiKey), b.isObject(a.remoteAuthS3) && b.isEmpty(a.remoteAuthS3) ? a.remoteAuthS3 = null : e["X-Disqus-Remote-Auth"] = a.remoteAuthS3, b.isEmpty(e) || l.headers(e), a.anchorColor && (c = G(a.anchorColor), w.setPublisherColor(c), w.addStylesheetRules([
                    [".publisher-anchor-color a", ["color", c, !0]],
                    ["a.publisher-anchor-color", ["color", c, !0]],
                    [".publisher-anchor-hover a:hover", ["color", c, !0]],
                    ["a.publisher-anchor-hover:hover", ["color", c, !0]],
                    [".active .publisher-nav-color:after", ["background", c, !0]],
                    [".media-preview .active.publisher-border-color", ["border-color", c, !0]],
                    [".publisher-color", ["color", c, !1]],
                    [".publisher-color:hover", ["color", c, !1]],
                    [".publisher-background-color", ["background-color", c, !1]],
                    [".publisher-border-color", ["border-color", c, !1]]
                ])), a.impressionId && k.impression.setImpressionId(a.impressionId), w.injectBaseElement(), a.referrer && (d.thread.currentUrl = a.referrer), this.config.inthreadLeadingCommentCount && (this.config.inthreadLeadingCommentCount = Number(this.config.inthreadLeadingCommentCount), this.config.inthreadRepeatCommentCount = Number(this.config.inthreadRepeatCommentCount), this.config.inthreadTrailingCommentCount = Number(this.config.inthreadTrailingCommentCount));
                var j = this.getPermalinkOptions(a.parentWindowHash);
                j && x.frame.once("embed.rendered", b.bind(d.scrollToPost, d, j.postId, j.options)), a.sso && d.session.set("sso", a.sso), a.initialPosition ? d.position = a.initialPosition : d.position = w.calculatePositionFullscreen(), d.initPrivacySettings(), d.initLinkAffiliation(), d.updateModeratorBadgeText(), d.bindBusListeners();
                var m = qa.timings;
                m.hostStart = a.timestamp || m.initStart, m.embedLoadTime = a.loadTime, this.once("threadView:prep", function() {
                    d.listenToOnce(d.postsView, "render:start", function() {
                        m.renderStart = Number(new Date)
                    }), d.listenToOnce(d.postsView, "render:end", d.sendTelemetry), m.bootstrapStart = Number(new Date), d.postsView.bootstrap(d.initialData, j), d.initAfterPostCreateHandler(), d.initSession()
                }), d.initUI(), d.initLinkHandler(), d.initialized = !0, d.trigger("bootstrap:complete", d)
            },
            _isInHome: function(a, b) {
                var c = /^(?:https?:)?\/\/(?:www.)?/;
                return a = a.replace(c, ""), b = b.replace(c, ""), 0 === a.indexOf(b)
            },
            isInHome: function() {
                return !(!this.config || !this.config.referrer) && this._isInHome(this.config.referrer, Q.apps.home + "home/")
            },
            initSession: function() {
                var a = this.config,
                    b = this.session,
                    c = this.thread;
                b.start({
                    remoteAuthS3: a.remoteAuthS3,
                    sso: a.sso,
                    apiKey: a.apiKey,
                    thread: c
                })
            },
            initPrivacySettings: function() {
                this.listenToOnce(this.session, "change:id", function(a) {
                    ia.isPrivate(a) && m.set({
                        collapsed: {
                            value: !0,
                            persist: !1
                        }
                    })
                })
            },
            initLinkAffiliation: function() {
                var a = K.getVersion();
                if (J.isFeatureActive("viglink_experiment", {
                        forum: this.forum.id,
                        forumPercent: this.forum.id
                    }) && (a = K.getExperimentVersion()), this.isLinkAffiliatorEnabled() && !this.initLinkAffiliatorCalled && "none" !== a) {
                    this.initLinkAffiliatorCalled = !0;
                    var b = z.linkAffiliatorClientV4;
                    ia.shouldTrack(this.forum, this.session.user) && "v5" === a && (b = z.linkAffiliatorClientV5), x.frame.sendHostMessage("viglink:init", {
                        clientUrl: b,
                        apiUrl: z.linkAffiliatorAPI,
                        key: D.viglinkAPI,
                        id: this.forum.get("pk")
                    })
                }
            },
            initAfterPostCreateHandler: function() {
                this.listenTo(this.thread, "create", function(a) {
                    var c = a.toJSON();
                    x.frame.sendHostMessage("posts.create", c), ua.broadcast("posts.create", b.pick(c, "forum", "parent", "id"))
                })
            },
            sendTelemetry: function() {
                if (w.shouldSample(t.lounge.telemetry_sample_percent)) {
                    var c = a.now(),
                        d = qa.timings,
                        e = {
                            embed: d.embedLoadTime,
                            frame: d.initStart - d.hostStart,
                            asset: d.downloadEnd - d.initStart,
                            render: c - d.renderStart,
                            total: c - d.hostStart - (d.renderStart - d.bootstrapStart)
                        },
                        f = window.performance;
                    if (f) {
                        var g = f.timing;
                        g.responseStart && (e.frame_rtt = g.responseStart - g.navigationStart);
                        var h = b.find(f.getEntries && f.getEntries() || [], function(a) {
                            return a.name.indexOf("/next/config.js") > -1
                        });
                        h && h.responseStart && (e.config_rtt = h.responseStart - h.startTime)
                    }
                    var i = "lounge_" + ("static" === this.config.experiment.service ? "static" : "dynamic");
                    return A.telemetry(i, e)
                }
            },
            initUI: function() {
                this.applyPublisherClasses(), this.renderLayout(), this.setAlertSelector("#global-alert"), this.bindUIUpdateHandlers(), this.initDeferredViews(), this.postsView.once("render:end", function() {
                    var a = w.getPageHeight();
                    x.frame.sendHostMessage("rendered", {
                        height: a
                    }), this._lastHeight = a, this.initRealtime()
                }, this), this.once("threadView:prep", this.initUIComponents), this.initThreadView()
            },
            initUIComponents: function() {
                this.initMainPostBox(), this.initTermsOfService(), this.initReactions(), this.initStarRatings(), this.isInHome() || (this.initUserMenu(), this.initOnboardAlert(), this.initNotificationMenu(), this.initFavoriteButton(), this.initThreadShareBar()), this.initHighlightedPost(), this.initBadgesMessage(), this.initEmailSignup(), this.initThreadSubscribe(), this.bindProfileUIListeners(this.session), this.updatePostCount(), this.trigger("threadView:render")
            },
            initHighlightedPost: function() {
                var a = this.thread.get("highlightedPost");
                a && this.thread.posts.add(a), this.highlightedPostView = new aa.HighlightedPostView({
                    el: this.threadView.$el.find("#highlighted-post"),
                    thread: this.thread,
                    session: this.session,
                    userSuggestions: this.userSuggestions
                }), this.highlightedPostView.reset()
            },
            initReactions: function() {
                if (this.forum.get("settings")) {
                    if (!this.forum.get("settings").threadReactionsEnabled && !this.forum.channel) return void this.initReactionsPromotion();
                    var a = new v.ReactionsCollection([], {
                        thread: this.thread,
                        userIsAnonymous: this.session.user.isAnonymous()
                    });
                    this.listenTo(a, "sync", function() {
                        a.length ? this.showReactions(a) : this.removeReactions()
                    }), this.listenTo(a, "change:enabled", function() {
                        a.enabled ? this.showReactions(a) : this.removeReactions()
                    }), this.thread.set("reactions", a), a.fetch()
                }
            },
            showReactions: function(a) {
                if (!this.reactionsView) {
                    var b = this.reactionsView = new fa({
                        reactions: a,
                        readonly: this.thread.get("isClosed"),
                        session: this.session
                    });
                    b.render(), this.threadView.$el.find("#reactions__container").prepend(b.$el)
                }
            },
            removeReactions: function() {
                this.reactionsView && (this.reactionsView.remove(), this.reactionsView = null)
            },
            initReactionsPromotion: function() {
                if (!this.thread.isModerator(this.session.user)) return void this.listenToOnce(this.session, "change:id", this.initReactionsPromotion);
                var b = "reactionsEmbedPromotion",
                    c = this;
                l.call("announcements/messages/checkViewed", {
                    data: {
                        message: b
                    }
                }).success(function(d) {
                    var e = d.response;
                    if (!e[b]) {
                        var f = c.reactionsPromotionView = new ga({
                            forum: c.forum
                        });
                        f.render(), a("#reactions__container").prepend(f.$el)
                    }
                })
            },
            initStarRatings: function() {
                this.forum.get("features") ? H.isForumModelRatingsEnabled(this.forum) && (this.thread.get("ratingsEnabled") && this.thread.fetchRatings(), this.listenTo(this.thread, "change", this.showRatings), this.showRatings()) : this.listenToOnce(this.thread.forum, "change:features", this.initStarRatings)
            },
            showRatings: function() {
                var a = J.isFeatureActive("star_ratings_total_hidden", {
                    forum: this.forum.id
                });
                if (!this.ratingsView && this.thread && this.session && !a) {
                    var b = this.ratingsView = new ea({
                        thread: this.thread,
                        session: this.session
                    });
                    b.render(), this.threadView.$el.find("#ratings__container").html(b.$el)
                }
            },
            bindUIUpdateHandlers: function() {
                var a = this,
                    b = a.thread,
                    c = a.session;
                a.listenTo(b, {
                    "change:posts": a.updatePostCount
                }), a.listenTo(b.queue, "add reset", a.toggleRealtimeNotifications), a.postsView.bindUIUpdateHandlers(), a.listenTo(c, "change:id", a.updateThreadSessionData), a.listenTo(a, "scrollOffViewport", function() {
                    this.states.realtimeIndicatorsCreated && x.frame.sendHostMessage("indicator:hide")
                }), a.listenTo(a, "scroll", function(a) {
                    this.position = a
                }), a.listenTo(a, "scroll", a.handleRealtimeScroll), a.listenTo(a.postsView, "render:end", function() {
                    a.toggleRealtimeNotifications(), a.config.inthreadPlacementUrl && a.loadInthreadAd()
                })
            },
            whenFullyVisible: function() {
                var b = a.Deferred();
                return this.states.fullyVisible ? b.resolve() : this.listenTo(this, "frame.visible", function() {
                    b.resolve()
                }), b.promise()
            },
            canShowInthreadAd: function(a, b) {
                if (!this.config.inthreadMultipleAds && a > 0) return !1;
                var c = this.config.inthreadLeadingCommentCount + this.config.inthreadRepeatCommentCount * a,
                    d = c + this.config.inthreadTrailingCommentCount;
                return b >= d
            },
            inthreadAdInit: function(b, c) {
                var d = a.Deferred();
                return this.inthreadAdApps[b].init(), this.listenToOnce(this.inthreadAdApps[b], "frame:ready", function() {
                    c.css({
                        height: "auto",
                        "margin-bottom": "24px"
                    }), d.resolve()
                }), this.listenToOnce(this.inthreadAdApps[b], "ad-placement-empty", function() {
                    c.css({
                        height: "",
                        "margin-bottom": ""
                    })
                }), d.promise()
            },
            loadInthreadAd: function() {
                var c = this.postsView.$el.find("#post-list");
                if (!(this.config.adBlockEnabled && !this.config.defaultPlacementUrl || c.hasClass("loading"))) {
                    var d = this.config.inthreadCountChildren ? c.find(".post:not(.advertisement)") : c.children(":not(.advertisement)"),
                        e = {};
                    0 === this.config.experiment.experiment.indexOf("googlewidemargins") && "fallthrough" !== this.config.experiment.variant && (e.margin = "0 " + this.config.experiment.variant, e["min-width"] = "calc(100% - " + 2 * parseInt(this.config.experiment.variant, 10) + "px)");
                    var f;
                    f = this.config.adBlockEnabled && this.config.defaultPlacementUrl ? I(this.config.defaultPlacementUrl, {
                        position: "inthread"
                    }) : this.config.inthreadPlacementUrl;
                    for (var g = this.inthreadAdApps.length; this.canShowInthreadAd(g, d.length); g++) {
                        var h = this.config.inthreadLeadingCommentCount + this.config.inthreadRepeatCommentCount * g,
                            i = a(ma());
                        d && d.length && d[h] ? i.insertBefore(d[h]) : i.appendTo(a("#post-list")), this.inthreadAdApps[g] = j.Ads(b.extend({
                            adUrl: f,
                            placement: "inthread",
                            container: i.find("[data-role=post-content]")[0],
                            isInHome: this.isInHome(),
                            isOnHostPage: !1,
                            forumId: this.forum.get("pk"),
                            version: this.config.version,
                            styles: e
                        }, this.config));
                        var k = this.inthreadAdInit.bind(this, g, i);
                        0 === g ? this.adPromise = this.whenFullyVisible().then(k) : this.adPromise = this.adPromise.then(k)
                    }
                }
            },
            relayScrollToStance: function(a) {
                f.scroll({
                    top: a.pageOffset - a.frameOffset.top,
                    height: a.height
                })
            },
            initDeferredViews: function() {
                this.listenTo(this, "scroll", this.createDeferredViewsForImages), this.listenTo(this, "domReflow", function() {
                    f.invalidate(), this.position && (this.createDeferredViewsForImages(), this.relayScrollToStance(this.position))
                })
            },
            bindBusListeners: function() {
                this.listenTo(x.frame, {
                    "window.hashchange": function(a) {
                        var b = this.getPermalinkOptions(a);
                        b && this.scrollToPost(b.postId, b.options)
                    },
                    "window.scroll": function(a) {
                        this.trigger("scroll", a), this.relayScrollToStance(a)
                    },
                    "window.inViewport": function() {
                        this.states.behindClick || (this.states.inViewport = !0, this.trigger("inViewport"))
                    },
                    "window.scrollOffViewport": function() {
                        this.states.inViewport = !1, this.trigger("scrollOffViewport")
                    },
                    "frame.visible": function() {
                        this.states.fullyVisible = !0, this.trigger("frame.visible")
                    },
                    error: function(a) {
                        a = JSON.parse(a), e.captureException(a.error, {
                            extra: {
                                details: a.details
                            },
                            culprit: a.culprit
                        })
                    },
                    "window.resize": this.resize,
                    "indicator:click": this.handleRealtimeClick
                }), this.listenToOnce(this.session, "change:id", this.initSidebar)
            },
            isLinkAffiliatorEnabled: function() {
                return this.forum.get("settings").linkAffiliationEnabled && !this.isInHome()
            },
            initLinkHandler: function() {
                this.outboundLinkHandler = new M, this.outboundLinkHandler.registerBeforeNavigationHandler(this.logLinkClick, this)
            },
            handleLinkClick: function(a) {
                this.outboundLinkHandler.handleClick(a)
            },
            initRealtimeIndicators: function() {
                var a = this;
                if (!a.states.realtimeIndicatorsCreated) {
                    var c = ["north", "south"].reduce(function(c, d) {
                        return c[d] = {
                            contents: '\n<!DOCTYPE html>\n<html lang="' + b.escape(a.language) + '">\n    <head>\n        <meta charset="utf-8">\n        <title>Disqus Realtime Notification</title>\n    </head>\n    <body>\n        <link rel="stylesheet" href="' + b.escape("https://c.disquscdn.com/next/embed/styles/realtime.b23ff3c36dd0169627f8e54ca1621eca.css") + '">\n        <div class="' + b.escape(d) + '" id="message">-</div>\n    </body>\n</html>\n'
                        }, c
                    }, {});
                    x.frame.sendHostMessage("indicator:init", c), a.states.realtimeIndicatorsCreated = !0
                }
            },
            insertStreamingComments: b.throttle(function() {
                var a = this.thread.queue;
                a.drain(), b.each(a.counters.replies, function(b, c) {
                    a.drain(c)
                })
            }, 1e3),
            updateModeratorBadgeText: function() {
                var a = this.forum.get("moderatorBadgeText");
                a && (y.translations.Mod = a)
            },
            logLinkClick: function(b) {
                var c = a(b.currentTarget);
                if (E.clickShouldBeLogged(b, c)) return A.client.emit({
                    verb: "click",
                    object_type: "link",
                    object_id: c[0].href,
                    area: ia.getEventTrackingArea(b)
                })
            },
            handleRealtimeScroll: function(a) {
                if (this.states.inViewport && this.states.realtimeIndicatorsCreated) {
                    var c = b.union([this.queueView], b.values(this.postsView.subViews)),
                        d = 0,
                        e = 0;
                    b.each(c, function(b) {
                        if (b && !b.getDirection && (b = b.queueView), b && !(b.options.count <= 0)) {
                            var c = b.getDirection(a);
                            1 === c ? d += b.options.count : c === -1 && (e += b.options.count)
                        }
                    });
                    var f, g, h = function(a) {
                        var c = a.orientation,
                            d = a.num,
                            e = void 0;
                        return e = "north" === c ? 1 === d ? sa("One new comment above.") : y.interpolate(sa("%(num)s new comments above."), {
                            num: d
                        }) : 1 === d ? sa("One new comment below.") : y.interpolate(sa("%(num)s new comments below."), {
                            num: d
                        }), "<p>" + b.escape(e) + "</p>"
                    };
                    g = {
                        type: "north"
                    }, d > 0 ? (f = "indicator:show", g.content = h({
                        num: d,
                        orientation: "north"
                    })) : f = "indicator:hide", x.frame.sendHostMessage(f, g), g = {
                        type: "south"
                    }, e > 0 ? (g.content = h({
                        num: e,
                        orientation: "south"
                    }), f = "indicator:show") : f = "indicator:hide", x.frame.sendHostMessage(f, g)
                }
            },
            handleRealtimeClick: function(a) {
                var c = this;
                x.frame.sendHostMessage("indicator:hide", {
                    type: a
                });
                var d, e, f, g = b.union([c], b.toArray(c.postsView.subViews));
                g = b.filter(g, function(b) {
                    if (b = b.queueView, !b || b.options.count <= 0) return !1;
                    var d = "north" === a ? 1 : -1;
                    return b.getDirection(c.position) === d
                }), g = b.sortBy(g, function(a) {
                    return a === c ? 0 : a.offset.top
                }), d = "north" === a ? b.last(g) : b.first(g), e = d.queueView, d === c ? (f = 0, e.handleDrain()) : (f = d.offset.top - 100, e.handleDrain()), R.getLounge().once("domReflow", b.bind(x.frame.sendHostMessage, x.frame, "scrollTo", {
                    top: f
                }))
            },
            toggleRealtimeNotifications: function() {
                var a = this,
                    c = a.thread.queue;
                if (b.defer(function() {
                        x.frame.sendHostMessage("fakeScroll")
                    }), !c.length) return void a.$el.find("[data-role=realtime-notification]").hide();
                if (a.thread.get("hasStreaming")) return void a.insertStreamingComments();
                if (c.counters.comments) {
                    var d = a.queueView || new ba.QueuedPostView({
                        model: a.thread,
                        el: a.$el.find("button[data-role=realtime-notification]")
                    });
                    a.queueView = d, d.setCount(c.counters.comments), d.render()
                }
                b.each(c.counters.replies, function(b, c) {
                    var d = a.thread.posts.get(c);
                    if (d) {
                        var e = a.postsView.getPostView(d.cid);
                        if (e) {
                            var f = e.queueView;
                            f || (f = new ba.QueuedReplyView({
                                thread: a.thread,
                                postView: e,
                                model: d,
                                el: e.$el.find("[data-role=realtime-notification\\:" + c + "] a")
                            }), e.queueView = f), f.setCount(b), f.render()
                        }
                    }
                })
            },
            initBehindClick: function() {
                var c = this;
                if (!c.behindClickView && c.thread && a("#behindclick__container").length) {
                    var d = {
                        title_enabled: !1,
                        title_text: null,
                        title_css: null,
                        button_text: null,
                        button_css: null
                    };
                    l.call("forums/behindClick/details", {
                        data: {
                            forum: this.forum.id
                        }
                    }).success(function(a) {
                        var e = a.response;
                        c.showBehindClick(b.defaults({}, e, d))
                    })
                }
            },
            showBehindClick: function(b) {
                var c = a("#behindclick__container"),
                    d = new Ba({
                        thread: this.thread,
                        settings: b
                    });
                d.render(), c.html(d.$el), x.frame.sendHostMessage("rendered", {
                    height: w.getPageHeight()
                })
            },
            toggleBehindClick: function() {
                this.$("#behindclick__container").hide(), this.states.behindClick = !1, x.frame.trigger("window.inViewport"), x.trigger("uiAction:behindClickButton"), this.trigger("threadView:prep")
            },
            initThreadView: function() {
                this.createThreadView(), this.forum.get("settings").behindClickEnabled ? (this.initBehindClick(), this.states.behindClick = !0) : this.trigger("threadView:prep")
            },
            createThreadView: function() {
                if (!this.threadView && this.thread && this.session) {
                    var a, b = this.isInHome();
                    this.thread.posts.buffer && (a = this.thread.posts.getOrder());
                    var c = this.threadView = new Ca({
                        thread: this.thread,
                        forum: this.forum,
                        order: a,
                        inHome: b,
                        hideFooter: b
                    });
                    c.render(), this.trigger("threadView:init"), this.once("threadView:render", function() {
                        this.$("#thread__container").html(this.threadView.$el)
                    })
                }
            },
            renderDebugInfo: ta(function() {
                if (this.session.user.get("isGlobalAdmin")) {
                    var a = this.thread.forum.get("settings", {}),
                        b = new xa({
                            Shortname: this.thread.get("forum"),
                            "Thread ID": this.thread.get("id"),
                            "Org ID": this.forum.get("organizationId"),
                            "Thread slug": this.thread.get("slug"),
                            "Anchor color": G(this.config.anchorColor),
                            Language: this.thread.forum.get("language"),
                            Recommendations: a.organicDiscoveryEnabled,
                            "Ads enabled": a.adsEnabled,
                            "Ads top enabled": a.adsPositionTopEnabled,
                            "Ads bottom enabled": a.adsPositionBottomEnabled,
                            "Ads in-thread enabled": a.adsPositionInthreadEnabled,
                            "Ads recommendations enabled": a.adsPositionRecommendationsEnabled,
                            "Ads Product Display enabled": a.adsProductDisplayEnabled,
                            "Ads Product Links enabled": a.adsProductLinksEnabled,
                            "Ads Product Video enabled": a.adsProductVideoEnabled,
                            "In iframe": this.config.isHostIframed,
                            "Behind click": this.config.isBehindClick,
                            "Height restricted": this.config.isHeightRestricted
                        });
                    b.render();
                    var c = ra.body;
                    c.insertBefore(b.el, c.firstChild)
                }
            }),
            repairThread: ta(function() {
                this.session.user.get("isGlobalAdmin") && l.call("internal/threads/repair.json", {
                    method: "GET",
                    data: {
                        thread: this.thread.get("id")
                    },
                    success: b.bind(this.alert, this, "Thread repair has been queued. Refresh in a few seconds."),
                    error: b.bind(this.alert, this, "An error occurred while repairing thread. Please try again.", {
                        type: "error"
                    })
                })
            }),
            getPermalinkOptions: function(a) {
                var b = a && a.match(/(comment|reply|edit)-([0-9]+)/);
                if (b) return {
                    postId: b[2],
                    options: {
                        highlight: !0,
                        openReply: "reply" === b[1],
                        openEdit: "edit" === b[1]
                    }
                }
            },
            scrollToPost: function(a, c) {
                c = c || {}, c.padding = c.padding || 90;
                var d = this,
                    e = d.$el.find("#post-" + a);
                return e.length ? (c.highlight && (d.$el.find(".post-content.target").removeClass("target"), e.find(".post-content").first().addClass("target")), c.openReply && d.postsView.openReply(a), c.openEdit && d.postsView.openEdit(a), void x.frame.sendHostMessage("scrollTo", {
                    top: e.offset().top - c.padding,
                    force: c.force || null
                })) : void u.Post.fetchContext(a, d.thread, {
                    requestedByPermalink: !0
                }).done(function() {
                    d.postsView.once("render:end", b.bind(d.scrollToPost, d, a, c)), x.frame.once("embed.resized", b.bind(d.scrollToPost, d, a, c))
                })
            },
            updateThreadSessionData: function(a) {
                if (a) {
                    a.get("thread") && this.thread.set(a.get("thread"));
                    var c = a.get("votes");
                    c && "object" === ("undefined" == typeof c ? "undefined" : _typeof(c)) && b.each(c, function(a, b) {
                        var c = this.postsView.posts.get(b);
                        c && c.set("userScore", a)
                    }, this)
                }
            },
            initSidebar: function() {
                this.sidebar = new da({
                    session: this.session,
                    forum: this.forum,
                    config: this.config
                })
            },
            initNotificationMenu: function() {
                var a = this.notificationMenu = new _.NotificationMenuView({
                    el: this.threadView.$el.find("[data-role=notification-menu]")[0],
                    session: this.session,
                    forum: this.forum
                });
                a.render()
            },
            initUserMenu: function() {
                var a = this.userMenu = new ya({
                    el: this.threadView.$el.find("[data-role=logout]")[0],
                    forum: this.forum,
                    session: this.session,
                    thread: this.thread
                });
                a.render()
            },
            initThreadShareBar: function() {
                if (!this.thread.forum.get("settings").disableSocialShare) {
                    var a = this.threadShareBar = new za({
                        el: this.threadView.$el.find("#thread-share-bar")[0],
                        model: this.thread
                    });
                    a.render()
                }
            },
            isRealtimeEnabled: function() {
                var a = t.lounge.REALTIME || {},
                    b = a.THREAD_STALE_DAYS || 7,
                    c = g.unix(this.initialData.lastModified);
                return !this.thread.get("isClosed") && g().diff(c, "days") <= b
            },
            realtimeHandlers: {
                Post: function(a) {
                    var b = a.data,
                        c = this.thread;
                    if (!this.thread.get("hasStreaming") || !this.states.streamingPaused) {
                        if (!b.id) return void d.warn("RT: no post ID");
                        if (!b.author || !b.author.id) return void d.warn("RT: no author or author ID");
                        if (!b.author.name) return void d.warn("RT: no author name or email hash");
                        if (!b.author.username) return void d.warn("RT: no author username");
                        if (!b.post || !b.post.message) return void d.warn("RT: no post message");
                        if (c.posts.get(b.id) || c.queue.get(b.id)) return void d.info("RT: duplicate: ", b.id);
                        if ("approved" !== b.type) return void d.info("RT: unapproved: ", b.id);
                        if (b.sb) return void d.info("RT: shadowbanned: ", b.id);
                        if (b.type === b.type_prev) return void d.info("RT: Post change message, ignoring for now ", b.id);
                        this.thread.incrementPostCount(1);
                        var e = b.post.parent_post.id;
                        if ("0" === e && (e = null), e && !c.posts.get(e) && !c.queue.get(e)) return void d.info("RT: parent is not on this page: ", b.id);
                        var f = b.author.name,
                            g = b.author.username,
                            h = b.author.avatar,
                            i = b.author.id;
                        "0" === i && (i = void 0);
                        var j = new n(u.User, {
                            id: i,
                            name: f,
                            username: g,
                            profileUrl: z.root + "/by/" + g + "/",
                            isAnonymous: !i,
                            avatar: {
                                cache: h,
                                permalink: h
                            }
                        });
                        if (j.get("isBlocked")) return void d.info("RT: blocked: ", b.id);
                        c.users.add(j, {
                            merge: !0
                        }), c.queue.add({
                            id: b.id,
                            user: j,
                            parentId: e,
                            message: b.post.message,
                            createdAt: b.date,
                            media: b.post.media
                        })
                    }
                },
                Vote: function(a) {
                    var b = a.data;
                    if (b.id && b.vote) {
                        var c = this.thread,
                            e = c.posts.get(b.vote.recipient_post_id);
                        if (e) {
                            d.debug("RT: Vote for post ", e.id);
                            var f = e.votes.get(b.id);
                            f || (d.debug("RT: Creating new vote with id ", b.id), f = new r({
                                id: b.id
                            }), e.votes.add(f));
                            var g = e._vote(b.vote.vote, f.get("score"), b.voter);
                            0 !== g && f.set("score", g)
                        }
                    }
                },
                ThreadVote: function(a) {
                    var b = a.data,
                        c = this.thread;
                    if (b.id && b.vote && (!this.session.user.id || b.vote.voter_id !== this.session.user.id)) {
                        var d = c.votes.get(b.id);
                        if (d || (d = new q({
                                id: b.id
                            }), c.votes.add(d)), !d.get("currentUser")) {
                            var e = c._vote(b.vote.vote, d.get("score"));
                            0 !== e && d.set("score", e)
                        }
                    }
                },
                typing: function(a) {
                    var c = a.data,
                        d = this.thread,
                        e = c.typing,
                        f = c.post;
                    if (c.thread === d.id && f) {
                        var g = d.posts.get(f);
                        g && (g.usersTyping.count() <= 0 && !e || g.usersTyping.add(u.TypingUser.make(b.extend({
                            client_context: a.lastEventId
                        }, c))))
                    }
                }
            },
            initRealtime: function() {
                var a = U.Manager;
                if (!a.pipe && this.isRealtimeEnabled()) {
                    this.initRealtimeIndicators(), a.initialize("thread/" + this.thread.id, this.realtimeHandlers, this);
                    var b = function(a) {
                            return "POST" === a.method
                        },
                        c = 0;
                    this.listenTo(l, "call", function(d) {
                        b(d) && (c += 1, a.pause())
                    }), this.listenTo(l, "complete", function(d) {
                        !b(d) || c <= 0 || (c -= 1, c || a.resume())
                    })
                }
            },
            initFavoriteButton: function() {
                if (this.favoriteButton && this.favoriteButton.remove(), !J.isFeatureActive("sso_less_branding", {
                        forum: this.forum.id
                    })) {
                    var a = this.favoriteButton = new ha({
                        thread: this.thread,
                        session: this.session
                    });
                    this.listenTo(a, {
                        "vote:like": b.bind(this.trigger, this, "uiAction:threadLike"),
                        "vote:unlike": b.bind(this.trigger, this, "uiAction:threadUnlike")
                    }), a.render(), this.threadView.$el.find("#favorite-button").append(a.el)
                }
            },
            initThreadSubscribe: function() {
                this.threadSubscribeButton = new va({
                    session: this.session,
                    thread: this.thread,
                    el: this.threadView.$el.find("#thread-subscribe-button")[0]
                })
            },
            initBadgesMessage: function() {
                this.badgesMessageView = new V({
                    forum: this.forum,
                    session: this.session,
                    el: this.threadView.$el.find("#badges-message__container")[0]
                }).render()
            },
            initEmailSignup: function() {
                this.emailSignupForm = new W({
                    forum: this.forum,
                    session: this.session,
                    el: this.threadView.$el.find("#email-signup")[0]
                }).render()
            },
            updatePostCount: function() {
                var a = this.thread.get("posts");
                this.isInHome() || (this.$postCountContainer = this.$postCountContainer || this.threadView.$el.find("li[data-role=post-count]"), this.$postCountContainer.html(oa({
                    count: a
                }))), x.frame.sendHostMessage("posts.count", a)
            },
            renderLayout: function() {
                this.addFeatureDetectionClasses(), S.init(this);
                var b = a(la({
                    forum: this.forum.toJSON(),
                    thread: this.thread.toJSON()
                }));
                b.appendTo(this.$el), this.postsView.renderLayout(), t.readonly ? this.alert(sa("The Disqus comment system is temporarily in maintenance mode. You can still read comments during this time, however posting comments and other actions are temporarily delayed."), {
                    type: "info"
                }) : this.listenToOnce(this.session, "change:id", this.showPremoderationAlert)
            },
            showPremoderationAlert: function() {
                this.thread.isModerator(this.session.user) && !this.getAlert() && (this.forum.get("settings").validateAllPosts ? this.alert(b.escape(sa("Comments on this entire site are premoderated (only moderators can see this message).")) + (' <a href="' + b.escape("https://" + this.forum.id + ".disqus.com/admin/settings/community/") + '" target="_blank" rel="noopener noreferrer">' + b.escape(sa("Change site settings.")) + "</a>"), {
                    safe: !0,
                    isPremoderateStatus: !0
                }) : this.thread.get("validateAllPosts") && this.alert(sa("Comments on this thread are premoderated (only moderators can see this message)."), {
                    isPremoderateStatus: !0
                }))
            },
            dismissPremoderationAlert: function() {
                this.dismissAlert(function(a) {
                    return a.options && a.options.isPremoderateStatus
                })
            },
            addFeatureDetectionClasses: function() {
                var b = a(ra.documentElement);
                (this.config.forceMobile || E.isMobileUserAgent()) && b.addClass("mobile"), E.isMobileUserAgent() || b.addClass("use-opacity-transitions")
            },
            initMainPostBox: function() {
                if (this.form && (this.form.remove(), this.form = null), this.thread.get("isClosed")) return void this.showClosedAlert();
                if (!this.session.get("canReply")) return void this.session.once("change:id", this.initMainPostBox, this);
                var a = this.form = new X({
                    thread: this.thread,
                    userSuggestions: this.userSuggestions,
                    session: this.session
                });
                a.render(), this.threadView.$el.find("#form").prepend(a.$el), a.resize()
            },
            showClosedAlert: function() {
                if (this.thread.get("isClosed")) {
                    var a = this.thread.get("reactions");
                    a ? (this.listenToOnce(a, "sync change:enabled", this.showClosedAlert), this.alert(sa(a.enabled ? "Comments and reactions for this thread are now closed." : "Comments for this thread are now closed"))) : (this.listenToOnce(this.thread, "change:reactions", this.showClosedAlert), this.alert(sa("Comments for this thread are now closed")))
                }
            },
            initTermsOfService: function() {
                if (this.tos && (this.tos.remove(), this.tos = null), this.listenToOnce(this.session, "change:id", this.initTermsOfService), !(this.session.user.isAnonymous() || this.session.user.get("hasAcceptedGdprTerms") || !this.config.isPrivate && this.session.isSSO())) {
                    var a = this.tos = new Aa({
                        isPrivate: this.config.isPrivate,
                        session: this.session
                    });
                    a.render(), this.threadView.$el.find("#tos__container").prepend(a.$el)
                }
            },
            initUserSuggestionsManager: function() {
                this.userSuggestions = new ca({
                    threadId: this.thread.id
                }), this.userSuggestions.addRemote(this.thread.users), this.listenTo(this.session, "change:id", function() {
                    this.session.isLoggedIn() && (this.session.user.getFollowing(), this.session.user.following.PER_PAGE = 100, this.userSuggestions.addRemote(this.session.user.following))
                })
            },
            handleShowProfile: function(b) {
                if (!(b.ctrlKey || b.metaKey || b.shiftKey || b.altKey)) {
                    b.preventDefault();
                    var c = a(b.currentTarget).attr("data-username"),
                        d = a(b.currentTarget).attr("data-tab") || "";
                    this.isInHome() ? x.frame.sendHostMessage("home.open", Q.apps.home + "by/" + c + "/" + d) : this.showProfileSidebar(c, d)
                }
            },
            handleShowCommunitySidebar: function(b) {
                if (!E.willOpenNewWindow(b)) {
                    b.preventDefault();
                    var c = a(b.currentTarget).attr("data-forum");
                    x.trigger("sidebar:open", "home/forums/" + c + "/")
                }
            },
            handleSort: ta(function(b) {
                var c = a(b.currentTarget).attr("data-sort"),
                    d = this.forum.get("votingType") === s.VOTING_TYPES.DISABLED;
                "popular" === c && d && (c = "desc"), this.$el.find('[data-role="post-sort"]').replaceWith(pa({
                    order: c,
                    votingDisabled: d
                })), this.thread.posts.setOrder(c), this.thread.posts.fetch({
                    reset: !0
                }), x.frame.sendHostMessage("change:sort", c), this.inthreadAdApps = [], this.postsView.handleSort()
            }),
            toggleThread: ta(function() {
                var a = this.thread.get("isClosed"),
                    c = sa(a ? "An error occurred while opening the thread. Please try again." : "An error occurred while closing the thread. Please try again."),
                    d = {
                        success: function() {
                            window.location.reload(!0)
                        },
                        error: b.bind(this.alert, this, c, {
                            type: "error"
                        })
                    };
                a ? this.thread.open(d) : this.thread.close(d)
            }),
            toggleThreadPremoderate: ta(function() {
                var a = this;
                this.dismissAlert(function(a) {
                    return a.options && a.options.isPremoderateError
                });
                var b = this.thread.get("validateAllPosts");
                this.thread.premoderate(!b).then(function() {
                    b ? a.dismissPremoderationAlert() : a.showPremoderationAlert()
                }, function() {
                    a.alert(sa("An error occurred while updating the thread. Please try again."), {
                        type: "error",
                        isPremoderateError: !0
                    }), a.thread.set("validateAllPosts", b)
                }), x.trigger("uiAction:clickThreadPremoderate")
            }),
            toggleThreadRatingsEnabled: ta(function() {
                var a = this;
                H.isForumModelRatingsEnabled(this.forum) && this.thread.toggleRatingsEnabled().then(function() {
                    H.isThreadModelRatingsEnabled(a.thread) && (a.session.fetchThreadDetails({
                        thread: a.thread
                    }), a.thread.fetchRatings())
                })
            }),
            createDeferredViewsForImages: function() {
                a("img[data-src]").each(function(b, c) {
                    var d = a(c),
                        e = new wa({
                            el: c,
                            url: d.attr("data-src")
                        });
                    e.relatedPost = d.attr("data-post"), d.removeAttr("data-src")
                })
            },
            getPosition: function() {
                return this.position
            },
            showProfileSidebar: function(a, b) {
                x.trigger("sidebar:open", "by/" + a + "/" + b)
            },
            initResizeHandler: function() {
                var a, b = this;
                if (window.MutationObserver) new window.MutationObserver(function() {
                    a || (a = window.requestAnimationFrame(function() {
                        a = null, b.resize()
                    }))
                }).observe(ra.body, {
                    attributes: !0,
                    characterData: !0,
                    childList: !0,
                    subtree: !0,
                    attributeFilter: ["class", "style"]
                });
                else {
                    var c = function d() {
                        b.resize(), window.requestAnimationFrame(d)
                    };
                    window.requestAnimationFrame(c)
                }
            },
            resize: function() {
                var a = w.getPageHeight();
                this._lastHeight !== a && (this._lastHeight = a, this.trigger("domReflow"), x.frame.sendHostMessage("resize", {
                    height: a
                }))
            },
            handleAuth: ta(function(a) {
                this.session.authenticate(w.extractService(a.target, "auth"))
            }),
            handleLogout: ta(function() {
                this.session.logout()
            }),
            audienceSync: ta(function() {
                this.session.audienceSync()
            }),
            toggleMedia: ta(function() {
                var a = Z.settings,
                    b = !a.get("collapsed");
                a.set("collapsed", b)
            }),
            toggleReactions: ta(function() {
                this.thread.get("reactions").toggleEnabled()
            })
        });
    return b.extend(Da.prototype, T.ShareMixin), p.call(Da.prototype), w.mixin(Da, B.UiActionEventProxy), o.call(Da.prototype), w.mixin(Da, B.ProfileHtmlHelpers), N.call(Da.prototype), {
        Lounge: Da,
        UserMenuView: ya,
        ThreadSubscribeButton: va,
        RatingsView: ea,
        ReactionsView: fa,
        BehindClickView: Ba,
        ThreadView: Ca,
        DeferredMediaView: wa,
        DebugInfoView: xa
    }
}), define("lounge/main", ["jquery", "core/utils/getEmbeddedData", "lounge/tracking", "lounge/views"], function(a, b, c, d) {
    "use strict";
    return {
        init: function() {
            var e = b("threadData");
            if (!e) return {
                code: "no_thread_data"
            };
            if (e.code) return 2 === e.code ? "Endpoint resource not valid." === e.response && (e.code = "invalid_endpoint_resource") : 15 === e.code && "Thread creations from embed disabled." === e.response && (e.code = "thread_creations_disabled"), e;
            a.extend(e.response, b("forumData")), a("#postCompatContainer").remove();
            var f = new d.Lounge({
                jsonData: e,
                el: window.document.body
            });
            c.init(f)
        }
    }
}), define("lounge.bundle", function() {});