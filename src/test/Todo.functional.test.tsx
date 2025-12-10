/**
 * Todoアプリの機能要件テスト
 * @author CR-ACHIWA
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TodoApp from '../Todo'

// members.jsonのモックデータ
const mockMembers = [
  { id: 1, name: '山田 太郎' },
  { id: 2, name: '佐藤 花子' },
  { id: 3, name: '鈴木 次郎' }
]

describe('Todo追加機能', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockMembers),
      })
    ) as any
  })

  it('正常系: テキストと担当者を選択して追加できる', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('やることを入力')
    await user.type(input, 'テストタスク')

    const checkbox = screen.getByLabelText('山田 太郎')
    await user.click(checkbox)

    const addButton = screen.getByRole('button', { name: '追加' })
    await user.click(addButton)

    expect(screen.getByText('テストタスク')).toBeInTheDocument()
    expect(screen.getByText(/担当: 山田 太郎/)).toBeInTheDocument()
  })

  it('異常系: テキストが空の場合は追加できない', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    const checkbox = screen.getByLabelText('山田 太郎')
    await user.click(checkbox)

    const addButton = screen.getByRole('button', { name: '追加' })
    expect(addButton).toBeDisabled()
  })

  it('異常系: 担当者が未選択の場合は追加できない', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('やることを入力')
    await user.type(input, 'テストタスク')

    const addButton = screen.getByRole('button', { name: '追加' })
    expect(addButton).toBeDisabled()
  })

  it('異常系: 空白文字のみの場合は追加できない', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('やることを入力')
    await user.type(input, '   ')

    const checkbox = screen.getByLabelText('山田 太郎')
    await user.click(checkbox)

    const addButton = screen.getByRole('button', { name: '追加' })
    expect(addButton).toBeDisabled()
  })

  it('正常系: 追加後に入力フィールドと担当者選択がクリアされる', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('やることを入力')
    await user.type(input, 'テストタスク')

    const checkbox = screen.getByLabelText('山田 太郎') as HTMLInputElement
    await user.click(checkbox)

    const addButton = screen.getByRole('button', { name: '追加' })
    await user.click(addButton)

    expect(input).toHaveValue('')
    expect(checkbox.checked).toBe(false)
  })
})

describe('担当者選択機能', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockMembers),
      })
    ) as any
  })

  it('正常系: 複数の担当者を選択できる', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    const checkbox1 = screen.getByLabelText('山田 太郎') as HTMLInputElement
    const checkbox2 = screen.getByLabelText('佐藤 花子') as HTMLInputElement

    await user.click(checkbox1)
    await user.click(checkbox2)

    expect(checkbox1.checked).toBe(true)
    expect(checkbox2.checked).toBe(true)
  })

  it('正常系: 選択した担当者の選択を解除できる', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    const checkbox = screen.getByLabelText('山田 太郎') as HTMLInputElement

    await user.click(checkbox)
    expect(checkbox.checked).toBe(true)

    await user.click(checkbox)
    expect(checkbox.checked).toBe(false)
  })

  it('正常系: 全ての担当者を選択できる', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    const checkboxes = [
      screen.getByLabelText('山田 太郎'),
      screen.getByLabelText('佐藤 花子'),
      screen.getByLabelText('鈴木 次郎')
    ] as HTMLInputElement[]

    for (const checkbox of checkboxes) {
      await user.click(checkbox)
    }

    checkboxes.forEach(checkbox => {
      expect(checkbox.checked).toBe(true)
    })
  })
})

describe('Todoリスト表示機能', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockMembers),
      })
    ) as any
  })

  it('正常系: 追加したTodoが正しく表示される', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('やることを入力')
    await user.type(input, 'テストタスク1')

    const checkbox = screen.getByLabelText('山田 太郎')
    await user.click(checkbox)

    const addButton = screen.getByRole('button', { name: '追加' })
    await user.click(addButton)

    expect(screen.getByText('テストタスク1')).toBeInTheDocument()
  })

  it('正常系: 複数のTodoを追加できる', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    // 1つ目のTodo追加
    const input = screen.getByPlaceholderText('やることを入力')
    await user.type(input, 'タスク1')
    const checkbox1 = screen.getByLabelText('山田 太郎')
    await user.click(checkbox1)
    const addButton = screen.getByRole('button', { name: '追加' })
    await user.click(addButton)

    // 2つ目のTodo追加
    await user.type(input, 'タスク2')
    const checkbox2 = screen.getByLabelText('佐藤 花子')
    await user.click(checkbox2)
    await user.click(addButton)

    expect(screen.getByText('タスク1')).toBeInTheDocument()
    expect(screen.getByText('タスク2')).toBeInTheDocument()
  })

  it('正常系: Todoの件数が表示される', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    // 初期状態
    expect(screen.getByText(/TODO \(0\)/)).toBeInTheDocument()

    // Todo追加
    const input = screen.getByPlaceholderText('やることを入力')
    await user.type(input, 'テストタスク')
    const checkbox = screen.getByLabelText('山田 太郎')
    await user.click(checkbox)
    const addButton = screen.getByRole('button', { name: '追加' })
    await user.click(addButton)

    expect(screen.getByText(/TODO \(1\)/)).toBeInTheDocument()
  })

  it('正常系: 担当者名が正しく表示される', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('やることを入力')
    await user.type(input, 'テストタスク')

    const checkbox1 = screen.getByLabelText('山田 太郎')
    const checkbox2 = screen.getByLabelText('佐藤 花子')
    await user.click(checkbox1)
    await user.click(checkbox2)

    const addButton = screen.getByRole('button', { name: '追加' })
    await user.click(addButton)

    expect(screen.getByText(/担当: 山田 太郎, 佐藤 花子/)).toBeInTheDocument()
  })
})

describe('入力フィールド動作', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockMembers),
      })
    ) as any
  })

  it('正常系: テキスト入力が正しく反映される', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    const input = screen.getByPlaceholderText('やることを入力')
    await user.type(input, 'テストテキスト')

    expect(input).toHaveValue('テストテキスト')
  })

  it('正常系: ステータス選択が正しく動作する', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    const statusSelect = screen.getByRole('combobox') as HTMLSelectElement
    expect(statusSelect.value).toBe('TODO')

    await user.selectOptions(statusSelect, 'PROGRESS')
    expect(statusSelect.value).toBe('PROGRESS')

    await user.selectOptions(statusSelect, 'DONE')
    expect(statusSelect.value).toBe('DONE')
  })

  it('正常系: 選択したステータスでTodoが追加される', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    const statusSelect = screen.getByRole('combobox')
    await user.selectOptions(statusSelect, 'PROGRESS')

    const input = screen.getByPlaceholderText('やることを入力')
    await user.type(input, 'テストタスク')

    const checkbox = screen.getByLabelText('山田 太郎')
    await user.click(checkbox)

    const addButton = screen.getByRole('button', { name: '追加' })
    await user.click(addButton)

    // PROGRESSカラムに追加されていることを確認
    const progressSection = screen.getByText(/PROGRESS \(1\)/).closest('div')
    expect(progressSection).toBeTruthy()
    expect(within(progressSection!).getByText('テストタスク')).toBeInTheDocument()
  })
})

describe('カンバンボード（ステータス移動機能）', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockMembers),
      })
    ) as any
  })

  it('正常系: ボタンクリックでTODOからPROGRESSに移動できる', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    // Todoを追加
    const input = screen.getByPlaceholderText('やることを入力')
    await user.type(input, 'テストタスク')
    const checkbox = screen.getByLabelText('山田 太郎')
    await user.click(checkbox)
    const addButton = screen.getByRole('button', { name: '追加' })
    await user.click(addButton)

    // TODO (1)を確認
    expect(screen.getByText(/TODO \(1\)/)).toBeInTheDocument()

    // PROGRESSに移動
    const moveButton = screen.getByRole('button', { name: '→ PROGRESS' })
    await user.click(moveButton)

    // PROGRESS (1)に移動したことを確認
    expect(screen.getByText(/PROGRESS \(1\)/)).toBeInTheDocument()
    expect(screen.getByText(/TODO \(0\)/)).toBeInTheDocument()
  })

  it('正常系: PROGRESSからDONEに移動できる', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    // PROGRESSステータスでTodoを追加
    const statusSelect = screen.getByRole('combobox')
    await user.selectOptions(statusSelect, 'PROGRESS')

    const input = screen.getByPlaceholderText('やることを入力')
    await user.type(input, 'テストタスク')
    const checkbox = screen.getByLabelText('山田 太郎')
    await user.click(checkbox)
    const addButton = screen.getByRole('button', { name: '追加' })
    await user.click(addButton)

    // DONEに移動
    const moveButton = screen.getByRole('button', { name: '→ DONE' })
    await user.click(moveButton)

    // DONE (1)に移動したことを確認
    expect(screen.getByText(/DONE \(1\)/)).toBeInTheDocument()
    expect(screen.getByText(/PROGRESS \(0\)/)).toBeInTheDocument()
  })

  it('正常系: 複数のステータス間を移動できる', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    // Todoを追加
    const input = screen.getByPlaceholderText('やることを入力')
    await user.type(input, 'テストタスク')
    const checkbox = screen.getByLabelText('山田 太郎')
    await user.click(checkbox)
    const addButton = screen.getByRole('button', { name: '追加' })
    await user.click(addButton)

    // TODO → PROGRESS
    const progressButton = screen.getByRole('button', { name: '→ PROGRESS' })
    await user.click(progressButton)
    expect(screen.getByText(/PROGRESS \(1\)/)).toBeInTheDocument()

    // PROGRESS → DONE
    const doneButton = screen.getByRole('button', { name: '→ DONE' })
    await user.click(doneButton)
    expect(screen.getByText(/DONE \(1\)/)).toBeInTheDocument()

    // DONE → TODO
    const todoButton = screen.getByRole('button', { name: '→ TODO' })
    await user.click(todoButton)
    expect(screen.getByText(/TODO \(1\)/)).toBeInTheDocument()
  })
})
