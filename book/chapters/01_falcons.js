/* Chapter 1 - Falcons. Facts: Docs/Systems/01_falcons.md. Every number comes from data.js through B.D(). */
(function (B) {
  var D = B.D, N = B.N, P = B.P, H = B.H, T = B.T;
  var ST = B.STATS, SN = B.STAT_NAMES, SPN = B.SPECIES_NAMES, CN = B.COLOR_NAMES, RN = B.REGION_NAMES;
  var SP = ["saker", "peregrine", "gyr"];
  var REG = ["head", "back", "chest", "tail"];

  function ico(name, size) { return '<img src="icons/' + name + '.png" alt="" style="width:' + (size || 28) + 'px;height:' + (size || 28) + 'px;vertical-align:middle;margin-inline-end:6px">'; }

  // chance that each colour shows in one region: two weighted picks, the stronger (higher dominance) one shows
  function visibleOdds(weights) {
    var cols = D("colors").slice().sort(function (a, b) { return a.dominance - b.dominance; });
    var total = 0, below = 0, out = {};
    cols.forEach(function (c) { total += weights[c.id] || 0; });
    cols.forEach(function (c) {
      var w = (weights[c.id] || 0) / total, upTo = below + w;
      out[c.id] = upTo * upTo - below * below;
      below = upTo;
    });
    return out;
  }
  function pct(x) { return x >= 0.995 ? "100%" : (Math.round(x * 1000) / 10) + "%"; }
  function oddsCell(sp, region) {
    var o = visibleOdds(D("species[" + sp + "].regionColorWeights." + region));
    return D("colors").slice().sort(function (a, b) { return b.dominance - a.dominance; }).filter(function (c) { return o[c.id] >= 0.005; })
      .map(function (c) { return H.sw(c.id) + pct(o[c.id]); }).join(" &nbsp; ");
  }
  function solidOdds(sp, colour) {
    var p = 1;
    REG.forEach(function (r) { p *= visibleOdds(D("species[" + sp + "].regionColorWeights." + r))[colour] || 0; });
    return p;
  }
  function statRow(sp, st) { return D("species[" + sp + "].stats." + st); }
  function rangeItems(sp) {
    return ST.map(function (st) { var s = statRow(sp, st); return { label: SN[st], min: s.wildMin, max: s.wildMax }; });
  }

  B.chapter({
    id: "falcons", order: 1, icon: "icons/bar_falcon_head.png",
    title: { ar: "الصقور", en: "Falcons" },
    blurb: { ar: "الأنواع الثلاثة، الصفات الخمس، الألوان والجينات، الندرة والعمر. كل ما تحتاج معرفته عن صقرك.", en: "The three species, the five stats, colours and genes, rarity and age. Everything about your falcon." },
    sections: function () {
      var rar = D("rarity"), tiers = rar.tiers, w = rar.statWeights;
      function tierMin(id) { return D("rarity.tiers[" + id + "].minScore"); }
      var sexF = D("sexModifiers.female"), sexM = D("sexModifiers.male");
      var tierBase = D("economy.valuation.tierBase");
      var relP = D("release.prestige");
      var wt = D("species"), rw = D("randomSpeciesWeights");

      return [
        {
          id: "species", title: { ar: "الأنواع", en: "Species" },
          html: {
            ar: "<p>في اللعبة ثلاثة أنواع صافية من الصقور. ولكل نوع طبعه:</p>" +
              H.table(["النوع", "نقاط قوته (منتصف المدى البري)", "الجسم"], [
                [ico("crest_saker") + "<b>الحر</b>", "التحمل " + N((statRow("saker", "stamina").wildMin + statRow("saker", "stamina").wildMax) / 2) + " · الطاعة " + N((statRow("saker", "obedience").wildMin + statRow("saker", "obedience").wildMax) / 2) + " · السرعة " + N((statRow("saker", "speed").wildMin + statRow("saker", "speed").wildMax) / 2), "متوسط"],
                [ico("crest_peregrine") + "<b>الشاهين</b>", "السرعة " + N((statRow("peregrine", "speed").wildMin + statRow("peregrine", "speed").wildMax) / 2) + " · الرشاقة " + N((statRow("peregrine", "agility").wildMin + statRow("peregrine", "agility").wildMax) / 2), "خفيف"],
                [ico("crest_gyr") + "<b>الجير</b>", "الجمال " + N((statRow("gyr", "beauty").wildMin + statRow("gyr", "beauty").wildMax) / 2) + " (سقفه " + N(statRow("gyr", "beauty").cap) + ") · التحمل " + N((statRow("gyr", "stamina").wildMin + statRow("gyr", "stamina").wildMax) / 2) + " · السرعة " + N((statRow("gyr", "speed").wildMin + statRow("gyr", "speed").wildMax) / 2), "الأكبر"]]) +
              "<p>الصقر الذي تراه في السوق أو يخرج من البيضة يُسحب عشوائيًا: حر " + P(rw.saker) + "، شاهين " + P(rw.peregrine) + "، جير " + P(rw.gyr) + ".</p>" +
              "<h3>الهجين</h3>" +
              "<p>لكل صقر دم من " + N(1024) + " جزء موزّعة بين الأنواع. الصقر الصافي كله من نوع واحد. أي شيء غير ذلك <b>هجين</b>. الفرخ يأخذ نصف دم الأم ونصف دم الأب.</p>" +
              H.table(["الأبوان", "الفرخ"], [["حر صافٍ × جير صافٍ", "512 حر + 512 جير (هجين 50/50)"], ["ذلك الهجين × جير صافٍ", "768 جير + 256 حر"]]) +
              "<p>مدى الهجين وسقفه ووزنه = متوسط موزون بدم كل نوع. ويتسابق كل الهجين في فئة <b>هجين</b> واحدة. فئات السباق ثمانٍ: حر وشاهين وجير وهجين، لكل منها إناث وذكور.</p>" +
              H.shots([["mews/mews_05_species", "المقر: اختر النوع في بطاقة الصقر"], ["mews/mews_03_sheet", "الترتيب والتصفية في المقر"]]),
            en: "<p>The game has three pure species. Each has its own character:</p>" +
              H.table(["Species", "Strong stats (middle of the wild range)", "Body"], [
                [ico("crest_saker") + "<b>Saker</b>", "Stamina " + N((statRow("saker", "stamina").wildMin + statRow("saker", "stamina").wildMax) / 2) + " · Obedience " + N((statRow("saker", "obedience").wildMin + statRow("saker", "obedience").wildMax) / 2) + " · Speed " + N((statRow("saker", "speed").wildMin + statRow("saker", "speed").wildMax) / 2), "medium"],
                [ico("crest_peregrine") + "<b>Peregrine</b>", "Speed " + N((statRow("peregrine", "speed").wildMin + statRow("peregrine", "speed").wildMax) / 2) + " · Agility " + N((statRow("peregrine", "agility").wildMin + statRow("peregrine", "agility").wildMax) / 2), "light"],
                [ico("crest_gyr") + "<b>Gyrfalcon</b>", "Beauty " + N((statRow("gyr", "beauty").wildMin + statRow("gyr", "beauty").wildMax) / 2) + " (cap " + N(statRow("gyr", "beauty").cap) + ") · Stamina " + N((statRow("gyr", "stamina").wildMin + statRow("gyr", "stamina").wildMax) / 2) + " · Speed " + N((statRow("gyr", "speed").wildMin + statRow("gyr", "speed").wildMax) / 2), "biggest"]]) +
              "<p>A falcon in the market or from an egg is drawn at random: Saker " + P(rw.saker) + ", Peregrine " + P(rw.peregrine) + ", Gyr " + P(rw.gyr) + ".</p>" +
              "<h3>Hybrids</h3>" +
              "<p>Every falcon has a bloodline of " + N(1024) + " parts split between species. A pure falcon is all one species. Anything else is a <b>hybrid</b>. A chick gets half of the mother's and half of the father's bloodline.</p>" +
              H.table(["Parents", "Chick"], [["pure Saker × pure Gyr", "512 Saker + 512 Gyr (a 50/50 hybrid)"], ["that hybrid × pure Gyr", "768 Gyr + 256 Saker"]]) +
              "<p>A hybrid's range, cap and weight = the bloodline-weighted average of its species. All hybrids race in one <b>Hybrid</b> category. There are eight race categories: Saker, Peregrine, Gyr and Hybrid, each female and male.</p>" +
              H.shots([["mews/mews_05_species", "The Mews: the species shows on the falcon card"], ["mews/mews_03_sheet", "Sort and filter in the Mews"]])
          }
        },
        {
          id: "stats", title: { ar: "الصفات الخمس", en: "The five stats" },
          html: {
            ar: "<p>كل صقر له خمس صفات، من 0 إلى 100:</p>" +
              H.table(["الصفة", "ماذا تعمل"], [
                [ico("stat_speed") + "<b>السرعة</b>", "أقصى سرعة في السباق"],
                [ico("stat_stamina") + "<b>التحمل</b>", "كم يبقى قويًا قبل أن يتعب"],
                [ico("stat_agility") + "<b>الرشاقة</b>", "سرعة الانطلاق وتصحيح المسار"],
                [ico("stat_obedience") + "<b>الطاعة</b>", "يبقى على الخط ولا يميل نحو الجدران"],
                [ico("stat_beauty") + "<b>الجمال</b>", "لا يدخل السباق. يدخل في الندرة والسعر فقط"]]) +
              "<h3>المدى البري وسقف كل نوع</h3>" +
              "<p>المدى البري هو مدى الصقر الطبيعي في البرية، وهو الهدف الذي تتجه إليه الفراخ عند التزاوج. السقف هو أعلى قيمة تولد بها الصفة (قبل ميزة الجنس).</p>" +
              H.table(["الصفة", "الحر (مدى · سقف)", "الشاهين (مدى · سقف)", "الجير (مدى · سقف)"], ST.map(function (st) {
                return [SN[st].ar].concat(SP.map(function (sp) { var s = statRow(sp, st); return N(s.wildMin) + "–" + N(s.wildMax) + " · " + N(s.cap); }));
              })) +
              H.w("ranges", { title: { ar: "المدى البري: الحر", en: "Wild range: Saker" }, scaleMax: 100, items: rangeItems("saker") }) +
              H.w("ranges", { title: { ar: "المدى البري: الشاهين", en: "Wild range: Peregrine" }, scaleMax: 100, items: rangeItems("peregrine") }) +
              H.w("ranges", { title: { ar: "المدى البري: الجير", en: "Wild range: Gyr" }, scaleMax: 100, items: rangeItems("gyr") }) +
              H.info("سقف الصقر الحقيقي = سقف نوعه (موزونًا بالدم) + ميزة جنسه، ولا يتجاوز 100. مثال: سقف تحمل أنثى الحر = " + N(statRow("saker", "stamina").cap) + " + " + N(sexF.stamina) + " = " + N(statRow("saker", "stamina").cap + sexF.stamina) + ".") +
              H.tip("التدريب يضيف فوق الصفة المولودة حتى +" + N(D("training.maxBonusPerStat")) + " لكل صفة، ولا يتجاوز المجموع 100 (انظر فصل التدريب)."),
            en: "<p>Every falcon has five stats, from 0 to 100:</p>" +
              H.table(["Stat", "What it does"], [
                [ico("stat_speed") + "<b>Speed</b>", "Top speed in a race"],
                [ico("stat_stamina") + "<b>Stamina</b>", "How long it stays strong before it tires"],
                [ico("stat_agility") + "<b>Agility</b>", "How fast it starts and corrects its line"],
                [ico("stat_obedience") + "<b>Obedience</b>", "Stays on the line and avoids the walls"],
                [ico("stat_beauty") + "<b>Beauty</b>", "Not used in races. It counts for rarity and price only"]]) +
              "<h3>Wild range and cap per species</h3>" +
              "<p>The wild range is what a wild falcon normally has. It is also the target middle that chicks move toward when you breed. The cap is the highest value a stat can be born with (before the sex bonus).</p>" +
              H.table(["Stat", "Saker (range · cap)", "Peregrine (range · cap)", "Gyr (range · cap)"], ST.map(function (st) {
                return [SN[st].en].concat(SP.map(function (sp) { var s = statRow(sp, st); return N(s.wildMin) + "–" + N(s.wildMax) + " · " + N(s.cap); }));
              })) +
              H.w("ranges", { title: { ar: "المدى البري: الحر", en: "Wild range: Saker" }, scaleMax: 100, items: rangeItems("saker") }) +
              H.w("ranges", { title: { ar: "المدى البري: الشاهين", en: "Wild range: Peregrine" }, scaleMax: 100, items: rangeItems("peregrine") }) +
              H.w("ranges", { title: { ar: "المدى البري: الجير", en: "Wild range: Gyr" }, scaleMax: 100, items: rangeItems("gyr") }) +
              H.info("A falcon's real cap = its species cap (weighted by bloodline) + its sex bonus, never above 100. Example: a female Saker's stamina cap = " + N(statRow("saker", "stamina").cap) + " + " + N(sexF.stamina) + " = " + N(statRow("saker", "stamina").cap + sexF.stamina) + ".") +
              H.tip("Training adds on top of the born stat, up to +" + N(D("training.maxBonusPerStat")) + " per stat, and the total never passes 100 (see the Training chapter).")
          }
        },
        {
          id: "sex", title: { ar: "الأنثى والذكر", en: "Female and male" },
          html: {
            ar: H.table(["", ico("sex_female") + "أنثى", ico("sex_male") + "ذكر"], [
              ["ميزة الصفات", "التحمل +" + N(sexF.stamina) + " · السرعة +" + N(sexF.speed), "الطاعة +" + N(sexM.obedience) + " · الرشاقة +" + N(sexM.agility)],
              ["وزن الحر", N(wt[0].weightGrams.female.min) + "–" + N(wt[0].weightGrams.female.max) + " غ", N(wt[0].weightGrams.male.min) + "–" + N(wt[0].weightGrams.male.max) + " غ"],
              ["وزن الشاهين", N(wt[1].weightGrams.female.min) + "–" + N(wt[1].weightGrams.female.max) + " غ", N(wt[1].weightGrams.male.min) + "–" + N(wt[1].weightGrams.male.max) + " غ"],
              ["وزن الجير", N(wt[2].weightGrams.female.min) + "–" + N(wt[2].weightGrams.female.max) + " غ", N(wt[2].weightGrams.male.min) + "–" + N(wt[2].weightGrams.male.max) + " غ"],
              ["راحة بعد التزاوج", N(D("breeding.femaleCooldownHours")) + " ساعة", "بلا راحة"],
              ["حد التزاوج", "بيضة لكل تزاوج", "حتى " + N(D("nests.maxFemalesPerDay")) + " إناث في اليوم"],
              ["مدة جلسة التدريب", "100%", P(D("training.maleDurationMultiplier")) + " (الذكور أسرع)"],
              ["قيمة السوق", "×" + N(D("economy.valuation.sexMultiplier.female")), "×" + N(D("economy.valuation.sexMultiplier.male"))]]) +
              "<p>جنس الفرخ <b>50/50</b> بالقرعة. ميزة الجنس جزء من الرقم الذي تراه على البطاقة. عند التزاوج تحذف اللعبة ميزة جنس الأبوين ثم تضيف ميزة جنس الفرخ (التفاصيل في فصل التزاوج).</p>" +
              H.tip("الإناث أقوى وأكبر وأغلى، والذكور أسرع تدريبًا وأطوع. لا تستغنِ عن أحد الجنسين: التزاوج يحتاج أنثى وذكرًا."),
            en: H.table(["", ico("sex_female") + "Female", ico("sex_male") + "Male"], [
              ["Stat bonus", "Stamina +" + N(sexF.stamina) + " · Speed +" + N(sexF.speed), "Obedience +" + N(sexM.obedience) + " · Agility +" + N(sexM.agility)],
              ["Saker weight", N(wt[0].weightGrams.female.min) + "–" + N(wt[0].weightGrams.female.max) + " g", N(wt[0].weightGrams.male.min) + "–" + N(wt[0].weightGrams.male.max) + " g"],
              ["Peregrine weight", N(wt[1].weightGrams.female.min) + "–" + N(wt[1].weightGrams.female.max) + " g", N(wt[1].weightGrams.male.min) + "–" + N(wt[1].weightGrams.male.max) + " g"],
              ["Gyr weight", N(wt[2].weightGrams.female.min) + "–" + N(wt[2].weightGrams.female.max) + " g", N(wt[2].weightGrams.male.min) + "–" + N(wt[2].weightGrams.male.max) + " g"],
              ["Rest after mating", N(D("breeding.femaleCooldownHours")) + " hours", "no rest"],
              ["Breeding limit", "one egg per mating", "up to " + N(D("nests.maxFemalesPerDay")) + " females a day"],
              ["Training session length", "100%", P(D("training.maleDurationMultiplier")) + " (males train faster)"],
              ["Market value", "×" + N(D("economy.valuation.sexMultiplier.female")), "×" + N(D("economy.valuation.sexMultiplier.male"))]]) +
              "<p>A chick's sex is a <b>50/50</b> coin flip. The sex bonus is already inside the number you see on the card. When breeding, the game removes the parents' sex bonus and adds the chick's own (details in the Breeding chapter).</p>" +
              H.tip("Females are stronger, bigger and worth more; males train faster and obey better. You need both: a pair is always one female and one male.")
          }
        },
        {
          id: "start", title: { ar: "ماذا تبدأ به فعلًا", en: "What you really start with" },
          html: {
            ar: H.kpis([[N(D("starter.statRange.min")) + "–" + N(D("starter.statRange.max")), "صفات صقريك الأولين (أنثى + ذكر)"], [N(D("market.statRange.min")) + "–" + N(D("market.statRange.max")), "صفات صقور السوق"], [N(D("starter.females") + D("starter.males")), "صقران في البداية"]]) +
              "<p>المدى البري (الجدول في قسم الصفات) <b>ليس</b> ما يبدأ به صقرك. الصقور الجديدة صغيرة القوة، وتكبر بالتزاوج (الفراخ تتجه نحو منتصف المدى البري) وبالتدريب. صقرا البداية بلا ميزة جنس، ولا يكونان أبيضين أبدًا.</p>" +
              H.shots([["falcon/falcon_01_page", "صفحة الصقر: الصفات الخمس بالأعلى"], ["mews/mews_02_mews", "المقر: صقورك"]]) +
              H.tip("قوة صقرك الحقيقية تأتي من الأجيال: تزاوج، اختر الأفضل، دربه. لا تنتظر أن تشتري صقرًا قويًا من البداية."),
            en: H.kpis([[N(D("starter.statRange.min")) + "–" + N(D("starter.statRange.max")), "stats of your two starter falcons (female + male)"], [N(D("market.statRange.min")) + "–" + N(D("market.statRange.max")), "stats of falcons in the market"], [N(D("starter.females") + D("starter.males")), "falcons at the start"]]) +
              "<p>The wild range (see the stats section) is <b>not</b> what your falcon starts with. New falcons are weak and grow through breeding (chicks move toward the middle of the wild range) and training. The two starters have no sex bonus and are never white.</p>" +
              H.shots([["falcon/falcon_01_page", "The falcon page: the five stats at the top"], ["mews/mews_02_mews", "The Mews: your falcons"]]) +
              H.tip("Real power comes from generations: breed, keep the best, train them. Don't expect to buy a strong falcon on day one.")
          }
        },
        {
          id: "colours", title: { ar: "الألوان والجينات", en: "Colours and genes" },
          html: {
            ar: "<p>للصقر أربع مناطق لون: الرأس والظهر والصدر والذيل. وزن كل منطقة في اللون العام والندرة: " + REG.map(function (r) { return RN[r].ar + " " + N(D("colorRegions.regionWeights." + r)); }).join("، ") + ". لكل منطقة <b>جينان</b>، والذي يظهر هو الأقوى:</p>" +
              H.table(["اللون", "القوة", "ملاحظة"], D("colors").slice().sort(function (x, y) { return y.dominance - x.dominance; }).map(function (c) {
                return [H.sw(c.id) + CN[c.id].ar, N(c.dominance), c.id === "black" ? "لا يوجد في البرية؛ يأتي من الطفرة فقط" : c.id === "white" ? "يظهر فقط إذا كان الجينان أبيضين" : ""];
              })) +
              "<h3>ألوان الصقور البرية</h3><p>هذه فرصة ظهور كل لون في كل منطقة عند صقر بري:</p>" +
              H.table(["المنطقة", "الحر", "الشاهين", "الجير"], REG.map(function (r) { return [RN[r].ar].concat(SP.map(function (sp) { return oddsCell(sp, r); })); })) +
              "<p>الجير وحده يحمل الأبيض في جيناته. الحر والشاهين بلا أبيض وبلا أسود.</p>" +
              "<h3>اللون الموحّد</h3><p>إذا كانت المناطق الأربع كلها بنفس اللون فالصقر \"موحّد\" وتزيد قيمته. فرصة ظهور صقر بري موحّد: جير أبيض " + pct(solidOdds("gyr", "white")) + " (حوالي 1 من " + N(Math.round(1 / solidOdds("gyr", "white"))) + ")، جير فضي " + pct(solidOdds("gyr", "silver")) + "، جير رمادي " + pct(solidOdds("gyr", "grey")) + "، حر بني " + pct(solidOdds("saker", "brown")) + "، شاهين رمادي " + pct(solidOdds("peregrine", "grey")) + ". الأسود الموحّد مستحيل في البرية.</p>" +
              "<h3>الطفرة والجينات المخفية</h3>" +
              H.kpis([[P(D("colorRegions.mutationChance"), 1), "فرصة طفرة لون لكل منطقة"], [N(D("hospital.geneTestPearls")), "لؤلؤة لفحص الجينات"]]) +
              "<p>عند الفقس قد تتحوّر منطقة فتصبح <b>سوداء أو بيضاء</b> (50/50) على الجينين معًا. هذا هو المصدر الوحيد للأسود، والطريق الوحيد ليحمل الحر أو الشاهين الأبيض. اللون المخفي لا تراه إلا بـ<b>فحص الجينات</b> (مرة واحدة لكل صقر). كيف تنتقل الجينات بين الأجيال في فصل التزاوج.</p>" +
              H.shots([["hatchery/f_reveal2_white", "فرخ أبيض نادر عند كشف اللون"], ["hatchery/g_detail_colour", "تفاصيل الصقر: السلالة واللون"]]) +
              H.tip("الجير الأبيض الموحّد أندر شكل في البرية. أبوان فضيّان قد ينجبان فرخًا أبيض إذا كان كلاهما يحمل جين أبيض مخفي."),
            en: "<p>A falcon has four colour regions: head, back, chest and tail. How much each region counts for the overall colour and rarity: " + REG.map(function (r) { return RN[r].en + " " + N(D("colorRegions.regionWeights." + r)); }).join(", ") + ". Each region has <b>two genes</b>, and the stronger one shows:</p>" +
              H.table(["Colour", "Strength", "Note"], D("colors").slice().sort(function (x, y) { return y.dominance - x.dominance; }).map(function (c) {
                return [H.sw(c.id) + CN[c.id].en, N(c.dominance), c.id === "black" ? "Not in the wild; only from a mutation" : c.id === "white" ? "Shows only when both genes are white" : ""];
              })) +
              "<h3>Wild colours</h3><p>The chance that each colour shows in each region of a wild falcon:</p>" +
              H.table(["Region", "Saker", "Peregrine", "Gyr"], REG.map(function (r) { return [RN[r].en].concat(SP.map(function (sp) { return oddsCell(sp, r); })); })) +
              "<p>Only the Gyr carries white in its genes. Saker and Peregrine have no white and no black.</p>" +
              "<h3>Solid colour</h3><p>If all four regions are the same colour the falcon is \"solid\" and worth more. Chance for a wild falcon to be solid: white Gyr " + pct(solidOdds("gyr", "white")) + " (about 1 in " + N(Math.round(1 / solidOdds("gyr", "white"))) + "), silver Gyr " + pct(solidOdds("gyr", "silver")) + ", grey Gyr " + pct(solidOdds("gyr", "grey")) + ", brown Saker " + pct(solidOdds("saker", "brown")) + ", grey Peregrine " + pct(solidOdds("peregrine", "grey")) + ". A solid black is impossible in the wild.</p>" +
              "<h3>Mutation and hidden genes</h3>" +
              H.kpis([[P(D("colorRegions.mutationChance"), 1), "colour mutation chance per region"], [N(D("hospital.geneTestPearls")), "Pearls for a Gene test"]]) +
              "<p>At hatching a region may mutate and turn <b>black or white</b> (50/50) on both genes. This is the only source of black, and the only way a Saker or Peregrine line gets white. A hidden colour shows only with the <b>Gene test</b> (once per falcon). How genes pass between generations is in the Breeding chapter.</p>" +
              H.shots([["hatchery/f_reveal2_white", "A rare white chick at the colour reveal"], ["hatchery/g_detail_colour", "Falcon details: bloodline and colour"]]) +
              H.tip("A solid white Gyr is the rarest wild look. Two silver parents can still make a white chick if both carry a hidden white gene.")
          }
        },
        {
          id: "rarity", title: { ar: "الندرة", en: "Rarity" },
          html: {
            ar: "<p>درجة الندرة = <b>متوسط الصفات الموزون</b> + <b>مكافأة اللون</b>.</p>" +
              H.table(["الصفة", "الوزن"], ST.map(function (st) { return [ico("stat_" + st, 22) + SN[st].ar, N(w[st])]; })) +
              H.table(["اللون", "مكافأة اللون", "زيادة إذا كان موحّدًا"], D("colors").slice().sort(function (x, y) { return y.dominance - x.dominance; }).map(function (c) {
                return [H.sw(c.id) + CN[c.id].ar, N(rar.colorBonus[c.id]), "+" + N(rar.solidColorBonus[c.id] || 0)];
              })) +
              "<p>مكافأة اللون هي متوسط مكافأة ألوان المناطق الأربع (بأوزانها). الأسود والأبيض يعطيان +" + N(rar.colorBonus.white) + " ويزيدان إلى +" + N(rar.colorBonus.white + rar.solidColorBonus.white) + " عند التوحيد.</p>" +
              "<h3>المراتب</h3>" +
              H.table(["المرتبة", "أقل درجة", "القيمة الأساسية", "نقاط التقدير عند الإطلاق"], tiers.map(function (t) { return [H.tag(t.id), N(t.minScore), N(tierBase[t.id]) + " عملة", N(relP[t.id])]; })) +
              H.info("<b>أمثلة:</b> صقر البداية (كل الصفات 17، فضي) = 18 = عادي. كل الصفات 60 مع أبيض موحّد = 76 = نخبة. كل الصفات 70 مع أبيض موحّد = 86 = أسطوري. كل الصفات 70 بلون فضي عادي = 71 = نخبة.") +
              "<p>جرّب بنفسك:</p>" + H.w("rarity") +
              H.shots([["rarity/rarity_detail_03", "صفحة صقر أسطوري"], ["rarity/rarity_reveal_04", "كشف الفرخ الجديد"]]) +
              H.tip("الجمال لا يساعد في السباق، لكن وزنه " + N(w.beauty) + " في الندرة. والأبيض أو الأسود الموحّد يضيف " + N(rar.colorBonus.white + rar.solidColorBonus.white) + " نقطة: مرتبة كاملة أو أكثر."),
            en: "<p>Rarity score = the <b>weighted stat average</b> + the <b>colour bonus</b>.</p>" +
              H.table(["Stat", "Weight"], ST.map(function (st) { return [ico("stat_" + st, 22) + SN[st].en, N(w[st])]; })) +
              H.table(["Colour", "Colour bonus", "Extra if solid"], D("colors").slice().sort(function (x, y) { return y.dominance - x.dominance; }).map(function (c) {
                return [H.sw(c.id) + CN[c.id].en, N(rar.colorBonus[c.id]), "+" + N(rar.solidColorBonus[c.id] || 0)];
              })) +
              "<p>The colour bonus is the average of the four regions' bonuses (by region weight). Black and white give +" + N(rar.colorBonus.white) + " and go up to +" + N(rar.colorBonus.white + rar.solidColorBonus.white) + " when solid.</p>" +
              "<h3>Tiers</h3>" +
              H.table(["Tier", "Minimum score", "Base value", "Prestige when released"], tiers.map(function (t) { return [H.tag(t.id), N(t.minScore), N(tierBase[t.id]) + " coins", N(relP[t.id])]; })) +
              H.info("<b>Examples:</b> a starter (all stats 17, silver) = 18 = Common. All stats 60 and solid white = 76 = Elite. All stats 70 and solid white = 86 = Legendary. All stats 70 in plain silver = 71 = Elite.") +
              "<p>Try it yourself:</p>" + H.w("rarity") +
              H.shots([["rarity/rarity_detail_03", "A Legendary falcon's page"], ["rarity/rarity_reveal_04", "The new chick reveal"]]) +
              H.tip("Beauty does not help in a race, but it weighs " + N(w.beauty) + " in rarity. A solid white or black adds " + N(rar.colorBonus.white + rar.solidColorBonus.white) + " points: a full tier or more.")
          }
        },
        {
          id: "age", title: { ar: "مراحل العمر", en: "Age stages" },
          html: {
            ar: "<p>العمر يُحسب من لحظة الفقس.</p>" +
              H.w("timeline", { title: { ar: "عمر الصقر", en: "A falcon's life" }, items: [
                { icon: "🐣", label: { ar: "صغير", en: "Young" }, text: { ar: "من 0 إلى " + D("age.youngUntilHours") + " ساعة", en: "0 to " + D("age.youngUntilHours") + " hours" } },
                { icon: "🦅", label: { ar: "بالغ", en: "Prime" }, text: { ar: "حتى " + D("age.retiredAfterHours") + " ساعة (" + D("age.retiredAfterHours") / 24 + " يومًا)", en: "until " + D("age.retiredAfterHours") + " hours (" + D("age.retiredAfterHours") / 24 + " days)" } },
                { icon: "🪶", label: { ar: "متقاعد", en: "Retired" }, text: { ar: "بعد ذلك إلى الأبد", en: "after that, for good" } }
              ] }) +
              H.next("<b>تحديث 0.1.2:</b> مرحلة الصغر تصبح 14 ساعة بدل " + D("age.youngUntilHours") + ". حتى ذلك الحين تبقى " + D("age.youngUntilHours") + " ساعة.") + /* planned value, not live: Docs/Plan/Breeding/BREEDING_SPEED_PLAN.md */
              H.table(["", "صغير", "بالغ", "متقاعد"], [
                ["سباق", "لا", "نعم", "لا"],
                ["تدريب", "نعم (من عمر " + N(D("training.minAgeHours")) + " ساعات)", "نعم", "لا"],
                ["تزاوج", "لا", "نعم", "نعم"],
                ["بيع / سوق / مزاد / إهداء / تقرنيس", "لا", "نعم", "نعم"],
                ["لونه", "مخفي (تلميح في النصف الثاني)", "ظاهر", "ظاهر"]]) +
              H.tip("المتقاعد لا يسابق ولا يتدرب، لكنه ما زال ينجب، ويمكنك إطلاقه للبرية لتنال نقاط تقدير. خطّط لسباقاتك قبل اليوم الستين."),
            en: "<p>Age counts from the moment the egg hatches.</p>" +
              H.w("timeline", { title: { ar: "عمر الصقر", en: "A falcon's life" }, items: [
                { icon: "🐣", label: { ar: "صغير", en: "Young" }, text: { ar: "من 0 إلى " + D("age.youngUntilHours") + " ساعة", en: "0 to " + D("age.youngUntilHours") + " hours" } },
                { icon: "🦅", label: { ar: "بالغ", en: "Prime" }, text: { ar: "حتى " + D("age.retiredAfterHours") + " ساعة (" + D("age.retiredAfterHours") / 24 + " يومًا)", en: "until " + D("age.retiredAfterHours") + " hours (" + D("age.retiredAfterHours") / 24 + " days)" } },
                { icon: "🪶", label: { ar: "متقاعد", en: "Retired" }, text: { ar: "بعد ذلك إلى الأبد", en: "after that, for good" } }
              ] }) +
              H.next("<b>Update 0.1.2:</b> the Young stage becomes 14 hours instead of " + D("age.youngUntilHours") + ". Until then it stays " + D("age.youngUntilHours") + " hours.") +
              H.table(["", "Young", "Prime", "Retired"], [
                ["Race", "no", "yes", "no"],
                ["Train", "yes (from " + N(D("training.minAgeHours")) + " hours old)", "yes", "no"],
                ["Breed", "no", "yes", "yes"],
                ["Sell / market / auction / gift / release", "no", "yes", "yes"],
                ["Colour", "hidden (a hint in the second half)", "shown", "shown"]]) +
              H.tip("A retired falcon cannot race or train, but it can still breed, and you can release it to the wild for prestige. Plan your racers before day sixty.")
          }
        }
      ];
    }
  });
})(window.Book);
