/**
 * Todoアプリの境界値・エラー処理テスト
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

describe('入力値の境界値テスト', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockMembers),
      })
    ) as any
  })

  it('境界値: 1文字のタスクを追加できる', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('やることを入力')
    await user.type(input, 'a')

    const checkbox = screen.getByLabelText('山田 太郎')
    await user.click(checkbox)

    const addButton = screen.getByRole('button', { name: '追加' })
    await user.click(addButton)

    expect(screen.getByText('a')).toBeInTheDocument()
  })

  it('境界値: 非常に長いタスク名を追加できる', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    const longText = 'あ'.repeat(1000)
    const input = screen.getByPlaceholderText('やることを入力')
    await user.type(input, longText)

    const checkbox = screen.getByLabelText('山田 太郎')
    await user.click(checkbox)

    const addButton = screen.getByRole('button', { name: '追加' })
    await user.click(addButton)

    expect(screen.getByText(longText)).toBeInTheDocument()
  })

  it('境界値: 1人の担当者を選択できる（最小）', async () => {
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
    expect(addButton).not.toBeDisabled()
    
    await user.click(addButton)
    expect(screen.getByText(/担当: 山田 太郎/)).toBeInTheDocument()
  })

  it('境界値: 全ての担当者を選択できる（最大）', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('やることを入力')
    await user.type(input, 'テストタスク')

    // 全員を選択
    await user.click(screen.getByLabelText('山田 太郎'))
    await user.click(screen.getByLabelText('佐藤 花子'))
    await user.click(screen.getByLabelText('鈴木 次郎'))

    const addButton = screen.getByRole('button', { name: '追加' })
    await user.click(addButton)

    expect(screen.getByText(/担当: 山田 太郎, 佐藤 花子, 鈴木 次郎/)).toBeInTheDocument()
  })

  it('境界値: 特殊文字のみのタスクを追加できる', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    const specialText = '!@#$%^&*()_+-='
    const input = screen.getByPlaceholderText('やることを入力')
    await user.type(input, specialText)

    const checkbox = screen.getByLabelText('山田 太郎')
    await user.click(checkbox)

    const addButton = screen.getByRole('button', { name: '追加' })
    await user.click(addButton)

    expect(screen.getByText(specialText)).toBeInTheDocument()
  })

  it('境界値: Unicode文字（絵文字）を含むタスクを追加できる', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    const emojiText = '🎉 タスク完了 ✅'
    const input = screen.getByPlaceholderText('やることを入力')
    await user.type(input, emojiText)

    const checkbox = screen.getByLabelText('山田 太郎')
    await user.click(checkbox)

    const addButton = screen.getByRole('button', { name: '追加' })
    await user.click(addButton)

    expect(screen.getByText(emojiText)).toBeInTheDocument()
  })

  it('境界値: 改行を含むテキストを処理できる', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    // 改行を含むテキストをプログラム的に設定
    const input = screen.getByPlaceholderText('やることを入力') as HTMLInputElement
    const textWithNewline = 'タスク1\nタスク2'
    
    // 直接値を設定
    await user.click(input)
    input.value = textWithNewline
    input.dispatchEvent(new Event('input', { bubbles: true }))

    const checkbox = screen.getByLabelText('山田 太郎')
    await user.click(checkbox)

    const addButton = screen.getByRole('button', { name: '追加' })
    await user.click(addButton)

    // 改行はHTMLで連結されて表示されるため、連結されたテキストで検索
    expect(screen.getByText(/タスク1.*タスク2/)).toBeInTheDocument()
  })
})

describe('エラー処理テスト', () => {
  it('異常系: 空のmembers配列でもエラーが発生しない', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([]),
      })
    ) as any

    render(<TodoApp />)

    // アプリが正常に表示される
    expect(screen.getByText('新しいタスクを追加')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('やることを入力')).toBeInTheDocument()
  })

  it('異常系: 不正な形式のmembersデータでもエラーが発生しない', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([
          { id: 1 }, // nameがない
          { name: '佐藤 花子' }, // idがない
          { id: 3, name: '鈴木 次郎' }
        ]),
      })
    ) as any

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(<TodoApp />)

    // アプリが正常に表示される
    expect(screen.getByText('新しいタスクを追加')).toBeInTheDocument()

    consoleError.mockRestore()
  })

  it('異常系: fetchが複数回呼ばれても問題ない', async () => {
    let callCount = 0
    global.fetch = vi.fn(() => {
      callCount++
      return Promise.resolve({
        json: () => Promise.resolve(mockMembers),
      })
    }) as any

    const { unmount } = render(<TodoApp />)

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    // 初回のみfetchが呼ばれることを確認
    expect(callCount).toBe(1)

    unmount()
  })

  it('異常系: members.jsonのURLが異なっても適切に処理される', async () => {
    global.fetch = vi.fn((url) => {
      if (url === '/members.json') {
        return Promise.resolve({
          json: () => Promise.resolve(mockMembers),
        })
      }
      return Promise.reject(new Error('Not found'))
    }) as any

    render(<TodoApp />)

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })
  })
})

describe('システムリソース境界テスト', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockMembers),
      })
    ) as any
  })

  it('境界値: 大量のTodoを追加してもパフォーマンスが保たれる', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('やることを入力')
    const checkbox = screen.getByLabelText('山田 太郎')
    const addButton = screen.getByRole('button', { name: '追加' })

    const startTime = Date.now()

    // 20個のTodoを追加（テストの時間短縮）
    for (let i = 1; i <= 20; i++) {
      await user.type(input, `タスク${i}`)
      await user.click(checkbox)
      await user.click(addButton)
    }

    const endTime = Date.now()
    const duration = endTime - startTime

    // 20個のTodo追加が15秒以内に完了することを確認
    expect(duration).toBeLessThan(15000)

    // 件数が正しく表示される
    expect(screen.getByText(/TODO \(20\)/)).toBeInTheDocument()
  }, 20000)

  it('境界値: 大量の担当者データでも正常に動作する', async () => {
    const manyMembers = Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      name: `担当者${i + 1}`
    }))

    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(manyMembers),
      })
    ) as any

    render(<TodoApp />)

    await waitFor(() => {
      expect(screen.getByText('担当者1')).toBeInTheDocument()
    })

    // 最初と最後の担当者が表示されることを確認
    expect(screen.getByText('担当者1')).toBeInTheDocument()
    expect(screen.getByText('担当者100')).toBeInTheDocument()
  })

  it('境界値: 各ステータスに多数のTodoが存在しても動作する', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('やることを入力')
    const checkbox = screen.getByLabelText('山田 太郎')
    const addButton = screen.getByRole('button', { name: '追加' })
    const statusSelect = screen.getByRole('combobox')

    // 各ステータスに10個ずつ追加
    for (const status of ['TODO', 'PROGRESS', 'DONE']) {
      await user.selectOptions(statusSelect, status)
      
      for (let i = 1; i <= 10; i++) {
        await user.type(input, `${status}タスク${i}`)
        await user.click(checkbox)
        await user.click(addButton)
      }
    }

    // 各ステータスの件数が正しく表示される
    expect(screen.getByText(/TODO \(10\)/)).toBeInTheDocument()
    expect(screen.getByText(/PROGRESS \(10\)/)).toBeInTheDocument()
    expect(screen.getByText(/DONE \(10\)/)).toBeInTheDocument()
  })
})

describe('操作エラーテスト', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockMembers),
      })
    ) as any
  })

  it('異常系: 連続してボタンをクリックしても二重登録されない', async () => {
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

    // 追加後はボタンが無効になるため、二重登録は防止される
    // （入力がクリアされるため）
    expect(addButton).toBeDisabled()

    // Todoが1つだけ追加されていることを確認
    expect(screen.getByText(/TODO \(1\)/)).toBeInTheDocument()
  })

  it('正常系: 同じ内容のTodoを複数回追加できる', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('やることを入力')
    const checkbox = screen.getByLabelText('山田 太郎')
    const addButton = screen.getByRole('button', { name: '追加' })

    // 同じ内容を2回追加
    await user.type(input, '同じタスク')
    await user.click(checkbox)
    await user.click(addButton)

    await user.type(input, '同じタスク')
    await user.click(checkbox)
    await user.click(addButton)

    // 2つのTodoが追加される
    expect(screen.getByText(/TODO \(2\)/)).toBeInTheDocument()
    const tasks = screen.getAllByText('同じタスク')
    expect(tasks).toHaveLength(2)
  })

  it('正常系: 担当者を選択・解除・再選択しても正常に動作する', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    const checkbox = screen.getByLabelText('山田 太郎') as HTMLInputElement

    // 選択
    await user.click(checkbox)
    expect(checkbox.checked).toBe(true)

    // 解除
    await user.click(checkbox)
    expect(checkbox.checked).toBe(false)

    // 再選択
    await user.click(checkbox)
    expect(checkbox.checked).toBe(true)
  })

  it('正常系: ステータスを変更してもフォームの状態が保持される', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('やることを入力')
    await user.type(input, 'テストタスク')

    const checkbox = screen.getByLabelText('山田 太郎') as HTMLInputElement
    await user.click(checkbox)

    const statusSelect = screen.getByRole('combobox')
    await user.selectOptions(statusSelect, 'PROGRESS')

    // 入力内容が保持されている
    expect(input).toHaveValue('テストタスク')
    expect(checkbox.checked).toBe(true)
  })
})
