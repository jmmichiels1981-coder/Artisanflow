"""
Service d'envoi d'emails via AWS SES SMTP
Supporte l'envoi d'emails de confirmation et de notification
"""

import smtplib
import os
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from typing import Optional

logger = logging.getLogger(__name__)

# Configuration AWS SES SMTP (variables d'environnement)
SMTP_HOST = os.environ.get('AWS_SES_SMTP_HOST', 'email-smtp.us-east-1.amazonaws.com')
SMTP_PORT = int(os.environ.get('AWS_SES_SMTP_PORT', '587'))
SMTP_USERNAME = os.environ.get('AWS_SES_SMTP_USERNAME', '')
SMTP_PASSWORD = os.environ.get('AWS_SES_SMTP_PASSWORD', '')
SENDER_EMAIL = os.environ.get('AWS_SES_SENDER_EMAIL', 'sav.artisanflow@gmail.com')
SENDER_NAME = os.environ.get('AWS_SES_SENDER_NAME', 'ArtisanFlow Support')

# Mode développement (désactive l'envoi réel si credentials manquants)
DEV_MODE = not (SMTP_USERNAME and SMTP_PASSWORD)

if DEV_MODE:
    logger.warning("⚠️ AWS SES SMTP non configuré - Mode développement activé (emails simulés)")


