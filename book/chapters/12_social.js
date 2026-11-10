/* Chapter 12 - Player & community. Facts: Docs/Systems/12_player_social.md. Every number comes from data.js through B.D().
   Wardrobe colour counts and the voice-room rules are not in the config: they are written by hand from the design notes. */
(function (B) {
  var D = B.D, N = B.N, P = B.P, H = B.H;
  var soc = D("online.social"), cl = soc.clans, fr = soc.friends, dm = soc.dm, mail = soc.mail, chat = soc.chat, lb = soc.liveBar;
  var levels = D("prestige.levels"), tasks = D("tasks"), rel = D("release"), mews = D("mews");
  var goals = D("journey.goals");
  function usd(x) { return "$" + N(x); }
  function item(id) { return D("shop.items[" + id + "].pearls"); }
  function slotsAt(l) { return Math.min(mews.maxLevelSlots, mews.baseSlots + mews.slotsPerLevel * (l - 1)); }

  /* ---- Falconer's Path: counted from the config ---- */
  var CH = [
    { id: "new_falconer", n: { ar: "الصقّار الجديد", en: "New falconer" }, ex: { ar: "اربح سباقًا، دَرِّب 3 مرات، افقس فرخًا، سمِّ مزرعتك", en: "Win a race, train 3 times, breed a chick, name your farm" } },
    { id: "first_brood", n: { ar: "أول نسل", en: "First brood" }, ex: { ar: "افقس 3 أفراخ، اربح بصقر ربيته، امتلك 4 صقور", en: "Breed 3 chicks, win with a falcon you bred, own 4 falcons" } },
    { id: "racer", n: { ar: "المضمار", en: "The racer" }, ex: { ar: "اربح 5 سباقات، سابق 25 مرة، شارك في بطولة", en: "Win 5 races, race 25 times, enter a tournament" } },
    { id: "trader", n: { ar: "سوق الصقور", en: "The trader" }, ex: { ar: "بِع 3 صقور، اشترِ 3، زر 5 قرى", en: "Sell 3 falcons, buy 3, visit 5 villages" } },
    { id: "breeder", n: { ar: "المربّي", en: "The breeder" }, ex: { ar: "امتلك هجينًا، افقس 10 أفراخ، افقس صقرًا نادرًا", en: "Own a hybrid, breed 10 chicks, breed a Rare falcon" } },
    { id: "champion", n: { ar: "البطل", en: "The champion" }, ex: { ar: "اربح 25 سباقًا، 10 مشاركات في البطولة، المستوى 5", en: "Win 25 races, 10 tournament runs, reach level 5" } },
    { id: "white_line", n: { ar: "السلالة البيضاء", en: "The white line" }, ex: { ar: "صقر أسود صلب، صقر أبيض صلب، أطلق 5 صقور", en: "A solid black falcon, a solid white falcon, release 5 falcons" } },
    { id: "master", n: { ar: "المرتبة الكبرى", en: "The highest rank" }, ex: { ar: "اربح 100 سباق، افقس صقرًا أسطوريًا، أطلق 10 صقور", en: "Win 100 races, breed a Legendary falcon, release 10 falcons" } }
  ];
  function sum(arr, k) { return arr.reduce(function (a, g) { return a + (g[k] || 0); }, 0); }
  var chRows = CH.map(function (c) { var g = goals.filter(function (x) { return x.chapter === c.id; }); return { c: c, n: g.length, coins: sum(g, "coins"), prestige: sum(g, "prestige"), pearls: sum(g, "pearls") }; });
  var TITLE = {
    "journey.title.breeder_apprentice": { ar: "مربّي ناشئ", en: "Apprentice breeder" }, "journey.title.track_rider": { ar: "فارس المضمار", en: "Track rider" },
    "journey.title.falcon_trader": { ar: "تاجر الصقور", en: "Falcon trader" }, "journey.title.falcon_breeder": { ar: "مربّي الصقور", en: "Falcon breeder" },
    "journey.title.track_champion": { ar: "بطل المضمار", en: "Track champion" }, "journey.title.white_line_keeper": { ar: "صاحب السلالة البيضاء", en: "Keeper of the white line" },
    "journey.title.master_falconer": { ar: "الصقّار الكبير", en: "Master falconer" }
  };
  var titleGoals = goals.filter(function (g) { return g.titleKey && TITLE[g.titleKey]; });

  /* ---- what each level opens (from the building gates, decorations, invites) ---- */
  var OPENS = {
    1: { ar: "البداية. التداول والكلانات والدردشة مفتوحة من المستوى 1.", en: "The start. Trading, clans and chat are open from level 1." },
    2: { ar: "الخطوة الأولى لترقية المباني. زينة: مظلة السيارة.", en: "Building upgrade step 1. Decoration: car shade." },
    3: { ar: "الخطوة الثانية للمباني. زينة: حديقة النخيل. صديقك المدعو يعطيك لآلئ عند وصوله هذا المستوى.", en: "Building upgrade step 2. Decoration: palm garden. A friend you invited pays you Pearls on reaching this level." },
    4: { ar: "الخطوة الثالثة للمباني. زينة: مخيم الضيوف.", en: "Building upgrade step 3. Decoration: guest camp." },
    5: { ar: "الخطوة الرابعة والأخيرة للمباني. زينة: الفوانيس.", en: "Building upgrade step 4, the last. Decoration: lanterns." },
    6: { ar: "زينة: بئر الماء.", en: "Decoration: water well." },
    7: { ar: "زينة: ركن القهوة. خانات المستويات تتوقف هنا.", en: "Decoration: coffee corner. The level slots stop here." }
  };
  var DAYN = [{ ar: "الأحد", en: "Sunday" }, { ar: "الاثنين", en: "Monday" }, { ar: "الثلاثاء", en: "Tuesday" }, { ar: "الأربعاء", en: "Wednesday" }, { ar: "الخميس", en: "Thursday" }, { ar: "الجمعة", en: "Friday" }, { ar: "السبت", en: "Saturday" }];
  var GUEST = { dates: { ar: "بائع التمر", en: "The date seller" }, coffee: { ar: "صانع القهوة", en: "The coffee maker" }, elder: { ar: "كبير الصقّارين", en: "The old falconer" }, shepherd: { ar: "الراعي", en: "The shepherd" }, baker: { ar: "الخبّاز", en: "The baker" }, merchant: { ar: "تاجر القماش", en: "The cloth merchant" }, neighbour: { ar: "الجار", en: "The neighbour" } };
  var TASKN = {
    ar: ["أطعم كل صقورك", "افتح سوق الصقور", "افتح صفحة صقر", "ابدأ 3 تدريبات", "سابق 3 مرات", "اربح سباقًا", "افقس فرخًا", "سابق بصقرين مختلفين", "سابق لاعبين آخرين", "بع أو اشترِ صقرًا", "زر 3 قرى"],
    en: ["Feed all your falcons", "Open the Falcon Market", "Open a falcon's page", "Start 3 training sessions", "Race 3 times", "Win a race", "Hatch a chick", "Race with two different falcons", "Race against players", "Buy or sell a falcon", "Visit 3 villages"]
  };

  B.chapter({
    id: "social", order: 12, icon: "icons/bar_friends.png",
    title: { ar: "اللاعب والمجتمع", en: "Player & community" },
    blurb: { ar: "السمعة والمستويات، مسار الصقّار، المهام، ملفك ومظهرك، الكلانات، الأصدقاء، البريد، الدردشة، الشريط الحي، والصوت.", en: "Prestige and levels, the Falconer's Path, tasks, your profile and look, clans, friends, mail, chat, the live bar and voice." },
    sections: function () {
      var lvRows = levels.map(function (p, i) { return { l: i + 1, p: p }; });
      return [
        {
          id: "prestige", title: { ar: "السمعة والمستويات", en: "Prestige and levels" },
          html: {
            ar: "<p><b>السمعة</b> هي شهرتك. لا تنقص أبدًا، ومنها يأتي <b>مستواك</b>. كل مستوى جديد يعطيك <b>" + N(D("shop.playRewards.levelUpPearls")) + " لؤلؤة</b>.</p>" +
              H.w("bars", { title: { ar: "السمعة اللازمة لكل مستوى", en: "Prestige needed for each level" }, items: lvRows.map(function (r) { return { label: { ar: "المستوى " + r.l, en: "Level " + r.l }, value: r.p, text: N(r.p) }; }), max: levels[levels.length - 1] }) +
              H.table(["المستوى", "السمعة", "خانات المستويات", "ماذا يفتح"], lvRows.map(function (r) { return [String(r.l), N(r.p), N(slotsAt(r.l)), OPENS[r.l] ? OPENS[r.l].ar : (r.l === levels.length ? "أعلى مستوى" : "—")]; })) +
              "<h3>كيف تكسب السمعة؟</h3>" +
              H.table(["المصدر", "السمعة"], [
                ["سباق ضد اللعبة (المراكز 1 / 2 / 3 / 4 / 5)", D("race.rewards").map(function (r) { return N(r.prestige); }).join(" / ") + " (ضد لاعبين حقيقيين " + N(D("race.vsPlayers.prestigeRewardPercent")) + "% منها)"],
                ["مهمة يومية (من " + N(tasks.dailyCount) + ")", N(tasks.dailyReward.prestige)],
                ["مهمة الأسبوع", N(tasks.weeklyReward.prestige)],
                ["بطولة نهاية الأسبوع (1 / 2 / 3)", D("online.tournamentPrestige").map(function (x) { return N(x); }).join(" / ")],
                ["إطلاق صقر للبرية", ["common", "good", "rare", "elite", "legendary"].map(function (t) { return B.T(B.TIER_NAMES[t]) + " " + N(rel.prestige[t]); }).join("، ") + ". كل إطلاق يعطي."],
                ["دفتر السجلات: صفحة نصفية / كاملة", N(D("record.halfPrestige")) + " / " + N(D("record.fullPrestige"))],
                ["أهداف مسار الصقّار", N(sum(goals, "prestige")) + " في المجموع"]]) +
              H.next("<b>مع تحديث 0.1.2:</b> صيدات المقناص تعطي من 1 إلى 15 سمعة، وإنقاذ صقر ضائع 15، وبطولة المقناص الأسبوعية حتى 60.") +
              "<p><b>أوسمة الإطلاق:</b> " + rel.badges.map(function (b, i) { return [["الريشة البرونزية", "الريشة الفضية", "الريشة الذهبية", "حارس البرية"][i]] + " (" + N(b.releases) + ")"; }).join("، ") + ".</p>" +
              H.tip("أطلق صقرًا للبرية لتأخذ سمعة دون أن تبيعه: النخبة تعطي " + N(rel.prestige.elite) + " والأسطوري " + N(rel.prestige.legendary) + "."),
            en: "<p><b>Prestige</b> is your reputation. It never goes down, and your <b>level</b> comes from it. Each new level gives you <b>" + N(D("shop.playRewards.levelUpPearls")) + " Pearls</b>.</p>" +
              H.w("bars", { title: { ar: "السمعة اللازمة لكل مستوى", en: "Prestige needed for each level" }, items: lvRows.map(function (r) { return { label: { ar: "المستوى " + r.l, en: "Level " + r.l }, value: r.p, text: N(r.p) }; }), max: levels[levels.length - 1] }) +
              H.table(["Level", "Prestige", "Slots from levels", "What it opens"], lvRows.map(function (r) { return [String(r.l), N(r.p), N(slotsAt(r.l)), OPENS[r.l] ? OPENS[r.l].en : (r.l === levels.length ? "The top level" : "—")]; })) +
              "<h3>How do you earn prestige?</h3>" +
              H.table(["Source", "Prestige"], [
                ["A race against the game (places 1 / 2 / 3 / 4 / 5)", D("race.rewards").map(function (r) { return N(r.prestige); }).join(" / ") + " (" + N(D("race.vsPlayers.prestigeRewardPercent")) + "% of that against real players)"],
                ["A daily task (of " + N(tasks.dailyCount) + ")", N(tasks.dailyReward.prestige)],
                ["The weekly task", N(tasks.weeklyReward.prestige)],
                ["The weekend tournament (1 / 2 / 3)", D("online.tournamentPrestige").map(function (x) { return N(x); }).join(" / ")],
                ["Releasing a falcon to the wild", ["common", "good", "rare", "elite", "legendary"].map(function (t) { return B.T(B.TIER_NAMES[t]) + " " + N(rel.prestige[t]); }).join(", ") + ". Every release pays."],
                ["Record book page, half / full", N(D("record.halfPrestige")) + " / " + N(D("record.fullPrestige"))],
                ["Falconer's Path goals", N(sum(goals, "prestige")) + " in all"]]) +
              H.next("<b>With update 0.1.2:</b> hunting kills give 1 to 15 prestige, rescuing a lost falcon 15, and the weekly hunting tournament up to 60.") +
              "<p><b>Release badges:</b> " + rel.badges.map(function (b, i) { return ["Bronze feather", "Silver feather", "Golden feather", "Guardian of the wild"][i] + " (" + N(b.releases) + ")"; }).join(", ") + ".</p>" +
              H.tip("Release a falcon to the wild to earn prestige without selling it: an Elite gives " + N(rel.prestige.elite) + " and a Legendary " + N(rel.prestige.legendary) + ".")
          }
        },
        {
          id: "path", title: { ar: "مسار الصقّار", en: "The Falconer's Path" },
          html: {
            ar: "<p>قائمة أهداف بمكافآت، في <b>" + N(CH.length) + " فصول</b> و<b>" + N(goals.length) + " هدفًا</b>. المجموع: <b>" + N(sum(goals, "coins")) + "</b> عملة و<b>" + N(sum(goals, "prestige")) + "</b> سمعة و<b>" + N(sum(goals, "pearls")) + "</b> لؤلؤة، إضافة إلى ألقاب.</p>" +
              H.table(["الفصل", "الأهداف", "عملات", "سمعة", "لآلئ", "أمثلة"], chRows.map(function (r, i) { return [(i + 1) + ". " + r.c.n.ar, N(r.n), N(r.coins), N(r.prestige), N(r.pearls), r.c.ex.ar]; })) +
              H.w("bars", { title: { ar: "السمعة في كل فصل", en: "Prestige in each chapter" }, items: chRows.map(function (r, i) { return { label: { ar: (i + 1) + ". " + r.c.n.ar, en: (i + 1) + ". " + r.c.n.en }, value: r.prestige, text: N(r.prestige) }; }) }) +
              "<p>الألقاب: " + titleGoals.map(function (g) { return B.T(TITLE[g.titleKey]) + " (" + N(g.pearls) + " لآلئ)"; }).join("، ") + ".</p>" +
              "<ul><li>الأهداف التي تحتاج الإنترنت تُتخطى إن لعبت دون اتصال.</li><li>الفصلان 7 و8 يعطيان أعلى سمعة.</li></ul>",
            en: "<p>A list of goals with rewards, in <b>" + N(CH.length) + " chapters</b> and <b>" + N(goals.length) + " goals</b>. In total: <b>" + N(sum(goals, "coins")) + "</b> coins, <b>" + N(sum(goals, "prestige")) + "</b> prestige and <b>" + N(sum(goals, "pearls")) + "</b> Pearls, plus titles.</p>" +
              H.table(["Chapter", "Goals", "Coins", "Prestige", "Pearls", "Examples"], chRows.map(function (r, i) { return [(i + 1) + ". " + r.c.n.en, N(r.n), N(r.coins), N(r.prestige), N(r.pearls), r.c.ex.en]; })) +
              H.w("bars", { title: { ar: "السمعة في كل فصل", en: "Prestige in each chapter" }, items: chRows.map(function (r, i) { return { label: { ar: (i + 1) + ". " + r.c.n.ar, en: (i + 1) + ". " + r.c.n.en }, value: r.prestige, text: N(r.prestige) }; }) }) +
              "<p>Titles: " + titleGoals.map(function (g) { return B.T(TITLE[g.titleKey]) + " (" + N(g.pearls) + " Pearls)"; }).join(", ") + ".</p>" +
              "<ul><li>Goals that need the internet are skipped when you play offline.</li><li>Chapters 7 and 8 pay the most prestige.</li></ul>"
          }
        },
        {
          id: "tasks", title: { ar: "المهام اليومية والأسبوعية", en: "Daily and weekly tasks" },
          html: {
            ar: H.kpis([[N(tasks.dailyCount), "مهام كل يوم"], [N(tasks.dailyReward.coins), "عملة لكل مهمة"], ["+" + N(tasks.allDoneBonus.coins), "عند إنهائها كلها"], [N(D("shop.playRewards.dailyTasksPearls")), "لآلئ عند إنهائها كلها"]]) +
              H.table(["القاعدة", "التفاصيل"], [
                ["كل مهمة", N(tasks.dailyReward.coins) + " عملة + " + N(tasks.dailyReward.prestige) + " سمعة. المهام جديدة كل يوم خليجي."],
                ["التبديل", N(tasks.rerollsPerDay) + " في اليوم (وأكثر مع مبنى البريد)"],
                ["مهمة الأسبوع", "اربح 10 سباقات، أو سابق 25 مرة، أو درّب 15 مرة. الجائزة " + N(tasks.weeklyReward.coins) + " عملة + " + N(tasks.weeklyReward.prestige) + " سمعة."],
                ["السلسلة", "كل " + N(tasks.streak.rewardEveryDays) + " أيام متتالية: " + N(tasks.streak.coins) + " عملة + " + N(tasks.streak.pearls) + " لآلئ. يُغفر لك غياب يوم (حتى " + N(tasks.streak.missFallbackDays) + " أيام)."]]) +
              "<h3>مهام اليوم تُختار من:</h3><ul>" + TASKN.ar.map(function (t) { return "<li>" + t + "</li>"; }).join("") + "</ul>" +
              H.info("إنهاء المهام الست كلها = " + N(tasks.dailyCount * tasks.dailyReward.coins + tasks.allDoneBonus.coins) + " عملة و" + N(tasks.dailyCount * tasks.dailyReward.prestige) + " سمعة و" + N(D("shop.playRewards.dailyTasksPearls")) + " لآلئ. القواعد نفسها لكل لاعب.") +
              H.shots([["village/tasks", "نافذة المهام والطريق"]]),
            en: H.kpis([[N(tasks.dailyCount), "tasks every day"], [N(tasks.dailyReward.coins), "coins for each task"], ["+" + N(tasks.allDoneBonus.coins), "for finishing them all"], [N(D("shop.playRewards.dailyTasksPearls")), "Pearls for finishing them all"]]) +
              H.table(["Rule", "Details"], [
                ["Each task", N(tasks.dailyReward.coins) + " coins + " + N(tasks.dailyReward.prestige) + " prestige. New tasks every Gulf day."],
                ["Rerolls", N(tasks.rerollsPerDay) + " a day (more with the Inbox building)"],
                ["The weekly task", "Win 10 races, or race 25 times, or train 15 times. The prize is " + N(tasks.weeklyReward.coins) + " coins + " + N(tasks.weeklyReward.prestige) + " prestige."],
                ["The streak", "Every " + N(tasks.streak.rewardEveryDays) + " days in a row: " + N(tasks.streak.coins) + " coins + " + N(tasks.streak.pearls) + " Pearls. A missed day is forgiven (up to " + N(tasks.streak.missFallbackDays) + " days)."]]) +
              "<h3>Today's tasks are picked from:</h3><ul>" + TASKN.en.map(function (t) { return "<li>" + t + "</li>"; }).join("") + "</ul>" +
              H.info("Finishing all six = " + N(tasks.dailyCount * tasks.dailyReward.coins + tasks.allDoneBonus.coins) + " coins, " + N(tasks.dailyCount * tasks.dailyReward.prestige) + " prestige and " + N(D("shop.playRewards.dailyTasksPearls")) + " Pearls. The rules are the same for every player.") +
              H.shots([["village/tasks", "The Tasks and Path window"]])
          }
        },
        {
          id: "evening", title: { ar: "المساء في المجلس", en: "Evening in the Majlis" },
          html: {
            ar: "<p>كل يوم من الساعة " + N(D("evening.startHour")) + ":00 إلى 24:00 يزور نارك ضيف ومعه هدية. الضيف بحسب اليوم:</p>" +
              H.table(["اليوم", "الضيف", "الهدية"], D("evening.guests").map(function (g) { return [B.T(DAYN[g.weekday]), B.T(GUEST[g.id]), g.kind === "coins" ? N(g.amount) + " عملة" : "+" + N(g.amount) + " شبع"]; })) +
              H.tip("مبنى المجلس يكبّر الهدايا: +25% و+50% و+75% و+100% في مستوياته. وهدية الجمعة (" + N(D("evening.guests[5].amount")) + " عملة) تصل إلى " + N(Math.floor(D("evening.guests[5].amount") * 2)) + " عند المستوى الأخير."),
            en: "<p>Every day from " + N(D("evening.startHour")) + ":00 to 24:00 a guest visits your fire with a gift. The guest depends on the day:</p>" +
              H.table(["Day", "Guest", "Gift"], D("evening.guests").map(function (g) { return [B.T(DAYN[g.weekday]), B.T(GUEST[g.id]), g.kind === "coins" ? N(g.amount) + " coins" : "+" + N(g.amount) + " satiety"]; })) +
              H.tip("The Majlis building makes the gifts bigger: +25%, +50%, +75% and +100% at its levels. The Friday gift (" + N(D("evening.guests[5].amount")) + " coins) reaches " + N(Math.floor(D("evening.guests[5].amount") * 2)) + " at the top level.")
          }
        },
        {
          id: "profile", title: { ar: "ملفك والمظهر", en: "Your profile and look" },
          html: {
            ar: "<p>ملفك العام يُري: اسمك وبلدك ومستواك وسمعتك وقسمك وصقورك المطلقة وكؤوسك وكلانك وVIP وأفضل صقر عندك (الجينات المخفية لا تظهر).</p>" +
              H.table(["الشيء", "التفاصيل"], [
                ["نبذة عني", N(soc.profile.aboutMaxChars) + " حرفًا، مفلترة. خاصة افتراضيًا."],
                ["الصورة", "ترفع صورتك بنفسك، حتى " + N(D("online.avatar.maxChangesPerDay")) + " تغييرات في اليوم. الصورة المسيئة تعني حظرًا."],
                ["تغيير الاسم", "بطاقة صقر " + N(item("card_rename_falcon")) + " لؤلؤة، لاعب " + N(item("card_rename_player")) + "، مزرعة " + N(item("card_rename_farm")) + ". أول تغيير مجاني."],
                ["البلد", "تختاره مرة واحدة ولا يتغير."]]) +
              H.shots([["profile/profile_top", "ملفك الشخصي"], ["profile/profile_cabinet", "خزانة الكؤوس والأوسمة"]]) +
              "<h3>الخزانة: صقّارك يلبس أربع قطع</h3>" +
              H.table(["القطعة", "الأنواع", "ألوان مجانية", "طقم ألوان مميز"], [
                ["الكندورة", "إماراتية، سعودية، قطرية، عُمانية", "16", "الملكية (6 ألوان): " + N(item("colours_kandura_royal")) + " لؤلؤة"],
                ["غطاء الرأس", "غترة إماراتية، حمدانية، كمّة عمانية، مصر عماني", "12", "الغتر الفاخرة (5 ألوان): " + N(item("colours_ghutra_prestige")) + " لؤلؤة"],
                ["الدس (القفاز)", "كلاسيكي، واقي، سدو، مطرّز", "جلد 16، خيط 12، معدن 4", "الدس الفاخر: " + N(item("colours_glove_master")) + " لؤلؤة"],
                ["النعال", "كلاسيكي، زبيري، شرقي", "12", "النعال الفاخرة (4 ألوان): " + N(item("colours_sandal_fine")) + " لؤلؤة"],
                ["معدن الحلقة والدس", "معادن", "4", "المعادن الثمينة (ذهب وردي، بلاتين، كروم أسود): " + N(item("colours_metal_precious")) + " لؤلؤة"],
                ["البرقع والتلواح والمجلس", "أشكال", "أشكال مجانية", "البرقع الملكي " + N(item("colours_hood_royal")) + "، تلواح الأبطال " + N(item("colours_lure_champion")) + "، المجلس الملكي أو المسائي " + N(item("theme_majlis_royal")) + " لؤلؤة"]]) +
              "<ul><li>اختيار اللون الأصلي لأي منطقة مجاني.</li><li><b>العلامة التجارية للمزرعة</b> (" + N(item("farm_brand")) + " لؤلؤة) تضع حلقة مزرعتك على أرجل صقورك، وتبقى الحلقة إذا بيع الصقر.</li></ul>" +
              H.shots([["falcon/falconer_01_whole", "صقّارك"], ["falcon/falconer_02_glove", "اختيار الدس"], ["falcon/falconer_03_sandals", "اختيار النعال"]]),
            en: "<p>Your public profile shows: your name, country, level, prestige, division, released falcons, trophies, clan, VIP and your best falcon (hidden genes stay hidden).</p>" +
              H.table(["Item", "Details"], [
                ["About me", N(soc.profile.aboutMaxChars) + " letters, filtered. Private by default."],
                ["Photo", "You upload your own photo, up to " + N(D("online.avatar.maxChangesPerDay")) + " changes a day. An offensive picture means a ban."],
                ["Renaming", "Falcon card " + N(item("card_rename_falcon")) + " Pearls, player " + N(item("card_rename_player")) + ", farm " + N(item("card_rename_farm")) + ". The first rename is free."],
                ["Country", "You choose it once and it cannot be changed."]]) +
              H.shots([["profile/profile_top", "Your profile"], ["profile/profile_cabinet", "The trophy and badge cabinet"]]) +
              "<h3>The wardrobe: your falconer wears four parts</h3>" +
              H.table(["Part", "Types", "Free colours", "Premium colour set"], [
                ["Kandura", "Emirati, Saudi, Qatari, Omani", "16", "Royal (6 colours): " + N(item("colours_kandura_royal")) + " Pearls"],
                ["Headwear", "Emirati ghutra, Hamdaniah, Omani kumma, Omani massar", "12", "Prestige ghutra (5 colours): " + N(item("colours_ghutra_prestige")) + " Pearls"],
                ["Glove (dass)", "Classic, Gauntlet, Sadu, Embroidered", "leather 16, thread 12, metal 4", "Master glove: " + N(item("colours_glove_master")) + " Pearls"],
                ["Sandals", "Classic, Zubairi, Sharqi", "12", "Fine sandals (4 colours): " + N(item("colours_sandal_fine")) + " Pearls"],
                ["Ring and glove metal", "Metals", "4", "Precious metal (rose gold, platinum, black chrome): " + N(item("colours_metal_precious")) + " Pearls"],
                ["Hood, lure, Majlis", "Looks", "free looks", "Royal Hood " + N(item("colours_hood_royal")) + ", Champion Lure " + N(item("colours_lure_champion")) + ", Royal or Night Majlis theme " + N(item("theme_majlis_royal")) + " Pearls"]]) +
              "<ul><li>Choosing the original colour of any zone is free.</li><li>The <b>Farm Brand</b> (" + N(item("farm_brand")) + " Pearls) puts your farm ring on the legs of your falcons. The ring stays when the falcon is sold.</li></ul>" +
              H.shots([["falcon/falconer_01_whole", "Your falconer"], ["falcon/falconer_02_glove", "Choosing the glove"], ["falcon/falconer_03_sandals", "Choosing the sandals"]])
          }
        },
        {
          id: "clans", title: { ar: "الكلانات (كلان)", en: "Clans (كلان)" },
          html: {
            ar: "<p>الكلان فريق من اللاعبين تتسابقون باسمه وتتنافسون على لوحة الكلانات. كلمته في اللعبة دائمًا <b>كلان</b>.</p>" +
              H.kpis([[N(cl.createPearls), "لؤلؤة لإنشاء كلان"], [N(cl.levels[0].maxMembers) + "–" + N(cl.levels[cl.levels.length - 1].maxMembers), "عدد الأعضاء بحسب المستوى"], ["1", "كلان لكل لاعب"]]) +
              H.table(["القاعدة", "التفاصيل"], [
                ["الإنشاء", N(cl.createPearls) + " لؤلؤة (بلا عملات)، من المستوى " + N(cl.createLevel)],
                ["الاسم والرمز والوصف", N(cl.nameMinLen) + " إلى " + N(cl.nameMaxLen) + " حرفًا / " + N(cl.tagMinLen) + " إلى " + N(cl.tagMaxLen) + " / " + N(cl.descMaxLen) + " حرفًا"],
                ["الشارة", N(cl.emblems) + " شعارًا، " + N(cl.colors) + " ألوان، " + N(cl.badgeShapes) + " أشكال، " + N(cl.badgeSymbols) + " رمزًا، " + N(cl.badgeBorders) + " حدود"],
                ["حد أدنى للمستوى", "يستطيع الكلان أن يطلب مستوى حتى " + N(cl.minLevelMax)],
                ["الأدوار", "قائد، نائب قائد، شيخ، عضو"],
                ["المغادرة", "تنتظر " + N(cl.leaveCooldownH) + " ساعة قبل الانضمام لكلان آخر"],
                ["الطرد", "لا تعود لنفس الكلان قبل " + N(cl.rejoinAfterKickD) + " أيام"],
                ["القائد الغائب", "بعد " + N(cl.inactiveLeaderD) + " يومًا تنتقل القيادة"],
                ["طلبات الانضمام", "تنتهي بعد " + N(cl.requestExpiryD) + " يومًا"],
                ["دردشة الكلان", "للأعضاء فقط، وتُحفظ " + N(cl.chatRetentionDays) + " يومًا"],
                ["نقاط الكلان", "من نقاط السباقات ضد اللاعبين. بعد " + N(cl.points.minDaysInClan) + " أيام في الكلان يضيف كل عضو حتى " + N(cl.points.perMemberPerDay) + " نقطة في اليوم."]]) +
              H.w("bars", { title: { ar: "نقاط كل مستوى للكلان", en: "Points for each clan level" }, items: cl.levels.map(function (l) { return { label: { ar: "المستوى " + l.level + " (حتى " + l.maxMembers + " عضوًا)", en: "Level " + l.level + " (up to " + l.maxMembers + " members)" }, value: Math.max(l.pointsNeeded, 1), text: N(l.pointsNeeded) }; }) }) +
              "<p>راية الكلان تظهر في قريتك، وترتيب الكلانات (هذا الأسبوع وكل الأوقات) في ساحة الأبطال.</p>" +
              H.shots([["majlis/clan_none", "ليس لك كلان بعد: أنشئ أو ابحث"], ["majlis/clan_member", "كلانك وأعضاؤه"]]) +
              H.tip("نقاط الكلان تأتي فقط من سباقات اللاعبين الحقيقيين، فسابق لاعبين لتكبّر كلانك."),
            en: "<p>A clan is a team of players who race under its name and compete on the Clans board. The game's word for it is always <b>كلان</b> (clan).</p>" +
              H.kpis([[N(cl.createPearls), "Pearls to create a clan"], [N(cl.levels[0].maxMembers) + "–" + N(cl.levels[cl.levels.length - 1].maxMembers), "members, by clan level"], ["1", "clan per player"]]) +
              H.table(["Rule", "Details"], [
                ["Creating", N(cl.createPearls) + " Pearls (no coins), from level " + N(cl.createLevel)],
                ["Name, tag, description", N(cl.nameMinLen) + " to " + N(cl.nameMaxLen) + " letters / " + N(cl.tagMinLen) + " to " + N(cl.tagMaxLen) + " / " + N(cl.descMaxLen) + " letters"],
                ["Badge", N(cl.emblems) + " emblems, " + N(cl.colors) + " colours, " + N(cl.badgeShapes) + " shapes, " + N(cl.badgeSymbols) + " symbols, " + N(cl.badgeBorders) + " borders"],
                ["Minimum level", "A clan can ask for a player level up to " + N(cl.minLevelMax)],
                ["Roles", "Leader, Co-leader, Elder, Member"],
                ["Leaving", "You wait " + N(cl.leaveCooldownH) + " hours before joining another clan"],
                ["Being kicked", "You cannot rejoin that clan for " + N(cl.rejoinAfterKickD) + " days"],
                ["An absent leader", "After " + N(cl.inactiveLeaderD) + " days the leadership passes on"],
                ["Join requests", "They expire after " + N(cl.requestExpiryD) + " days"],
                ["Clan chat", "Members only, kept " + N(cl.chatRetentionDays) + " days"],
                ["Clan points", "From race points in races against players. After " + N(cl.points.minDaysInClan) + " days in the clan, each member adds up to " + N(cl.points.perMemberPerDay) + " points a day."]]) +
              H.w("bars", { title: { ar: "نقاط كل مستوى للكلان", en: "Points for each clan level" }, items: cl.levels.map(function (l) { return { label: { ar: "المستوى " + l.level + " (حتى " + l.maxMembers + " عضوًا)", en: "Level " + l.level + " (up to " + l.maxMembers + " members)" }, value: Math.max(l.pointsNeeded, 1), text: N(l.pointsNeeded) }; }) }) +
              "<p>A clan banner appears in your village, and the clan rankings (this week, all time) are in the Hall of Champions.</p>" +
              H.shots([["majlis/clan_none", "No clan yet: create one or search"], ["majlis/clan_member", "Your clan and its members"]]) +
              H.tip("Clan points come only from races against real players, so race real players to grow your clan.")
          }
        },
        {
          id: "friends", title: { ar: "الأصدقاء والرسائل والبريد", en: "Friends, messages and mail" },
          html: {
            ar: "<h3>الأصدقاء</h3>" +
              H.table(["القاعدة", "القيمة"], [
                ["أقصى عدد أصدقاء", N(fr.max)], ["طلبات معلقة تستقبلها", N(fr.pendingIn)], ["طلبات صداقة في اليوم", N(fr.requestsPerDay)],
                ["تنتهي الطلبات بعد", N(fr.requestExpiryDays) + " يومًا"], ["بعد رفض طلبك", "تنتظر " + N(fr.refusalWaitDays) + " أيام، وبعد " + N(fr.maxRefusals) + " رفضات يتوقف الطلب"],
                ["\"متصل\" إن شوهد خلال", N(fr.onlineWindowS) + " ثانية"]]) +
              "<h3>الرسائل الخاصة</h3><p>الرسالة حتى " + N(dm.maxLen) + " حرفًا، وبين الرسائل " + N(dm.minGapS) + " ثانيتان. حتى " + N(dm.perMin) + " في الدقيقة و" + N(dm.perDay) + " في اليوم، و" + N(dm.newThreadsPerDay) + " محادثات جديدة في اليوم. تُحفظ " + N(dm.retentionDays) + " يومًا، وتستطيع الرد خلال " + N(dm.replyWindowDays) + " يومًا.</p>" +
              "<h3>البريد</h3>" +
              H.table(["القاعدة", "القيمة"], [
                ["بريد الترحيب", N(mail.welcomeCoins) + " عملة"], ["البريد الشخصي يبقى", N(mail.personalExpiryDays) + " يومًا"], ["بريد حملات الفريق", N(mail.campaignExpiryDays) + " يومًا"],
                ["صندوق البريد", N(mail.maxStored) + " رسالة. المقروءة تُنظَّف بعد " + N(mail.expiredKeepDays) + " أيام"],
                ["ما قد يحمله بريد الفريق", "عملات، أو صقر عادي، أو حزمة"], ["الهدايا المجانية في البريد", "تُدفع مرة لكل جهاز"]]) +
              H.next("زر \"اقرأ الكل\" في البريد يصل مع تحديث 0.1.2.") +
              H.shots([["majlis/friends", "الأصدقاء في المجلس"], ["majlis/friends_requests", "طلبات الصداقة"], ["majlis/dm_thread", "محادثة خاصة"]]),
            en: "<h3>Friends</h3>" +
              H.table(["Rule", "Value"], [
                ["Most friends", N(fr.max)], ["Waiting requests you can hold", N(fr.pendingIn)], ["Friend requests a day", N(fr.requestsPerDay)],
                ["Requests expire after", N(fr.requestExpiryDays) + " days"], ["After a refusal", "You wait " + N(fr.refusalWaitDays) + " days, and after " + N(fr.maxRefusals) + " refusals the request stops"],
                ["\"Online\" if seen within", N(fr.onlineWindowS) + " seconds"]]) +
              "<h3>Private messages</h3><p>A message is up to " + N(dm.maxLen) + " letters, with " + N(dm.minGapS) + " seconds between messages. Up to " + N(dm.perMin) + " a minute and " + N(dm.perDay) + " a day, and " + N(dm.newThreadsPerDay) + " new chats a day. They are kept " + N(dm.retentionDays) + " days, and you can reply for " + N(dm.replyWindowDays) + " days.</p>" +
              "<h3>Mail</h3>" +
              H.table(["Rule", "Value"], [
                ["Welcome mail", N(mail.welcomeCoins) + " coins"], ["Personal mail lasts", N(mail.personalExpiryDays) + " days"], ["Team campaign mail", N(mail.campaignExpiryDays) + " days"],
                ["Mailbox", N(mail.maxStored) + " mails. Read mails are cleaned after " + N(mail.expiredKeepDays) + " days"],
                ["Mail from the team can carry", "coins, a Common falcon, or a pack"], ["Free gifts in mail", "Paid once per device"]]) +
              H.next("A \"Read all\" button in the mail arrives with update 0.1.2.") +
              H.shots([["majlis/friends", "Friends in the Majlis"], ["majlis/friends_requests", "Friend requests"], ["majlis/dm_thread", "A private chat"]])
          }
        },
        {
          id: "chat", title: { ar: "غرف الدردشة", en: "Chat rooms" },
          html: {
            ar: "<p>لكل دولة خليجية غرفة (الإمارات، السعودية، الكويت، قطر، البحرين، عُمان)، وغرفة <b>الأخبار</b> يكتب فيها الفريق فقط.</p>" +
              H.table(["القاعدة", "القيمة"], [
                ["طول الرسالة", N(chat.maxLen) + " حرفًا"], ["السرعة", N(chat.minGapS) + " ثوانٍ بين الرسائل، " + N(chat.perMin) + " في الدقيقة، " + N(chat.perDay) + " في اليوم"],
                ["الرسالة نفسها مرة أخرى", "تُمنع " + N(chat.dupWindowS) + " ثانية"], ["مدة الحفظ", N(chat.retentionDays) + " أيام"],
                ["غرفة الأخبار", "رسالة حتى " + N(chat.news.maxLen) + " حرف، تُحفظ " + N(chat.news.retentionDays) + " يومًا، وحتى " + N(chat.news.pinnedMax) + " مثبتة"],
                ["المرشّح", "الكلمات السيئة والروابط وأرقام الهواتف وتطبيقات التواصل تُحجب أو تُخفى"]]) +
              H.info("<b>مبايعة:</b> كلام البيع والشراء في «الكل» تنقله اللعبة إلى غرفة السوق (انظر فصل السوق).") +
              H.next("<b>في تحديث قادم:</b> <b>الرد والإشارة.</b> اضغط سطرًا واختر <b>رد</b>: يظهر في رسالتك اقتباس صغير من الأصل، وبالضغط عليه تقفز إليه. وزر <b>@</b> يفتح قائمة اللاعبين في الغرفة لتشير إلى لاعب (حتى 3 أسماء في السطر): يرى اسمه ذهبيًا ويصله إشعار واحد. يعمل في كل الغرف والرسائل الخاصة ودردشة السباق.") +
              H.next("<b>دردشة السباق (0.1.2):</b> غرفة لمتسابقي سباق مباشر واحد فقط. تُفتح عند المطابقة وتُغلق حين يغادر آخر متسابق (أو بعد 10 دقائق من السباق)، وتُحفظ سطورها 7 أيام. يُشغّلها الفريق عند الإصدار.") +
              H.tip("لا تكتب أرقام هواتف أو روابط أو حسابات تواصل في الدردشة: المرشّح يحجبها.") +
              H.shots([["majlis/chat_rooms", "غرف الدردشة"], ["majlis/chat_news", "غرفة الأخبار"]]),
            en: "<p>Each Gulf country has a room (UAE, Saudi Arabia, Kuwait, Qatar, Bahrain, Oman), plus the <b>News</b> room where only the team writes.</p>" +
              H.table(["Rule", "Value"], [
                ["Message length", N(chat.maxLen) + " letters"], ["Speed", N(chat.minGapS) + " seconds between messages, " + N(chat.perMin) + " a minute, " + N(chat.perDay) + " a day"],
                ["The same message again", "Blocked for " + N(chat.dupWindowS) + " seconds"], ["Kept", N(chat.retentionDays) + " days"],
                ["The News room", "Up to " + N(chat.news.maxLen) + " letters, kept " + N(chat.news.retentionDays) + " days, up to " + N(chat.news.pinnedMax) + " pinned"],
                ["Filter", "Bad words, links, phone numbers and contact apps are blocked or masked"]]) +
              H.info("<b>Trade talk:</b> buy and sell lines written in All are moved by the game to the Market room (see the Market chapter).") +
              H.next("<b>In a coming update:</b> <b>Reply and mention.</b> Tap a line and choose <b>Reply</b>: your message shows a small quote of the original, and a tap on it jumps there. The <b>@</b> button opens a list of the players in the room so you can mention one (up to 3 names a line): he sees his name in gold and gets one notice. It works in every room, in private messages and in the race chat.") +
              H.next("<b>Race chat (0.1.2):</b> a room for the real racers of one live race only. It opens at the match and closes when the last racer leaves (or 10 minutes after the race), and its lines are kept 7 days. The team switches it on at the release.") +
              H.tip("Never put phone numbers, links or social handles in chat: the filter blocks them.") +
              H.shots([["majlis/chat_rooms", "The chat rooms"], ["majlis/chat_news", "The News room"]])
          }
        },
        {
          id: "livebar", title: { ar: "الشريط الحي والنداء", en: "The live bar and the Shout" },
          html: {
            ar: "<p>شريط رفيع متحرك في أعلى كل شاشة (ما عدا السباقات). تمر عليه رسائل اللاعبين وإعلانات الفريق، وإعلانات الفريق ذهبية.</p>" +
              H.kpis([[N(item("card_shout")), "لؤلؤة لبطاقة النداء"], [N(lb.maxLen), "حرفًا للرسالة"], [N(lb.shoutCooldownMin) + " د", "بين نداءين من لاعب"]]) +
              "<ul><li>الرسالة تمر مرتين، " + N(lb.showSeconds) + " ثانية لكل مرة. الطابور حتى " + N(lb.queueMax) + ".</li><li>تظهر صورتك المستديرة واسمك ورسالتك.</li><li>المرشّح نفسه كالدردشة، والنص المرفوض لا يستهلك البطاقة.</li><li>بطاقة النداء لا تُهدى.</li></ul>" +
              H.next("<b>مع تحديث 0.1.2:</b> بطاقة النداء في اللعبة، وسطر ذهبي يعلن اصطياد حبارى أو خرب لمدة 60 دقيقة."),
            en: "<p>A thin moving bar at the top of every screen (not in races). Player messages and team announcements pass along it, and team announcements are gold.</p>" +
              H.kpis([[N(item("card_shout")), "Pearls for a Shout card"], [N(lb.maxLen), "letters per message"], [N(lb.shoutCooldownMin) + " min", "between two shouts by a player"]]) +
              "<ul><li>A message moves across twice, " + N(lb.showSeconds) + " seconds each time. The queue holds up to " + N(lb.queueMax) + ".</li><li>It shows your round picture, name and message.</li><li>The same filter as chat applies, and a refused text does not use the card.</li><li>The Shout card cannot be gifted.</li></ul>" +
              H.next("<b>With update 0.1.2:</b> the Shout card in the game, and a gold line announcing a houbara or khurb catch for 60 minutes.")
          }
        },
        {
          id: "fair-play", title: { ar: "قواعد اللعب النظيف", en: "Fair-play rules" },
          html: {
            ar: "<p>اللعبة لكل لاعب بالقواعد نفسها. هذه قاعدة مهمة:</p>" +
              H.warn("<b>حساب واحد لكل جهاز.</b> التبادل بين حساباتك أنت يُصفّر العملات، والحسابات الزائدة تُحذف ويبقى الحساب الأخير استخدامًا.") +
              H.tip("تريد أن تعطي صديقًا صقرًا؟ بعه بيعًا عاديًا بقواعد السوق."),
            en: "<p>The game is the same for every player. One rule matters a lot:</p>" +
              H.warn("<b>One account per device.</b> Trading between your own accounts sets the coins to 0, and extra accounts are deleted. The last-used account is kept.") +
              H.tip("Want to give a friend a falcon? Sell it the normal way under the market's rules.")
          }
        },
        {
          id: "voice", title: { ar: "الدردشة الصوتية (VIP)", en: "Voice chat (VIP)" },
          html: {
            ar: H.next("<b>تصل مع تحديث 0.1.2</b>، ويشغّلها الفريق بعد الإصدار بأيام. <b>الصوت لأعضاء VIP فقط</b>، للتحدث وللاستماع.") +
              H.table(["الخاصية", "كيف تعمل"], [
                ["غرفة بكود خاص", "تنشئ غرفة وتعطي الكود لأصدقائك فقط. حتى <b>5</b> لاعبين."],
                ["مدة الكود", "تختارها: 10 دقائق أو ساعة أو 24 ساعة. لا أحد يُطرد من الداخل."],
                ["ميكروفون المقناص", "زر ميكروفون في الصحراء. يبدأ مكتومًا، ويسمعه من في صحراءك فقط."],
                ["ميكروفون السباق", "في سباق التلواح. يبدأ مكتومًا، ويسمعه متسابقو السباق نفسه (حتى 5)."],
                ["القرية", "لا ميكروفون مفتوح. غرف الكود الخاصة فقط."],
                ["مفتاح \"الصوت مع الغرباء\"", "في الإعدادات، مطفأ افتراضيًا. يشمل ميكروفوني المقناص والسباق."],
                ["من يتكلم", "شارة شفافة تُري المتكلم، وقائمة بالجميع فيها كتم وإبلاغ."],
                ["الإبلاغ", "كل غرفة تحتفظ بآخر 10 دقائق من الصوت وتمسحها أولًا بأول. عند الإبلاغ تذهب هذه الدقائق للفريق. وبلا إبلاغ لا يُحفظ شيء."],
                ["سباق مع الأصدقاء", "سباق تلواح عادي لـ 2 إلى 5 لاعبين بكود. خاص ولا يُحسب في الترتيب أو البطولات. الجوائز كسباق ضد اللعبة. يستطيع الجميع دخول السباق، والميكروفون فقط لـ VIP."]]),
            en: H.next("<b>Arrives with update 0.1.2</b>, and the team switches it on some days after the release. <b>Voice is for VIP members only</b>, to talk and to listen.") +
              H.table(["Feature", "How it works"], [
                ["Private code room", "You make a room and give the code to friends only. Up to <b>5</b> players."],
                ["Code valid for", "You choose: 10 minutes, 1 hour or 24 hours. Nobody inside is kicked."],
                ["Hunting mic", "A mic button in the desert. It starts muted, and only players in the same desert hear it."],
                ["Race mic", "In a lure race. It starts muted, and only the racers of that race (up to 5) hear it."],
                ["Village", "No open mic. Private code rooms only."],
                ["The \"voice with strangers\" switch", "In Settings, OFF by default. It covers the hunting and race mics."],
                ["Who is talking", "A see-through tag shows the speaker, and a list of everyone has Mute and Report."],
                ["Reports", "Each room keeps the last 10 minutes of audio and deletes it as it goes. When a player reports, those 10 minutes go to the team. With no report nothing is kept."],
                ["Race with friends", "A normal lure race for 2 to 5 players with a code. Private, and not counted in rankings or tournaments. Prizes are the same as the race against the game. Everyone can join the race; only the mic is VIP."]])
          }
        }
      ];
    }
  });
})(window.Book);
