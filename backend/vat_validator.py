"""
VAT and Company Number Validation Module
Validates business identifiers using official APIs
"""
import re
import logging
from typing import Dict, Optional
import requests
from zeep import Client
from zeep.exceptions import Fault

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
    
    def __init__(self):
        self.vies_client = None
        try:
            self.vies_client = Client(self.VIES_URL)
        except Exception as e:
            logger.error(f"Failed to initialize VIES client: {e}")
        
        # UK Companies House credentials
        self.uk_client_id = "1a0c89b8-6689-40f9-8ccf-c2dae0f63044"
        self.uk_client_secret = "i3DhDNihRfCDwybxMcP/eZ2hWB1ndnMsB7WthxbDv1A"
    
    async def validate_vat(self, vat_number: str, country_code: str) -> Dict:
        """
        Main validation function - routes to appropriate validator
        
        Returns:
        {
            'valid': bool,
            'verified': bool,  # True if API verification succeeded
            'status': 'verified' | 'pending' | 'format_only',
            'company_name': str (optional),
            'address': str (optional),
            'message': str (optional)
        }
        """
        country_code = country_code.upper()
        
        # EU countries - use VIES
        if country_code in ['FR', 'BE', 'LU', 'DE', 'IT', 'ES']:
            return await self._validate_eu_vies(vat_number, country_code)
        
        # Switzerland - use UID
        elif country_code == 'CH':
            return await self._validate_swiss_uid(vat_number)
        
        # UK - format validation (API later)
        elif country_code == 'GB':
            return self._validate_uk_format(vat_number)
        
        # Canada/Quebec - format validation
        elif country_code == 'CA':
            return self._validate_canada_format(vat_number)
        
        # USA - no VAT
        elif country_code == 'US':
            return {'valid': True, 'verified': True, 'status': 'verified', 'message': 'USA has no VAT'}
        
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
        """Validate UK VAT using HMRC API"""
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
            
            # Try HMRC VAT API (public endpoint, no auth needed)
            try:
                response = requests.get(
                    f"{self.UK_VAT_API}/{vat_clean}",
                    timeout=5
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return {
                        'valid': True,
                        'verified': True,
                        'status': 'verified',
                        'company_name': data.get('target', {}).get('name'),
                        'address': data.get('target', {}).get('address'),
                        'message': 'UK VAT verified via HMRC'
                    }
                elif response.status_code == 404:
                    return {
                        'valid': False,
                        'verified': True,
                        'status': 'invalid',
                        'message': 'UK VAT number not found in HMRC registry'
                    }
            except Exception as e:
                logger.warning(f"HMRC VAT API error: {e}")
            
            # Fallback to format validation
            return {
                'valid': True,
                'verified': False,
                'status': 'format_only',
                'message': 'UK VAT format valid (HMRC API temporarily unavailable)'
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
        """Validate Canadian GST/TVQ format"""
        # TVQ: 10 digits + TQ0001
        # GST: 9 digits + RT0001
        
        if re.match(r'^[0-9]{10}TQ[0-9]{4}$', tax_number):
            return {
                'valid': True,
                'verified': False,
                'status': 'format_only',
                'message': 'Quebec TVQ format valid (Revenu Quebec API verification requires credentials)'
            }
        elif re.match(r'^[0-9]{9}RT[0-9]{4}$', tax_number):
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
                'message': 'Invalid Quebec TVQ/GST format'
            }


# Global instance
vat_validator = VATValidator()
