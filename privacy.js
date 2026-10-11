// Saqr — privacy policy page (A7): shows the Arabic or the English text (Arabic first). Text only, no network calls,
// nothing stored in the browser.
(function () {
  "use strict";
  var T = {
    ar: { heading: "صقار الخليج — سياسة الخصوصية", lang: "English", back: "حسابك في صقار الخليج" },
    en: { heading: "Saqar Alkhaleej — Privacy policy", lang: "العربية", back: "Your Saqar Alkhaleej account" }
  };
  var lang = (navigator.language || "").toLowerCase().indexOf("en") === 0 ? "en" : "ar";
  function $(id) { return document.getElementById(id); }

  function apply() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    $("privacy-heading").textContent = T[lang].heading;
    $("privacy-lang").textContent = T[lang].lang;
    $("privacy-back").textContent = T[lang].back;
    $("privacy-ar").hidden = lang !== "ar";
    $("privacy-en").hidden = lang !== "en";
  }

  $("privacy-lang").addEventListener("click", function () { lang = lang === "ar" ? "en" : "ar"; apply(); });
  apply();
})();
