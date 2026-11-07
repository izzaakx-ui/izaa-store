"use client";

import { useEffect, useMemo, useState } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useLanguage } from "@/context/LanguageContext";
import { useStoreData } from "@/context/StoreDataContext";
import { formatPrice } from "@/data/mockProducts";

const ADMIN_LOGINS = new Set(["ishakchbabbzf2006", "ishakchbabbzf2006@gmail.com"]);
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "ishakchbabbzf2006";
const SESSION_KEY = "aura_admin";
const SIZES = ["S", "M", "L", "XL", "XXL"];
const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const inputClass =
  "w-full rounded-xl border border-black/80 bg-transparent px-3 py-2 text-sm outline-none";

function blankForm() {
  return {
    id: "",
    code: "",
    nameFr: "",
    nameAr: "",
    descriptionFr: "",
    descriptionAr: "",
    category: "hoodies",
    price: "",
    compareAt: "",
    stock: "1",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ fr: "Noir", ar: "أسود", hex: "#0D0D0D" }],
    images: [""],
    available: true,
  };
}

function toForm(product) {
  const hasDiscount = Number(product.compareAt) > Number(product.price);
  return {
    id: product.id,
    code: product.code || "",
    nameFr: product.name?.fr || "",
    nameAr: product.name?.ar || "",
    descriptionFr: product.description?.fr || "",
    descriptionAr: product.description?.ar || "",
    category: product.category || "hoodies",
    price: String(hasDiscount ? product.compareAt : product.price ?? ""),
    compareAt: hasDiscount ? String(product.price) : "",
    stock: String(product.stock ?? 0),
    sizes: product.sizes?.length ? product.sizes : ["M"],
    colors: product.colors?.length
      ? product.colors.map((color) => ({ fr: color.fr || "", ar: color.ar || "", hex: color.hex || "#0D0D0D" }))
      : [{ fr: "", ar: "", hex: "#0D0D0D" }],
    images: product.images?.length ? product.images : [product.image || ""],
    available: product.available !== false,
  };
}

function slugify(value) {
  const slug = value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug || "piece";
}

function fromForm(form) {
  const images = form.images.map((image) => image.trim()).filter(Boolean);
  const regular = Number(form.price);
  const discount = form.compareAt === "" ? null : Number(form.compareAt);
  const onSale = Number.isFinite(discount) && discount > 0 && discount < regular;
  const colors = form.colors
    .filter((color) => color.fr.trim() || color.ar.trim())
    .map((color) => ({ fr: color.fr.trim(), ar: color.ar.trim() || color.fr.trim(), hex: color.hex }));
  return {
    id: form.id || `${slugify(form.nameFr)}-${Date.now().toString(36)}`,
    code: form.code || `AU.${String(Date.now()).slice(-4)}`,
    category: form.category,
    name: { fr: form.nameFr.trim(), ar: form.nameAr.trim() || form.nameFr.trim() },
    description: { fr: form.descriptionFr.trim(), ar: form.descriptionAr.trim() || form.descriptionFr.trim() },
    price: onSale ? discount : Number.isFinite(regular) ? regular : 0,
    compareAt: onSale ? regular : undefined,
    stock: Math.max(0, Number(form.stock) || 0),
    sizes: form.sizes,
    colors,
    image: images[0] || "",
    images,
    available: form.available,
  };
}

