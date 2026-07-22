import { prisma, FeeStructure, Invoice, Payment, FeeType, PaymentStatus } from '@ai-lms/database';

export class AccountsRepository {
  async getFeeStructures(schoolId: string): Promise<FeeStructure[]> {
    return prisma.feeStructure.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createFeeStructure(data: {
    schoolId: string;
    name: string;
    type: FeeType;
    amount: number;
    grade?: number;
    dueDate?: Date;
  }): Promise<FeeStructure> {
    return prisma.feeStructure.create({
      data: {
        schoolId: data.schoolId,
        name: data.name,
        type: data.type,
        amount: data.amount,
        ...(data.grade !== undefined ? { grade: data.grade } : {}),
        ...(data.dueDate ? { dueDate: data.dueDate } : {}),
      },
    });
  }

  async getInvoices(schoolId: string): Promise<Invoice[]> {
    return prisma.invoice.findMany({
      where: { feeStructure: { schoolId } },
      include: {
        feeStructure: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createInvoice(data: {
    feeStructureId: string;
    studentId: string;
    amount: number;
    dueDate: Date;
  }): Promise<Invoice> {
    return prisma.invoice.create({
      data: {
        feeStructureId: data.feeStructureId,
        studentId: data.studentId,
        amount: data.amount,
        dueDate: data.dueDate,
        status: PaymentStatus.PENDING,
      },
    });
  }

  async recordPayment(data: {
    invoiceId: string;
    amount: number;
    method: string;
    transactionId?: string;
  }): Promise<Payment> {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          invoiceId: data.invoiceId,
          amount: data.amount,
          method: data.method,
          ...(data.transactionId ? { transactionId: data.transactionId } : {}),
        },
      });

      await tx.invoice.update({
        where: { id: data.invoiceId },
        data: {
          status: PaymentStatus.PAID,
          paidAt: new Date(),
        },
      });

      return payment;
    });
  }
}

export const accountsRepository = new AccountsRepository();
