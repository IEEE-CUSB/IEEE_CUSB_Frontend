import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getSharedApplicationCv, getSharedApplications } from '@/shared/queries/recruitment/recruitment.api';

export default function SharedApplicationsPage() {
  const { token = '' } = useParams();
  const [selected, setSelected] = useState<any>(null);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['shared-applications', token],
    queryFn: () => getSharedApplications(token),
    enabled: Boolean(token),
    retry: false,
  });

  const openCv = async (applicationId: string) => {
    const blob = await getSharedApplicationCv(token, applicationId);
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  if (isLoading) return <main className="mx-auto max-w-6xl p-8 text-center">Loading applications…</main>;
  if (isError || !data) return <main className="mx-auto max-w-3xl p-8"><h1 className="text-2xl font-semibold">Share link unavailable</h1><p className="mt-2 text-muted-foreground">This link may have expired or been revoked.</p></main>;

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 py-10 sm:p-8">
      <header className="rounded-2xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">Read-only applicant list</p>
        <h1 className="mt-1 text-2xl font-bold">{data.vacancy.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{data.applications.length} applications · link expires {new Date(data.expiresAt).toLocaleString()}</p>
      </header>
      <section className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/40"><tr>{['Applicant', 'Email', 'University', 'Applied', 'Status', 'Details'].map(x => <th key={x} className="px-4 py-3 font-semibold">{x}</th>)}</tr></thead>
          <tbody>{data.applications.map((app: any) => <tr key={app.id} className="border-b border-border last:border-0">
            <td className="px-4 py-3 font-medium">{app.user?.name || 'Unknown'}</td><td className="px-4 py-3">{app.user?.email || '—'}</td><td className="px-4 py-3">{app.user?.university || '—'}</td><td className="px-4 py-3">{new Date(app.created_at).toLocaleDateString()}</td><td className="px-4 py-3">{app.status}</td><td className="px-4 py-3"><button className="text-primary hover:underline" onClick={() => setSelected(app)}>View details</button></td>
          </tr>)}</tbody>
        </table>
        {!data.applications.length && <p className="p-8 text-center text-muted-foreground">No applications for this vacancy.</p>}
      </section>
      {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelected(null)}>
        <section role="dialog" aria-modal="true" className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-background p-6 shadow-xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-bold">{selected.user?.name}</h2><p className="text-sm text-muted-foreground">Application {selected.status} · {new Date(selected.created_at).toLocaleString()}</p></div><button className="text-muted-foreground" onClick={() => setSelected(null)}>Close</button></div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">{[['Email', selected.user?.email], ['Phone', selected.user?.phone], ['University', selected.user?.university], ['Faculty', selected.user?.faculty], ['Academic year', selected.user?.academic_year], ['Major', selected.user?.major], ['Username', selected.user?.username]].map(([label, value]) => <div key={label} className="rounded-xl border border-border p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 break-words">{value || 'Not provided'}</p></div>)}</div>
          {selected.user?.bio && <div className="mt-4 rounded-xl border border-border p-4"><h3 className="font-semibold">About</h3><p className="mt-2 whitespace-pre-wrap text-sm">{selected.user.bio}</p></div>}
          <div className="mt-4 rounded-xl border border-border p-4"><h3 className="font-semibold">CV</h3>{selected.user?.has_cv ? <button className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground" onClick={() => void openCv(selected.id)}>View CV</button> : <p className="mt-2 text-sm text-muted-foreground">No CV uploaded.</p>}</div>
          <div className="mt-4 rounded-xl border border-border p-4"><h3 className="font-semibold">Form responses</h3>{selected.extra_data && Object.keys(selected.extra_data).length ? <div className="mt-3 space-y-3">{Object.entries(selected.extra_data).map(([question, answer]) => <div key={question} className="rounded-lg bg-muted/40 p-3"><p className="font-medium">{question}</p>{typeof answer === 'string' && /^https?:\/\//i.test(answer) ? <a className="mt-1 block break-all text-sm text-primary underline" href={answer} target="_blank" rel="noreferrer">{answer}</a> : <p className="mt-1 break-words text-sm">{Array.isArray(answer) ? answer.join(', ') : String(answer ?? '—')}</p>}</div>)}</div> : <p className="mt-2 text-sm text-muted-foreground">No form responses.</p>}</div>
        </section>
      </div>}
    </main>
  );
}
