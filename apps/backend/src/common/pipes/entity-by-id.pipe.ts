import { ArgumentMetadata, Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

const PRIMARY_KEYS: Record<string, string> = {
	doctor: 'userId',
	user: 'id',
	appointment: 'id',
	review: 'id',
	message: 'id',
	notification: 'id',
	payment: 'id'
};

@Injectable()
export class EntityByIdPipe implements PipeTransform {
	constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

	async transform(id: string, metadata: ArgumentMetadata) {
		const entityName = metadata.data;
		if (!entityName || !PRIMARY_KEYS[entityName]) return id;

		const pk = PRIMARY_KEYS[entityName];
		const repo = this.dataSource.getRepository(
			entityName.charAt(0).toUpperCase() + entityName.slice(1),
		);
		const entity = await repo.findOne({ where: { [pk]: id } });

		if (!entity) throw new NotFoundException(`${entityName} not found`);
		return entity;
	}
}
