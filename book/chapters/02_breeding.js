/* Chapter 2 - Breeding & mutations. Facts: Docs/Systems/02_breeding.md. Every number comes from data.js through B.D(). */
(function (B) {
  var D = B.D, N = B.N, P = B.P, H = B.H;
  var b = D("breeding"), push = b.push, mut = b.mutation;
  var nests = D("nests");

  B.chapter({
    id: "breeding", order: 2, icon: "icons/bar_egg.png",
    title: { ar: "التزاوج والطفرات", en: "Breeding & mutations" },
    blurb: { ar: "كيف يرث الفرخ صفاته وألوانه من أبويه، وكيف تعمل الطفرة، وحاسبة تجرّب فيها أي زوج.", en: "How a chick inherits stats and colours, how mutation works, and a calculator to try any pair." },
    sections: function () {
      return [
        {
          id: "who", title: { ar: "من يستطيع التزاوج؟", en: "Who can pair?" },
          html: {
            ar: "<p>الزوج دائمًا <b class=\"fem\">أنثى</b> و<b class=\"mal\">ذكر</b>. اللعبة تفحص الشروط بهذا الترتيب:</p>" +
              H.steps([
                "صقران مختلفان: الأولى أنثى والثاني ذكر.",
                "كلاهما في مرحلة <b>البلوغ</b> أو <b>التقاعد</b>. الصغار لا يتزاوجون.",
                "الأنثى ليست في راحة: ترتاح " + N(b.femaleCooldownHours) + " ساعة بعد كل تزاوج. الذكر لا يرتاح (" + N(b.maleCooldownHours) + " ساعة)، لكن له حد يومي.",
                "لا أحد منهما في المستشفى أو مريض (صحة أقل من 40) أو في جلسة تدريب، ولا مجمَّد في VIP.",
                "يوجد عش فارغ: التزاوج يضع بيضة في عش (انظر فصل الأعشاش).",
                "الذكر ما زال عنده تزاوجات اليوم: حتى " + N(nests.maxFemalesPerDay) + " إناث في اليوم."
              ]) +
              H.tip("التزاوج نفسه <b>بلا رسوم عملات</b>. تكلفته الوقت: البيضة، وراحة الأنثى " + N(b.femaleCooldownHours) + " ساعة.") +
              H.shots([["slots/tall_breeding", "شاشة التزاوج: اختر الأم والأب"], ["hatchery/a_list", "المفقس: البيض وأوقاته"]]),
            en: "<p>A pair is always one <b class=\"fem\">female</b> and one <b class=\"mal\">male</b>. The game checks, in this order:</p>" +
              H.steps([
                "Two different falcons: first the female, then the male.",
                "Both are <b>Prime</b> or <b>Retired</b>. Young falcons cannot breed.",
                "The female is not resting: she rests " + N(b.femaleCooldownHours) + " hours after each mating. The male has no rest (" + N(b.maleCooldownHours) + " h) but a daily limit.",
                "Neither is in hospital, sick (health under 40), in a training session, or VIP-frozen.",
                "A free nest exists: mating lays an egg in a nest (see the Nests chapter).",
                "The male still has matings left today: up to " + N(nests.maxFemalesPerDay) + " females a day."
              ]) +
              H.tip("Breeding itself costs <b>no coins</b>. Its cost is time: the egg, and the female's " + N(b.femaleCooldownHours) + "-hour rest.") +
              H.shots([["slots/tall_breeding", "The Breeding screen: pick mother and father"], ["hatchery/a_list", "The Hatchery: eggs and their timers"]])
          }
        },
        {
          id: "stats-now", title: { ar: "كيف تُحسب صفات الفرخ (الآن)", en: "How chick stats are made (now)" },
          html: {
            ar: "<p>لكل صفة من الصفات الخمس، يحسب الخادم بنفس الطريقة:</p>" +
              H.steps([
                "يحذف ميزة الجنس من كل أب (الأنثى: سرعة +2، تحمل +5. الذكر: رشاقة +2، طاعة +5) ثم يأخذ <b>المتوسط</b>. نسميه <b>الوسط</b>.",
                "يقارن الوسط بـ<b>منتصف المدى البري</b> لسلالة الفرخ (مثلًا سرعة الحر: من 50 إلى 70، المنتصف 60).",
                "إذا كان الوسط <b>أقل</b> من المنتصف، يتقدّم الفرخ " + P(b.regressionUp) + " من الفرق. إذا كان <b>أعلى أو يساوي</b>، يرجع " + P(b.regressionToMean) + " من الفرق نحو المنتصف.",
                "يضيف حظًا بين <b>−" + N(b.statVariation) + "</b> و<b>+" + N(b.statVariation) + "</b> (غالبًا قريب من الصفر). كل صفة لها حظها.",
                "يضيف ميزة جنس الفرخ، ثم يقرّب للعدد الصحيح، ولا يتجاوز سقف السلالة."
              ]) +
              H.info("<b>مثال (سرعة الحر):</b> الأم سرعتها 30 (منها +2 ميزة أنثى)، والأب 24. الوسط = (28 + 24) ÷ 2 = <b>26</b>. المنتصف 60، فالوسط أقل: 26 + (60 − 26) × " + b.regressionUp + " = <b>27.4</b>، ثم حظ ±4. فرخ أنثى (+2): من 25 إلى 33. فرخ ذكر: من 23 إلى 31.") +
              H.tip("الأبوان الضعيفان ينجبان غالبًا فرخًا أفضل منهما قليلًا، والسلالات القوية جدًا تنزل ببطء نحو المنتصف البري."),
            en: "<p>For each of the 5 stats the server does the same thing:</p>" +
              H.steps([
                "Remove each parent's sex bonus (female: speed +2, stamina +5; male: agility +2, obedience +5), then take the <b>average</b>. Call it <b>mid</b>.",
                "Compare mid with the <b>middle of the wild range</b> of the chick's bloodline (e.g. Saker speed: 50 to 70, middle 60).",
                "If mid is <b>below</b> the middle, the chick climbs " + P(b.regressionUp) + " of the gap. If it is <b>at or above</b>, it falls back " + P(b.regressionToMean) + " of the gap.",
                "Add luck between <b>−" + N(b.statVariation) + "</b> and <b>+" + N(b.statVariation) + "</b> (most often near zero). Each stat rolls its own luck.",
                "Add the chick's own sex bonus, round to a whole number, and keep it under the species cap."
              ]) +
              H.info("<b>Example (Saker speed):</b> mother 30 (incl. her +2), father 24. mid = (28 + 24) ÷ 2 = <b>26</b>. The middle is 60, so mid is below: 26 + (60 − 26) × " + b.regressionUp + " = <b>27.4</b>, then luck ±4. A female chick (+2): 25 to 33. A male chick: 23 to 31.") +
              H.tip("Weak parents usually make a chick a little better than themselves, and very strong lines slowly slip back toward the wild middle.")
          }
        },
        {
          id: "stats-next", title: { ar: "قاعدة الطفرة الجديدة (تحديث 0.1.2)", en: "The new mutation rule (update 0.1.2)" },
          html: {
            ar: H.next("<b>تصل مع تحديث 0.1.2.</b> حتى ذلك الحين تعمل القاعدة السابقة. الخادم هو من يقرر الفرخ، فالقاعدة تتغير للجميع في نفس اللحظة.") +
              "<p>في القاعدة الجديدة لا يوجد حظ ±" + N(b.statVariation) + " على كل الصفات. بدلًا منه:</p>" +
              "<h3>1) دفعة +" + N(push.size) + " بفرصة</h3><p>لكل صفة وسطها أقل من منتصف المدى البري:</p>" +
              H.table(["الوسط", "فرصة +" + push.size], [["أقل من " + N(push.edgeLow), P(push.chanceLow)], [N(push.edgeLow) + " إلى أقل من " + N(push.edgeHigh), P(push.chanceMid)], [N(push.edgeHigh) + " فما فوق", P(push.chanceHigh)]]) +
              "<h3>2) طفرة في صفة واحدة فقط</h3><p>تختار اللعبة <b>صفة واحدة عشوائيًا</b> من الخمس (لكل صفة " + P(0.2) + "). هذه الصفة فقط قد تتحوّر:</p>" +
              H.table(["وسط الصفة المختارة", "فرصة الطفرة", "الاتجاه"], [
                ["أقل من " + N(mut.edgeLow), P(mut.chanceLow), "↑ " + P(mut.upChanceBelow) + " · ↓ " + P(1 - mut.upChanceBelow)],
                [N(mut.edgeLow) + " إلى أقل من " + N(mut.edgeHigh), P(mut.chanceMid), "↑ " + P(mut.upChanceBelow) + " · ↓ " + P(1 - mut.upChanceBelow)],
                [N(mut.edgeHigh) + " فما فوق", P(mut.chanceHigh), "↑ " + P(mut.upChanceAbove) + " · ↓ " + P(1 - mut.upChanceAbove)]]) +
              "<p>حجم الطفرة " + N(mut.sizeMin) + " أو " + N(mut.sizeMax) + " نقطة (بنفس الاحتمال). الصفات الأربع الأخرى تأخذ الدفعة فقط.</p>" +
              H.shots([["hatchery/d_reveal1", "صفحة الفرخ الجديد: علامة الطفرة الحمراء (−) أو الخضراء (+) بجانب الصفة التي تحوّرت"], ["hatchery/d2_reveal1_sell_armed", "احتفظ به أو بعه"]]) +
              H.tip("الطفرة <b>صغيرة ونادرة</b>: صفة واحدة، نقطة أو نقطتان. لا تنتظر قفزات كبيرة؛ السلالة تُبنى بأجيال كثيرة."),
            en: H.next("<b>Arrives with update 0.1.2.</b> Until then the rule above is used. The server decides the chick, so the rule changes for everyone at the same moment.") +
              "<p>The new rule has no ±" + N(b.statVariation) + " luck on every stat. Instead:</p>" +
              "<h3>1) A +" + N(push.size) + " push, by chance</h3><p>For each stat whose mid is below the wild middle:</p>" +
              H.table(["Mid", "Chance of +" + push.size], [["below " + N(push.edgeLow), P(push.chanceLow)], [N(push.edgeLow) + " to under " + N(push.edgeHigh), P(push.chanceMid)], [N(push.edgeHigh) + " and up", P(push.chanceHigh)]]) +
              "<h3>2) A mutation in ONE stat</h3><p>The game picks <b>one random stat</b> of the 5 (" + P(0.2) + " each). Only that stat can mutate:</p>" +
              H.table(["Mid of the picked stat", "Mutation chance", "Direction"], [
                ["below " + N(mut.edgeLow), P(mut.chanceLow), "↑ " + P(mut.upChanceBelow) + " · ↓ " + P(1 - mut.upChanceBelow)],
                [N(mut.edgeLow) + " to under " + N(mut.edgeHigh), P(mut.chanceMid), "↑ " + P(mut.upChanceBelow) + " · ↓ " + P(1 - mut.upChanceBelow)],
                [N(mut.edgeHigh) + " and up", P(mut.chanceHigh), "↑ " + P(mut.upChanceAbove) + " · ↓ " + P(1 - mut.upChanceAbove)]]) +
              "<p>The size is " + N(mut.sizeMin) + " or " + N(mut.sizeMax) + " points (equal chance). The other four stats only get the push.</p>" +
              H.shots([["hatchery/d_reveal1", "New chick page: a red (−) or green (+) mutation mark next to the stat that mutated"], ["hatchery/d2_reveal1_sell_armed", "Keep it or sell it"]]) +
              H.tip("A mutation is <b>small and rare</b>: one stat, 1 or 2 points. Don't expect big jumps; a line is built over many generations.")
          }
        },
        {
          id: "calc", title: { ar: "حاسبة التزاوج", en: "Breeding calculator" },
          html: {
            ar: "<p>أدخل صفات الأم والأب كما تظهر في بطاقة الصقر. الحاسبة تُجري 20,000 تزاوج بنفس قواعد الخادم وتريك المدى والاحتمالات. الأعمدة الزرقاء = متوسط الأبوين.</p>" + H.w("breed"),
            en: "<p>Enter the mother's and father's stats as shown on the falcon card. The calculator runs 20,000 matings with the server's own rules and shows the range and chances. Blue bars = the parents' average.</p>" + H.w("breed")
          }
        },
        {
          id: "colours", title: { ar: "الألوان والجينات المخفية", en: "Colours and hidden genes" },
          html: {
            ar: "<p>للصقر 4 مناطق لون: الرأس، الظهر، الصدر، الذيل. لكل منطقة <b>جينان</b>. الذي يظهر هو الأقوى:</p>" +
              H.table(["اللون", "القوة"], D("colors").slice().sort(function (x, y) { return y.dominance - x.dominance; }).map(function (c) { return [H.sw(c.id) + B.T(B.COLOR_NAMES[c.id]), N(c.dominance)]; })) +
              H.steps(["يأخذ الفرخ جينًا عشوائيًا من جيني الأم (50/50).", "ويأخذ جينًا عشوائيًا من جيني الأب (50/50).", "فرصة طفرة لون " + P(D("colorRegions.mutationChance"), 1) + " لكل منطقة: تصبح المنطقة <b>سوداء أو بيضاء</b> (50/50) على الجينين معًا."]) +
              H.info("<b>الأبيض أضعف لون:</b> لا يظهر إلا إذا كان الجينان أبيضين. لذلك قد يختبئ في الأبوين ويظهر في الفرخ. جرّب في الحاسبة: أم فضي+أبيض وأب رمادي+أبيض = فرصة " + P(0.25) + " لرأس أبيض.") +
              H.w("genes") +
              "<p><b>فحص الجينات</b> (" + N(D("hospital.geneTestPearls")) + " لؤلؤة، مرة واحدة لكل صقر) يكشف الجينات المخفية. بدونه ترى اللون الظاهر فقط.</p>" +
              H.shots([["hatchery/f_reveal2_white", "فرخ أبيض نادر"], ["hatchery/g_detail_colour", "تفاصيل الصقر: السلالة واللون"]]) +
              H.tip("السواد لا يأتي من البرية أبدًا؛ مصدره الوحيد طفرة اللون. والحر والشاهين لا يحملان الأبيض إلا بطفرة."),
            en: "<p>A falcon has 4 colour regions: head, back, chest, tail. Each region has <b>two genes</b>. The stronger one shows:</p>" +
              H.table(["Colour", "Strength"], D("colors").slice().sort(function (x, y) { return y.dominance - x.dominance; }).map(function (c) { return [H.sw(c.id) + B.T(B.COLOR_NAMES[c.id]), N(c.dominance)]; })) +
              H.steps(["The chick takes one random gene from the mother's two (50/50).", "And one random gene from the father's two (50/50).", "A colour mutation chance of " + P(D("colorRegions.mutationChance"), 1) + " per region: the region turns <b>black or white</b> (50/50) on both genes."]) +
              H.info("<b>White is the weakest colour:</b> it shows only when both genes are white. So it can hide in both parents and appear in the chick. Try it: mother silver+white and father grey+white = a " + P(0.25) + " chance of a white head.") +
              H.w("genes") +
              "<p>The <b>Gene test</b> (" + N(D("hospital.geneTestPearls")) + " Pearls, once per falcon) shows the hidden genes. Without it you see only the visible colour.</p>" +
              H.shots([["hatchery/f_reveal2_white", "A rare white chick"], ["hatchery/g_detail_colour", "Falcon details: bloodline and colour"]]) +
              H.tip("Black never comes from the wild; its only source is a colour mutation. Saker and Peregrine lines carry white only through a mutation.")
          }
        },
        {
          id: "hybrids", title: { ar: "الهجين", en: "Hybrids" },
          html: {
            ar: "<p>لكل صقر دم من " + N(1024) + " جزء بين السلالات. الفرخ يأخذ نصف دم الأم ونصف دم الأب.</p>" +
              H.table(["الأبوان", "الفرخ"], [["حر صافٍ × جير صافٍ", "512 حر + 512 جير (هجين 50/50)"], ["ذلك الهجين × جير صافٍ", "768 جير + 256 حر"]]) +
              "<p>منتصف المدى البري والسقف للهجين = متوسط موزون بدم كل سلالة. كل الهجين يتسابق في فئة <b>هجين</b> واحدة لكل جنس.</p>",
            en: "<p>Every falcon has a bloodline of " + N(1024) + " parts split between species. A chick gets half of the mother's and half of the father's.</p>" +
              H.table(["Parents", "Chick"], [["pure Saker × pure Gyr", "512 Saker + 512 Gyr (a 50/50 hybrid)"], ["that hybrid × pure Gyr", "768 Gyr + 256 Saker"]]) +
              "<p>A hybrid's wild middle and caps are the bloodline-weighted average of its species. All hybrids race in one <b>Hybrid</b> category per sex.</p>"
          }
        },
        {
          id: "limits", title: { ar: "الراحة والحدود والمعززات", en: "Rests, limits and boosters" },
          html: {
            ar: H.kpis([[N(b.femaleCooldownHours) + " س", "راحة الأنثى بعد كل تزاوج"], [N(nests.maxFemalesPerDay), "إناث لكل ذكر في اليوم"], ["+" + N(nests.boostedFemalesPerDay - nests.maxFemalesPerDay), "لكل معزز تزاوج"], [N(D("hospital.geneTestPearls")), "لؤلؤة لفحص الجينات"]]) +
              H.table(["الأداة", "السعر", "ماذا تفعل"], [
                ["معزز التزاوج", N(D("shop.items[boost_breeding].pearls")) + " لؤلؤة", "يُستخدم فقط عندما ينتهي حد الذكر اليومي، ويضيف +" + N(nests.boostedFemalesPerDay - nests.maxFemalesPerDay) + " حتى نهاية اليوم"],
                ["معزز راحة الأنثى", N(D("shop.items[med_female_rest].pearls")) + " لؤلؤة", "ينهي راحة الأنثى فورًا"],
                ["الساعة الرملية", N(D("shop.pearlsPerSandglass")) + " لؤلؤة للساعة", "تخطي ساعة من الانتظار؛ آخر " + N(D("shop.skips.freeFinishMinutes")) + " دقائق مجانية"],
                ["مستشار التزاوج", D("shop.advisorPlans").map(function (a) { return N(a.days) + " يوم: " + N(a.pearls); }).join(" · ") + " لؤلؤة", "يريك أقل وأوسط وأعلى قيمة ممكنة لكل صفة قبل التزاوج"]]) +
              H.shots([["market/store_advisor", "مستشار التزاوج في المتجر"]]) +
              H.tip("الحد اليومي على <b>الذكر</b> وليس عليك: ذكور جيدة أكثر = فراخ أكثر في اليوم. اليوم هو يوم الخليج (UTC+4)."),
            en: H.kpis([[N(b.femaleCooldownHours) + " h", "female rest after each mating"], [N(nests.maxFemalesPerDay), "females per male per day"], ["+" + N(nests.boostedFemalesPerDay - nests.maxFemalesPerDay), "per Breeding Booster"], [N(D("hospital.geneTestPearls")), "Pearls for a Gene test"]]) +
              H.table(["Tool", "Price", "What it does"], [
                ["Breeding Booster", N(D("shop.items[boost_breeding].pearls")) + " Pearls", "Usable only when the male's daily limit is used up; adds +" + N(nests.boostedFemalesPerDay - nests.maxFemalesPerDay) + " until the day ends"],
                ["Female Rest Booster", N(D("shop.items[med_female_rest].pearls")) + " Pearls", "Ends the female's rest at once"],
                ["Sand-glass", N(D("shop.pearlsPerSandglass")) + " Pearls per hour", "Skip an hour of waiting; the last " + N(D("shop.skips.freeFinishMinutes")) + " minutes are free"],
                ["Pairing Advisor", D("shop.advisorPlans").map(function (a) { return N(a.days) + " days: " + N(a.pearls); }).join(" · ") + " Pearls", "Shows the lowest, middle and highest value each stat can get, before you breed"]]) +
              H.shots([["market/store_advisor", "The Pairing Advisor in the Store"]]) +
              H.tip("The daily limit is on the <b>male</b>, not on you: more good males = more chicks a day. The day is the Gulf day (UTC+4).")
          }
        }
      ];
    }
  });
})(window.Book);
