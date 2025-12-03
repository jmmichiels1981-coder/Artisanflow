import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { COUNTRIES } from '@/utils/tvaCalculator';
import { getCurrencyForCountry } from '@/utils/currencyMapper';

export default function ConfigurationArtisanModal({ open, onComplete }) {
  const [formData, setFormData] = useState({
    tauxHoraire: '',
    margeMateriaux: '',
    depositPercentage: '30',
    tvaStatus: 'assujetti',
    country: 'FR',
    currency: 'EUR',
    logo: null,
    accountHolder: '',
    iban: '',
    bic: '',
    routingNumber: '',
    accountNumber: '',
    institutionNumber: '',
    transitNumber: '',
    accountNumberCA: '',
    swift: ''
  });

  // Mise à jour automatique de la devise en fonction du pays
  useEffect(() => {
    const currencyInfo = getCurrencyForCountry(formData.country);
    setFormData(prev => ({
      ...prev,
      currency: currencyInfo.code
    }));
  }, [formData.country]);

  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // NE PLUS afficher si déjà configuré
  useEffect(() => {
    const completed = localStorage.getItem("af_profile_completed");
    if (completed === "true") {
      onClose?.();
    }
  }, []);

  const getBankingFieldsType = () => {
    if (formData.country === 'US') return 'usa';
    if (formData.country === 'CA') return 'quebec';
    return 'europe';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // VALIDATIONS...

    setLoading(true);

    setTimeout(async () => {

      const bankingData = { accountHolder: formData.accountHolder };

      if (getBankingFieldsType() === 'europe') {
        bankingData.iban = formData.iban;
        bankingData.bic = formData.bic;
      } else if (getBankingFieldsType() === 'usa') {
        bankingData.routingNumber = formData.routingNumber;
        bankingData.accountNumber = formData.accountNumber;
        bankingData.swift = formData.swift;
      } else {
        bankingData.institutionNumber = formData.institutionNumber;
        bankingData.transitNumber = formData.transitNumber;
        bankingData.accountNumberCA = formData.accountNumberCA;
        bankingData.swift = formData.swift;
      }

      const configData = {
        tauxHoraire: parseFloat(formData.tauxHoraire),
        margeMateriaux: parseFloat(formData.margeMateriaux),
        depositPercentage: parseFloat(formData.depositPercentage),
        tvaStatus: formData.tvaStatus,
        country: formData.country,
        currency: formData.currency,
        logoUploaded: !!formData.logo,
        banking: bankingData,
        configCompleted: true
      };

      localStorage.setItem("af_config_artisan", JSON.stringify(configData));

      // 🔥 🔥 🔥 FIX : NE PLUS JAMAIS AFFICHER LE MODAL APRÈS PREMIÈRE CONFIG
      localStorage.setItem("af_profile_completed", "true");

      try {
        const token = localStorage.getItem("af_token");
        const username = localStorage.getItem("af_username");

        await fetch(`${process.env.REACT_APP_BACKEND_URL || ''}/api/users/${username}/configuration`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...configData,
            has_configured: true,
            profile_completed: true
          })
        });
      } catch (error) {
        console.error("⚠️ Erreur backend:", error);
      }

      toast.success("Configuration enregistrée !");
      window.location.reload();

    }, 1500);
  };

  if (!open) return null;

  return (
    <Dialog open={true} modal={true}>
      <DialogContent className="bg-gray-900 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            ⭐ Configuration de votre profil artisan
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {/* ... ton UI intact ... */}
        </form>
      </DialogContent>
    </Dialog>
  );
}
