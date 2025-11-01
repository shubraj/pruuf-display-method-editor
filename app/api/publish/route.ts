import { NextRequest, NextResponse } from 'next/server';
import { publishTemplate } from '@/lib/display-method-generator';
import { TemplateDesign } from '@/types/display-method';

// Check authentication
function isAuthenticated(request: NextRequest): boolean {
  const authToken = request.cookies.get('auth_token')?.value;
  return !!authToken;
}

export async function POST(request: NextRequest) {
  // Check authentication
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      { error: 'Unauthorized. Please log in.' },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();

    const credentialType = formData.get('credentialType') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const issuerName = formData.get('issuerName') as string;
    const primaryColor = formData.get('primaryColor') as string;
    const accentColor = formData.get('accentColor') as string;
    const orientation = formData.get('orientation') as 'horizontal' | 'vertical';
    const logoAlt = formData.get('logoAlt') as string;
    const logo = formData.get('logo') as File | null;
    const backgroundImage = formData.get('backgroundImage') as File | null;

    if (!credentialType) {
      return NextResponse.json(
        { error: 'Credential type is required' },
        { status: 400 }
      );
    }

    const design: TemplateDesign = {
      credentialType,
      title: title || undefined,
      description: description || undefined,
      issuerName: issuerName || undefined,
      primaryColor: primaryColor || '#0125CF',
      accentColor: accentColor || '#FFFFFF',
      orientation: orientation || 'horizontal',
      logoAlt: logoAlt || undefined,
      logo: logo && logo.size > 0 ? logo : undefined,
      backgroundImage: backgroundImage && backgroundImage.size > 0 ? backgroundImage : undefined,
    };

    const result = await publishTemplate(design);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Publish API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to publish template',
      },
      { status: 500 }
    );
  }
}
