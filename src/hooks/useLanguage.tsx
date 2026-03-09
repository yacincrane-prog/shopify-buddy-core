import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export type Lang = "ar" | "en";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  dir: "rtl" | "ltr";
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

// Translations
const translations: Record<string, Record<Lang, string>> = {
  // Common
  "common.loading": { ar: "جاري التحميل…", en: "Loading…" },
  "common.save": { ar: "حفظ", en: "Save" },
  "common.cancel": { ar: "إلغاء", en: "Cancel" },
  "common.delete": { ar: "حذف", en: "Delete" },
  "common.edit": { ar: "تعديل", en: "Edit" },
  "common.add": { ar: "إضافة", en: "Add" },
  "common.search": { ar: "بحث…", en: "Search…" },
  "common.actions": { ar: "إجراءات", en: "Actions" },
  "common.status": { ar: "الحالة", en: "Status" },
  "common.active": { ar: "نشط", en: "Active" },
  "common.inactive": { ar: "غير نشط", en: "Inactive" },
  "common.yes": { ar: "نعم", en: "Yes" },
  "common.no": { ar: "لا", en: "No" },
  "common.back": { ar: "رجوع", en: "Back" },
  "common.close": { ar: "إغلاق", en: "Close" },
  "common.confirm": { ar: "تأكيد", en: "Confirm" },
  "common.noData": { ar: "لا توجد بيانات", en: "No data" },
  "common.all": { ar: "الكل", en: "All" },
  "common.name": { ar: "الاسم", en: "Name" },
  "common.price": { ar: "السعر", en: "Price" },
  "common.quantity": { ar: "الكمية", en: "Quantity" },
  "common.date": { ar: "التاريخ", en: "Date" },
  "common.created": { ar: "تم الإنشاء", en: "Created" },
  "common.updated": { ar: "تم التحديث", en: "Updated" },
  "common.success": { ar: "تم بنجاح", en: "Success" },
  "common.error": { ar: "حدث خطأ", en: "Error" },
  "common.noResults": { ar: "لا توجد نتائج", en: "No results" },
  "common.allStatuses": { ar: "جميع الحالات", en: "All statuses" },
  "common.sortBy": { ar: "ترتيب حسب", en: "Sort by" },

  // Auth
  "auth.login": { ar: "تسجيل الدخول", en: "Sign In" },
  "auth.signup": { ar: "إنشاء حساب", en: "Sign Up" },
  "auth.logout": { ar: "تسجيل الخروج", en: "Sign Out" },
  "auth.email": { ar: "البريد الإلكتروني", en: "Email" },
  "auth.password": { ar: "كلمة المرور", en: "Password" },
  "auth.loginTitle": { ar: "تسجيل الدخول", en: "Sign In" },
  "auth.signupTitle": { ar: "إنشاء حساب", en: "Create Account" },
  "auth.loginDesc": { ar: "سجّل الدخول للوحة التحكم", en: "Sign in to dashboard" },
  "auth.signupDesc": { ar: "أنشئ حساب أدمن جديد", en: "Create a new admin account" },
  "auth.hasAccount": { ar: "لديك حساب؟ سجّل الدخول", en: "Have an account? Sign in" },
  "auth.noAccount": { ar: "ليس لديك حساب؟ أنشئ حساب جديد", en: "No account? Create one" },
  "auth.signupSuccess": { ar: "تم إنشاء الحساب بنجاح!", en: "Account created successfully!" },

  // Sidebar
  "nav.dashboard": { ar: "لوحة التحكم", en: "Dashboard" },
  "nav.storefront": { ar: "تخصيص المتجر", en: "Storefront" },
  "nav.products": { ar: "المنتجات", en: "Products" },
  "nav.orders": { ar: "الطلبات", en: "Orders" },
  "nav.landingPages": { ar: "صفحات الهبوط", en: "Landing Pages" },
  "nav.bundles": { ar: "الحزم", en: "Bundles" },
  "nav.upsells": { ar: "البيع الإضافي", en: "Upsells" },
  "nav.postUpsell": { ar: "بيع ما بعد الطلب", en: "Post-Order Upsell" },
  "nav.discountCodes": { ar: "أكواد الخصم", en: "Discount Codes" },
  "nav.qtyOffers": { ar: "عروض الكمية", en: "Qty Offers" },
  "nav.qtyDiscounts": { ar: "خصومات الكمية", en: "Qty Discounts" },
  "nav.exitIntent": { ar: "نافذة الخروج", en: "Exit Intent" },
  "nav.abandoned": { ar: "العملاء المتروكين", en: "Abandoned Leads" },
  "nav.analytics": { ar: "التحليلات", en: "Analytics" },
  "nav.shipping": { ar: "الشحن", en: "Shipping" },
  "nav.trackingPixels": { ar: "بكسل التتبع", en: "Tracking Pixels" },
  "nav.googleSheets": { ar: "جداول البيانات", en: "Google Sheets" },
  "nav.credentials": { ar: "بيانات الدخول", en: "Credentials" },
  "nav.themeEditor": { ar: "محرر المظهر", en: "Theme Editor" },
  "nav.checkoutPreview": { ar: "معاينة الدفع", en: "Checkout Preview" },
  "nav.pageBuilder": { ar: "بناء الصفحات", en: "Page Builder" },
  "nav.main": { ar: "الرئيسية", en: "Main" },
  "nav.marketing": { ar: "التسويق", en: "Marketing" },
  "nav.system": { ar: "النظام", en: "System" },
  "nav.controlPanel": { ar: "لوحة التحكم", en: "Control Panel" },
  "nav.version": { ar: "الإصدار 1.0 · لوحة الإدارة", en: "Version 1.0 · Admin Panel" },
  "nav.noNotifications": { ar: "لا توجد إشعارات جديدة", en: "No new notifications" },

  // Dashboard / Overview
  "overview.title": { ar: "لوحة التحكم", en: "Dashboard" },
  "overview.welcome": { ar: "مرحباً بك. إليك نظرة عامة على متجرك.", en: "Welcome. Here's an overview of your store." },
  "overview.products": { ar: "المنتجات", en: "Products" },
  "overview.totalOrders": { ar: "إجمالي الطلبات", en: "Total Orders" },
  "overview.pending": { ar: "قيد الانتظار", en: "Pending" },
  "overview.delivered": { ar: "تم التسليم", en: "Delivered" },
  "overview.revenue": { ar: "الإيرادات", en: "Revenue" },
  "overview.abandoned": { ar: "متروكين", en: "Abandoned" },
  "overview.recentOrders": { ar: "آخر الطلبات", en: "Recent Orders" },

  // Products
  "products.title": { ar: "المنتجات", en: "Products" },
  "products.description": { ar: "إدارة كتالوج منتجات متجرك", en: "Manage your store product catalog" },
  "products.add": { ar: "إضافة منتج", en: "Add Product" },
  "products.new": { ar: "منتج جديد", en: "New Product" },
  "products.editProduct": { ar: "تعديل المنتج", en: "Edit Product" },
  "products.backToProducts": { ar: "العودة للمنتجات", en: "Back to Products" },
  "products.searchPlaceholder": { ar: "بحث في المنتجات…", en: "Search products…" },
  "products.newest": { ar: "الأحدث أولاً", en: "Newest first" },
  "products.oldest": { ar: "الأقدم أولاً", en: "Oldest first" },
  "products.priceHigh": { ar: "السعر: الأعلى → الأقل", en: "Price: High → Low" },
  "products.priceLow": { ar: "السعر: الأقل → الأعلى", en: "Price: Low → High" },
  "products.nameAZ": { ar: "الاسم أ-ي", en: "Name A-Z" },
  "products.created": { ar: "تم إنشاء المنتج", en: "Product created" },
  "products.updated": { ar: "تم تحديث المنتج", en: "Product updated" },
  "products.deleted": { ar: "تم حذف المنتج", en: "Product deleted" },
  "products.createFail": { ar: "فشل في إنشاء المنتج", en: "Failed to create product" },
  "products.updateFail": { ar: "فشل في تحديث المنتج", en: "Failed to update product" },
  "products.deleteFail": { ar: "فشل في حذف المنتج", en: "Failed to delete product" },
  "products.deleteConfirm": { ar: "حذف المنتج؟", en: "Delete product?" },
  "products.deleteWarning": { ar: "لا يمكن التراجع عن هذا الإجراء.", en: "This action cannot be undone." },
  "products.stock": { ar: "المخزون", en: "Stock" },
  "products.noProducts": { ar: "لا توجد منتجات بعد", en: "No products yet" },
  "products.addFirst": { ar: "أضف أول منتج لبدء البيع", en: "Add your first product to start selling" },

  // Orders
  "orders.title": { ar: "الطلبات", en: "Orders" },
  "orders.description": { ar: "عرض وإدارة طلبات العملاء", en: "View and manage customer orders" },
  "orders.searchPlaceholder": { ar: "بحث بالاسم، الهاتف، أو المنتج...", en: "Search by name, phone, or product..." },
  "orders.noOrders": { ar: "لا توجد طلبات", en: "No orders" },
  "orders.customer": { ar: "العميل", en: "Customer" },
  "orders.product": { ar: "المنتج", en: "Product" },
  "orders.amount": { ar: "المبلغ", en: "Amount" },
  "orders.wilaya": { ar: "الولاية", en: "Wilaya" },
  "orders.delivery": { ar: "التوصيل", en: "Delivery" },
  "orders.home": { ar: "المنزل", en: "Home" },
  "orders.desk": { ar: "المكتب", en: "Desk" },
  "orders.statusUpdated": { ar: "تم تحديث الحالة", en: "Status updated" },
  "orders.updateFail": { ar: "فشل التحديث", en: "Update failed" },
  "orders.deleted": { ar: "تم حذف الطلب", en: "Order deleted" },
  "orders.deleteFail": { ar: "فشل الحذف", en: "Delete failed" },
  "orders.deleteConfirm": { ar: "حذف الطلب؟", en: "Delete order?" },
  "orders.deleteWarning": { ar: "لا يمكن التراجع عن هذا الإجراء.", en: "This action cannot be undone." },
  "orders.pending": { ar: "قيد الانتظار", en: "Pending" },
  "orders.confirmed": { ar: "مؤكد", en: "Confirmed" },
  "orders.shipped": { ar: "تم الشحن", en: "Shipped" },
  "orders.delivered": { ar: "تم التسليم", en: "Delivered" },
  "orders.cancelled": { ar: "ملغي", en: "Cancelled" },

  // Landing Pages
  "landingPages.title": { ar: "صفحات الهبوط", en: "Landing Pages" },
  "landingPages.description": { ar: "إنشاء صفحات هبوط عالية التحويل لمنتجاتك", en: "Create high-converting landing pages for your products" },

  // Bundles
  "bundles.title": { ar: "الحزم", en: "Bundles" },
  "bundles.description": { ar: "إنشاء حزم منتجات بأسعار مخفضة", en: "Create product bundles at discounted prices" },

  // Upsells
  "upsells.title": { ar: "البيع الإضافي", en: "Upsells" },
  "upsells.description": { ar: "إدارة عروض البيع الإضافي لزيادة متوسط قيمة الطلب", en: "Manage upsell offers to increase average order value" },

  // Post Upsell
  "postUpsell.title": { ar: "بيع ما بعد الطلب", en: "Post-Order Upsell" },
  "postUpsell.description": { ar: "عروض خاصة تظهر بعد تأكيد الطلب", en: "Special offers shown after order confirmation" },

  // Discount Codes
  "discountCodes.title": { ar: "أكواد الخصم", en: "Discount Codes" },
  "discountCodes.description": { ar: "إنشاء وإدارة أكواد الخصم", en: "Create and manage discount codes" },

  // Qty Offers
  "qtyOffers.title": { ar: "عروض الكمية", en: "Quantity Offers" },
  "qtyOffers.description": { ar: "عروض ذكية حسب الكمية لكل منتج", en: "Smart quantity-based offers per product" },

  // Qty Discounts
  "qtyDiscounts.title": { ar: "خصومات الكمية", en: "Quantity Discounts" },
  "qtyDiscounts.description": { ar: "خصومات تلقائية حسب الكمية المطلوبة", en: "Automatic discounts based on ordered quantity" },

  // Exit Intent
  "exitIntent.title": { ar: "نافذة الخروج", en: "Exit Intent" },
  "exitIntent.description": { ar: "إعداد النوافذ المنبثقة عند محاولة الخروج", en: "Configure exit-intent popups" },

  // Abandoned
  "abandoned.title": { ar: "العملاء المتروكين", en: "Abandoned Leads" },
  "abandoned.description": { ar: "متابعة العملاء الذين لم يكملوا الطلب", en: "Follow up with customers who didn't complete orders" },

  // Analytics
  "analytics.title": { ar: "التحليلات", en: "Analytics" },
  "analytics.description": { ar: "إحصائيات وتحليلات المتجر", en: "Store statistics and analytics" },

  // Shipping
  "shipping.title": { ar: "الشحن", en: "Shipping" },
  "shipping.description": { ar: "إعدادات أسعار الشحن والتوصيل", en: "Shipping rates and delivery settings" },

  // Tracking Pixels
  "trackingPixels.title": { ar: "بكسل التتبع", en: "Tracking Pixels" },
  "trackingPixels.description": { ar: "إدارة بكسلات التتبع والتحليلات", en: "Manage tracking pixels and analytics" },

  // Google Sheets
  "googleSheets.title": { ar: "جداول البيانات", en: "Google Sheets" },
  "googleSheets.description": { ar: "ربط وتصدير البيانات إلى Google Sheets", en: "Connect and export data to Google Sheets" },

  // Credentials
  "credentials.title": { ar: "بيانات الدخول", en: "Access Credentials" },
  "credentials.description": { ar: "عرض بيانات الدخول المحفوظة", en: "View saved access credentials" },

  // Theme Editor
  "themeEditor.title": { ar: "محرر المظهر", en: "Theme Editor" },
  "themeEditor.description": { ar: "تخصيص مظهر متجرك", en: "Customize your store appearance" },

  // Checkout Preview
  "checkoutPreview.title": { ar: "معاينة الدفع", en: "Checkout Preview" },
  "checkoutPreview.description": { ar: "معاينة وتخصيص نموذج الدفع", en: "Preview and customize checkout form" },

  // Page Builder
  "pageBuilder.title": { ar: "بناء الصفحات", en: "Page Builder" },
  "pageBuilder.description": { ar: "بناء وتخصيص أقسام صفحة المنتج", en: "Build and customize product page sections" },

  // Language
  "lang.switch": { ar: "English", en: "العربية" },
  "lang.current": { ar: "العربية", en: "English" },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("app-lang");
    return (saved === "en" || saved === "ar") ? saved : "ar";
  });

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem("app-lang", newLang);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const t = useCallback((key: string): string => {
    return translations[key]?.[lang] ?? key;
  }, [lang]);

  const dir = lang === "ar" ? "rtl" as const : "ltr" as const;
  const isRtl = lang === "ar";

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
