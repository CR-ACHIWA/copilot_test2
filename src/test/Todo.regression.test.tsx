/**
 * Todoアプリのリグレッションテスト（コア機能の動作確認）
 * @author CR-ACHIWA
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TodoApp from '../Todo'

const mockMembers = [
  { id: 1, name: '山田 太郎' },
  { id: 2, name: '佐藤 花子' },
  { id: 3, name: '鈴木 次郎' }
]

describe('リグレッションテスト: コア機能', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockMembers),
      })
    ) as any
  })

  it('コア機能: アプリが正常にレンダリングされる', () => {
    render(<TodoApp />)

    expect(screen.getByText('カンバンボード')).toBeInTheDocument()
    expect(screen.getByText('新しいタスクを追加')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('やることを入力')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '追加' })).toBeInTheDocument()
  })

  it('コア機能: 3つのステータスカラムが表示される', () => {
    render(<TodoApp />)

    expect(screen.getByText(/TODO \(0\)/)).toBeInTheDocument()
    expect(screen.getByText(/PROGRESS \(0\)/)).toBeInTheDocument()
    expect(screen.getByText(/DONE \(0\)/)).toBeInTheDocument()
  })

  it('コア機能: 担当者データが読み込まれて表示される', async () => {
    render(<TodoApp />)

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
      expect(screen.getByText('佐藤 花子')).toBeInTheDocument()
      expect(screen.getByText('鈴木 次郎')).toBeInTheDocument()
    })
  })

  it('コア機能: Todoの追加と表示が正常に動作する', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    // Todoを追加
    const input = screen.getByPlaceholderText('やることを入力')
    await user.type(input, 'リグレッションテスト用タスク')

    const checkbox = screen.getByLabelText('山田 太郎')
    await user.click(checkbox)

    const addButton = screen.getByRole('button', { name: '追加' })
    await user.click(addButton)

    // Todoが表示される
    expect(screen.getByText('リグレッションテスト用タスク')).toBeInTheDocument()
    expect(screen.getByText(/担当: 山田 太郎/)).toBeInTheDocument()
    expect(screen.getByText(/TODO \(1\)/)).toBeInTheDocument()
  })

  it('コア機能: カンバンボードのステータス移動が正常に動作する', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    // Todoを追加
    const input = screen.getByPlaceholderText('やることを入力')
    await user.type(input, 'ステータス移動テスト')
    const checkbox = screen.getByLabelText('山田 太郎')
    await user.click(checkbox)
    const addButton = screen.getByRole('button', { name: '追加' })
    await user.click(addButton)

    // TODO → PROGRESS
    const progressButton = screen.getByRole('button', { name: '→ PROGRESS' })
    await user.click(progressButton)
    expect(screen.getByText(/PROGRESS \(1\)/)).toBeInTheDocument()
    expect(screen.getByText(/TODO \(0\)/)).toBeInTheDocument()

    // PROGRESS → DONE
    const doneButton = screen.getByRole('button', { name: '→ DONE' })
    await user.click(doneButton)
    expect(screen.getByText(/DONE \(1\)/)).toBeInTheDocument()
    expect(screen.getByText(/PROGRESS \(0\)/)).toBeInTheDocument()
  })

  it('コア機能: ステータス選択が正常に動作する', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    const statusSelect = screen.getByRole('combobox') as HTMLSelectElement

    // 初期値はTODO
    expect(statusSelect.value).toBe('TODO')

    // PROGRESSに変更
    await user.selectOptions(statusSelect, 'PROGRESS')
    expect(statusSelect.value).toBe('PROGRESS')

    // DONEに変更
    await user.selectOptions(statusSelect, 'DONE')
    expect(statusSelect.value).toBe('DONE')
  })

  it('コア機能: 複数担当者選択が正常に動作する', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('やることを入力')
    await user.type(input, '複数担当者テスト')

    // 複数の担当者を選択
    await user.click(screen.getByLabelText('山田 太郎'))
    await user.click(screen.getByLabelText('佐藤 花子'))
    await user.click(screen.getByLabelText('鈴木 次郎'))

    const addButton = screen.getByRole('button', { name: '追加' })
    await user.click(addButton)

    // すべての担当者が表示される
    expect(screen.getByText(/担当: 山田 太郎, 佐藤 花子, 鈴木 次郎/)).toBeInTheDocument()
  })

  it('コア機能: 入力フィールドのクリアが正常に動作する', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('やることを入力')
    const checkbox = screen.getByLabelText('山田 太郎') as HTMLInputElement

    // 入力
    await user.type(input, 'クリアテスト')
    await user.click(checkbox)

    // 追加
    const addButton = screen.getByRole('button', { name: '追加' })
    await user.click(addButton)

    // クリアされていることを確認
    expect(input).toHaveValue('')
    expect(checkbox.checked).toBe(false)
  })

  it('コア機能: バリデーションが正常に動作する', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    const addButton = screen.getByRole('button', { name: '追加' })

    // 初期状態: 無効
    expect(addButton).toBeDisabled()

    // テキストのみ入力: 無効
    const input = screen.getByPlaceholderText('やることを入力')
    await user.type(input, 'テスト')
    expect(addButton).toBeDisabled()

    // 担当者も選択: 有効
    const checkbox = screen.getByLabelText('山田 太郎')
    await user.click(checkbox)
    expect(addButton).not.toBeDisabled()

    // テキストをクリア: 無効
    await user.clear(input)
    expect(addButton).toBeDisabled()
  })
})

describe('リグレッションテスト: エンドツーエンドシナリオ', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockMembers),
      })
    ) as any
  })

  it('E2Eシナリオ: 完全なワークフロー（Todo追加からDONEまで）', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    // 1. 担当者データの読み込み待機
    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    // 2. Todoを追加
    const input = screen.getByPlaceholderText('やることを入力')
    await user.type(input, 'E2Eテストタスク')

    const checkbox = screen.getByLabelText('山田 太郎')
    await user.click(checkbox)

    const addButton = screen.getByRole('button', { name: '追加' })
    await user.click(addButton)

    // 3. TODOカラムに追加されたことを確認
    expect(screen.getByText('E2Eテストタスク')).toBeInTheDocument()
    expect(screen.getByText(/TODO \(1\)/)).toBeInTheDocument()

    // 4. PROGRESSに移動
    const progressButton = screen.getByRole('button', { name: '→ PROGRESS' })
    await user.click(progressButton)
    expect(screen.getByText(/PROGRESS \(1\)/)).toBeInTheDocument()

    // 5. DONEに移動
    const doneButton = screen.getByRole('button', { name: '→ DONE' })
    await user.click(doneButton)
    expect(screen.getByText(/DONE \(1\)/)).toBeInTheDocument()

    // 6. タスクが表示されたまま
    expect(screen.getByText('E2Eテストタスク')).toBeInTheDocument()
    expect(screen.getByText(/担当: 山田 太郎/)).toBeInTheDocument()
  })

  it('E2Eシナリオ: 複数のTodoを異なるステータスで管理', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('やることを入力')
    const checkbox = screen.getByLabelText('山田 太郎')
    const addButton = screen.getByRole('button', { name: '追加' })
    const statusSelect = screen.getByRole('combobox')

    // TODOを2つ追加
    await user.selectOptions(statusSelect, 'TODO')
    await user.type(input, 'TODOタスク1')
    await user.click(checkbox)
    await user.click(addButton)

    await user.type(input, 'TODOタスク2')
    await user.click(checkbox)
    await user.click(addButton)

    // PROGRESSを1つ追加
    await user.selectOptions(statusSelect, 'PROGRESS')
    await user.type(input, 'PROGRESSタスク1')
    await user.click(checkbox)
    await user.click(addButton)

    // DONEを1つ追加
    await user.selectOptions(statusSelect, 'DONE')
    await user.type(input, 'DONEタスク1')
    await user.click(checkbox)
    await user.click(addButton)

    // 各カラムの件数を確認
    expect(screen.getByText(/TODO \(2\)/)).toBeInTheDocument()
    expect(screen.getByText(/PROGRESS \(1\)/)).toBeInTheDocument()
    expect(screen.getByText(/DONE \(1\)/)).toBeInTheDocument()

    // すべてのタスクが表示される
    expect(screen.getByText('TODOタスク1')).toBeInTheDocument()
    expect(screen.getByText('TODOタスク2')).toBeInTheDocument()
    expect(screen.getByText('PROGRESSタスク1')).toBeInTheDocument()
    expect(screen.getByText('DONEタスク1')).toBeInTheDocument()
  })

  it('E2Eシナリオ: 複数担当者でのTodo管理', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('やることを入力')
    const addButton = screen.getByRole('button', { name: '追加' })

    // タスク1: 山田さんのみ
    await user.type(input, '山田さんのタスク')
    await user.click(screen.getByLabelText('山田 太郎'))
    await user.click(addButton)

    // タスク2: 佐藤さんのみ
    await user.type(input, '佐藤さんのタスク')
    await user.click(screen.getByLabelText('佐藤 花子'))
    await user.click(addButton)

    // タスク3: 山田さんと佐藤さん
    await user.type(input, '共同タスク')
    await user.click(screen.getByLabelText('山田 太郎'))
    await user.click(screen.getByLabelText('佐藤 花子'))
    await user.click(addButton)

    // 各タスクが正しい担当者で表示される
    expect(screen.getByText(/担当: 山田 太郎$/)).toBeInTheDocument()
    expect(screen.getByText(/担当: 佐藤 花子$/)).toBeInTheDocument()
    expect(screen.getByText(/担当: 山田 太郎, 佐藤 花子/)).toBeInTheDocument()
  })

  it('E2Eシナリオ: ステータス間の往復移動', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    // Todoを追加
    const input = screen.getByPlaceholderText('やることを入力')
    await user.type(input, '往復移動テスト')
    await user.click(screen.getByLabelText('山田 太郎'))
    await user.click(screen.getByRole('button', { name: '追加' }))

    // TODO → PROGRESS → DONE
    await user.click(screen.getByRole('button', { name: '→ PROGRESS' }))
    expect(screen.getByText(/PROGRESS \(1\)/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '→ DONE' }))
    expect(screen.getByText(/DONE \(1\)/)).toBeInTheDocument()

    // DONE → TODO (巻き戻し)
    await user.click(screen.getByRole('button', { name: '→ TODO' }))
    expect(screen.getByText(/TODO \(1\)/)).toBeInTheDocument()
    expect(screen.getByText(/DONE \(0\)/)).toBeInTheDocument()

    // タスクは残っている
    expect(screen.getByText('往復移動テスト')).toBeInTheDocument()
  })
})
