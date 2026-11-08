/* Chapter 5 - Training. Facts: Docs/Systems/05_training.md. Every number comes from data.js through B.D(). */
(function (B) {
  var D = B.D, N = B.N, P = B.P, H = B.H;

  B.chapter({
    id: "training", order: 5, icon: "icons/lure.png",
    title: { ar: "التدريب", en: "Training" },
    blurb: { ar: "رحلة التلواح في الصحراء: نوافذ الضغط، المكافآت، الحدود اليومية، وكم يمكن أن يضيف التدريب.", en: "The lure desert trip: timing windows, rewards, daily limits, and how much training can add." },
    sections: function () {
      var t = D("training"), lg = D("lureGame"), lure = D("training.sessions[lure]"), tb = D("buildings.list[training]");
      var maxB = t.maxBonusPerStat, vip = D("shop.club.vipTrainingExtra");
      var cleanF = Math.ceil(lg.beats * lg.perfectShare - 1e-9), cleanM = Math.ceil(lg.beats * lg.perfectShare * t.maleDurationMultiplier - 1e-9);
      var focus = D("shop.trainingFocusPearls");
      var beatSec = function (ms) { return (ms / 1000).toString(); };

      return [
        {
          id: "basics", title: { ar: "الأساسيات", en: "The basics" },
          html: {
            ar: "<p>التدريب يضيف <b>مكافأة</b> فوق الصفة المولودة. الصفة المولودة (من التزاوج) لا تتغير أبدًا. الصفة الظاهرة = المولودة + مكافأة التدريب، ولا تتجاوز 100.</p>" +
              H.kpis([["+" + N(maxB), "أعلى مكافأة تدريب لكل صفة"], [N(t.maxSessionsPer24h) + " (VIP: " + N(t.maxSessionsPer24h + vip) + ")", "جلسات لكل صقر في كل 24 ساعة"], [N(t.minAgeHours) + " س", "أصغر عمر للتدريب"], [N(lure.cost), "عملة لكل صقر في الرحلة"]]) +
              H.table(["البند", "القيمة"], [
                ["من يتدرب", "الصغير والبالغ، من عمر " + N(t.minAgeHours) + " ساعات. المتقاعد لا يتدرب"],
                ["الشبع اللازم للبدء", N(t.minSatiety) + " فأكثر (الجلسة تستهلك " + N(lure.satietyCost) + ")"],
                ["لا يتدرب", "في المستشفى، أو المريض، أو من هو في جلسة"],
                ["الجلسات الثلاث", "نافذة متحركة: الجلسة تُحسب 24 ساعة من بدايتها. الخانة الحرة التالية بعد 24 ساعة من أقدم جلسة من آخر ثلاث"],
                ["بعد " + N(maxB / 2) + " نقاط في الصفة", "كل زيادة جديدة تُنصَّف (لكن لا تقل عن +1)"],
                ["المجموع", "الصفة المولودة + المكافأة لا تتجاوز 100"]]) +
              H.table(["مستوى مبنى التدريب", "تخفيض سعر الجلسة", "تكلفة الترقية"], tb.costs.map(function (c, i) { return [N(tb.minLevels[i]), N(tb.perks.trainingCostPercent[i]) + "%", N(c) + " عملة"]; })) +
              "<p>كل جلسة منتهية تعطي أيضًا " + N(D("nests.materialsTraining")) + " مواد للأعشاش، وتُحسب في المهمة اليومية وفي تذكرة الموسم (" + N(D("shop.seasonPass.pointsPerTraining")) + " نقطة).</p>" +
              H.tip("الذكور تتدرب أسرع: مدة جلستها " + P(t.maleDurationMultiplier) + " من مدة الأنثى."),
            en: "<p>Training adds a <b>bonus</b> on top of the born stat. The born stat (from breeding) never changes. The shown stat = born + training bonus, never above 100.</p>" +
              H.kpis([["+" + N(maxB), "highest training bonus per stat"], [N(t.maxSessionsPer24h) + " (VIP: " + N(t.maxSessionsPer24h + vip) + ")", "sessions per falcon in any 24 hours"], [N(t.minAgeHours) + " h", "youngest age to train"], [N(lure.cost), "coins per falcon on the trip"]]) +
              H.table(["Item", "Value"], [
                ["Who trains", "Young and Prime falcons, from " + N(t.minAgeHours) + " hours old. A Retired falcon cannot train"],
                ["Fullness needed to start", N(t.minSatiety) + " or more (a session uses " + N(lure.satietyCost) + ")"],
                ["Cannot train", "in hospital, sick, or already in a session"],
                ["The three sessions", "A rolling window: a session counts for 24 hours from its start. The next free slot comes 24 hours after the oldest of your last three"],
                ["After " + N(maxB / 2) + " points in a stat", "each new gain is halved (but never below +1)"],
                ["Total", "born stat + bonus never goes above 100"]]) +
              H.table(["Training building level", "Session price cut", "Upgrade cost"], tb.costs.map(function (c, i) { return [N(tb.minLevels[i]), N(tb.perks.trainingCostPercent[i]) + "%", N(c) + " coins"]; })) +
              "<p>Each finished session also gives " + N(D("nests.materialsTraining")) + " nest materials, and counts for the daily task and the Season Pass (" + N(D("shop.seasonPass.pointsPerTraining")) + " point).</p>" +
              H.tip("Males train faster: their session takes " + P(t.maleDurationMultiplier) + " of a female's time.")
          }
        },
        {
          id: "lure", title: { ar: "رحلة التلواح في الصحراء", en: "The lure desert trip" },
          html: {
            ar: "<p>تدريب التلواح هو لعبة صغيرة: يطير الصقر في الصحراء وأنت تنادي عليه بالنقر عند كل <b>نداء</b>. زر \"تلواح\" في التدريب يأخذك إلى الرحلة مباشرة. الرحلة تنتهي فورًا ولا تحتاج انتظار مؤقت.</p>" +
              H.shots([["lure/lure_01_training", "بطاقة تدريب التلواح"], ["lure/lure_02_choose", "اختر حتى 3 صقور"], ["lure/lure_03_run", "اضغط عندما يصل الصقر إلى التلواح"], ["lure/lure_03c_run_pull", "ضربة ممتازة!"], ["lure/lure_04_result", "نتيجة الرحلة وما أضافته"]]) +
              H.table(["البند", "القيمة"], [
                ["الصقور في الرحلة", "من 1 إلى " + N(lg.maxFalcons)],
                ["التكلفة", N(lure.cost) + " عملة لكل صقر (" + N(lure.cost * lg.maxFalcons) + " لثلاثة)، وتستهلك جلسة من جلساته الثلاث"],
                ["عدد النداءات", N(lg.beats) + " في الرحلة"],
                ["أول نداء بعد", beatSec(lg.firstBeatMs) + " ثوانٍ"],
                ["الفاصل بين النداءات", beatSec(lg.beatGapMs[0]) + " إلى " + beatSec(lg.beatGapMs[1]) + " ثانية، عشوائي"],
                ["طول الرحلة", N(lg.durationSeconds) + " ثانية"],
                ["أقصر وقت بين رحلتين", N(lg.minGapBetweenRunsSeconds) + " ثانية"],
                ["إن توقفت اللعبة", "رحلة بلا نقرات " + beatSec(lg.stallAbortMs) + " ثوانٍ تُلغى"],
                ["نمط النداءات", "يختلف في كل رحلة"]]) +
              "<h3>نوافذ التوقيت</h3><p>تنقر حين تُغلق الحلقة على الهدف. يُحكم على نقرتك بقربها من وقت النداء، مبكرة أو متأخرة:</p>" +
              H.table(["النتيجة", "النافذة"], [["ممتازة", "خلال " + N(lg.perfectMs) + " ملّي ثانية من النداء"], ["جيدة", "خلال " + N(lg.goodMs) + " ملّي ثانية"], ["فائتة", "أبعد من ذلك أو بلا نقر"]]) +
              H.next("<b>مع التحديث القادم:</b> الحلقة تُغلق في 1.6 ثانية بدل 1.1، فتصبح اللعبة أسهل.") + /* ring speed: lure_easier, ships with the next build */
              H.tip("لا عملات ولا نقاط تقدير ولا لؤلؤ تعتمد على جودة نقرك. يعتمد عليها نقطة <b>رشاقة</b> واحدة فقط (في القسم التالي)."),
            en: "<p>Lure training is a small game: the falcon flies in the desert and you call it back by tapping at each <b>call</b>. The \"Lure\" button in Training takes you straight to the trip. The trip finishes at once: there is no timer to wait for.</p>" +
              H.shots([["lure/lure_01_training", "The lure training card"], ["lure/lure_02_choose", "Pick up to 3 falcons"], ["lure/lure_03_run", "Tap when the falcon reaches the lure"], ["lure/lure_03c_run_pull", "An excellent hit!"], ["lure/lure_04_result", "The trip result and what it added"]]) +
              H.table(["Item", "Value"], [
                ["Falcons per trip", "1 to " + N(lg.maxFalcons)],
                ["Cost", N(lure.cost) + " coins per falcon (" + N(lure.cost * lg.maxFalcons) + " for three), and it uses one of the falcon's three sessions"],
                ["Calls (beats) in a trip", N(lg.beats)],
                ["First call after", beatSec(lg.firstBeatMs) + " seconds"],
                ["Gap between calls", beatSec(lg.beatGapMs[0]) + " to " + beatSec(lg.beatGapMs[1]) + " seconds, random"],
                ["Trip length", N(lg.durationSeconds) + " seconds"],
                ["Shortest time between two trips", N(lg.minGapBetweenRunsSeconds) + " seconds"],
                ["If the game freezes", "a trip with no taps for " + beatSec(lg.stallAbortMs) + " seconds is cancelled"],
                ["Call pattern", "different in every trip"]]) +
              "<h3>Timing windows</h3><p>You tap when the ring closes on the target. The tap is judged by how far it is from the call time, early or late:</p>" +
              H.table(["Result", "Window"], [["Perfect", "within " + N(lg.perfectMs) + " ms of the call"], ["Good", "within " + N(lg.goodMs) + " ms"], ["Miss", "farther than that, or no tap"]]) +
              H.next("<b>With the next update:</b> the ring closes in 1.6 seconds instead of 1.1, which makes the game easier.") +
              H.tip("No coins, prestige or Pearls depend on how well you tap. Only one <b>agility</b> point does (next section).")
          }
        },
        {
          id: "rewards", title: { ar: "المكافآت: كم يضيف التدريب", en: "Rewards: what training adds" },
          html: {
            ar: "<p>لكل صقر في الرحلة، في نهايتها:</p>" +
              H.steps([
                "<b>السرعة +" + N(lure.gains.speed) + " والتحمل +" + N(lure.gains.stamina) + "</b> مهما كان نقرك.",
                "إذا كانت الرحلة <b>نظيفة</b> لهذا الصقر: <b>الرشاقة +" + N(lg.agilityBonus) + "</b>."
              ]) +
              H.table(["الصقر", "الرحلة النظيفة تحتاج", "نقرات ممتازة"], [
                ["أنثى", P(lg.perfectShare), N(cleanF) + " من " + N(lg.beats)],
                ["ذكر", P(lg.perfectShare * t.maleDurationMultiplier), N(cleanM) + " من " + N(lg.beats)]]) +
              H.w("bars", { title: { ar: "أعلى مكافأة تدريب اليوم", en: "Most training can add today" }, max: maxB, unit: { ar: "نقطة", en: "points" }, items: [
                { label: B.STAT_NAMES.speed, value: maxB }, { label: B.STAT_NAMES.stamina, value: maxB }, { label: B.STAT_NAMES.agility, value: maxB }] }) +
              "<p><b>كم جلسة؟</b> بدون \"تركيز التدريب\": +1 سرعة و+1 تحمل لكل جلسة حتى +" + N(maxB) + " لكل منهما، أي " + N(maxB) + " جلسات (حوالي " + N(Math.ceil(maxB / t.maxSessionsPer24h)) + " أيام بحد " + N(t.maxSessionsPer24h) + " يوميًا). الرشاقة: +1 لكل رحلة نظيفة حتى +" + N(maxB) + ".</p>" +
              "<p><b>تركيز التدريب</b> (" + N(focus) + " لؤلؤة) يضاعف المكاسب الأساسية للجلسة التالية ويُستهلك: +2 بدل +1 ما دامت المكافأة أقل من " + N(maxB / 2) + ". بعد ذلك يعطي +1 فقط.</p>" +
              H.info("الإجمالي الممكن بالتدريب اليوم: السرعة +" + N(maxB) + "، التحمل +" + N(maxB) + "، الرشاقة +" + N(maxB) + " (" + N(maxB * 3) + " نقطة لكل صقر). الطاعة لا تتدرب الآن؛ تأتي من التزاوج فقط.") +
              H.tip("خذ حتى " + N(lg.maxFalcons) + " صقور في رحلة واحدة (" + N(lure.cost * lg.maxFalcons) + " عملة) وتنقر مرة واحدة لكلهم. الذكر يحتاج " + N(cleanM) + " نقرات ممتازة فقط، فالنقطة الرشاقة أسهل له. ثم انتظر " + N(lg.minGapBetweenRunsSeconds) + " ثانية قبل الرحلة التالية."),
            en: "<p>For each falcon in the trip, at the end:</p>" +
              H.steps([
                "<b>Speed +" + N(lure.gains.speed) + " and Stamina +" + N(lure.gains.stamina) + "</b> however you tap.",
                "If the trip was <b>clean</b> for that falcon: <b>Agility +" + N(lg.agilityBonus) + "</b>."
              ]) +
              H.table(["Falcon", "A clean trip needs", "Perfect taps"], [
                ["Female", P(lg.perfectShare), N(cleanF) + " of " + N(lg.beats)],
                ["Male", P(lg.perfectShare * t.maleDurationMultiplier), N(cleanM) + " of " + N(lg.beats)]]) +
              H.w("bars", { title: { ar: "أعلى مكافأة تدريب اليوم", en: "Most training can add today" }, max: maxB, unit: { ar: "نقطة", en: "points" }, items: [
                { label: B.STAT_NAMES.speed, value: maxB }, { label: B.STAT_NAMES.stamina, value: maxB }, { label: B.STAT_NAMES.agility, value: maxB }] }) +
              "<p><b>How many sessions?</b> Without Training Focus: +1 speed and +1 stamina per session until each reaches +" + N(maxB) + ", that is " + N(maxB) + " sessions (about " + N(Math.ceil(maxB / t.maxSessionsPer24h)) + " days at " + N(t.maxSessionsPer24h) + " a day). Agility: +1 per clean trip, up to +" + N(maxB) + ".</p>" +
              "<p><b>Training Focus</b> (" + N(focus) + " Pearls) doubles the base gain of the next session and is used up: +2 instead of +1 while the bonus is under " + N(maxB / 2) + ". After that it gives only +1.</p>" +
              H.info("The most training can add today: Speed +" + N(maxB) + ", Stamina +" + N(maxB) + ", Agility +" + N(maxB) + " (" + N(maxB * 3) + " points per falcon). Obedience cannot be trained right now; it comes only from breeding.") +
              H.tip("Take up to " + N(lg.maxFalcons) + " falcons on one trip (" + N(lure.cost * lg.maxFalcons) + " coins) and tap once for all of them. A male needs only " + N(cleanM) + " perfect taps, so the agility point is easier for him. Then wait " + N(lg.minGapBetweenRunsSeconds) + " seconds before the next trip.")
          }
        },
        {
          id: "skip", title: { ar: "التخطي والبرقع", en: "Skipping and the hood" },
          html: {
            ar: "<p>رحلة التلواح تنتهي فورًا فلا يوجد ما تتخطاه. الجلسات المؤقتة القديمة تُتخطّى بالساعة الرملية (واحدة لكل ساعة، وآخر " + N(D("shop.skips.freeFinishMinutes")) + " دقائق مجانية).</p>" +
              H.tip("جلسات <b>البرقع</b> مخفية حاليًا لإعادة تصميمها، وقد تعود لاحقًا."),
            en: "<p>The lure trip finishes at once, so there is nothing to skip. The old timed sessions are skipped with sand-glasses (one per hour, and the last " + N(D("shop.skips.freeFinishMinutes")) + " minutes are free).</p>" +
              H.tip("The <b>hood</b> sessions are hidden for now while they get a redesign, and may come back later.")
          }
        }
      ];
    }
  });
})(window.Book);
