"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { FileText, Upload, Eye, Loader2, Trash2, X, CheckCircle } from "lucide-react";

const documentTypes = [
  "Offer Letter",
  "Appointment Letter",
  "Salary Slip",
  "Experience Letter",
  "NOC",
  "ID Proof",
  "Address Proof",
  "Other",
];

export default function EmployeeDocuments({ employeeId, token }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [signedUrls, setSignedUrls] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (employeeId) fetchDocuments();
  }, [employeeId]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchDocuments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("employee_id", employeeId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setDocuments(data);
      // Signed URLs fetch karo
      const urls = {};
      for (const doc of data) {
        const { data: signed } = await supabase.storage
          .from("documents")
          .createSignedUrl(doc.file_url, 60 * 60);
        if (signed) urls[doc.id] = signed.signedUrl;
      }
      setSignedUrls(urls);
    }
    setLoading(false);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${employeeId}/${Date.now()}.${fileExt}`;

      // Supabase storage mein upload
      const { data: storageData, error: storageError } = await supabase.storage
        .from("documents")
        .upload(fileName, file);

      if (storageError) throw storageError;

      // documents table mein insert
      const { error: dbError } = await supabase.from("documents").insert({
        employee_id: employeeId,
        title,
        file_url: storageData.path,
        uploaded_by: "HR",
        document_type: documentType || null,
      });

      if (dbError) throw dbError;

      showToast("Document uploaded successfully!");
      setFile(null);
      setTitle("");
      setDocumentType("");
      e.target.reset();
      fetchDocuments();
    } catch (err) {
      showToast(err.message || "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (doc) => {
    const confirmed = window.confirm("Delete this document?");
    if (!confirmed) return;

    try {
      // Storage se delete
      await supabase.storage.from("documents").remove([doc.file_url]);

      // DB se delete
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", doc.id);

      if (error) throw error;

      showToast("Document deleted!");
      fetchDocuments();
    } catch (err) {
      showToast(err.message || "Delete failed", "error");
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="text-sm">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
            toast.type === "error"
              ? "bg-red-100 text-red-700 border border-red-200"
              : "bg-green-100 text-green-700 border border-green-200"
          }`}
        >
          {toast.type === "error" ? <X size={16} /> : <CheckCircle size={16} />}
          {toast.message}
        </div>
      )}

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="border border-[var(--border)] rounded-xl p-4 mb-5 bg-[var(--background)]">
        <h3 className="text-sm font-semibold text-[var(--text)] mb-3 flex items-center gap-2">
          <Upload size={15} /> Upload Document
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Title */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--text-muted)]">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Offer Letter Jan 2025"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="border border-[var(--border)] bg-[var(--card)] text-[var(--text)] rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Document Type */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-[var(--text-muted)]">Type</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="border border-[var(--border)] bg-[var(--card)] text-[var(--text)] rounded-lg p-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Select Type --</option>
              {documentTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* File */}
          <div className="flex flex-col gap-1 col-span-2">
            <label className="text-xs text-[var(--text-muted)]">
              Choose File <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={(e) => setFile(e.target.files[0])}
              required
              className="border border-[var(--border)] bg-[var(--card)] text-[var(--text)] rounded-lg p-1.5 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-indigo-900 file:text-white hover:file:bg-indigo-800 cursor-pointer"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="flex items-center gap-2 bg-indigo-900 text-white text-xs font-medium py-2 px-4 rounded-lg hover:bg-indigo-800 transition disabled:opacity-60"
        >
          {uploading ? (
            <><Loader2 size={13} className="animate-spin" /> Uploading...</>
          ) : (
            <><Upload size={13} /> Upload</>
          )}
        </button>
      </form>

      {/* Documents List */}
      <h3 className="text-sm font-semibold text-[var(--text)] mb-3">
        Uploaded Documents
        <span className="ml-2 text-xs font-normal text-[var(--text-muted)]">
          ({documents.length})
        </span>
      </h3>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-[var(--text-muted)]">
          <Loader2 size={20} className="animate-spin mr-2" /> Loading...
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-[var(--text-muted)]">
          <FileText size={32} className="mb-2 opacity-30" />
          <p className="text-xs">No documents uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between border border-[var(--border)] rounded-xl p-3 bg-[var(--background)] hover:shadow-sm transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center shrink-0">
                  <FileText size={15} className="text-indigo-700 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="font-medium text-[var(--text)] text-xs">{doc.title}</p>
                  <p className="text-[var(--text-muted)] text-xs">
                    {doc.document_type && `${doc.document_type} · `}
                    {formatDate(doc.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={signedUrls[doc.id] || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-indigo-700 dark:text-indigo-400 hover:underline"
                >
                  <Eye size={13} /> View
                </a>
                <button
                  onClick={() => handleDelete(doc)}
                  className="text-red-500 hover:text-red-600 transition"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}