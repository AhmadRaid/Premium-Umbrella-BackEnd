import { Document, Types } from 'mongoose';

// الواجهة الأساسية للسند
export interface IVoucher extends Document {
  // المعلومات الأساسية
  voucherNumber: string;           // رقم السند (مثال: VOU-1001)
  type: string;                    // نوع السند: 'PAYMENT' | 'RECEIPT'
  amount: number;                  // المبلغ
  date: Date;                      // تاريخ السند
  description: string;             // وصف السند
  
  // معلومات الجهة
  payeeName?: string;             // اسم المستلم (للسند الصرف)
  payerName?: string;             // اسم الدافع (للسند القبض)
  clientId?: Types.ObjectId;      // معرّف العميل (اختياري)
  
  // العلاقات
  branchId: Types.ObjectId;       // معرّف الفرع
  createdBy: Types.ObjectId;      // معرّف منشئ السند
  
  // الحالة
  status: string;                 // حالة السند: 'DRAFT' | 'APPROVED' | 'REJECTED'
  isDeleted: boolean;             // هل تم حذفه؟
  
  // الطابع الزمني
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;               // تاريخ الحذف (إذا تم حذفه)
}

// واجهة لبيانات إنشاء السند
export interface ICreateVoucher {
  type: string;                   // 'PAYMENT' أو 'RECEIPT'
  amount: number;
  date?: Date;
  payeeName?: string;            // للسند الصرف
  payerName?: string;            // للسند القبض
  clientId?: string;             // معرّف العميل (إذا كان مربوطاً بعميل)
  branchId: string;              // معرّف الفرع
  description: string;           // وصف السند
}

// واجهة لبيانات تحديث السند
export interface IUpdateVoucher {
  amount?: number;
  description?: string;
  status?: string;
}

// واجهة لبيانات اعتماد السند
export interface IApproveVoucher {
  notes?: string;
}

// واجهة لبيانات رفض السند
export interface IRejectVoucher {
  reason: string;
}

// واجهة لاستجابة API
export interface IApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// واجهة للإحصائيات
export interface IVoucherStatistics {
  totalPayments: number;         // إجمالي سندات الصرف
  totalReceipts: number;         // إجمالي سندات القبض
  netCashFlow: number;           // صافي التدفق النقدي
  paymentsCount: number;         // عدد سندات الصرف
  receiptsCount: number;         // عدد سندات القبض
}

// واجهة لمعاملات الدفع
export interface IPaymentInfo {
  method?: string;               // طريقة الدفع
  referenceNumber?: string;      // رقم المرجع
  bankName?: string;             // اسم البنك
  accountNumber?: string;        // رقم الحساب
}

// واجهة للبحث والتصفية
export interface IVoucherFilters {
  type?: string;                 // نوع السند
  status?: string;               // الحالة
  startDate?: Date;              // تاريخ البدء
  endDate?: Date;                // تاريخ الانتهاء
  minAmount?: number;            // الحد الأدنى للمبلغ
  maxAmount?: number;            // الحد الأقصى للمبلغ
}

// واجهة للمرفقات (إذا أردت إضافتها لاحقاً)
export interface IAttachment {
  filename: string;              // اسم الملف
  url: string;                   // رابط الملف
  mimetype: string;              // نوع الملف
  size: number;                  // حجم الملف
}

// واجهة لاعتماد السند (إذا أردت توسيعها لاحقاً)
export interface IApproval {
  approverId: Types.ObjectId;    // معرّف الموافق
  role?: string;                 // دور الموافق
  approvedAt: Date;              // تاريخ الموافقة
  notes?: string;                // ملاحظات
}

// واجهة لبيانات العرض في القوائم
export interface IVoucherListItem {
  _id: string;
  voucherNumber: string;
  type: string;
  amount: number;
  date: Date;
  description: string;
  status: string;
  payeeName?: string;
  payerName?: string;
  clientName?: string;           // اسم العميل (إذا كان مربوطاً)
  createdByName?: string;        // اسم منشئ السند
}

// واجهة لبيانات العرض التفصيلية
export interface IVoucherDetails extends IVoucherListItem {
  branchName?: string;           // اسم الفرع
  clientDetails?: {              // تفاصيل العميل
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  };
  createdByDetails?: {           // تفاصيل المنشئ
    _id: string;
    fullName: string;
    role?: string;
  };
  attachments?: IAttachment[];   // المرفقات
}

