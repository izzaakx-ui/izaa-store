"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { categories as fallbackCategories, products as seedProducts } from "@/data/mockProducts";
import { supabase } from "@/lib/supabase";

const CATEGORY_IDS = {
  cargo: "pants",
  tees: "tshirts",
};
const FEATURED_ID = "store-featured";

function featuredRow(productId) {
  return {
    id: FEATURED_ID,
    code: "FEATURED",
    category: "jackets",
    name_fr: "featured",
    name_ar: "featured",
    description_fr: productId || "",
    description_ar: "",
    price: 0,
    discount_price: null,
    images: [],
    sizes: [],
    colors: [],
    stock: 0,
    available: false,
  };
}

function splitCatalog(rows) {
  const marker = rows.find((row) => row.id === FEATURED_ID);
  return {
    featuredProductId: marker?.description_fr || "",
    products: rows.filter((row) => row.id !== FEATURED_ID).map(fromProductRow),
  };
}

function categoryId(value) {
  return CATEGORY_IDS[value] || value;
}

function toProductRow(product) {
  const onSale = Number(product.compareAt) > Number(product.price);
  const images = product.images?.length ? product.images : [product.image].filter(Boolean);
  return {
    id: product.id,
    code: product.code || "",
    category: categoryId(product.category),
    name_fr: product.name?.fr || "",
    name_ar: product.name?.ar || "",
    description_fr: product.description?.fr || "",
    description_ar: product.description?.ar || "",
    price: onSale ? Number(product.compareAt) : Number(product.price) || 0,
    discount_price: onSale ? Number(product.price) : null,
    images,
    sizes: product.sizes || [],
    colors: product.colors || [],
    stock: Math.max(0, Number(product.stock) || 0),
    available: product.available !== false,
  };
}

function fromProductRow(row) {
  const images = Array.isArray(row.images) ? row.images : [];
  const discount = Number(row.discount_price);
  const price = Number(row.price);
  const onSale = Number.isFinite(discount) && discount > 0 && discount < price;
  return {
    id: row.id,
    code: row.code || "",
    category: row.category,
    name: { fr: row.name_fr || "", ar: row.name_ar || "" },
    description: { fr: row.description_fr || "", ar: row.description_ar || "" },
    price: onSale ? discount : price,
    compareAt: onSale ? price : undefined,
    images,
    image: images[0] || "",
    sizes: Array.isArray(row.sizes) ? row.sizes : [],
    colors: Array.isArray(row.colors) ? row.colors : [],
    stock: Number(row.stock) || 0,
    available: row.available !== false,
  };
}

function parseWilaya(value) {
  if (value && typeof value === "object") return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object" && (parsed.fr || parsed.ar)) return parsed;
    } catch {
      return { fr: value, ar: value };
    }
    return { fr: value, ar: value };
  }
  return { fr: "", ar: "" };
}

function toOrderRow(order) {
  return {
    id: order.reference,
    customer_name: order.customer.fullName,
    phone: order.customer.phone,
    wilaya_code: order.customer.wilayaCode,
    wilaya_name: JSON.stringify(order.customer.wilaya || {}),
    commune: order.customer.commune,
    address: order.customer.address,
    delivery_type: order.customer.deliveryType,
    items: order.items || [],
    subtotal: order.subtotal || 0,
    shipping_fee: order.shipping || 0,
    total: order.total || 0,
    status: (order.status || "pending").toLowerCase(),
  };
}

function fromOrderRow(row) {
  const wilaya = parseWilaya(row.wilaya_name);
  return {
    id: row.id,
    reference: row.id,
    createdAt: row.created_at,
    status: (row.status || "pending").toLowerCase(),
    customer: {
      fullName: row.customer_name || "",
      phone: row.phone || "",
      wilayaCode: row.wilaya_code || "",
      wilaya,
      commune: row.commune || "",
      address: row.address || "",
      deliveryType: row.delivery_type || "home",
    },
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: Number(row.subtotal) || 0,
    shipping: Number(row.shipping_fee) || 0,
    total: Number(row.total) || 0,
  };
}

