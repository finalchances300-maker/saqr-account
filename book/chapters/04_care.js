/* Chapter 4 - Care & hospital. Facts: Docs/Systems/04_care_hospital.md. Every number comes from data.js through B.D(). */
(function (B) {
  var D = B.D, N = B.N, P = B.P, H = B.H;

  B.chapter({
    id: "care", order: 4, icon: "icons/hospital.png",
    title: { ar: "الرعاية والمستشفى", en: "Care & hospital" },
    blurb: { ar: "الجوع والصحة، تأثيرهما على الأداء، المستشفى والصيدلية، وإطلاق الصقر إلى البرية \"خلها تقرنس\".", en: "Hunger and health, how they change performance, the hospital and pharmacy, and releasing a falcon to the wild." },
    sections: function () {
      var c = D("care"), hp = D("hospital"), wg = D("weighing"), rel = D("release"), serv = D("buildings.list[hospital]"), mews = D("buildings.list[mews]");
      var fullToEmpty = 100 / c.hungerPerHour, toHungry = (100 - c.hungryThreshold) / c.hungerPerHour;
      var starveHours = fullToEmpty + c.starvationGraceHours;
      function hosp(missing) { return c.hospitalCostBase + c.hospitalCostPerMissingHealth * missing; }
      function perf(h) { return (Math.pow(h / 100, c.healthPerformanceExponent)).toFixed(3); }
      var perfRows = [100, 80, 60, 40, 20, 10].map(function (h) { return [N(h), perf(h)]; });
      var daysToSick = Math.floor((100 - c.sickThreshold) / c.healthWearPerDay);
      var rest = D("shop.items[med_female_rest].pearls"), boost = D("shop.items[boost_breeding].pearls");
      var tonic = D("shop.items[med_tonic].pearls"), aid = D("shop.items[med_recovery_aid].pearls");
      var tiers = ["common", "good", "rare", "elite", "legendary"];
      var tierTxt = { common: { ar: "عادي", en: "Common" }, good: { ar: "جيد", en: "Good" }, rare: { ar: "نادر", en: "Rare" }, elite: { ar: "نخبة", en: "Elite" }, legendary: { ar: "أسطوري", en: "Legendary" } };
      var badgeAr = { bronze_feather: "الريشة البرونزية", silver_feather: "الريشة الفضية", golden_feather: "الريشة الذهبية", guardian_of_the_wild: "حارس البرية" };
      var badgeEn = { bronze_feather: "Bronze Feather", silver_feather: "Silver Feather", golden_feather: "Golden Feather", guardian_of_the_wild: "Guardian of the Wild" };

      return [
        {
          id: "hunger", title: { ar: "الجوع (الشبع)", en: "Hunger (fullness)" },
          html: {
            ar: "<p>الشبع من 0 إلى 100. ينقص مع الوقت، وتُطعم الصقر فيعود إلى 100.</p>" +
              H.kpis([[N(c.hungerPerHour), "نقطة شبع تنقص كل ساعة"], [N(fullToEmpty) + " س", "من الممتلئ إلى الفارغ"], [N(toHungry) + " س", "من التغذية إلى \"جائع\""], [N(c.feedCost), "عملة لتغذية صقر"]]) +
              H.table(["البند", "القيمة"], [
                ["علامة \"جائع\" وعقوبته عند أقل من", N(c.hungryThreshold)],
                ["لا تستطيع التغذية إلا إذا كان الشبع", N(c.feedMinHungerToFeed) + " أو أقل"],
                ["\"أطعم الجميع\"", "السعر × عدد الصقور القابلة للتغذية (" + N(c.feedCost) + " لكل صقر)"],
                ["الصقر يبدأ اللعبة مشبعًا قبل", N(D("starter.startHungerHours")) + " ساعات (شبعه حوالي " + N(100 - D("starter.startHungerHours") * c.hungerPerHour) + ")"]]) +
              "<h3>ما الذي يستهلك الشبع</h3>" +
              H.table(["العمل", "الشبع المستهلك", "الشبع اللازم للبدء"], [
                ["سباق", N(D("race.satietyCost")), N(D("race.minSatiety"))],
                ["جلسة تدريب التلواح", N(D("training.sessions[lure].satietyCost")), N(D("training.minSatiety"))]]) +
              H.table(["مستوى مبنى المقر", "تخفيض سعر التغذية", "تكلفة الترقية"], mews.costs.map(function (x, i) { return [N(mews.minLevels[i]), N(mews.perks.feedCostPercent[i]) + "%", N(x) + " عملة"]; })) +
              H.shots([["mews/mews_02_mews", "المقر: زر \"أطعم الجميع\" أعلى القائمة"]]) +
              H.tip("تغذية واحدة كل يوم تكفي. لا يمكنك الإفراط في التغذية: التغذية تُقبل فقط عندما يكون الشبع " + N(c.feedMinHungerToFeed) + " أو أقل."),
            en: "<p>Fullness runs from 0 to 100. It drops with time, and feeding brings it back to 100.</p>" +
              H.kpis([[N(c.hungerPerHour), "fullness points lost every hour"], [N(fullToEmpty) + " h", "from full to empty"], [N(toHungry) + " h", "from a feed to \"Hungry\""], [N(c.feedCost), "coins to feed one falcon"]]) +
              H.table(["Item", "Value"], [
                ["\"Hungry\" label and penalty below", N(c.hungryThreshold)],
                ["You can feed only when fullness is", N(c.feedMinHungerToFeed) + " or less"],
                ["\"Feed all\"", "price × number of falcons that can be fed (" + N(c.feedCost) + " each)"],
                ["A falcon starts the game fed", N(D("starter.startHungerHours")) + " hours ago (fullness about " + N(100 - D("starter.startHungerHours") * c.hungerPerHour) + ")"]]) +
              "<h3>What uses fullness</h3>" +
              H.table(["Action", "Fullness used", "Fullness needed to start"], [
                ["A race", N(D("race.satietyCost")), N(D("race.minSatiety"))],
                ["A lure training session", N(D("training.sessions[lure].satietyCost")), N(D("training.minSatiety"))]]) +
              H.table(["Mews building level", "Feed price cut", "Upgrade cost"], mews.costs.map(function (x, i) { return [N(mews.minLevels[i]), N(mews.perks.feedCostPercent[i]) + "%", N(x) + " coins"]; })) +
              H.shots([["mews/mews_02_mews", "The Mews: the \"Feed all\" button above the list"]]) +
              H.tip("One feed a day is enough. You cannot over-feed: feeding is accepted only when fullness is " + N(c.feedMinHungerToFeed) + " or less.")
          }
        },
        {
          id: "health", title: { ar: "الصحة", en: "Health" },
          html: {
            ar: "<p>الصحة من 0 إلى 100، و<b>لا تشفى وحدها</b> (الشفاء الطبيعي = " + N(c.healthRegenPerHour) + "). لا تعود إلا بالمستشفى أو بالمقوّي.</p>" +
              H.table(["البند", "القيمة"], [
                ["البلى اليومي (مشبع أو لا)", "−" + N(c.healthWearPerDay) + " في اليوم"],
                ["الجوع الشديد: مهلة بعد وصول الشبع إلى 0", N(c.starvationGraceHours) + " ساعات"],
                ["بعد المهلة", "−" + N(c.healthLossPerHourStarving) + " صحة كل ساعة"],
                ["من تغذية كاملة إلى بدء الضرر", N(fullToEmpty) + " + " + N(c.starvationGraceHours) + " = " + N(starveHours) + " ساعة"],
                ["\"مريض\" عند أقل من", N(c.sickThreshold)],
                ["كل سباق", "−" + N(D("race.healthCost")) + " صحة، مع فرصة إصابة (فصل السباقات)"]]) +
              "<p>صقر لا يسابق أبدًا يفقد " + N(c.healthWearPerDay) + " صحة في اليوم، فيصل من 100 إلى \"مريض\" خلال حوالي " + N(daysToSick) + " يومًا إن أهملته.</p>" +
              H.warn("الصقر <b>المريض</b> لا يسابق ولا يتدرب ولا يتزاوج ولا يُطلق، ويُباع بـ" + P(D("economy.valuation.sickMultiplier")) + " فقط من قيمته.") +
              H.next("<b>مع التحديث القادم:</b> الصقر الذي صحته أقل من " + N(c.tiredBelow) + " يظهر \"متعبًا\" باللون الأحمر في بطاقة العناية، وبجانبه زر \"+\" أخضر للعلاج مباشرة.") + /* care.tiredBelow is held for the new build */
              H.shots([["tired/detail_tired", "بطاقة العناية: \"متعب\" وبجانبه زر العلاج"], ["tired/hospital_question", "سؤال المستشفى: السعر والمدة"]]),
            en: "<p>Health runs from 0 to 100 and <b>does not heal by itself</b> (natural healing = " + N(c.healthRegenPerHour) + "). It comes back only through the hospital or a Tonic.</p>" +
              H.table(["Item", "Value"], [
                ["Daily wear (fed or not)", "−" + N(c.healthWearPerDay) + " a day"],
                ["Starving: grace after fullness reaches 0", N(c.starvationGraceHours) + " hours"],
                ["After the grace", "−" + N(c.healthLossPerHourStarving) + " health every hour"],
                ["From a full feed to the first damage", N(fullToEmpty) + " + " + N(c.starvationGraceHours) + " = " + N(starveHours) + " hours"],
                ["\"Sick\" below", N(c.sickThreshold)],
                ["Each race", "−" + N(D("race.healthCost")) + " health, plus a chance of injury (Racing chapter)"]]) +
              "<p>A falcon that never races loses " + N(c.healthWearPerDay) + " health a day, so it goes from 100 to \"sick\" in about " + N(daysToSick) + " days if you do nothing.</p>" +
              H.warn("A <b>sick</b> falcon cannot race, train, breed or be released, and sells for only " + P(D("economy.valuation.sickMultiplier")) + " of its value.") +
              H.next("<b>With the next update:</b> a falcon under " + N(c.tiredBelow) + " health shows a red \"Tired\" in the Care card, with a green \"+\" button beside it for an instant fix.") +
              H.shots([["tired/detail_tired", "The Care card: \"Tired\" with the fix button beside it"], ["tired/hospital_question", "The hospital question: price and time"]])
          }
        },
        {
          id: "performance", title: { ar: "أثر الرعاية على الأداء", en: "How care changes performance" },
          html: {
            ar: "<p>السباق يستخدم عامل أداء من الرعاية: <b>(الصحة ÷ 100) أس " + N(c.healthPerformanceExponent) + "</b>، ثم × " + N(c.hungryPerformance) + " إذا كان الشبع أقل من " + N(c.hungryThreshold) + ". العامل يضرب أقصى سرعة للصقر في السباق.</p>" +
              H.table(["الصحة", "العامل"], perfRows) +
              H.w("bars", { title: { ar: "عامل الأداء حسب الصحة", en: "Performance factor by health" }, max: 1, items: [100, 80, 60, 40, 20, 10].map(function (h) { return { label: String(h), value: Math.pow(h / 100, c.healthPerformanceExponent), text: perf(h) }; }) }) +
              "<p>انخفاض الصحة عقوبته صغيرة حتى يصبح منخفضًا جدًا. أما <b>الجوع فعقوبته كبيرة (−" + N(100 - c.hungryPerformance * 100) + "%)</b>. لكن السباق والتدريب لا يبدآن إلا عند شبع " + N(D("race.minSatiety")) + " فأكثر.</p>" +
              H.tip("حافظ على صحة أفضل سباقاتك مرتفعة وشبعه كاملًا قبل السباق. صقر قوي جائع يخسر أمام صقر أضعف مشبع."),
            en: "<p>A race uses a performance factor from care: <b>(health ÷ 100) to the power " + N(c.healthPerformanceExponent) + "</b>, then × " + N(c.hungryPerformance) + " if fullness is under " + N(c.hungryThreshold) + ". The factor multiplies the falcon's top speed in a race.</p>" +
              H.table(["Health", "Factor"], perfRows) +
              H.w("bars", { title: { ar: "عامل الأداء حسب الصحة", en: "Performance factor by health" }, max: 1, items: [100, 80, 60, 40, 20, 10].map(function (h) { return { label: String(h), value: Math.pow(h / 100, c.healthPerformanceExponent), text: perf(h) }; }) }) +
              "<p>Low health is a small penalty until it gets very low. <b>Hunger is a big one (−" + N(100 - c.hungryPerformance * 100) + "%)</b>. But a race and a training session start only at fullness " + N(D("race.minSatiety")) + " or more.</p>" +
              H.tip("Keep your best racer's health high and its fullness full before a race. A strong hungry falcon loses to a weaker fed one.")
          }
        },
        {
          id: "weighing", title: { ar: "الوزن الصباحي", en: "Morning weighing" },
          html: {
            ar: "<p>مرة واحدة لكل صقر في يوم الوزن. صقر \"لائق\" عند الوزن يكون <b>حادًّا</b> بقية يومه.</p>" +
              H.table(["البند", "القيمة"], [
                ["نافذة الوزن (بتوقيت الخليج)", N(wg.startHour) + ":00 إلى " + N(wg.endHour) + ":00"],
                ["تذكير", N(wg.reminderHour) + ":00"],
                ["منطقة اللياقة", "شبع من " + N(wg.fitMin) + " إلى " + N(wg.fitMax)],
                ["مكافأة الحدّة", "+" + P(wg.sharpPower) + " قوة في السباق"]]) +
              H.table(["الحصة", "تضيف شبعًا", "السعر"], wg.portions.map(function (p) { return [{ small: "صغيرة", medium: "متوسطة", large: "كبيرة" }[p.id], "+" + N(p.satiety), N(p.cost) + " عملة"]; })) +
              H.tip("مكافأة صغيرة لكنها مجانية إذا استيقظت في الوقت المناسب."),
            en: "<p>Once per falcon per weigh day. A falcon that is \"fit\" at the weighing is <b>Sharp</b> for the rest of its day.</p>" +
              H.table(["Item", "Value"], [
                ["Weighing window (Gulf time)", N(wg.startHour) + ":00 to " + N(wg.endHour) + ":00"],
                ["Reminder", N(wg.reminderHour) + ":00"],
                ["Fit zone", "fullness " + N(wg.fitMin) + " to " + N(wg.fitMax)],
                ["Sharp bonus", "+" + P(wg.sharpPower) + " race power"]]) +
              H.table(["Portion", "Adds fullness", "Price"], wg.portions.map(function (p) { return [{ small: "Small", medium: "Medium", large: "Large" }[p.id], "+" + N(p.satiety), N(p.cost) + " coins"]; })) +
              H.tip("A small bonus, but free if you are up at the right time.")
          }
        },
        {
          id: "hospital", title: { ar: "المستشفى (بالعملات)", en: "The hospital (coins)" },
          html: {
            ar: "<p><b>السعر = " + N(c.hospitalCostBase) + " + " + N(c.hospitalCostPerMissingHealth) + " × الصحة الناقصة.</b> المدة " + N(c.hospitalHours) + " ساعات. في النهاية تعود الصحة إلى 100 والشبع إلى 100. أثناء الإقامة لا يسابق الصقر ولا يتدرب ولا يتزاوج.</p>" +
              H.table(["الصحة", "الناقص", "السعر"], [[90, 10], [60, 40], [39, 61]].map(function (r) { return [N(r[0]), N(r[1]), N(hosp(r[1])) + " عملة"]; })) +
              H.info("مثال: صحة 60 = " + N(c.hospitalCostBase) + " + " + N(c.hospitalCostPerMissingHealth) + " × 40 = <b>" + N(hosp(40)) + "</b> عملة. والمستشفى لا يقبل إلا من صحته أقل من 100، وليس في تدريب.") +
              "<p>تستطيع تخطي الإقامة بالساعة الرملية: واحدة لكل ساعة متبقية (" + N(c.hospitalHours * D("shop.pearlsPerSandglass")) + " لؤلؤة لإقامة كاملة). آخر " + N(D("shop.skips.freeFinishMinutes")) + " دقائق مجانية.</p>" +
              H.table(["مستوى مبنى المستشفى", "السعر", "الوقت", "تكلفة الترقية"], serv.costs.map(function (x, i) { return [N(serv.minLevels[i]), "−" + N(serv.perks.hospitalCostPercent[i]) + "%", "−" + N(serv.perks.hospitalTimePercent[i]) + "%", N(x) + " عملة"]; })) +
              H.shots([["tired/hospital_question", "إرسال الصقر إلى المستشفى"]]) +
              H.tip("السعر يرتفع مع الصحة الناقصة: عند 100 ناقصة يصبح " + N(hosp(100)) + ". اذهب مبكرًا."),
            en: "<p><b>Price = " + N(c.hospitalCostBase) + " + " + N(c.hospitalCostPerMissingHealth) + " × missing health.</b> The stay is " + N(c.hospitalHours) + " hours. At the end health is back to 100 and fullness to 100. During the stay the falcon cannot race, train or breed.</p>" +
              H.table(["Health", "Missing", "Price"], [[90, 10], [60, 40], [39, 61]].map(function (r) { return [N(r[0]), N(r[1]), N(hosp(r[1])) + " coins"]; })) +
              H.info("Example: health 60 = " + N(c.hospitalCostBase) + " + " + N(c.hospitalCostPerMissingHealth) + " × 40 = <b>" + N(hosp(40)) + "</b> coins. The hospital accepts only a falcon under 100 health that is not in training.") +
              "<p>You can skip the stay with sand-glasses: one per hour left (" + N(c.hospitalHours * D("shop.pearlsPerSandglass")) + " Pearls for a full stay). The last " + N(D("shop.skips.freeFinishMinutes")) + " minutes are free.</p>" +
              H.table(["Hospital building level", "Price", "Time", "Upgrade cost"], serv.costs.map(function (x, i) { return [N(serv.minLevels[i]), "−" + N(serv.perks.hospitalCostPercent[i]) + "%", "−" + N(serv.perks.hospitalTimePercent[i]) + "%", N(x) + " coins"]; })) +
              H.shots([["tired/hospital_question", "Sending a falcon to the hospital"]]) +
              H.tip("The price grows with missing health: at 100 missing it would be " + N(hosp(100)) + ". Go early.")
          }
        },
        {
          id: "pharmacy", title: { ar: "الصيدلية (باللؤلؤ)", en: "The pharmacy (Pearls)" },
          html: {
            ar: H.table(["العنصر", "السعر", "ماذا يفعل", "الحد"], [
              ["المقوّي", N(tonic) + " لؤلؤة", "+" + N(hp.tonicHealth) + " صحة", "حتى " + N(hp.tonicPerDay) + " لكل صقر في اليوم؛ ليس في المستشفى"],
              ["معزز الشفاء", N(aid) + " لؤلؤة", "يقصّر الوقت المتبقي في المستشفى " + N(hp.recoveryAidPercent) + "%", "مرة لكل إقامة"],
              ["معزز راحة الأنثى", N(rest) + " لؤلؤة", "ينهي راحة التزاوج فورًا", "بلا حد يومي"],
              ["معزز التزاوج", N(boost) + " لؤلؤة", "+" + N(D("nests.boostedFemalesPerDay") - D("nests.maxFemalesPerDay")) + " إناث للذكر في اليوم", "عندما ينتهي حد الذكر"],
              ["فحص الجينات", N(hp.geneTestPearls) + " لؤلؤة", "يكشف الجينات المخفية", "مرة لكل صقر"],
              ["فحص دوري", N(hp.checkupPearls) + " لؤلؤة", "لمدة " + N(hp.checkupDays) + " أيام تنقص خسارة الصحة (البلى والجوع وإصابة السباق) " + N(hp.checkupLossPercent) + "%", "واحد في كل مرة؛ ليس للمريض أو في المستشفى"]]) +
              H.shots([["tired/detail_buy", "شراء المقوّي من لؤلؤك"], ["inventory/detail_tonic", "المقوّي في المخزن"]]) +
              H.tip("المقوّي أرخص حل لنقص صغير: " + N(tonic) + " لؤلؤات مقابل +" + N(hp.tonicHealth) + ". والمستشفى أفضل للصقر المنخفض جدًا. والفحص الدوري يستحق لأفضل سباقاتك."),
            en: H.table(["Item", "Price", "What it does", "Limit"], [
              ["Tonic", N(tonic) + " Pearls", "+" + N(hp.tonicHealth) + " health", "up to " + N(hp.tonicPerDay) + " per falcon per day; not in hospital"],
              ["Recovery Aid", N(aid) + " Pearls", "cuts the remaining hospital time by " + N(hp.recoveryAidPercent) + "%", "once per stay"],
              ["Female Rest Booster", N(rest) + " Pearls", "ends the breeding rest at once", "no daily limit"],
              ["Breeding Booster", N(boost) + " Pearls", "+" + N(D("nests.boostedFemalesPerDay") - D("nests.maxFemalesPerDay")) + " females for a male that day", "when the male's limit is used up"],
              ["Gene test", N(hp.geneTestPearls) + " Pearls", "shows hidden colour genes", "once per falcon"],
              ["Check-up", N(hp.checkupPearls) + " Pearls", "for " + N(hp.checkupDays) + " days health loss (wear, starving, race injury) is cut by " + N(hp.checkupLossPercent) + "%", "one at a time; not if sick or in hospital"]]) +
              H.shots([["tired/detail_buy", "Buying a Tonic with your Pearls"], ["inventory/detail_tonic", "The Tonic in the inventory"]]) +
              H.tip("The Tonic is the cheapest fix for a small loss: " + N(tonic) + " Pearls for +" + N(hp.tonicHealth) + ". The hospital is better for a very low falcon. A check-up is worth it for your best racer.")
          }
        },
        {
          id: "release", title: { ar: "خلها تقرنس: الإطلاق إلى البرية", en: "Release to the wild" },
          html: {
            ar: "<p>تستطيع إطلاق صقر إلى البرية. يغادر مقرك للأبد وتنال <b>نقاط تقدير</b> وأوسمة. <b>كل إطلاق يُكافأ</b> بلا حد يومي. الأفضل أن تطلق متقاعديك.</p>" +
              H.w("bars", { title: { ar: "نقاط التقدير عند الإطلاق حسب الندرة", en: "Prestige per release by rarity" }, items: tiers.map(function (t) { return { label: tierTxt[t], value: rel.prestige[t] }; }) }) +
              H.table(["عدد مرات الإطلاق", "الوسام"], rel.badges.map(function (b) { return [N(b.releases), badgeAr[b.id]]; })) +
              "<p><b>من يستطيع؟</b> صقر بالغ أو متقاعد، ليس آخر صقر عندك، ليس مريضًا ولا في المستشفى ولا في تدريب أو سباق، وليس أنثى في عشها بيضة. الصغار لا يُطلقون.</p>" +
              H.shots([["falcon/falcon_02_scrolled", "في صفحة الصقر: بيع أو خلها تقرنس"]]) +
              H.tip("متقاعد أسطوري يعطي " + N(rel.prestige.legendary) + " نقطة. إطلاق " + N(rel.badges[3].releases) + " صقرًا يمنحك أعلى وسام."),
            en: "<p>You can set a falcon free. It leaves your Mews for good and you get <b>prestige</b> and badges. <b>Every release pays</b>, with no daily limit. It is best to release your retired falcons.</p>" +
              H.w("bars", { title: { ar: "نقاط التقدير عند الإطلاق حسب الندرة", en: "Prestige per release by rarity" }, items: tiers.map(function (t) { return { label: tierTxt[t], value: rel.prestige[t] }; }) }) +
              H.table(["Total releases", "Badge"], rel.badges.map(function (b) { return [N(b.releases), badgeEn[b.id]]; })) +
              "<p><b>Who can be released?</b> A prime or retired falcon that is not your last falcon, not sick, not in hospital, not in training or a race, and not a female with an egg in a nest. Young falcons cannot be released.</p>" +
              H.shots([["falcon/falcon_02_scrolled", "On the falcon page: sell, or \"Khalha Tqarnes\" (release)"]]) +
              H.tip("A retired Legendary gives " + N(rel.prestige.legendary) + " prestige. Releasing " + N(rel.badges[3].releases) + " falcons earns the top badge.")
          }
        }
      ];
    }
  });
})(window.Book);
