import { CredentialType } from '@/types/display-method';

export const CREDENTIAL_TYPES: Record<string, CredentialType> = {
  'proof-of-enrollment': {
    id: 'proof-of-enrollment',
    name: 'Proof of Enrollment',
    schema: {
      fields: [
        { key: 'name', label: 'Student Name', type: 'string' },
        { key: 'institution', label: 'Institution', type: 'string' },
        { key: 'program', label: 'Program', type: 'string' },
        { key: 'enrollmentDate', label: 'Enrollment Date', type: 'date' },
      ],
    },
  },
  'member-proof': {
    id: 'member-proof',
    name: 'Member Proof',
    schema: {
      fields: [
        { key: 'name', label: 'Member Name', type: 'string' },
        { key: 'organization', label: 'Organization', type: 'string' },
        { key: 'memberId', label: 'Member ID', type: 'string' },
        { key: 'membershipDate', label: 'Membership Date', type: 'date' },
      ],
    },
  },
  'certificate': {
    id: 'certificate',
    name: 'Certificate',
    schema: {
      fields: [
        { key: 'name', label: 'Recipient Name', type: 'string' },
        { key: 'course', label: 'Course', type: 'string' },
        { key: 'issuedDate', label: 'Issued Date', type: 'date' },
        { key: 'issuer', label: 'Issuer', type: 'string' },
      ],
    },
  },
};

export function getCredentialType(id: string): CredentialType | undefined {
  return CREDENTIAL_TYPES[id];
}

export function getAllCredentialTypes(): CredentialType[] {
  return Object.values(CREDENTIAL_TYPES);
}
