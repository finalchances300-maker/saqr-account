// Saqr — community rules page (SC14): shows the Arabic or the English rules (Arabic first) and fills the contact lines
// from window.SAQR_CONFIG.rulesContact {supportEmail, childSafetyContact, webPageUrl} when config.js sets them (an empty
// or missing value keeps its line hidden). Text only (textContent), no network calls, nothing stored in the browser.
(function () {
  "use strict";
  var T = {
    ar: { heading: "صقر — قواعد المجتمع", lang: "English", back: "حسابك في صقر" },
    en: { heading: "Saqr — Community rules", lang: "العربية", back: "Your Saqr account" }
  };
  var lang = (navigator.language || "").toLowerCase().indexOf("en") === 0 ? "en" : "ar";
  function $(id) { return document.getElementById(id); }

  function apply() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    $("rules-heading").textContent = T[lang].heading;
    $("rules-lang").textContent = T[lang].lang;
    $("rules-back").textContent = T[lang].back;
    $("rules-ar").hidden = lang !== "ar";
    $("rules-en").hidden = lang !== "en";
  }

  function contacts() {
    var c = (window.SAQR_CONFIG && window.SAQR_CONFIG.rulesContact) || {};
    var lines = document.querySelectorAll("[data-contact]");
    for (var i = 0; i < lines.length; i++) {
      var v = c[lines[i].getAttribute("data-contact")];
      v = typeof v === "string" ? v.trim() : "";
      lines[i].querySelector(".contact-value").textContent = v;
      lines[i].hidden = v.length === 0;
    }
  }

  $("rules-lang").addEventListener("click", function () { lang = lang === "ar" ? "en" : "ar"; apply(); });
  apply();
  contacts();
})();
