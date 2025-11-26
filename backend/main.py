from __future__ import annotations

import json
import uuid
from datetime import datetime, timedelta
from enum import Enum
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


DATA_PATH = Path(__file__).parent / "data"
DATA_FILE = DATA_PATH / "strategies.json"
DATA_PATH.mkdir(parents=True, exist_ok=True)


class StrategyStatus(str, Enum):
    STOPPED = "STOPPED"
    RUNNING = "RUNNING"
    SCHEDULED = "SCHEDULED"
    ERROR = "ERROR"


class Strategy(BaseModel):
    id: str
    name: str
    description: str
    scriptContent: str
    status: StrategyStatus
    scheduleEnabled: bool
    startTime: Optional[str] = None
    endTime: Optional[str] = None
    lastRun: Optional[str] = None
    pnl: float
    createdAt: str

    class Config:
        use_enum_values = True


class AccountBalance(BaseModel):
    totalWalletBalance: float
    unrealizedPNL: float
    marginBalance: float
    availableBalance: float


class Position(BaseModel):
    symbol: str
    positionSide: str
    entryPrice: float
    markPrice: float
    amount: float
    leverage: int
    unrealizedPNL: float
    roe: float
    liquidationPrice: float


class SchedulePayload(BaseModel):
    enabled: bool
    startTime: Optional[str] = None
    endTime: Optional[str] = None


class AIStrategyPayload(BaseModel):
    name: str
    description: str
    code: str


class ToggleResponse(BaseModel):
    status: StrategyStatus
    strategy: Strategy


def _load_strategies() -> List[Strategy]:
    if DATA_FILE.exists():
        with DATA_FILE.open("r", encoding="utf-8") as f:
            raw = json.load(f)
        return [Strategy.parse_obj(item) for item in raw]

    # Seed default strategies
    seed = [
        Strategy(
            id="1",
            name="双均线突破策略 (BTC)",
            description="基于MA5和MA20的金叉死叉进行交易，适用于趋势行情。",
            scriptContent="def run(data):\n    # Python script here...",
            status=StrategyStatus.RUNNING,
            scheduleEnabled=False,
            pnl=1250.40,
            lastRun=datetime.utcnow().isoformat(),
            createdAt="2024-05-10T10:00:00Z",
        ),
        Strategy(
            id="2",
            name="RSI 超买超卖回归",
            description="当RSI > 70做空，RSI < 30做多，适用于震荡行情。",
            scriptContent="def run(data):\n    # Python script here...",
            status=StrategyStatus.SCHEDULED,
            scheduleEnabled=True,
            startTime="09:00",
            endTime="23:00",
            pnl=-320.10,
            createdAt="2024-05-12T14:30:00Z",
        ),
    ]
    _save_strategies(seed)
    return seed


def _save_strategies(strategies: List[Strategy]) -> None:
    with DATA_FILE.open("w", encoding="utf-8") as f:
        json.dump([s.dict() for s in strategies], f, ensure_ascii=False, indent=2)


strategies_store: List[Strategy] = _load_strategies()


