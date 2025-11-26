import React from 'react';
import { Link } from 'react-router-dom';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <img src="/logo.png" alt="ArtisanFlow" className="w-8 h-8 rounded-full" />
            </div>
            <span className="text-xl font-bold">ArtisanFlow</span>
          </Link>
          <Link 
            to="/" 
            className="text-sm text-gray-400 hover:text-orange-500 transition"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Navigation interne */}
        <nav className="mb-12 p-6 bg-gray-900/50 rounded-lg border border-gray-800">
          <h2 className="text-lg font-semibold mb-4 text-orange-500">Navigation rapide</h2>
          <div className="flex flex-wrap gap-4">
            <a href="#mentions-legales" className="text-sm text-gray-300 hover:text-orange-500 transition">
              Mentions Légales
            </a>
            <span className="text-gray-700">|</span>
            <a href="#cgu-cgv" className="text-sm text-gray-300 hover:text-orange-500 transition">
              CGU / CGV
            </a>
            <span className="text-gray-700">|</span>
            <a href="#confidentialite" className="text-sm text-gray-300 hover:text-orange-500 transition">
              Politique de Confidentialité
            </a>
          </div>
        </nav>

        {/* Mentions Légales */}
        <section id="mentions-legales" className="mb-16 scroll-mt-20">
          <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-8">
            <h1 className="text-3xl font-bold mb-8 text-orange-500">Mentions Légales</h1>
            
            <div className="space-y-6 text-gray-300 leading-relaxed">
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">Éditeur du site</h2>
                <p><strong>Nom :</strong> ArtisanFlow</p>
                <p><strong>Statut :</strong> Service B2B en phase de pré-lancement (pré-production)</p>
                <p><strong>Adresse :</strong> Chaussée de Bruxelles 325/4, 7800 Ath, Belgique</p>
                <p><strong>Email de contact :</strong> <a href="mailto:sav.artisanflow@gmail.com" className="text-orange-500 hover:underline">sav.artisanflow@gmail.com</a></p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-3">Hébergement</h2>
                <p>L'application est hébergée par Emergent.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-3">Objet du site</h2>
                <p>
                  ArtisanFlow est une application SaaS destinée aux professionnels pour la gestion administrative.
                  La plateforme est actuellement en phase de pré-lancement et ne propose aucune transaction
                  commerciale réelle avant septembre 2026.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-3">Responsabilité</h2>
                <p>
                  L'éditeur ne peut être tenu responsable en cas d'interruptions, erreurs ou dommages liés à
                  l'utilisation du service dans sa version de test.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CGU / CGV */}
        <section id="cgu-cgv" className="mb-16 scroll-mt-20">
          <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-8">
            <h1 className="text-3xl font-bold mb-8 text-orange-500">Conditions Générales d'Utilisation / Vente</h1>
            
            <div className="space-y-6 text-gray-300 leading-relaxed">
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">Présentation du service</h2>
                <p>
                  ArtisanFlow est une application SaaS destinée exclusivement aux professionnels (B2B). Le
                  service est actuellement en phase de pré-lancement.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-3">Prix</h2>
                <p><strong>Tarif prévu :</strong> 19,99 €/mois.</p>
                <p><strong>Phase de pré-lancement :</strong> aucun débit réel avant le 01/09/2026.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-3">Inscription</h2>
                <p>L'utilisateur déclare agir en tant qu'entreprise ou professionnel.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-3">Paiement</h2>
                <p>
                  Les paiements seront gérés par Stripe dès l'ouverture commerciale officielle en septembre 2026.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-3">Résiliation</h2>
                <p>
                  L'utilisateur pourra résilier son abonnement à tout moment sans frais lorsque les abonnements
                  réels seront activés.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-3">Responsabilité</h2>
                <p>
                  L'éditeur n'est pas responsable des dommages liés à une mauvaise utilisation du service en
                  phase de test.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-3">Droit applicable</h2>
                <p>Les présentes conditions sont régies par le droit belge.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Politique de Confidentialité */}
        <section id="confidentialite" className="mb-16 scroll-mt-20">
          <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-8">
            <h1 className="text-3xl font-bold mb-8 text-orange-500">Politique de Confidentialité (RGPD)</h1>
            
            <div className="space-y-6 text-gray-300 leading-relaxed">
              <div>
                <h2 className="text-xl font-semibold text-white mb-3">Responsable du traitement</h2>
                <p>
                  ArtisanFlow – <a href="mailto:sav.artisanflow@gmail.com" className="text-orange-500 hover:underline">sav.artisanflow@gmail.com</a>
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-3">Statut du service</h2>
                <p>
                  La plateforme est en phase de pré-lancement. Aucune transaction réelle n'est traitée avant
                  septembre 2026.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-3">Données collectées</h2>
                <p>Nom, email, adresse, pays, numéro TVA (si fourni), données de connexion.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-3">Finalités</h2>
                <p>Création de compte, test de fonctionnalités, support utilisateur, sécurité.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-3">Sous-traitants</h2>
                <p>Stripe (paiements en mode test), Emergent (hébergement) — conformes RGPD.</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-3">Droits des utilisateurs</h2>
                <p>
                  Accès, rectification, suppression, portabilité. Contact : <a href="mailto:sav.artisanflow@gmail.com" className="text-orange-500 hover:underline">sav.artisanflow@gmail.com</a>
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-3">Durée de conservation</h2>
                <p>
                  Les données sont conservées tant que le compte est actif ou jusqu'à demande de suppression.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-3">Sécurité</h2>
                <p>
                  Des mesures techniques et organisationnelles sont mises en place pour protéger les données.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center py-8 border-t border-gray-800">
          <p className="text-sm text-gray-500">
            Dernière mise à jour : Novembre 2025
          </p>
          <Link to="/" className="text-sm text-orange-500 hover:underline mt-2 inline-block">
            ← Retour à l'accueil
          </Link>
        </div>
      </main>
    </div>
  );
}
