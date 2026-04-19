export interface CatalogExercise {
  categoria: 'Compostos' | 'Isolados'
  id: string
  musculo: string
  nome: string
}

export const EXERCISE_CATALOG: CatalogExercise[] = [
  { categoria: 'Compostos', id: '1', musculo: 'Peito', nome: 'Supino Reto com Barra' },
  { categoria: 'Isolados', id: '2', musculo: 'Peito', nome: 'Crucifixo Inclinado' },
  { categoria: 'Isolados', id: '3', musculo: 'Triceps', nome: 'Triceps Pulley' },
  { categoria: 'Isolados', id: '4', musculo: 'Triceps', nome: 'Triceps Frances' },
  { categoria: 'Compostos', id: '5', musculo: 'Quadriceps', nome: 'Agachamento Livre' },
  { categoria: 'Compostos', id: '6', musculo: 'Quadriceps', nome: 'Leg Press 45' },
  { categoria: 'Compostos', id: '7', musculo: 'Costas', nome: 'Remada Curvada' },
  { categoria: 'Compostos', id: '8', musculo: 'Costas', nome: 'Puxada Frente' },
  { categoria: 'Isolados', id: '9', musculo: 'Biceps', nome: 'Rosca Direta' },
  { categoria: 'Compostos', id: '10', musculo: 'Ombros', nome: 'Desenvolvimento Ombro' },
  { categoria: 'Isolados', id: '11', musculo: 'Ombros', nome: 'Elevacao Lateral' },
  { categoria: 'Isolados', id: '12', musculo: 'Quadriceps', nome: 'Cadeira Extensora' },
]
