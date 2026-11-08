import { useState } from 'react';
import {
  FileText,
  Download,
  Image as ImageIcon,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import Header from '@/components/Header';
import { useApp } from '@/context/AppContext';
import { formatNumber, formatPercent, formatDateTime } from '@/utils/calculations';
import { OptimizationResult } from '@/types';

export default function Reports() {
  const { history, optimizationResult } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(
    optimizationResult?.result_id ?? null
  );
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Fall back to most recent optimizationResult if selected not found
  const selected: OptimizationResult | null =
    (selectedId ? history.find((h) => h.result_id === selectedId) : null) ??
    optimizationResult ??
    (history.length > 0 ? history[0] : null);

  const hasResult = !!selected;

  const showNotice = (msg: string) => {
    setExportNotice(msg);
    setTimeout(() => setExportNotice(null), 4000);
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download CSV
  const handleDownloadCSV = (res: OptimizationResult) => {
    const rows = [
      ['GreenShift Optimization Report'],
      ['Report ID', res.result_id],
      ['Date and Time', res.created_at || new Date().toISOString()],
      ['Fleet Configuration', `${res.total_servers} Servers`],
      ['Number of Servers', String(res.total_servers)],
      ['Total CO2 Before', formatNumber(res.total_co2_before, 4)],
      ['Total CO2 After', formatNumber(res.total_co2_after, 4)],
      ['Emission Difference %', formatNumber(res.emission_difference_percentage, 4)],
      ['Worst Ratio Before', formatNumber(res.worst_ratio_before, 4)],
      ['Worst Ratio After', formatNumber(res.worst_ratio_after, 4)],
      ['Workload Moved %', formatNumber(res.workload_moved_percentage, 4)],
      ['All Servers Within Threshold', String(res.all_servers_within_threshold)],
      ['Optimization Status', res.optimization_status],
      [],
      ['Server', 'Workload Before', 'Workload After', 'Shift', 'CO2 Before', 'CO2 After', 'Threshold', 'Status After'],
      ...res.server_results.map((s) => [
        s.server_name,
        formatNumber(s.workload_before, 4),
        formatNumber(s.workload_after, 4),
        formatNumber(s.workload_after - s.workload_before, 4),
        formatNumber(s.co2_before, 4),
        formatNumber(s.co2_after, 4),
        formatNumber(s.threshold, 4),
        s.status_after,
      ]),
    ];

    const csvContent = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, `greenshift-report-${res.result_id}.csv`);
    showNotice(`CSV report greenshift-report-${res.result_id}.csv downloaded.`);
  };

  // Download PDF
  const handleDownloadPDF = (res: OptimizationResult) => {
    const lines = [
      '====================================================================',
      '                     GREENSHIFT OPTIMIZATION REPORT                 ',
      '====================================================================',
      '',
      `Report ID:        ${res.result_id}`,
      `Date & Time:      ${formatDateTime(res.created_at)}`,
      `Fleet:            ${res.total_servers} Servers`,
      `Server Count:     ${res.total_servers}`,
      `Status:           ${res.optimization_status}`,
      '',
      '--------------------------------------------------------------------',
      'KEY METRICS',
      '--------------------------------------------------------------------',
      `Total CO2 (Before):      ${formatNumber(res.total_co2_before, 2)} kg`,
      `Total CO2 (After):       ${formatNumber(res.total_co2_after, 2)} kg`,
      `Emission Difference:     ${formatPercent(res.emission_difference_percentage, 2)}`,
      `Worst Ratio (Before):    ${formatNumber(res.worst_ratio_before, 2)}`,
      `Worst Ratio (After):     ${formatNumber(res.worst_ratio_after, 2)}`,
      `Workload Moved:          ${formatNumber(res.workload_moved_percentage, 1)}%`,
      `Within Thresholds:       ${res.all_servers_within_threshold ? 'YES' : 'NO'}`,
      '',
      '--------------------------------------------------------------------',
      'WORKLOAD REDISTRIBUTION SUMMARY',
      '--------------------------------------------------------------------',
      res.all_servers_within_threshold
        ? 'The fleet had sufficient clean capacity. Workload was redistributed to keep all servers within their carbon thresholds.'
        : 'The fleet exceeded its available clean capacity. Workload was redistributed to balance the worst-case overload across servers.',
      '',
      '--------------------------------------------------------------------',
      'SERVER BREAKDOWN',
      '--------------------------------------------------------------------',
      'Server           | Wkld (B) | Wkld (A) | CO2 (B) | CO2 (A) | Thresh | Status',
      '-----------------+----------+----------+---------+---------+--------+---------',
      ...res.server_results.map((s) => {
        const name = s.server_name.padEnd(16).slice(0, 16);
        const wb = formatNumber(s.workload_before, 1).padStart(8);
        const wa = formatNumber(s.workload_after, 1).padStart(8);
        const cb = formatNumber(s.co2_before, 1).padStart(7);
        const ca = formatNumber(s.co2_after, 1).padStart(7);
        const th = formatNumber(s.threshold, 1).padStart(6);
        const st = s.status_after.padEnd(9);
        return `${name} | ${wb} | ${wa} | ${cb} | ${ca} | ${th} | ${st}`;
      }),
      '',
      '====================================================================',
      'Generated by GreenShift Workload Management Platform',
    ];

    const pdfData = buildSimplePdf(lines.join('\n'));
    const blob = new Blob([pdfData], { type: 'application/pdf' });
    triggerDownload(blob, `greenshift-report-${res.result_id}.pdf`);
    showNotice(`PDF report greenshift-report-${res.result_id}.pdf downloaded.`);
  };

  // Export Chart as PNG
  const handleExportChartPng = (res: OptimizationResult, mode: 'before' | 'after') => {
    const width = 800;
    const height = 450;
    const margin = { top: 60, right: 40, bottom: 60, left: 60 };
    const chartW = width - margin.left - margin.right;
    const chartH = height - margin.top - margin.bottom;

    const servers = res.server_results;
    const maxVal = Math.max(...servers.map((s) => Math.max(s.co2_before, s.co2_after, s.threshold)), 10);
    const yMax = Math.ceil(maxVal * 1.15);

    const barWidth = Math.min(50, chartW / (servers.length * 1.6));
    const step = chartW / servers.length;

    let barsSvg = '';
    servers.forEach((s, idx) => {
      const emission = mode === 'before' ? s.co2_before : s.co2_after;
      const barH = (emission / yMax) * chartH;
      const x = margin.left + idx * step + (step - barWidth) / 2;
      const y = margin.top + chartH - barH;
      const isOverloaded = emission > s.threshold;
      const color = isOverloaded ? '#ef4444' : '#38bdf8';

      barsSvg += `
        <rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" rx="4" fill="${color}" />
        <text x="${x + barWidth / 2}" y="${y - 8}" fill="#e2e8f0" font-size="11" font-family="sans-serif" text-anchor="middle">
          ${emission.toFixed(1)}
        </text>
        <text x="${x + barWidth / 2}" y="${height - margin.bottom + 20}" fill="#94a3b8" font-size="11" font-family="sans-serif" text-anchor="middle">
          ${escapeXml(s.server_name)}
        </text>
      `;
    });

    // Threshold lines
    const avgThreshold = servers.reduce((acc, s) => acc + s.threshold, 0) / servers.length;
    const threshY = margin.top + chartH - (avgThreshold / yMax) * chartH;

    const titleText = `GreenShift — ${mode === 'before' ? 'Before Optimization' : 'After Optimization'} Emissions`;
    const subtitleText = `Report ID: ${res.result_id} · Fleet: ${res.total_servers} Servers`;

    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <rect width="100%" height="100%" fill="#070d1c"/>
        <text x="${margin.left}" y="32" fill="#ffffff" font-size="16" font-weight="bold" font-family="sans-serif">${escapeXml(titleText)}</text>
        <text x="${margin.left}" y="48" fill="#94a3b8" font-size="11" font-family="sans-serif">${escapeXml(subtitleText)}</text>
        
        <!-- Y Axis Grid -->
        <line x1="${margin.left}" y1="${margin.top + chartH}" x2="${width - margin.right}" y2="${margin.top + chartH}" stroke="#1d3563" stroke-width="1"/>
        <line x1="${margin.left}" y1="${threshY}" x2="${width - margin.right}" y2="${threshY}" stroke="#10b981" stroke-width="2" stroke-dasharray="6,4"/>
        <text x="${width - margin.right}" y="${threshY - 6}" fill="#10b981" font-size="10" font-weight="bold" font-family="sans-serif" text-anchor="end">
          Avg Threshold (${avgThreshold.toFixed(1)})
        </text>
        
        ${barsSvg}
      </svg>
    `;

    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width * 2;
      canvas.height = height * 2;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(2, 2);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((pngBlob) => {
          if (pngBlob) {
            triggerDownload(pngBlob, `greenshift-${mode}-chart-${res.result_id}.png`);
            showNotice(`${mode === 'before' ? 'Before' : 'After'} chart exported as PNG.`);
          }
          URL.revokeObjectURL(url);
        }, 'image/png');
      }
    };
    img.src = url;
  };

  return (
    <div>
      <Header
        title="Reports"
        subtitle="Download and export validated optimization analytics"
      />

      <div className="space-y-8 p-6 max-w-6xl mx-auto">
        {/* Notice alert */}
        {exportNotice && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300 font-medium flex items-center gap-2">
            <CheckCircle2 size={16} />
            {exportNotice}
          </div>
        )}

        {!hasResult ? (
          <div className="flex flex-col items-center justify-center p-16 text-center rounded-2xl border border-navy-700 bg-navy-900/60 shadow-card min-h-[50vh]">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-800 text-slate-500 ring-1 ring-navy-700">
              <FileText size={32} />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">No optimization reports available yet</h3>
            <p className="mt-1 max-w-md text-sm text-slate-400">
              Run an optimization to generate downloadable reports and chart visualizations.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* History Selector if multiple runs exist */}
            {history.length > 1 && (
              <div className="flex items-center gap-3 rounded-2xl border border-navy-700 bg-navy-900/60 p-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Select Report:
                </span>
                <select
                  value={selected.result_id}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="rounded-xl border border-navy-700 bg-navy-950 px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {history.map((h) => (
                    <option key={h.result_id} value={h.result_id}>
                      {h.result_id} — {h.total_servers} Servers ({formatDateTime(h.created_at)})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Report Header Card */}
            <div className="rounded-2xl border border-navy-700 bg-navy-900/80 p-6 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Optimization Report
                  </span>
                  <h2 className="text-2xl font-bold text-white mt-1">{selected.result_id}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Generated: {formatDateTime(selected.created_at)} · Fleet: {selected.total_servers} Servers
                  </p>
                </div>

                {/* Functional Download Actions */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => handleDownloadCSV(selected)}
                    className="inline-flex items-center gap-2 rounded-xl border border-navy-700 bg-navy-800/80 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-navy-700 hover:text-white"
                  >
                    <FileSpreadsheet size={15} className="text-emerald-400" />
                    Download CSV
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(selected)}
                    className="inline-flex items-center gap-2 rounded-xl border border-navy-700 bg-navy-800/80 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-navy-700 hover:text-white"
                  >
                    <Download size={15} className="text-sky-400" />
                    Download PDF
                  </button>
                  <button
                    onClick={() => handleExportChartPng(selected, 'before')}
                    className="inline-flex items-center gap-2 rounded-xl border border-navy-700 bg-navy-800/80 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:bg-navy-700 hover:text-white"
                  >
                    <ImageIcon size={15} className="text-amber-400" />
                    Export Before Chart (PNG)
                  </button>
                  <button
                    onClick={() => handleExportChartPng(selected, 'after')}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-navy-950 transition hover:bg-emerald-400 shadow-glow"
                  >
                    <ImageIcon size={15} />
                    Export After Chart (PNG)
                  </button>
                </div>
              </div>

              {/* Report Metadata Grid */}
              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-navy-800 pt-6 sm:grid-cols-4">
                <div>
                  <p className="text-xs font-medium text-slate-400">Number of Servers</p>
                  <p className="font-mono text-base font-semibold text-white mt-1">
                    {selected.total_servers}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400">Total CO₂ Before</p>
                  <p className="font-mono text-base font-semibold text-white mt-1">
                    {formatNumber(selected.total_co2_before, 2)} kg
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400">Total CO₂ After</p>
                  <p className="font-mono text-base font-semibold text-emerald-400 mt-1">
                    {formatNumber(selected.total_co2_after, 2)} kg
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400">Optimization Status</p>
                  <p className="font-mono text-sm font-semibold text-white mt-1">
                    {selected.optimization_status}
                  </p>
                </div>
              </div>

              {/* Workload Redistribution Summary */}
              <div className="mt-6 rounded-xl border border-navy-800 bg-navy-950/60 p-4">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Workload Redistribution Summary
                </h4>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                  {selected.all_servers_within_threshold
                    ? 'The fleet had sufficient clean capacity. Workload was redistributed to keep all servers within their carbon thresholds.'
                    : 'The fleet exceeded its available clean capacity. Workload was redistributed to balance the worst-case overload across servers.'}
                  {' '}(Workload shifted: {formatNumber(selected.workload_moved_percentage, 1)}%)
                </p>
              </div>
            </div>

            {/* Server Breakdown Table */}
            <div className="rounded-2xl border border-navy-700 bg-navy-900/60 p-6 shadow-card">
              <h3 className="text-base font-semibold text-white mb-4">Server Optimization Breakdown</h3>
              <div className="overflow-x-auto rounded-xl border border-navy-700 bg-navy-950/60">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-navy-700 bg-navy-800/80 text-xs uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Server</th>
                      <th className="px-4 py-3 text-right font-medium">Workload Before</th>
                      <th className="px-4 py-3 text-right font-medium">Workload After</th>
                      <th className="px-4 py-3 text-right font-medium">Shift</th>
                      <th className="px-4 py-3 text-right font-medium">CO₂ Before</th>
                      <th className="px-4 py-3 text-right font-medium">CO₂ After</th>
                      <th className="px-4 py-3 text-right font-medium">Threshold</th>
                      <th className="px-4 py-3 text-center font-medium">Status After</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-800">
                    {selected.server_results.map((s, idx) => {
                      const shift = s.workload_after - s.workload_before;
                      const isSafe = s.status_after === 'safe';
                      return (
                        <tr key={idx} className="transition hover:bg-navy-800/40">
                          <td className="px-4 py-3 font-medium text-white">{s.server_name}</td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-300">
                            {formatNumber(s.workload_before, 2)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums text-white">
                            {formatNumber(s.workload_after, 2)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums text-xs">
                            <span
                              className={
                                shift > 0.05
                                  ? 'text-sky-400'
                                  : shift < -0.05
                                  ? 'text-amber-400'
                                  : 'text-slate-400'
                              }
                            >
                              {shift > 0 ? `+${shift.toFixed(2)}` : shift.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-300">
                            {formatNumber(s.co2_before, 2)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums text-emerald-400 font-semibold">
                            {formatNumber(s.co2_after, 2)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-300">
                            {formatNumber(s.threshold, 2)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border ${
                                isSafe
                                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                  : 'bg-red-500/15 text-red-300 border-red-500/30'
                              }`}
                            >
                              {isSafe ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                              {isSafe ? 'Safe' : 'Overloaded'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Escapes characters for XML/SVG.
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates a clean PDF binary blob without heavy external libraries.
 */
function buildSimplePdf(text: string): Uint8Array {
  const sanitize = (s: string) => s.replace(/[()\\]/g, '\\$&');
  const rawLines = text.split('\n');

  let textStream = 'BT\n/F1 9 Tf\n14 TL\n40 780 Td\n';
  rawLines.forEach((l) => {
    textStream += `(${sanitize(l)}) '\n`;
  });
  textStream += 'ET\n';

  const streamBytes = new TextEncoder().encode(textStream);
  const streamLen = streamBytes.length;

  const body =
    `%PDF-1.4\n` +
    `1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n` +
    `2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n` +
    `3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n` +
    `4 0 obj << /Length ${streamLen} >>\n` +
    `stream\n` +
    textStream +
    `endstream\nendobj\n` +
    `5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Courier >> endobj\n`;

  const bodyBytes = new TextEncoder().encode(body);
  const xrefOffset = bodyBytes.length;

  const xref =
    `xref\n` +
    `0 6\n` +
    `0000000000 65535 f \n` +
    `0000000009 00000 n \n` +
    `0000000058 00000 n \n` +
    `0000000115 00000 n \n` +
    `0000000244 00000 n \n` +
    `0000000320 00000 n \n` +
    `trailer << /Size 6 /Root 1 0 R >>\n` +
    `startxref\n` +
    `${xrefOffset}\n` +
    `%%EOF\n`;

  const fullPdf = new TextEncoder().encode(body + xref);
  return fullPdf;
}