function mapCategories(rows) {
  const order = ["jackets", "hoodies", "pants", "tshirts"];
  const sorted = [...rows].sort((a, b) => {
    const ai = order.indexOf(a.id);
    const bi = order.indexOf(b.id);
    return (ai === -1 ? order.length : ai) - (bi === -1 ? order.length : bi);
  });
  const all = fallbackCategories.find((item) => item.id === "all");
  return [
    all,
    ...sorted.map((row) => ({
      id: row.id,
      label: { fr: row.name_fr, ar: row.name_ar },
    })),
  ];
}

const PRODUCT_COLUMNS =
  "id, code, category, name_fr, name_ar, description_fr, description_ar, price, discount_price, images, sizes, colors, stock, available, created_at";
const CATALOG_KEY = "izzaa-catalog";

function readCatalogCache() {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(sessionStorage.getItem(CATALOG_KEY) || "null");
    if (!parsed || !Array.isArray(parsed.products)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function rememberCatalog(catalog) {
  catalogMemory = catalog;
  catalogMemoryAt = Date.now();
  try {
    sessionStorage.setItem(
      CATALOG_KEY,
      JSON.stringify({
        products: catalog.products,
        featuredProductId: catalog.featuredProductId || "",
        categories: catalog.categories,
      }),
    );
  } catch {
    // Ignore private-mode storage failures. The live request still updates the page.
  }
}

let catalogMemory = null;
let catalogMemoryAt = 0;
let catalogRequest = null;
let ordersRequest = null;

async function loadCategories() {
  const { data, error } = await supabase.from("categories").select("id, name_fr, name_ar").order("id");
  if (error) throw error;
  return data?.length ? mapCategories(data) : fallbackCategories;
}

async function ensureProducts() {
  let lastError = null;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .order("created_at", { ascending: true });
    if (!error) {
      if (data.length > 0) return splitCatalog(data);
      lastError = null;
      break;
    }
    lastError = error;
    if (error.code !== "57014") break;
  }
  if (lastError) {
    console.error(lastError);
    throw lastError;
  }

  const { error: seedError } = await supabase.from("products").insert(seedProducts.map(toProductRow));
  if (seedError) {
    console.error(seedError);
    throw seedError;
  }
  const seeded = await supabase.from("products").select("*").order("created_at", { ascending: true });
  if (seeded.error) {
    console.error(seeded.error);
    throw seeded.error;
  }
  return splitCatalog(seeded.data || []);
}

async function loadCatalog() {
  if (catalogMemory && Date.now() - catalogMemoryAt < 15000) return catalogMemory;
  if (!catalogRequest) {
    catalogRequest = Promise.all([loadCategories(), ensureProducts()])
      .then(([categories, catalog]) => {
        const next = {
          categories,
          products: catalog.products,
          featuredProductId: catalog.featuredProductId,
        };
        rememberCatalog(next);
        return next;
      })
      .finally(() => {
        catalogRequest = null;
      });
  }
  return catalogRequest;
}

if (typeof window !== "undefined") {
  loadCatalog().catch((error) => {
    console.error(error);
  });
}

async function loadOrders() {
  if (!ordersRequest) {
    ordersRequest = supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) throw error;
        return (data || []).map(fromOrderRow);
      })
      .finally(() => {
        ordersRequest = null;
      });
  }
  return ordersRequest;
}

const StoreDataContext = createContext(null);

