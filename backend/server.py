from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import razorpay
import random
import string

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Razorpay client
razorpay_client = razorpay.Client(
    auth=(os.environ.get('RAZORPAY_KEY_ID', ''), os.environ.get('RAZORPAY_KEY_SECRET', ''))
)

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'default_secret')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 72

app = FastAPI(title="DHRIVO WON© API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# ================== MODELS ==================

class UserRegister(BaseModel):
    mobile: str
    password: str
    referral_code: Optional[str] = None
    name: str

class UserLogin(BaseModel):
    mobile: str
    password: str

class UserResponse(BaseModel):
    id: str
    mobile: str
    name: str
    wallet_balance: float = 0
    referral_code: str
    backup_code: str
    is_admin: bool = False
    game_uid: Optional[str] = None
    game_name: Optional[str] = None
    upi_id: Optional[str] = None
    bank_account: Optional[str] = None
    ifsc_code: Optional[str] = None
    created_at: str

class TokenResponse(BaseModel):
    access_token: str
    user: UserResponse

class WalletRecharge(BaseModel):
    amount: int  # DR coins amount

class WalletWithdraw(BaseModel):
    amount: int
    upi_id: Optional[str] = None
    bank_account: Optional[str] = None
    ifsc_code: Optional[str] = None

class TournamentCreate(BaseModel):
    title: str
    game_type: str  # FREE_FIRE, BGMI
    mode: str  # BR, CS, LW
    team_type: str  # SOLO, DUO, SQUAD
    entry_fee: int
    prize_pool: int
    per_kill_reward: int = 0  # Per kill money
    max_participants: int
    match_time: str
    match_date: str
    poster_url: Optional[str] = None
    description: Optional[str] = None
    room_id: Optional[str] = None
    room_password: Optional[str] = None

class TournamentResponse(BaseModel):
    id: str
    title: str
    game_type: str
    mode: str
    team_type: str
    entry_fee: int
    prize_pool: int
    per_kill_reward: int = 0
    max_participants: int
    current_participants: int
    match_time: str
    match_date: str
    poster_url: Optional[str] = None
    description: Optional[str] = None
    status: str  # UPCOMING, ONGOING, COMPLETED
    room_id: Optional[str] = None
    room_password: Optional[str] = None
    created_at: str

class MatchJoin(BaseModel):
    tournament_id: str
    game_uid: str
    game_name: str

class NewsCreate(BaseModel):
    title: str
    content: str

class GiveawayCreate(BaseModel):
    title: str
    description: str
    prize: str
    end_date: str
    image_url: Optional[str] = None
    external_link: Optional[str] = None

class LuckyDrawCreate(BaseModel):
    title: str
    entry_cost: int
    prize_amount: int
    max_entries: int
    end_date: str

class ResultCreate(BaseModel):
    tournament_id: str
    winners: List[dict]  # [{rank: 1, user_id: "...", prize: 100}]

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    game_uid: Optional[str] = None
    game_name: Optional[str] = None
    upi_id: Optional[str] = None
    bank_account: Optional[str] = None
    ifsc_code: Optional[str] = None

class PasswordReset(BaseModel):
    mobile: str
    backup_code: str
    new_password: str

# ================== HELPERS ==================

def generate_code(length=8):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())

def create_token(user_id: str, is_admin: bool = False) -> str:
    payload = {
        "user_id": user_id,
        "is_admin": is_admin,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(user=Depends(get_current_user)):
    if not user.get("is_admin", False):
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ================== AUTH ROUTES ==================

@api_router.post("/auth/register", response_model=TokenResponse)
async def register(data: UserRegister):
    existing = await db.users.find_one({"mobile": data.mobile})
    if existing:
        raise HTTPException(status_code=400, detail="Mobile number already registered")
    
    user_id = str(uuid.uuid4())
    referral_code = generate_code(6)
    backup_code = generate_code(10)
    
    # Handle referral bonus
    bonus = 0
    if data.referral_code:
        referrer = await db.users.find_one({"referral_code": data.referral_code})
        if referrer:
            bonus = 10  # 10 DR bonus for using referral
            await db.users.update_one(
                {"id": referrer["id"]},
                {"$inc": {"wallet_balance": 20}}  # 20 DR for referrer
            )
    
    user = {
        "id": user_id,
        "mobile": data.mobile,
        "password": hash_password(data.password),
        "name": data.name,
        "wallet_balance": bonus,
        "referral_code": referral_code,
        "backup_code": backup_code,
        "is_admin": False,
        "game_uid": None,
        "game_name": None,
        "upi_id": None,
        "bank_account": None,
        "ifsc_code": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user)
    token = create_token(user_id)
    
    user_response = {k: v for k, v in user.items() if k != "password"}
    return {"access_token": token, "user": user_response}

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(data: UserLogin):
    user = await db.users.find_one({"mobile": data.mobile}, {"_id": 0})
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["id"], user.get("is_admin", False))
    user_response = {k: v for k, v in user.items() if k != "password"}
    return {"access_token": token, "user": user_response}

