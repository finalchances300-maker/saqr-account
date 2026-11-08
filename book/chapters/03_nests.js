/* Chapter 3 - Nests & Hatchery. Facts: Docs/Systems/03_nests_hatchery.md. Every number comes from data.js through B.D(). */
(function (B) {
  var D = B.D, N = B.N, P = B.P, H = B.H;

  B.chapter({
    id: "nests", order: 3, icon: "icons/egg.png",
    title: { ar: "الأعشاش والمفقس", en: "Nests & Hatchery" },
    blurb: { ar: "من التزاوج إلى الصقر البالغ: الأعشاش، وقت البيضة، كشفان للفرخ، والاحتفاظ به أو بيعه.", en: "From the mating to a grown falcon: nests, the egg timer, the two reveals, and Keep or Sell." },
    sections: function () {
      var n = D("nests"), young = D("age.youngUntilHours"), sg = D("shop.pearlsPerSandglass"), sgMin = D("shop.sandglassMinutes");
      var bl = D("buildings.list[breeding]");
      var pearlRows = n.pearlPrices.map(function (pr, i) {
        var mat = n.buildCosts[i], coin = n.coinPrices[i - 5];
        return [N(i + 1), N(pr), mat != null ? N(mat) : "–", coin != null ? N(coin) : "–"];
      });
      var pearlRowsEn = pearlRows;
      // worked example: nest 1 with half of the materials (Pearls = price x (cost - materials) / cost, rounded up)
      var ex = Math.ceil(n.pearlPrices[0] * (n.buildCosts[0] - n.buildCosts[0] / 2) / n.buildCosts[0]);
      var eggHours = n.hatchHours;
      var warmH = eggHours * (100 - n.warmPercent) / 100, royalH = eggHours * (100 - n.royalPercent) / 100;
      var tl = function (egg, yg) {
        return { title: { ar: "من البيضة إلى البالغ", en: "From egg to adult" }, items: [
          { icon: "🥚", label: { ar: "التزاوج", en: "Mating" }, text: { ar: "بيضة تدخل عشًا فارغًا ويبدأ المؤقت فورًا", en: "An egg goes into a free nest and the timer starts at once" } },
          { icon: "⏱️", label: { ar: "البيضة: " + egg + " ساعات", en: "Egg: " + egg + " hours" }, text: { ar: "عند انتهائه يصبح العش جاهزًا", en: "When it ends the nest is ready" } },
          { icon: "🐣", label: { ar: "الاستلام: الكشف الأول", en: "Collect: reveal 1" }, text: { ar: "الجنس والصفات الخمس ثم الندرة", en: "Sex and the five stats, then the rarity" } },
          { icon: "🪶", label: { ar: "صغير: " + yg + " ساعة", en: "Young: " + yg + " hours" }, text: { ar: "تلميح اللون في النصف الثاني", en: "A colour hint in the second half" } },
          { icon: "🦅", label: { ar: "بالغ: الكشف الثاني", en: "Prime: reveal 2" }, text: { ar: "يظهر اللون الحقيقي", en: "The real colour shows" } }
        ] };
      };

      return [
        {
          id: "flow", title: { ar: "كيف يعمل المفقس", en: "How the Hatchery works" },
          html: {
            ar: "<p>لا يوجد طور فرخ داخل العش. لا تطعم الفرخ ولا تنقذه. التزاوج ثم الانتظار ثم الاستلام:</p>" +
              H.steps([
                "تزاوج أنثى وذكرًا (انظر فصل التزاوج). عش فارغ يأخذ البيضة ويبدأ المؤقت فورًا، ولا تضغط شيئًا.",
                "عندما ينتهي المؤقت يصبح العش <b>جاهزًا</b>.",
                "تستلمه (واحدًا واحدًا أو \"استلم كل الجاهز\"). يذهب الصقر إلى مقرك <b>صغيرًا</b>. تحتاج خانة فارغة في المقر.",
                "<b>الكشف الأول</b> عند الاستلام: يظهر الجنس والصفات الخمس واحدة واحدة، ثم الندرة.",
                "ينمو الصغير " + N(young) + " ساعة.",
                "<b>الكشف الثاني</b> عندما يصبح بالغًا: يظهر اللون. الجير الأبيض يأخذ لحظة ذهبية."
              ]) +
              H.w("timeline", tl(n.hatchHours, young)) +
              H.next("<b>تحديث 0.1.2:</b> تقصر الأوقات إلى بيضة 2 ساعات وصغير 14 ساعة (المجموع 16 ساعة بدل " + N(n.hatchHours + young) + "). حتى ذلك الحين تبقى الأوقات أعلاه.") + /* planned, not live: BREEDING_SPEED_PLAN.md Part A */
              H.shots([["hatchery/a_list", "المفقس: كل الأعشاش وأوقاتها"], ["hatchery/d_reveal1", "الكشف الأول: الصفات والطفرة"], ["hatchery/e_reveal_many", "عدة فراخ جديدة دفعة واحدة"]]) +
              H.tip("أول بيضة في حسابك تفقس في " + N(n.tutorialMinutes) + " دقيقتين فقط. وإذا كان المقر ممتلئًا فلن تستلم؛ اترك دائمًا خانة فارغة."),
            en: "<p>There is no chick stage inside the nest. You don't feed or rescue a chick. It is mate, wait, collect:</p>" +
              H.steps([
                "Pair a female and a male (see the Breeding chapter). A free nest takes the egg and the timer starts at once. You tap nothing.",
                "When the timer ends the nest is <b>ready</b>.",
                "You collect it (one by one, or \"Collect all ready\"). The falcon goes to your Mews as a <b>Young</b> falcon. You need a free Mews slot.",
                "<b>Reveal 1</b> at collecting: the sex and the five stats appear one by one, then the rarity.",
                "The young falcon grows for " + N(young) + " hours.",
                "<b>Reveal 2</b> when it turns Prime: the colour shows. A white Gyr gets a golden moment."
              ]) +
              H.w("timeline", tl(n.hatchHours, young)) +
              H.next("<b>Update 0.1.2:</b> the times get shorter: egg 2 hours and Young 14 hours (16 hours in all instead of " + N(n.hatchHours + young) + "). Until then the times above stay.") +
              H.shots([["hatchery/a_list", "The Hatchery: every nest and its timer"], ["hatchery/d_reveal1", "Reveal 1: stats and the mutation mark"], ["hatchery/e_reveal_many", "Several new chicks at once"]]) +
              H.tip("The first egg of your account hatches in only " + N(n.tutorialMinutes) + " minutes. If the Mews is full you cannot collect; always keep one slot free.")
          }
        },
        {
          id: "list", title: { ar: "قائمة المفقس", en: "The Hatchery list" },
          html: {
            ar: "<p>الصفوف مرتبة: <b>الجاهز</b> أولًا، ثم <b>الفاقس</b> حسب الوقت المتبقي (الأقصر أولًا)، ثم <b>الفارغ</b>، ثم صف \"+\" لبناء عش أو شرائه. فوق القائمة ثلاثة عدّادات (جاهز، يفقس، فارغ): اضغط أحدها لتصفية القائمة.</p>" +
              "<p>زر \"استلم كل الجاهز\" يستلم بقدر ما يتسع له المقر ويخبرك كم بقي. والأنثى التي في عشها بيضة لم تفقس لا يمكن بيعها ولا عرضها ولا إطلاقها ولا إهداؤها.</p>" +
              H.shots([["hatchery/b_scrolled", "قائمة المفقس"], ["hatchery/c_filter_ready", "تصفية الجاهز فقط"]]),
            en: "<p>Rows are sorted: <b>Ready</b> first, then <b>Hatching</b> by time left (shortest first), then <b>Empty</b>, then the \"+\" row to build or buy a nest. Three counters on top (ready, hatching, empty): tap one to filter the list.</p>" +
              "<p>\"Collect all ready\" collects as many as the Mews has room for and tells you how many are left. A female with an egg that has not hatched cannot be sold, listed, released or gifted.</p>" +
              H.shots([["hatchery/b_scrolled", "The Hatchery list"], ["hatchery/c_filter_ready", "Filter: ready only"]])
          }
        },
        {
          id: "nests", title: { ar: "الأعشاش: كم وكيف تشتري", en: "Nests: how many, and how to buy" },
          html: {
            ar: H.kpis([[N(n.freeNests), "أعشاش مجانية لكل حساب"], [N(n.maxNests), "أقصى عدد بالشراء العادي"], [N(n.maxNests - n.freeNests), "أعشاش يمكن شراؤها"]]) +
              "<p>عشّ رقم <b>k</b> المشترى يأخذ السعر رقم k. الأعشاش من 1 إلى 5 تُدفع بـ<b>اللؤلؤ</b>، ويمكن أن تدفع <b>المواد</b> جزءًا من السعر. الأعشاش من 6 إلى 9 تُشترى بـ<b>اللؤلؤ أو العملات</b>.</p>" +
              H.table(["العش المشترى", "السعر باللؤلؤ", "المواد (تدفع جزءًا)", "السعر بالعملات"], pearlRows) +
              H.info("اللؤلؤ = السعر × (التكلفة − المواد المستخدمة) ÷ التكلفة، مقرّبًا للأعلى. مثال: العش 1 بـ" + N(n.buildCosts[0]) + " مادة = 0 لؤلؤة. بنصف المواد (" + N(n.buildCosts[0] / 2) + ") = " + N(ex) + " لؤلؤة.") +
              "<p>عرض <b>حزمة الأعشاش</b> (بالمال الحقيقي) يضيف 3 أعشاش فوق الحد، ولا تُحسب من الـ" + N(n.maxNests) + ".</p>" +
              "<h3>المواد: كيف تكسبها</h3>" +
              H.table(["العمل", "المواد"], [["إنهاء سباق", N(n.materialsRace)], ["إنهاء جلسة تدريب", N(n.materialsTraining)], ["إنهاء كل المهام اليومية", N(n.materialsAllTasks)], ["مراكز البطولة الأسبوعية الأولى", N(n.materialsTournamentTop)]]) +
              "<p>الحد اليومي <b>" + N(n.materialsPerDay) + "</b> مادة في اليوم. المواد لا تُباع ولا تُهدى.</p>" +
              H.tip("بأقصى لعب يومي، عش رقم 1 من المواد يحتاج حوالي " + N(Math.ceil(n.buildCosts[0] / n.materialsPerDay)) + " أيام، وعش رقم 5 حوالي " + N(Math.ceil(n.buildCosts[4] / n.materialsPerDay)) + " يومًا."),
            en: H.kpis([[N(n.freeNests), "free nests for every account"], [N(n.maxNests), "most nests by normal buying"], [N(n.maxNests - n.freeNests), "nests you can buy"]]) +
              "<p>The <b>k</b>-th nest you buy uses the k-th price. Nests 1 to 5 are paid in <b>Pearls</b>, and <b>materials</b> can pay part of the price. Nests 6 to 9 can be bought with <b>Pearls or coins</b>.</p>" +
              H.table(["Bought nest", "Pearl price", "Materials (pay part)", "Coin price"], pearlRowsEn) +
              H.info("Pearls = price × (cost − materials used) ÷ cost, rounded up. Example: nest 1 with " + N(n.buildCosts[0]) + " materials = 0 Pearls. With half the materials (" + N(n.buildCosts[0] / 2) + ") = " + N(ex) + " Pearls.") +
              "<p>The <b>Nest Pack</b> offer (real money) adds 3 nests on top, and they do not count toward the " + N(n.maxNests) + ".</p>" +
              "<h3>Materials: how to earn them</h3>" +
              H.table(["Action", "Materials"], [["Finish a race", N(n.materialsRace)], ["Finish a training session", N(n.materialsTraining)], ["Finish all daily tasks", N(n.materialsAllTasks)], ["Top places in the weekly tournament", N(n.materialsTournamentTop)]]) +
              "<p>The daily limit is <b>" + N(n.materialsPerDay) + "</b> materials a day. Materials cannot be traded or gifted.</p>" +
              H.tip("With full daily play, nest 1 from materials takes about " + N(Math.ceil(n.buildCosts[0] / n.materialsPerDay)) + " days and nest 5 about " + N(Math.ceil(n.buildCosts[4] / n.materialsPerDay)) + " days.")
          }
        },
        {
          id: "upgrades", title: { ar: "تسريع البيضة", en: "Faster eggs" },
          html: {
            ar: "<h3>ترقية العش</h3>" +
              H.table(["الترقية", "تقصير وقت البيضة", "السعر", "وقت الفقس (من " + N(eggHours) + " ساعات)"], [
                ["عادي", "0%", "مجاني", N(eggHours) + " س"],
                ["دافئ", N(n.warmPercent) + "%", N(n.warmCoins) + " عملة", N(warmH) + " س"],
                ["ملكي", N(n.royalPercent) + "%", N(n.royalPearls) + " لؤلؤة", N(royalH) + " س"]]) +
              "<p>لا تستطيع شراء ترقية مساوية أو أضعف من التي عند العش. وإن اشتريتها وفي العش بيضة تجري، يقصر الوقت المتبقي.</p>" +
              "<h3>مستوى مبنى التزاوج</h3>" +
              H.table(["المستوى", "السعر بالعملات", "تقصير وقت الفقس"], bl.costs.map(function (c, i) { return [N(bl.minLevels[i]), N(c), N(bl.perks.hatchTimePercent[i]) + "%"]; })) +
              "<h3>الساعة الرملية</h3>" +
              "<p>الساعة الرملية الواحدة تغطي " + N(sgMin) + " دقيقة. تُستخدم أولًا ما تملكه، والباقي بـ" + N(sg) + " لؤلؤة للساعة. آخر " + N(D("shop.skips.freeFinishMinutes")) + " دقائق مجانية. تتخطى بها البيضة أو فترة الصغر أو راحة التزاوج.</p>" +
              H.table(["الحالة", "الساعات", "اللؤلؤ"], [
                ["بيضة في عش عادي", N(n.hatchHours), N(n.hatchHours * sg)],
                ["نمو الصغير من الصفر", N(young), N(young * sg)],
                ["من البيضة إلى البالغ", N(n.hatchHours + young), N((n.hatchHours + young) * sg)]]) +
              H.next("<b>بأوقات 0.1.2</b> (بيضة 2 + صغير 14 = 16 ساعة): " + N(16 * sg) + " لؤلؤة للتخطي الكامل.") + /* 16 h is the planned total, not in live config */
              H.shots([["inventory/detail_glasses", "الساعة الرملية في المخزن"]]) +
              H.tip("أرخص تسريع هو مبنى التزاوج (حتى " + N(bl.perks.hatchTimePercent[3]) + "%). وأقواها العش الملكي والساعة الرملية."),
            en: "<h3>Nest upgrades</h3>" +
              H.table(["Upgrade", "Egg time cut", "Price", "Hatch time (from " + N(eggHours) + " h)"], [
                ["Plain", "0%", "free", N(eggHours) + " h"],
                ["Warm", N(n.warmPercent) + "%", N(n.warmCoins) + " coins", N(warmH) + " h"],
                ["Royal", N(n.royalPercent) + "%", N(n.royalPearls) + " Pearls", N(royalH) + " h"]]) +
              "<p>You cannot buy an upgrade equal to or worse than the one on the nest. If you buy it while an egg is running, the time left gets shorter.</p>" +
              "<h3>Breeding building level</h3>" +
              H.table(["Level", "Cost in coins", "Hatch time cut"], bl.costs.map(function (c, i) { return [N(bl.minLevels[i]), N(c), N(bl.perks.hatchTimePercent[i]) + "%"]; })) +
              "<h3>Sand-glasses</h3>" +
              "<p>One sand-glass covers " + N(sgMin) + " minutes. Owned glasses are used first, the rest costs " + N(sg) + " Pearls per hour. The last " + N(D("shop.skips.freeFinishMinutes")) + " minutes are free. You can skip the egg, the Young time or the breeding rest.</p>" +
              H.table(["Case", "Hours", "Pearls"], [
                ["Egg in a plain nest", N(n.hatchHours), N(n.hatchHours * sg)],
                ["Young growing, from zero", N(young), N(young * sg)],
                ["Egg to adult", N(n.hatchHours + young), N((n.hatchHours + young) * sg)]]) +
              H.next("<b>With the 0.1.2 times</b> (egg 2 + Young 14 = 16 hours): " + N(16 * sg) + " Pearls for a full skip.") +
              H.shots([["inventory/detail_glasses", "The sand-glass in the inventory"]]) +
              H.tip("The cheapest speed-up is the Breeding building (up to " + N(bl.perks.hatchTimePercent[3]) + "%). The strongest are a Royal nest and the sand-glass.")
          }
        },
        {
          id: "colour-hint", title: { ar: "تلميح لون الريش", en: "The feather colour hint" },
          html: {
            ar: "<p>طوال فترة الصغر يكون اللون الحقيقي مخفيًا عند الجميع. في <b>النصف الثاني</b> من فترة الصغر ترى أنت (المالك) تلميحًا للعائلة اللونية، وبعده يظهر اللون الحقيقي:</p>" +
              H.table(["التلميح", "الألوان التي يشملها"], [["فاتح", H.sw("white") + " أبيض · " + H.sw("silver") + " فضي"], ["متوسط", H.sw("grey") + " رمادي · " + H.sw("brown") + " بني"], ["داكن", H.sw("dark") + " داكن · " + H.sw("black") + " أسود"]]) +
              "<p>العائلة تأتي من اللون العام للصقر (اللون ذو أكبر مجموع أوزان مناطق). والصغير لا يُباع ولا يُعرض ولا يُهدى. أما التدريب فيبدأ من عمر " + N(D("training.minAgeHours")) + " ساعات.</p>" +
              H.shots([["hatchery/h_detail_feathers", "تلميح الريش على صفحة الصغير"], ["hatchery/g_detail_young", "صفحة الصغير"]]) +
              H.tip("تخطي فترة الصغر بالساعة الرملية يُظهر اللون فورًا. لا تنتظر في المفقس: التلميح يكفي لتعرف فاتحًا أو متوسطًا أو داكنًا."),
            en: "<p>During the whole Young time the real colour is hidden from everyone. In the <b>second half</b> of the Young time you (the owner) see a hint of the colour family, and after that the real colour shows:</p>" +
              H.table(["Hint", "Colours it covers"], [["Light", H.sw("white") + " White · " + H.sw("silver") + " Silver"], ["Medium", H.sw("grey") + " Grey · " + H.sw("brown") + " Brown"], ["Dark", H.sw("dark") + " Dark · " + H.sw("black") + " Black"]]) +
              "<p>The family comes from the falcon's overall colour (the colour with the biggest sum of region weights). A Young falcon cannot be sold, listed or gifted. Training starts from " + N(D("training.minAgeHours")) + " hours of age.</p>" +
              H.shots([["hatchery/h_detail_feathers", "The feather hint on the young falcon's page"], ["hatchery/g_detail_young", "A young falcon's page"]]) +
              H.tip("Skipping the Young time with a sand-glass shows the colour at once. Don't wait at the Hatchery: the hint tells you light, medium or dark.")
          }
        },
        {
          id: "keep-sell", title: { ar: "احتفظ به أو بعه", en: "Keep or Sell" },
          html: {
            ar: H.kpis([[N(n.chickSellCoins), "عملة: سعر بيع الفرخ الجديد (ثابت)"]]) +
              "<p>عند الكشف الأول يمكنك الاحتفاظ بالفرخ أو بيعه. السعر ثابت لأي فرخ، لا يتغير بصفاته أو ندرته. هذا ليس بيعًا للسوق.</p>" +
              H.shots([["hatchery/d2_reveal1_sell_armed", "احتفظ به أو بعه"]]) +
              H.warn("لا تبع فرخًا قبل أن ترى صفاته. الفرخ الجيد يساوي أكثر بكثير من " + N(n.chickSellCoins) + " عملة عندما يصبح بالغًا."),
            en: H.kpis([[N(n.chickSellCoins), "coins: the flat price for a newborn chick"]]) +
              "<p>At reveal 1 you can keep the chick or sell it. The price is flat for any chick; it does not depend on its stats or rarity. This is not a market sale.</p>" +
              H.shots([["hatchery/d2_reveal1_sell_armed", "Keep it or sell it"]]) +
              H.warn("Don't sell a chick before you see its stats. A good chick is worth much more than " + N(n.chickSellCoins) + " coins once it is prime.")
          }
        }
      ];
    }
  });
})(window.Book);