export function StoreDataProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [featuredProductId, setFeaturedProductId] = useState("");
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState(fallbackCategories);
  const [ready, setReady] = useState(false);
  const productsRef = useRef(products);
  const featuredRef = useRef("");
  const categoriesRef = useRef(categories);
  productsRef.current = products;
  featuredRef.current = featuredProductId;
  categoriesRef.current = categories;

  const cacheCatalog = useCallback((nextProducts, nextFeatured) => {
    rememberCatalog({
      products: nextProducts,
      featuredProductId: nextFeatured,
      categories: categoriesRef.current,
    });
  }, []);

  useLayoutEffect(() => {
    const cached = readCatalogCache();
    if (!cached) return;
    setCategories(cached.categories?.length ? cached.categories : fallbackCategories);
    setProducts(cached.products);
    setFeaturedProductId(cached.featuredProductId || "");
    setReady(true);
  }, []);

  useEffect(() => {
    let active = true;
    loadCatalog()
      .then((catalog) => {
        if (!active) return;
        setCategories(catalog.categories);
        setProducts(catalog.products);
        setFeaturedProductId(catalog.featuredProductId || "");
        setReady(true);
      })
      .catch((error) => {
        console.error(error);
        if (active) setReady(true);
      });
    loadOrders()
      .then((nextOrders) => {
        if (active) setOrders(nextOrders);
      })
      .catch((error) => {
        console.error(error);
      });
    return () => {
      active = false;
    };
  }, []);

  const getProduct = useCallback(
    (id) => products.find((product) => product.id === id),
    [products],
  );

  const saveProduct = useCallback(async (product) => {
    const row = toProductRow(product);
    const { data, error } = await supabase.from("products").upsert(row, { onConflict: "id" }).select("*").single();
    if (error) {
      console.error(error);
      throw error;
    }
    return fromProductRow(data);
  }, []);

  const addProduct = useCallback(
    async (product) => {
      const saved = await saveProduct(product);
      const next = [saved, ...productsRef.current.filter((item) => item.id !== saved.id)];
      setProducts(next);
      cacheCatalog(next, featuredRef.current);
      return saved;
    },
    [cacheCatalog, saveProduct],
  );

  const updateProduct = useCallback(
    async (id, patch) => {
      const existing = productsRef.current.find((product) => product.id === id) || {};
      const saved = await saveProduct({ ...existing, ...patch, id });
      const next = productsRef.current.map((product) => (product.id === id ? saved : product));
      setProducts(next);
      cacheCatalog(next, featuredRef.current);
      return saved;
    },
    [cacheCatalog, saveProduct],
  );

  const deleteProduct = useCallback(async (id) => {
    const { data, error } = await supabase.from("products").delete().eq("id", id).select("id");
    if (error) {
      console.error(error);
      throw error;
    }
    if (!data?.length) {
      const failure = new Error(`Product ${id} was not deleted.`);
      console.error(failure);
      throw failure;
    }
    const next = productsRef.current.filter((product) => product.id !== id);
    setProducts(next);
    let nextFeatured = featuredRef.current;
    if (productsRef.current.some((product) => product.id === id) && featuredRef.current === id) {
      await supabase.from("products").upsert(featuredRow(""), { onConflict: "id" });
      nextFeatured = "";
      setFeaturedProductId("");
    }
    cacheCatalog(next, nextFeatured);
  }, [cacheCatalog]);

  const setFeaturedProduct = useCallback(async (productId) => {
    const nextId = productId || "";
    const { data, error } = await supabase
      .from("products")
      .upsert(featuredRow(nextId), { onConflict: "id" })
      .select("id");
    if (error) {
      console.error(error);
      throw error;
    }
    if (!data?.length) {
      const failure = new Error("The new collection product was not saved.");
      console.error(failure);
      throw failure;
    }
    setFeaturedProductId(nextId);
    cacheCatalog(productsRef.current, nextId);
  }, [cacheCatalog]);

  const addOrder = useCallback(async (order) => {
    const { data, error } = await supabase.from("orders").insert(toOrderRow(order)).select("*").single();
    if (error) throw error;
    const next = fromOrderRow(data);
    setOrders((current) => [next, ...current.filter((item) => item.reference !== next.reference)]);
    return next;
  }, []);

  const updateOrderStatus = useCallback(async (orderId, status) => {
    const { data, error } = await supabase.from("orders").update({ status }).eq("id", orderId).select("*").single();
    if (error) {
      console.error(error);
      throw error;
    }
    const next = fromOrderRow(data);
    setOrders((current) => current.map((order) => (order.id === orderId ? next : order)));
  }, []);

  const value = useMemo(
    () => ({
      products,
      featuredProductId,
      orders,
      categories,
      ready,
      getProduct,
      addProduct,
      updateProduct,
      deleteProduct,
      setFeaturedProduct,
      addOrder,
      updateOrderStatus,
    }),
    [
      products,
      featuredProductId,
      orders,
      categories,
      ready,
      getProduct,
      addProduct,
      updateProduct,
      deleteProduct,
      setFeaturedProduct,
      addOrder,
      updateOrderStatus,
    ],
  );

  return <StoreDataContext.Provider value={value}>{children}</StoreDataContext.Provider>;
}

export function useStoreData() {
  const context = useContext(StoreDataContext);
  if (!context) {
    throw new Error("useStoreData must be used within a StoreDataProvider");
  }
  return context;
}
