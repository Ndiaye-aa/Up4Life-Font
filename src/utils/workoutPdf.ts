import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { WorkoutRecord } from '../@types/workout'

const MARGIN = 14

const renderWorkoutHeader = (doc: jsPDF, workout: WorkoutRecord, personalName?: string): number => {
  doc.setFontSize(10)
  doc.setTextColor(124, 58, 237)
  doc.text('UP4LIFE', MARGIN, 18)

  doc.setFontSize(18)
  doc.setTextColor(12, 10, 9)
  doc.text(workout.nome, MARGIN, 28)

  doc.setFontSize(9)
  doc.setTextColor(120, 113, 108)
  const meta = [
    `Aluno: ${workout.nome_aluno}`,
    `Personal: ${personalName ?? '—'}`,
    `Categoria: ${workout.categoria}`,
    `Duração estimada: ${workout.duracao_estimada}`,
    `Criado em: ${new Date(workout.criado_em).toLocaleDateString('pt-BR')}`,
  ]
  doc.text(meta.join('   ·   '), MARGIN, 36, { maxWidth: 210 - MARGIN * 2 })

  doc.setDrawColor(244, 244, 245)
  doc.line(MARGIN, 42, 210 - MARGIN, 42)

  return 48
}

const renderWorkoutTable = (doc: jsPDF, workout: WorkoutRecord, startY: number): number => {
  const rows = workout.exercicios.map((ex, i) => [
    String(i + 1),
    ex.nome,
    ex.musculo,
    ex.series,
    ex.repeticoes,
    ex.carga || '—',
    ex.descanso ? `${ex.descanso}s` : '—',
  ])

  autoTable(doc, {
    startY,
    head: [['#', 'Exercício', 'Músculo', 'Séries', 'Reps', 'Carga', 'Descanso']],
    body: rows.length > 0 ? rows : [['—', 'Nenhum exercício cadastrado', '', '', '', '', '']],
    margin: { left: MARGIN, right: MARGIN },
    headStyles: { fillColor: [124, 58, 237], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: [28, 25, 23] },
    alternateRowStyles: { fillColor: [250, 250, 251] },
    columnStyles: { 0: { cellWidth: 8 } },
  })

  return (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY
}

const renderWorkoutObservations = (doc: jsPDF, workout: WorkoutRecord, startY: number): void => {
  if (!workout.observacoes) return
  doc.setFontSize(9)
  doc.setTextColor(124, 58, 237)
  doc.text('OBS', MARGIN, startY + 10)
  doc.setFontSize(10)
  doc.setTextColor(28, 25, 23)
  doc.text(doc.splitTextToSize(workout.observacoes, 210 - MARGIN * 2), MARGIN, startY + 16)
}

export const exportWorkoutsPdf = (workouts: WorkoutRecord[], personalName?: string): void => {
  if (workouts.length === 0) return

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  workouts.forEach((workout, index) => {
    if (index > 0) doc.addPage()
    const tableStartY = renderWorkoutHeader(doc, workout, personalName)
    const tableEndY = renderWorkoutTable(doc, workout, tableStartY)
    renderWorkoutObservations(doc, workout, tableEndY)
  })

  const sameStudent = workouts.every((w) => w.id_aluno === workouts[0].id_aluno)
  const fileName =
    workouts.length === 1
      ? `${workouts[0].nome.replace(/[^\w\s-]/g, '').trim() || 'treino'}.pdf`
      : `treinos-${(sameStudent && workouts[0].nome_aluno.replace(/[^\w\s-]/g, '').trim()) || 'up4life'}.pdf`

  doc.save(fileName)
}

export const exportWorkoutPdf = (workout: WorkoutRecord, personalName?: string): void =>
  exportWorkoutsPdf([workout], personalName)
