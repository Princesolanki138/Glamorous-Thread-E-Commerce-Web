import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ArrowLeft, Mail, Phone, Calendar, Tag } from 'lucide-react'
import LeadStatusForm from './LeadStatusForm'

const STATUS_COLORS: Record<string, string> = {
  NEW:       'bg-blue-500/10 text-blue-400 border-blue-500/20',
  CONTACTED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  QUALIFIED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  CONVERTED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CLOSED:    'bg-[#1F1F1F] text-[#9CA3AF] border-[#262626]',
}

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const lead = await prisma.lead.findUnique({ where: { id } })
  if (!lead) notFound()

  return (
    <div>
      <Link
        href="/admin/leads"
        className="inline-flex items-center gap-2 text-sm text-[#6B7280] hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={15} />
        Back to Leads
      </Link>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{lead.name}</h1>
          <p className="text-sm text-[#6B7280] mt-1">{lead.subject || 'No subject'}</p>
        </div>
        <span className={`text-[10px] font-medium px-3 py-1.5 rounded-full border uppercase tracking-wider ${STATUS_COLORS[lead.status] ?? ''}`}>
          {lead.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Lead info */}
          <div className="rounded-2xl border border-[#1F1F1F] bg-[#0D0D0D] p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Mail size={16} className="text-[#6B7280] mt-0.5" />
                <div>
                  <p className="text-xs text-[#6B7280] uppercase tracking-wide">Email</p>
                  <p className="text-sm text-white mt-0.5">{lead.email || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={16} className="text-[#6B7280] mt-0.5" />
                <div>
                  <p className="text-xs text-[#6B7280] uppercase tracking-wide">Phone</p>
                  <p className="text-sm text-white mt-0.5">{lead.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Tag size={16} className="text-[#6B7280] mt-0.5" />
                <div>
                  <p className="text-xs text-[#6B7280] uppercase tracking-wide">Source</p>
                  <p className="text-sm text-white mt-0.5">{lead.source.replace(/_/g, ' ')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar size={16} className="text-[#6B7280] mt-0.5" />
                <div>
                  <p className="text-xs text-[#6B7280] uppercase tracking-wide">Received</p>
                  <p className="text-sm text-white mt-0.5">
                    {lead.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="rounded-2xl border border-[#1F1F1F] bg-[#0D0D0D] p-6">
            <p className="text-xs uppercase tracking-widest text-[#6B7280] mb-3">Message</p>
            <p className="text-sm text-[#D1D5DB] whitespace-pre-wrap leading-relaxed">{lead.message}</p>
          </div>
        </div>

        <div>
          <LeadStatusForm leadId={lead.id} initialStatus={lead.status} initialNotes={lead.notes ?? ''} />
        </div>
      </div>
    </div>
  )
}
