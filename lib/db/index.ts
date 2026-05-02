import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const databaseUrl = process.env.DATABASE_URL
const sql = databaseUrl ? neon(databaseUrl) : null
const realDb = sql ? drizzle(sql, { schema }) : null

type DbType = NonNullable<typeof realDb>

const missingDbProxy = new Proxy(
	{},
	{
		get() {
			throw new Error('DATABASE_URL no esta configurada. Define la variable para habilitar base de datos.')
		},
	}
) as DbType

export const db: DbType = realDb ?? missingDbProxy
export const hasDatabase = Boolean(realDb)
