import { NextResponse } from 'next/server';
import { adminAuth } from '../../../lib/firebaseAdmin';

export async function POST(request: Request) {
  try {
    const { uid } = await request.json();
    
    if (!uid) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await adminAuth.setCustomUserClaims(uid, { admin: true });

    return NextResponse.json({ success: true, message: 'Admin wristband successfully minted!' });
    
  } catch (error: any) {
    console.error('Error minting admin claim:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}