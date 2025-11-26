import React, { useEffect, useState } from 'react';
import { 
  Play, 
  Pause, 
  Clock, 
  Plus, 
  Terminal, 
  Upload, 
  MoreVertical, 
  Sparkles,
  X,
  FileCode
} from 'lucide-react';
import { getStrategies, toggleStrategyStatus, addStrategy, updateStrategySchedule, saveAIStrategy, getStrategyLogs } from '../services/api';
import { generateStrategyWithAI } from '../services/geminiService';
import { Strategy, StrategyStatus, LogEntry } from '../types';

const Strategies: React.FC = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState<string | null>(null);
  const [viewLogsId, setViewLogsId] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Add Strategy Form State
  const [newStratName, setNewStratName] = useState('');
  const [newStratDesc, setNewStratDesc] = useState('');
  const [newStratFile, setNewStratFile] = useState<File | null>(null);

  // AI Form State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<{name: string, desc: string, code: string} | null>(null);

  // Schedule Form State
  const [scheduleStart, setScheduleStart] = useState('09:00');
  const [scheduleEnd, setScheduleEnd] = useState('17:00');

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      const data = await getStrategies();
      setStrategies(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const newStatus = await toggleStrategyStatus(id);
      setStrategies(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStratFile || !newStratName) return;
    try {
      await addStrategy(newStratName, newStratDesc, newStratFile);
      setShowAddModal(false);
      fetchStrategies();
      // Reset form
      setNewStratName('');
      setNewStratDesc('');
      setNewStratFile(null);
    } catch (e) {
      console.error("Upload failed", e);
    }
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setGeneratedResult(null);
    try {
      const result = await generateStrategyWithAI(aiPrompt);
      setGeneratedResult({
        name: result.name,
        desc: result.description,
        code: result.code
      });
    } catch (e) {
      alert("AI 生成失败，请重试");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAIStrategy = async () => {
    if (!generatedResult) return;
    try {
      await saveAIStrategy(generatedResult.name, generatedResult.desc, generatedResult.code);
      setShowAIModal(false);
      fetchStrategies();
      setGeneratedResult(null);
      setAiPrompt('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSchedule = async () => {
    if (!showScheduleModal) return;
    try {
      await updateStrategySchedule(showScheduleModal, true, scheduleStart, scheduleEnd);
      setShowScheduleModal(null);
      fetchStrategies();
    } catch (e) { console.error(e); }
  };

  const handleDisableSchedule = async (id: string) => {
    try {
      await updateStrategySchedule(id, false);
      fetchStrategies();
    } catch (e) { console.error(e); }
  };

  const handleViewLogs = async (id: string) => {
    setViewLogsId(id);
    setLogs([]); // clear prev logs
    try {
      const logData = await getStrategyLogs(id);
      setLogs(logData);
    } catch (e) { console.error(e); }
  };

  const StatusBadge = ({ status }: { status: StrategyStatus }) => {
    switch (status) {
      case StrategyStatus.RUNNING:
        return <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-500 flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></div>运行中</span>;
      case StrategyStatus.STOPPED:
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-700 text-gray-400">已停止</span>;
      case StrategyStatus.SCHEDULED:
        return <span className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400 flex items-center"><Clock size={10} className="mr-1" />计划中</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">策略管理</h1>
          <p className="text-gray-400 text-sm mt-1">管理您的Python量化脚本，设置自动运行时间。</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowAIModal(true)}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-all shadow-lg shadow-purple-900/20"
          >
            <Sparkles size={18} className="mr-2" />
            AI 智能生成
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <Plus size={18} className="mr-2" />
            上传策略
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-gray-500">加载中...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {strategies.map((strategy) => (
            <div key={strategy.id} className="bg-gray-850 border border-gray-750 rounded-xl p-6 flex flex-col justify-between hover:border-gray-600 transition-all shadow-sm">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-gray-800 rounded-lg">
                    <FileCode size={24} className="text-primary-500" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusBadge status={strategy.status} />
                    <button className="text-gray-500 hover:text-white"><MoreVertical size={16} /></button>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2">{strategy.name}</h3>
                <p className="text-sm text-gray-400 line-clamp-2 h-10">{strategy.description}</p>
                
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block text-xs">总盈亏</span>
                    <span className={`font-mono font-bold ${strategy.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {strategy.pnl >= 0 ? '+' : ''}{strategy.pnl} U
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">最后运行</span>
                    <span className="text-gray-300">{strategy.lastRun ? new Date(strategy.lastRun).toLocaleTimeString() : '-'}</span>
                  </div>
                </div>

                {strategy.scheduleEnabled && (
                   <div className="mt-3 bg-gray-800/50 p-2 rounded border border-gray-750/50 text-xs flex items-center text-purple-300">
                      <Clock size={12} className="mr-2" />
                      <span>计划运行: {strategy.startTime} - {strategy.endTime}</span>
                      <button onClick={() => handleDisableSchedule(strategy.id)} className="ml-auto text-gray-500 hover:text-red-400">
                        <X size={12} />
                      </button>
                   </div>
                )}
              </div>

              <div className="mt-6 flex space-x-2 pt-4 border-t border-gray-750">
                <button 
                  onClick={() => handleToggle(strategy.id)}
                  className={`flex-1 flex items-center justify-center py-2 rounded-lg font-medium transition-colors ${
                    strategy.status === StrategyStatus.RUNNING 
                    ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
                    : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                  }`}
                >
                  {strategy.status === StrategyStatus.RUNNING ? <Pause size={16} className="mr-2" /> : <Play size={16} className="mr-2" />}
                  {strategy.status === StrategyStatus.RUNNING ? '停止' : '启动'}
                </button>
                
                <button 
                  onClick={() => setShowScheduleModal(strategy.id)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-750 rounded-lg"
                  title="定时设置"
                >
                  <Clock size={20} />
                </button>
                
                <button 
                  onClick={() => handleViewLogs(strategy.id)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-750 rounded-lg"
                  title="日志监控"
                >
                  <Terminal size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Strategy Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-850 w-full max-w-md rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">上传新策略</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleFileUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">策略名称</label>
                <input 
                  type="text" 
                  required
                  value={newStratName}
                  onChange={e => setNewStratName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
                  placeholder="例如: 布林带突破 v1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">策略描述</label>
                <textarea 
                  required
                  value={newStratDesc}
                  onChange={e => setNewStratDesc(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500 h-24 resize-none"
                  placeholder="简单描述策略逻辑..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Python 脚本文件</label>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-gray-500 transition-colors cursor-pointer relative">
                    <input 
                        type="file" 
                        accept=".py" 
                        onChange={(e) => setNewStratFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="mx-auto text-gray-500 mb-2" />
                    <p className="text-sm text-gray-400">
                        {newStratFile ? newStratFile.name : '点击或拖拽上传 .py 文件'}
                    </p>
                </div>
              </div>
              <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-medium">确认上传</button>
            </form>
          </div>
        </div>
      )}

      {/* AI Generator Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-850 w-full max-w-2xl rounded-xl border border-gray-700 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gradient-to-r from-purple-900/20 to-indigo-900/20">
              <div className="flex items-center space-x-2 text-purple-400">
                <Sparkles size={20} />
                <h3 className="text-lg font-bold text-white">AI 策略生成助手 (Gemini 2.5)</h3>
              </div>
              <button onClick={() => setShowAIModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              {!generatedResult ? (
                <div className="space-y-4">
                    <p className="text-gray-300 text-sm">请输入您的交易思路，AI 将为您自动编写完整的 Python 策略代码。</p>
                    <textarea 
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-white focus:outline-none focus:border-purple-500 h-40 resize-none"
                        placeholder="例如：编写一个基于 MACD 的策略，当 DIFF 向上突破 DEA 时买入，向下突破时卖出，止损设置为 2%..."
                    />
                    <button 
                        onClick={handleGenerateAI}
                        disabled={isGenerating || !aiPrompt.trim()}
                        className={`w-full py-3 rounded-lg font-medium flex items-center justify-center ${isGenerating ? 'bg-gray-700 cursor-not-allowed text-gray-400' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
                    >
                        {isGenerating ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                正在思考编写中...
                            </>
                        ) : '开始生成'}
                    </button>
                </div>
              ) : (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h4 className="font-bold text-white text-lg">{generatedResult.name}</h4>
                        <button onClick={() => setGeneratedResult(null)} className="text-sm text-gray-400 hover:text-white underline">重置</button>
                    </div>
                    <p className="text-gray-400 text-sm">{generatedResult.desc}</p>
                    <div className="relative">
                        <pre className="bg-gray-950 p-4 rounded-lg overflow-x-auto text-xs text-green-400 font-mono h-64 border border-gray-800 custom-scrollbar">
                            {generatedResult.code}
                        </pre>
                    </div>
                </div>
              )}
            </div>

            {generatedResult && (
                <div className="p-6 border-t border-gray-700">
                    <button 
                        onClick={handleSaveAIStrategy}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium"
                    >
                        保存到策略库
                    </button>
                </div>
            )}
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-850 w-full max-w-sm rounded-xl border border-gray-700 shadow-2xl">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h3 className="font-bold text-white">设置运行时间段</h3>
                <button onClick={() => setShowScheduleModal(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">开始时间</label>
                        <input 
                            type="time" 
                            value={scheduleStart} 
                            onChange={(e) => setScheduleStart(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-2 text-white"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">结束时间</label>
                        <input 
                            type="time" 
                            value={scheduleEnd}
                            onChange={(e) => setScheduleEnd(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-2 text-white"
                        />
                    </div>
                </div>
                <p className="text-xs text-yellow-500/80 bg-yellow-500/10 p-2 rounded">
                    注意：超出该时间段策略将自动停止并清空临时仓位（取决于策略逻辑）。
                </p>
                <button onClick={handleSaveSchedule} className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded font-medium">保存设置</button>
            </div>
          </div>
        </div>
      )}

      {/* Log Viewer Modal */}
      {viewLogsId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-900 w-full max-w-4xl h-[80vh] rounded-xl border border-gray-700 shadow-2xl flex flex-col">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-850 rounded-t-xl">
                <div className="flex items-center space-x-2">
                    <Terminal size={18} className="text-gray-400" />
                    <h3 className="font-mono font-bold text-white">策略控制台日志</h3>
                </div>
                <button onClick={() => setViewLogsId(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto font-mono text-sm space-y-2 bg-gray-950 custom-scrollbar">
                {logs.length === 0 ? (
                    <div className="text-gray-600 text-center mt-10">暂无日志或正在连接日志流...</div>
                ) : logs.map((log) => (
                    <div key={log.id} className="flex space-x-3 border-b border-gray-800/50 pb-1 mb-1 last:border-0">
                        <span className="text-gray-500 whitespace-nowrap">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                        <span className={`font-bold whitespace-nowrap w-16 ${
                            log.level === 'ERROR' ? 'text-red-500' :
                            log.level === 'WARNING' ? 'text-yellow-500' :
                            log.level === 'TRADE' ? 'text-green-400' : 'text-blue-400'
                        }`}>{log.level}</span>
                        <span className="text-gray-300 break-all">{log.message}</span>
                    </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Strategies;