def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None
) -> bool:
    """
    Envoie un email via AWS SES SMTP
    
    Args:
        to_email: Adresse email du destinataire
        subject: Sujet de l'email
        html_content: Contenu HTML de l'email
        text_content: Contenu texte alternatif (optionnel)
    
    Returns:
        bool: True si l'envoi a réussi, False sinon
    """
    
    if DEV_MODE:
        logger.info(f"📧 [DEV MODE] Email simulé vers {to_email}")
        logger.info(f"   Sujet: {subject}")
        logger.info(f"   Contenu: {html_content[:100]}...")
        return True
    
    try:
        # Créer le message
        message = MIMEMultipart('alternative')
        message['From'] = f"{SENDER_NAME} <{SENDER_EMAIL}>"
        message['To'] = to_email
        message['Subject'] = subject
        
        # Ajouter le contenu texte (fallback)
        if text_content:
            part_text = MIMEText(text_content, 'plain', 'utf-8')
            message.attach(part_text)
        
        # Ajouter le contenu HTML
        part_html = MIMEText(html_content, 'html', 'utf-8')
        message.attach(part_html)
        
        # Connexion au serveur SMTP AWS SES
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(message)
        
        logger.info(f"✅ Email envoyé avec succès à {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"❌ Erreur lors de l'envoi de l'email à {to_email}: {str(e)}")
        return False


def send_registration_confirmation_email(
    to_email: str,
    username: str,
    password: str,
    pin: str,
    company_name: str,
    first_name: str,
    trial_end_date: str = "31 août 2026"
) -> bool:
    """
    Envoie l'email de confirmation d'inscription
    
    Args:
        to_email: Email de l'utilisateur
        username: Nom d'utilisateur
        password: Mot de passe en clair (uniquement pour l'email de confirmation)
        pin: PIN en clair
        company_name: Nom de l'entreprise
        first_name: Prénom de l'utilisateur
        trial_end_date: Date de fin de la période d'essai gratuite
    
    Returns:
        bool: True si l'envoi a réussi
    """
    
    subject = "🎉 Bienvenue sur ArtisanFlow - Votre compte est créé !"
    
    # Template HTML
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <div style="background: linear-gradient(135deg, #FF7A2F 0%, #FF5C00 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Bienvenue sur ArtisanFlow</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.95;">Votre compte artisan est maintenant actif !</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
            
            <p style="font-size: 16px; margin-bottom: 20px;">Bonjour <strong>{first_name}</strong>,</p>
            
            <p style="font-size: 16px; margin-bottom: 25px;">
                Nous sommes ravis de vous accueillir sur <strong>ArtisanFlow</strong> ! 
                Votre compte pour <strong>{company_name}</strong> a été créé avec succès.
            </p>
            
            <div style="background: #f9fafb; border-left: 4px solid #FF7A2F; padding: 20px; margin: 25px 0; border-radius: 6px;">
                <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #FF7A2F;">🔐 Vos identifiants de connexion</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">📧 Email :</td>
                        <td style="padding: 8px 0; color: #111827;"><strong>{to_email}</strong></td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">🔑 Mot de passe :</td>
                        <td style="padding: 8px 0; color: #111827;"><code style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-family: monospace;">{password}</code></td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: 600; color: #6b7280;">🔢 Code PIN :</td>
                        <td style="padding: 8px 0; color: #111827;"><code style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-family: monospace;">{pin}</code></td>
                    </tr>
                </table>
            </div>
            
            <div style="background: #ecfdf5; border: 1px solid #86efac; padding: 20px; margin: 25px 0; border-radius: 8px;">
                <p style="margin: 0; font-size: 15px; color: #065f46;">
                    ✨ <strong>Période d'essai gratuite</strong><br>
                    Profitez de toutes les fonctionnalités gratuitement jusqu'au <strong>{trial_end_date}</strong> !
                </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://toolsmith-4.preview.emergentagent.com/login" 
                   style="display: inline-block; background: linear-gradient(90deg, #FF7A2F 0%, #FF5C00 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                    🚀 Accéder à mon tableau de bord
                </a>
            </div>
            
            <div style="border-top: 2px solid #f3f4f6; margin-top: 30px; padding-top: 20px;">
                <h3 style="font-size: 16px; color: #FF7A2F; margin-bottom: 15px;">📌 Prochaines étapes</h3>
                <ul style="color: #4b5563; font-size: 15px; line-height: 1.8;">
                    <li>Complétez votre profil d'entreprise</li>
                    <li>Créez vos premiers devis et factures</li>
                    <li>Explorez les outils de gestion automatisée</li>
                </ul>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #f3f4f6; font-size: 14px; color: #6b7280;">
                <p style="margin: 5px 0;">
                    <strong>Besoin d'aide ?</strong><br>
                    Notre équipe est à votre disposition : <a href="mailto:sav.artisanflow@gmail.com" style="color: #FF7A2F; text-decoration: none;">sav.artisanflow@gmail.com</a>
                </p>
            </div>
            
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding: 20px; font-size: 13px; color: #9ca3af;">
            <p style="margin: 5px 0;">© 2025 ArtisanFlow - Gestion d'entreprise pour artisans</p>
            <p style="margin: 5px 0;">Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.</p>
        </div>
        
    </body>
    </html>
    """
    
    # Version texte (fallback)
    text_content = f"""
    Bienvenue sur ArtisanFlow !
    
    Bonjour {first_name},
    
    Votre compte pour {company_name} a été créé avec succès.
    
    VOS IDENTIFIANTS :
    Email : {to_email}
    Mot de passe : {password}
    Code PIN : {pin}
    
    Période d'essai gratuite jusqu'au {trial_end_date}
    
    Connectez-vous : https://toolsmith-4.preview.emergentagent.com/login
    
    Besoin d'aide ? sav.artisanflow@gmail.com
    
    © 2025 ArtisanFlow
    """
    
    return send_email(to_email, subject, html_content, text_content)


def send_contact_notification_email(
    admin_email: str,
    contact_name: str,
    contact_email: str,
    contact_subject: str,
    contact_message: str,
    submission_date: str
) -> bool:
    """
    Envoie une notification email à l'admin lors d'un nouveau message de contact
    
    Args:
        admin_email: Email de l'administrateur
        contact_name: Nom du contact
        contact_email: Email du contact
        contact_subject: Sujet du message
        contact_message: Message du contact
        submission_date: Date de soumission
    
    Returns:
        bool: True si l'envoi a réussi
    """
    
    subject = f"🔔 Nouveau message de contact - {contact_name}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <div style="background: #1f2937; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 22px;">🔔 Nouveau message de contact</h1>
        </div>
        
        <div style="background: #ffffff; padding: 25px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                <p style="margin: 0; font-weight: 600; color: #92400e;">Un nouveau message a été reçu via le formulaire de contact</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background: #f9fafb;">
                    <td style="padding: 12px; font-weight: 600; border: 1px solid #e5e7eb; width: 30%;">Nom</td>
                    <td style="padding: 12px; border: 1px solid #e5e7eb;">{contact_name}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; font-weight: 600; border: 1px solid #e5e7eb;">Email</td>
                    <td style="padding: 12px; border: 1px solid #e5e7eb;">
                        <a href="mailto:{contact_email}" style="color: #FF7A2F; text-decoration: none;">{contact_email}</a>
                    </td>
                </tr>
                <tr style="background: #f9fafb;">
                    <td style="padding: 12px; font-weight: 600; border: 1px solid #e5e7eb;">Sujet</td>
                    <td style="padding: 12px; border: 1px solid #e5e7eb;">{contact_subject}</td>
                </tr>
                <tr>
                    <td style="padding: 12px; font-weight: 600; border: 1px solid #e5e7eb;">Date</td>
                    <td style="padding: 12px; border: 1px solid #e5e7eb;">{submission_date}</td>
                </tr>
            </table>
            
            <div style="margin-top: 20px;">
                <h3 style="font-size: 16px; color: #111827; margin-bottom: 10px;">Message :</h3>
                <div style="background: #f9fafb; padding: 15px; border-left: 3px solid #FF7A2F; border-radius: 4px; white-space: pre-wrap; font-size: 15px; color: #374151;">
{contact_message}
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 25px;">
                <a href="https://toolsmith-4.preview.emergentagent.com/admin" 
                   style="display: inline-block; background: #FF7A2F; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600;">
                    Voir dans la console Admin
                </a>
            </div>
            
        </div>
        
        <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #9ca3af;">
            <p>© 2025 ArtisanFlow - Notification automatique</p>
        </div>
        
    </body>
    </html>
    """
    
    text_content = f"""
    Nouveau message de contact
    
    Nom : {contact_name}
    Email : {contact_email}
    Sujet : {contact_subject}
    Date : {submission_date}
    
    Message :
    {contact_message}
    
    Voir dans la console Admin : https://toolsmith-4.preview.emergentagent.com/admin
    """
    
    return send_email(admin_email, subject, html_content, text_content)
