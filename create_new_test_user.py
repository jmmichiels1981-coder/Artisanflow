#!/usr/bin/env python3
"""
Script pour créer un nouvel utilisateur test dans MongoDB
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext

# Configuration
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_test_user():
    """Créer un nouveau compte test"""
    
    # Connexion à MongoDB
    client = AsyncIOMotorClient(MONGO_URL)
    db = client.artisanflow
    
    print("🔗 Connexion à MongoDB...")
    
    # Informations du nouveau compte
    email = "nouveau@artisan.fr"
    password = "nouveau123"
    pin = "5678"
    
    # Vérifier si l'utilisateur existe déjà
    existing_user = await db.users.find_one({"email": email})
    
    if existing_user:
        print(f"⚠️  L'utilisateur {email} existe déjà. Suppression...")
        await db.users.delete_one({"email": email})
        print("✅ Ancien utilisateur supprimé")
    
    # Hasher le mot de passe et le PIN
    password_hash = pwd_context.hash(password)
    pin_hash = pwd_context.hash(pin)
    
    # Créer le nouvel utilisateur
    new_user = {
        "email": email,
        "username": "nouveau_artisan",
        "password_hash": password_hash,
        "pin_hash": pin_hash,
        "role": "artisan",
        "created_at": "2024-12-03T00:00:00Z",
        "is_active": True,
        # PAS de champs de configuration pour simuler un premier login
        # has_configured: False sera implicite (champ absent)
    }
    
    # Insérer dans la base
    result = await db.users.insert_one(new_user)
    
    print("\n" + "="*60)
    print("✅ NOUVEAU COMPTE TEST CRÉÉ AVEC SUCCÈS !")
    print("="*60)
    print(f"\n📧 Email:        {email}")
    print(f"🔑 Mot de passe: {password}")
    print(f"📌 PIN:          {pin}")
    print(f"\n💾 ID MongoDB:   {result.inserted_id}")
    print("\n" + "="*60)
    print("\n🎯 Ce compte est VIERGE - aucune configuration")
    print("   → Le modal de configuration s'ouvrira au premier login")
    print("   → Parfait pour tester le workflow complet\n")
    
    client.close()
    return email, password, pin

if __name__ == "__main__":
    asyncio.run(create_test_user())
