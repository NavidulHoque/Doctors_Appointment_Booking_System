import { Controller, Headers, HttpCode, HttpStatus, Post, RawBodyRequest, Req } from '@nestjs/common';
import {
	ApiBadRequestResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { WebhookService } from '@backend/modules/webhook/webhook.service';
import { Public } from '@backend/common/decorators/public.decorator';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhookController {
	constructor(private readonly webhookService: WebhookService) {}

	@Public()
	@Post('stripe')
	@HttpCode(HttpStatus.OK)
	@ApiOperation({ summary: 'Stripe webhook receiver' })
	@ApiOkResponse({ description: 'Event acknowledged' })
	@ApiBadRequestResponse({ description: 'Invalid signature or unrecognised event type' })
	async stripeWebhook(
		@Req() req: RawBodyRequest<FastifyRequest>,
		@Headers('stripe-signature') signature: string,
	) {
		await this.webhookService.handleStripeEvent(req.rawBody as Buffer, signature);
		return { received: true };
	}
}
