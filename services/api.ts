import { AccountBalance, Position, Strategy, StrategyStatus, LogEntry } from '../types';

/**
 * 模拟后端 API 服务
 * 在实际生产环境中，这些函数将使用 fetch 或 axios 调用真实的 Python/Node.js 后端接口
 */

// 模拟数据库
let mockStrategies: Strategy[] = [
  {
    id: '1',
    name: '双均线突破策略 (BTC)',
    description: '基于MA5和MA20的金叉死叉进行交易，适用于趋势行情。',
    scriptContent: 'def run(data):\n    # Python script here...',
    status: StrategyStatus.RUNNING,
    scheduleEnabled: false,
    pnl: 1250.40,
    lastRun: new Date().toISOString(),
    createdAt: '2024-05-10T10:00:00Z'
  },
  {
    id: '2',
    name: 'RSI 超买超卖回归',
    description: '当RSI > 70做空，RSI < 30做多，适用于震荡行情。',
    scriptContent: 'def run(data):\n    # Python script here...',
    status: StrategyStatus.STOPPED,
    scheduleEnabled: true,
    startTime: '09:00',
    endTime: '23:00',
    pnl: -320.10,
    createdAt: '2024-05-12T14:30:00Z'
  }
];

// 获取账户余额信息
export const getAccountBalance = async (): Promise<AccountBalance> => {
  await delay(500); // 模拟网络延迟
  return {
    totalWalletBalance: 54320.50,
    unrealizedPNL: 1240.30,
    marginBalance: 55560.80,
    availableBalance: 45000.00
  };
};

// 获取当前持仓
export const getPositions = async (): Promise<Position[]> => {
  await delay(600);
  return [
    {
      symbol: 'BTCUSDT',
      positionSide: 'LONG',
      entryPrice: 62000.50,
      markPrice: 63500.00,
      amount: 0.5,
      leverage: 10,
      unrealizedPNL: 750.00,
      roe: 12.10,
      liquidationPrice: 58000.00
    },
    {
      symbol: 'ETHUSDT',
      positionSide: 'SHORT',
      entryPrice: 3100.00,
      markPrice: 3050.00,
      amount: 10,
      leverage: 20,
      unrealizedPNL: 500.00,
      roe: 16.13,
      liquidationPrice: 3300.00
    }
  ];
};

// 获取所有策略
export const getStrategies = async (): Promise<Strategy[]> => {
  await delay(400);
  return [...mockStrategies];
};

// 添加新策略 (上传脚本)
export const addStrategy = async (name: string, description: string, file: File): Promise<Strategy> => {
  await delay(1000);
  // 在实际后端中，这里会处理文件上传
  const textContent = await file.text();
  
  const newStrategy: Strategy = {
    id: Math.random().toString(36).substr(2, 9),
    name,
    description,
    scriptContent: textContent,
    status: StrategyStatus.STOPPED,
    scheduleEnabled: false,
    pnl: 0,
    createdAt: new Date().toISOString()
  };
  
  mockStrategies.push(newStrategy);
  return newStrategy;
};

// 通过 AI 添加策略 (直接保存代码)
export const saveAIStrategy = async (name: string, description: string, code: string): Promise<Strategy> => {
  await delay(800);
  const newStrategy: Strategy = {
    id: Math.random().toString(36).substr(2, 9),
    name,
    description,
    scriptContent: code,
    status: StrategyStatus.STOPPED,
    scheduleEnabled: false,
    pnl: 0,
    createdAt: new Date().toISOString()
  };
  mockStrategies.push(newStrategy);
  return newStrategy;
};

// 切换策略状态 (启动/停止)
export const toggleStrategyStatus = async (id: string): Promise<StrategyStatus> => {
  await delay(300);
  const strategy = mockStrategies.find(s => s.id === id);
  if (!strategy) throw new Error('Strategy not found');
  
  if (strategy.status === StrategyStatus.RUNNING) {
    strategy.status = StrategyStatus.STOPPED;
  } else {
    strategy.status = StrategyStatus.RUNNING;
    strategy.lastRun = new Date().toISOString();
  }
  return strategy.status;
};

// 更新策略调度设置
export const updateStrategySchedule = async (id: string, enabled: boolean, start?: string, end?: string): Promise<void> => {
  await delay(300);
  const strategy = mockStrategies.find(s => s.id === id);
  if (!strategy) throw new Error('Strategy not found');
  
  strategy.scheduleEnabled = enabled;
  strategy.startTime = start;
  strategy.endTime = end;
  
  if (enabled && strategy.status === StrategyStatus.STOPPED) {
      strategy.status = StrategyStatus.SCHEDULED;
  } else if (!enabled && strategy.status === StrategyStatus.SCHEDULED) {
      strategy.status = StrategyStatus.STOPPED;
  }
};

// 获取策略日志 (模拟)
export const getStrategyLogs = async (strategyId: string): Promise<LogEntry[]> => {
  await delay(200);
  const logs: LogEntry[] = [];
  const baseTime = Date.now();
  
  for (let i = 0; i < 20; i++) {
    const typeRand = Math.random();
    let level: LogEntry['level'] = 'INFO';
    if (typeRand > 0.8) level = 'TRADE';
    else if (typeRand > 0.95) level = 'WARNING';
    
    logs.push({
      id: `${strategyId}-${i}`,
      timestamp: new Date(baseTime - i * 60000).toISOString(),
      level,
      message: getMockLogMessage(level)
    });
  }
  return logs;
};

// 辅助函数：模拟延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 辅助函数：生成模拟日志消息
const getMockLogMessage = (level: string) => {
  switch (level) {
    case 'TRADE': return `执行信号: 买入 BTCUSDT @ ${60000 + Math.floor(Math.random() * 1000)}`;
    case 'WARNING': return 'API 延迟稍高 (450ms)，正在重试...';
    case 'ERROR': return '连接 WebSocket 失败';
    default: return '正在计算指标 MA(20)... 策略心跳正常。';
  }
};
