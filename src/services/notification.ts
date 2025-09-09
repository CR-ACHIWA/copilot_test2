export class NotificationService {
  private static hasPermission = false;

  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('このブラウザは通知をサポートしていません');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.hasPermission = true;
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
      return this.hasPermission;
    } catch (error) {
      console.error('通知許可の取得に失敗しました:', error);
      return false;
    }
  }

  static showNotification(title: string, options?: NotificationOptions): void {
    if (!this.hasPermission || Notification.permission !== 'granted') {
      console.warn('通知の許可がありません');
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: 'todo-notification',
        requireInteraction: false,
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      setTimeout(() => {
        notification.close();
      }, 5000);
    } catch (error) {
      console.error('通知の表示に失敗しました:', error);
    }
  }

  static showTodoAssignedNotification(todoText: string, assignerName: string): void {
    this.showNotification('新しいTODOが割り当てられました', {
      body: `「${todoText}」が${assignerName}さんによって作成されました`,
    });
  }

  static showTodoStatusChangedNotification(todoText: string, newStatus: string): void {
    const statusText = {
      'TODO': '未着手',
      'IN_PROGRESS': '進行中',
      'DONE': '完了'
    }[newStatus] || newStatus;

    this.showNotification('TODOステータスが更新されました', {
      body: `「${todoText}」のステータスが「${statusText}」に変更されました`,
    });
  }
}