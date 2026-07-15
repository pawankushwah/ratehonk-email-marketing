export type Country = {
  name: string;
  code: string;
  dialCode: string;
  flagUrl: string;
};

export const countries: Country[] = [
  { name: 'United States', code: 'US', dialCode: '+1', flagUrl: 'https://flagcdn.com/us.svg' },
  { name: 'India', code: 'IN', dialCode: '+91', flagUrl: 'https://flagcdn.com/in.svg' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flagUrl: 'https://flagcdn.com/gb.svg' },
  { name: 'Canada', code: 'CA', dialCode: '+1', flagUrl: 'https://flagcdn.com/ca.svg' },
  { name: 'Australia', code: 'AU', dialCode: '+61', flagUrl: 'https://flagcdn.com/au.svg' },
  { name: 'Germany', code: 'DE', dialCode: '+49', flagUrl: 'https://flagcdn.com/de.svg' },
  { name: 'France', code: 'FR', dialCode: '+33', flagUrl: 'https://flagcdn.com/fr.svg' },
  { name: 'Brazil', code: 'BR', dialCode: '+55', flagUrl: 'https://flagcdn.com/br.svg' },
  { name: 'Japan', code: 'JP', dialCode: '+81', flagUrl: 'https://flagcdn.com/jp.svg' },
  { name: 'China', code: 'CN', dialCode: '+86', flagUrl: 'https://flagcdn.com/cn.svg' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27', flagUrl: 'https://flagcdn.com/za.svg' },
  { name: 'Nigeria', code: 'NG', dialCode: '+234', flagUrl: 'https://flagcdn.com/ng.svg' },
  { name: 'Mexico', code: 'MX', dialCode: '+52', flagUrl: 'https://flagcdn.com/mx.svg' },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971', flagUrl: 'https://flagcdn.com/ae.svg' },
  { name: 'Singapore', code: 'SG', dialCode: '+65', flagUrl: 'https://flagcdn.com/sg.svg' },
];
