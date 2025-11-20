import VendorUploadPage from "./components/VendorUploadPage";
import api from "@/lib/axios";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function getResubmitDocsSSR() {
  const token = (await cookies()).get("access_token")?.value;
  if (!token) redirect("/login");

  // Inject token ke axios untuk server
  api.defaults.headers.common.Authorization = `Bearer ${token}`;

  try {
    // GUNAKAN ENDPOINT KHUSUS YANG PASTI RETURN DATA
    const { data } = await api.get("/documents/vendor/pending-correction");
    console.log( data);
    return data;
  } catch (err: any) {
    console.error("SSR fetch failed:", err.response?.data || err.message);
    if (err.response?.status === 401) redirect("/login");
    return [];
  }
}

export default async function Page() {
  const initialResubmitDocs = await getResubmitDocsSSR();
  return <VendorUploadPage initialResubmitDocs={initialResubmitDocs} />;
}