app = FastAPI(title="QuantFlow Backend", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check() -> dict:
    return {"status": "ok", "strategies": len(strategies_store)}


@app.get("/api/account", response_model=AccountBalance)
def get_account_balance() -> AccountBalance:
    return AccountBalance(
        totalWalletBalance=54320.50,
        unrealizedPNL=1240.30,
        marginBalance=55560.80,
        availableBalance=45000.00,
    )


@app.get("/api/positions", response_model=List[Position])
def get_positions() -> List[Position]:
    return [
        Position(
            symbol="BTCUSDT",
            positionSide="LONG",
            entryPrice=62000.50,
            markPrice=63500.00,
            amount=0.5,
            leverage=10,
            unrealizedPNL=750.00,
            roe=12.10,
            liquidationPrice=58000.00,
        ),
        Position(
            symbol="ETHUSDT",
            positionSide="SHORT",
            entryPrice=3100.00,
            markPrice=3050.00,
            amount=10,
            leverage=20,
            unrealizedPNL=500.00,
            roe=16.13,
            liquidationPrice=3300.00,
        ),
    ]


@app.get("/api/strategies", response_model=List[Strategy])
def list_strategies() -> List[Strategy]:
    return strategies_store


@app.post("/api/strategies", response_model=Strategy)
async def upload_strategy(
    name: str = Form(...),
    description: str = Form(""),
    file: UploadFile = File(...),
) -> Strategy:
    content_bytes = await file.read()
    try:
        content = content_bytes.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="策略文件必须为 UTF-8 编码")

    strategy = Strategy(
        id=uuid.uuid4().hex,
        name=name,
        description=description,
        scriptContent=content,
        status=StrategyStatus.STOPPED,
        scheduleEnabled=False,
        pnl=0.0,
        createdAt=datetime.utcnow().isoformat(),
    )

    strategies_store.append(strategy)
    _save_strategies(strategies_store)
    return strategy


@app.post("/api/strategies/ai", response_model=Strategy)
def save_ai_strategy(payload: AIStrategyPayload) -> Strategy:
    strategy = Strategy(
        id=uuid.uuid4().hex,
        name=payload.name,
        description=payload.description,
        scriptContent=payload.code,
        status=StrategyStatus.STOPPED,
        scheduleEnabled=False,
        pnl=0.0,
        createdAt=datetime.utcnow().isoformat(),
    )
    strategies_store.append(strategy)
    _save_strategies(strategies_store)
    return strategy


@app.post("/api/strategies/{strategy_id}/toggle", response_model=ToggleResponse)
def toggle_strategy_status(strategy_id: str) -> ToggleResponse:
    strategy = _get_strategy(strategy_id)
    if strategy.status == StrategyStatus.RUNNING:
        strategy.status = StrategyStatus.STOPPED
    else:
        strategy.status = StrategyStatus.RUNNING
        strategy.lastRun = datetime.utcnow().isoformat()

    _save_strategies(strategies_store)
    return ToggleResponse(status=strategy.status, strategy=strategy)


@app.post("/api/strategies/{strategy_id}/schedule", response_model=Strategy)
def update_strategy_schedule(strategy_id: str, payload: SchedulePayload) -> Strategy:
    strategy = _get_strategy(strategy_id)
    strategy.scheduleEnabled = payload.enabled
    strategy.startTime = payload.startTime
    strategy.endTime = payload.endTime

    if payload.enabled and strategy.status == StrategyStatus.STOPPED:
        strategy.status = StrategyStatus.SCHEDULED
    elif not payload.enabled and strategy.status == StrategyStatus.SCHEDULED:
        strategy.status = StrategyStatus.STOPPED

    _save_strategies(strategies_store)
    return strategy


@app.get("/api/strategies/{strategy_id}/logs")
def get_strategy_logs(strategy_id: str) -> List[dict]:
    _get_strategy(strategy_id)
    now = datetime.utcnow()
    logs = []
    for i in range(20):
        timestamp = now - timedelta(minutes=i)
        level = _random_level(i)
        logs.append(
            {
                "id": f"{strategy_id}-{i}",
                "timestamp": timestamp.isoformat(),
                "level": level,
                "message": _mock_log_message(level),
            }
        )
    return logs


def _get_strategy(strategy_id: str) -> Strategy:
    for strategy in strategies_store:
        if strategy.id == strategy_id:
            return strategy
    raise HTTPException(status_code=404, detail="Strategy not found")


def _random_level(index: int) -> str:
    if index % 10 == 0:
        return "WARNING"
    if index % 7 == 0:
        return "TRADE"
    return "INFO"


def _mock_log_message(level: str) -> str:
    if level == "TRADE":
        return "执行信号: 买入 BTCUSDT @ 62300"
    if level == "WARNING":
        return "API 延迟稍高 (450ms)，正在重试..."
    return "正在计算指标 MA(20)... 策略心跳正常。"


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=False)