export default function AdminPage() {
  const { language, t } = useLanguage();
  const store = useStoreData();
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState("orders");
  const [editor, setEditor] = useState(null);

  useEffect(() => {
    setAuthed(sessionStorage.getItem(SESSION_KEY) === "1");
  }, []);

  if (!authed) {
    return (
      <LoginScreen
        t={t}
        onSuccess={() => {
          sessionStorage.setItem(SESSION_KEY, "1");
          setAuthed(true);
        }}
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col text-[#0D0D0D]">
      <section className="mx-3 mt-3 rounded-[28px] border border-black/80 px-4 py-5 sm:px-6 md:mx-5 md:mt-5 md:px-9 md:py-7">
        <Navbar />
        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-[clamp(1.85rem,8vw,2.25rem)] font-bold tracking-tight break-words md:text-6xl">{t.admin.loginTitle}</h1>
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem(SESSION_KEY);
              setAuthed(false);
            }}
            className="cursor-pointer rounded-full border border-black/80 px-4 py-2 text-sm"
          >
            {t.admin.logout}
          </button>
        </div>
        <Stats orders={store.orders} products={store.products} t={t} language={language} />
        <div className="mt-8 flex flex-wrap gap-2">
          {[
            ["orders", t.admin.tabOrders],
            ["products", t.admin.tabProducts],
            ["customers", t.admin.tabCustomers],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm ${
                tab === id ? "border-black bg-[#0D0D0D] text-[#F4F4F2]" : "border-black"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="mt-8">
          {tab === "orders" ? <OrdersPanel t={t} language={language} store={store} /> : null}
          {tab === "products" ? (
            <ProductsPanel t={t} language={language} store={store} onEdit={setEditor} />
          ) : null}
          {tab === "customers" ? <CustomersPanel t={t} language={language} orders={store.orders} /> : null}
        </div>
      </section>
      <Footer />
      {editor ? (
          <ProductEditor
          t={t}
          categories={store.categories.filter((item) => item.id !== "all")}
          initial={editor === "new" ? blankForm() : toForm(editor)}
          onClose={() => setEditor(null)}
          onSave={async (form) => {
            const product = fromForm(form);
            try {
              if (form.id) await store.updateProduct(form.id, product);
              else await store.addProduct(product);
              setEditor(null);
            } catch (error) {
              console.error(error);
              window.alert(error.message);
            }
          }}
        />
      ) : null}
    </div>
  );
}

function LoginScreen({ t, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();
    if (ADMIN_LOGINS.has(email.trim().toLowerCase()) && password === ADMIN_PASSWORD) {
      onSuccess();
      return;
    }
    setError(t.admin.invalid);
  }

  return (
    <div className="flex flex-1 flex-col text-[#0D0D0D]">
      <section className="mx-3 mt-3 rounded-[28px] border border-black/80 px-4 py-5 sm:px-6 md:mx-5 md:mt-5 md:px-9 md:py-7">
        <Navbar />
        <form onSubmit={submit} autoComplete="off" className="mx-auto mt-12 w-full max-w-md">
          <h1 className="text-[clamp(1.85rem,8vw,2.25rem)] font-bold tracking-tight break-words md:text-6xl">{t.admin.loginTitle}</h1>
          <label className="mt-8 block">
            <span className="technical text-[11px] tracking-wide text-black/50">{t.admin.email}</span>
            <input
              className={`${inputClass} mt-2`}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="text"
              name="admin-email"
              autoComplete="off"
              required
            />
          </label>
          <label className="mt-4 block">
            <span className="technical text-[11px] tracking-wide text-black/50">{t.admin.password}</span>
            <input
              className={`${inputClass} mt-2`}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              name="admin-password"
              autoComplete="new-password"
              required
            />
          </label>
          {error ? <p className="mt-3 text-sm">{error}</p> : null}
          <button type="submit" className="mt-6 cursor-pointer rounded-full bg-[#0D0D0D] px-5 py-3 text-sm text-[#F4F4F2]">
            {t.admin.signIn} ↗
          </button>
        </form>
      </section>
      <Footer />
    </div>
  );
}

function Stats({ orders, products, t, language }) {
  const revenue = orders.filter((order) => order.status !== "cancelled").reduce((sum, order) => sum + (order.total || 0), 0);
  const pending = orders.filter((order) => order.status === "pending").length;
  const completed = orders.filter((order) => order.status === "delivered").length;
  const cards = [
    [t.admin.revenue, formatPrice(revenue, language)],
    [t.admin.orders, String(orders.length)],
    [t.admin.pending, String(pending)],
    [t.admin.completed, String(completed)],
    [t.admin.products, String(products.length)],
  ];
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map(([label, value]) => (
        <article key={label} className="rounded-2xl border border-black/80 px-4 py-4">
          <p className="technical text-[11px] text-black/50">{label}</p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
        </article>
      ))}
    </div>
  );
}

function OrdersPanel({ t, language, store }) {
  if (!store.orders.length) return <p className="technical text-sm text-black/60">{t.admin.emptyOrders}</p>;
  return (
    <div className="flex flex-col gap-4">
      {store.orders.map((order) => (
        <article key={order.reference} className="rounded-2xl border border-black/80 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold">{order.reference}</p>
              <p className="technical mt-1 text-[11px] text-black/50">
                {new Date(order.createdAt).toLocaleString(language === "ar" ? "ar-DZ" : "fr-DZ")}
              </p>
            </div>
            <label className="text-sm">
              <span className="technical me-2 text-[11px] text-black/50">{t.admin.status}</span>
              <select
                className="rounded-full border border-black/80 bg-transparent px-3 py-1"
                value={order.status || "pending"}
                onChange={(event) => {
                  const status = event.target.value;
                  store.updateOrderStatus(order.id, status).catch((error) => {
                    console.error(error);
                    window.alert(error.message);
                  });
                }}
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {t.admin.statuses[status]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="mt-4 text-sm leading-6">
            {order.customer.fullName} · {order.customer.phone}
            <br />
            {order.customer.wilaya?.[language] || order.customer.wilayaCode} — {order.customer.commune}
            <br />
            {order.customer.address}
            <br />
            {t.admin.delivery}: {order.customer.deliveryType === "desk" ? t.admin.desk : t.admin.home}
          </p>
          <ul className="mt-4 flex flex-col gap-3">
            {(order.items || []).map((item) => (
              <li key={`${item.productId}-${item.size}-${item.color?.fr}`} className="flex items-center gap-3">
                <img src={item.image} alt="" className="h-14 w-12 rounded-lg border border-black/80 object-cover" />
                <span className="text-sm">
                  {item.name?.[language]} · {item.size} · {item.color?.[language]} · × {item.quantity}
                </span>
              </li>
            ))}
          </ul>
          <p className="technical mt-4 text-sm">{formatPrice(order.total || 0, language)}</p>
        </article>
      ))}
    </div>
  );
}

function ProductsPanel({ t, language, store, onEdit }) {
  return (
    <div>
      <button
        type="button"
        onClick={() => onEdit("new")}
        className="mb-4 cursor-pointer rounded-full bg-[#0D0D0D] px-4 py-2 text-sm text-[#F4F4F2]"
      >
        {t.admin.addProduct} ↗
      </button>
      {store.products.length === 0 ? (
        <p className="technical text-sm text-black/60">{t.admin.emptyProducts}</p>
      ) : (
        <div className="grid gap-3">
          {store.products.map((product) => (
            <article key={product.id} className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-black/80 p-3 lg:grid-cols-[72px_minmax(0,1fr)_auto]">
              <img src={product.image} alt="" className="h-16 w-16 rounded-xl border border-black/30 object-cover" />
              <div className="min-w-0">
                <p className="font-semibold break-words">{product.name?.[language]}</p>
                <p className="technical mt-1 text-[11px] text-black/50">
                  {product.category} · {formatPrice(product.price, language)} · {t.admin.stock} {product.stock}
                </p>
              </div>
              <div className="col-span-2 flex flex-wrap items-center gap-2 lg:col-span-1 lg:justify-end">
              <button
                type="button"
                onClick={() => {
                  const nextId = store.featuredProductId === product.id ? "" : product.id;
                  store.setFeaturedProduct(nextId).catch((error) => {
                    console.error(error);
                    window.alert(error.message);
                  });
                }}
                className={`cursor-pointer rounded-full border px-3 py-1 text-xs ${
                  store.featuredProductId === product.id
                    ? "border-black bg-[#0D0D0D] text-[#F4F4F2]"
                    : "border-black"
                }`}
              >
                {t.admin.newCollection}
              </button>
              <button
                type="button"
                onClick={() => {
                  store
                    .updateProduct(product.id, { available: product.available === false })
                    .catch((error) => {
                      console.error(error);
                      window.alert(error.message);
                    });
                }}
                className={`cursor-pointer rounded-full border px-3 py-1 text-xs ${
                  product.available === false ? "border-black/30 text-black/40" : "border-black"
                }`}
              >
                {product.available === false ? t.admin.unavailable : t.admin.available}
              </button>
              <button type="button" onClick={() => onEdit(product)} className="cursor-pointer text-sm">
                {t.admin.edit}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(t.admin.confirmDelete)) {
                    store.deleteProduct(product.id).catch((error) => {
                      console.error(error);
                      window.alert(error.message);
                    });
                  }
                }}
                className="cursor-pointer text-sm text-black/60"
              >
                {t.admin.delete}
              </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function CustomersPanel({ t, language, orders }) {
  const customers = useMemo(() => {
    const map = new Map();
    orders.forEach((order) => {
      const phone = order.customer?.phone;
      if (!phone) return;
      const current = map.get(phone) || {
        phone,
        name: order.customer.fullName,
        wilaya: order.customer.wilaya,
        orders: [],
        spent: 0,
      };
      current.name = order.customer.fullName || current.name;
      current.wilaya = order.customer.wilaya || current.wilaya;
      current.orders.push(order);
      if (order.status !== "cancelled") current.spent += order.total || 0;
      map.set(phone, current);
    });
    return [...map.values()];
  }, [orders]);

  if (!customers.length) return <p className="technical text-sm text-black/60">{t.admin.emptyCustomers}</p>;

  return (
    <div className="grid gap-3">
      {customers.map((customer) => (
        <article key={customer.phone} className="rounded-2xl border border-black/80 p-4">
          <p className="font-semibold">{customer.name}</p>
          <p className="technical mt-1 text-xs text-black/60">
            {customer.phone} · {customer.wilaya?.[language]}
          </p>
          <p className="mt-3 text-sm">
            {customer.orders.length} {t.admin.tabOrders} · {t.admin.spent} {formatPrice(customer.spent, language)}
          </p>
          <p className="technical mt-3 text-[11px] text-black/50">{t.admin.history}</p>
          <ul className="mt-1 text-sm">
            {customer.orders.map((order) => (
              <li key={order.reference}>
                {order.reference} · {t.admin.statuses[order.status] || order.status} · {formatPrice(order.total || 0, language)}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

function ProductEditor({ t, categories, initial, onClose, onSave }) {
  const { language } = useLanguage();
  const [form, setForm] = useState(initial);

  function setField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function addFiles(fileList) {
    const files = [...fileList];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setForm((current) => ({
          ...current,
          images: [...current.images.filter(Boolean), String(reader.result)],
        }));
      };
      reader.readAsDataURL(file);
    });
  }

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/40 p-4">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!form.nameFr.trim() || !form.sizes.length || !form.colors.some((color) => color.fr.trim())) return;
          onSave(form);
        }}
        className="mx-auto my-6 w-full max-w-2xl rounded-[28px] border border-black/80 bg-[#F4F4F2] p-5 text-[#0D0D0D] sm:p-7"
      >
        <h2 className="text-3xl font-bold">{form.id ? t.admin.editProduct : t.admin.addProduct}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label>
            <span className="technical text-[11px] text-black/50">{t.admin.nameFr}</span>
            <input className={`${inputClass} mt-2`} value={form.nameFr} onChange={(event) => setField("nameFr", event.target.value)} required />
          </label>
          <label>
            <span className="technical text-[11px] text-black/50">{t.admin.nameAr}</span>
            <input className={`${inputClass} mt-2`} value={form.nameAr} onChange={(event) => setField("nameAr", event.target.value)} required />
          </label>
          <label className="sm:col-span-2">
            <span className="technical text-[11px] text-black/50">{t.admin.descriptionFr}</span>
            <textarea className={`${inputClass} mt-2 min-h-20`} value={form.descriptionFr} onChange={(event) => setField("descriptionFr", event.target.value)} />
          </label>
          <label className="sm:col-span-2">
            <span className="technical text-[11px] text-black/50">{t.admin.descriptionAr}</span>
            <textarea className={`${inputClass} mt-2 min-h-20`} value={form.descriptionAr} onChange={(event) => setField("descriptionAr", event.target.value)} />
          </label>
          <label>
            <span className="technical text-[11px] text-black/50">{t.admin.category}</span>
            <select className={`${inputClass} mt-2`} value={form.category} onChange={(event) => setField("category", event.target.value)}>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label?.[language] || item.id}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="technical text-[11px] text-black/50">{t.admin.stock}</span>
            <input className={`${inputClass} mt-2`} type="number" min="0" value={form.stock} onChange={(event) => setField("stock", event.target.value)} />
          </label>
          <label>
            <span className="technical text-[11px] text-black/50">{t.admin.price}</span>
            <input className={`${inputClass} mt-2`} type="number" min="0" value={form.price} onChange={(event) => setField("price", event.target.value)} required />
          </label>
          <label>
            <span className="technical text-[11px] text-black/50">{t.admin.discount}</span>
            <input className={`${inputClass} mt-2`} type="number" min="0" value={form.compareAt} onChange={(event) => setField("compareAt", event.target.value)} />
          </label>
        </div>
        <p className="technical mt-5 text-[11px] text-black/50">{t.admin.sizes}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {SIZES.map((size) => {
            const active = form.sizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() =>
                  setField(
                    "sizes",
                    active ? form.sizes.filter((item) => item !== size) : [...form.sizes, size],
                  )
                }
                className={`technical cursor-pointer rounded-full border px-3 py-1 text-[11px] ${
                  active ? "border-black bg-[#0D0D0D] text-[#F4F4F2]" : "border-black/80"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
        <p className="technical mt-5 text-[11px] text-black/50">{t.admin.colors}</p>
        <div className="mt-2 flex flex-col gap-2">
          {form.colors.map((color, index) => (
            <div key={index} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2">
              <input className={inputClass} placeholder={t.admin.colorFr} value={color.fr} onChange={(event) => {
                const colors = [...form.colors];
                colors[index] = { ...color, fr: event.target.value };
                setField("colors", colors);
              }} />
              <input className={inputClass} placeholder={t.admin.colorAr} value={color.ar} onChange={(event) => {
                const colors = [...form.colors];
                colors[index] = { ...color, ar: event.target.value };
                setField("colors", colors);
              }} />
              <input type="color" value={color.hex || "#0D0D0D"} onChange={(event) => {
                const colors = [...form.colors];
                colors[index] = { ...color, hex: event.target.value };
                setField("colors", colors);
              }} aria-label={t.admin.colors} />
              <button type="button" className="text-xs" onClick={() => setField("colors", form.colors.filter((_, item) => item !== index))}>
                {t.admin.remove}
              </button>
            </div>
          ))}
          <button type="button" className="w-fit text-sm" onClick={() => setField("colors", [...form.colors, { fr: "", ar: "", hex: "#0D0D0D" }])}>
            {t.admin.addColor}
          </button>
        </div>
        <p className="technical mt-5 text-[11px] text-black/50">{t.admin.images}</p>
        <div className="mt-2 flex flex-col gap-2">
          {form.images.map((image, index) => (
            <div key={index} className="flex gap-2">
              <input className={inputClass} value={image.startsWith("data:") ? t.admin.upload : image} onChange={(event) => {
                const images = [...form.images];
                images[index] = event.target.value;
                setField("images", images);
              }} />
              {image ? <img src={image} alt="" className="h-10 w-10 rounded-lg border border-black/40 object-cover" /> : null}
            </div>
          ))}
          <div className="flex flex-wrap gap-3 text-sm">
            <button type="button" onClick={() => setField("images", [...form.images, ""])}>
              {t.admin.addImage}
            </button>
            <label className="cursor-pointer">
              {t.admin.upload}
              <input type="file" accept="image/*" className="sr-only" onChange={(event) => addFiles(event.target.files)} />
            </label>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <button type="submit" className="cursor-pointer rounded-full bg-[#0D0D0D] px-5 py-2.5 text-sm text-[#F4F4F2]">
            {t.admin.save} ↗
          </button>
          <button type="button" onClick={onClose} className="cursor-pointer rounded-full border border-black/80 px-5 py-2.5 text-sm">
            {t.admin.cancel}
          </button>
        </div>
      </form>
    </div>
  );
}
