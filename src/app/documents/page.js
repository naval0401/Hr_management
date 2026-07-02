"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { FileText, Upload, Search, Eye, Loader2, X, CheckCircle } from "lucide-react";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [file, setFile] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signedUrls, setSignedUrls] = useState({});

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

  useEffect(() => {
    fetchDocuments();
    fetchEmployees();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("documents")
      .select(`*, employees(employee_name, employee_id, designation)`)
      .order("created_at", { ascending: false });

    if (!error) {
      setDocuments(data || []);
      const urls = {};
      for (const doc of data || []) {
        const { data: signed } = await supabase.storage
          .from("documents")
          .createSignedUrl(doc.file_url, 60 * 60);
        if (signed) urls[doc.id] = signed.signedUrl;
      }
      setSignedUrls(urls);
    }
    setLoading(false);
  };

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from("employees")
      .select("id, employee_name, employee_id, designation")
      .eq("status", true)
      .order("employee_name");

    if (!error) setEmployees(data || []);
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !selectedEmployee || !title) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${selectedEmployee}/${Date.now()}.${fileExt}`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from("documents")
        .upload(fileName, file);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase.from("documents").insert({
        employee_id: selectedEmployee,
        title: title,
        file_url: storageData.path,
        uploaded_by: "HR",
        document_type: documentType,
      });

      if (dbError) throw dbError;

      showToast("Document uploaded successfully!");
      setFile(null);
      setSelectedEmployee("");
      setDocumentType("");
      setTitle("");
      e.target.reset();
      fetchDocuments();
    } catch (err) {
      showToast(err.message || "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };


  const filteredDocuments = documents.filter((doc) => {
    const empName = doc.employees?.employee_name?.toLowerCase() || "";
    const docTitle = doc.title?.toLowerCase() || "";
    const q = searchQuery.toLowerCase();
    return empName.includes(q) || docTitle.includes(q);
  });

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="pt-16 p-6 min-h-screen bg-[var(--background)] text-[var(--text)]">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
            toast.type === "error"
              ? "bg-red-100 text-red-700 border border-red-200"
              : "bg-green-100 text-green-700 border border-green-200"
          }`}
        >
          {toast.type === "error" ? (
            <X size={16} />
          ) : (
            <CheckCircle size={16} />
          )}
          {toast.message}
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8 bg-[var(--card)] border border-[var(--border)] p-5 rounded-xl shadow-sm flex items-center gap-4">
        <div className="w-11 h-11 bg-indigo-900 rounded-xl flex items-center justify-center text-white shrink-0">
          <FileText size={22} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-[var(--text)]">Documents</h1>
          <p className="text-xs text-[var(--text-muted)]">
            Upload and manage employee documents
          </p>
        </div>
      </div>

      {/* Upload Form */}
      <form
        onSubmit={handleUpload}
        className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm p-6 mb-8"
      >
        <h2 className="text-base font-semibold mb-5 text-[var(--text)]">
          Upload Document
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Employee Dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--text-muted)]">
              Select Employee <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              required
              className="border border-[var(--border)] bg-[var(--background)] text-[var(--text)] rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Select Employee --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.employee_name} ({emp.employee_id})
                </option>
              ))}
            </select>
          </div>

          {/* Document Type */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--text-muted)]">
              Document Type
            </label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="border border-[var(--border)] bg-[var(--background)] text-[var(--text)] rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- Select Type --</option>
              {documentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--text-muted)]">
              Document Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Offer Letter - Jan 2025"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="border border-[var(--border)] bg-[var(--background)] text-[var(--text)] rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* File Input */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--text-muted)]">
              Choose File <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={(e) => setFile(e.target.files[0])}
              required
              className="border border-[var(--border)] bg-[var(--background)] text-[var(--text)] rounded-lg p-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-indigo-900 file:text-white hover:file:bg-indigo-800 cursor-pointer"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="flex items-center gap-2 bg-indigo-900 text-white text-sm font-medium py-2.5 px-5 rounded-lg hover:bg-indigo-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Uploading...
            </>
          ) : (
            <>
              <Upload size={16} /> Upload Document
            </>
          )}
        </button>
      </form>

      {/* Documents List */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h2 className="text-base font-semibold text-[var(--text)]">
            All Documents
            <span className="ml-2 text-xs font-normal text-[var(--text-muted)]">
              ({filteredDocuments.length})
            </span>
          </h2>

          {/* Search */}
          <div className="flex items-center gap-2 border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--background)] w-full sm:w-64">
            <Search size={14} className="text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search by employee or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-sm text-[var(--text)] focus:outline-none w-full"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-[var(--text-muted)]">
            <Loader2 size={24} className="animate-spin mr-2" />
            Loading documents...
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-[var(--text-muted)]">
            <FileText size={40} className="mb-3 opacity-30" />
            <p className="text-sm">No documents found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="border border-[var(--border)] rounded-xl p-5 flex flex-col gap-3 hover:shadow-md transition bg-[var(--background)]"
              >
                {/* Icon + Title */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-indigo-700 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text)] leading-tight">
                      {doc.title}
                    </h3>
                    {doc.document_type && (
                      <span className="text-xs text-indigo-700 dark:text-indigo-400 font-medium">
                        {doc.document_type}
                      </span>
                    )}
                  </div>
                </div>

                {/* Employee Info */}
                <div className="text-xs text-[var(--text-muted)] space-y-0.5">
                  <p className="font-medium text-[var(--text)]">
                    {doc.employees?.employee_name || "—"}
                  </p>
                  <p>{doc.employees?.employee_id} · {doc.employees?.designation}</p>
                  <p>Uploaded: {formatDate(doc.created_at)}</p>
                </div>

                {/* View Button */}
                <a
                  href={signedUrls[doc.id] || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-400 hover:underline mt-auto"
                >
                  <Eye size={13} /> View Document
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}