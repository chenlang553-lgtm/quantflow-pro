import { AccountBalance, Position, Strategy, StrategyStatus, LogEntry } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

type ToggleResponse = { status: StrategyStatus; strategy: Strategy };

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`API 请求失败: ${response.status} ${detail}`);
  }
  return response.json() as Promise<T>;
};

const apiFetch = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, options);
  return handleResponse<T>(response);
};

// 获取账户余额信息
export const getAccountBalance = async (): Promise<AccountBalance> => {
  return apiFetch<AccountBalance>('/account');
};

// 获取当前持仓
export const getPositions = async (): Promise<Position[]> => {
  return apiFetch<Position[]>('/positions');
};

// 获取所有策略
export const getStrategies = async (): Promise<Strategy[]> => {
  return apiFetch<Strategy[]>('/strategies');
};

// 添加新策略 (上传脚本)
export const addStrategy = async (name: string, description: string, file: File): Promise<Strategy> => {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('description', description);
  formData.append('file', file);

  return apiFetch<Strategy>('/strategies', {
    method: 'POST',
    body: formData,
  });
};

// 通过 AI 添加策略 (直接保存代码)
export const saveAIStrategy = async (name: string, description: string, code: string): Promise<Strategy> => {
  return apiFetch<Strategy>('/strategies/ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, description, code }),
  });
};

// 切换策略状态 (启动/停止)
export const toggleStrategyStatus = async (id: string): Promise<StrategyStatus> => {
  const data = await apiFetch<ToggleResponse>(`/strategies/${id}/toggle`, {
    method: 'POST',
  });
  return data.status;
};

// 更新策略调度设置
export const updateStrategySchedule = async (id: string, enabled: boolean, start?: string, end?: string): Promise<Strategy> => {
  return apiFetch<Strategy>(`/strategies/${id}/schedule`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ enabled, startTime: start, endTime: end }),
  });
};

// 获取策略日志
export const getStrategyLogs = async (strategyId: string): Promise<LogEntry[]> => {
  return apiFetch<LogEntry[]>(`/strategies/${strategyId}/logs`);
};
