"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { getWilaya, shippingPrice, wilayas } from "@/data/algeriaWilayas";
import { formatPrice } from "@/data/mockProducts";
import { useStoreData } from "@/context/StoreDataContext";

const PHONE_PATTERN = /^0[567]\d{8}$/;

function normalizeDigits(value) {
  return String(value)
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 1776));
}

const emptyForm = {
  fullName: "",
  phone: "",
  wilaya: "",
  commune: "",
  address: "",
  deliveryType: "home",
};

function nextReference(orders) {
  const used = new Set(orders.map((order) => order.reference));
  let reference = "";
  do {
    reference = `IZZAA-${Math.floor(1000 + Math.random() * 9000)}`;
  } while (used.has(reference));
  return reference;
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="technical text-[11px] tracking-wide text-black/50">{label}</span>
      <div className="mt-2">{children}</div>
      {error ? <p className="mt-1 text-xs text-black/70">{error}</p> : null}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-black/80 bg-transparent px-3 py-2.5 text-sm outline-none";

export default function CheckoutPage() {
  const { language, t } = useLanguage();
  const { items, cartTotal, clearCart } = useCart();
  const { addOrder, orders, ready } = useStoreData();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [order, setOrder] = useState(null);
  const [saving, setSaving] = useState(false);

  const wilaya = getWilaya(form.wilaya);
  const shipping = shippingPrice(wilaya, form.deliveryType);
  const total = cartTotal + shipping;

  const summaryItems = useMemo(
    () =>
      items.map((item) => ({
        key: `${item.product.id}-${item.selectedSize}-${item.selectedColor.fr}`,
        productId: item.product.id,
        name: item.product.name,
        image: item.product.image,
        size: item.selectedSize,
        color: item.selectedColor,
        quantity: item.quantity,
        unitPrice: item.product.price,
      })),
    [items],
  );

  function update(field, value) {
    const nextValue = field === "phone" ? normalizeDigits(value) : value;
    setForm((current) => ({ ...current, [field]: nextValue }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate() {
    const next = {};
    if (!form.fullName.trim()) next.fullName = t.checkout.errors.fullName;
    const phone = normalizeDigits(form.phone).replace(/[\s-]/g, "");
    if (!PHONE_PATTERN.test(phone)) next.phone = t.checkout.errors.phone;
    if (!wilaya) next.wilaya = t.checkout.errors.wilaya;
    if (!form.commune.trim()) next.commune = t.checkout.errors.commune;
    if (!form.address.trim()) next.address = t.checkout.errors.address;
    return { next, phone };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!summaryItems.length || saving || !ready) return;
    const { next, phone } = validate();
    setErrors(next);
    if (Object.keys(next).length) return;

    const confirmed = {
      reference: nextReference(orders),
      createdAt: new Date().toISOString(),
      status: "pending",
      paymentMethod: "cod",
      customer: {
        fullName: form.fullName.trim(),
        phone,
        wilayaCode: wilaya.code,
        wilaya: { fr: wilaya.fr, ar: wilaya.ar },
        commune: form.commune.trim(),
        address: form.address.trim(),
        deliveryType: form.deliveryType,
      },
      items: summaryItems,
      subtotal: cartTotal,
      shipping,
      total,
    };

    setSaving(true);
    try {
      await addOrder(confirmed);
      setOrder(confirmed);
      clearCart();
    } catch (error) {
      console.error(error);
      setErrors((current) => ({ ...current, save: t.checkout.errors.save }));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col text-[#0D0D0D]">
      <section className="mx-3 mt-3 rounded-[28px] border border-black/80 px-4 py-5 sm:px-6 md:mx-5 md:mt-5 md:px-9 md:py-7">
        <Navbar />

        {order ? (
          <Confirmation order={order} language={language} t={t} />
        ) : (
          <>
            <h1 className="mt-8 text-4xl font-bold tracking-tight md:text-6xl">{t.checkout.title}</h1>
            {summaryItems.length === 0 ? (
              <div className="mt-8">
                <p className="technical text-sm text-black/60">{t.checkout.empty}</p>
                <Link href="/#products" className="mt-6 inline-block text-sm">
                  {t.checkout.backToStore} ↗
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
                <div className="grid gap-5">
                  <Field label={t.checkout.fullName} error={errors.fullName}>
                    <input
                      className={inputClass}
                      value={form.fullName}
                      onChange={(event) => update("fullName", event.target.value)}
                      autoComplete="name"
                      required
                    />
                  </Field>
                  <Field label={t.checkout.phone} error={errors.phone}>
                    <input
                      className={inputClass}
                      value={form.phone}
                      onChange={(event) => update("phone", event.target.value)}
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="05 xx xx xx xx"
                      required
                    />
                  </Field>
                  <Field label={t.checkout.wilaya} error={errors.wilaya}>
                    <select
                      className={inputClass}
                      value={form.wilaya}
                      onChange={(event) => update("wilaya", event.target.value)}
                      required
                    >
                      <option value="">{t.checkout.wilayaPlaceholder}</option>
                      {wilayas.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.code} — {item[language]}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label={t.checkout.commune} error={errors.commune}>
                    <input
                      className={inputClass}
                      value={form.commune}
                      onChange={(event) => update("commune", event.target.value)}
                      required
                    />
                  </Field>
                  <Field label={t.checkout.address} error={errors.address}>
                    <textarea
                      className={`${inputClass} min-h-24 resize-y`}
                      value={form.address}
                      onChange={(event) => update("address", event.target.value)}
                      required
                    />
                  </Field>
                  <fieldset>
                    <legend className="technical text-[11px] tracking-wide text-black/50">
                      {t.checkout.delivery}
                    </legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {[
                        ["home", t.checkout.home],
                        ["desk", t.checkout.desk],
                      ].map(([value, label]) => (
                        <label
                          key={value}
                          className={`cursor-pointer rounded-full border px-4 py-2 text-sm ${
                            form.deliveryType === value
                              ? "border-black bg-[#0D0D0D] text-[#F4F4F2]"
                              : "border-black/80"
                          }`}
                        >
                          <input
                            type="radio"
                            name="deliveryType"
                            value={value}
                            checked={form.deliveryType === value}
                            onChange={() => update("deliveryType", value)}
                            className="sr-only"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <div>
                    <p className="technical text-[11px] tracking-wide text-black/50">{t.checkout.payment}</p>
                    <p className="mt-2 inline-flex rounded-full border border-black/80 px-4 py-2 text-sm">
                      {t.checkout.cod}
                    </p>
                  </div>
                </div>

                <OrderSummary
                  items={summaryItems}
                  language={language}
                  t={t}
                  subtotal={cartTotal}
                  shipping={wilaya ? shipping : null}
                  total={wilaya ? total : null}
                  action={
                    <>
                      {errors.save ? <p className="mt-4 text-sm">{errors.save}</p> : null}
                      <button
                        type="submit"
                        disabled={saving || !ready}
                        className="mt-5 w-full cursor-pointer rounded-full bg-[#0D0D0D] px-5 py-3 text-sm text-[#F4F4F2] disabled:cursor-wait disabled:opacity-60"
                      >
                        {t.checkout.confirm} ↗
                      </button>
                    </>
                  }
                />
              </form>
            )}
          </>
        )}
      </section>
      <Footer />
    </div>
  );
}

function OrderSummary({ items, language, t, subtotal, shipping, total, action }) {
  return (
    <aside className="rounded-2xl border border-black/80 p-4 sm:p-5">
      <ul className="flex flex-col gap-4">
        {items.map((item) => (
          <li key={item.key || `${item.productId}-${item.size}-${item.color.fr}`} className="flex gap-3">
            <img
              src={item.image}
              alt={item.name[language]}
              className="h-20 w-16 rounded-xl border border-black/80 object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="font-semibold leading-tight">{item.name[language]}</p>
              <p className="technical mt-1 text-[10px] text-black/60">
                {item.size} · {item.color[language]} · × {item.quantity}
              </p>
              <p className="technical mt-2 text-sm">
                {formatPrice(item.unitPrice * item.quantity, language)}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <dl className="mt-5 space-y-2 border-t border-black/15 pt-4 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="technical text-[11px] text-black/50">{t.cartDrawer.subtotal}</dt>
          <dd className="technical">{formatPrice(subtotal, language)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="technical text-[11px] text-black/50">{t.checkout.shipping}</dt>
          <dd className="technical">{shipping == null ? "—" : formatPrice(shipping, language)}</dd>
        </div>
        <div className="flex justify-between gap-3 pt-1 text-base">
          <dt className="font-semibold">{t.checkout.total}</dt>
          <dd className="technical">{total == null ? "—" : formatPrice(total, language)}</dd>
        </div>
      </dl>
      {action}
    </aside>
  );
}

function Confirmation({ order, language, t }) {
  return (
    <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.9fr)]">
      <div>
        <p className="technical text-[11px] tracking-[0.16em] text-black/50">{t.checkout.reference}</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">{order.reference}</h1>
        <p className="mt-4 text-2xl font-semibold">{t.checkout.confirmedTitle}</p>
        <p className="mt-3 max-w-md text-sm leading-6 text-black/70">{t.checkout.confirmedNote}</p>
        <p className="mt-6 text-sm">
          {order.customer.fullName}
          <br />
          {order.customer.phone}
          <br />
          {order.customer.wilaya[language]} — {order.customer.commune}
          <br />
          {order.customer.address}
        </p>
        <p className="mt-4 inline-flex rounded-full border border-black/80 px-4 py-2 text-sm">
          {t.checkout.cod}
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-[#0D0D0D] px-5 py-3 text-sm text-[#F4F4F2]"
        >
          {t.checkout.backToStore} ↗
        </Link>
      </div>
      <OrderSummary
        items={order.items.map((item) => ({ ...item, key: `${item.productId}-${item.size}-${item.color.fr}` }))}
        language={language}
        t={t}
        subtotal={order.subtotal}
        shipping={order.shipping}
        total={order.total}
      />
    </div>
  );
}
