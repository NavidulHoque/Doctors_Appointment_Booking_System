import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@dab/database';
import type { UpdateUserDto } from '@backend/modules/user/dtos/update-user.dto';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private readonly userRepo: Repository<User>,
	) {}

	getUser(user: User) {
		const { fullName, email, phone, gender, birthDate, address, role, avatarImage } = user;
		return {
			data: { fullName, email, phone, gender, birthDate, address, role, avatarImage },
			message: 'User fetched successfully',
		};
	}

	async updateUserActivity(id: string) {
		const user = await this.userRepo.findOne({ where: { id } });
		if (!user) throw new NotFoundException('User not found');

		if (!user.isOnline) {
			throw new ForbiddenException("Cannot update an offline user's last active date");
		}

		await this.userRepo.update({ id }, { isOnline: true, lastActiveAt: new Date() });

		return { message: 'User activity updated successfully' };
	}

	async updateUser(dto: UpdateUserDto, id: string) {
		const updateData: Partial<User> = {};

		if (dto.fullName !== undefined) updateData.fullName = dto.fullName;
		if (dto.phone !== undefined) updateData.phone = dto.phone;
		if (dto.gender !== undefined) updateData.gender = dto.gender;
		if (dto.birthDate !== undefined) updateData.birthDate = new Date(dto.birthDate);
		if (dto.address !== undefined) updateData.address = dto.address;

		await this.userRepo.update({ id }, updateData);
		const updated = await this.userRepo.findOne({ where: { id } });

		return { message: 'User updated successfully', data: updated };
	}

	async deleteUser(user: User) {
		await this.userRepo.delete({ id: user.id });
		return { message: 'User deleted successfully' };
	}
}
