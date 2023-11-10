/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-sync-scripts */
import "../styles/globals.css";
import Head from "next/head";
import "../styles/_user.scss";
import "antd/dist/antd.css";
import '../react-data-table-component-extensions/dist/index.css';

function MyApp({ Component, pageProps }) {
  if (typeof window !== "undefined") {
    !(function () {
      if (!window.klaviyo) {
        window._klOnsite = window._klOnsite || [];
        try {
          window.klaviyo = new Proxy(
            {},
            {
              get: function (n, i) {
                return "push" === i
                  ? function () {
                    var n;
                    (n = window._klOnsite).push.apply(n, arguments);
                  }
                  : function () {
                    for (
                      var n = arguments.length, o = new Array(n), w = 0;
                      w < n;
                      w++
                    )
                      o[w] = arguments[w];
                    var t =
                      "function" == typeof o[o.length - 1]
                        ? o.pop()
                        : void 0,
                      e = new Promise(function (n) {
                        window._klOnsite.push(
                          [i].concat(o, [
                            function (i) {
                              t && t(i), n(i);
                            },
                          ])
                        );
                      });
                    return e;
                  };
              },
            }
          );
        } catch (n) {
          (window.klaviyo = window.klaviyo || []),
            (window.klaviyo.push = function () {
              var n;
              (n = window._klOnsite).push.apply(n, arguments);
            });
        }
      }
    })();
  }
  return (
    <>
      <Head>
        {" "}
        <title>Klaviyo- Multi Account Reporting</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
