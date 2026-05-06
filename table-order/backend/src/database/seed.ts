import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'table_order',
  entities: ['src/**/*.entity.ts'],
  synchronize: false,
});

async function seed(): Promise<void> {
  await dataSource.initialize();
  console.log('Database connected.');

  const queryRunner = dataSource.createQueryRunner();

  try {
    // Check if store already exists
    const existingStore = await queryRunner.query(
      `SELECT * FROM stores WHERE identifier = $1`,
      ['store001'],
    );

    if (existingStore.length > 0) {
      console.log('Seed data already exists. Skipping.');
      return;
    }

    // Create store
    const storeResult = await queryRunner.query(
      `INSERT INTO stores (identifier, name, created_at) VALUES ($1, $2, NOW()) RETURNING id`,
      ['store001', '테스트 매장'],
    );
    const storeId = storeResult[0].id;
    console.log(`Store created: store001 (id: ${storeId})`);

    // Create admin user
    const passwordHash = await bcrypt.hash('admin1234', 10);
    const adminResult = await queryRunner.query(
      `INSERT INTO admins (username, password_hash, store_id, login_attempts, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id`,
      ['admin', passwordHash, storeId, 0],
    );
    console.log(`Admin created: admin (id: ${adminResult[0].id})`);

    console.log('\nSeed completed successfully!');
    console.log('  Store: store001 (테스트 매장)');
    console.log('  Admin: admin / admin1234');
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

seed();
