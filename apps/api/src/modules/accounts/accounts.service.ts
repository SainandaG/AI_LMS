import { FeeStructure, Invoice, Payment, FeeType } from '@ai-lms/database';
import { accountsRepository } from './accounts.repository';
import { aiHelpers } from '@/infrastructure/ai/openai.client';
import { logger } from '@/shared/utils/logger';

export class AccountsService {
  async getFeeStructures(schoolId: string): Promise<FeeStructure[]> {
    return accountsRepository.getFeeStructures(schoolId);
  }

  async createFeeStructure(data: {
    schoolId: string;
    name: string;
    type: FeeType;
    amount: number;
    grade?: number;
    dueDate?: string;
  }): Promise<FeeStructure> {
    return accountsRepository.createFeeStructure({
      schoolId: data.schoolId,
      name: data.name,
      type: data.type,
      amount: data.amount,
      ...(data.grade !== undefined ? { grade: data.grade } : {}),
      ...(data.dueDate ? { dueDate: new Date(data.dueDate) } : {}),
    });
  }

  async getInvoices(schoolId: string): Promise<Invoice[]> {
    return accountsRepository.getInvoices(schoolId);
  }

  async createInvoice(data: {
    feeStructureId: string;
    studentId: string;
    amount: number;
    dueDate: string;
  }): Promise<Invoice> {
    return accountsRepository.createInvoice({
      ...data,
      dueDate: new Date(data.dueDate),
    });
  }

  async recordPayment(data: {
    invoiceId: string;
    amount: number;
    method: string;
    transactionId?: string;
  }): Promise<Payment> {
    const payment = await accountsRepository.recordPayment(data);
    logger.info({ invoiceId: data.invoiceId, amount: data.amount }, 'Fee payment recorded');
    return payment;
  }

  async generateAiFeeReminder(studentName: string, amount: number, dueDate: string): Promise<string> {
    const prompt = `Write a polite, professional email fee reminder to parent of student "${studentName}" for pending fee of ₹${amount} due on ${dueDate}. Include clear payment instructions and support contact.`;
    const system = 'You are an AI Communications Assistant for an educational institution accounts department.';
    return aiHelpers.generateCompletion(prompt, system);
  }
}

export const accountsService = new AccountsService();
