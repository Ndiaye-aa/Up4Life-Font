import type { WorkoutRecord } from '../@types/workout'

const escapeHtml = (value: unknown): string =>
  String(value ?? '').replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;'
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '"':
        return '&quot;'
      default:
        return '&#39;'
    }
  })

export const exportWorkoutPdf = (workout: WorkoutRecord, personalName?: string): void => {
  const rows = workout.exercicios
    .map(
      (ex, i) => `
        <tr>
          <td class="num">${i + 1}</td>
          <td>${escapeHtml(ex.nome)}</td>
          <td>${escapeHtml(ex.musculo)}</td>
          <td class="center">${escapeHtml(ex.series)}</td>
          <td class="center">${escapeHtml(ex.repeticoes)}</td>
          <td class="center">${escapeHtml(ex.carga) || '—'}</td>
          <td class="center">${escapeHtml(ex.descanso)}s</td>
        </tr>`,
    )
    .join('')

  const empty = `<tr><td colspan="7" class="empty">Nenhum exercício cadastrado</td></tr>`

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(workout.nome)} — Up4Life</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; padding: 48px; color: #1c1917; background: #fff; }
    header { margin-bottom: 36px; padding-bottom: 24px; border-bottom: 2px solid #f4f4f5; }
    .brand { font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: #7c3aed; font-weight: 700; }
    h1 { font-size: 26px; font-weight: 700; margin-top: 8px; color: #0c0a09; }
    .meta { display: flex; flex-wrap: wrap; gap: 20px; margin-top: 14px; font-size: 13px; color: #78716c; }
    .meta-item { display: flex; flex-direction: column; gap: 2px; }
    .meta-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #a8a29e; }
    .meta-value { font-weight: 600; color: #1c1917; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead tr { background: #f5f3ff; }
    th { padding: 11px 14px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #7c3aed; font-weight: 700; }
    th.center, td.center { text-align: center; }
    td { padding: 11px 14px; border-bottom: 1px solid #f4f4f5; color: #1c1917; }
    td.num { color: #a8a29e; font-size: 12px; font-weight: 600; }
    td.empty { text-align: center; color: #a8a29e; padding: 32px; }
    tbody tr:last-child td { border-bottom: none; }
    .obs { margin-top: 28px; padding: 16px 18px; border-radius: 10px; background: #f5f3ff; border: 1px solid #ede9fe; }
    .obs-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #7c3aed; font-weight: 700; }
    .obs-text { margin-top: 6px; font-size: 13px; line-height: 1.6; color: #1c1917; white-space: pre-wrap; }
    footer { margin-top: 48px; font-size: 11px; color: #a8a29e; display: flex; justify-content: space-between; }
    @media print {
      body { padding: 0; }
      @page { margin: 18mm 20mm; size: A4; }
    }
  </style>
</head>
<body>
  <header>
    <p class="brand">Up4Life</p>
    <h1>${escapeHtml(workout.nome)}</h1>
    <div class="meta">
      <div class="meta-item">
        <span class="meta-label">Aluno</span>
        <span class="meta-value">${escapeHtml(workout.nome_aluno)}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Personal</span>
        <span class="meta-value">${escapeHtml(personalName ?? '—')}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Categoria</span>
        <span class="meta-value">${escapeHtml(workout.categoria)}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Duração estimada</span>
        <span class="meta-value">${escapeHtml(workout.duracao_estimada)}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Criado em</span>
        <span class="meta-value">${new Date(workout.criado_em).toLocaleDateString('pt-BR')}</span>
      </div>
    </div>
  </header>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Exercício</th>
        <th>Músculo</th>
        <th class="center">Séries</th>
        <th class="center">Reps</th>
        <th class="center">Carga</th>
        <th class="center">Descanso</th>
      </tr>
    </thead>
    <tbody>
      ${rows || empty}
    </tbody>
  </table>

  ${workout.observacoes ? `<div class="obs">
    <p class="obs-label">Obs</p>
    <p class="obs-text">${escapeHtml(workout.observacoes)}</p>
  </div>` : ''}

  <footer>
    <span>Up4Life — Planilha de Treino</span>
    <span>Gerado em ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
  </footer>

  <script>window.addEventListener('load', () => window.print())</script>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank')
  if (win) {
    win.addEventListener('afterprint', () => URL.revokeObjectURL(url))
  } else {
    URL.revokeObjectURL(url)
  }
}
