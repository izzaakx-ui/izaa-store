import { Readex_Pro, Space_Mono, Syne } from "next/font/google";
import CartDrawer from "@/components/CartDrawer";
import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { StoreDataProvider } from "@/context/StoreDataContext";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const readex = Readex_Pro({
  variable: "--font-readex",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Izzaa store",
  description: "Izzaa store. Livraison dans les 58 wilayas.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="fr"
      dir="ltr"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${syne.variable} ${spaceMono.variable} ${readex.variable} h-full antialiased`}
    >
      <body className="flex min-h-full max-w-full flex-col overflow-x-hidden">
        <LanguageProvider>
          <StoreDataProvider>
            <CartProvider>
              {children}
              <CartDrawer />
            </CartProvider>
          </StoreDataProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
