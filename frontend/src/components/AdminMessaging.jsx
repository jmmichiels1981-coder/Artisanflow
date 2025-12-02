import React, { useState, useEffect } from 'react';
import { Mail, MailOpen, Trash2, Archive, RefreshCw } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL + '/api' || 'http://localhost:8001/api';

export default function AdminMessaging() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, new, read, archived
  const [selectedMessage, setSelectedMessage] = useState(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const statusFilter = filter !== 'all' ? `?status=${filter}` : '';
      const response = await fetch(`${API}/contact/messages${statusFilter}`);
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const markAsRead = async (messageId) => {
    try {
      await fetch(`${API}/contact/messages/${messageId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'read' })
      });
      fetchMessages();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const archiveMessage = async (messageId) => {
    try {
      await fetch(`${API}/contact/messages/${messageId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' })
      });
      fetchMessages();
      setSelectedMessage(null);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) return;
    
    try {
      await fetch(`${API}/contact/messages/${messageId}`, {
        method: 'DELETE'
      });
      fetchMessages();
      setSelectedMessage(null);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const newMessagesCount = messages.filter(m => m.status === 'new').length;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#fff' }}>
          📬 Messagerie Contact
          {newMessagesCount > 0 && (
            <span style={{
              marginLeft: '10px',
              padding: '4px 10px',
              background: '#ef4444',
              color: '#fff',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {newMessagesCount} nouveau{newMessagesCount > 1 ? 'x' : ''}
            </span>
          )}
        </h2>
        
        <button
          onClick={fetchMessages}
          style={{
            padding: '8px 16px',
            background: '#374151',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <RefreshCw size={16} />
          Actualiser
        </button>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {['all', 'new', 'read', 'archived'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: '8px 16px',
              background: filter === status ? '#FF7A2F' : '#374151',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {status === 'all' ? 'Tous' : status === 'new' ? 'Nouveaux' : status === 'read' ? 'Lus' : 'Archivés'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
          Chargement...
        </div>
      ) : messages.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
          Aucun message
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedMessage ? '1fr 2fr' : '1fr', gap: '20px' }}>
          {/* Liste des messages */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map(msg => (
              <div
                key={msg.id}
                onClick={() => {
                  setSelectedMessage(msg);
                  if (msg.status === 'new') markAsRead(msg.id);
                }}
                style={{
                  padding: '16px',
                  background: msg.status === 'new' ? 'rgba(239, 68, 68, 0.1)' : '#1f2937',
                  border: `1px solid ${msg.status === 'new' ? '#ef4444' : '#374151'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  {msg.status === 'new' ? <Mail size={16} color="#ef4444" /> : <MailOpen size={16} color="#6b7280" />}
                  <span style={{ fontWeight: '600', color: '#fff' }}>{msg.name}</span>
                  <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: 'auto' }}>
                    {new Date(msg.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div style={{ fontSize: '14px', color: '#d1d5db', marginBottom: '4px' }}>
                  {msg.subject}
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                  {msg.email}
                </div>
              </div>
            ))}
          </div>

          {/* Détail du message */}
          {selectedMessage && (
            <div style={{
              padding: '20px',
              background: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '8px'
            }}>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#fff', marginBottom: '10px' }}>
                  {selectedMessage.subject}
                </h3>
                <div style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '10px' }}>
                  De : <strong style={{ color: '#fff' }}>{selectedMessage.name}</strong> ({selectedMessage.email})
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                  Reçu le {new Date(selectedMessage.created_at).toLocaleString('fr-FR')}
                </div>
              </div>

              <div style={{
                padding: '16px',
                background: '#111827',
                borderRadius: '6px',
                color: '#d1d5db',
                fontSize: '14px',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                marginBottom: '20px'
              }}>
                {selectedMessage.message}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => window.location.href = `mailto:${selectedMessage.email}`}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: '#FF7A2F',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Répondre par email
                </button>
                
                <button
                  onClick={() => archiveMessage(selectedMessage.id)}
                  style={{
                    padding: '10px 16px',
                    background: '#374151',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                  title="Archiver"
                >
                  <Archive size={16} />
                </button>
                
                <button
                  onClick={() => deleteMessage(selectedMessage.id)}
                  style={{
                    padding: '10px 16px',
                    background: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
