import AsyncStorage from '@react-native-async-storage/async-storage'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'earning' | 'transaction' | 'machine' | 'system'
  timestamp: Date
  read: boolean
  data?: any
}

const NOTIFICATIONS_KEY = 'peaq_notifications'

export class NotificationService {
  private static instance: NotificationService
  private notifications: Notification[] = []
  private listeners: ((notifications: Notification[]) => void)[] = []

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  async initialize() {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_KEY)
      if (stored) {
        this.notifications = JSON.parse(stored).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }))
      }
    } catch (error) {
      console.error('Failed to load notifications:', error)
    }
  }

  async saveNotifications() {
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(this.notifications))
    } catch (error) {
      console.error('Failed to save notifications:', error)
    }
  }

  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]))
  }

  async addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    }

    this.notifications.unshift(newNotification)
    
    // Keep only last 100 notifications
    if (this.notifications && Array.isArray(this.notifications) && this.notifications.length > 100) {
      console.log('Notifications - truncating array, length:', this.notifications.length);
      this.notifications = this.notifications.filter((_, index) => index < 100);
      console.log('Notifications - after truncation, length:', this.notifications.length);
    }

    await this.saveNotifications()
    this.notifyListeners()
  }

  async markAsRead(id: string) {
    const notification = this.notifications.find(n => n.id === id)
    if (notification) {
      notification.read = true
      await this.saveNotifications()
      this.notifyListeners()
    }
  }

  async markAllAsRead() {
    this.notifications.forEach(n => n.read = true)
    await this.saveNotifications()
    this.notifyListeners()
  }

  async clearAll() {
    this.notifications = []
    await this.saveNotifications()
    this.notifyListeners()
  }

  getNotifications(): Notification[] {
    return [...this.notifications]
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length
  }

  // Specific notification creators
  async createEarningNotification(machineName: string, amount: number) {
    await this.addNotification({
      title: '💰 New Earnings!',
      message: `You earned ${amount.toFixed(3)} PEAQ from ${machineName}`,
      type: 'earning',
      data: { machineName, amount }
    })
  }

  async createTransactionNotification(type: 'success' | 'failed', amount: number, machineName: string) {
    await this.addNotification({
      title: type === 'success' ? '✅ Transaction Complete' : '❌ Transaction Failed',
      message: type === 'success' 
        ? `Successfully paid ${amount} PEAQ to ${machineName}`
        : `Failed to pay ${amount} PEAQ to ${machineName}`,
      type: 'transaction',
      data: { type, amount, machineName }
    })
  }

  async createMachineNotification(machineName: string, status: 'online' | 'offline') {
    await this.addNotification({
      title: status === 'online' ? '🟢 Machine Online' : '🔴 Machine Offline',
      message: `${machineName} is now ${status}`,
      type: 'machine',
      data: { machineName, status }
    })
  }

  async createSystemNotification(title: string, message: string) {
    await this.addNotification({
      title,
      message,
      type: 'system'
    })
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance()
