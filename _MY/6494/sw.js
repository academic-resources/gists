if (!self.define) {
    let e, i = {};
    const n = (n, s) => (n = new URL(n + ".js", s).href, i[n] || new Promise((i => {
        if ("document" in self) {
            const e = document.createElement("script");
            e.src = n, e.onload = i, document.head.appendChild(e)
        } else e = n, importScripts(n), i()
    })).then((() => {
        let e = i[n];
        if (!e) throw new Error(`Module ${n} didn’t register its module`);
        return e
    })));
    self.define = (s, o) => {
        const a = e || ("document" in self ? document.currentScript.src : "") || location.href;
        if (i[a]) return;
        let r = {};
        const c = e => n(e, a),
            d = {
                module: {
                    uri: a
                },
                exports: r,
                require: c
            };
        i[a] = Promise.all(s.map((e => d[e] || c(e)))).then((e => (o(...e), r)))
    }
}
define(["./workbox-22294e6b"], (function(e) {
    "use strict";
    importScripts(), self.skipWaiting(), e.clientsClaim(), e.precacheAndRoute([{
        url: "/_next/static/3KZqzi_BmrgwgsnB8FuUp/_buildManifest.js",
        revision: "3KZqzi_BmrgwgsnB8FuUp"
    }, {
        url: "/_next/static/3KZqzi_BmrgwgsnB8FuUp/_ssgManifest.js",
        revision: "3KZqzi_BmrgwgsnB8FuUp"
    }, {
        url: "/_next/static/chunks/185-8edb238e6d615fb05f75.js",
        revision: "3KZqzi_BmrgwgsnB8FuUp"
    }, {
        url: "/_next/static/chunks/2b7b2d2a-24f330207e5aa92cfebd.js",
        revision: "3KZqzi_BmrgwgsnB8FuUp"
    }, {
        url: "/_next/static/chunks/730-ba9a7fdb29315d1b5387.js",
        revision: "3KZqzi_BmrgwgsnB8FuUp"
    }, {
        url: "/_next/static/chunks/733-2e6fbf1e1e8856e05a9a.js",
        revision: "3KZqzi_BmrgwgsnB8FuUp"
    }, {
        url: "/_next/static/chunks/framework-2191d16384373197bc0a.js",
        revision: "3KZqzi_BmrgwgsnB8FuUp"
    }, {
        url: "/_next/static/chunks/main-ca92031ebcb355b13699.js",
        revision: "3KZqzi_BmrgwgsnB8FuUp"
    }, {
        url: "/_next/static/chunks/pages/_app-a804668b27af47568476.js",
        revision: "3KZqzi_BmrgwgsnB8FuUp"
    }, {
        url: "/_next/static/chunks/pages/_error-737a04e9a0da63c9d162.js",
        revision: "3KZqzi_BmrgwgsnB8FuUp"
    }, {
        url: "/_next/static/chunks/pages/index-6a41b110763a4c89942b.js",
        revision: "3KZqzi_BmrgwgsnB8FuUp"
    }, {
        url: "/_next/static/chunks/pages/pdf-tools/merge-d90460ef22df9275c7e4.js",
        revision: "3KZqzi_BmrgwgsnB8FuUp"
    }, {
        url: "/_next/static/chunks/pages/pdf-tools/rotate-1b33da795ab209009acb.js",
        revision: "3KZqzi_BmrgwgsnB8FuUp"
    }, {
        url: "/_next/static/chunks/pages/pdf-tools/split-8def207a1a074c08fca5.js",
        revision: "3KZqzi_BmrgwgsnB8FuUp"
    }, {
        url: "/_next/static/chunks/polyfills-a40ef1678bae11e696dba45124eadd70.js",
        revision: "3KZqzi_BmrgwgsnB8FuUp"
    }, {
        url: "/_next/static/chunks/webpack-af28476a2e7790fd48db.js",
        revision: "3KZqzi_BmrgwgsnB8FuUp"
    }, {
        url: "/_next/static/css/01a26b7d602cfc7fdcad.css",
        revision: "3KZqzi_BmrgwgsnB8FuUp"
    }, {
        url: "/_next/static/css/13edd58d0aff848bbf72.css",
        revision: "3KZqzi_BmrgwgsnB8FuUp"
    }, {
        url: "/favicon.ico",
        revision: "9675a60a426ef9c83e46e47a69acd83b"
    }, {
        url: "/icons/android/android-launchericon-144-144.png",
        revision: "98099b901ddff88067259cc784d3ecfa"
    }, {
        url: "/icons/android/android-launchericon-192-192.png",
        revision: "e43d0edc11cc6871830df07ded95cbdd"
    }, {
        url: "/icons/android/android-launchericon-48-48.png",
        revision: "2b2818a52d57d94995c3810b0f6c02c1"
    }, {
        url: "/icons/android/android-launchericon-512-512.png",
        revision: "3b5453e7b774a5feb8bf559f288abe9c"
    }, {
        url: "/icons/android/android-launchericon-72-72.png",
        revision: "0833abd9e97d47115c7826187cc265ea"
    }, {
        url: "/icons/android/android-launchericon-96-96.png",
        revision: "50e6946b8cd9575b0598023bbef3ca88"
    }, {
        url: "/icons/ios/100.png",
        revision: "1e8f9edb84d1f9cbcf67704642a7b3c9"
    }, {
        url: "/icons/ios/1024.png",
        revision: "9ca5c9b2a7b3db301adf330a93417a4d"
    }, {
        url: "/icons/ios/114.png",
        revision: "48ff2fd2ca710dc4b1e32c6496c6f5d1"
    }, {
        url: "/icons/ios/120.png",
        revision: "cd90d086f861284efaf8dcd7435f6bf0"
    }, {
        url: "/icons/ios/128.png",
        revision: "1cc98dffb3dde931e17d550659e5154e"
    }, {
        url: "/icons/ios/144.png",
        revision: "98099b901ddff88067259cc784d3ecfa"
    }, {
        url: "/icons/ios/152.png",
        revision: "1abf772633c00b8f90a14316aa094200"
    }, {
        url: "/icons/ios/16.png",
        revision: "e286271ea98367ea416fe3857118dd4b"
    }, {
        url: "/icons/ios/167.png",
        revision: "3ae8a31648d6993e11d4037db7a56609"
    }, {
        url: "/icons/ios/180.png",
        revision: "e475fcb628b4ea194d37a2c37dbbd253"
    }, {
        url: "/icons/ios/192.png",
        revision: "e43d0edc11cc6871830df07ded95cbdd"
    }, {
        url: "/icons/ios/20.png",
        revision: "aec6e996af55187cd8b3d1d1e8fbef51"
    }, {
        url: "/icons/ios/256.png",
        revision: "6fc5ab4adfa70d13350280350ca181b8"
    }, {
        url: "/icons/ios/29.png",
        revision: "c892383af698f2ea1d41d2a787135297"
    }, {
        url: "/icons/ios/32.png",
        revision: "9521a20d544a3bbbe01c46425243dbc9"
    }, {
        url: "/icons/ios/40.png",
        revision: "0aed7e2574f2aefc9270025261ea3242"
    }, {
        url: "/icons/ios/50.png",
        revision: "b6c386b4af0113dc253cddd69ef2b7a5"
    }, {
        url: "/icons/ios/512.png",
        revision: "3b5453e7b774a5feb8bf559f288abe9c"
    }, {
        url: "/icons/ios/57.png",
        revision: "0a7d59ad9f653710213e340493dff28b"
    }, {
        url: "/icons/ios/58.png",
        revision: "928de5e5c6d5fb31374c5cda1efcc741"
    }, {
        url: "/icons/ios/60.png",
        revision: "0425bd9efbb3911b5d30bb48c1df9bbf"
    }, {
        url: "/icons/ios/64.png",
        revision: "7c412d9b78e2f50306c9eb52a1e9e4e4"
    }, {
        url: "/icons/ios/72.png",
        revision: "0833abd9e97d47115c7826187cc265ea"
    }, {
        url: "/icons/ios/76.png",
        revision: "e629c76ad8bd7d13ae9237163369f55c"
    }, {
        url: "/icons/ios/80.png",
        revision: "60c2086bfb9ad34bf495387e693a64ed"
    }, {
        url: "/icons/ios/87.png",
        revision: "fe53a542bb01f1c1f797723116f7b405"
    }, {
        url: "/icons/windows11/LargeTile.scale-100.png",
        revision: "4d408e319936cda96dae680b0793a03c"
    }, {
        url: "/icons/windows11/LargeTile.scale-125.png",
        revision: "cc2ced46553fcd977e9c44c1f232225f"
    }, {
        url: "/icons/windows11/LargeTile.scale-150.png",
        revision: "eb884e705ac14f243e49c88cc466b6b9"
    }, {
        url: "/icons/windows11/LargeTile.scale-200.png",
        revision: "5ac7ca6950b708f590aad023e23b15bd"
    }, {
        url: "/icons/windows11/LargeTile.scale-400.png",
        revision: "7299c17d18f0e655846ebdb68a89017c"
    }, {
        url: "/icons/windows11/SmallTile.scale-100.png",
        revision: "04d809e976d02747cfed8fed56821349"
    }, {
        url: "/icons/windows11/SmallTile.scale-125.png",
        revision: "560cddcc3e53285a9cdcca552e45dc59"
    }, {
        url: "/icons/windows11/SmallTile.scale-150.png",
        revision: "e7ac00e59eb457ce4d717fdf3852866b"
    }, {
        url: "/icons/windows11/SmallTile.scale-200.png",
        revision: "0b47ee97ba8061ab4e8ce430c9b30b66"
    }, {
        url: "/icons/windows11/SmallTile.scale-400.png",
        revision: "42db78c3c62a2831f0e541324793b8d2"
    }, {
        url: "/icons/windows11/SplashScreen.scale-100.png",
        revision: "e54cbe46ae141317bd9eaa2a93cdf147"
    }, {
        url: "/icons/windows11/SplashScreen.scale-125.png",
        revision: "81501e3414d08bb118df930a207f5534"
    }, {
        url: "/icons/windows11/SplashScreen.scale-150.png",
        revision: "b44fb1b0fc7ec67bf4922c391e96ce03"
    }, {
        url: "/icons/windows11/SplashScreen.scale-200.png",
        revision: "201dc346a25a13d2ee236cba31fe6ed2"
    }, {
        url: "/icons/windows11/SplashScreen.scale-400.png",
        revision: "0fdd5c26d377103597501e622febd7e5"
    }, {
        url: "/icons/windows11/Square150x150Logo.scale-100.png",
        revision: "bea8a1c138f6b78651e0156ab941eb87"
    }, {
        url: "/icons/windows11/Square150x150Logo.scale-125.png",
        revision: "4ac57f9bc7987bfc872bd91055e0d96c"
    }, {
        url: "/icons/windows11/Square150x150Logo.scale-150.png",
        revision: "861b82deaa973e802a84e1d3155e3c75"
    }, {
        url: "/icons/windows11/Square150x150Logo.scale-200.png",
        revision: "0a55ba4a8c7f8289313bb06a5426258d"
    }, {
        url: "/icons/windows11/Square150x150Logo.scale-400.png",
        revision: "64322fa4a9e71175207cb923822fab17"
    }, {
        url: "/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-16.png",
        revision: "aeadf7bc25c7c037cd422f993bef07d2"
    }, {
        url: "/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-20.png",
        revision: "914eb7ad60bd777aed0eb3c32ac82d4a"
    }, {
        url: "/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-24.png",
        revision: "a49b6d9b83163980f8efdd74f91093ff"
    }, {
        url: "/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-256.png",
        revision: "ed2fddcfeebe2755a26be3d8f4f294cf"
    }, {
        url: "/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-30.png",
        revision: "f2797f7e0338f72a4fe81390d3683c69"
    }, {
        url: "/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-32.png",
        revision: "550c9507d7df4623fffc42455ba617a9"
    }, {
        url: "/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-36.png",
        revision: "3a8d21fab28e9af79b53c5c53bd8e28f"
    }, {
        url: "/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-40.png",
        revision: "51edd8362a9d8df9406e4183b3ba79c7"
    }, {
        url: "/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-44.png",
        revision: "3d2e37c8a7191a569e77e7f22dd8dae2"
    }, {
        url: "/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-48.png",
        revision: "62cbdc30ac32f273f5c31b9edad8f3ff"
    }, {
        url: "/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-60.png",
        revision: "27fad9acc8e9d8f18930fe7bef46334c"
    }, {
        url: "/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-64.png",
        revision: "fafdf3b5252fb1b998cda8a33450797a"
    }, {
        url: "/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-72.png",
        revision: "bea533d852b816e39b25701461fda235"
    }, {
        url: "/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-80.png",
        revision: "4694a80d00263f7746a928624f6b65eb"
    }, {
        url: "/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-96.png",
        revision: "f2bd528aeeb5993042060c94570e9e41"
    }, {
        url: "/icons/windows11/Square44x44Logo.altform-unplated_targetsize-16.png",
        revision: "aeadf7bc25c7c037cd422f993bef07d2"
    }, {
        url: "/icons/windows11/Square44x44Logo.altform-unplated_targetsize-20.png",
        revision: "914eb7ad60bd777aed0eb3c32ac82d4a"
    }, {
        url: "/icons/windows11/Square44x44Logo.altform-unplated_targetsize-24.png",
        revision: "a49b6d9b83163980f8efdd74f91093ff"
    }, {
        url: "/icons/windows11/Square44x44Logo.altform-unplated_targetsize-256.png",
        revision: "ed2fddcfeebe2755a26be3d8f4f294cf"
    }, {
        url: "/icons/windows11/Square44x44Logo.altform-unplated_targetsize-30.png",
        revision: "f2797f7e0338f72a4fe81390d3683c69"
    }, {
        url: "/icons/windows11/Square44x44Logo.altform-unplated_targetsize-32.png",
        revision: "550c9507d7df4623fffc42455ba617a9"
    }, {
        url: "/icons/windows11/Square44x44Logo.altform-unplated_targetsize-36.png",
        revision: "3a8d21fab28e9af79b53c5c53bd8e28f"
    }, {
        url: "/icons/windows11/Square44x44Logo.altform-unplated_targetsize-40.png",
        revision: "51edd8362a9d8df9406e4183b3ba79c7"
    }, {
        url: "/icons/windows11/Square44x44Logo.altform-unplated_targetsize-44.png",
        revision: "3d2e37c8a7191a569e77e7f22dd8dae2"
    }, {
        url: "/icons/windows11/Square44x44Logo.altform-unplated_targetsize-48.png",
        revision: "62cbdc30ac32f273f5c31b9edad8f3ff"
    }, {
        url: "/icons/windows11/Square44x44Logo.altform-unplated_targetsize-60.png",
        revision: "27fad9acc8e9d8f18930fe7bef46334c"
    }, {
        url: "/icons/windows11/Square44x44Logo.altform-unplated_targetsize-64.png",
        revision: "fafdf3b5252fb1b998cda8a33450797a"
    }, {
        url: "/icons/windows11/Square44x44Logo.altform-unplated_targetsize-72.png",
        revision: "bea533d852b816e39b25701461fda235"
    }, {
        url: "/icons/windows11/Square44x44Logo.altform-unplated_targetsize-80.png",
        revision: "4694a80d00263f7746a928624f6b65eb"
    }, {
        url: "/icons/windows11/Square44x44Logo.altform-unplated_targetsize-96.png",
        revision: "f2bd528aeeb5993042060c94570e9e41"
    }, {
        url: "/icons/windows11/Square44x44Logo.scale-100.png",
        revision: "3d2e37c8a7191a569e77e7f22dd8dae2"
    }, {
        url: "/icons/windows11/Square44x44Logo.scale-125.png",
        revision: "516bffde90d9eba1c10283fefb6e67dd"
    }, {
        url: "/icons/windows11/Square44x44Logo.scale-150.png",
        revision: "25839d6f15726cfc65ab220f4aa3c935"
    }, {
        url: "/icons/windows11/Square44x44Logo.scale-200.png",
        revision: "80820dfe431e0c4783202e477e7d60bd"
    }, {
        url: "/icons/windows11/Square44x44Logo.scale-400.png",
        revision: "027de33405b17d4344467ca4c0bf90f2"
    }, {
        url: "/icons/windows11/Square44x44Logo.targetsize-16.png",
        revision: "aeadf7bc25c7c037cd422f993bef07d2"
    }, {
        url: "/icons/windows11/Square44x44Logo.targetsize-20.png",
        revision: "914eb7ad60bd777aed0eb3c32ac82d4a"
    }, {
        url: "/icons/windows11/Square44x44Logo.targetsize-24.png",
        revision: "a49b6d9b83163980f8efdd74f91093ff"
    }, {
        url: "/icons/windows11/Square44x44Logo.targetsize-256.png",
        revision: "ed2fddcfeebe2755a26be3d8f4f294cf"
    }, {
        url: "/icons/windows11/Square44x44Logo.targetsize-30.png",
        revision: "f2797f7e0338f72a4fe81390d3683c69"
    }, {
        url: "/icons/windows11/Square44x44Logo.targetsize-32.png",
        revision: "550c9507d7df4623fffc42455ba617a9"
    }, {
        url: "/icons/windows11/Square44x44Logo.targetsize-36.png",
        revision: "3a8d21fab28e9af79b53c5c53bd8e28f"
    }, {
        url: "/icons/windows11/Square44x44Logo.targetsize-40.png",
        revision: "51edd8362a9d8df9406e4183b3ba79c7"
    }, {
        url: "/icons/windows11/Square44x44Logo.targetsize-44.png",
        revision: "3d2e37c8a7191a569e77e7f22dd8dae2"
    }, {
        url: "/icons/windows11/Square44x44Logo.targetsize-48.png",
        revision: "62cbdc30ac32f273f5c31b9edad8f3ff"
    }, {
        url: "/icons/windows11/Square44x44Logo.targetsize-60.png",
        revision: "27fad9acc8e9d8f18930fe7bef46334c"
    }, {
        url: "/icons/windows11/Square44x44Logo.targetsize-64.png",
        revision: "fafdf3b5252fb1b998cda8a33450797a"
    }, {
        url: "/icons/windows11/Square44x44Logo.targetsize-72.png",
        revision: "bea533d852b816e39b25701461fda235"
    }, {
        url: "/icons/windows11/Square44x44Logo.targetsize-80.png",
        revision: "4694a80d00263f7746a928624f6b65eb"
    }, {
        url: "/icons/windows11/Square44x44Logo.targetsize-96.png",
        revision: "f2bd528aeeb5993042060c94570e9e41"
    }, {
        url: "/icons/windows11/StoreLogo.scale-100.png",
        revision: "b6c386b4af0113dc253cddd69ef2b7a5"
    }, {
        url: "/icons/windows11/StoreLogo.scale-125.png",
        revision: "cb38aab402fdbd8c8e3899e0f9eb051d"
    }, {
        url: "/icons/windows11/StoreLogo.scale-150.png",
        revision: "58620cba94c4701111021134d0c407f8"
    }, {
        url: "/icons/windows11/StoreLogo.scale-200.png",
        revision: "1e8f9edb84d1f9cbcf67704642a7b3c9"
    }, {
        url: "/icons/windows11/StoreLogo.scale-400.png",
        revision: "bce58016ebb3f26f71c3124def97e771"
    }, {
        url: "/icons/windows11/Wide310x150Logo.scale-100.png",
        revision: "759d52d39d88eb115a9a400b1189bf4d"
    }, {
        url: "/icons/windows11/Wide310x150Logo.scale-125.png",
        revision: "2f0e608d1dfc10dd9c9b037ade31ff8e"
    }, {
        url: "/icons/windows11/Wide310x150Logo.scale-150.png",
        revision: "1187b3fa6a033df4fde29895e400c8a5"
    }, {
        url: "/icons/windows11/Wide310x150Logo.scale-200.png",
        revision: "e54cbe46ae141317bd9eaa2a93cdf147"
    }, {
        url: "/icons/windows11/Wide310x150Logo.scale-400.png",
        revision: "201dc346a25a13d2ee236cba31fe6ed2"
    }, {
        url: "/manifest.json",
        revision: "14bb944000b0d3ff907a136f9a778b70"
    }], {
        ignoreURLParametersMatching: []
    }), e.cleanupOutdatedCaches(), e.registerRoute("/", new e.NetworkFirst({
        cacheName: "start-url",
        plugins: [{
            cacheWillUpdate: async ({
                request: e,
                response: i,
                event: n,
                state: s
            }) => i && "opaqueredirect" === i.type ? new Response(i.body, {
                status: 200,
                statusText: "OK",
                headers: i.headers
            }) : i
        }]
    }), "GET"), e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i, new e.CacheFirst({
        cacheName: "google-fonts-webfonts",
        plugins: [new e.ExpirationPlugin({
            maxEntries: 4,
            maxAgeSeconds: 31536e3
        })]
    }), "GET"), e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i, new e.StaleWhileRevalidate({
        cacheName: "google-fonts-stylesheets",
        plugins: [new e.ExpirationPlugin({
            maxEntries: 4,
            maxAgeSeconds: 604800
        })]
    }), "GET"), e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i, new e.StaleWhileRevalidate({
        cacheName: "static-font-assets",
        plugins: [new e.ExpirationPlugin({
            maxEntries: 4,
            maxAgeSeconds: 604800
        })]
    }), "GET"), e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i, new e.StaleWhileRevalidate({
        cacheName: "static-image-assets",
        plugins: [new e.ExpirationPlugin({
            maxEntries: 64,
            maxAgeSeconds: 86400
        })]
    }), "GET"), e.registerRoute(/\/_next\/image\?url=.+$/i, new e.StaleWhileRevalidate({
        cacheName: "next-image",
        plugins: [new e.ExpirationPlugin({
            maxEntries: 64,
            maxAgeSeconds: 86400
        })]
    }), "GET"), e.registerRoute(/\.(?:mp3|wav|ogg)$/i, new e.CacheFirst({
        cacheName: "static-audio-assets",
        plugins: [new e.RangeRequestsPlugin, new e.ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 86400
        })]
    }), "GET"), e.registerRoute(/\.(?:mp4)$/i, new e.CacheFirst({
        cacheName: "static-video-assets",
        plugins: [new e.RangeRequestsPlugin, new e.ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 86400
        })]
    }), "GET"), e.registerRoute(/\.(?:js)$/i, new e.StaleWhileRevalidate({
        cacheName: "static-js-assets",
        plugins: [new e.ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 86400
        })]
    }), "GET"), e.registerRoute(/\.(?:css|less)$/i, new e.StaleWhileRevalidate({
        cacheName: "static-style-assets",
        plugins: [new e.ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 86400
        })]
    }), "GET"), e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i, new e.StaleWhileRevalidate({
        cacheName: "next-data",
        plugins: [new e.ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 86400
        })]
    }), "GET"), e.registerRoute(/\.(?:json|xml|csv)$/i, new e.NetworkFirst({
        cacheName: "static-data-assets",
        plugins: [new e.ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 86400
        })]
    }), "GET"), e.registerRoute((({
        url: e
    }) => {
        if (!(self.origin === e.origin)) return !1;
        const i = e.pathname;
        return !i.startsWith("/api/auth/") && !!i.startsWith("/api/")
    }), new e.NetworkFirst({
        cacheName: "apis",
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({
            maxEntries: 16,
            maxAgeSeconds: 86400
        })]
    }), "GET"), e.registerRoute((({
        url: e
    }) => {
        if (!(self.origin === e.origin)) return !1;
        return !e.pathname.startsWith("/api/")
    }), new e.NetworkFirst({
        cacheName: "others",
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 86400
        })]
    }), "GET"), e.registerRoute((({
        url: e
    }) => !(self.origin === e.origin)), new e.NetworkFirst({
        cacheName: "cross-origin",
        networkTimeoutSeconds: 10,
        plugins: [new e.ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 3600
        })]
    }), "GET")
}));