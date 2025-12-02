#!/bin/bash
# Script pour corriger tous les boutons de retour

echo "🔧 Correction globale des boutons de retour"

# Liste des fichiers à corriger
FILES=(
  "/app/frontend/src/pages/devis/creer/manuel.jsx"
  "/app/frontend/src/pages/devis/creer/dictee-vocale-structuree-par-ia.jsx"
  "/app/frontend/src/pages/devis/creer/assiste-par-ia.jsx"
  "/app/frontend/src/pages/devis/CreerDevisChoix.jsx"
  "/app/frontend/src/pages/devis/Refuses.jsx"
  "/app/frontend/src/pages/devis/EnvoyesEtEnAttente.jsx"
  "/app/frontend/src/pages/devis/Acceptes.jsx"
  "/app/frontend/src/pages/devis/ARelancer.jsx"
  "/app/frontend/src/pages/devis/Historique.jsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ Traitement: $file"
    # Remplacer tous les textes de retour par "Retour"
    sed -i 's/Retour aux devis/Retour/g' "$file"
    sed -i 's/← Retour aux devis/Retour/g' "$file"
    sed -i 's/Retour à la liste/Retour/g' "$file"
    sed -i 's/← Retour/Retour/g' "$file"
  fi
done

echo "✅ Corrections terminées"
