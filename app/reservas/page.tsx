import Link from 'next/link'
import type { Metadata } from 'next'
import { db, hasDatabase } from '@/lib/db'
import { reservas, eventos } from '@/lib/db/schema'
import { eq, and, ne, sql, isNull } from 'drizzle-orm'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Reservas — Monkey Restobar',
  description: 'Reserva tu mesa en Monkey Restobar. Terraza gratuita, shows con preventa o celebra tu cumpleaños.',
}

type ReservasSearchParams = {
  tipo?: string
  evento?: string
}

function normalizarTipo(tipo?: string): 'normal' | 'show' | 'cumpleanos' | null {
  if (tipo === 'normal' || tipo === 'show' || tipo === 'cumpleanos') return tipo
  return null
}

export default async function ReservasPage({
  searchParams,
}: {
  searchParams: Promise<ReservasSearchParams>
}) {
  const params = await searchParams
  const tipoPreseleccionado = normalizarTipo(params.tipo)
  const eventoFlyer = params.evento?.trim() || ''

  // Próximo show activo para mostrar en la card
  const [proximoShow] = hasDatabase
    ? await db
        .select()
        .from(eventos)
        .where(and(eq(eventos.activo, true), eq(eventos.tipo, 'regular'), isNull(eventos.deletedAt)))
        .orderBy(eventos.fecha)
        .limit(1)
    : []

  // Cupos restantes del próximo show
  let cuposRestantes: number | null = null
  if (hasDatabase && proximoShow && proximoShow.cuposReserva > 0) {
    const [{ totalPersonas }] = await db
      .select({ totalPersonas: sql<number>`COALESCE(SUM(${reservas.personas}), 0)` })
      .from(reservas)
      .where(and(eq(reservas.eventoId, proximoShow.id), eq(reservas.tipo, 'show'), ne(reservas.estado, 'rechazada')))
    cuposRestantes = Math.max(0, proximoShow.cuposReserva - (Number(totalPersonas) || 0))
  }

  const showSub = proximoShow
    ? proximoShow.precioBase > 0
      ? `$${proximoShow.precioBase.toLocaleString('es-CL')} p/p`
      : 'Gratis'
    : 'Próximamente'

  const showHref = eventoFlyer ? `/reservas/show?evento=${encodeURIComponent(eventoFlyer)}` : '/reservas/show'
  const normalDestacada = tipoPreseleccionado === 'normal'
  const showDestacada = tipoPreseleccionado === 'show'
  const cumpleDestacada = tipoPreseleccionado === 'cumpleanos'

  return (
    <main className="min-h-screen pt-20 pb-safe-bottom bg-zinc-950">
      <div className="max-w-lg mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-4xl mb-3">📋</div>
          <h1 className="font-display text-3xl text-primary uppercase tracking-widest mb-2">
            Reservas
          </h1>
          <p className="text-zinc-400 text-sm">
            Link maestro de reservas. Elige un tipo y completa tus datos.
          </p>
        </div>

        {(tipoPreseleccionado || eventoFlyer) && (
          <div className="mb-4 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-xs sm:text-sm text-zinc-200">
            {tipoPreseleccionado
              ? `Llegaste desde un flyer con preferencia en: ${tipoPreseleccionado === 'normal' ? 'Fin de semana' : tipoPreseleccionado === 'show' ? 'Show' : 'Cumpleaños'}.`
              : 'Llegaste desde un flyer de evento.'}{' '}
            Si necesitas, puedes cambiar de tipo aquí mismo.
          </div>
        )}

        <div className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <p className="text-amber-200 text-xs sm:text-sm leading-relaxed">
            <strong>Importante:</strong> Todas las reservas tienen una tolerancia máxima de 15 minutos desde la hora indicada.
            Pasado ese tiempo, la mesa puede liberarse.
          </p>
        </div>

        {/* Cards */}
        <div className="space-y-4">

          {/* Mesa Normal — Terraza */}
          <Link href="/reservas/normal" className="group block">
            <div
              className={`glass-card rounded-2xl p-5 border hover:border-green-500/40 active:scale-[0.98] transition-all duration-200 ${
                normalDestacada ? 'border-green-500/60 ring-1 ring-green-500/50' : 'border-white/10'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl shrink-0">🏖️</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-display text-lg text-white uppercase tracking-wide">
                      Mesa Normal
                    </h2>
                    <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-0.5 rounded-full uppercase">
                      Gratis
                    </span>
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Reserva de fin de semana para mesa normal. Sin costo, sujeto a disponibilidad.
                    Ingresa nombre, apellido, personas y hora de llegada.
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-green-400 text-sm font-bold">
                    Reservar mesa →
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Show / Evento */}
          <Link href={showHref} className="group block">
            <div
              className={`glass-card rounded-2xl p-5 border hover:border-primary/40 active:scale-[0.98] transition-all duration-200 ${
                showDestacada ? 'border-primary/70 ring-1 ring-primary/60' : 'border-white/10'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl shrink-0">🎫</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-display text-lg text-white uppercase tracking-wide">
                      Reserva de Show
                    </h2>
                    <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full uppercase">
                      {showSub}
                    </span>
                  </div>
                  {proximoShow ? (
                    <>
                      <p className="text-zinc-300 text-sm font-medium">{proximoShow.nombre}</p>
                      <p className="text-zinc-500 text-xs mt-0.5 leading-relaxed">
                        {new Date(proximoShow.fecha).toLocaleDateString('es-CL', {
                          weekday: 'long', day: 'numeric', month: 'long',
                          timeZone: 'America/Santiago',
                        })}
                        {cuposRestantes !== null && cuposRestantes < 20 && (
                          <span className={`ml-2 font-bold ${cuposRestantes < 10 ? 'text-rose-400' : 'text-zinc-400'}`}>
                            · {cuposRestantes} cupos
                          </span>
                        )}
                      </p>
                    </>
                  ) : (
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      Shows con artistas y preventas. Si el show es pagado, debes adjuntar comprobante.
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-1 text-primary text-sm font-bold">
                    Ver shows disponibles →
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Cumpleaños */}
          <Link href="/cumpleanos/nuevo" className="group block">
            <div
              className={`glass-card rounded-2xl p-5 border hover:border-purple-500/40 active:scale-[0.98] transition-all duration-200 ${
                cumpleDestacada ? 'border-purple-500/70 ring-1 ring-purple-500/60' : 'border-white/10'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl shrink-0">🎂</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-display text-lg text-white uppercase tracking-wide">
                      Cumpleaños
                    </h2>
                    <span className="bg-purple-500/20 text-purple-400 text-xs font-bold px-2 py-0.5 rounded-full uppercase">
                      Privado
                    </span>
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Reserva de cumpleaños con revisión administrativa de pago y condiciones.
                    Flujo compatible con correo, QR y validación.
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-purple-400 text-sm font-bold">
                    Organizar celebración →
                  </div>
                </div>
              </div>
            </div>
          </Link>

        </div>

        {/* Footer note */}
        <p className="text-center text-zinc-600 text-xs mt-8 leading-relaxed">
          ¿Dudas? Escríbenos por WhatsApp o preséntate directamente en Monkey Restobar.<br />
          Av. Concha y Toro 1060, Local 3
        </p>

      </div>
    </main>
  )
}
