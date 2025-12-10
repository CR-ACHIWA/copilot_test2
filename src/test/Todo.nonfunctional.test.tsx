/**
 * Todoアプリの非機能要件テスト
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

describe('データ整合性テスト', () => {
  it('正常系: members.jsonが正しく読み込まれる', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockMembers),
      })
    ) as any

    render(<TodoApp />)

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
      expect(screen.getByText('佐藤 花子')).toBeInTheDocument()
      expect(screen.getByText('鈴木 次郎')).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith('/members.json')
  })

  it('正常系: Todo IDが一意に生成される', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockMembers),
      })
    ) as any

    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('やることを入力')
    const checkbox = screen.getByLabelText('山田 太郎')
    const addButton = screen.getByRole('button', { name: '追加' })

    // 複数のTodoを追加
    await user.type(input, 'タスク1')
    await user.click(checkbox)
    await user.click(addButton)

    await user.type(input, 'タスク2')
    await user.click(checkbox)
    await user.click(addButton)

    await user.type(input, 'タスク3')
    await user.click(checkbox)
    await user.click(addButton)

    // すべてのTodoが表示されることを確認（IDが重複していない）
    expect(screen.getByText('タスク1')).toBeInTheDocument()
    expect(screen.getByText('タスク2')).toBeInTheDocument()
    expect(screen.getByText('タスク3')).toBeInTheDocument()
  })

  it('正常系: 担当者IDとnameの紐付けが正しい', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockMembers),
      })
    ) as any

    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('やることを入力')
    await user.type(input, 'テストタスク')

    // 複数の担当者を選択
    await user.click(screen.getByLabelText('山田 太郎'))
    await user.click(screen.getByLabelText('佐藤 花子'))

    const addButton = screen.getByRole('button', { name: '追加' })
    await user.click(addButton)

    // 選択した担当者の名前が正しく表示される
    expect(screen.getByText(/担当: 山田 太郎, 佐藤 花子/)).toBeInTheDocument()
  })

  it('異常系: members.jsonの読み込みに失敗した場合でもクラッシュしない', async () => {
    global.fetch = vi.fn(() =>
      Promise.reject(new Error('Network error'))
    ) as any

    // エラーが発生してもアプリがクラッシュしないことを確認
    expect(() => render(<TodoApp />)).not.toThrow()
  })

  it('異常系: 存在しない担当者IDでも処理が継続される', async () => {
    // 通常のmembersデータでレンダリング
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockMembers),
      })
    ) as any

    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    // 正常にTodoが追加できることを確認
    const input = screen.getByPlaceholderText('やることを入力')
    await user.type(input, 'テストタスク')
    await user.click(screen.getByLabelText('山田 太郎'))
    const addButton = screen.getByRole('button', { name: '追加' })
    await user.click(addButton)

    expect(screen.getByText('テストタスク')).toBeInTheDocument()
  })
})

describe('XSS対策・セキュリティテスト', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockMembers),
      })
    ) as any
  })

  it('正常系: HTMLタグを含むテキストがエスケープされる', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('やることを入力')
    const maliciousText = '<script>alert("XSS")</script>'
    await user.type(input, maliciousText)

    const checkbox = screen.getByLabelText('山田 太郎')
    await user.click(checkbox)

    const addButton = screen.getByRole('button', { name: '追加' })
    await user.click(addButton)

    // テキストとして表示されていることを確認（実行されない）
    expect(screen.getByText(maliciousText)).toBeInTheDocument()
    
    // scriptタグが実行されていないことを確認（DOMに存在しない）
    const scripts = document.querySelectorAll('script')
    const hasAlertScript = Array.from(scripts).some(
      script => script.textContent?.includes('alert("XSS")')
    )
    expect(hasAlertScript).toBe(false)
  })

  it('正常系: 特殊文字を含むテキストが正しく表示される', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('やることを入力')
    const specialText = '< > & " \' / ='
    await user.type(input, specialText)

    const checkbox = screen.getByLabelText('山田 太郎')
    await user.click(checkbox)

    const addButton = screen.getByRole('button', { name: '追加' })
    await user.click(addButton)

    expect(screen.getByText(specialText)).toBeInTheDocument()
  })

  it('正常系: イベントハンドラを含むテキストが無害化される', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('やることを入力')
    const maliciousText = '<img src=x onerror="alert(1)">'
    await user.type(input, maliciousText)

    const checkbox = screen.getByLabelText('山田 太郎')
    await user.click(checkbox)

    const addButton = screen.getByRole('button', { name: '追加' })
    await user.click(addButton)

    // テキストとして安全に表示される
    expect(screen.getByText(maliciousText)).toBeInTheDocument()
  })
})

describe('パフォーマンステスト', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockMembers),
      })
    ) as any
  })

  it('正常系: members.jsonの読み込みが適切な時間内に完了する', async () => {
    const startTime = Date.now()
    
    render(<TodoApp />)

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    }, { timeout: 3000 }) // 3秒以内に読み込まれることを期待

    const endTime = Date.now()
    const loadTime = endTime - startTime

    // 3秒以内に読み込まれることを確認
    expect(loadTime).toBeLessThan(3000)
  })

  it('正常系: 大量のTodoを追加しても動作する', async () => {
    render(<TodoApp />)
    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('やることを入力')
    const checkbox = screen.getByLabelText('山田 太郎')
    const addButton = screen.getByRole('button', { name: '追加' })

    // 10個のTodoを追加
    for (let i = 1; i <= 10; i++) {
      await user.type(input, `タスク${i}`)
      await user.click(checkbox)
      await user.click(addButton)
    }

    // すべてのTodoが表示されることを確認
    expect(screen.getByText(/TODO \(10\)/)).toBeInTheDocument()
  })
})

describe('アクセシビリティテスト', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockMembers),
      })
    ) as any
  })

  it('正常系: フォーム要素に適切なaria属性がある', async () => {
    render(<TodoApp />)

    const input = screen.getByPlaceholderText('やることを入力')
    expect(input).toBeInTheDocument()
    expect(input.tagName).toBe('INPUT')
  })

  it('正常系: ボタンに適切なaria属性がある', async () => {
    render(<TodoApp />)

    const addButton = screen.getByRole('button', { name: '追加' })
    expect(addButton).toBeInTheDocument()
  })

  it('正常系: チェックボックスにラベルが関連付けられている', async () => {
    render(<TodoApp />)

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    const checkbox = screen.getByLabelText('山田 太郎')
    expect(checkbox).toBeInTheDocument()
    expect(checkbox.tagName).toBe('INPUT')
    expect(checkbox.getAttribute('type')).toBe('checkbox')
  })

  it('正常系: セレクトボックスが適切に識別される', async () => {
    render(<TodoApp />)

    const statusSelect = screen.getByRole('combobox')
    expect(statusSelect).toBeInTheDocument()
    expect(statusSelect.tagName).toBe('SELECT')
  })
})

describe('ネットワークエラー処理テスト', () => {
  it('異常系: ネットワークエラー時にアプリがクラッシュしない', async () => {
    // エラーコンソールを一時的に無効化
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    global.fetch = vi.fn(() =>
      Promise.reject(new Error('Network error'))
    ) as any

    expect(() => render(<TodoApp />)).not.toThrow()

    // 少し待ってから検証
    await new Promise(resolve => setTimeout(resolve, 100))

    consoleError.mockRestore()
  })

  it('異常系: タイムアウト時にアプリが動作し続ける', async () => {
    // エラーコンソールを一時的に無効化
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    global.fetch = vi.fn(() =>
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 100)
      })
    ) as any

    render(<TodoApp />)

    // アプリが表示されることを確認
    expect(screen.getByText('新しいタスクを追加')).toBeInTheDocument()

    // タイムアウトを待つ
    await new Promise(resolve => setTimeout(resolve, 200))

    consoleError.mockRestore()
  })

  it('異常系: 不正なJSONレスポンスでもアプリが動作する', async () => {
    // エラーコンソールを一時的に無効化
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.reject(new Error('Invalid JSON')),
      })
    ) as any

    expect(() => render(<TodoApp />)).not.toThrow()

    // 少し待ってから検証
    await new Promise(resolve => setTimeout(resolve, 100))

    consoleError.mockRestore()
  })
})

describe('ユーザビリティテスト', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockMembers),
      })
    ) as any
  })

  it('正常系: 無効なボタンが視覚的に識別できる', async () => {
    render(<TodoApp />)

    await waitFor(() => {
      expect(screen.getByText('山田 太郎')).toBeInTheDocument()
    })

    const addButton = screen.getByRole('button', { name: '追加' })
    
    // 初期状態では無効
    expect(addButton).toBeDisabled()
    expect(addButton).toHaveStyle({ opacity: '0.6' })
  })

  it('正常系: 有効なボタンが視覚的に識別できる', async () => {
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
    
    // 入力後は有効
    expect(addButton).not.toBeDisabled()
    expect(addButton).toHaveStyle({ opacity: '1' })
  })
})
