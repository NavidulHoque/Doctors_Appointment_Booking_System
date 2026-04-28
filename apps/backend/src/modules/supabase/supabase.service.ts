import { Injectable } from '@nestjs/common';
import type { SupabaseClient } from '@dab/supabase';
import { createAdminClient, createAnonClient } from '@dab/supabase';
import { EnvService } from '@backend/modules/config/env.service';

@Injectable()
export class SupabaseService {
	readonly admin: SupabaseClient;
	readonly anon: SupabaseClient;

	constructor(private readonly env: EnvService) {
		this.admin = createAdminClient({ url: env.supabaseUrl, key: env.supabaseSecretKey });
		this.anon = createAnonClient({ url: env.supabaseUrl, key: env.supabasePublishableKey });
	}
}
