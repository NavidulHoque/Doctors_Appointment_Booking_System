import { ForbiddenException, Injectable } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { PrismaService } from 'src/prisma';

@Injectable()
export class PaymentService {
  constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService
  ) { }

  async createPaymentSession(appointmentId: string, userId: string, amount: number) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        doctor: {
          include: {
            doctor: {
              select: {
                stripeAccountId: true,
                isStripeAccountActive: true
              }
            }
          }
        }
      }
    });

    const doctorInfo = appointment?.doctor?.doctor;

    const stripeAccountId = doctorInfo?.stripeAccountId;
    const isStripeAccountActive = doctorInfo?.isStripeAccountActive;

    if (!stripeAccountId) {
      throw new ForbiddenException("Doctor has no stripe account, you cannot pay for this appointment online");
    }

    if (!isStripeAccountActive) {
      throw new ForbiddenException("Doctor's stripe account not activated, you cannot pay for this appointment online");
    }

    const session = await this.stripeService.createCheckoutSession(amount, appointmentId, stripeAccountId);

    await this.prisma.payment.create({
      data: {
        userId,
        appointmentId,
        amount,
        transactionId: session.id
      },
    });

    return {
      data: {
        url: session.url,
        sessionId: session.id
      },
      message: 'Payment session created successfully',
    };
  }

  async getAllPaymentHistory(status: string | undefined, page: number, limit: number, userId: string) {

    const query: any = status ? { status: status.toUpperCase(), userId } : { userId }
    const skip = (page - 1) * limit

    const [payments, totalPayments] = await this.prisma.$transaction([

      this.prisma.payment.findMany({
        where: query,
        select: {
          id: true,
          appointment: {
            select: {
              date: true,
              doctor: {
                select: {
                  fullName: true
                }
              }
            }
          },
          amount: true,
          status: true,
          createdAt: true,
          transactionId: true
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),

      this.prisma.payment.count({
        where: query
      })
    ])

    return {
      data: payments,
      pagination: {
        totalItems: totalPayments,
        totalPages: Math.ceil(totalPayments / limit),
        currentPage: page,
        itemsPerPage: limit
      },
      message: 'Payment history fetched successfully'
    }
  }
}
