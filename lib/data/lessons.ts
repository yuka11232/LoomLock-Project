import type { Lesson } from "../types";

/**
 * The LoomLock learning path.
 *
 * Ten lessons, three to seven minutes each. Every lesson has the same shape:
 * a short explanation, one concrete example, one small action the learner
 * actually does, and a line tying it back to the workspace.
 *
 * Deliberately not a course: no quizzes, no scores, no certificates. The
 * "completion state" is that the learner wrote down their answer to the action.
 *
 * The examples use the demo studio so the lesson and the workspace agree with
 * each other, but the advice is general and applies to any small craft business.
 */
export const LESSONS: Lesson[] = [
  {
    slug: "better-product-photographs",
    category: "photography",
    minutes: 4,
    suggestedFor: ["collaborator"],
    title: {
      en: "Taking Better Product Photographs",
      az: "Daha yaxşı məhsul şəkilləri çəkmək",
    },
    summary: {
      en: "Three changes that improve a photograph more than any filter.",
      az: "Şəkli hər hansı filtrdən daha çox yaxşılaşdıran üç dəyişiklik.",
    },
    explanation: [
      {
        en: "The single biggest improvement is light. Turn the ceiling light off and put the piece near a window, in daylight, but not in direct sun. Ceiling bulbs turn wool yellow or grey, and a customer who receives a different colour than they expected will not order again.",
        az: "Ən böyük fərqi işıq yaradır. Tavan işığını söndürün və işi pəncərənin yanına, gündüz işığına qoyun, amma birbaşa günəşə deyil. Tavan lampaları yunu sarı və ya boz göstərir, gözlədiyindən fərqli rəng alan müştəri isə bir daha sifariş verməz.",
      },
      {
        en: "The second is the background. A plain surface lets the eye go to the weaving: a wooden table, a clean wall, a folded sheet. A patterned tablecloth competes with a patterned textile and both lose.",
        az: "İkincisi fondur. Sadə səth gözü toxumanın üzərinə yönəldir: taxta masa, təmiz divar, qatlanmış mələfə. Naxışlı süfrə naxışlı toxuma ilə yarışır və hər ikisi itirir.",
      },
      {
        en: "The third is taking more than one. Customers want three things: the whole piece flat, a close view where the weave is visible, and the piece in use: on a table, on a chair, in a pair of hands. Three ordinary photographs are worth more than one perfect one.",
        az: "Üçüncüsü birdən çox şəkil çəkməkdir. Müştərilər üç şey istəyir: işin bütövlükdə düz görüntüsü, toxumanın göründüyü yaxın görüntü və işin istifadədə olduğu görüntü: masada, stulda, əllərdə. Üç adi şəkil bir mükəmməl şəkildən dəyərlidir.",
      },
    ],
    example: {
      title: {
        en: "The same cushion cover, twice",
        az: "Eyni yastıq üzlüyü, iki dəfə",
      },
      body: {
        en: "Leyla first photographed the indigo cushion cover in the evening under the kitchen light. The blue came out grey-green and Nərgiz said it looked like a different cushion. She took it again the next morning on the windowsill: same cushion, same phone, no filter. The indigo finally looked like indigo.",
        az: "Leyla indiqo yastıq üzlüyünü ilk dəfə axşam mətbəx işığında çəkdi. Mavi boz-yaşıl çıxdı və Nərgiz dedi ki, sanki başqa yastıqdır. Səhəri gün pəncərə taxtasında yenidən çəkdi: eyni yastıq, eyni telefon, filtrsiz. İndiqo nəhayət indiqo kimi göründü.",
      },
    },
    action: {
      prompt: {
        en: "Choose one product and photograph it three ways: the whole piece, a close view of the weave, and the piece in use. Write down which of the three you would put first on the public page, and why.",
        az: "Bir məhsul seçin və onu üç cür çəkin: bütövlükdə, toxumanın yaxın görüntüsü və istifadədə. Üçündən hansını ictimai səhifədə birinci qoyacağınızı və niyə, yazın.",
      },
      placeholder: {
        en: "I would put the close view first, because you can see it is handwoven and not machine-made.",
        az: "Yaxın görüntünü birinci qoyardım, çünki əl ilə toxunduğu və maşın işi olmadığı görünür.",
      },
    },
    takeaway: {
      en: "When you add photographs to a product, the first one becomes the main photo everywhere: the catalogue, the public page, and the social media preview.",
      az: "Məhsula şəkil əlavə edəndə birincisi hər yerdə əsas şəkil olur: kataloqda, ictimai səhifədə və sosial media önizləməsində.",
    },
  },

  {
    slug: "story-behind-the-craft",
    category: "storytelling",
    minutes: 5,
    suggestedFor: ["owner"],
    title: {
      en: "Writing About the Story Behind a Craft",
      az: "Sənətin arxasındakı hekayəni yazmaq",
    },
    summary: {
      en: "What to say about your work when you do not want to boast.",
      az: "Öyünmək istəmədiyiniz halda işiniz haqqında nə deyəsiniz.",
    },
    explanation: [
      {
        en: "Most artisans find this the hardest part, because writing about your own work feels like showing off. It helps to remember that a customer is not asking you to praise the piece. They are asking a simpler question: why is this one different from the one in the shop?",
        az: "Əksər sənətkarlar bunu ən çətin hissə sayır, çünki öz işin haqqında yazmaq öyünmək kimi gəlir. Yadda saxlamaq kömək edir ki, müştəri sizdən işi tərifləməyi istəmir. O, daha sadə sual verir: bu, mağazadakından nə ilə fərqlənir?",
      },
      {
        en: "The answer is almost always a fact, not an adjective. Who taught you. Where the pattern comes from. What the dye is made from. How long one takes. Why you make it this way and not the easier way. Facts like these are impossible to fake, which is exactly why they work.",
        az: "Cavab demək olar həmişə sifət yox, faktdır. Sizə kim öyrədib. Naxış haradan gəlir. Boya nədən hazırlanır. Bir dənəsi nə qədər çəkir. Niyə bunu asan yolla yox, bu cür edirsiniz. Belə faktları uydurmaq mümkün deyil, elə buna görə də işləyir.",
      },
      {
        en: "Write it the way you would say it to someone sitting next to you. Short sentences. No words you would not use out loud. If a sentence sounds like an advertisement, take it out.",
        az: "Yanınızda oturan birinə deyəcəyiniz kimi yazın. Qısa cümlələr. Ucadan işlətməyəcəyiniz sözlərdən istifadə etməyin. Bir cümlə reklam kimi səslənirsə, onu çıxarın.",
      },
    ],
    example: {
      title: { en: "Two ways to describe the same runner", az: "Eyni yolluğu təsvir etməyin iki yolu" },
      body: {
        en: "Weak: “An exquisite luxury table runner showcasing the timeless heritage of Azerbaijani craftsmanship.” Strong: “My mother put a pomegranate at each end of a runner as a wish for a full house. I have kept that. The red is dyed with madder root, so no two come out the same shade.” The second one tells you something the first one does not, and only Nərgiz could have written it.",
        az: "Zəif: “Azərbaycan sənətkarlığının əbədi irsini nümayiş etdirən zərif lüks süfrə yolluğu.” Güclü: “Anam evin bolluğu üçün yolluğun hər iki ucuna bir nar qoyardı. Mən də bunu saxlamışam. Qırmızı boyaq kökü ilə boyanır, ona görə iki dənəsi eyni çalarda çıxmır.” İkincisi birincinin demədiyi bir şeyi deyir və onu yalnız Nərgiz yaza bilərdi.",
      },
    },
    action: {
      prompt: {
        en: "Pick one piece you have made many times. Write down three facts about it that a customer could not guess by looking: who taught you, where the pattern comes from, or why you make it that way.",
        az: "Dəfələrlə hazırladığınız bir işi seçin. Müştərinin baxmaqla təxmin edə bilməyəcəyi üç fakt yazın: sizə kim öyrədib, naxış haradan gəlir və ya niyə məhz bu cür hazırlayırsınız.",
      },
      placeholder: {
        en: "1. My mother taught me this pattern first because it teaches you to count.\n2. The brown is walnut husk from our own tree.\n3. I weave the border last, not first, so it stays even.",
        az: "1. Anam bu naxışı ilk öyrədib, çünki saymağı öyrədir.\n2. Qəhvəyi rəng öz ağacımızın qoz qabığındandır.\n3. Haşiyəni əvvəl yox, sonda toxuyuram ki, düz alınsın.",
      },
    },
    takeaway: {
      en: "What you write here becomes the story on the product page, and it is what the social media studio builds a caption from. Nothing is invented on your behalf.",
      az: "Burada yazdıqlarınız məhsul səhifəsindəki hekayə olur və sosial media studiyası mətn qurarkən məhz bundan istifadə edir. Sizin adınıza heç nə uydurulmur.",
    },
  },

  {
    slug: "pricing-handmade-work",
    category: "pricing",
    minutes: 6,
    suggestedFor: ["owner"],
    title: { en: "Pricing Handmade Work", az: "Əl işinin qiymətləndirilməsi" },
    summary: {
      en: "Start from what it costs you, not from what the shop down the road charges.",
      az: "Qonşu mağazanın qiymətindən yox, sizə nəyə başa gəldiyindən başlayın.",
    },
    explanation: [
      {
        en: "Many artisans price by looking at someone else's shelf. That tells you what a machine-made version costs, or what a shop with a different rent charges. It does not tell you whether you are making a living.",
        az: "Bir çox sənətkar qiyməti başqasının rəfinə baxaraq qoyur. Bu, sizə maşın işinin nə qədər olduğunu və ya kirayəsi fərqli olan mağazanın nə aldığını deyir. Amma dolanıb-dolanmadığınızı demir.",
      },
      {
        en: "Start with three numbers instead: what the materials cost, how many hours the piece takes, and what else you spend to sell it: delivery, packaging, the wool you spoiled learning the pattern. Decide what your hour is worth, even if the number feels uncomfortable to write down. Add the three together. That is your floor, not your price.",
        az: "Bunun əvəzinə üç rəqəmdən başlayın: materialların dəyəri, işə sərf olunan saatlar və satmaq üçün xərclədiyiniz digər şeylər: çatdırılma, qablaşdırma, naxışı öyrənərkən korladığınız yun. Bir saatınızın dəyərini müəyyən edin, rəqəmi yazmaq narahat gəlsə belə. Üçünü toplayın. Bu, qiymətiniz deyil, ən aşağı həddinizdir.",
      },
      {
        en: "The most common mistake is not counting your own hours at all, because the weaving is something you would do anyway. But an unpriced hour is the reason a business that looks busy still has no money at the end of the month.",
        az: "Ən çox rast gəlinən səhv öz saatlarınızı ümumiyyətlə saymamaqdır, çünki toxumanı onsuz da edərdiniz. Amma qiymətləndirilməmiş saat, məşğul görünən bir biznesin ay sonunda niyə pulsuz qaldığının səbəbidir.",
      },
      {
        en: "One more thing: raising a price on a new piece is far easier than raising it on a piece regular customers already know. If you are unsure, set the new one slightly higher than feels comfortable.",
        az: "Bir şey də var: yeni bir işin qiymətini qaldırmaq, daimi müştərilərin artıq bildiyi bir işin qiymətini qaldırmaqdan xeyli asandır. Əmin deyilsinizsə, yeni işi rahat hiss etdiyinizdən bir az yuxarı qoyun.",
      },
    ],
    example: {
      title: { en: "The runner, counted honestly", az: "Yolluq, düzgün hesablanmış" },
      body: {
        en: "Wool and dye for one pomegranate runner: 22 AZN. Nine days at roughly three hours a day: 27 hours. Delivery inside Baku: 3 AZN. At 3 AZN an hour, that is 22 + 81 + 3 = 106 AZN before any profit. Nərgiz has been charging 95. She is not making a small margin. She is paying to weave.",
        az: "Bir nar yolluğu üçün yun və boya: 22 AZN. Doqquz gün, günə təxminən üç saat: 27 saat. Bakı daxilində çatdırılma: 3 AZN. Saatı 3 AZN-dən, bu, 22 + 81 + 3 = 106 AZN edir, hələ heç bir qazanc olmadan. Nərgiz 95 alır. Onun mənfəəti az deyil. O, toxumaq üçün pul verir.",
      },
    },
    action: {
      prompt: {
        en: "Choose one product and write down the cost of its materials, the time required to make it, and any delivery costs.",
        az: "Bir məhsul seçin və onun materiallarının dəyərini, hazırlanmasına lazım olan vaxtı və çatdırılma xərclərini yazın.",
      },
      placeholder: {
        en: "Cushion cover: wool 9 AZN, backing 2 AZN, 4 days × 2 hours = 8 hours, delivery 3 AZN.",
        az: "Yastıq üzlüyü: yun 9 AZN, astar 2 AZN, 4 gün × 2 saat = 8 saat, çatdırılma 3 AZN.",
      },
    },
    takeaway: {
      en: "In LoomLock, only the business owner sets a final price. A younger family member can suggest one with a reason, and you decide.",
      az: "LoomLock-da son qiyməti yalnız biznes sahibi təyin edir. Ailənin gənc üzvü səbəb göstərərək təklif edə bilər, qərarı siz verirsiniz.",
    },
  },

  {
    slug: "communicating-with-customers",
    category: "customers",
    minutes: 5,
    suggestedFor: ["collaborator"],
    title: { en: "Communicating with Customers", az: "Müştərilərlə ünsiyyət" },
    summary: {
      en: "A good reply answers the question, then answers the next one.",
      az: "Yaxşı cavab sualı, sonra növbəti sualı cavablandırır.",
    },
    explanation: [
      {
        en: "When someone asks “how much is the runner?”, a reply that says only “95 AZN” is technically correct and usually ends the conversation. The customer still does not know how long they will wait, whether the size can change, or how they will receive it, so they go away to think, and thinking usually means forgetting.",
        az: "Kimsə “yolluq neçəyədir?” soruşanda, yalnız “95 AZN” cavabı texniki cəhətdən düzgündür və adətən söhbəti bitirir. Müştəri hələ də nə qədər gözləyəcəyini, ölçünün dəyişə biləcəyini və ya necə alacağını bilmir, ona görə düşünmək üçün uzaqlaşır, düşünmək isə adətən unutmaq deməkdir.",
      },
      {
        en: "Answer the question first, in the first line. Then add the two things they will ask next: how long it takes and how they get it. Then stop. Three short lines are read; three paragraphs are not.",
        az: "Əvvəlcə sualı, birinci sətirdə cavablandırın. Sonra növbəti soruşacaqları iki şeyi əlavə edin: nə qədər vaxt aparır və necə alacaqlar. Sonra dayanın. Üç qısa sətir oxunur; üç abzas oxunmur.",
      },
      {
        en: "Reply in the language the customer used, and reply even when the answer is no. “I cannot do it by Friday, but I could by the 20th” keeps a customer. Silence loses one, and they rarely tell you why.",
        az: "Müştərinin işlətdiyi dildə cavab verin və cavab “xeyr” olanda da cavab verin. “Cüməyə çatdıra bilmərəm, amma ayın 20-nə edə bilərəm” müştərini saxlayır. Susmaq onu itirir və o, səbəbini nadir hallarda deyir.",
      },
    ],
    example: {
      title: { en: "Two replies to the same question", az: "Eyni suala iki cavab" },
      body: {
        en: "Weak: “95 AZN.” Better: “The runner is 95 AZN. It takes about nine days to weave, and you can collect it from the studio in Baku or we can deliver in the city for 3 AZN. If your table is longer than 150 cm, tell me the length and I will check with my grandmother what it would cost.”",
        az: "Zəif: “95 AZN.” Daha yaxşı: “Yolluq 95 AZN-dir. Toxunması təxminən doqquz gün çəkir, Bakıdakı studiyadan götürə bilərsiniz və ya şəhər daxilində 3 AZN-ə çatdıra bilərik. Süfrəniz 150 sm-dən uzundursa, uzunluğu deyin, nənəmdən nə qədər olacağını soruşum.”",
      },
    },
    action: {
      prompt: {
        en: "Find a real question a customer asked recently. Write a reply that answers it in the first line, then adds the production time and how they receive it.",
        az: "Müştərinin bu yaxınlarda verdiyi əsl sualı tapın. Birinci sətirdə sualı cavablandıran, sonra hazırlanma müddətini və necə alacağını əlavə edən cavab yazın.",
      },
      placeholder: {
        en: "Write your reply here as if you were sending it.",
        az: "Cavabınızı göndərəcəkmiş kimi buraya yazın.",
      },
    },
    takeaway: {
      en: "The order board has prepared messages for the five most common situations. They are starting points. Change them so they sound like your family before you send.",
      az: "Sifariş lövhəsində ən çox rast gəlinən beş hal üçün hazır mesajlar var. Onlar başlanğıcdır. Göndərməzdən əvvəl ailənizə oxşasın deyə dəyişin.",
    },
  },

  {
    slug: "organising-orders",
    category: "orders",
    minutes: 4,
    suggestedFor: ["collaborator", "owner"],
    title: { en: "Organizing Orders", az: "Sifarişləri nizama salmaq" },
    summary: {
      en: "Why the board matters more once two people are answering messages.",
      az: "İki nəfər mesajlara cavab verəndə lövhə niyə daha vacib olur.",
    },
    explanation: [
      {
        en: "One person with five orders can keep them in their head. Two people with five orders cannot, and the failure is always the same: both reply, or neither does, and the customer sees a business that does not know what it is doing.",
        az: "Beş sifarişi olan bir nəfər onları yadında saxlaya bilər. Beş sifarişi olan iki nəfər saxlaya bilməz və nasazlıq həmişə eynidir: ya hər ikisi cavab verir, ya heç biri. Müştəri isə nə etdiyini bilməyən bir biznes görür.",
      },
      {
        en: "A board fixes this with two habits. Every order sits in exactly one stage, and every order has one name on it. If a card has no name, nobody owns it, and an order nobody owns is the one that gets forgotten.",
        az: "Lövhə bunu iki vərdişlə həll edir. Hər sifariş yalnız bir mərhələdə olur və hər sifarişin üzərində bir ad var. Kartda ad yoxdursa, ona sahib çıxan yoxdur, sahibsiz sifariş isə unudulan sifarişdir.",
      },
      {
        en: "Move the card when the thing happens, not at the end of the week. The board is only useful if it is true; a board that is three days out of date is worse than no board, because people trust it.",
        az: "Kartı hadisə baş verəndə hərəkət etdirin, həftənin sonunda yox. Lövhə yalnız doğru olanda faydalıdır; üç gün köhnəlmiş lövhə heç lövhə olmamasından pisdir, çünki insanlar ona etibar edir.",
      },
    ],
    example: {
      title: { en: "The order that was answered twice", az: "İki dəfə cavablandırılan sifariş" },
      body: {
        en: "Rəşad asked about four cushion covers. Leyla replied with a price on Monday. Nərgiz, not knowing, replied on Tuesday with a slightly different price. Rəşad asked which one was correct. Since then, every order gets a name on the card before anyone answers.",
        az: "Rəşad dörd yastıq üzlüyü haqqında soruşdu. Leyla bazar ertəsi qiymətlə cavab verdi. Nərgiz bundan xəbərsiz, çərşənbə axşamı bir az fərqli qiymətlə cavab verdi. Rəşad hansının doğru olduğunu soruşdu. O vaxtdan hər sifarişə cavab verilməzdən əvvəl kartda ad yazılır.",
      },
    },
    action: {
      prompt: {
        en: "Open the order board. Find any order with no name on it, put someone's name on it, and write one line here about what the next action is.",
        az: "Sifariş lövhəsini açın. Üzərində ad olmayan bir sifariş tapın, ona ad yazın və növbəti addımın nə olduğunu bir sətirlə buraya yazın.",
      },
      placeholder: {
        en: "NT-119 (Tom) is mine. Next action: find out the postage to the UK before replying.",
        az: "NT-119 (Tom) mənimdir. Növbəti addım: cavab verməzdən əvvəl Britaniyaya poçt xərcini öyrənmək.",
      },
    },
    takeaway: {
      en: "Anyone in the family can move an order forward and assign it. Only a reply that promises a price or a date goes to the owner first.",
      az: "Ailənin istənilən üzvü sifarişi irəli apara və təyin edə bilər. Yalnız qiymət və ya tarix vəd edən cavab əvvəlcə sahibkara gedir.",
    },
  },

  {
    slug: "costs-and-profit",
    category: "money",
    minutes: 6,
    suggestedFor: ["owner"],
    title: { en: "Understanding Costs and Profit", az: "Xərcləri və mənfəəti anlamaq" },
    summary: {
      en: "The difference between money that came in and money you kept.",
      az: "Gələn pulla saxladığınız pul arasındakı fərq.",
    },
    explanation: [
      {
        en: "Money that arrives is not profit. Out of every payment comes the wool, the dye, the packaging, the delivery, and the hours you worked. What is left after all of that is profit, and it is usually much smaller than it feels on the day the customer pays.",
        az: "Gələn pul mənfəət deyil. Hər ödənişdən yun, boya, qablaşdırma, çatdırılma və işlədiyiniz saatlar çıxır. Bunların hamısından sonra qalan mənfəətdir və o, adətən müştərinin ödədiyi gün hiss olunduğundan xeyli azdır.",
      },
      {
        en: "Some costs repeat with every piece: wool, thread, packaging. Others you pay whether or not you sell anything this month: the loom, the room, the internet. Both are real. A price that only covers the first kind will keep you busy and still leave you short.",
        az: "Bəzi xərclər hər işlə təkrarlanır: yun, sap, qablaşdırma. Digərlərini bu ay bir şey satsanız da, satmasanız da ödəyirsiniz: dəzgah, otaq, internet. Hər ikisi realdır. Yalnız birinci növü ödəyən qiymət sizi məşğul saxlayacaq, amma yenə də kasıb qoyacaq.",
      },
      {
        en: "You do not need accounting software to see this. A notebook with three columns (what came in, what went out, what it was for) kept for one month will tell you more about the business than a year of guessing.",
        az: "Bunu görmək üçün mühasibat proqramı lazım deyil. Üç sütunlu bir dəftər (nə gəldi, nə çıxdı, nəyə görə) bir ay saxlansa, biznes haqqında bir illik təxmindən çox şey deyəcək.",
      },
    ],
    example: {
      title: { en: "A month that looked good", az: "Yaxşı görünən bir ay" },
      body: {
        en: "Last month the studio took 410 AZN across six pieces. Wool and dye cost 96 AZN, packaging and delivery 34 AZN, and a replacement shuttle 15 AZN. That leaves 265 AZN for roughly 70 hours of weaving, which is under 4 AZN an hour. The month felt busy and successful. The number is the reason the bookmark price is being reconsidered.",
        az: "Keçən ay studiya altı işdən 410 AZN aldı. Yun və boya 96 AZN, qablaşdırma və çatdırılma 34 AZN, əvəzedici məkik 15 AZN. Təxminən 70 saatlıq toxuma üçün 265 AZN qalır, yəni saatı 4 AZN-dən az. Ay məşğul və uğurlu hiss olundu. Əlfəcin qiymətinin yenidən nəzərdən keçirilməsinin səbəbi məhz bu rəqəmdir.",
      },
    },
    action: {
      prompt: {
        en: "Write down everything you spent on the business in the last month, and everything that came in. Do not tidy the numbers.",
        az: "Keçən ay biznesə xərclədiyiniz hər şeyi və gələn hər şeyi yazın. Rəqəmləri gözəlləşdirməyin.",
      },
      placeholder: {
        en: "In: 410 AZN. Out: wool 96, packaging 34, shuttle 15.",
        az: "Gələn: 410 AZN. Çıxan: yun 96, qablaşdırma 34, məkik 15.",
      },
    },
    takeaway: {
      en: "Cost records stay with the business owner. LoomLock does not connect to a bank account and never will.",
      az: "Xərc qeydləri biznes sahibində qalır. LoomLock bank hesabına qoşulmur və qoşulmayacaq.",
    },
  },

  {
    slug: "protecting-information",
    category: "privacy",
    minutes: 5,
    suggestedFor: ["collaborator", "owner"],
    title: {
      en: "Protecting Personal and Customer Information",
      az: "Şəxsi və müştəri məlumatlarının qorunması",
    },
    summary: {
      en: "What is safe to post, and what belongs only in your order board.",
      az: "Nəyi paylaşmaq olar, nə isə yalnız sifariş lövhənizdə qalmalıdır.",
    },
    explanation: [
      {
        en: "A customer who sends you their address for a delivery has trusted you with it for one purpose. It does not belong in a photograph of a parcel, in a screenshot you share, or in a story about a busy week. The same goes for their phone number and their name next to what they paid.",
        az: "Çatdırılma üçün ünvanını göndərən müştəri onu bir məqsəd üçün sizə etibar edib. O ünvanın bağlamanın şəklində, paylaşdığınız ekran görüntüsündə və ya məşğul həftə haqqında hekayədə yeri yoxdur. Telefon nömrəsi və ödədiyi məbləğin yanındakı adı üçün də eynidir.",
      },
      {
        en: "Before you post a screenshot of a nice message, cover the name, the photograph, and the handle. A compliment is just as warm without them. Before you post a parcel, check the label is not in the frame.",
        az: "Xoş mesajın ekran görüntüsünü paylaşmazdan əvvəl adı, şəkli və istifadəçi adını örtün. Tərif onlarsız da eyni dərəcədə istidir. Bağlamanın şəklini paylaşmazdan əvvəl etiketin kadrda olmadığını yoxlayın.",
      },
      {
        en: "Your own information matters too. A business account does not need your home address, your date of birth, or a photograph of your document. If a platform or a person asks for those to “verify” you, that is worth stopping over. The next lesson is about exactly that.",
        az: "Öz məlumatlarınız da vacibdir. Biznes hesabına ev ünvanınız, doğum tarixiniz və ya sənədinizin şəkli lazım deyil. Bir platforma və ya bir şəxs sizi “təsdiqləmək” üçün bunları istəyirsə, dayanmağa dəyər. Növbəti dərs məhz bundan bəhs edir.",
      },
    ],
    example: {
      title: { en: "The parcel photograph", az: "Bağlamanın şəkli" },
      body: {
        en: "Leyla nearly posted a photograph of three wrapped bookmark sets ready to go. The address label was readable in the corner: a full name, a street, a flat number, and a phone number of a woman who had only ordered gifts for her son's teachers. She cropped it and posted the parcels on the table instead.",
        az: "Leyla göndərilməyə hazır üç əlfəcin dəstinin şəklini az qala paylaşacaqdı. Küncdə ünvan etiketi oxunurdu: tam ad, küçə, mənzil nömrəsi və yalnız oğlunun müəllimlərinə hədiyyə sifariş etmiş bir qadının telefon nömrəsi. O, şəkli kəsdi və bağlamaları masanın üstündə paylaşdı.",
      },
    },
    action: {
      prompt: {
        en: "Look at the last three things you posted about the business. Write down anything visible in them that belonged to a customer.",
        az: "Biznes haqqında son paylaşdığınız üç şeyə baxın. Onlarda görünən və müştəriyə aid olan hər şeyi yazın.",
      },
      placeholder: {
        en: "The parcel photo had a readable address label. Nothing in the other two.",
        az: "Bağlama şəklində oxunan ünvan etiketi vardı. Digər ikisində heç nə.",
      },
    },
    takeaway: {
      en: "Customer contact details live on the order board and are never copied into a social media draft.",
      az: "Müştəri əlaqə məlumatları sifariş lövhəsində qalır və heç vaxt sosial media qaralamasına köçürülmür.",
    },
  },

  {
    slug: "recognising-suspicious-messages",
    category: "safety",
    minutes: 5,
    suggestedFor: ["collaborator", "owner"],
    title: { en: "Recognizing Suspicious Messages", az: "Şübhəli mesajları tanımaq" },
    summary: {
      en: "The three patterns behind almost every message that costs a small business money.",
      az: "Kiçik biznesə pula başa gələn demək olar hər mesajın arxasındakı üç nümunə.",
    },
    explanation: [
      {
        en: "Almost every message that ends badly has at least one of three things in it. It is urgent: you must answer today or lose the order. It asks you to move somewhere else: a different app, a link, a form. Or it involves a payment that is strange in shape: too much sent by mistake, a deposit you must refund, a courier only they can arrange.",
        az: "Pis bitən demək olar hər mesajda üç şeydən ən azı biri var. Təcilidir: bu gün cavab verməsəniz, sifarişi itirəcəksiniz. Sizi başqa yerə çağırır: başqa tətbiq, bir keçid, bir forma. Və ya forması qəribə olan ödəniş var: səhvən çox göndərilib, geri qaytarmalı olduğunuz beh, yalnız onların təşkil edə biləcəyi kuryer.",
      },
      {
        en: "A large order from someone with no history, who does not ask a single question about the work, is not a compliment. Real customers ask about size, colour, and when it will be ready. Someone who agrees to any price without looking is not buying a runner.",
        az: "Heç bir keçmişi olmayan və iş haqqında bir dənə də sual verməyən birindən gələn böyük sifariş iltifat deyil. Əsl müştərilər ölçü, rəng və nə vaxt hazır olacağı barədə soruşur. Baxmadan istənilən qiymətə razılaşan adam yolluq almır.",
      },
      {
        en: "The defence is slowness. Nothing real is lost by waiting a few hours and asking someone else in the family to read the message. In this business, the rule is simple: anything involving money or a link waits for Nərgiz, and nobody is ever in trouble for asking.",
        az: "Müdafiə yavaşlıqdır. Bir neçə saat gözləyib mesajı ailədən başqa birinə oxutmaqla heç nə itmir. Bu biznesdə qayda sadədir: pul və ya keçid olan hər şey Nərgizi gözləyir və soruşduğuna görə heç kim danlanmır.",
      },
    ],
    example: {
      title: { en: "The order that was too easy", az: "Həddindən artıq asan sifariş" },
      body: {
        en: "“I want 15 runners for my hotel, price is no problem, I will send payment today. My courier will collect. Just send me the tracking form at this link first.” No question about size, colour, or the nine days each one takes. Leyla did not reply. She showed it to Nərgiz, and they left it.",
        az: "“Otelim üçün 15 yolluq istəyirəm, qiymət problem deyil, ödənişi bu gün göndərəcəyəm. Kuryerim götürəcək. Sadəcə əvvəlcə bu keçiddən izləmə formasını göndərin.” Ölçü, rəng və hər birinin doqquz günü haqqında bir sual yoxdur. Leyla cavab vermədi. Nərgizə göstərdi və mesajı olduğu kimi buraxdılar.",
      },
    },
    action: {
      prompt: {
        en: "Write down the rule your family will follow when a message asks for money, a payment link, or an unusual delivery. Agree who decides.",
        az: "Bir mesaj pul, ödəniş keçidi və ya qeyri-adi çatdırılma istəyəndə ailənizin izləyəcəyi qaydanı yazın. Kimin qərar verdiyini razılaşdırın.",
      },
      placeholder: {
        en: "Anything about money or a link: I do not reply, I show Nənə the same day. She decides.",
        az: "Pul və ya keçidlə bağlı hər şey: cavab vermirəm, elə həmin gün Nənəyə göstərirəm. Qərarı o verir.",
      },
    },
    takeaway: {
      en: "This is why a reply that promises a price or a date goes to the owner first, not because anyone is being checked up on.",
      az: "Qiymət və ya tarix vəd edən cavabın əvvəlcə sahibkara getməsinin səbəbi budur, kimisə yoxlamaq üçün deyil.",
    },
  },

  {
    slug: "representing-traditions-responsibly",
    category: "culture",
    minutes: 6,
    suggestedFor: ["collaborator", "owner"],
    title: {
      en: "Representing Cultural Traditions Responsibly",
      az: "Mədəni ənənələri məsuliyyətlə təqdim etmək",
    },
    summary: {
      en: "Say what you know. Do not fill the gaps with something that sounds good.",
      az: "Bildiyinizi deyin. Boşluqları xoş səslənən bir şeylə doldurmayın.",
    },
    explanation: [
      {
        en: "A motif that has been woven for generations carries real meaning to real people. When a caption stretches that meaning to make a sale, by calling a common pattern ancient or claiming a symbol means something it does not, the people who grew up with it notice, and the claim is hard to take back.",
        az: "Nəsillərdir toxunan bir naxış əsl insanlar üçün əsl məna daşıyır. Mətn satış üçün bu mənanı uzadanda, yəni adi naxışı qədim adlandıranda və ya simvolun daşımadığı mənanı iddia edəndə, onunla böyümüş insanlar bunu görür və iddianı geri götürmək çətin olur.",
      },
      {
        en: "The honest version is usually more interesting anyway. “This is the first pattern my mother taught me, because it teaches you to count” is better than “an ancient symbol of prosperity”, and it is true, which means you can answer the next question about it.",
        az: "Dürüst variant onsuz da adətən daha maraqlıdır. “Bu, anamın mənə ilk öyrətdiyi naxışdır, çünki saymağı öyrədir” cümləsi “qədim bolluq simvolu”ndan yaxşıdır və doğrudur, yəni bu barədə növbəti sualı da cavablandıra bilərsiniz.",
      },
      {
        en: "If the meaning is uncertain, say that. “My mother called it a pomegranate; I do not know how old the pattern is” is a perfectly good sentence. And when a younger relative writes the caption, the meaning is not theirs to decide. The person who learned the craft is the one who says what it means.",
        az: "Məna qeyri-müəyyəndirsə, bunu deyin. “Anam ona nar deyirdi; naxışın nə qədər qədim olduğunu bilmirəm” tamamilə yaxşı cümlədir. Mətni gənc qohum yazanda isə mənaya qərar vermək onun işi deyil. Sənəti öyrənmiş adam onun nə demək olduğunu deyir.",
      },
    ],
    example: {
      title: { en: "The caption that was sent back", az: "Geri göndərilən mətn" },
      body: {
        en: "Leyla wrote that the wall textile was “an exclusive masterpiece of Azerbaijani heritage weaving.” Nərgiz sent it back: she would never call her own work a masterpiece, and the piece is a stepped diamond, the first thing a beginner is taught. The corrected caption says that instead, and it is the better post.",
        az: "Leyla divar toxumasının “Azərbaycan irs toxuculuğunun eksklüziv şah əsəri” olduğunu yazdı. Nərgiz onu geri göndərdi: o, öz işini heç vaxt şah əsər adlandırmazdı, üstəlik bu iş pilləli rombdur, yeni başlayana öyrədilən ilk şey. Düzəldilmiş mətndə məhz bu yazılıb və paylaşım daha yaxşıdır.",
      },
    },
    action: {
      prompt: {
        en: "Find one sentence in your product descriptions that claims something about tradition or meaning. Ask the person who learned the craft whether it is accurate, and write down what they said.",
        az: "Məhsul təsvirlərinizdə ənənə və ya məna haqqında iddia edən bir cümlə tapın. Sənəti öyrənmiş adamdan doğru olub-olmadığını soruşun və dediklərini yazın.",
      },
      placeholder: {
        en: "I wrote 'ancient symbol'. Nənə says she only knows her mother did it, so I changed it to that.",
        az: "“Qədim simvol” yazmışdım. Nənə deyir ki, sadəcə anasının belə etdiyini bilir, ona görə mətni dəyişdim.",
      },
    },
    takeaway: {
      en: "This is why nothing public is published without the artisan's approval, and why LoomLock never writes a cultural claim for you.",
      az: "İctimai heç nəyin sənətkarın təsdiqi olmadan dərc olunmamasının və LoomLock-un sizin üçün heç vaxt mədəni iddia yazmamasının səbəbi budur.",
    },
  },

  {
    slug: "dividing-family-responsibilities",
    category: "teamwork",
    minutes: 4,
    suggestedFor: ["owner", "collaborator"],
    title: {
      en: "Dividing Family Business Responsibilities",
      az: "Ailə biznesində məsuliyyətlərin bölünməsi",
    },
    summary: {
      en: "Write down who does what, before the disagreement rather than after.",
      az: "Kimin nə etdiyini mübahisədən sonra yox, əvvəl yazın.",
    },
    explanation: [
      {
        en: "In a family business the roles are usually assumed rather than agreed, and it works until the first time two people answer the same customer, or one of them makes a decision the other thought was theirs. Then it is not a small thing, because it is family.",
        az: "Ailə biznesində rollar adətən razılaşdırılmır, ehtimal olunur və bu, iki nəfər eyni müştəriyə cavab verənə və ya biri digərinin öz işi saydığı qərarı verənə qədər işləyir. Sonra bu, kiçik məsələ olmur, çünki söhbət ailədən gedir.",
      },
      {
        en: "The fix takes ten minutes: write down the three or four things each person owns, and name the small list of decisions that only one person makes. Not because anyone is being controlled, but because a shared job with no owner is the one that does not get done.",
        az: "Həlli on dəqiqə çəkir: hər kəsin öhdəsindəki üç-dörd işi yazın və yalnız bir nəfərin verdiyi qərarların qısa siyahısını adlandırın. Kimisə nəzarətdə saxlamaq üçün deyil, ona görə ki, sahibi olmayan birgə iş görülməyən işdir.",
      },
      {
        en: "Keep the list short and revisit it. As the younger person learns the craft and the older one learns the tools, things move across the line, and that is the point of working together rather than dividing the business in two.",
        az: "Siyahını qısa saxlayın və ona qayıdın. Gənc adam sənəti, yaşlı adam alətləri öyrəndikcə işlər sərhədi keçir, birlikdə işləməyin və biznesi ikiyə bölməməyin mənası da budur.",
      },
    ],
    example: {
      title: { en: "The list on the studio door", az: "Studiyanın qapısındakı siyahı" },
      body: {
        en: "Nərgiz: weaving, dyes, prices, the final yes on anything public. Leyla: photographs, captions, first replies, the order board. Both: adding products, moving orders. It is four lines on a piece of paper, and it ended the argument about who answers Instagram.",
        az: "Nərgiz: toxuma, boyalar, qiymətlər, ictimai olan hər şeyə son razılıq. Leyla: şəkillər, mətnlər, ilk cavablar, sifariş lövhəsi. Hər ikisi: məhsul əlavə etmək, sifarişləri hərəkət etdirmək. Bu, bir kağızda dörd sətirdir və Instagram-a kimin cavab verməsi mübahisəsini bitirdi.",
      },
    },
    action: {
      prompt: {
        en: "Write down what each person in your family business looks after, and the short list of decisions only one of you makes.",
        az: "Ailə biznesinizdə hər kəsin nəyə baxdığını və yalnız birinizin verdiyi qərarların qısa siyahısını yazın.",
      },
      placeholder: {
        en: "Nənə: weaving, prices, final yes. Me: photos, captions, first replies, order board.",
        az: "Nənə: toxuma, qiymətlər, son razılıq. Mən: şəkillər, mətnlər, ilk cavablar, sifariş lövhəsi.",
      },
    },
    takeaway: {
      en: "The Family page shows this list for real, and the permission table underneath it is the same list enforced by the app.",
      az: "Ailə səhifəsi bu siyahını real şəkildə göstərir, altındakı icazə cədvəli isə tətbiqin tətbiq etdiyi eyni siyahıdır.",
    },
  },
];

export function findLesson(slug: string): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.slug === slug);
}

export const LESSON_COUNT = LESSONS.length;
