import { Request, Response } from 'express';
import { FeeType } from '@ai-lms/database';
import { z } from 'zod';

import { accountsService } from './accounts.service';
import { sendSuccess, sendCreated } from '@/shared/utils/response.util';

export class AccountsController {
  async getFeeStructures(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const structures = await accountsService.getFeeStructures(schoolId);
    sendSuccess(res, structures, 'Fee structures retrieved');
  }

  async createFeeStructure(req: Request, res: Response): Promise<void> {
    const schema = z.object({
      name: z.string().min(2),
      type: z.nativeEnum(FeeType),
      amount: z.number().positive(),
      grade: z.number().int().optional(),
      dueDate: z.string().optional(),
    });

    const body = schema.parse(req.body);
    const schoolId = req.user!.schoolId!;

    const structure = await accountsService.createFeeStructure({
      name: body.name,
      type: body.type,
      amount: body.amount,
      schoolId,
      ...(body.grade !== undefined ? { grade: body.grade } : {}),
      ...(body.dueDate ? { dueDate: body.dueDate } : {}),
    });

    sendCreated(res, structure, 'Fee structure created');
  }

  async getInvoices(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const invoices = await accountsService.getInvoices(schoolId);
    sendSuccess(res, invoices, 'Invoices retrieved');
  }

  async createInvoice(req: Request, res: Response): Promise<void> {
    const schema = z.object({
      feeStructureId: z.string().uuid(),
      studentId: z.string().uuid(),
      amount: z.number().positive(),
      dueDate: z.string(),
    });

    const body = schema.parse(req.body);
    const invoice = await accountsService.createInvoice(body);
    sendCreated(res, invoice, 'Invoice issued');
  }

  async recordPayment(req: Request, res: Response): Promise<void> {
    const schema = z.object({
      invoiceId: z.string().uuid(),
      amount: z.number().positive(),
      method: z.string().min(2),
      transactionId: z.string().optional(),
    });

    const body = schema.parse(req.body);
    const payment = await accountsService.recordPayment({
      invoiceId: body.invoiceId,
      amount: body.amount,
      method: body.method,
      ...(body.transactionId ? { transactionId: body.transactionId } : {}),
    });

    sendSuccess(res, payment, 'Payment recorded successfully');
  }

  async generateAiFeeReminder(req: Request, res: Response): Promise<void> {
    const schema = z.object({
      studentName: z.string().min(2),
      amount: z.number().positive(),
      dueDate: z.string(),
    });

    const { studentName, amount, dueDate } = schema.parse(req.body);
    const reminder = await accountsService.generateAiFeeReminder(studentName, amount, dueDate);
    sendSuccess(res, { reminder }, 'AI fee reminder generated');
  }
}

export const accountsController = new AccountsController();
