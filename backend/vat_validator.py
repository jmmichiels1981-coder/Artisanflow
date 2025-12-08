"""
VAT and Company Number Validation Module
Validates business identifiers using official APIs
"""
import re
import logging
import os
from typing import Dict, Optional
import requests
from zeep import Client
from zeep.exceptions import Fault
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from the correct location
env_path = Path(__file__).parent / '.env'
load_dotenv(env_path)

logger = logging.getLogger(__name__)

class VATValidator:
    """Validates VAT numbers using official APIs"""
    
    # VIES SOAP endpoint
    VIES_URL = "https://ec.europa.eu/taxation_customs/vies/checkVatService.wsdl"
    
    # Swiss UID API endpoint
    SWISS_UID_URL = "https://www.uid.admin.ch/Detail.aspx?uid_id="
    
    # UK Companies House API
    UK_COMPANIES_HOUSE_API = "https://api.company-information.service.gov.uk"
    UK_VAT_API = "https://api.service.hmrc.gov.uk/organisations/vat/check-vat-number/lookup"
    
    # STRICT REGEX MAP
    STRICT_REGEX_MAP = {
        # BELGIQUE: BE + 10 chiffres (BE0123456789)
        'BE': r'^BE[0-9]{10}$',
        
        # FRANCE: FR + 11 caractères (FRXX123456789)
        'FR': r'^FR[A-Z0-9]{2}[0-9]{9}$',
        
        # LUXEMBOURG: LU + 8 chiffres (LU12345678)
        'LU': r'^LU[0-9]{8}$',
        
        # SUISSE: CHE-XXX.XXX.XXX TVA (suffixe TVA/MWST/IVA optionnel mais format CHE strict)
        'CH': r'^CHE-[0-9]{3}\.[0-9]{3}\.[0-9]{3}(\s*(TVA|MWST|IVA))?$',
        
        # QUEBEC/CANADA: 10 chiffres + TQ/RT + 4 chiffres
        # TVQ (Quebec): 10 digits + TQ + 4 digits
        # GST (Federal): 9 digits + RT + 4 digits
        # This regex covers both cases for CA routing
        'CA': r'^([0-9]{10}TQ[0-9]{4}|[0-9]{9}RT[0-9]{4}|11[0-9]{8})$', # Included NEQ (11 + 8 digits)
        
        # ESPAGNE: ES + (A-Z + 8 digits | 8 digits + A-Z)
        'ES': r'^ES([A-Z][0-9]{8}|[0-9]{8}[A-Z]|[A-Z][0-9]{7}[A-Z])$',
        
        # ITALIE: IT + 11 chiffres
        'IT': r'^IT[0-9]{11}$',
        
        # ALLEMAGNE: DE + 9 chiffres
        'DE': r'^DE[0-9]{9}$',
        
        # ROYAUME-UNI: GB + 9 ou 12 chiffres
        'GB': r'^GB([0-9]{9}|[0-9]{12})$'
    }

    def __init__(self):
        self.vies_client = None
        try:
            self.vies_client = Client(self.VIES_URL)
        except Exception as e:
            logger.error(f"Failed to initialize VIES client: {e}")
        
        # UK Companies House credentials
        self.uk_client_id = "1a0c89b8-6689-40f9-8ccf-c2dae0f63044"
        self.uk_client_secret = "i3DhDNihRfCDwybxMcP/eZ2hWB1ndnMsB7WthxbDv1A"
        
        # HMRC UK VAT Token
        self.hmrc_token = os.getenv('UK_VAT_TOKEN')
        if self.hmrc_token:
            logger.info("✅ UK VAT Token loaded from environment")
        else:
            logger.warning("⚠️ UK VAT Token not found in environment")
    
    async def validate_vat(self, vat_number: str, country_code: str) -> Dict:
        """
        Main validation function - routes to appropriate validator
        
        Returns:
        {
            'valid': bool,
            'verified': bool,  # True if API verification succeeded
            'status': 'verified' | 'pending' | 'format_only' | 'invalid',
            'company_name': str (optional),
            'address': str (optional),
            'message': str (optional)
        }
        """
        country_code = country_code.upper()
        
        # 0. STRICT REGEX CHECK BEFORE ANYTHING ELSE
        # Normalize input: REMOVE spaces, dots, dashes for pure regex check, 
        # BUT keep prefix logic intact.
        # However, our regexes EXPECT the prefix (BE, FR, etc.)
        # The frontend/user might not send spaces, but better safe.
        
        # NOTE: The regexes above expect clean input but WITH PREFIX.
        # vat_number coming in might have spaces.
        vat_clean_for_regex = vat_number.replace(' ', '').upper()
        
        regex_pattern = self.STRICT_REGEX_MAP.get(country_code)
        if regex_pattern:
            if not re.match(regex_pattern, vat_clean_for_regex):
                logger.warning(f"❌ VAT Regex mismatch for {country_code}: {vat_clean_for_regex}")
                return {
                    'valid': False,
                    'verified': False,
                    'status': 'invalid',
                    'message': f'Format invalide pour {country_code}. Attendu: {regex_pattern}'
                }
            logger.info(f"✅ VAT Regex match for {country_code}")
        
        # EU countries - use VIES
        if country_code in ['FR', 'BE', 'LU', 'DE', 'IT', 'ES']:
            return await self._validate_eu_vies(vat_number, country_code)
        
        # Switzerland - use UID
        elif country_code == 'CH':
            return await self._validate_swiss_uid(vat_number)
        
        # UK - HMRC API validation
        elif country_code == 'GB':
            return await self._validate_uk_format(vat_number)
        
        # Canada/Quebec - format validation
        elif country_code == 'CA':
            return self._validate_canada_format(vat_number)
        
        # USA - EIN validation
        elif country_code == 'US':
            # Check if a tax number is provided (EIN)
            if vat_number and len(vat_number) > 0:
                return self._validate_usa_ein(vat_number)
            else:
                return {'valid': True, 'verified': True, 'status': 'verified', 'message': 'USA has no VAT (B2B services)'}
        
        else:
            return {'valid': True, 'verified': False, 'status': 'format_only', 'message': 'No validator for this country'}
    
    async def _validate_eu_vies(self, vat_number: str, country_code: str) -> Dict:
        """Validate VAT using EU VIES system"""
        try:
            if not self.vies_client:
                logger.warning("VIES client not initialized, fallback to format validation")
                return {'valid': True, 'verified': False, 'status': 'pending', 'message': 'VIES unavailable'}
            
            # Clean VAT number - remove country code prefix if present
            vat_clean = vat_number.replace(country_code, '').replace(' ', '').replace('-', '').replace('.', '')
            
            # Call VIES API
            result = self.vies_client.service.checkVat(
                countryCode=country_code,
                vatNumber=vat_clean
            )
            
            if result.valid:
                return {
                    'valid': True,
                    'verified': True,
                    'status': 'verified',
                    'company_name': result.name if hasattr(result, 'name') else None,
                    'address': result.address if hasattr(result, 'address') else None,
                    'message': f'VAT verified via VIES'
                }
            else:
                return {
                    'valid': False,
                    'verified': True,
                    'status': 'invalid',
                    'message': f'VAT number not found in VIES registry'
                }
        
        except Fault as e:
            logger.error(f"VIES SOAP fault: {e}")
            # API error - don't block registration
            return {'valid': True, 'verified': False, 'status': 'pending', 'message': 'VIES verification failed, will retry later'}
        
        except Exception as e:
            logger.error(f"VIES validation error: {e}")
            return {'valid': True, 'verified': False, 'status': 'pending', 'message': 'VIES temporarily unavailable'}
    
    async def _validate_swiss_uid(self, uid_number: str) -> Dict:
        """Validate Swiss UID/TVA"""
        try:
            # Swiss UID format: CHE-XXX.XXX.XXX TVA
            # For now, validate format only (API requires authentication)
            pattern = r'^CHE-[0-9]{3}\.[0-9]{3}\.[0-9]{3}\s*(TVA|MWST|IVA)?$'
            if re.match(pattern, uid_number, re.IGNORECASE):
                return {
                    'valid': True,
                    'verified': False,
                    'status': 'format_only',
                    'message': 'Swiss UID format valid (full verification requires API key)'
                }
            else:
                return {
                    'valid': False,
                    'verified': False,
                    'status': 'invalid',
                    'message': 'Invalid Swiss UID format'
                }
        except Exception as e:
            logger.error(f"Swiss UID validation error: {e}")
            return {'valid': True, 'verified': False, 'status': 'pending', 'message': 'UID verification unavailable'}
    
    async def _validate_uk_format(self, vat_number: str) -> Dict:
        """Validate UK VAT using HMRC API with OAuth token"""
        try:
            # UK VAT: GB + 9 digits (or optional prefix)
            vat_clean = vat_number.replace('GB', '').replace('gb', '').replace(' ', '')
            
            # Format validation first
            if not re.match(r'^[0-9]{9}$', vat_clean):
                return {
                    'valid': False,
                    'verified': False,
                    'status': 'invalid',
                    'message': 'Invalid UK VAT format (must be 9 digits)'
                }
            
            # Try HMRC VAT API with Bearer token if available
            if self.hmrc_token:
                try:
                    # HMRC API v2.0 with OAuth Bearer token
                    headers = {
                        "Authorization": f"Bearer {self.hmrc_token}",
                        "Accept": "application/vnd.hmrc.2.0+json"
                    }
                    
                    response = requests.get(
                        f"https://api.service.hmrc.gov.uk/organisations/vat/check-vat-number/lookup/GB{vat_clean}",
                        headers=headers,
                        timeout=10
                    )
                    
                    if response.status_code == 200:
                        data = response.json()
                        return {
                            'valid': True,
                            'verified': True,
                            'status': 'verified',
                            'company_name': data.get('target', {}).get('name'),
                            'address': data.get('target', {}).get('address', {}).get('line1'),
                            'message': 'UK VAT verified via HMRC API v2.0'
                        }
                    elif response.status_code == 404:
                        return {
                            'valid': False,
                            'verified': True,
                            'status': 'invalid',
                            'message': 'UK VAT number not found in HMRC registry'
                        }
                    else:
                        logger.warning(f"HMRC API returned {response.status_code}: {response.text}")
                except Exception as e:
                    logger.warning(f"HMRC VAT API error: {e}")
            
            # Fallback to format validation
            return {
                'valid': True,
                'verified': False,
                'status': 'format_only',
                'message': 'UK VAT format valid (HMRC API token not configured or unavailable)'
            }
            
        except Exception as e:
            logger.error(f"UK VAT validation error: {e}")
            return {'valid': True, 'verified': False, 'status': 'pending', 'message': 'UK VAT verification unavailable'}
    
    async def validate_uk_company_number(self, company_number: str) -> Dict:
        """Validate UK Company Number using Companies House API"""
        try:
            # Clean company number
            company_clean = company_number.strip().upper()
            
            # Format validation: 8 characters (can be alphanumeric)
            if not re.match(r'^[A-Z0-9]{8}$', company_clean):
                return {
                    'valid': False,
                    'verified': False,
                    'status': 'invalid',
                    'message': 'Invalid UK Company Number format (must be 8 alphanumeric characters)'
                }
            
            # Call Companies House API
            try:
                from requests.auth import HTTPBasicAuth
                
                response = requests.get(
                    f"{self.UK_COMPANIES_HOUSE_API}/company/{company_clean}",
                    auth=HTTPBasicAuth(self.uk_client_id, ''),  # API key as username, empty password
                    timeout=5
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return {
                        'valid': True,
                        'verified': True,
                        'status': 'verified',
                        'company_name': data.get('company_name'),
                        'address': f"{data.get('registered_office_address', {}).get('address_line_1', '')}, {data.get('registered_office_address', {}).get('postal_code', '')}",
                        'message': 'UK Company Number verified via Companies House'
                    }
                elif response.status_code == 404:
                    return {
                        'valid': False,
                        'verified': True,
                        'status': 'invalid',
                        'message': 'UK Company Number not found in Companies House registry'
                    }
            except Exception as e:
                logger.warning(f"Companies House API error: {e}")
            
            # Fallback to format validation
            return {
                'valid': True,
                'verified': False,
                'status': 'format_only',
                'message': 'UK Company Number format valid (Companies House API temporarily unavailable)'
            }
            
        except Exception as e:
            logger.error(f"UK Company Number validation error: {e}")
            return {'valid': True, 'verified': False, 'status': 'pending', 'message': 'Company Number verification unavailable'}
    
    def _validate_canada_format(self, tax_number: str) -> Dict:
        """Validate Canadian GST/TVQ/NEQ format"""
        # NEQ: 10 digits starting with "11" (Numéro d'Entreprise du Québec)
        # TVQ: 10 digits + TQ0001
        # GST: 9 digits + RT0001
        
        # Clean input
        tax_clean = tax_number.replace(' ', '').replace('-', '').upper()
        
        # Check NEQ format (10 digits starting with 11)
        if re.match(r'^11[0-9]{8}$', tax_clean):
            return {
                'valid': True,
                'verified': False,
                'status': 'format_only',
                'message': 'Quebec NEQ format valid (API verification not available)'
            }
        
        # Check TVQ format
        elif re.match(r'^[0-9]{10}TQ[0-9]{4}$', tax_clean):
            return {
                'valid': True,
                'verified': False,
                'status': 'format_only',
                'message': 'Quebec TVQ format valid (Revenu Quebec API verification requires credentials)'
            }
        
        # Check GST format
        elif re.match(r'^[0-9]{9}RT[0-9]{4}$', tax_clean):
            return {
                'valid': True,
                'verified': False,
                'status': 'format_only',
                'message': 'Canada GST format valid (CRA API verification requires credentials)'
            }
        
        else:
            return {
                'valid': False,
                'verified': False,
                'status': 'invalid',
                'message': 'Invalid Quebec NEQ/TVQ/GST format'
            }
    
    def _validate_usa_ein(self, ein_number: str) -> Dict:
        """Validate USA EIN (Employer Identification Number) format"""
        # EIN format: XX-XXXXXXX (9 digits, typically displayed with hyphen)
        
        # Clean input
        ein_clean = ein_number.replace(' ', '').replace('-', '')
        
        # Check EIN format (9 digits)
        if re.match(r'^[0-9]{9}$', ein_clean):
            return {
                'valid': True,
                'verified': False,
                'status': 'format_only',
                'message': 'USA EIN format valid (IRS TIN Matching API verification requires credentials)'
            }
        else:
            return {
                'valid': False,
                'verified': False,
                'status': 'invalid',
                'message': 'Invalid USA EIN format (must be 9 digits)'
            }


# Global instance
vat_validator = VATValidator()
