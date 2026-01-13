/**
 * Supabase Migration Script
 * Migrates all data from one Supabase project to another
 */

import { createClient } from '@supabase/supabase-js';

// Source project (current)
const SOURCE_URL = 'https://ukwhwdjytjaxhzsoshzo.supabase.co';
const SOURCE_SERVICE_KEY = process.env.SOURCE_SERVICE_KEY;

// Destination project (new)
const DEST_URL = 'https://gdugovqkigplttcvmoqy.supabase.co';
const DEST_SERVICE_KEY = process.env.DEST_SERVICE_KEY;

// Tables to migrate (in order to respect foreign key constraints)
const TABLES_TO_MIGRATE = [
    'promotions',           // No foreign keys
    'external_calendars',   // No foreign keys
    'user_roles',           // No foreign keys
    'reservations',         // References promotions
    'payment_logs',         // References reservations
    'external_blocked_dates' // References external_calendars
];

async function migrateTable(sourceClient, destClient, tableName) {
    console.log(`\n📦 Migrating table: ${tableName}`);

    // Fetch all data from source
    const { data: sourceData, error: fetchError } = await sourceClient
        .from(tableName)
        .select('*');

    if (fetchError) {
        console.error(`❌ Error fetching ${tableName}:`, fetchError.message);
        return { table: tableName, success: false, error: fetchError.message };
    }

    if (!sourceData || sourceData.length === 0) {
        console.log(`⚠️  No data in ${tableName}`);
        return { table: tableName, success: true, count: 0 };
    }

    console.log(`   Found ${sourceData.length} records`);

    // Insert data into destination (in batches of 100)
    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < sourceData.length; i += batchSize) {
        const batch = sourceData.slice(i, i + batchSize);

        const { error: insertError } = await destClient
            .from(tableName)
            .upsert(batch, { onConflict: 'id' });

        if (insertError) {
            console.error(`❌ Error inserting batch in ${tableName}:`, insertError.message);
            return { table: tableName, success: false, error: insertError.message, insertedCount };
        }

        insertedCount += batch.length;
        console.log(`   Inserted ${insertedCount}/${sourceData.length} records`);
    }

    console.log(`✅ Successfully migrated ${tableName}: ${insertedCount} records`);
    return { table: tableName, success: true, count: insertedCount };
}

async function main() {
    console.log('🚀 Starting Supabase Migration');
    console.log('================================');
    console.log(`Source: ${SOURCE_URL}`);
    console.log(`Destination: ${DEST_URL}`);
    console.log('');

    if (!SOURCE_SERVICE_KEY || !DEST_SERVICE_KEY) {
        console.error('❌ Error: Missing service keys');
        console.log('Please set environment variables:');
        console.log('  SOURCE_SERVICE_KEY=your_source_service_role_key');
        console.log('  DEST_SERVICE_KEY=your_destination_service_role_key');
        process.exit(1);
    }

    // Create clients with service role keys (bypasses RLS)
    const sourceClient = createClient(SOURCE_URL, SOURCE_SERVICE_KEY, {
        auth: { persistSession: false }
    });

    const destClient = createClient(DEST_URL, DEST_SERVICE_KEY, {
        auth: { persistSession: false }
    });

    // Test connections
    console.log('Testing connections...');

    const { error: sourceError } = await sourceClient.from('reservations').select('count', { count: 'exact', head: true });
    if (sourceError) {
        console.error('❌ Cannot connect to source database:', sourceError.message);
        process.exit(1);
    }
    console.log('✅ Source database connected');

    const { error: destError } = await destClient.from('reservations').select('count', { count: 'exact', head: true });
    if (destError) {
        console.error('❌ Cannot connect to destination database:', destError.message);
        console.log('Note: Make sure the tables exist in the destination database.');
        console.log('You may need to run the migrations first.');
        process.exit(1);
    }
    console.log('✅ Destination database connected');

    // Migrate each table
    const results = [];
    for (const table of TABLES_TO_MIGRATE) {
        const result = await migrateTable(sourceClient, destClient, table);
        results.push(result);
    }

    // Summary
    console.log('\n================================');
    console.log('📊 Migration Summary');
    console.log('================================');

    let totalRecords = 0;
    let successCount = 0;

    for (const result of results) {
        const status = result.success ? '✅' : '❌';
        const count = result.count !== undefined ? result.count : 'N/A';
        console.log(`${status} ${result.table}: ${count} records`);

        if (result.success) {
            successCount++;
            totalRecords += result.count || 0;
        }
    }

    console.log('');
    console.log(`Total: ${totalRecords} records migrated`);
    console.log(`Tables: ${successCount}/${TABLES_TO_MIGRATE.length} successful`);

    if (successCount === TABLES_TO_MIGRATE.length) {
        console.log('\n🎉 Migration completed successfully!');
    } else {
        console.log('\n⚠️  Migration completed with errors. Check the logs above.');
    }
}

main().catch(console.error);
