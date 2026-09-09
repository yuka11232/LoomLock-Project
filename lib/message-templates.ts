import type { AppState, Locale, Order, Product } from "./types";

/**
 * Prepared customer messages.
 *
 * Every template is filled from the actual order and product, and every one is
 * editable before it is copied — LoomLock never sends a message itself. Where a
 * fact is missing the template leaves a marked [gap] rather than guessing at a
 * price or a date.
 */

export type TemplateKey = "price" | "time" | "confirm" | "decline" | "ready";

export const TEMPLATE_KEYS: TemplateKey[] = ["price", "time", "confirm", "decline", "ready"];

/** Whether using this template commits the business to a price or a date. */
export const TEMPLATE_COMMITS: Record<TemplateKey, boolean> = {
  price: true,
  time: true,
  confirm: true,
  decline: true,
  ready: false,
};

interface Context {
  order: Order;
  product: Product | undefined;
  business: AppState["business"];
  locale: Locale;
}

function gap(en: string, az: string, locale: Locale): string {
  return `[${locale === "az" ? az : en}]`;
}

function priceText(ctx: Context): string {
  const { order, product, locale } = ctx;
  const amount = order.agreedPrice ?? product?.price ?? null;
  if (amount === null) {
    return gap("add the price", "qiyməti yazın", locale);
  }
  return `${amount} AZN`;
}

function itemText(ctx: Context): string {
  const { order, locale } = ctx;
  return locale === "az" ? order.requestedItem.az || order.requestedItem.en : order.requestedItem.en;
}

function daysText(ctx: Context): string {
  const { product, locale } = ctx;
  if (product?.productionDays == null) {
    return gap("how many days", "neçə gün", locale);
  }
  return locale === "az" ? `${product.productionDays} gün` : `${product.productionDays} days`;
}

export function buildTemplate(key: TemplateKey, ctx: Context): string {
  const { order, business, locale } = ctx;
  const az = locale === "az";
  const name = order.customerName.split(" ")[0];
  const item = itemText(ctx);
  const price = priceText(ctx);
  const days = daysText(ctx);
  const location = az ? business.location.az : business.location.en;

  switch (key) {
    case "price":
      return az
        ? `Salam, ${name}.\n\n${item} ${price}-dir. Toxunması təxminən ${days} çəkir.\n\n${location} daxilində çatdırılma və ya studiyadan götürmək mümkündür. Ölçüdə və ya rəngdə dəyişiklik istəsəniz, yazın — mümkün olub-olmadığını deyim.`
        : `Hello ${name},\n\nThe ${item} is ${price}. It takes about ${days} to weave.\n\nYou can collect it from the studio in ${location}, or we can deliver locally. If you would like a different size or colour, tell me and I will check whether it is possible.`;

    case "time":
      return az
        ? `Salam, ${name}.\n\n${item} əl ilə toxunur, ona görə hazırlanması təxminən ${days} çəkir. Hazırda ${gap("neçə sifariş var", "how many orders are ahead", locale)} sifariş növbədədir, deməli sizinkinə ${gap("nə vaxt başlayacağıq", "when we would start", locale)} başlaya bilərik.\n\nSizin üçün uyğundursa, təsdiqləyin, növbəyə yazım.`
        : `Hello ${name},\n\nThe ${item} is woven by hand, so it takes about ${days} to make. There are ${gap("how many orders are ahead", "neçə sifariş var", locale)} orders ahead of yours at the moment, which means we could start yours ${gap("when we would start", "nə vaxt başlayacağıq", locale)}.\n\nIf that works for you, say so and I will put you down.`;

    case "confirm":
      return az
        ? `Salam, ${name}.\n\n${item} sifarişinizi qeyd etdim: ${price}, təxminən ${days} ərzində hazır olacaq.\n\nHazır olanda sizə yazacağam. Bu vaxt ərzində sualınız olsa, buradan yaza bilərsiniz.`
        : `Hello ${name},\n\nI have written down your order for the ${item}: ${price}, ready in about ${days}.\n\nI will message you when it is finished. If you have a question before then, just write here.`;

    case "decline":
      return az
        ? `Salam, ${name}.\n\nTəklif etdiyiniz tarixə çatdıra bilmərəm — ${item} tələsdirsəm, keyfiyyəti aşağı düşür və mən belə iş göndərmək istəmirəm.\n\n${gap("təklif etdiyiniz tarix", "the date you can offer", locale)} tarixinə hazır edə bilərəm. Sizə uyğundursa, xəbər verin.`
        : `Hello ${name},\n\nI cannot have it ready by the date you asked for — if I rush the ${item} the weaving suffers, and I would rather not send work like that.\n\nI could have it done by ${gap("the date you can offer", "təklif etdiyiniz tarix", locale)}. Let me know if that suits you.`;

    case "ready":
      return az
        ? `Salam, ${name}.\n\n${item} hazırdır. İstədiyiniz vaxt studiyadan götürə bilərsiniz və ya çatdırılma təşkil edək.\n\nSizə uyğun olan günü yazın.`
        : `Hello ${name},\n\nYour ${item} is finished. You can collect it from the studio whenever suits you, or we can arrange delivery.\n\nJust tell me which day works for you.`;
  }
}
