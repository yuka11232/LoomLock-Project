import type {
  AppState,
  Approval,
  ContentDraft,
  Member,
  Order,
  Product,
  ActivityEvent,
} from "../types";

/**
 * Demo data for LoomLock.
 *
 * Nərgiz Textile Studio is a FICTIONAL business written for this demo. It is not
 * a real workshop and is not a LoomLock partner. The cultural references
 * (the pomegranate motif, the buta, the Quba weaving region) are real and are
 * used plainly, as a weaver would mention them, not as decoration.
 *
 * The data is shaped to show the collaboration loop in progress:
 *   - Leyla has a product waiting for Nərgiz to approve
 *   - Leyla has a caption waiting, and one Nərgiz already sent back
 *   - Leyla has suggested a price Nərgiz has not decided on
 *   - Two enquiries have arrived and nobody has replied yet
 *   - Orders sit at several different stages
 */

export const SEED_VERSION = 3;

const OWNER_ID = "member_nergiz";
const COLLAB_ID = "member_leyla";

/** Seed timestamps are relative to first load so the activity feed reads well. */
function daysAgo(days: number, hour = 10, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function daysAhead(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

/* ------------------------------------------------------------------ members */

const members: Member[] = [
  {
    id: OWNER_ID,
    name: "Nərgiz Əliyeva",
    role: "owner",
    initials: "NƏ",
    accent: "pomegranate",
    joinedAt: daysAgo(240),
    focus: {
      en: "Weaves everything in the studio and decides what the work is worth.",
      az: "Studiyadakı hər şeyi toxuyur və işin dəyərini müəyyən edir.",
    },
    responsibilities: [
      { en: "Weaving and finishing every piece", az: "Hər işin toxunması və tamamlanması" },
      { en: "Setting prices", az: "Qiymətlərin təyin edilməsi" },
      {
        en: "Approving anything customers will see",
        az: "Müştərilərin görəcəyi hər şeyin təsdiqi",
      },
      { en: "Choosing wool and dyes", az: "Yun və boyaların seçilməsi" },
    ],
  },
  {
    id: COLLAB_ID,
    name: "Leyla Əliyeva",
    role: "collaborator",
    initials: "LƏ",
    accent: "indigo",
    joinedAt: daysAgo(96),
    focus: {
      en: "Photographs the work, writes the posts, and keeps the order board tidy.",
      az: "İşləri şəkil çəkir, paylaşımları yazır və sifariş lövhəsini nizamda saxlayır.",
    },
    responsibilities: [
      { en: "Product photographs", az: "Məhsul şəkilləri" },
      { en: "Instagram captions and drafts", az: "Instagram mətnləri və qaralamaları" },
      { en: "First replies to customer questions", az: "Müştəri suallarına ilk cavablar" },
      { en: "Keeping the order board up to date", az: "Sifariş lövhəsinin yenilənməsi" },
    ],
  },
];

/* ----------------------------------------------------------------- products */

const products: Product[] = [
  {
    id: "product_runner",
    name: { en: "Pomegranate Table Runner", az: "Nar naxışlı süfrə yolluğu" },
    category: "home_textiles",
    description: {
      en: "A woven runner for a long table, with a row of pomegranate motifs down the centre and a plain woven border at each end.",
      az: "Uzun süfrə üçün toxunmuş yolluq: ortasında bir sıra nar naxışı, hər iki ucunda sadə toxunma haşiyə.",
    },
    story: {
      en: "The pomegranate is an old motif in our region. My mother put one at each end of a runner as a wish for a full house, and I have kept that. I learned to weave from her in a village outside Quba, on a loom my grandfather built. The red comes from madder root, so no two batches are exactly the same shade.",
      az: "Nar bizim bölgədə qədim naxışdır. Anam evin bolluğu üçün yolluğun hər iki ucuna bir nar qoyardı, mən də bunu saxlamışam. Toxumağı ondan Quba yaxınlığındakı bir kənddə, babamın düzəltdiyi dəzgahda öyrənmişəm. Qırmızı rəng boyaq kökündən alınır, ona görə iki partiya heç vaxt tam eyni çalarda olmur.",
    },
    price: 95,
    priceOnRequest: false,
    productionDays: 9,
    materials: [
      { en: "Hand-dyed wool", az: "Əl ilə boyanmış yun" },
      { en: "Cotton warp", az: "Pambıq əriş" },
      { en: "Madder root dye", az: "Boyaq kökü boyası" },
    ],
    dimensions: "150 × 40 cm",
    stockStatus: "available",
    madeToOrder: true,
    status: "public",
    images: [
      {
        id: "image_runner_1",
        kind: "motif",
        motif: "pomegranate",
        palette: "pomegranate",
        isCover: true,
        alt: {
          en: "A woven runner in deep red with a row of pomegranate motifs along the centre.",
          az: "Ortasında bir sıra nar naxışı olan tünd qırmızı toxunma yolluq.",
        },
      },
      {
        id: "image_runner_2",
        kind: "motif",
        motif: "stripe",
        palette: "clay",
        isCover: false,
        alt: {
          en: "Close view of the woven border at the end of the runner.",
          az: "Yolluğun ucundakı toxunma haşiyənin yaxın görüntüsü.",
        },
      },
    ],
    createdBy: OWNER_ID,
    createdAt: daysAgo(84),
    updatedAt: daysAgo(12),
    history: [
      { id: "hist_r1", at: daysAgo(84), actorId: OWNER_ID, kind: "created" },
      { id: "hist_r2", at: daysAgo(80), actorId: COLLAB_ID, kind: "updated", note: "Added photographs" },
      { id: "hist_r3", at: daysAgo(78), actorId: COLLAB_ID, kind: "submitted" },
      { id: "hist_r4", at: daysAgo(77), actorId: OWNER_ID, kind: "approved" },
    ],
  },
  {
    id: "product_cushion",
    name: { en: "Caspian Blue Cushion Cover", az: "Xəzər mavisi yastıq üzlüyü" },
    category: "cushions",
    description: {
      en: "A 45 cm cushion cover woven in indigo and undyed wool, with a small buta at each corner. Backed in plain cotton with a hidden opening.",
      az: "İndiqo və boyanmamış yundan toxunmuş 45 sm-lik yastıq üzlüyü, hər küncündə kiçik buta. Arxası sadə pambıqdır, gizli açılışla.",
    },
    story: {
      en: "The buta is the shape most people recognise from Azerbaijani carpets. I weave a small one at each corner rather than a large one in the middle, because a cushion is handled every day and the corners are what people see. The indigo is bought dyed; it is one of the few things I do not dye myself.",
      az: "Buta insanların Azərbaycan xalçalarından ən çox tanıdığı formadır. Ortada böyük bir dənə əvəzinə hər küncdə kiçik bir dənə toxuyuram, çünki yastıq hər gün əllənir və insanlar künclərini görür. İndiqo boyanmış alınır; özüm boyamadığım az şeylərdən biridir.",
    },
    price: 55,
    priceOnRequest: false,
    productionDays: 4,
    materials: [
      { en: "Indigo-dyed wool", az: "İndiqo ilə boyanmış yun" },
      { en: "Undyed local wool", az: "Boyanmamış yerli yun" },
      { en: "Cotton backing", az: "Pambıq astar" },
    ],
    dimensions: "45 × 45 cm",
    stockStatus: "made_to_order",
    madeToOrder: true,
    status: "public",
    images: [
      {
        id: "image_cushion_1",
        kind: "motif",
        motif: "buta",
        palette: "indigo",
        isCover: true,
        alt: {
          en: "An indigo cushion cover with a small buta motif woven into each corner.",
          az: "Hər küncündə kiçik buta naxışı toxunmuş indiqo yastıq üzlüyü.",
        },
      },
    ],
    createdBy: OWNER_ID,
    createdAt: daysAgo(61),
    updatedAt: daysAgo(20),
    history: [
      { id: "hist_c1", at: daysAgo(61), actorId: OWNER_ID, kind: "created" },
      { id: "hist_c2", at: daysAgo(59), actorId: COLLAB_ID, kind: "updated", note: "Added photograph" },
      { id: "hist_c3", at: daysAgo(58), actorId: OWNER_ID, kind: "approved" },
    ],
  },
  {
    id: "product_wall",
    name: { en: "Small Geometric Wall Textile", az: "Kiçik həndəsi divar toxuması" },
    category: "wall_pieces",
    description: {
      en: "A small flat-woven panel for a wall, in walnut brown and cream. Comes with a wooden dowel and cord ready to hang.",
      az: "Divar üçün kiçik düz toxunmuş panel, qoz qəhvəyisi və krem rəngdə. Asmağa hazır taxta çubuq və iplə birlikdə.",
    },
    story: {
      en: "The pattern is a simple stepped diamond, the first thing my mother taught me because it teaches you to count. I still weave one whenever I set up a new warp.",
      az: "Naxış sadə pilləli romb şəklidir, anamın mənə ilk öyrətdiyi şey, çünki saymağı öyrədir. Yeni əriş qurduğum hər dəfə bir dənə toxuyuram.",
    },
    price: 70,
    priceOnRequest: false,
    productionDays: 5,
    materials: [
      { en: "Walnut-dyed wool", az: "Qoz qabığı ilə boyanmış yun" },
      { en: "Undyed cotton", az: "Boyanmamış pambıq" },
      { en: "Beech dowel", az: "Fıstıq ağacından çubuq" },
    ],
    dimensions: "40 × 55 cm",
    stockStatus: "available",
    madeToOrder: true,
    status: "in_review",
    images: [
      {
        id: "image_wall_1",
        kind: "motif",
        motif: "medallion",
        palette: "clay",
        isCover: true,
        alt: {
          en: "A small woven wall panel in brown and cream with a stepped diamond pattern.",
          az: "Pilləli romb naxışlı, qəhvəyi və krem rəngli kiçik toxunma divar paneli.",
        },
      },
    ],
    createdBy: COLLAB_ID,
    createdAt: daysAgo(6),
    updatedAt: daysAgo(2),
    history: [
      { id: "hist_w1", at: daysAgo(6), actorId: COLLAB_ID, kind: "created" },
      {
        id: "hist_w2",
        at: daysAgo(4),
        actorId: OWNER_ID,
        kind: "updated",
        note: "Nərgiz added the story about the stepped diamond",
      },
      { id: "hist_w3", at: daysAgo(2), actorId: COLLAB_ID, kind: "submitted" },
    ],
  },
  {
    id: "product_bookmarks",
    name: { en: "Handwoven Bookmark Set", az: "Əl ilə toxunmuş əlfəcin dəsti" },
    category: "small_gifts",
    description: {
      en: "A set of four narrow woven bookmarks, each in a different colour, finished with a short tassel.",
      az: "Dörd ədəd nazik toxunma əlfəcin dəsti, hər biri fərqli rəngdə, ucunda qısa qotaz ilə.",
    },
    // Deliberately empty: the dashboard should ask the family to finish this.
    story: { en: "", az: "" },
    price: null,
    priceOnRequest: false,
    productionDays: 2,
    materials: [{ en: "Wool offcuts", az: "Yun qırıntıları" }],
    dimensions: "18 × 4 cm each",
    stockStatus: "available",
    madeToOrder: true,
    status: "draft",
    images: [],
    createdBy: COLLAB_ID,
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
    history: [
      {
        id: "hist_b1",
        at: daysAgo(5),
        actorId: COLLAB_ID,
        kind: "created",
        note: "Started from the offcuts basket",
      },
    ],
  },
  {
    id: "product_coasters",
    name: { en: "Wool Coaster Set of Four", az: "Dörd ədədlik yun altlıq dəsti" },
    category: "small_gifts",
    description: {
      en: "Four thick woven coasters in natural wool shades.",
      az: "Təbii yun çalarlarında dörd qalın toxunma altlıq.",
    },
    story: { en: "", az: "" },
    price: null,
    priceOnRequest: true,
    productionDays: null,
    materials: [],
    dimensions: "",
    stockStatus: "available",
    madeToOrder: true,
    status: "draft",
    images: [],
    createdBy: COLLAB_ID,
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
    history: [{ id: "hist_co1", at: daysAgo(3), actorId: COLLAB_ID, kind: "created" }],
  },
];

/* ----------------------------------------------------------- content drafts */

const contentDrafts: ContentDraft[] = [
  {
    id: "content_cushion_approved",
    productId: "product_cushion",
    goal: "introduce",
    tone: "warm",
    platform: "instagram",
    language: "en",
    caption:
      "A new cushion cover off the loom this week.\n\nIndigo and undyed wool, 45 × 45 cm, with a small buta woven into each corner. My grandmother puts them at the corners rather than the middle, because a cushion gets picked up and put down all day and the corners are what you actually see.\n\nFour days on the loom. We can weave another in the same colours if you would like one.",
    hashtags: ["handwoven", "azerbaijan", "cushioncover", "naturaldye", "buta"],
    status: "approved",
    createdBy: COLLAB_ID,
    createdAt: daysAgo(15),
    updatedAt: daysAgo(13),
  },
  {
    id: "content_runner_review",
    productId: "product_runner",
    goal: "story",
    tone: "story",
    platform: "instagram",
    language: "en",
    caption:
      "Why there is a pomegranate at each end of this runner.\n\nMy grandmother learned to weave in a village outside Quba, on a loom her father built. She puts a pomegranate at each end of a table runner the way her mother did, as a wish for a full house.\n\nThe red is dyed with madder root, so no two runners come out exactly the same shade. 150 × 40 cm, about nine days on the loom.",
    hashtags: ["handwoven", "pomegranate", "azerbaijantextiles", "madderdye"],
    status: "in_review",
    createdBy: COLLAB_ID,
    createdAt: daysAgo(2),
    updatedAt: daysAgo(1),
  },
  {
    id: "content_wall_returned",
    productId: "product_wall",
    goal: "introduce",
    tone: "warm",
    platform: "instagram",
    language: "en",
    caption:
      "A luxury statement piece for your wall, an exclusive masterpiece of Azerbaijani heritage weaving, available now.\n\n40 × 55 cm, ready to hang.",
    hashtags: ["luxury", "wallart", "exclusive"],
    status: "changes_requested",
    reviewNote:
      "Leyla, please take out 'luxury', 'exclusive' and 'masterpiece'. I would never say that about my own work. Say what it actually is: a stepped diamond, the first pattern my mother taught me. That is more interesting than 'heritage'.",
    createdBy: COLLAB_ID,
    createdAt: daysAgo(4),
    updatedAt: daysAgo(3),
  },
  {
    id: "content_bookmarks_draft",
    productId: "product_bookmarks",
    goal: "availability",
    tone: "simple",
    platform: "instagram",
    language: "en",
    caption:
      "Bookmark sets are back. Four in a set, each a different colour, woven from the wool left over from bigger pieces.\n\n[Ask Nənə what to say about the price]",
    hashtags: ["handwoven", "bookmark", "smallgifts"],
    status: "draft",
    createdBy: COLLAB_ID,
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
];

/* ------------------------------------------------------------------- orders */

const orders: Order[] = [
  {
    id: "order_aynur",
    ref: "NT-118",
    customerName: "Aynur Məmmədova",
    customerContact: "aynur.m@example.az",
    productId: "product_runner",
    requestedItem: { en: "Pomegranate Table Runner", az: "Nar naxışlı süfrə yolluğu" },
    quantity: 1,
    createdAt: daysAgo(1, 9, 20),
    enquiry: {
      en: "Hello, my table is 180 cm long. Could you weave a runner that length instead of 150? And is a darker red possible? It is a wedding gift for my sister, needed by the end of next month.",
      az: "Salam, süfrəm 180 sm uzunluğundadır. 150 əvəzinə həmin uzunluqda yolluq toxuya bilərsinizmi? Daha tünd qırmızı mümkündürmü? Bacım üçün toy hədiyyəsidir, gələn ayın sonuna lazımdır.",
    },
    dueDate: daysAhead(38),
    stage: "new_enquiry",
    assigneeId: null,
    nextAction: {
      en: "Reply with a price for the longer size and check the date is possible",
      az: "Uzun ölçü üçün qiymətlə cavab ver və tarixin mümkünlüyünü yoxla",
    },
    source: "storefront",
    agreedPrice: null,
    notes: [],
  },
  {
    id: "order_tom",
    ref: "NT-119",
    customerName: "Tom Whitfield",
    customerContact: "@tomw_travels",
    productId: "product_cushion",
    requestedItem: { en: "Caspian Blue Cushion Cover ×2", az: "Xəzər mavisi yastıq üzlüyü ×2" },
    quantity: 2,
    createdAt: daysAgo(1, 18, 45),
    enquiry: {
      en: "I bought a runner from you at the craft market in Baku last spring and it is still the nicest thing in my flat. Do you ship two cushion covers to the UK, and roughly what would postage cost?",
      az: "Keçən yaz Bakıdakı sənətkarlıq bazarından sizdən yolluq almışdım, hələ də mənzilimdəki ən gözəl şeydir. İki yastıq üzlüyünü Britaniyaya göndərirsinizmi və poçt təxminən nə qədər olar?",
    },
    dueDate: null,
    stage: "new_enquiry",
    assigneeId: null,
    nextAction: {
      en: "Find out the postage cost before replying",
      az: "Cavab verməzdən əvvəl poçt xərcini öyrən",
    },
    source: "instagram",
    agreedPrice: null,
    notes: [],
  },
  {
    id: "order_rashad",
    ref: "NT-116",
    customerName: "Rəşad Quliyev",
    customerContact: "+994 50 xxx xx 41",
    productId: "product_cushion",
    requestedItem: { en: "Caspian Blue Cushion Cover ×4", az: "Xəzər mavisi yastıq üzlüyü ×4" },
    quantity: 4,
    createdAt: daysAgo(6, 11, 0),
    enquiry: {
      en: "Four cushion covers for a living room. Two in the indigo you have, and two in something warmer if you can. My wife likes the brown in your wall pieces.",
      az: "Qonaq otağı üçün dörd yastıq üzlüyü. İkisi sizdəki indiqo rəngdə, ikisi mümkünsə daha isti rəngdə. Həyat yoldaşım divar işlərinizdəki qəhvəyini bəyənir.",
    },
    dueDate: daysAhead(21),
    stage: "discussing",
    assigneeId: COLLAB_ID,
    nextAction: {
      en: "Send a photograph of the walnut-dyed wool so he can choose",
      az: "Seçim etməsi üçün qoz qabığı ilə boyanmış yunun şəklini göndər",
    },
    source: "referral",
    agreedPrice: null,
    notes: [
      {
        id: "note_r1",
        authorId: COLLAB_ID,
        body: "Answered his first message with the price for four (200 AZN). He asked about a warmer colour for two of them.",
        createdAt: daysAgo(5, 12, 30),
        kind: "message_sent",
      },
      {
        id: "note_r2",
        authorId: OWNER_ID,
        body: "I have enough walnut-dyed wool for two covers. Tell him yes, but the brown will be slightly lighter than the wall piece.",
        createdAt: daysAgo(4, 8, 15),
        kind: "note",
      },
    ],
  },
  {
    id: "order_gulnar",
    ref: "NT-114",
    customerName: "Gülnar Həsənova",
    customerContact: "gulnar.h@example.az",
    productId: "product_wall",
    requestedItem: { en: "Small Geometric Wall Textile", az: "Kiçik həndəsi divar toxuması" },
    quantity: 1,
    createdAt: daysAgo(11, 14, 0),
    enquiry: {
      en: "I would like one of the small wall panels for my daughter's new flat. The brown and cream one, if it is still possible.",
      az: "Qızımın yeni mənzili üçün kiçik divar panellərindən birini istəyirəm. Mümkünsə, qəhvəyi və krem rəngli olanı.",
    },
    dueDate: daysAhead(9),
    stage: "confirmed",
    assigneeId: OWNER_ID,
    nextAction: {
      en: "Set up the warp on Monday",
      az: "Bazar ertəsi ərişi qur",
    },
    source: "in_person",
    agreedPrice: 70,
    notes: [
      {
        id: "note_g1",
        authorId: OWNER_ID,
        body: "Agreed 70 AZN, collection from the studio. She is not in a hurry but her daughter moves in on the 20th.",
        createdAt: daysAgo(10, 9, 0),
        kind: "note",
      },
      {
        id: "note_g2",
        authorId: COLLAB_ID,
        body: "Moved to Confirmed after Nənə spoke to her on the phone.",
        createdAt: daysAgo(10, 9, 30),
        kind: "stage_change",
      },
    ],
  },
  {
    id: "order_sevinc",
    ref: "NT-112",
    customerName: "Sevinc İsmayılova",
    customerContact: "+994 55 xxx xx 07",
    productId: "product_runner",
    requestedItem: { en: "Pomegranate Table Runner", az: "Nar naxışlı süfrə yolluğu" },
    quantity: 1,
    createdAt: daysAgo(19, 10, 0),
    enquiry: {
      en: "A runner for my mother's birthday. She is from Quba too, so the pomegranate will mean something to her.",
      az: "Anamın ad günü üçün yolluq. O da Qubadandır, ona görə nar onun üçün məna daşıyacaq.",
    },
    dueDate: daysAhead(4),
    stage: "in_production",
    assigneeId: OWNER_ID,
    nextAction: {
      en: "Finish the second end and wash it",
      az: "İkinci ucunu bitir və yu",
    },
    source: "storefront",
    agreedPrice: 95,
    notes: [
      {
        id: "note_s1",
        authorId: OWNER_ID,
        body: "On the loom since Tuesday. About two thirds done.",
        createdAt: daysAgo(3, 17, 0),
        kind: "note",
      },
    ],
  },
  {
    id: "order_elmira",
    ref: "NT-110",
    customerName: "Elmira Rzayeva",
    customerContact: "elmira.rz@example.az",
    productId: "product_bookmarks",
    requestedItem: { en: "Handwoven Bookmark Set ×3", az: "Əl ilə toxunmuş əlfəcin dəsti ×3" },
    quantity: 3,
    createdAt: daysAgo(24, 15, 0),
    enquiry: {
      en: "Three sets as end-of-year gifts for the teachers at my son's school.",
      az: "Oğlumun məktəbindəki müəllimlər üçün il sonu hədiyyəsi kimi üç dəst.",
    },
    dueDate: daysAhead(2),
    stage: "ready",
    assigneeId: COLLAB_ID,
    nextAction: {
      en: "Message her that the sets are ready to collect",
      az: "Dəstlərin götürülməyə hazır olduğunu ona yaz",
    },
    source: "referral",
    agreedPrice: 60,
    notes: [
      {
        id: "note_e1",
        authorId: OWNER_ID,
        body: "All three sets finished and wrapped in paper.",
        createdAt: daysAgo(2, 16, 0),
        kind: "note",
      },
    ],
  },
  {
    id: "order_kamran",
    ref: "NT-104",
    customerName: "Kamran Əliyev",
    customerContact: "+994 51 xxx xx 88",
    productId: "product_cushion",
    requestedItem: { en: "Caspian Blue Cushion Cover", az: "Xəzər mavisi yastıq üzlüyü" },
    quantity: 1,
    createdAt: daysAgo(41, 13, 0),
    enquiry: {
      en: "One cushion cover in the indigo, please.",
      az: "Zəhmət olmasa indiqo rəngdə bir yastıq üzlüyü.",
    },
    dueDate: daysAgo(9),
    stage: "delivered",
    assigneeId: COLLAB_ID,
    nextAction: { en: "", az: "" },
    source: "instagram",
    agreedPrice: 55,
    notes: [
      {
        id: "note_k1",
        authorId: COLLAB_ID,
        body: "Collected from the studio. He asked for a photograph of the next batch when it is ready.",
        createdAt: daysAgo(9, 11, 0),
        kind: "note",
      },
    ],
  },
];

/* ---------------------------------------------------------------- approvals */

const approvals: Approval[] = [
  {
    id: "approval_wall_publish",
    type: "product_publish",
    targetId: "product_wall",
    title: {
      en: "Put the Small Geometric Wall Textile on the public page",
      az: "Kiçik həndəsi divar toxumasını ictimai səhifəyə qoy",
    },
    summary: {
      en: "Leyla finished the listing, added a photograph, and set 70 AZN to match the piece Gülnar ordered.",
      az: "Leyla siyahını tamamladı, şəkil əlavə etdi və Gülnarın sifariş etdiyi işə uyğun 70 AZN təyin etdi.",
    },
    requestedBy: COLLAB_ID,
    requestedAt: daysAgo(2, 16, 30),
    status: "pending",
  },
  {
    id: "approval_runner_caption",
    type: "content_publish",
    targetId: "content_runner_review",
    title: {
      en: "Approve the Instagram post about the pomegranate runner",
      az: "Nar yolluğu haqqında Instagram paylaşımını təsdiqlə",
    },
    summary: {
      en: "A story post about why there is a pomegranate at each end. Leyla used what you wrote about your mother and Quba.",
      az: "Hər iki ucda niyə nar olduğu haqqında hekayə paylaşımı. Leyla anan və Quba haqqında yazdıqlarından istifadə edib.",
    },
    requestedBy: COLLAB_ID,
    requestedAt: daysAgo(1, 19, 5),
    status: "pending",
  },
  {
    id: "approval_bookmark_price",
    type: "price_change",
    targetId: "product_bookmarks",
    title: {
      en: "Set a price for the Handwoven Bookmark Set",
      az: "Əl ilə toxunmuş əlfəcin dəsti üçün qiymət təyin et",
    },
    summary: {
      en: "Leyla suggests 22 AZN for a set of four.",
      az: "Leyla dörd ədədlik dəst üçün 22 AZN təklif edir.",
    },
    requestedBy: COLLAB_ID,
    requestedAt: daysAgo(1, 20, 10),
    status: "pending",
    payload: {
      fromPrice: null,
      toPrice: 22,
      reason:
        "Elmira paid 20 AZN a set last month and said it was cheap for what it is. Two similar shops on Instagram are at 25-30.",
    },
  },
  {
    id: "approval_cushion_caption_done",
    type: "content_publish",
    targetId: "content_cushion_approved",
    title: {
      en: "Approve the Instagram post about the cushion cover",
      az: "Yastıq üzlüyü haqqında Instagram paylaşımını təsdiqlə",
    },
    summary: {
      en: "An introduction post for the indigo cushion cover.",
      az: "İndiqo yastıq üzlüyü üçün təqdimat paylaşımı.",
    },
    requestedBy: COLLAB_ID,
    requestedAt: daysAgo(14, 18, 0),
    status: "approved",
    decidedBy: OWNER_ID,
    decidedAt: daysAgo(13, 9, 40),
    reviewNote: "Good. You explained the corners exactly the way I would have.",
  },
  {
    id: "approval_wall_caption_returned",
    type: "content_publish",
    targetId: "content_wall_returned",
    title: {
      en: "Approve the Instagram post about the wall textile",
      az: "Divar toxuması haqqında Instagram paylaşımını təsdiqlə",
    },
    summary: {
      en: "An introduction post for the small wall panel.",
      az: "Kiçik divar paneli üçün təqdimat paylaşımı.",
    },
    requestedBy: COLLAB_ID,
    requestedAt: daysAgo(4, 17, 0),
    status: "returned",
    decidedBy: OWNER_ID,
    decidedAt: daysAgo(3, 8, 30),
    reviewNote:
      "Leyla, please take out 'luxury', 'exclusive' and 'masterpiece'. I would never say that about my own work. Say what it actually is: a stepped diamond, the first pattern my mother taught me.",
  },
];

/* ----------------------------------------------------------------- activity */

const activity: ActivityEvent[] = [
  {
    id: "act_1",
    at: daysAgo(1, 20, 10),
    actorId: COLLAB_ID,
    kind: "price_suggested",
    summary: {
      en: "Leyla suggested 22 AZN for the Handwoven Bookmark Set",
      az: "Leyla əlfəcin dəsti üçün 22 AZN təklif etdi",
    },
    entity: { type: "product", id: "product_bookmarks" },
  },
  {
    id: "act_2",
    at: daysAgo(1, 19, 5),
    actorId: COLLAB_ID,
    kind: "content_submitted",
    summary: {
      en: "Leyla sent the pomegranate runner post for approval",
      az: "Leyla nar yolluğu paylaşımını təsdiqə göndərdi",
    },
    entity: { type: "content", id: "content_runner_review" },
  },
  {
    id: "act_3",
    at: daysAgo(1, 18, 45),
    actorId: COLLAB_ID,
    kind: "enquiry_received",
    summary: {
      en: "New enquiry from Tom Whitfield about shipping to the UK",
      az: "Tom Whitfield-dən Britaniyaya göndərmə haqqında yeni sorğu",
    },
    entity: { type: "order", id: "order_tom" },
  },
  {
    id: "act_4",
    at: daysAgo(1, 9, 20),
    actorId: OWNER_ID,
    kind: "enquiry_received",
    summary: {
      en: "New enquiry from Aynur Məmmədova about a 180 cm runner",
      az: "Aynur Məmmədovadan 180 sm yolluq haqqında yeni sorğu",
    },
    entity: { type: "order", id: "order_aynur" },
  },
  {
    id: "act_5",
    at: daysAgo(2, 16, 30),
    actorId: COLLAB_ID,
    kind: "product_submitted",
    summary: {
      en: "Leyla sent the Small Geometric Wall Textile for approval",
      az: "Leyla kiçik həndəsi divar toxumasını təsdiqə göndərdi",
    },
    entity: { type: "product", id: "product_wall" },
  },
  {
    id: "act_6",
    at: daysAgo(2, 11, 0),
    actorId: OWNER_ID,
    kind: "lesson_completed",
    summary: {
      en: "Nərgiz finished the lesson: Writing About the Story Behind a Craft",
      az: "Nərgiz dərsi bitirdi: Sənətin arxasındakı hekayəni yazmaq",
    },
    entity: { type: "lesson", id: "story-behind-the-craft" },
  },
  {
    id: "act_7",
    at: daysAgo(3, 8, 30),
    actorId: OWNER_ID,
    kind: "content_returned",
    summary: {
      en: "Nərgiz sent the wall textile post back with a note",
      az: "Nərgiz divar toxuması paylaşımını qeydlə geri göndərdi",
    },
    entity: { type: "content", id: "content_wall_returned" },
  },
  {
    id: "act_8",
    at: daysAgo(3, 17, 0),
    actorId: OWNER_ID,
    kind: "order_note",
    summary: {
      en: "Nərgiz added a note to order NT-112",
      az: "Nərgiz NT-112 sifarişinə qeyd əlavə etdi",
    },
    entity: { type: "order", id: "order_sevinc" },
  },
  {
    id: "act_9",
    at: daysAgo(4, 8, 15),
    actorId: OWNER_ID,
    kind: "order_note",
    summary: {
      en: "Nərgiz answered Leyla's question about the walnut wool",
      az: "Nərgiz Leylanın qoz yunu haqqında sualına cavab verdi",
    },
    entity: { type: "order", id: "order_rashad" },
  },
  {
    id: "act_10",
    at: daysAgo(5, 14, 0),
    actorId: COLLAB_ID,
    kind: "lesson_completed",
    summary: {
      en: "Leyla finished the lesson: Taking Better Product Photographs",
      az: "Leyla dərsi bitirdi: Daha yaxşı məhsul şəkilləri çəkmək",
    },
    entity: { type: "lesson", id: "better-product-photographs" },
  },
  {
    id: "act_11",
    at: daysAgo(5, 10, 0),
    actorId: COLLAB_ID,
    kind: "product_created",
    summary: {
      en: "Leyla started the Handwoven Bookmark Set listing",
      az: "Leyla əlfəcin dəsti siyahısına başladı",
    },
    entity: { type: "product", id: "product_bookmarks" },
  },
  {
    id: "act_12",
    at: daysAgo(13, 9, 40),
    actorId: OWNER_ID,
    kind: "content_approved",
    summary: {
      en: "Nərgiz approved the cushion cover post",
      az: "Nərgiz yastıq üzlüyü paylaşımını təsdiqlədi",
    },
    entity: { type: "content", id: "content_cushion_approved" },
  },
];

/* -------------------------------------------------------------- root state */

export function createSeedState(): AppState {
  return {
    version: SEED_VERSION,
    business: {
      id: "business_nergiz",
      slug: "nergiz-textile-studio",
      name: "Nərgiz Textile Studio",
      tagline: {
        en: "Handwoven table runners, cushion covers, and small wall pieces.",
        az: "Əl ilə toxunmuş süfrə yolluqları, yastıq üzlükləri və kiçik divar işləri.",
      },
      craft: {
        en: "Handwoven textiles and small carpet-inspired home pieces",
        az: "Əl ilə toxunmuş tekstil və xalça ruhunda kiçik ev əşyaları",
      },
      story: {
        en: "Nərgiz Əliyeva learned to weave from her mother in a village outside Quba, on a loom her father built. She has worked from a room at the back of the family flat in Baku since 2009. Everything is flat-woven by hand, mostly in wool she dyes herself with madder root and walnut husk. Her granddaughter Leyla photographs the work and looks after the messages.",
        az: "Nərgiz Əliyeva toxumağı anasından, Quba yaxınlığındakı bir kənddə, atasının düzəltdiyi dəzgahda öyrənib. 2009-cu ildən Bakıdakı ailə mənzilinin arxa otağında işləyir. Hər şey əl ilə düz toxunur, əsasən özünün boyaq kökü və qoz qabığı ilə boyadığı yundan. Nəvəsi Leyla işləri şəkil çəkir və mesajlara baxır.",
      },
      location: { en: "Baku, Azerbaijan", az: "Bakı, Azərbaycan" },
      foundedYear: 2009,
      contactEmail: "salam@nergiz-studio.example",
      spokenLanguages: ["az", "en"],
      currency: "AZN",
      deliveryNote: {
        en: "Collection from the studio in Baku, or delivery anywhere in Azerbaijan. Ask about posting abroad. It is possible, but we agree the cost first.",
        az: "Bakıdakı studiyadan götürmək və ya Azərbaycanın istənilən yerinə çatdırılma. Xaricə göndərmə barədə soruşun. Mümkündür, amma xərci əvvəlcədən razılaşdırırıq.",
      },
    },
    members,
    products,
    contentDrafts,
    approvals,
    orders,
    lessonProgress: [
      {
        lessonSlug: "better-product-photographs",
        memberId: COLLAB_ID,
        completedAt: daysAgo(5, 14, 0),
        actionNote:
          "Reshot the cushion cover next to the window at about 11am instead of under the ceiling light. The blue finally looks like the real colour.",
      },
      {
        lessonSlug: "communicating-with-customers",
        memberId: COLLAB_ID,
        completedAt: daysAgo(9, 16, 30),
        actionNote:
          "Rewrote my first reply to Rəşad. The old one just said the price. The new one says the price, what is included, and how long it takes.",
      },
      {
        lessonSlug: "dividing-family-responsibilities",
        memberId: COLLAB_ID,
        completedAt: daysAgo(20, 12, 0),
        actionNote:
          "Nənə does the weaving, prices and final yes. I do photos, captions, first replies and the order board.",
      },
      {
        lessonSlug: "story-behind-the-craft",
        memberId: OWNER_ID,
        completedAt: daysAgo(2, 11, 0),
        actionNote:
          "Wrote down where the pomegranate comes from and why my mother put one at each end. Leyla used it for the post.",
      },
      {
        lessonSlug: "pricing-handmade-work",
        memberId: OWNER_ID,
        completedAt: daysAgo(16, 9, 0),
        actionNote:
          "Runner: 22 AZN of wool, nine days of work, 3 AZN delivery in the city. I have been charging too little for the long ones.",
      },
    ],
    activity,
    invitations: [
      {
        id: "invitation_murad",
        name: "Murad Əliyev",
        contact: "+994 70 xxx xx 12",
        role: "collaborator",
        invitedBy: OWNER_ID,
        invitedAt: daysAgo(7),
        status: "pending",
      },
    ],
    settings: {
      locale: "en",
      activeMemberId: OWNER_ID,
      notify: { newEnquiries: true, approvalRequests: true, weeklyLearning: true },
      onboardingComplete: true,
    },
  };
}

export const SEED_OWNER_ID = OWNER_ID;
export const SEED_COLLAB_ID = COLLAB_ID;
