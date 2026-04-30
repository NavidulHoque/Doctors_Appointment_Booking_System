import { Injectable } from '@nestjs/common';

import type { SupabaseClient } from '@dab/supabase';
import { createAdminClient } from '@dab/supabase';

import { EnvService } from '@dab/backend/modules/config/env.service';

// auth-only admin client — used for token validation and user management
@Injectable()
export class SupabaseService {
	readonly admin: SupabaseClient;

	constructor(private readonly env: EnvService) {
		this.admin = createAdminClient({
			url: this.env.supabaseUrl,
			key: this.env.supabaseSecretKey,
		});
	}
}
