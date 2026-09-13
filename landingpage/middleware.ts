import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const COOKIE_ROLE_KEY = 'smart_auth_role';

/**
 * Next.js Edge Middleware: Kiểm soát phân quyền truy cập (RBAC) trước khi render
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const roleCookie = request.cookies.get(COOKIE_ROLE_KEY)?.value || 'GUEST';

  // 1. Kiểm soát Cổng Quản Lý Nhà Trường (/school)
  if (pathname.startsWith('/school')) {
    // Nếu học sinh cố tình truy cập /school -> Chuyển hướng về cổng học sinh kèm cảnh báo
    if (roleCookie === 'STUDENT') {
      const url = request.nextUrl.clone();
      url.pathname = '/student';
      url.searchParams.set('denied', 'school_restricted');
      return NextResponse.redirect(url);
    }

    // Nếu phụ huynh cố tình truy cập /school -> Chuyển hướng về cổng phụ huynh
    if (roleCookie === 'PARENT') {
      const url = request.nextUrl.clone();
      url.pathname = '/parent';
      url.searchParams.set('denied', 'school_restricted');
      return NextResponse.redirect(url);
    }

    // Nếu chưa xác thực quyền BGH: Cho phép request đi tiếp nhưng gắn cờ để trang hiển thị Khóa Cổng Xác Thực
    const response = NextResponse.next();
    const isPrincipal = roleCookie === 'PRINCIPAL';
    response.headers.set('x-is-principal', isPrincipal ? 'true' : 'false');
    return response;
  }

  // 2. Kiểm soát Cổng Nghiệp Vụ Giáo Viên (/app)
  if (pathname.startsWith('/app')) {
    // Học sinh không được vào trang nghiệp vụ giáo viên
    if (roleCookie === 'STUDENT') {
      const url = request.nextUrl.clone();
      url.pathname = '/student';
      url.searchParams.set('denied', 'teacher_app_restricted');
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/school/:path*',
    '/app/:path*'
  ],
};
