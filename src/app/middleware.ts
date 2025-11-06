// import { NextResponse, type NextRequest } from 'next/server';
// import { Division } from '@/app/types'; 

// const rolePermissions: Record<Division, string[]> = {
//   [Division.Vendor]: [
//     '/vendor-upload', 
//     '/history', 
//     '/progress'
//   ],
//   [Division.Dalkon]: [
//     '/upload-management', 
//     '/history', 
//     '/progress'
//   ],
//   [Division.Manager]: [
//     '/upload-management', 
//     '/history', 
//     '/progress'
//   ],
//   [Division.Engineer]: [
//     '/approval', 
//     '/history', 
//     '/progress'
//   ],
// };

// // Rute ini BISA diakses oleh siapa saja, termasuk GUEST.
// const publicRoutes = [
//   '/', 
//   '/auth/login',
// ];

// // --- 3. Fungsi Middleware Utama ---
// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   // --- BAGIAN A: Dapatkan Role User ---
//   //
//   // !!! PENTING: Ganti bagian ini dengan logika autentikasi Anda !!!
//   //
//   // Kode di bawah ini HANYA SIMULASI (menggunakan cookie 'user-role').
//   // Di aplikasi nyata, Anda akan memverifikasi sesi (session)
//   // menggunakan NextAuth, Iron Session, Lucia, atau library auth Anda.
//   //
//   // Contoh jika pakai NextAuth.js:
//   // const session = await auth(); // (dari next-auth)
//   // const userRole = session?.user?.division || Division.Guest;
//   //
//   // Simulasi (TIDAK AMAN, HANYA UNTUK CONTOH):
//   const roleCookie = request.cookies.get('user-role');
//   const userRole: Division = (roleCookie?.value as Division) || Division.Guest;
//   //
//   // !!! BATAS AKHIR BAGIAN YANG PERLU DIGANTI !!!
//   //


//   const isPublicRoute = publicRoutes.some(route => pathname === route);
//   if (isPublicRoute) {
//     // Jika ya, izinkan akses
//     return NextResponse.next();
//   }

//   if (userRole === Division.Guest) {
//     const loginUrl = new URL('/login', request.url);
//     loginUrl.searchParams.set('redirect_to', pathname);
//     return NextResponse.redirect(loginUrl);
//   }

//   const allowedPaths = rolePermissions[userRole] || [];
  
//   // Gunakan startsWith agar rute seperti /history/123 tetap diizinkan
//   const isAuthorized = allowedPaths.some(path => pathname.startsWith(path));

//   if (isAuthorized) {
//     // Izin diberikan, lanjutkan ke halaman
//     return NextResponse.next();
//   }

//   console.warn(`Akses Ditolak: divisi ${userRole} ke ${pathname}`);
//   const homeUrl = new URL('/', request.url);
//   return NextResponse.redirect(homeUrl);
// }

// export const config = {
//   matcher: [
//     /*
//      * Cocokkan semua request path kecuali yang dimulai dengan:
//      * - api (rute API)
//      * - _next/static (file statis)
//      * - _next/image (file optimasi gambar)
//      * - favicon.ico (file favicon)
//      */
//     '/((?!api|_next/static|_next/image|favicon.ico).*)',
//   ],
// };