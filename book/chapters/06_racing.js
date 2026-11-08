/* Chapter 6 - Racing. Facts: Docs/Systems/06_racing.md. Every number comes from data.js through B.D(). */
(function (B) {
  var D = B.D, N = B.N, P = B.P, H = B.H;

  B.chapter({
    id: "racing", order: 6, icon: "icons/race.png",
    title: { ar: "السباقات", en: "Racing" },
    blurb: { ar: "كيف تُحسب نتيجة السباق من الصفات، لحظة الإطلاق، المنافسون، الجوائز، والترتيب والمواسم.", en: "How a race result comes from the stats, the release moment, the rivals, prizes, and ranked seasons." },
    sections: function () {
      var r = D("race"), fl = r.flight, rel = r.release, op = r.opponents, ld = op.ladder, rw = r.rewards, vg = r.vsGame, vp = r.vsPlayers, lv = r.live, rk = r.ranked;
      var pl = D("prestige.levels");
      var placeAr = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس"], placeEn = ["1st", "2nd", "3rd", "4th", "5th"];
      var skillAr = { perfect: "ممتاز", good: "جيد", average: "متوسط", poor: "ضعيف" }, skillEn = { perfect: "Perfect", good: "Good", average: "Average", poor: "Poor" };
      var divAr = { bronze: "برونزي", silver: "فضي", gold: "ذهبي", elite: "النخبة", legend: "الأسطورة" }, divEn = { bronze: "Bronze", silver: "Silver", gold: "Gold", elite: "Elite", legend: "Legend" };
      function pctC(x) { return N(Math.round(x * 100)) + "%"; }
      function vsPrestige(v) { return Math.floor((v * vg.prestigePercent + 50) / 100); }
      function vsCoins(v) { return Math.round(v * vg.coinPercentAfter / 100); }
      var greenQ = 0.9, yellowQ = 0.7, orangeQ = 0.4; // quality thresholds of the zones (code constants, not in the config)
      var skillIds = ["perfect", "good", "average", "poor"];
      var ladderRows = ld.statMin.map(function (mn, i) { return { label: { ar: "مستوى " + (i + 1), en: "Level " + (i + 1) }, min: mn, max: ld.statMax[i] }; });
      var fr = op.firstRaces;
      var injAt = function (h) { return Math.round(r.injuryBaseChance * (1.5 - h / 100) * 1000) / 10; };
      var vipPct = D("shop.club.vipRaceCoinPercent");

      return [
        {
          id: "basics", title: { ar: "ما هو السباق وكيف تسابق", en: "What a race is, and how to enter" },
          html: {
            ar: "<p>يطير الصقر وحده في مضمار مستقيم ومسوَّر نحو الصقّار الذي يحمل التلواح. كل المتسابقين تُحسب نتائجهم بنفس المعادلات، والفائز صاحب أفضل زمن. لك <b>لحظة مهارة واحدة</b>: عدّاد الإطلاق في البداية. بعد الإطلاق لا يوجد تحكم.</p>" +
              H.kpis([[N(r.course.lengthMeters) + " م", "طول المضمار"], [N(r.course.widthMeters) + " م", "عرضه"], ["17–21 ث", "زمن السباق تقريبًا"], [N(r.entryFee), "عملة رسم الدخول"]]) +
              H.table(["الشرط", "القيمة"], [
                ["العمر", "بالغ فقط"],
                ["الشبع اللازم", N(r.minSatiety) + " فأكثر (السباق يستهلك " + N(r.satietyCost) + ")"],
                ["لا يسابق", "في المستشفى، المريض (صحة أقل من " + N(D("care.sickThreshold")) + ")، في تدريب، في راحة"],
                ["الراحة بعد السباق", N(r.restHours) + " ساعتان"],
                ["الصحة", "−" + N(r.healthCost) + " في كل سباق"],
                ["فرصة الإصابة", P(r.injuryBaseChance) + " × (1.5 − الصحة ÷ 100): عند صحة 100 = " + injAt(100) + "%، وعند 50 = " + injAt(50) + "%، وعند 0 = " + injAt(0) + "%"],
                ["ضرر الإصابة", "−" + N(r.injuryDamage) + " صحة (يُنصَّف مع الفحص الدوري)"]]) +
              "<p>إذا خرجت قبل الإطلاق يُردّ رسم الدخول. ويقرر الخادم النتيجة في الإنترنت بنفس القواعد.</p>" +
              H.shots([["tired/race_list", "شاشة السباق: اختر صقرك وابدأ"], ["race/1_intro", "الصقّار والصقر قبل الإطلاق"], ["race/2_hood_off", "انزع البرقع"]]) +
              H.tip("الجمال لا يدخل السباق. صحة وشبع صقرك يؤثران في سرعته (فصل الرعاية). غذِّ صقرك قبل كل سباق."),
            en: "<p>The falcon flies alone down a straight walled course toward the falconer with the lure. Every racer is calculated with the same formulas, and the best finish time wins. You have <b>one skill moment</b>: the release meter at the start. After the release there is no control.</p>" +
              H.kpis([[N(r.course.lengthMeters) + " m", "course length"], [N(r.course.widthMeters) + " m", "course width"], ["17–21 s", "race time, about"], [N(r.entryFee), "coins entry fee"]]) +
              H.table(["Rule", "Value"], [
                ["Age", "Prime only"],
                ["Fullness needed", N(r.minSatiety) + " or more (a race uses " + N(r.satietyCost) + ")"],
                ["Cannot race", "in hospital, sick (health under " + N(D("care.sickThreshold")) + "), in training, resting"],
                ["Rest after a race", N(r.restHours) + " hours"],
                ["Health", "−" + N(r.healthCost) + " each race"],
                ["Injury chance", P(r.injuryBaseChance) + " × (1.5 − health ÷ 100): at health 100 = " + injAt(100) + "%, at 50 = " + injAt(50) + "%, at 0 = " + injAt(0) + "%"],
                ["Injury damage", "−" + N(r.injuryDamage) + " health (halved with a Check-up)"]]) +
              "<p>If you leave before the release, the entry fee is refunded. Online, the server decides the result with the same rules.</p>" +
              H.shots([["tired/race_list", "The Race screen: pick your falcon and start"], ["race/1_intro", "Falconer and falcon before the release"], ["race/2_hood_off", "Take the hood off"]]) +
              H.tip("Beauty is not used in a race. Your falcon's health and fullness change its speed (Care chapter). Feed your racer before every race.")
          }
        },
        {
          id: "stats", title: { ar: "كيف تُحسب النتيجة من الصفات", en: "How the result comes from the stats" },
          html: {
            ar: "<p>تُستخدم أربع صفات فقط: السرعة والتحمل والرشاقة والطاعة (الصفة المولودة + مكافأة التدريب).</p>" +
              H.table(["الصفة", "ماذا تفعل"], [
                ["<img src=\"icons/stat_speed.png\" alt=\"\" style=\"width:22px;vertical-align:middle\"> <b>السرعة</b>", "أقصى سرعة: من " + N(fl.speedMin, 3) + " م/ث عند السرعة 0 إلى " + N(fl.speedMax, 3) + " م/ث عند 100، ثم تُضرب في عامل الرعاية"],
                ["<img src=\"icons/stat_agility.png\" alt=\"\" style=\"width:22px;vertical-align:middle\"> <b>الرشاقة</b>", "سرعة التسارع: من " + N(fl.accelMin) + " إلى " + N(fl.accelMax) + " م/ث²، وسرعة تلاشي الانحراف الجانبي"],
                ["<img src=\"icons/stat_stamina.png\" alt=\"\" style=\"width:22px;vertical-align:middle\"> <b>التحمل</b>", "الطاقة تنقص أثناء الطيران (من " + N(fl.drainMax, 3) + " في الثانية عند تحمل 0 إلى " + N(fl.drainMin, 3) + " عند 100). كلما قلّت الطاقة نقصت السرعة حتى النصف"],
                ["<img src=\"icons/stat_obedience.png\" alt=\"\" style=\"width:22px;vertical-align:middle\"> <b>الطاعة</b>", "قلة الانجراف نحو الجدران، وقوة الرجوع إلى خط الوسط"]]) +
              "<ul><li>الابتعاد عن خط الوسط يفقده سرعة (حتى −" + pctC(fl.lineLoss) + " عند الجدار). وعلى بُعد " + N(r.course.wallMarginMeters) + " م من الجدار يفقد حتى " + pctC(r.course.wallPenalty) + " زيادة.</li>" +
              "<li>الانجراف الجانبي عشوائي، فسباقان لنفس الصقر يختلفان قليلًا.</li>" +
              "<li>أقصى سرعة تتغير " + N(Math.round((fl.speedMax / fl.speedMin - 1) * 1000) / 10) + "% فقط بين سرعة 0 و100. السرعة وحدها ليست القصة: إطلاق سيئ أو صقر قليل الطاعة يخسر أكثر.</li>" +
              "<li>عامل الرعاية: (الصحة ÷ 100)<sup>" + N(D("care.healthPerformanceExponent")) + "</sup>، و×" + N(D("care.hungryPerformance")) + " إن كان جائعًا، و×" + N(1 + D("weighing.sharpPower")) + " للصقر الحاد من الوزن الصباحي.</li></ul>" +
              "<p>الترتيب: من أنهى السباق بالزمن، ومن لم ينهِ بالمسافة. ويفوز صاحب الرقم الأدنى عند التعادل.</p>" +
              H.shots([["race/5_chase", "المطاردة: السرعة والمسافة أعلى الشاشة"], ["race/5d_chase_bank", "الصقر ينعطف ليعود إلى الخط"], ["race/7_lure", "الوصول إلى التلواح عند " + r.course.lengthMeters + " م"]]) +
              H.tip("الطاعة والتحمل بأهمية السرعة. صقر قليل الطاعة يصطدم بالجدران ويخسر سرعته، وقليل التحمل يتعب في آخر المضمار."),
            en: "<p>Only four stats are used: Speed, Stamina, Agility and Obedience (born stat + training bonus).</p>" +
              H.table(["Stat", "What it does"], [
                ["<img src=\"icons/stat_speed.png\" alt=\"\" style=\"width:22px;vertical-align:middle\"> <b>Speed</b>", "Top speed: from " + N(fl.speedMin, 3) + " m/s at speed 0 to " + N(fl.speedMax, 3) + " m/s at 100, then multiplied by the care factor"],
                ["<img src=\"icons/stat_agility.png\" alt=\"\" style=\"width:22px;vertical-align:middle\"> <b>Agility</b>", "How fast it speeds up: " + N(fl.accelMin) + " to " + N(fl.accelMax) + " m/s², and how fast sideways drift dies out"],
                ["<img src=\"icons/stat_stamina.png\" alt=\"\" style=\"width:22px;vertical-align:middle\"> <b>Stamina</b>", "Energy drains in flight (from " + N(fl.drainMax, 3) + " a second at stamina 0 to " + N(fl.drainMin, 3) + " at 100). The lower the energy, the lower the speed, down to half"],
                ["<img src=\"icons/stat_obedience.png\" alt=\"\" style=\"width:22px;vertical-align:middle\"> <b>Obedience</b>", "How little it drifts to the walls, and how strongly it returns to the centre line"]]) +
              "<ul><li>Leaving the centre line costs speed (up to −" + pctC(fl.lineLoss) + " at the wall). Within " + N(r.course.wallMarginMeters) + " m of a wall it loses up to " + pctC(r.course.wallPenalty) + " more.</li>" +
              "<li>The sideways drift is random, so two races of the same falcon differ a little.</li>" +
              "<li>Top speed changes only " + N(Math.round((fl.speedMax / fl.speedMin - 1) * 1000) / 10) + "% between speed 0 and 100. Speed alone is not the whole story: a bad release or a low-obedience falcon loses more.</li>" +
              "<li>Care factor: (health ÷ 100)<sup>" + N(D("care.healthPerformanceExponent")) + "</sup>, ×" + N(D("care.hungryPerformance")) + " if hungry, and ×" + N(1 + D("weighing.sharpPower")) + " for a Sharp falcon from the morning weighing.</li></ul>" +
              "<p>Finish order: finished racers by time, unfinished ones by distance. A tie goes to the lower racer number.</p>" +
              H.shots([["race/5_chase", "The chase: speed and distance at the top"], ["race/5d_chase_bank", "The falcon banks back to the line"], ["race/7_lure", "Reaching the lure at " + r.course.lengthMeters + " m"]]) +
              H.tip("Obedience and Stamina matter as much as Speed. A low-obedience falcon hits the walls and loses speed, and a low-stamina one tires near the end.")
          }
        },
        {
          id: "release", title: { ar: "عدّاد الإطلاق: لحظة مهارتك", en: "The release meter: your skill moment" },
          html: {
            ar: "<p>يمر مؤشر على الشريط ذهابًا وإيابًا. تنقر مرة واحدة لتطلق الصقر. كلما كان المؤشر أقرب إلى المركز الأخضر كان الانطلاق أقوى. مركز الأخضر يتغير كل سباق (في الثلث الأوسط من الشريط).</p>" +
              H.w("release") +
              H.shots([["race/3_gauge", "العدّاد في السباق: اضغط عندما يكون المؤشر في الأخضر"], ["race/4_release", "إطلاق مثالي!"]]) +
              H.table(["المنطقة", "الجودة اللازمة", "قوة الانطلاق"], [
                ["<b style=\"color:#3cb371\">أخضر</b>", greenQ + " فأكثر (" + pctC(rel.greenWidth) + " من الشريط)", N(rel.greenStartPower) + " (دفعة تتلاشى إلى 1 خلال " + N(rel.boostSeconds) + " ثوانٍ)"],
                ["<b style=\"color:#e0b030\">أصفر</b>", yellowQ + " إلى أقل من " + greenQ, N(rel.yellowStartPower)],
                ["<b style=\"color:#e08030\">برتقالي</b>", orangeQ + " إلى أقل من " + yellowQ, N(rel.orangeStartPower)],
                ["<b style=\"color:#d04040\">أحمر</b>", "أقل من " + orangeQ, N(rel.redStartPower)]]) +
              "<p>مرور المؤشر على كل الشريط يأخذ " + N(rel.sweepSeconds) + " ثانية. بعد انطلاق أقل من 1، تصعد القوة خطًّا مستقيمًا إلى 1 خلال " + N(rel.rampSeconds) + " ثوانٍ. السرعة والتسارع كلاهما يُضرب في القوة، فالانطلاق الأحمر يعني أن الصقر يكاد يقف في اللحظة الأولى. ودائمًا " + pctC(rel.minRedEachSide) + " على الأقل من كل جانب أحمر.</p>" +
              H.info("المنطقة الخضراء تعبرها الإبرة في حوالي 0.09 ثانية فقط. بحسب تقديرنا، الانطلاق الأحمر يكلّف 1.4 إلى 1.6 ثانية، أي ما يعادل فرق 40 إلى 50 نقطة في الصفات."),
            en: "<p>A needle sweeps across the bar and back. You tap once to release the falcon. The closer the needle is to the green centre, the stronger the start. The green centre changes every race (in the middle third of the bar).</p>" +
              H.w("release") +
              H.shots([["race/3_gauge", "The meter in a race: tap when the needle is in the green"], ["race/4_release", "A perfect release!"]]) +
              H.table(["Zone", "Quality needed", "Start power"], [
                ["<b style=\"color:#3cb371\">Green</b>", greenQ + " or more (" + pctC(rel.greenWidth) + " of the bar)", N(rel.greenStartPower) + " (a boost that fades to 1 over " + N(rel.boostSeconds) + " seconds)"],
                ["<b style=\"color:#e0b030\">Yellow</b>", yellowQ + " up to " + greenQ, N(rel.yellowStartPower)],
                ["<b style=\"color:#e08030\">Orange</b>", orangeQ + " up to " + yellowQ, N(rel.orangeStartPower)],
                ["<b style=\"color:#d04040\">Red</b>", "under " + orangeQ, N(rel.redStartPower)]]) +
              "<p>One full pass of the bar takes " + N(rel.sweepSeconds) + " seconds. After a start below 1, the power climbs in a straight line back to 1 over " + N(rel.rampSeconds) + " seconds. Both speed and acceleration are multiplied by the power, so a red start means the falcon almost stands still at the first moment. At least " + pctC(rel.minRedEachSide) + " of the bar on each side is always red.</p>" +
              H.info("The needle crosses the green zone in only about 0.09 seconds. By our estimate a red start costs 1.4 to 1.6 seconds, as much as a 40 to 50 point stat difference.")
          }
        },
        {
          id: "rivals", title: { ar: "المنافسون من الذكاء الاصطناعي", en: "The AI rivals" },
          html: {
            ar: "<p>تسابق ضد <b>" + N(op.min) + " إلى " + N(op.max) + "</b> منافسين، أي " + N(op.min + 1) + " أو " + N(op.max + 1) + " صقور في المجموع. هم صقور برية جديدة (نوعها وجنسها وألوانها عشوائية) وليسوا صقور لاعبين. صفاتهم الخمس رقم عشوائي بين حدّي <b>مستواك</b> في التقدير، بلا مكافأة تدريب:</p>" +
              H.w("ranges", { title: { ar: "صفات المنافسين حسب مستوى التقدير", en: "Rival stats by prestige level" }, scaleMax: 100, items: ladderRows }) +
              H.table(["المستوى", "نقاط التقدير اللازمة", "أقل صفة", "أعلى صفة"], ld.statMin.map(function (mn, i) { return [N(i + 1), N(pl[i]), N(mn), N(ld.statMax[i])]; })) +
              "<h3>مهارة الإطلاق عند المنافس</h3>" +
              "<p>كل منافس يسحب جودة إطلاقه من أحد أربعة ملفات: ممتاز " + P(r.aiSkill.perfect) + "، جيد " + P(r.aiSkill.good) + "، متوسط " + P(r.aiSkill.average) + "، ضعيف " + P(r.aiSkill.poor) + ".</p>" +
              H.table(["الملف", "أخضر", "أصفر", "برتقالي", "أحمر"], skillIds.map(function (id) { var s = D("race.skillProfiles[" + id + "]"); return [skillAr[id], P(s.greenChance), P(s.yellowChance), P(s.orangeChance), P(s.redChance)]; })) +
              "<h3>أول " + N(fr.count) + " سباقات أسهل</h3>" +
              "<p>في أول " + N(fr.count) + " سباقات لحسابك ضد اللعبة يكون المنافسون أضعف. القاعدة لكل الحسابات:</p>" +
              H.table(["السباق", "صفات المنافسين أقل بـ"], [["1 إلى " + N(fr.statOffsets.filter(function (x) { return x === fr.statOffsets[0]; }).length), N(fr.statOffsets[0]) + " نقطة"], [(fr.statOffsets.filter(function (x) { return x === fr.statOffsets[0]; }).length + 1) + " إلى " + N(fr.count), N(fr.statOffsets[fr.count - 1]) + " نقاط"], ["" + (fr.count + 1) + " فما بعد", "السلّم العادي"]]) +
              "<p>ومهارة إطلاقهم في هذه السباقات متوسطة (" + P(fr.aiSkill.average) + ") أو ضعيفة (" + P(fr.aiSkill.poor) + ") فقط.</p>" +
              H.tip("صقراك الأوليان " + N(D("starter.statRange.min")) + "–" + N(D("starter.statRange.max")) + " ومنافسو المستوى الأول " + N(ld.statMin[0]) + "–" + N(ld.statMax[0]) + "، ناقص " + N(fr.statOffsets[0]) + " في أول خمسة. سباقاتك الأولى سهلة. وكلما ارتفع مستواك تحتاج صقورًا أقوى لأن السلّم يرتفع."),
            en: "<p>You race against <b>" + N(op.min) + " to " + N(op.max) + "</b> rivals, so " + N(op.min + 1) + " or " + N(op.max + 1) + " falcons in all. They are new wild falcons (random species, sex and colours), not other players' falcons. Each of their five stats is a random number between the limits of <b>your</b> prestige level, with no training bonus:</p>" +
              H.w("ranges", { title: { ar: "صفات المنافسين حسب مستوى التقدير", en: "Rival stats by prestige level" }, scaleMax: 100, items: ladderRows }) +
              H.table(["Level", "Prestige points needed", "Lowest stat", "Highest stat"], ld.statMin.map(function (mn, i) { return [N(i + 1), N(pl[i]), N(mn), N(ld.statMax[i])]; })) +
              "<h3>The AI's release skill</h3>" +
              "<p>Each rival draws its release quality from one of four profiles: Perfect " + P(r.aiSkill.perfect) + ", Good " + P(r.aiSkill.good) + ", Average " + P(r.aiSkill.average) + ", Poor " + P(r.aiSkill.poor) + ".</p>" +
              H.table(["Profile", "Green", "Yellow", "Orange", "Red"], skillIds.map(function (id) { var s = D("race.skillProfiles[" + id + "]"); return [skillEn[id], P(s.greenChance), P(s.yellowChance), P(s.orangeChance), P(s.redChance)]; })) +
              "<h3>The first " + N(fr.count) + " races are easier</h3>" +
              "<p>In your account's first " + N(fr.count) + " races against the game the rivals are weaker. The same rule applies to every account:</p>" +
              H.table(["Race", "Rival stats lowered by"], [["1 to " + N(fr.statOffsets.filter(function (x) { return x === fr.statOffsets[0]; }).length), N(fr.statOffsets[0]) + " points"], [(fr.statOffsets.filter(function (x) { return x === fr.statOffsets[0]; }).length + 1) + " to " + N(fr.count), N(fr.statOffsets[fr.count - 1]) + " points"], ["" + (fr.count + 1) + " and later", "the normal ladder"]]) +
              "<p>Their release skill in these races is only Average (" + P(fr.aiSkill.average) + ") or Poor (" + P(fr.aiSkill.poor) + ").</p>" +
              H.tip("Your starters are " + N(D("starter.statRange.min")) + "–" + N(D("starter.statRange.max")) + " and level-1 rivals are " + N(ld.statMin[0]) + "–" + N(ld.statMax[0]) + ", minus " + N(fr.statOffsets[0]) + " in the first five races. Your first races are easy. As your level rises you need stronger falcons, because the ladder rises.")
          }
        },
        {
          id: "prizes", title: { ar: "الجوائز", en: "Prizes" },
          html: {
            ar: "<p>جوائز السباق ضد اللعبة حسب المركز:</p>" +
              H.w("bars", { title: { ar: "عملات المركز (الجدول الأساسي)", en: "Coins by place (base table)" }, unit: { ar: "عملة", en: "coins" }, items: rw.map(function (x, i) { return { label: { ar: "المركز " + placeAr[i], en: placeEn[i] }, value: x.coins }; }) }) +
              H.table(["المركز", "العملات (المستويان 1–2)", "العملات (المستوى 3 فأكثر)", "نقاط التقدير"], rw.map(function (x, i) { return [placeAr[i], N(x.coins), N(vsCoins(x.coins)), N(vsPrestige(x.prestige))]; })) +
              "<p>في المستويين الأولين تنال العملات كاملة. من المستوى " + N(vg.fullCoinsBelowLevel) + " تنال " + P(vg.coinPercentAfter / 100) + " من العملات. نقاط التقدير " + P(vg.prestigePercent / 100) + " في كل المستويات. الصافي بعد رسم الدخول (" + N(r.entryFee) + "): الفائز في المستوى 3+ يربح " + N(vsCoins(rw[0].coins) - r.entryFee) + "، والخامس يخسر " + N(r.entryFee - vsCoins(rw[4].coins)) + ".</p>" +
              H.kpis([[N(r.dailyFullPrizeRaces), "سباقًا في اليوم بجوائز كاملة"], [pctC(r.reducedPrizePercent / 100), "من الجائزة بعد ذلك (عملات ونقاط)"], ["+" + N(vipPct) + "%", "عملات إضافية لعضو VIP"]]) +
              "<p>الحد اليومي (بتوقيت الخليج) يحسب السباقات ضد اللعبة وضد اللاعبين والمباشرة. محاولات البطولة لا تُحسب. مكافأة VIP تُضاف على ما دفعه السباق فعلًا (بعد الحد اليومي)، وتخص السباقات ضد اللعبة فقط.</p>" +
              H.shots([["race/8_results", "شاشة النتيجة: المركز والعملات والهيبة"], ["tired/race_list", "الجوائز بحسب المركز أعلى شاشة السباق"]]),
            en: "<p>Prizes for a race against the game, by place:</p>" +
              H.w("bars", { title: { ar: "عملات المركز (الجدول الأساسي)", en: "Coins by place (base table)" }, unit: { ar: "عملة", en: "coins" }, items: rw.map(function (x, i) { return { label: { ar: "المركز " + placeAr[i], en: placeEn[i] }, value: x.coins }; }) }) +
              H.table(["Place", "Coins (levels 1–2)", "Coins (level 3 and up)", "Prestige"], rw.map(function (x, i) { return [placeEn[i], N(x.coins), N(vsCoins(x.coins)), N(vsPrestige(x.prestige))]; })) +
              "<p>At the first two levels you get the full coins. From level " + N(vg.fullCoinsBelowLevel) + " you get " + P(vg.coinPercentAfter / 100) + " of the coins. Prestige is " + P(vg.prestigePercent / 100) + " at all levels. Net of the entry fee (" + N(r.entryFee) + "): 1st at level 3+ wins " + N(vsCoins(rw[0].coins) - r.entryFee) + ", and 5th loses " + N(r.entryFee - vsCoins(rw[4].coins)) + ".</p>" +
              H.kpis([[N(r.dailyFullPrizeRaces), "races a day with full prizes"], [pctC(r.reducedPrizePercent / 100), "of the prize after that (coins and prestige)"], ["+" + N(vipPct) + "%", "extra coins for a VIP"]]) +
              "<p>The daily limit (Gulf day) counts races against the game, against players and live. Tournament tries do not count. The VIP bonus is added on top of what the race actually paid (after the daily limit), and only for races against the game.</p>" +
              H.shots([["race/8_results", "The results: place, coins and prestige"], ["tired/race_list", "The prizes by place at the top of the Race screen"]])
          }
        },
        {
          id: "live", title: { ar: "السباق ضد اللاعبين والتصنيف", en: "Racing players, and ranked" },
          html: {
            ar: "<h3>السباق المباشر</h3>" +
              H.table(["البند", "القيمة"], [
                ["المتسابقون", N(lv.players) + " (يُكمل الذكاء الاصطناعي الأماكن الفارغة بعد " + N(lv.fillAfterSeconds) + " ثانية)"],
                ["الانطلاق", "بعد " + N(lv.startDelaySeconds) + " ثوانٍ من اكتمال الغرفة"],
                ["الجوائز", "العملات " + P(vp.coinRewardPercent / 100) + "، نقاط التقدير " + P(vp.prestigeRewardPercent / 100) + " من الجدول الأساسي (المركز الأول: " + N(rw[0].coins) + " عملة و" + N(Math.round(rw[0].prestige * vp.prestigeRewardPercent / 100)) + " نقطة)"],
                ["إذا فاتك الإطلاق", "تُحسب جودتك " + N(lv.missedReleaseQuality) + " وتأتي الأخير"]]) +
              "<h3>الدرجات</h3>" +
              H.table(["الدرجة", "النقاط اللازمة", "علاوة العملات", "رسم الدخول"], rk.divisions.map(function (d) { return [divAr[d.id], N(d.minPoints), pctC(d.coinPercent / 100), N(d.entryFee)]; })) +
              "<p>نقاط المراكز: " + rk.placePoints.map(function (p, i) { return placeAr[i] + " " + (p > 0 ? "+" : "−") + N(Math.abs(p)); }).join("، ") + ". أول " + N(rk.placementRaces) + " سباقات (التمركز) تُحسب نقاطها مضاعفة.</p>" +
              H.info("<b>ليلة السباق:</b> الساعة " + N(rk.raceNight.startHour) + ":00 بتوقيت الخليج، لمدة ساعة، والنقاط ×" + N(rk.raceNight.pointsMultiplier) + "، بحد " + N(rk.raceNight.maxRacesPerFalconPerDay) + " سباقات للصقر في اليوم.") +
              "<h3>جوائز الموسم</h3><p>يلزم " + N(rk.season.minRaces) + " سباقًا على الأقل في الموسم للفوز بجائزة. أول ثلاثة في كل درجة يفوزون بعملات ونقاط تقدير:</p>" +
              H.table(["الدرجة", "العملات (1 / 2 / 3)", "نقاط التقدير (1 / 2 / 3)"], rk.season.prizes.map(function (p) { return [divAr[p.division], p.coins.map(function (x) { return N(x); }).join(" / "), p.prestige.map(function (x) { return N(x); }).join(" / ")]; })),
            en: "<h3>Live races</h3>" +
              H.table(["Item", "Value"], [
                ["Racers", N(lv.players) + " (AI fills empty places after " + N(lv.fillAfterSeconds) + " seconds)"],
                ["Start", N(lv.startDelaySeconds) + " seconds after the room is ready"],
                ["Prizes", "coins " + P(vp.coinRewardPercent / 100) + ", prestige " + P(vp.prestigeRewardPercent / 100) + " of the base table (1st place: " + N(rw[0].coins) + " coins and " + N(Math.round(rw[0].prestige * vp.prestigeRewardPercent / 100)) + " prestige)"],
                ["If you miss the release", "your quality counts as " + N(lv.missedReleaseQuality) + " and you finish last"]]) +
              "<h3>Divisions</h3>" +
              H.table(["Division", "Points needed", "Coin bonus", "Entry fee"], rk.divisions.map(function (d) { return [divEn[d.id], N(d.minPoints), pctC(d.coinPercent / 100), N(d.entryFee)]; })) +
              "<p>Points by place: " + rk.placePoints.map(function (p, i) { return placeEn[i] + " " + (p > 0 ? "+" : "−") + N(Math.abs(p)); }).join(", ") + ". Your first " + N(rk.placementRaces) + " ranked races (placement) count double points.</p>" +
              H.info("<b>Race night:</b> " + N(rk.raceNight.startHour) + ":00 Gulf time, for one hour, points ×" + N(rk.raceNight.pointsMultiplier) + ", at most " + N(rk.raceNight.maxRacesPerFalconPerDay) + " races per falcon per day.") +
              "<h3>Season prizes</h3><p>You need at least " + N(rk.season.minRaces) + " races in a season to win a prize. The top three of each division win coins and prestige:</p>" +
              H.table(["Division", "Coins (1st / 2nd / 3rd)", "Prestige (1st / 2nd / 3rd)"], rk.season.prizes.map(function (p) { return [divEn[p.division], p.coins.map(function (x) { return N(x); }).join(" / "), p.prestige.map(function (x) { return N(x); }).join(" / ")]; }))
          }
        }
      ];
    }
  });
})(window.Book);
