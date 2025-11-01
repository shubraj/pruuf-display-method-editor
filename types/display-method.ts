export interface DisplayMethod {
  '@context': string[];
  type: string[];
  credentialSubject: {
    id: string;
    [key: string]: any;
  };
  display?: {
    name?: string;
    description?: string;
    backgroundColor?: string;
    textColor?: string;
    // Privado/issuer-node specific fields
    title?: string;
    titleTextColor?: string;
    descriptionTextColor?: string;
    issuerName?: string;
    issuerTextColor?: string;
    backgroundImageUrl?: string;
    logo?: {
      url?: string;
      altText?: string;
      uri?: string;
      alt?: string;
    };
    backgroundImage?: {
      url?: string;
      altText?: string;
    };
    rendered?: {
      orientation?: 'horizontal' | 'vertical';
      template?: string;
    };
    [key: string]: any; // Allow additional properties
  };
}

export interface CredentialType {
  id: string;
  name: string;
  schema: {
    fields: Array<{
      key: string;
      label: string;
      type: 'string' | 'date' | 'number';
    }>;
  };
}

export interface TemplateDesign {
  credentialType: string;
  title?: string;
  description?: string;
  issuerName?: string;
  primaryColor: string;
  accentColor: string;
  logo?: File;
  logoCid?: string;
  logoUrl?: string;
  logoAlt?: string;
  backgroundImage?: File;
  backgroundCid?: string;
  backgroundUrl?: string;
  orientation: 'horizontal' | 'vertical';
}

export interface PublishResult {
  success: boolean;
  cid: string;
  ipfsUrl: string;
  gatewayUrl: string;
  displayMethod: DisplayMethod;
}
