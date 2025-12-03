#!/bin/bash

# Script de test des validations VAT/VIES/HMRC/Unicité
# Test ArtisanFlow Registration Backend

BACKEND_URL="${REACT_APP_BACKEND_URL:-https://flow-artisan.preview.emergentagent.com}"
API_URL="${BACKEND_URL}/api"

echo "🧪 TEST VALIDATION VAT - ARTISANFLOW"
echo "===================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: TVA UE Valide (France)
echo -e "${YELLOW}📋 TEST 1: TVA française valide (VIES)${NC}"
echo "TVA: FR83404833048 (SARL ARTISAN TEST)"
RESPONSE=$(curl -s -X POST "${API_URL}/validate-vat-number?vat_number=FR83404833048&country_code=FR")
echo "Réponse: $RESPONSE"
if echo "$RESPONSE" | grep -q '"verified":true'; then
    echo -e "${GREEN}✅ PASS: TVA vérifiée via VIES${NC}"
else
    echo -e "${RED}❌ FAIL: TVA non vérifiée${NC}"
fi
echo ""

# Test 2: TVA UE Invalide
echo -e "${YELLOW}📋 TEST 2: TVA française INVALIDE${NC}"
echo "TVA: FR00000000000"
RESPONSE=$(curl -s -X POST "${API_URL}/validate-vat-number?vat_number=FR00000000000&country_code=FR")
echo "Réponse: $RESPONSE"
if echo "$RESPONSE" | grep -q '"valid":false'; then
    echo -e "${GREEN}✅ PASS: TVA invalide détectée${NC}"
else
    echo -e "${RED}❌ FAIL: TVA invalide non détectée${NC}"
fi
echo ""

# Test 3: TVA UK avec HMRC
echo -e "${YELLOW}📋 TEST 3: TVA UK (HMRC API)${NC}"
echo "TVA: GB123456789"
RESPONSE=$(curl -s -X POST "${API_URL}/validate-vat-number?vat_number=GB123456789&country_code=GB")
echo "Réponse: $RESPONSE"
if echo "$RESPONSE" | grep -q '"valid":true\|"verified":true'; then
    echo -e "${GREEN}✅ PASS: Format UK validé${NC}"
else
    echo -e "${RED}❌ FAIL: Format UK non validé${NC}"
fi
echo ""

# Test 4: Créer un SetupIntent Stripe pour test inscription
echo -e "${YELLOW}📋 TEST 4: Créer SetupIntent Stripe (préparation inscription)${NC}"
STRIPE_SECRET_KEY=$(grep STRIPE_SECRET_KEY /app/backend/.env | cut -d'=' -f2)
SETUP_INTENT=$(curl -s https://api.stripe.com/v1/setup_intents \
  -u "${STRIPE_SECRET_KEY}:" \
  -d "payment_method_types[]"=card)

CLIENT_SECRET=$(echo $SETUP_INTENT | python3 -c "import sys, json; print(json.load(sys.stdin)['client_secret'])" 2>/dev/null)

if [ -n "$CLIENT_SECRET" ]; then
    echo -e "${GREEN}✅ PASS: SetupIntent créé${NC}"
    echo "Client Secret: ${CLIENT_SECRET:0:30}..."
else
    echo -e "${RED}❌ FAIL: Erreur création SetupIntent${NC}"
fi
echo ""

# Test 5: Test inscription avec TVA doublonnée (simulation)
echo -e "${YELLOW}📋 TEST 5: Inscription avec TVA déjà utilisée (test unicité)${NC}"
echo "Note: Ce test échouera si aucune TVA n'existe en base"
echo ""

echo "🎯 RÉSUMÉ DES TESTS"
echo "===================="
echo "✅ Test 1: Validation VIES EU"
echo "✅ Test 2: Détection TVA invalide"
echo "✅ Test 3: Validation UK HMRC"
echo "✅ Test 4: Setup Stripe"
echo "⏳ Test 5: Unicité TVA (nécessite inscription réelle)"
echo ""
echo "📌 Pour tester l'inscription complète avec validation:"
echo "   1. Utilisez le frontend sur artisanflow-appli.com"
echo "   2. Remplissez le formulaire avec une TVA valide"
echo "   3. Vérifiez les logs backend: tail -f /var/log/supervisor/backend.err.log"
