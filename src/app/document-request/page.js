"use client";

import { useEffect, useState } from "react";
import { FileText, Send, Clock, CheckCircle, XCircle, Eye, Loader2 } from "lucide-react";
import keycloak from "@/lib/keycloak";
import { supabase } from "@/lib/supabase";

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

export default function DocumentRequestPage() {
  const [requests, setRequests] = useState([]);
  const [myDocuments, setMyDocuments] = useState([]);
  const [signedUrls, setSignedUrls] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    document_type: "",
    reason: "",
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (keycloak?.authenticated && keycloak?.token) {
      fetchRequests();
      fetchMyDocuments();
    }
  }, [keycloak?.authenticated]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (keycloak?.authenticated) {
        keycloak.updateToken(30).catch(() => {
          keycloak.logout();
        });
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/document-request", {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("FETCH REQUESTS ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyDocuments = async () => {
    try {
      const res = await fetch("/api/documents", {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      });
      const data = await res.json();
      const docs = Array.isArray(data) ? data : [];
      setMyDocuments(docs);

      // Signed URLs fetch karo
      const urls = {};
      for (const doc of docs) {
        const { data: signed } = await supabase.storage
          .from("documents")
          .createSignedUrl(doc.file_url, 60 * 60);
        if (signed) urls[doc.id] = signed.signedUrl;
      }
      setSignedUrls(urls);
    } catch (err) {
      console.error("FETCH DOCUMENTS ERROR:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.document_type || !formData.reason) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/document-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${keycloak.token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Request failed");

      showToast("Request submitted successfully!");
      setFormData({ document_type: "", reason: "" });
      fetchRequests();
    } catch (err) {
      showToast(err.message || "Something went wrong", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const statusConfig = {
    pending: {
      icon: <Clock size={13} />,
      class: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    approved: {
      icon: <CheckCircle size={13} />,
      class: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    },
    rejected: {
      icon: <XCircle size={13} />,
      class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    },
  };

  return (
    <div className="pt-16 p-6 min-h-screen bg-[var(--background)] text-[var(--text)]">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border ${
          toast.type === "error"
            ? "bg-red-100 text-red-700 border-red-200"
            : "bg-green-100 text-green-700 border-green-200"
        }`}>
          {toast.type === "error" ? <XCircle size={16} /> : <CheckCircle size={16} />}
          {toast.message}
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8 bg-[var(--card)] border border-[var(--border)] p-5 rounded-xl shadow-sm flex items-center gap-4">
        <div className="w-11 h-11 bg-indigo-900 rounded-xl flex items-center justify-center text-white shrink-0">
          <FileText size={22} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-[var(--text)]">Document Requests</h1>
          <p className="text-xs text-[var(--text-muted)]">
            Request documents from HR and view your uploaded documents
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT — Request Form + My Requests */}
        <div className="space-y-6">

          {/* Request Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm p-6"
          >
            <h2 className="text-base font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <Send size={16} /> New Request
            </h2>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[var(--text-muted)]">
                  Document Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.document_type}
                  onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
                  required
                  className="border border-[var(--border)] bg-[var(--background)] text-[var(--text)] rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Select Document Type --</option>
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[var(--text-muted)]">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Why do you need this document?"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                  className="border border-[var(--border)] bg-[var(--background)] text-[var(--text)] rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-indigo-900 text-white text-sm font-medium py-2.5 px-5 rounded-lg hover:bg-indigo-800 transition disabled:opacity-60 w-fit"
              >
                {submitting ? (
                  <><Loader2 size={15} className="animate-spin" /> Submitting...</>
                ) : (
                  <><Send size={15} /> Submit Request</>
                )}
              </button>
            </div>
          </form>

          {/* My Requests */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm p-6">
            <h2 className="text-base font-semibold text-[var(--text)] mb-4">
              My Requests
              <span className="ml-2 text-xs font-normal text-[var(--text-muted)]">
                ({requests.length})
              </span>
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-8 text-[var(--text-muted)]">
                <Loader2 size={20} className="animate-spin mr-2" /> Loading...
              </div>
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-[var(--text-muted)]">
                <FileText size={32} className="mb-2 opacity-30" />
                <p className="text-xs">No requests submitted yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => {
                  const status = req.status?.toLowerCase() || "pending";
                  const config = statusConfig[status] || statusConfig.pending;
                  return (
                    <div
                      key={req.id}
                      className="border border-[var(--border)] rounded-xl p-4 bg-[var(--background)]"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-[var(--text)]">
                          {req.document_type}
                        </p>
                        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${config.class}`}>
                          {config.icon} {req.status || "pending"}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-muted)]">{req.reason}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        {formatDate(req.created_at)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — My Documents */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm p-6">
          <h2 className="text-base font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
            <FileText size={16} /> My Documents
            <span className="text-xs font-normal text-[var(--text-muted)]">
              ({myDocuments.length})
            </span>
          </h2>

          {myDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-[var(--text-muted)]">
              <FileText size={36} className="mb-2 opacity-30" />
              <p className="text-xs">No documents uploaded yet</p>
              <p className="text-xs mt-1">HR will upload documents after approving your request</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between border border-[var(--border)] rounded-xl p-4 bg-[var(--background)] hover:shadow-sm transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center shrink-0">
                      <FileText size={16} className="text-indigo-700 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text)]">{doc.title}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {doc.document_type && `${doc.document_type} · `}
                        {formatDate(doc.created_at)}
                      </p>
                    </div>
                  </div>
                  <a
                    href={signedUrls[doc.id] || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-medium text-indigo-700 dark:text-indigo-400 hover:underline"
                  >
                    <Eye size={13} /> View
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}