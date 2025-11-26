import React, { useState } from 'react';
import { marked } from 'marked';
import html2pdf from 'html2pdf.js';

// --- ICONOS (Para que se vea bonito sin instalar nada extra) ---
const UserIcon = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const BotIcon = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>;
const CopyIcon = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const CheckIcon = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const DownloadIcon = ({ className }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;

// --- COMPONENTE DEL MENSAJE ---
const Message = ({ message }) => {
  const isUser = message.role === 'user';
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Extraer Odds si existen
  const extractOdds = (content) => {
    const oddsRegex = /\|\|ODDS:PLAINTIFF=(\d+)\|DEFENDANT=(\d+)\|\|/;
    const match = content.match(oddsRegex);
    
    if (match) {
        return {
            cleanContent: content.replace(oddsRegex, '').trim(),
            odds: {
                plaintiff: parseInt(match[1], 10),
                defendant: parseInt(match[2], 10)
            }
        };
    }
    return { cleanContent: content, odds: null };
  };

  const { cleanContent } = isUser ? { cleanContent: message.content } : extractOdds(message.content);

  const createMarkup = (content) => {
    if (isUser) {
        return { __html: content.replace(/\n/g, '<br />') };
    }
    const dirtyHtml = marked.parse(content);
    return { __html: dirtyHtml };
  };

  const handleCopy = () => {
    if (isCopied) return;
    navigator.clipboard.writeText(cleanContent)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => console.error('Error al copiar: ', err));
  };

  const isFormalDocument = (content) => {
    if (!content) return false;
    const upper = content.toUpperCase();
    const documentIndicators = [
      "SUMA:", "S. J. L.", "S.J.L.", "EN LO PRINCIPAL", "C. JUEZ", "EXPEDIENTE", "VS.", "V S .", 
      "AL JUZGADO", "SUPLICO AL JUZGADO", "IN THE COURT", "JUDICIAL DISTRICT", "CIVIL ACTION"
    ];
    return documentIndicators.some(indicator => upper.includes(indicator));
  };

  const showDownloadButton = !isUser && isFormalDocument(cleanContent);

  const handleDownloadPDF = () => {
    if (isDownloading || !cleanContent) return;
    setIsDownloading(true);

    const contentHtml = marked.parse(cleanContent);
    const element = document.createElement('div');
    
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    element.style.top = '0';
    element.style.width = '800px';
    
    element.innerHTML = `
      <div style="font-family: 'Times New Roman', serif; color: #000; background: #fff; padding: 40px; line-height: 1.5; font-size: 12pt;">
        ${contentHtml}
        <div style="margin-top: 50px; text-align: center; font-size: 10pt; color: #666; border-top: 1px solid #ddd; padding-top: 10px;">
          Generado por Inteligencia Artificial - JusticeBot
        </div>
      </div>
    `;

    document.body.appendChild(element);

    const opt = {
      margin:       0.5,
      filename:     'Documento_Legal_JusticeBot.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save()
        .then(() => {
            document.body.removeChild(element);
            setIsDownloading(false);
        })
        .catch((err) => {
            console.error("PDF Error:", err);
            if(document.body.contains(element)) document.body.removeChild(element);
            setIsDownloading(false);
        });
  };

  const timeString = message.timestamp 
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    : '';

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1 mb-4`}>
        <div className={`flex items-start gap-4 ${isUser ? 'justify-end' : 'justify-start'} w-full`}>
        {!isUser && (
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center border-2 border-blue-400">
            <BotIcon className="w-6 h-6 text-blue-300" />
            </div>
        )}
        <div className="relative group max-w-xl w-full">
            <div className={`px-5 py-3 rounded-2xl shadow-md prose prose-invert prose-p:my-2 prose-li:my-1 ${isUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                <div dangerouslySetInnerHTML={createMarkup(cleanContent)} />
            </div>
            
            {/* Botones de acción (Copiar/Descargar) */}
            {!isUser && cleanContent && (
                <div className="flex gap-2 mt-2">
                    {showDownloadButton && (
                        <button onClick={handleDownloadPDF} className="p-1 text-sm bg-gray-200 rounded hover:bg-gray-300 text-black flex items-center gap-1">
                            <DownloadIcon className="w-4 h-4" /> PDF
                        </button>
                    )}
                    <button onClick={handleCopy} className="p-1 text-sm bg-gray-200 rounded hover:bg-gray-300 text-black flex items-center gap-1">
                        {isCopied ? <CheckIcon className="w-4 h-4 text-green-600" /> : <CopyIcon className="w-4 h-4" />} Copiar
                    </button>
                </div>
            )}
        </div>
        {isUser && (
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center border-2 border-gray-600">
            <UserIcon className="w-6 h-6 text-gray-300" />
            </div>
        )}
        </div>
        {timeString && <span className="text-xs text-gray-500 px-14">{timeString}</span>}
    </div>
  );
};

// --- APP PRINCIPAL ---
function App() {
  const testMessages = [
    { role: 'user', content: 'Hola, necesito redactar una demanda.', timestamp: new Date() },
    { role: 'bot', content: 'Claro. **SUMA: DEMANDA DE DIVORCIO**. \n\nS.J.L.\n\nEN LO PRINCIPAL: Demanda de divorcio...', timestamp: new Date() }
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-white mb-8">JusticeBot Demo</h1>
      <div className="w-