@api_router.post("/auth/reset-password")
async def reset_password(data: PasswordReset):
    user = await db.users.find_one({"mobile": data.mobile, "backup_code": data.backup_code})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid mobile or backup code")
    
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"password": hash_password(data.new_password)}}
    )
    return {"message": "Password reset successful"}

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user=Depends(get_current_user)):
    return {k: v for k, v in user.items() if k != "password"}

@api_router.put("/auth/profile")
async def update_profile(data: ProfileUpdate, user=Depends(get_current_user)):
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if update_data:
        await db.users.update_one({"id": user["id"]}, {"$set": update_data})
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password": 0})
    return updated

# ================== WALLET ROUTES ==================

@api_router.post("/wallet/create-order")
async def create_recharge_order(data: WalletRecharge, user=Depends(get_current_user)):
    # Amount in paise
    amount_inr = data.amount  # 1 DR = 1 INR for simplicity
    
    try:
        order = razorpay_client.order.create({
            "amount": amount_inr * 100,  # paise
            "currency": "INR",
            "payment_capture": 1,
            "notes": {
                "user_id": user["id"],
                "dr_amount": data.amount
            }
        })
        
        # Save pending transaction
        transaction = {
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "order_id": order["id"],
            "amount": data.amount,
            "type": "DEPOSIT",
            "status": "PENDING",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.transactions.insert_one(transaction)
        
        return {
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "key_id": os.environ.get('RAZORPAY_KEY_ID')
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/wallet/verify-payment")
async def verify_payment(payment_data: dict, user=Depends(get_current_user)):
    order_id = payment_data.get("razorpay_order_id")
    payment_id = payment_data.get("razorpay_payment_id")
    signature = payment_data.get("razorpay_signature")
    
    try:
        # Verify signature
        razorpay_client.utility.verify_payment_signature({
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature
        })
        
        # Update transaction and wallet
        transaction = await db.transactions.find_one({"order_id": order_id})
        if transaction:
            await db.transactions.update_one(
                {"order_id": order_id},
                {"$set": {"status": "SUCCESS", "payment_id": payment_id}}
            )
            await db.users.update_one(
                {"id": user["id"]},
                {"$inc": {"wallet_balance": transaction["amount"]}}
            )
        
        return {"success": True, "message": "Payment verified and wallet credited"}
    except Exception as e:
        raise HTTPException(status_code=400, detail="Payment verification failed")

@api_router.post("/wallet/withdraw")
async def withdraw_request(data: WalletWithdraw, user=Depends(get_current_user)):
    if user["wallet_balance"] < data.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    
    if not data.upi_id and not (data.bank_account and data.ifsc_code):
        raise HTTPException(status_code=400, detail="UPI ID or Bank details required")
    
    withdrawal = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "amount": data.amount,
        "upi_id": data.upi_id,
        "bank_account": data.bank_account,
        "ifsc_code": data.ifsc_code,
        "status": "PENDING",
        "type": "WITHDRAWAL",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.transactions.insert_one(withdrawal)
    await db.users.update_one(
        {"id": user["id"]},
        {"$inc": {"wallet_balance": -data.amount}}
    )
    
    return {"message": "Withdrawal request submitted. Processing in 5-10 minutes."}

@api_router.get("/wallet/transactions")
async def get_transactions(user=Depends(get_current_user)):
    transactions = await db.transactions.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return transactions

# ================== TOURNAMENT ROUTES ==================

@api_router.get("/tournaments")
async def get_tournaments(
    status: Optional[str] = None,
    game_type: Optional[str] = None,
    mode: Optional[str] = None
):
    query = {}
    if status:
        query["status"] = status
    if game_type:
        query["game_type"] = game_type
    if mode:
        query["mode"] = mode
    
    tournaments = await db.tournaments.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return tournaments

@api_router.get("/tournaments/{tournament_id}")
async def get_tournament(tournament_id: str):
    tournament = await db.tournaments.find_one({"id": tournament_id}, {"_id": 0})
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return tournament

@api_router.post("/tournaments", response_model=TournamentResponse)
async def create_tournament(data: TournamentCreate, admin=Depends(get_admin_user)):
    tournament = {
        "id": str(uuid.uuid4()),
        **data.model_dump(),
        "current_participants": 0,
        "status": "UPCOMING",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.tournaments.insert_one(tournament)
    return tournament

@api_router.put("/tournaments/{tournament_id}")
async def update_tournament(tournament_id: str, data: dict, admin=Depends(get_admin_user)):
    await db.tournaments.update_one({"id": tournament_id}, {"$set": data})
    updated = await db.tournaments.find_one({"id": tournament_id}, {"_id": 0})
    return updated

@api_router.delete("/tournaments/{tournament_id}")
async def delete_tournament(tournament_id: str, admin=Depends(get_admin_user)):
    await db.tournaments.delete_one({"id": tournament_id})
    return {"message": "Tournament deleted"}

@api_router.post("/tournaments/{tournament_id}/join")
async def join_tournament(tournament_id: str, data: MatchJoin, user=Depends(get_current_user)):
    tournament = await db.tournaments.find_one({"id": tournament_id})
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if tournament["status"] != "UPCOMING":
        raise HTTPException(status_code=400, detail="Tournament is not open for joining")
    
    if tournament["current_participants"] >= tournament["max_participants"]:
        raise HTTPException(status_code=400, detail="Tournament is full")
    
    # Check if already joined
    existing = await db.participants.find_one({
        "tournament_id": tournament_id,
        "user_id": user["id"]
    })
    if existing:
        raise HTTPException(status_code=400, detail="Already joined this tournament")
    
    # Check wallet balance
    if user["wallet_balance"] < tournament["entry_fee"]:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance")
    
    # Deduct entry fee
    await db.users.update_one(
        {"id": user["id"]},
        {"$inc": {"wallet_balance": -tournament["entry_fee"]}}
    )
    
    # Add participant
    participant = {
        "id": str(uuid.uuid4()),
        "tournament_id": tournament_id,
        "user_id": user["id"],
        "game_uid": data.game_uid,
        "game_name": data.game_name,
        "joined_at": datetime.now(timezone.utc).isoformat()
    }
    await db.participants.insert_one(participant)
    
    # Update tournament count
    await db.tournaments.update_one(
        {"id": tournament_id},
        {"$inc": {"current_participants": 1}}
    )
    
    return {"message": "Successfully joined tournament", "room_id": tournament.get("room_id"), "room_password": tournament.get("room_password")}

@api_router.get("/tournaments/{tournament_id}/participants")
async def get_participants(tournament_id: str):
    participants = await db.participants.find(
        {"tournament_id": tournament_id}, {"_id": 0}
    ).to_list(500)
    return participants

@api_router.get("/my-matches")
async def get_my_matches(user=Depends(get_current_user)):
    participations = await db.participants.find(
        {"user_id": user["id"]}, {"_id": 0}
    ).to_list(100)
    
    tournament_ids = [p["tournament_id"] for p in participations]
    tournaments = await db.tournaments.find(
        {"id": {"$in": tournament_ids}}, {"_id": 0}
    ).to_list(100)
    
    return tournaments

# ================== NEWS ROUTES ==================

@api_router.get("/news")
async def get_news():
    news = await db.news.find({}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return news

@api_router.post("/news")
async def create_news(data: NewsCreate, admin=Depends(get_admin_user)):
    news_item = {
        "id": str(uuid.uuid4()),
        **data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.news.insert_one(news_item)
    return {k: v for k, v in news_item.items() if k != "_id"}

@api_router.delete("/news/{news_id}")
async def delete_news(news_id: str, admin=Depends(get_admin_user)):
    await db.news.delete_one({"id": news_id})
    return {"message": "News deleted"}

# ================== GIVEAWAY ROUTES ==================

@api_router.get("/giveaways")
async def get_giveaways():
    giveaways = await db.giveaways.find({}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return giveaways

@api_router.post("/giveaways")
async def create_giveaway(data: GiveawayCreate, admin=Depends(get_admin_user)):
    giveaway = {
        "id": str(uuid.uuid4()),
        **data.model_dump(),
        "participants": [],
        "status": "ACTIVE",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.giveaways.insert_one(giveaway)
    return {k: v for k, v in giveaway.items() if k != "_id"}

@api_router.post("/giveaways/{giveaway_id}/join")
async def join_giveaway(giveaway_id: str, user=Depends(get_current_user)):
    giveaway = await db.giveaways.find_one({"id": giveaway_id})
    if not giveaway:
        raise HTTPException(status_code=404, detail="Giveaway not found")
    
    if user["id"] in giveaway.get("participants", []):
        raise HTTPException(status_code=400, detail="Already joined")
    
    await db.giveaways.update_one(
        {"id": giveaway_id},
        {"$push": {"participants": user["id"]}}
    )
    return {"message": "Joined giveaway"}

@api_router.delete("/giveaways/{giveaway_id}")
async def delete_giveaway(giveaway_id: str, admin=Depends(get_admin_user)):
    await db.giveaways.delete_one({"id": giveaway_id})
    return {"message": "Giveaway deleted"}

# ================== LUCKY DRAW ROUTES ==================

@api_router.get("/lucky-draws")
async def get_lucky_draws():
    draws = await db.lucky_draws.find({}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return draws

@api_router.post("/lucky-draws")
async def create_lucky_draw(data: LuckyDrawCreate, admin=Depends(get_admin_user)):
    draw = {
        "id": str(uuid.uuid4()),
        **data.model_dump(),
        "entries": [],
        "current_entries": 0,
        "status": "ACTIVE",
        "winner": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.lucky_draws.insert_one(draw)
    return {k: v for k, v in draw.items() if k != "_id"}

@api_router.post("/lucky-draws/{draw_id}/enter")
async def enter_lucky_draw(draw_id: str, user=Depends(get_current_user)):
    draw = await db.lucky_draws.find_one({"id": draw_id})
    if not draw:
        raise HTTPException(status_code=404, detail="Lucky draw not found")
    
    if draw["current_entries"] >= draw["max_entries"]:
        raise HTTPException(status_code=400, detail="Lucky draw is full")
    
    if user["id"] in draw.get("entries", []):
        raise HTTPException(status_code=400, detail="Already entered")
    
    if user["wallet_balance"] < draw["entry_cost"]:
        raise HTTPException(status_code=400, detail="Insufficient balance")
    
    await db.users.update_one(
        {"id": user["id"]},
        {"$inc": {"wallet_balance": -draw["entry_cost"]}}
    )
    
    await db.lucky_draws.update_one(
        {"id": draw_id},
        {"$push": {"entries": user["id"]}, "$inc": {"current_entries": 1}}
    )
    return {"message": "Entered lucky draw"}

@api_router.post("/lucky-draws/{draw_id}/pick-winner")
async def pick_winner(draw_id: str, admin=Depends(get_admin_user)):
    draw = await db.lucky_draws.find_one({"id": draw_id})
    if not draw or not draw.get("entries"):
        raise HTTPException(status_code=400, detail="No entries to pick from")
    
    winner_id = random.choice(draw["entries"])
    await db.lucky_draws.update_one(
        {"id": draw_id},
        {"$set": {"winner": winner_id, "status": "COMPLETED"}}
    )
    
    await db.users.update_one(
        {"id": winner_id},
        {"$inc": {"wallet_balance": draw["prize_amount"]}}
    )
    
    winner = await db.users.find_one({"id": winner_id}, {"_id": 0, "password": 0})
    return {"winner": winner}

# ================== RESULTS ROUTES ==================

@api_router.get("/results")
async def get_results():
    results = await db.results.find({}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return results

@api_router.post("/results")
async def create_result(data: ResultCreate, admin=Depends(get_admin_user)):
    tournament = await db.tournaments.find_one({"id": data.tournament_id})
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    result = {
        "id": str(uuid.uuid4()),
        "tournament_id": data.tournament_id,
        "tournament_title": tournament["title"],
        "winners": data.winners,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Credit winners
    for winner in data.winners:
        await db.users.update_one(
            {"id": winner["user_id"]},
            {"$inc": {"wallet_balance": winner.get("prize", 0)}}
        )
    
    await db.results.insert_one(result)
    await db.tournaments.update_one(
        {"id": data.tournament_id},
        {"$set": {"status": "COMPLETED"}}
    )
    
    return result

# ================== ADMIN ROUTES ==================

@api_router.get("/admin/stats")
async def get_admin_stats(admin=Depends(get_admin_user)):
    users_count = await db.users.count_documents({})
    tournaments_count = await db.tournaments.count_documents({})
    active_tournaments = await db.tournaments.count_documents({"status": {"$in": ["UPCOMING", "ONGOING"]}})
    total_transactions = await db.transactions.count_documents({})
    
    return {
        "total_users": users_count,
        "total_tournaments": tournaments_count,
        "active_tournaments": active_tournaments,
        "total_transactions": total_transactions
    }

@api_router.get("/admin/users")
async def get_all_users(admin=Depends(get_admin_user)):
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    return users

@api_router.get("/admin/withdrawals")
async def get_pending_withdrawals(admin=Depends(get_admin_user)):
    withdrawals = await db.transactions.find(
        {"type": "WITHDRAWAL", "status": "PENDING"}, {"_id": 0}
    ).to_list(100)
    return withdrawals

@api_router.post("/admin/withdrawals/{withdrawal_id}/approve")
async def approve_withdrawal(withdrawal_id: str, admin=Depends(get_admin_user)):
    await db.transactions.update_one(
        {"id": withdrawal_id},
        {"$set": {"status": "SUCCESS"}}
    )
    return {"message": "Withdrawal approved"}

@api_router.post("/admin/withdrawals/{withdrawal_id}/reject")
async def reject_withdrawal(withdrawal_id: str, admin=Depends(get_admin_user)):
    withdrawal = await db.transactions.find_one({"id": withdrawal_id})
    if withdrawal:
        await db.transactions.update_one(
            {"id": withdrawal_id},
            {"$set": {"status": "REJECTED"}}
        )
        # Refund the amount
        await db.users.update_one(
            {"id": withdrawal["user_id"]},
            {"$inc": {"wallet_balance": withdrawal["amount"]}}
        )
    return {"message": "Withdrawal rejected and refunded"}

@api_router.post("/admin/make-admin/{user_id}")
async def make_admin(user_id: str, admin=Depends(get_admin_user)):
    await db.users.update_one({"id": user_id}, {"$set": {"is_admin": True}})
    return {"message": "User promoted to admin"}

# ================== LEADERBOARD ==================

@api_router.get("/leaderboard")
async def get_leaderboard():
    # Get users with most wins
    results = await db.results.find({}, {"_id": 0}).to_list(1000)
    wins = {}
    for result in results:
        for winner in result.get("winners", []):
            user_id = winner.get("user_id")
            if user_id:
                wins[user_id] = wins.get(user_id, 0) + 1
    
    # Sort by wins
    sorted_users = sorted(wins.items(), key=lambda x: x[1], reverse=True)[:20]
    
    leaderboard = []
    for user_id, win_count in sorted_users:
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
        if user:
            leaderboard.append({
                "user": user,
                "wins": win_count
            })
    
    return leaderboard

# ================== STATS FOR LANDING PAGE ==================

@api_router.get("/public/stats")
async def get_public_stats():
    users_count = await db.users.count_documents({})
    tournaments_count = await db.tournaments.count_documents({})
    total_matches = await db.participants.count_documents({})
    
    return {
        "total_players": users_count,
        "total_tournaments": tournaments_count,
        "total_matches_played": total_matches
    }

# Root endpoint
@api_router.get("/")
async def root():
    return {"message": "DHRIVO WON© API - Tournament Platform"}

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    # Create default admin if not exists
    admin = await db.users.find_one({"mobile": "9999999999"})
    if not admin:
        admin_user = {
            "id": str(uuid.uuid4()),
            "mobile": "9999999999",
            "password": hash_password("admin123"),
            "name": "Admin",
            "wallet_balance": 10000,
            "referral_code": "ADMIN001",
            "backup_code": "ADMINBACK01",
            "is_admin": True,
            "game_uid": None,
            "game_name": None,
            "upi_id": None,
            "bank_account": None,
            "ifsc_code": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin_user)
        logger.info("Default admin created: mobile=9999999999, password=admin123")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
