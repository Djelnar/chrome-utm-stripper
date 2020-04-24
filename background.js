"use strict";

/*
 * Pattern matching the prefix of at least one stripped query string
 * parameter. We'll search the query string portion of the URL for this
 * pattern to determine if there's any stripping work to do.
 */
var searchPattern = new RegExp("utm_|clid|_hs|icid|igshid|mc_|mkt_tok", "i");

/*
 * Pattern matching the query string parameters (key=value) that will be
 * stripped from the final URL.
 */
var replacePattern = new RegExp(
  "([?&#]" +
    "(icid|mkt_tok|(g|fb)clid|igshid|_hs(enc|mi)|mc_[ce]id|utm_(source|medium|term|campaign|content|cid|reader|referrer|name|social|social-type))" +
    "=[^&#]*)",
  "ig"
);

chrome.webRequest.onBeforeRequest.addListener(
  function (details) {
    var url = details.url;

    var queryStringIndex = url.indexOf("?");

    var stripped = url;

    if (url.search(searchPattern) > queryStringIndex) {
      stripped = url.replace(replacePattern, "");
      if (stripped.charAt(queryStringIndex) === "&") {
        stripped =
          stripped.substr(0, queryStringIndex) +
          "?" +
          stripped.substr(queryStringIndex + 1);
      }
    }

    var hashStringIndex = stripped.indexOf("#");

    if (stripped.search(searchPattern) > hashStringIndex) {
      stripped = stripped.replace(replacePattern, "");
      if (stripped.charAt(hashStringIndex) === "&") {
        stripped =
          stripped.substr(0, hashStringIndex) +
          "#" +
          stripped.substr(hashStringIndex + 1);
      }
    }

    if (stripped !== url) {
      return { redirectUrl: stripped };
    }
  },
  {
    urls: ["<all_urls>"],
    types: ["main_frame"],
  },
  ["blocking"]
);
