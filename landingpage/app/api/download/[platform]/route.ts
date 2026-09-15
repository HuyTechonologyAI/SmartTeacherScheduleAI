import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const platformLower = (platform || '').toLowerCase();

  let targetUrl = '/downloads/SmartTeacherSchedule_v2.1.0_Release.apk';

  switch (platformLower) {
    case 'android':
    case 'apk':
      targetUrl = '/downloads/SmartTeacherSchedule_v2.1.0_Release.apk';
      break;
    case 'windows':
    case 'exe':
    case 'setup':
      targetUrl = '/downloads/SmartTeacherSchedule_Setup_v2.1.0.exe';
      break;
    case 'portable':
      targetUrl = '/downloads/SmartTeacherSchedule_v2.1.0_Portable.exe';
      break;
    case 'aab':
      targetUrl = '/releases/SmartTeacherSchedule_v2.1.0_Release.aab';
      break;
    case 'zip':
    case 'desktop':
      targetUrl = '/releases/SmartTeacherSchedule_v2.1.0_Desktop.zip';
      break;
    default:
      targetUrl = '/downloads/SmartTeacherSchedule_v2.1.0_Release.apk';
      break;
  }

  return NextResponse.redirect(new URL(targetUrl, request.url), 302);
}
