#!/bin/bash
# Script pour réinitialiser le compte test artisan@test.fr avec PIN 1234

echo "🔄 Réinitialisation du compte test artisan@test.fr..."

# Hash du mot de passe "test123"
PASSWORD_HASH=$(echo -n "test123" | sha256sum | cut -d' ' -f1)

# Hash du PIN "1234"  
PIN_HASH=$(echo -n "1234" | sha256sum | cut -d' ' -f1)

# MongoDB connection
MONGO_URL="mongodb://localhost:27017"
DB_NAME="artisanflow_db"

# Supprimer le compte test s'il existe
mongosh "$MONGO_URL" --eval "
use $DB_NAME;
db.users.deleteOne({ email: 'artisan@test.fr' });
print('✅ Compte existant supprimé');
"

# Créer le compte test avec les données de base
mongosh "$MONGO_URL" --eval "
use $DB_NAME;
db.users.insertOne({
  email: 'artisan@test.fr',
  username: 'artisan_test',
  password: '$PASSWORD_HASH',
  pin: '$PIN_HASH',
  companyName: 'Artisan Test',
  firstName: 'Jean',
  lastName: 'Test',
  countryCode: 'FR',
  profession: 'Électricien',
  paymentMethod: 'card',
  stripeCustomerId: 'test_customer',
  createdAt: new Date(),
  subscriptionStatus: 'active'
});
print('✅ Nouveau compte créé');
print('📧 Email: artisan@test.fr');
print('🔑 Password: test123');
print('🔢 PIN: 1234');
"

echo "✅ Compte test réinitialisé avec succès !"
echo ""
echo "🧪 COMPTE TEST:"
echo "   Email    : artisan@test.fr"
echo "   Password : test123"
echo "   PIN      : 1234"
echo ""
echo "💡 Tous les flags onboarding ont été supprimés du compte."
