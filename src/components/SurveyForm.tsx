import { Check, ChevronLeft, Network, Pencil, ShieldCheck, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type Step = 'intro' | 'presence' | 'profile' | 'guest' | 'guestForm' | 'diet' | 'complete'

const emptyEmployee = {
  firstName: '',
  lastName: '',
  name: '',
  role: '',
  department: '',
  email: '',
  phone: '',
  city: '',
}

const steps: Step[] = ['intro', 'presence', 'profile', 'guest', 'guestForm', 'diet', 'complete']

const fieldClass =
  'w-full rounded-[18px] border border-white/10 bg-white/[0.045] px-4 py-3.5 text-[15px] text-white outline-none transition placeholder:text-slate-500 focus:border-[#168cff]/70 focus:bg-[#168cff]/[0.07] focus:shadow-[0_0_0_4px_rgba(22,140,255,0.10)]'

export default function SurveyForm() {
  const [step, setStep] = useState<Step>('intro')
  const [presence, setPresence] = useState('')
  const [guest, setGuest] = useState('')
  const [guestDetails, setGuestDetails] = useState({
    name: '',
    email: '',
    phone: '',
    relationship: '',
  })
  const [diet, setDiet] = useState('')
  const [dietDetails, setDietDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [employee, setEmployee] = useState(emptyEmployee)
  const [isEditingProfile, setIsEditingProfile] = useState(false)

useEffect(() => {
  const params = new URLSearchParams(window.location.search)

  const firstName = params.get('fname') || ''
  const lastName = params.get('lname') || ''

  setEmployee({
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim(),
    email: params.get('email') || '',
    phone: params.get('phone') || '',
    city: params.get('cidade') || '',
    role: params.get('cargo') || '',
    department: params.get('depart') || '',
  })
}, [])

  const stepIndex = Math.max(0, steps.indexOf(step))
  const progress = useMemo(() => ((stepIndex + 1) / steps.length) * 100, [stepIndex])

  const goBack = () => {
    setSubmitError('')
    if (step === 'presence') setStep('intro')
    if (step === 'profile') setStep('presence')
    if (step === 'guest') setStep('profile')
    if (step === 'guestForm') setStep('guest')
    if (step === 'diet') setStep(guest === 'yes' ? 'guestForm' : 'guest')
  }

 const handleSubmit = async (form: HTMLFormElement) => {
  setIsSubmitting(true)
  setSubmitError('')

  try {
    const body = new URLSearchParams(new FormData(form) as never).toString()

    const response = await fetch('/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body,
})

if (!response.ok) throw new Error('Submission failed')

const mailchimpResponse = await fetch('/.netlify/functions/sync-mailchimp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    presence,
    guest,
    dietaryRestrictions: diet,
    dietaryDetails: dietDetails,
    employee,
    guestDetails,
  }),
})

    if (!mailchimpResponse.ok) {
      console.error('Mailchimp sync failed', await mailchimpResponse.text())
    }

    setStep('complete')
  } catch {
    setSubmitError('Nao foi possivel concluir a ligacao. Tenta novamente.')
  } finally {
    setIsSubmitting(false)
  }
}
  return (
    <main className="rsvp-stage">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />
      <div className="signal-grid" />
      <div className="particle-field" />

      <section className="phone-shell" aria-label="Microsoft internal RSVP">
        <div className="orbital-network" aria-hidden="true">
          <div className="network-core" />
          <span className="node node-a" />
          <span className="node node-b" />
          <span className="node node-c" />
          <span className="node node-d" />
        </div>

        <form
          name="microsoft-internal-rsvp"
          method="POST"
          data-netlify="true"
          netlify-honeypot="bot-field"
          className="relative z-10 flex min-h-[760px] flex-col px-5 py-5"
          onSubmit={(event) => {
            event.preventDefault()
            void handleSubmit(event.currentTarget)
          }}
        >
          <input type="hidden" name="form-name" value="microsoft-internal-rsvp" />
          <input type="hidden" name="presence" value={presence} />
          <input type="hidden" name="guest" value={guest} />
          <input type="hidden" name="dietary_restrictions" value={diet} />
          <input type="hidden" name="guest_name" value={guestDetails.name} />
          <input type="hidden" name="guest_email" value={guestDetails.email} />
          <input type="hidden" name="guest_phone" value={guestDetails.phone} />
          <input type="hidden" name="guest_relationship" value={guestDetails.relationship} />
          <input type="hidden" name="dietary_details" value={dietDetails} />
          <input type="hidden" name="employee_name" value={employee.name} />
          <input type="hidden" name="employee_role" value={employee.role} />
          <input type="hidden" name="employee_department" value={employee.department} />
          <input type="hidden" name="employee_email" value={employee.email} />
          <input type="hidden" name="employee_phone" value={employee.phone} />
          <input type="hidden" name="employee_city" value={employee.city} />
          <p className="hidden" style={{ display: 'none' }}>
            <label>
              Do not fill this out: <input name="bot-field" />
            </label>
          </p>

          <header className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-slate-300/80">
            <span>Microsoft | Evento Interno</span>
            <span className="rounded-full border border-[#168cff]/30 bg-[#168cff]/10 px-2.5 py-1 text-[#9fd0ff]">
              Live ID
            </span>
          </header>

          <div className="mt-5 flex items-center gap-3">
            {step !== 'intro' && step !== 'complete' ? (
              <button type="button" className="icon-button" aria-label="Voltar" onClick={goBack}>
                <ChevronLeft size={18} />
              </button>
            ) : (
              <div className="icon-button passive">
                <Network size={17} />
              </div>
            )}
            <div className="h-px flex-1 bg-gradient-to-r from-[#168cff]/70 via-white/20 to-transparent" />
            <span className="text-[11px] font-medium tabular-nums text-slate-400">
              {String(stepIndex + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
            </span>
          </div>

          <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.06]">
            <div className="h-full rounded-full bg-[#168cff] shadow-[0_0_18px_rgba(22,140,255,0.85)] transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>

          <div className="flex flex-1 flex-col justify-end pb-3 pt-10">
            {step === 'intro' && (
              <section className="animate-rise space-y-8">
                <div>
                  <p className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-[#9fd0ff]">
                    <Sparkles size={14} /> Network activation
                  </p>
                  <h1 className="max-w-[12ch] text-[46px] font-semibold uppercase leading-[0.9] tracking-[0.075em] text-white">
                    One Room. One Network.
                  </h1>
                  <p className="mt-5 text-sm font-medium uppercase tracking-[0.32em] text-[#b8dcff]">
                    Every Connection Matters.
                  </p>
                </div>

                <div className="glass-panel">
                  <p>Sistema online.</p>
                  <p>A tua ligacao a rede foi identificada.</p>
                  <p className="mt-4 text-slate-400">Antes da ativacao, precisamos confirmar alguns dados.</p>
                </div>

                <div className="space-y-3">
                  <button type="button" className="primary-action" onClick={() => setStep('presence')}>
                    Iniciar confirmacao
                  </button>
                  <button type="button" className="secondary-action">
                    Mais tarde
                  </button>
                </div>
              </section>
            )}

            {step === 'presence' && (
              <section className="animate-rise space-y-7">
                <PromptKicker label="Presence sync" />
                <div>
                  <h2 className="screen-title">
                    Ola, {employee.firstName}
                    <span className="ml-2 text-[#168cff]">.</span>
                  </h2>
                  <p className="mt-4 text-xl leading-snug text-slate-200">Confirmas a tua presenca no evento?</p>
                </div>
                <div className="space-y-3">
                  <button type="button" className="primary-action" onClick={() => { setPresence('confirmed'); setStep('profile') }}>
                    Sim, confirmo
                  </button>
                  <button type="button" className="choice-action" onClick={() => { setPresence('declined'); setStep('complete') }}>
                    Nao poderei comparecer
                  </button>
                </div>
              </section>
            )}

            {step === 'profile' && (
  <section className="animate-rise space-y-6">
    <PromptKicker label="Identity packet" />
    <h2 className="screen-title">Dados do colaborador</h2>

    {isEditingProfile ? (
      <div className="data-card edit-card">
        <label className="field-label">
          Nome
          <input
            className="field-input"
            value={employee.firstName}
            onChange={(e) =>
              setEmployee({
                ...employee,
                firstName: e.target.value,
                name: `${e.target.value} ${employee.lastName}`.trim(),
              })
            }
          />
        </label>

        <label className="field-label">
          Sobrenome
          <input
            className="field-input"
            value={employee.lastName}
            onChange={(e) =>
              setEmployee({
                ...employee,
                lastName: e.target.value,
                name: `${employee.firstName} ${e.target.value}`.trim(),
              })
            }
          />
        </label>

        <label className="field-label">
          Cargo
          <input
            className="field-input"
            value={employee.role}
            onChange={(e) =>
              setEmployee({ ...employee, role: e.target.value })
            }
          />
        </label>

        <label className="field-label">
          Departamento
          <input
            className="field-input"
            value={employee.department}
            onChange={(e) =>
              setEmployee({ ...employee, department: e.target.value })
            }
          />
        </label>

        <label className="field-label">
          Email
          <input
            className="field-input"
            type="email"
            value={employee.email}
            onChange={(e) =>
              setEmployee({ ...employee, email: e.target.value })
            }
          />
        </label>

        <label className="field-label">
          Telefone
          <input
            className="field-input"
            value={employee.phone}
            onChange={(e) =>
              setEmployee({ ...employee, phone: e.target.value })
            }
          />
        </label>

        <label className="field-label">
          Cidade
          <input
            className="field-input"
            value={employee.city}
            onChange={(e) =>
              setEmployee({ ...employee, city: e.target.value })
            }
          />
        </label>
      </div>
    ) : (
      <div className="data-card">
        {Object.entries({
          Nome: employee.name,
          Cargo: employee.role,
          Departamento: employee.department,
          Email: employee.email,
          Telefone: employee.phone,
          Cidade: employee.city,
        }).map(([label, value]) => (
          <div key={label} className="data-row">
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    )}

    <div className="space-y-3">
      {isEditingProfile ? (
        <>
          <button
            type="button"
            className="primary-action"
            onClick={() => setIsEditingProfile(false)}
          >
            Guardar informacoes
          </button>

          <button
            type="button"
            className="choice-action"
            onClick={() => setIsEditingProfile(false)}
          >
            Cancelar
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            className="primary-action"
            onClick={() => setStep('guest')}
          >
            Os dados estao corretos
          </button>

          <button
            type="button"
            className="choice-action"
            onClick={() => setIsEditingProfile(true)}
          >
            <Pencil size={16} /> Editar informacoes
          </button>
        </>
      )}
    </div>
  </section>
)}

            {step === 'guest' && (
              <section className="animate-rise space-y-7">
                <PromptKicker label="Connection node" />
                <h2 className="screen-title">Pretendes levar acompanhante?</h2>
                <div className="space-y-3">
                  <button type="button" className="primary-action" onClick={() => { setGuest('yes'); setStep('guestForm') }}>
                    Sim
                  </button>
                  <button type="button" className="choice-action" onClick={() => { setGuest('no'); setStep('diet') }}>
                    Nao
                  </button>
                </div>
              </section>
            )}

            {step === 'guestForm' && (
              <section className="animate-rise space-y-5">
                <PromptKicker label="Guest profile" />
                <h2 className="screen-title">Acompanhante</h2>
                <div className="space-y-3">
                  <input className={fieldClass} placeholder="Nome do acompanhante" required={guest === 'yes'} value={guestDetails.name} onChange={(event) => setGuestDetails({ ...guestDetails, name: event.target.value })} />
                  <input className={fieldClass} type="email" placeholder="Email" required={guest === 'yes'} value={guestDetails.email} onChange={(event) => setGuestDetails({ ...guestDetails, email: event.target.value })} />
                  <input className={fieldClass} type="tel" placeholder="Telefone" value={guestDetails.phone} onChange={(event) => setGuestDetails({ ...guestDetails, phone: event.target.value })} />
                  <input className={fieldClass} placeholder="Relacao com o colaborador" value={guestDetails.relationship} onChange={(event) => setGuestDetails({ ...guestDetails, relationship: event.target.value })} />
                </div>
                <button type="button" className="primary-action" onClick={(event) => {
                  if (event.currentTarget.form?.reportValidity()) setStep('diet')
                }}>
                  Continuar
                </button>
              </section>
            )}

            {step === 'diet' && (
              <section className="animate-rise space-y-6">
                <PromptKicker label="Experience settings" />
                <h2 className="screen-title">Tens alguma restricao alimentar?</h2>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" className={diet === 'yes' ? 'primary-action' : 'choice-action'} onClick={() => setDiet('yes')}>
                    Sim
                  </button>
                  <button type="button" className={diet === 'no' ? 'primary-action' : 'choice-action'} onClick={() => setDiet('no')}>
                    Nao
                  </button>
                </div>
                {diet === 'yes' && (
                  <textarea
                    className={`${fieldClass} min-h-28 resize-none`}
                    placeholder="Indica-nos as tuas restricoes."
                    required
                    value={dietDetails}
                    onChange={(event) => setDietDetails(event.target.value)}
                  />
                )}
                {submitError && <p className="text-sm text-[#ffb7b7]">{submitError}</p>}
                <button type="submit" className="primary-action" disabled={!diet || isSubmitting}>
                  {isSubmitting ? 'A sincronizar...' : 'Concluir ligacao'}
                </button>
              </section>
            )}

            {step === 'complete' && (
              <section className="animate-rise space-y-7 text-center">
                <div className="confirmation-mark mx-auto">
                  <Check size={42} />
                </div>
                <div>
                  <h2 className="text-[34px] font-semibold uppercase leading-none tracking-[0.12em] text-white">
                    Ligacao concluida.
                  </h2>
                  <p className="mx-auto mt-6 max-w-[17rem] text-lg leading-relaxed text-slate-300">
                    A tua presenca ira influenciar a experiencia coletiva em tempo real.
                  </p>
                </div>
                <p className="text-xs font-medium uppercase tracking-[0.34em] text-[#9fd0ff]">
                  Every Connection Matters.
                </p>
                <div className="inline-flex items-center justify-center gap-2 rounded-full border border-[#168cff]/25 bg-[#168cff]/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#b8dcff]">
                  <ShieldCheck size={15} /> Network active
                </div>
              </section>
            )}
          </div>
        </form>
      </section>
    </main>
  )
}

function PromptKicker({ label }: { label: string }) {
  return (
    <p className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-[#9fd0ff]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#168cff] shadow-[0_0_12px_rgba(22,140,255,0.95)]" />
      {label}
    </p>
  )
}
