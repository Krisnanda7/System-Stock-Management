"use client";

export default function ReportClient() {
  function handlePrint() {
    window.print();
  }

  return (
    <div className="flex items-center justify-end mb-6 print:hidden">
      <button
        type="button"
        onClick={handlePrint}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
      >
        Cetak Laporan
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9V2h12v7" />
          <path d="M6 18H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-2" />
          <path d="M6 14h12" />
          <path d="M9 18h6" />
        </svg>
      </button>
    </div>
  );
}
