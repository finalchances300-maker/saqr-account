// Saqr — account web page: account deletion (Google Play requirement: players can ask for deletion outside the game)
// and, for a suspended / banned player, the ban APPEAL (migration 0041).
// Signs in with email + password through Supabase Auth (REST, the PUBLISHABLE key from config.js — never the secret
// key). Deletion: the player reads the deletion rules, ticks "I have read and agree to all the rules" (the button stays
// disabled until then), types the word, and the page calls request_account_deletion(p_source => 'web',
// p_rules_version => RULES_VERSION); the server refuses an old / missing version (DeletionRulesRequired). The server
// deletes the account after the grace days; the player can cancel in the game or here until then. After sign-in the page
// reads account_deletion_status (0032) and appeal_status (0041): a pending date + Cancel, and for a suspended / banned
// player the restriction (reason + date), his appeals with the team's answers and the appeal form (one open at a time).
// A banned player can delete ONLY here (the game refuses it, 0041).
// Keep in step with Assets/Data/Resources/falcon_config.json (Server/tests/test_social_rules_about_appeals.py checks):
var GRACE_DAYS = 7;       // online.accountDeletion.graceDays
var RULES_VERSION = 1;    // online.accountDeletion.rulesVersion (change the rule texts → raise both)
// Nothing is stored in the browser: the session lives in this page's memory only.
(function () {
  "use strict";

  var T = {
    ar: {
      title: "صقر — الحساب",
      lang: "English",
      intro: "يمكنك هنا طلب حذف حسابك في لعبة صقر، أو التظلّم من إيقاف حسابك.",
      inGame: "يمكنك أيضاً حذف الحساب من داخل اللعبة: الإعدادات ← الحساب (إلا إذا كان الحساب موقوفاً أو محظوراً: عندها من هذه الصفحة فقط).",
      communityRules: "قواعد المجتمع (كاملة)",
      rulesTitle: "قواعد حذف الحساب",
      rule1: "مهلة التراجع: يُحذف حسابك بعد {0} أيام من طلبك، ويمكنك خلالها إلغاء الطلب من اللعبة أو من هذه الصفحة.",
      rule2: "ما تخسره: صقورك وعملاتك ولؤلؤك لا يمكن استخدامها بعد ذلك، ويُزال اسمك وبلدك. لا يُعاد أي شيء ولا يُسترد.",
      rule3: "تُلغى عروض البيع والمزادات المفتوحة وتُعاد المزايدات لأصحابها.",
      rule4: "ما يبقى باسم «لاعب محذوف»: مبيعاتك وصفقاتك السابقة وسجل عملاتك ونتائج سباقاتك وكؤوسك تبقى في سجلات اللعبة بلا اسمك.",
      rule5: "المحادثات: يحتفظ اللاعبون الآخرون بمحادثاتهم معك وتظهر رسائلك باسم «لاعب محذوف». يحتفظ فريق صقر بالبلاغات وأدلتها.",
      rule6: "إن أردت نسخة من بياناتك فنزّلها أولاً (في اللعبة: الإعدادات ← الحساب ← تنزيل بياناتي؛ الحساب الموقوف: اطلبها من دعم صقر).",
      rule7: "لن تتمكن من استخدام هذا الحساب مرة أخرى أبداً.",
      what5: "تسجيل الدخول (البريد) نفسه يزيله فريق صقر يدوياً بعد الموعد، إلى أن يجهز الحذف التلقائي.",
      agree: "قرأت جميع القواعد وأوافق عليها",
      mustAgree: "ضع علامة على «قرأت جميع القواعد وأوافق عليها» أولاً.",
      rulesChanged: "تغيّرت قواعد الحذف. حدّث الصفحة واقرأها مرة أخرى.",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      signIn: "تسجيل الدخول",
      forgot: "نسيت كلمة المرور؟ راسل الدعم وسنساعدك.",
      signedInAs: "مسجّل الدخول باسم:",
      wordLabel: "اكتب «{0}» للتأكيد",
      word: "حذف",
      delete: "اطلب حذف حسابي",
      cancelRequest: "إلغاء طلب الحذف",
      working: "لحظة من فضلك…",
      done: "تم تسجيل طلبك. سيُحذف حسابك في {0}. يمكنك الإلغاء قبل ذلك.",
      doneNoProfile: "تم تسجيل طلبك. لا يوجد ملف لعب لهذا الحساب؛ يزيل فريق صقر تسجيل الدخول بعد {0}.",
      pending: "طلب الحذف مسجّل: سيُحذف حسابك في {0}. يمكنك إلغاؤه قبل ذلك.",
      pendingNoProfile: "طلب الحذف مسجّل لتسجيل الدخول هذا (بلا ملف لعب): يزيله فريق صقر بعد {0}. يمكنك إلغاؤه.",
      suspended: "هذا الحساب موقوف.",
      sessionEnded: "انتهت جلستك. سجّل الدخول مرة أخرى.",
      cancelled: "أُلغي طلب الحذف.",
      nothingToCancel: "لا يوجد طلب حذف لإلغائه.",
      mismatch: "اكتب «{0}» كما هي للتأكيد.",
      badLogin: "البريد أو كلمة المرور غير صحيحة.",
      notConfirmed: "لم يتم تأكيد هذا البريد بعد.",
      accountDeleted: "تم حذف هذا الحساب بالفعل.",
      staff: "لا يمكن حذف حسابات فريق الإدارة.",
      rateLimited: "محاولات كثيرة. انتظر قليلاً ثم حاول مجدداً.",
      network: "تعذّر الاتصال بالخادم. تحقق من الإنترنت وحاول مجدداً.",
      noConfig: "الصفحة غير مُعدّة بعد (config.js مفقود).",
      unknown: "حدث خطأ. حاول مجدداً لاحقاً.",
      appealTitle: "التظلّم من إيقاف الحساب",
      stateBan: "حسابك محظور منذ {0}.",
      stateSuspend: "حسابك موقوف منذ {0} حتى {1} (بتوقيت الخليج).",
      stateReason: "السبب: {0}",
      appealLabel: "اشرح لفريق صقر لماذا يجب رفع الإيقاف",
      appealSend: "أرسل التظلّم",
      appealCount: "{0} حرفاً (من {1} إلى {2}).",
      appealSent: "أُرسل تظلّمك. سيراجعه فريق صقر ويظهر الرد هنا.",
      appealOpenNow: "لديك تظلّم قيد المراجعة. يمكنك إرسال تظلّم واحد فقط في كل مرة.",
      appealWaitUntil: "رُفض تظلّمك الأخير. يمكنك إرسال تظلّم جديد بعد {0}.",
      appealNotRestricted: "حسابك غير موقوف، فلا حاجة إلى تظلّم.",
      appealTooShort: "اكتب شرحاً أطول قليلاً.",
      appealTooLong: "النص طويل جداً.",
      appealEmpty: "اكتب سبب تظلّمك أولاً.",
      appealItem: "تظلّم بتاريخ {0}",
      "status.open": "قيد المراجعة",
      "status.accepted": "قُبل: رُفع الإيقاف",
      "status.rejected": "رُفض",
      "status.closed": "مغلق",
      teamReply: "رد فريق صقر: {0}",
      "reason.cheating": "غش",
      "reason.rmt": "بيع بأموال حقيقية",
      "reason.abuse": "إساءة",
      "reason.harassment": "مضايقة لاعبين",
      "reason.inappropriate_name": "اسم غير لائق",
      "reason.spam": "إزعاج متكرر",
      "reason.child_safety": "سلامة الأطفال",
      "reason.other": "مخالفة قواعد المجتمع"
    },
    en: {
      title: "Saqr — Account",
      lang: "العربية",
      intro: "Here you can ask for your Saqr game account to be deleted, or appeal a suspension or ban.",
      inGame: "You can also delete the account in the game: Settings → Account (not while the account is suspended or banned: then only on this page).",
      communityRules: "Community rules (full)",
      rulesTitle: "Account deletion rules",
      rule1: "Time to change your mind: your account is deleted {0} days after you ask. Until then you can cancel, in the game or on this page.",
      rule2: "What you lose: your falcons, coins and Pearls can no longer be used, and your name and country are removed. Nothing is given back or refunded.",
      rule3: "Open sales and auctions are cancelled and bids go back to the bidders.",
      rule4: "What stays as “Deleted player”: your past sales and trades, coin history, race results and trophies stay in the game's records without your name.",
      rule5: "Chats: other players keep the chats they had with you; your messages show as “Deleted player”. The Saqr team keeps reports and their evidence.",
      rule6: "If you want a copy of your data, download it first (in the game: Settings → Account → Download my data; a suspended account: ask Saqr support).",
      rule7: "You will never be able to use this account again.",
      what5: "The login (email) itself is removed by the Saqr team by hand after that date, until automatic removal is ready.",
      agree: "I have read and agree to all the rules",
      mustAgree: "Tick “I have read and agree to all the rules” first.",
      rulesChanged: "The deletion rules changed. Reload the page and read them again.",
      email: "Email",
      password: "Password",
      signIn: "Sign in",
      forgot: "Forgot your password? Write to support and we will help.",
      signedInAs: "Signed in as:",
      wordLabel: "Type “{0}” to confirm",
      word: "DELETE",
      delete: "Ask to delete my account",
      cancelRequest: "Cancel the deletion request",
      working: "Please wait…",
      done: "Your request is recorded. Your account will be deleted on {0}. You can cancel until then.",
      doneNoProfile: "Your request is recorded. This login has no game profile; the Saqr team removes the login after {0}.",
      pending: "A deletion is already asked: your account will be deleted on {0}. You can cancel until then.",
      pendingNoProfile: "A deletion is asked for this login (no game profile): the Saqr team removes it after {0}. You can cancel it.",
      suspended: "This account is suspended.",
      sessionEnded: "Your session ended. Please sign in again.",
      cancelled: "The deletion request was cancelled.",
      nothingToCancel: "There is no deletion request to cancel.",
      mismatch: "Type “{0}” exactly to confirm.",
      badLogin: "Wrong email or password.",
      notConfirmed: "This email is not confirmed yet.",
      accountDeleted: "This account was already deleted.",
      staff: "Staff accounts can't be deleted.",
      rateLimited: "Too many tries. Wait a little and try again.",
      network: "Could not reach the server. Check the internet and try again.",
      noConfig: "This page is not set up yet (config.js is missing).",
      unknown: "Something went wrong. Please try again later.",
      appealTitle: "Appeal a suspension or ban",
      stateBan: "Your account is banned since {0}.",
      stateSuspend: "Your account is suspended since {0}, until {1} (Gulf time).",
      stateReason: "Reason: {0}",
      appealLabel: "Tell the Saqr team why the restriction should be lifted",
      appealSend: "Send my appeal",
      appealCount: "{0} letters ({1} to {2}).",
      appealSent: "Your appeal was sent. The Saqr team will review it and the answer will show here.",
      appealOpenNow: "You have an appeal under review. You can send only one at a time.",
      appealWaitUntil: "Your last appeal was rejected. You can send a new one after {0}.",
      appealNotRestricted: "Your account is not restricted, so there is nothing to appeal.",
      appealTooShort: "Please write a little more.",
      appealTooLong: "The text is too long.",
      appealEmpty: "Write why you appeal first.",
      appealItem: "Appeal of {0}",
      "status.open": "Under review",
      "status.accepted": "Accepted: the restriction was lifted",
      "status.rejected": "Rejected",
      "status.closed": "Closed",
      teamReply: "The Saqr team's answer: {0}",
      "reason.cheating": "Cheating",
      "reason.rmt": "Selling for real money",
      "reason.abuse": "Abuse",
      "reason.harassment": "Harassing players",
      "reason.inappropriate_name": "Inappropriate name",
      "reason.spam": "Spam",
      "reason.child_safety": "Child safety",
      "reason.other": "Breaking the community rules"
    }
  };

  var cfg = window.SAQR_CONFIG || null;
  var lang = (navigator.language || "").toLowerCase().indexOf("en") === 0 ? "en" : "ar";   // Arabic first
  var session = null;      // { access_token, email } — memory only
  var lastAppeal = null;   // the last appeal_status result (re-drawn on a language change)
  var $ = function (id) { return document.getElementById(id); };

  function t(key) {
    var s = T[lang][key] || key;
    for (var i = 1; i < arguments.length; i++) {
      var v = arguments[i] == null ? "" : String(arguments[i]);
      s = s.replace("{" + (i - 1) + "}", function () { return v; });   // a function: "$&" in player / team text stays as typed
    }
    return s;
  }

  function digits(s) { return lang === "ar" ? String(s).replace(/\d/g, function (c) { return "٠١٢٣٤٥٦٧٨٩"[c]; }) : String(s); }

  function applyLanguage() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = t("title");
    var nodes = document.querySelectorAll("[data-t]");
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = t(nodes[i].getAttribute("data-t"), digits(GRACE_DAYS));
    $("lang").textContent = t("lang");
    $("word-label").textContent = t("wordLabel", t("word"));
    if (lastAppeal) drawAppeal(lastAppeal);
    countAppeal();
  }

  function show(id, text, kind) {
    var el = $(id);
    el.textContent = text || "";
    el.className = "msg" + (kind ? " " + kind : "");
  }

  function dateText(ms) {
    var d = new Date(ms + 4 * 3600 * 1000); // Gulf time (UTC+4), like the game
    return digits(d.getUTCDate() + "/" + (d.getUTCMonth() + 1) + "/" + d.getUTCFullYear());
  }

  function base() { return String(cfg.supabaseUrl || "").replace(/\/+$/, ""); }

  function call(method, path, body, bearer) {
    var headers = { "apikey": cfg.publishableKey, "Content-Type": "application/json" };
    if (bearer) headers["Authorization"] = "Bearer " + bearer;
    return fetch(base() + path, { method: method, headers: headers, body: body == null ? undefined : JSON.stringify(body) })
      .then(function (r) {
        return r.text().then(function (text) {
          var json = null;
          try { json = text ? JSON.parse(text) : null; } catch (e) { json = null; }
          return { status: r.status, body: json };
        });
      });
  }

  // Server refusal code (or Auth error) → message.
  function problem(code) {
    switch (code) {
      case "AccountDeleted": return t("accountDeleted");
      case "StaffAccountProtected": return t("staff");
      case "AccountSuspended": return t("suspended");
      case "SessionRevoked": case "NotSignedIn": case "SessionExpired": return t("sessionEnded");
      case "DeletionRulesRequired": return t("rulesChanged");
      case "AppealOpen": return t("appealOpenNow");
      case "NotRestricted": return t("appealNotRestricted");
      case "TooShort": return t("appealTooShort");
      case "TooLong": return t("appealTooLong");
      case "EmptyText": return t("appealEmpty");
      case "invalid_credentials": return t("badLogin");
      case "email_not_confirmed": return t("notConfirmed");
      case "over_request_rate_limit": case "RateLimited": return t("rateLimited");
      default: return t("unknown");
    }
  }

  function signIn(ev) {
    ev.preventDefault();
    if (!cfg || !cfg.supabaseUrl || !cfg.publishableKey) { show("signin-msg", t("noConfig"), "error"); return; }
    var email = $("email").value.trim(), password = $("password").value;
    $("signin-btn").disabled = true;
    show("signin-msg", t("working"));
    call("POST", "/auth/v1/token?grant_type=password", { email: email, password: password })
      .then(function (r) {
        if (r.status === 200 && r.body && r.body.access_token) {
          session = { access_token: r.body.access_token, email: (r.body.user && r.body.user.email) || email };
          $("password").value = "";
          show("signin-msg", "");
          $("who").textContent = session.email;
          $("signin").hidden = true;
          $("confirm").hidden = false;
          loadStatus();
          loadAppeal();
        } else {
          var code = r.body && (r.body.error_code || r.body.code || r.body.error);
          show("signin-msg", r.status === 429 ? t("rateLimited") : r.status === 400 && !code ? t("badLogin") : problem(code), "error");
        }
      })
      .catch(function () { show("signin-msg", t("network"), "error"); })
      .then(function () { $("signin-btn").disabled = false; });
  }

  // Review fix M8: right after sign-in, a deletion already asked is shown with its date, and Cancel at once.
  function loadStatus() {
    if (!session) return;
    call("POST", "/rest/v1/rpc/account_deletion_status", {}, session.access_token)
      .then(function (r) {
        var reply = rpcReply(r);
        if (!reply.ok) { if (reply.error !== "unknown") show("confirm-msg", problem(reply.error), "error"); return; }
        var res = reply.result || {};
        if (res.dueAtMs) {
          show("confirm-msg", t(res.noProfile ? "pendingNoProfile" : "pending", dateText(res.dueAtMs)), "ok");
          $("cancel-btn").hidden = false;
        }
      })
      .catch(function () { /* the request button still works */ });
  }

  function matches(typed) {
    var w = typed.trim().toLowerCase();
    return w.length > 0 && (w === T.ar.word.toLowerCase() || w === T.en.word.toLowerCase());
  }

  function rpcReply(r) {
    if (r.status === 429) return { ok: false, error: "RateLimited" };
    if (r.status !== 200 || !r.body) return { ok: false, error: "unknown" };
    return r.body;
  }

  // The Delete button works only after the tick (the server also refuses without the rules version).
  function syncAgree() { $("delete-btn").disabled = !$("agree").checked; }

  function requestDeletion() {
    if (!session) return;
    if (!$("agree").checked) { show("confirm-msg", t("mustAgree"), "error"); return; }
    if (!matches($("word").value)) { show("confirm-msg", t("mismatch", t("word")), "error"); return; }
    $("delete-btn").disabled = true;
    show("confirm-msg", t("working"));
    call("POST", "/rest/v1/rpc/request_account_deletion", { p_source: "web", p_rules_version: RULES_VERSION }, session.access_token)
      .then(function (r) {
        var reply = rpcReply(r);
        if (reply.ok) {
          var res = reply.result || {};
          show("confirm-msg", t(res.noProfile ? "doneNoProfile" : "done", dateText(res.dueAtMs)), "ok");
          $("cancel-btn").hidden = false;   // a login-only request can be cancelled too (review fix D2)
        } else {
          show("confirm-msg", problem(reply.error), "error");
        }
      })
      .catch(function () { show("confirm-msg", t("network"), "error"); })
      .then(syncAgree);
  }

  function cancelDeletion() {
    if (!session) return;
    $("cancel-btn").disabled = true;
    call("POST", "/rest/v1/rpc/cancel_account_deletion", {}, session.access_token)
      .then(function (r) {
        var reply = rpcReply(r);
        if (reply.ok) {
          show("confirm-msg", t(reply.result && reply.result.cancelled ? "cancelled" : "nothingToCancel"), "ok");
          $("cancel-btn").hidden = true;
        } else {
          show("confirm-msg", problem(reply.error), "error");
        }
      })
      .catch(function () { show("confirm-msg", t("network"), "error"); })
      .then(function () { $("cancel-btn").disabled = false; });
  }

  // ---- the ban appeal (0041): only shown while the account is suspended / banned, or when it has appeals ----

  function loadAppeal(justSent) {
    if (!session) return;
    call("POST", "/rest/v1/rpc/appeal_status", {}, session.access_token)
      .then(function (r) {
        var reply = rpcReply(r);
        if (!reply.ok) return;
        lastAppeal = reply.result || {};
        drawAppeal(lastAppeal);
        if (justSent) show("appeal-msg", t("appealSent"), "ok");   // keep "sent" over "under review"
      })
      .catch(function () { /* the deletion part still works */ });
  }

  // Player and team text is always set with textContent (never as HTML).
  function para(text, cls) {
    var p = document.createElement("p");
    p.textContent = text;
    if (cls) p.className = cls;
    return p;
  }

  function drawAppeal(st) {
    var r = st.restriction;
    var list = st.appeals || [];
    $("appeal").hidden = !r && list.length === 0;
    if (r) {
      var line = r.kind === "ban" || r.untilMs == null ? t("stateBan", dateText(r.fromMs)) : t("stateSuspend", dateText(r.fromMs), dateText(r.untilMs));
      if (r.reasonKey && T[lang]["reason." + r.reasonKey]) line += " " + t("stateReason", t("reason." + r.reasonKey));
      $("appeal-state").textContent = line;
    } else {
      $("appeal-state").textContent = "";
    }
    var box = $("appeal-list");
    while (box.firstChild) box.removeChild(box.firstChild);
    for (var i = 0; i < list.length; i++) {
      var a = list[i];
      var item = document.createElement("div");
      item.className = "appeal-item";
      item.appendChild(para(t("appealItem", dateText(a.createdMs)) + " — " + t("status." + a.status), "strong"));
      if (a.text) item.appendChild(para(a.text, "muted"));
      if (a.reply) item.appendChild(para(t("teamReply", a.reply)));
      box.appendChild(item);
    }
    $("appeal-form").hidden = !st.canAppeal;
    if (r && !st.canAppeal) {
      show("appeal-msg", st.open ? t("appealOpenNow") : st.waitUntilMs ? t("appealWaitUntil", dateText(st.waitUntilMs)) : "", "");
    }
    countAppeal();
  }

  function countAppeal() {
    var st = lastAppeal || {};
    var n = $("appeal-text").value.trim().length;
    $("appeal-count").textContent = t("appealCount", digits(n), digits(st.minChars || 20), digits(st.maxChars || 1000));
  }

  function sendAppeal() {
    if (!session) return;
    var text = $("appeal-text").value.trim();
    if (!text) { show("appeal-msg", t("appealEmpty"), "error"); return; }
    $("appeal-btn").disabled = true;
    show("appeal-msg", t("working"));
    call("POST", "/rest/v1/rpc/submit_appeal", { p_text: text }, session.access_token)
      .then(function (r) {
        var reply = rpcReply(r);
        if (reply.ok) {
          $("appeal-text").value = "";
          show("appeal-msg", t("appealSent"), "ok");
          loadAppeal(true);
        } else if (reply.error === "AppealWait" && reply.waitUntilMs) {
          show("appeal-msg", t("appealWaitUntil", dateText(reply.waitUntilMs)), "error");
        } else {
          show("appeal-msg", problem(reply.error), "error");
        }
      })
      .catch(function () { show("appeal-msg", t("network"), "error"); })
      .then(function () { $("appeal-btn").disabled = false; });
  }

  $("lang").addEventListener("click", function () { lang = lang === "ar" ? "en" : "ar"; applyLanguage(); });
  $("signin-form").addEventListener("submit", signIn);
  $("agree").addEventListener("change", syncAgree);
  $("delete-btn").addEventListener("click", requestDeletion);
  $("cancel-btn").addEventListener("click", cancelDeletion);
  $("appeal-text").addEventListener("input", countAppeal);
  $("appeal-btn").addEventListener("click", sendAppeal);
  applyLanguage();
  syncAgree();
  if (!cfg) show("signin-msg", t("noConfig"), "error");
})();
