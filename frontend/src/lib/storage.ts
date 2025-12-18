// Local storage persistence layer for admin data

const STORAGE_KEYS = {
  SITE_SETTINGS: 'admin_site_settings',
  ABOUT: 'admin_about',
  SKILLS: 'admin_skills',
  PROJECTS: 'admin_projects',
  POSTS: 'admin_posts',
  AUTH: 'admin_token',
} as const;

export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}

export { STORAGE_KEYS };
