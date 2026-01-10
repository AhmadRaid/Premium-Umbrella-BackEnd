export enum VoucherType {
  PAYMENT = 'PAYMENT',     // سند صرف
  RECEIPT = 'RECEIPT'      // سند قبض
}

export enum VoucherStatus {
  DRAFT = 'DRAFT',         // مسودة
  PENDING = 'PENDING',     // قيد المراجعة
  APPROVED = 'APPROVED',   // معتمد
  REJECTED = 'REJECTED',   // مرفوض
  CANCELLED = 'CANCELLED', // ملغي
  PAID = 'PAID',          // مدفوع (للسندات الصرف)
  COLLECTED = 'COLLECTED' // محصل (للسندات القبض)
}

export enum PaymentMethod {
  CASH = 'CASH',          // نقدي
  BANK_TRANSFER = 'BANK_TRANSFER', // تحويل بنكي
  CHEQUE = 'CHEQUE',      // شيك
  CREDIT_CARD = 'CREDIT_CARD', // بطاقة ائتمان
  OTHER = 'OTHER'         // أخرى
}

export enum VoucherCategory {
  SALARY = 'SALARY',              // رواتب
  UTILITIES = 'UTILITIES',        // خدمات (كهرباء، ماء)
  PURCHASE = 'PURCHASE',          // مشتريات
  MAINTENANCE = 'MAINTENANCE',    // صيانة
  RENT = 'RENT',                  // إيجار
  TAX = 'TAX',                    // ضرائب
  CLIENT_PAYMENT = 'CLIENT_PAYMENT', // دفعة عميل
  SUPPLIER_PAYMENT = 'SUPPLIER_PAYMENT', // دفعة مورد
  LOAN = 'LOAN',                  // قرض
  INVESTMENT = 'INVESTMENT',      // استثمار
  OTHER = 'OTHER'                 // أخرى
}