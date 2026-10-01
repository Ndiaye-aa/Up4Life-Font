import { jsPDF } from 'jspdf'
import type { AssessmentRecord } from '../services/assessments'

export const ANAMNESE_QUESTIONS: { key: keyof AssessmentRecord; label: string }[] = [
  { key: 'praticaAtividadeFisica', label: 'Pratica atividade física atualmente' },
  { key: 'fumante', label: 'Fumante' },
  { key: 'consomeAlcool', label: 'Consome bebida alcoólica' },
  { key: 'historicoCardiovascularFamiliar', label: 'Histórico familiar cardiovascular' },
  { key: 'possuiDoencaDiagnosticada', label: 'Possui doença diagnosticada' },
  { key: 'usaMedicamentoContinuo', label: 'Usa medicamento contínuo' },
  { key: 'possuiLesaoOuCirurgia', label: 'Possui lesão ou cirurgia prévia' },
  { key: 'dorArticularOuMuscular', label: 'Sente dor articular ou muscular' },
]

export const ANAMNESE_DESCRIPTIONS: { key: keyof AssessmentRecord; label: string }[] = [
  { key: 'doencaDescricao', label: 'Doença' },
  { key: 'medicamentoDescricao', label: 'Medicamento' },
  { key: 'lesaoDescricao', label: 'Lesão/cirurgia' },
  { key: 'dorDescricao', label: 'Local da dor' },
  { key: 'objetivoTreino', label: 'Objetivo com o treino' },
  { key: 'observacoesAnamnese', label: 'Observações' },
]

export interface AssessmentPdfParams {
  name: string
  date: string
  metrics: { label: string; value: string; unit?: string }[]
  perimetros: { label: string; value: string }[]
  latestAssessment?: AssessmentRecord | null
}

const MARGIN = 14

export const exportAssessmentPdf = ({
  name,
  date,
  metrics,
  perimetros,
  latestAssessment,
}: AssessmentPdfParams): void => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = 18

  doc.setFontSize(10)
  doc.setTextColor(124, 58, 237)
  doc.text('UP4LIFE', MARGIN, y)

  y += 10
  doc.setFontSize(18)
  doc.setTextColor(12, 10, 9)
  doc.text(name, MARGIN, y)

  y += 7
  doc.setFontSize(10)
  doc.setTextColor(120, 113, 108)
  doc.text(`Avaliação de ${date}`, MARGIN, y)

  y += 6
  doc.setDrawColor(244, 244, 245)
  doc.line(MARGIN, y, 210 - MARGIN, y)

  y += 10
  doc.setFontSize(11)
  doc.setTextColor(124, 58, 237)
  doc.text('ÍNDICES', MARGIN, y)
  y += 7
  doc.setFontSize(10)
  doc.setTextColor(28, 25, 23)
  metrics.forEach((m) => {
    doc.text(`${m.label}: ${m.value}${m.unit ?? ''}`, MARGIN, y)
    y += 6
  })

  if (perimetros.length > 0) {
    y += 4
    doc.setFontSize(11)
    doc.setTextColor(124, 58, 237)
    doc.text('PERÍMETROS', MARGIN, y)
    y += 7
    doc.setFontSize(10)
    doc.setTextColor(28, 25, 23)
    perimetros.forEach((p) => {
      doc.text(`${p.label}: ${p.value}`, MARGIN, y)
      y += 6
    })
  }

  const anamneseRows: string[] = []
  if (latestAssessment) {
    ANAMNESE_QUESTIONS.forEach((q) => {
      const value = latestAssessment[q.key]
      if (value != null) {
        anamneseRows.push(`${q.label}: ${value ? 'Sim' : 'Não'}`)
      }
    })
    ANAMNESE_DESCRIPTIONS.forEach((d) => {
      const value = latestAssessment[d.key]
      if (value != null && value !== '') {
        anamneseRows.push(`${d.label}: ${String(value)}`)
      }
    })
  }

  if (anamneseRows.length > 0) {
    y += 4
    doc.setFontSize(11)
    doc.setTextColor(124, 58, 237)
    doc.text('ANAMNESE', MARGIN, y)
    y += 7
    doc.setFontSize(10)
    doc.setTextColor(28, 25, 23)
    anamneseRows.forEach((row) => {
      const lines = doc.splitTextToSize(row, 210 - MARGIN * 2)
      doc.text(lines, MARGIN, y)
      y += 6 * lines.length
    })
  }

  const fileName = `avaliacao-${name.replace(/[^\w\s-]/g, '').trim() || 'up4life'}.pdf`
  doc.save(fileName)
}
