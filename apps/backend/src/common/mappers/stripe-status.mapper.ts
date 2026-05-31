import Stripe from 'stripe';
import { StripeAccountStatus } from '@dab/shared';

/**
 * Maps Stripe Account → internal StripeAccountStatus
 * This is a PURE function (no DB, no services, no side effects)
 */
export class StripeStatusMapper {
    static map(account: Stripe.Account): StripeAccountStatus {
        const req = account.requirements;

        const isRestricted =
            !!req?.disabled_reason ||
            !!req?.currently_due ||
            !!req?.past_due;

        if (isRestricted) {
            return StripeAccountStatus.RESTRICTED;
        } else if (account.charges_enabled && account.payouts_enabled) {
            return StripeAccountStatus.ACTIVE;
        } else if (account.details_submitted) {
            return StripeAccountStatus.PENDING;
        } else {
            return StripeAccountStatus.ONBOARDING;
        }
    }
}