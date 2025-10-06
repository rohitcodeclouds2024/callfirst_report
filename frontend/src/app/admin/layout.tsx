import Toaster from "./../../components/Toaster";
import AdminLayout from "../../layouts/AdminLayout";
import AssignAuthToken from "@/components/authSet/AssignAuthToken";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AdminLayout>
      <AssignAuthToken />
      {children} <Toaster />
    </AdminLayout>
  );
}
