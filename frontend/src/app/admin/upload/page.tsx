"use client";
import Card from "@/components/ui/card/Card";
import { apiClient } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

interface User {
  id: number;
  email: string;
  contact_number: string;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [client, setClient] = useState("");
  const [clientList, setClientList] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchClientList = async (page, searchTerm) => {
      try {
        const { data } = await apiClient.get<{
          data: User[];
        }>("/clients", {
          params: { page, keyword: searchTerm },
        });

        setClientList(data.data || []);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };

    fetchClientList(1, "");
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !client) {
      toast.error("All fields are required");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("client_id", client);

    try {
      const res = await apiClient.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // explicitly tell axios
        },
      });

      toast.success("File uploaded successfully!");
      router.push("/admin/reports/upload");
    } catch {
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="upload-wrapper">
      <h3 className="text-2xl font-semibold mb-4">Upload CSV</h3>
      <Card>
        <form onSubmit={ handleUpload } className="grid grid-cols-12 gap-6">
          <div className="col-span-6">
            <select className="w-full px-4 py-3 text-sm leading-none border border-border rounded-md focus:outline-none focus:border-primary" value={ client } onChange={ ( e ) => setClient( e.target.value ) }>
              <option value="">Select Client</option>
              { clientList.map( ( c ) => (
                <option key={ c.id } value={ c.id }>
                  { c.name }
                </option>
              ) ) }
            </select>
          </div>
          <div className="col-span-6">
            <input type="file" accept=".csv,.xlsx" onChange={ ( e ) => setFile( e.target.files?.[ 0 ] || null ) } className="w-full px-4 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-primary" />
          </div>
          <div className="col-span-12 flex items-center justify-end gap-4">
            <a href="http://localhost:5010/upload/sample" className="text-primary underline">Download Sample</a>
            <button type="submit" className="px-4 py-2 bg-primary text-white border border-primary rounded-md hover:text-primary hover:bg-transparent transition-all duration-300">Upload</button>
          </div>
        </form>
      </Card>
    </div>
  );
}
