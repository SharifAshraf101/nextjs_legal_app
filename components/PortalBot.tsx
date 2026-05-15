'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { useT } from '@/hooks/useT';
import { whatsappUrl } from '@/lib/clients';
import {
  addPortalBotHistory,
  clearPortalBotHistory,
  portalAccessText,
  portalBotAnswer,
  portalBotQuickQuestion,
  portalBotText,
  portalFormatDate,
  portalHistoryForClient,
  type PortalBotHistoryItem,
} from '@/lib/portal';

/**
 * Port of portalBotHtml (source line 4875) + submitPortalBotQuestion (4904) +
 * appendPortalBotBubble (4895) + renderPortalBotHistory (4728) +
 * clearPortalBotHistory (4723).
 *
 * The bot is fully client-side: questions are pattern-matched against domain
 * data in lib/portal.ts.
 */
export function PortalBot({ clientId }: { clientId: string }) {
  const { state } = useAppState();
  const { t, lang } = useT();
  const client = state.clients.find((x) => String(x.id) === String(clientId));
  const clientNameText = client
    ? lang === 'ar'
      ? client.nameAr || client.name || ''
      : client.name || client.nameAr || ''
    : '';

  const [messages, setMessages] = useState<{ kind: 'user' | 'bot'; text: string }[]>([
    { kind: 'bot', text: portalBotText('initial', lang) },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<PortalBotHistoryItem[]>(() =>
    portalHistoryForClient(clientId),
  );
  const [lastAnswer, setLastAnswer] = useState('');
  const messagesRef = useRef<HTMLDivElement>(null);

  // Refresh history view when clientId changes.
  useEffect(() => {
    setHistory(portalHistoryForClient(clientId));
    setMessages([{ kind: 'bot', text: portalBotText('initial', lang) }]);
    setLastAnswer('');
  }, [clientId, lang]);

  // Auto-scroll to bottom on new bubbles. Matches source line 4901.
  useEffect(() => {
    const box = messagesRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [messages]);

  const ask = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    const answer = portalBotAnswer(clientId, trimmed, {
      lang,
      clients: state.clients,
      cases: state.casesArr,
      events: state.eventsList,
      timeline: state.timelineItems,
      finances: state.finances,
      documents: state.documentsArr,
      tasks: state.tasksArr,
      t,
    });
    setMessages((prev) => [
      ...prev,
      { kind: 'user', text: trimmed },
      { kind: 'bot', text: answer },
    ]);
    addPortalBotHistory(clientId, trimmed, answer, state.clients, lang);
    setHistory(portalHistoryForClient(clientId));
    setLastAnswer(answer);
    setInput('');
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  const onQuick = (kind: string) => {
    ask(portalBotQuickQuestion(kind, lang));
  };

  const onClearHistory = () => {
    clearPortalBotHistory(clientId);
    setHistory([]);
  };

  const quick: [string, string][] = [
    ['summary', portalBotText('summary', lang)],
    ['hearings', portalBotText('hearings', lang)],
    ['fees', portalBotText('fees', lang)],
    ['documents', portalBotText('documents', lang)],
    ['notes', portalBotText('notes', lang)],
  ];

  const sendWaHref =
    lastAnswer && client ? whatsappUrl(client.phone || '', lastAnswer) : '#';

  return (
    <>
      <div className="portal-bot-card" data-portal-bot-client={clientId}>
        <div className="portal-bot-head">
          <div className="portal-bot-title">
            <span className="portal-bot-icon">
              <i className="fas fa-robot" />
            </span>
            <div>
              <div>{portalBotText('title', lang)}</div>
              <div className="portal-bot-subtitle">
                {portalBotText('subtitle', lang)} {clientNameText}
              </div>
            </div>
          </div>
          <div className="portal-bot-quick">
            {quick.map(([k, label]) => (
              <button
                key={k}
                type="button"
                data-portal-bot-quick={k}
                onClick={() => onQuick(k)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="portal-bot-messages" id="portalBotMessages" ref={messagesRef}>
        {messages.map((m, i) => (
          <div key={i} className={'portal-bot-bubble ' + m.kind}>
            {m.text}
          </div>
        ))}
      </div>

      <form className="portal-bot-form" id="portalBotForm" onSubmit={onSubmit}>
        <input
          id="portalBotInput"
          type="text"
          autoComplete="off"
          placeholder={portalBotText('placeholder', lang)}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit">
          <i className="fas fa-paper-plane" />
          <span>{portalBotText('send', lang)}</span>
        </button>
      </form>

      <a
        className={'portal-bot-send-wa' + (lastAnswer && client ? '' : ' is-hidden')}
        id="portalBotSendWa"
        href={sendWaHref}
        target="_blank"
        rel="noopener"
      >
        <i className="fab fa-whatsapp" />
        <span>{portalBotText('sendWa', lang)}</span>
      </a>

      <PortalBotHistory
        clientId={clientId}
        items={history}
        onClear={onClearHistory}
      />
    </>
  );
}

function PortalBotHistory({
  clientId,
  items,
  onClear,
}: {
  clientId: string;
  items: PortalBotHistoryItem[];
  onClear: () => void;
}) {
  const { lang } = useT();
  return (
    <div className="portal-bot-history-card" id="portalBotHistory">
      <div className="portal-bot-history-head">
        <div className="portal-bot-history-title">
          <i className="fas fa-clock-rotate-left" />
          <span>{portalAccessText('history', lang)}</span>
        </div>
        <button
          type="button"
          className="portal-bot-history-clear"
          data-clear-portal-bot-history={clientId}
          onClick={onClear}
        >
          {portalAccessText('clear', lang)}
        </button>
      </div>
      {items.length === 0 ? (
        <div className="portal-bot-history-empty">{portalAccessText('empty', lang)}</div>
      ) : (
        <div className="portal-bot-history-list">
          {items.map((item) => (
            <div key={item.id} className="portal-bot-history-item">
              <div className="portal-bot-history-meta">
                {portalFormatDate(item.time, lang)}
              </div>
              <div className="portal-bot-history-q">
                <strong>{portalAccessText('question', lang)}:</strong> {item.question}
              </div>
              <div className="portal-bot-history-a">
                <strong>{portalAccessText('answer', lang)}:</strong> {item.answer}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
