// 策略状态枚举
export enum StrategyStatus {
  STOPPED = 'STOPPED',
  RUNNING = 'RUNNING',
  SCHEDULED = 'SCHEDULED', // 在计划时间内运行
  ERROR = 'ERROR'
}

// 策略接口
export interface Strategy {
  id: string;
  name: string;
  description: string;
  scriptContent: string; // Python脚本内容
  status: StrategyStatus;
  scheduleEnabled: boolean;
  startTime?: string; // 格式 "HH:mm"
  endTime?: string;   // 格式 "HH:mm"
  lastRun?: string;
  pnl: number; // 模拟盈亏
  createdAt: string;
}

// 账户余额信息 (U本位)
export interface AccountBalance {
  totalWalletBalance: number; // 钱包余额
  unrealizedPNL: number;      // 未实现盈亏
  marginBalance: number;      // 保证金余额
  availableBalance: number;   // 可用余额
}

// 持仓信息
export interface Position {
  symbol: string;
  positionSide: 'LONG' | 'SHORT' | 'BOTH'; // 币安双向持仓模式
  entryPrice: number;
  markPrice: number;
  amount: number; // 持仓数量
  leverage: number; // 杠杆倍数
  unrealizedPNL: number;
  roe: number; // 回报率
  liquidationPrice: number;
}

// 日志条目
export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'TRADE';
  message: string;
}

// AI 生成结果
export interface AIGeneratedStrategy {
  name: string;
  description: string;
  code: string;
}
