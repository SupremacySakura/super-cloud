// 活动类型
interface Activity {
  id: number;
  title: string;
  description: string;
  timestamp: number;
  type: 'upload' | 'download' | 'login' | string;
}

// 公告类型
interface Announcement {
  id: number;
  title: string;
  content: string;
  date: string;
  author: string;
  isImportant: boolean;
}

// 系统状态类型
interface SystemStatus {
  uptime: string;
  lastBackup: string;
  serverLoad: string;
}

// 资源统计类型
interface ResourceStats {
  total: number;
  active: number;
  categories: {
    images: number;
    documents: number;
    videos: number;
    others: number;
  };
}

// 用户统计类型
interface UserStats {
  usage: string;
  storage: string;
  recentUploads: number;
}

export type { Activity, Announcement, SystemStatus, ResourceStats, UserStats };