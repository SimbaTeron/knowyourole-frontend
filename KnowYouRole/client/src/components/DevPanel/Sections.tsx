import React, { useState, useEffect, useCallback } from 'react';

// ============================================================================
// DESIGN TOKENS
// ============================================================================
const styles = {
  sectionHeader: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.05em',
    color: '#888',
    marginBottom: 12,
    marginTop: 0,
  },
  button: {
    background: '#333',
    borderRadius: 6,
    padding: '6px 10px',
    color: '#d4d4d4',
    border: '1px solid #444',
    cursor: 'pointer',
    fontSize: 12,
    fontFamily: 'inherit',
  },
  buttonActive: {
    background: '#007acc',
    color: '#fff',
    border: '1px solid #007acc',
  },
  input: {
    background: '#2d2d2d',
    border: '1px solid #333',
    borderRadius: 4,
    padding: '6px 8px',
    color: '#d4d4d4',
    fontSize: 12,
    fontFamily: 'inherit',
    outline: 'none',
  },
  textarea: {
    background: '#2d2d2d',
    border: '1px solid #333',
    borderRadius: 4,
    padding: '6px 8px',
    color: '#d4d4d4',
    fontSize: 12,
    fontFamily: 'inherit',
    resize: 'vertical' as const,
    minHeight: 60,
    width: '100%',
    boxSizing: 'border-box' as const,
    outline: 'none',
  },
  card: {
    background: '#252526',
    border: '1px solid #333',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  divider: {
    borderTop: '1px solid #333',
    margin: '12px 0',
  },
  badge: {
    fontSize: 10,
    padding: '2px 6px',
    borderRadius: 4,
    fontWeight: 600,
  },
  pre: {
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: 4,
    padding: 8,
    fontSize: 11,
    overflow: 'auto' as const,
    maxHeight: 200,
    margin: 0,
    fontFamily: 'Consolas, monospace',
    color: '#d4d4d4',
  },
};

// ============================================================================
// SECTION 1: STATE INSPECTOR
// ============================================================================
type Snapshot = { label: string; data: Record<string, string>; timestamp: number };

function getValueType(value: string): 'string' | 'object' | 'array' {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return 'array';
    if (typeof parsed === 'object') return 'object';
    return 'string';
  } catch {
    return 'string';
  }
}

function getTypeBadgeColor(type: 'string' | 'object' | 'array'): string {
  switch (type) {
    case 'object': return '#9b59b6';
    case 'array': return '#e67e22';
    default: return '#27ae60';
  }
}

function StateInspectorSection() {
  const [keys, setKeys] = useState<string[]>([]);
  const [filter, setFilter] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [editKey, setEditKey] = useState('');
  const [editValue, setEditValue] = useState('');
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [selectedSnapshots, setSelectedSnapshots] = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);
  const [snapshotName, setSnapshotName] = useState('');

  const refreshKeys = useCallback(() => {
    try {
      setKeys(Object.keys(sessionStorage));
    } catch {}
  }, []);

  useEffect(() => {
    refreshKeys();
    const interval = setInterval(refreshKeys, 1000);
    return () => clearInterval(interval);
  }, [refreshKeys]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('kyr-snapshots');
      if (saved) setSnapshots(JSON.parse(saved));
    } catch {}
  }, []);

  const saveSnapshots = (updated: Snapshot[]) => {
    try {
      localStorage.setItem('kyr-snapshots', JSON.stringify(updated));
      setSnapshots(updated);
    } catch {}
  };

  const handleCopy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    } catch {}
  };

  const handleDelete = (key: string) => {
    try {
      sessionStorage.removeItem(key);
      refreshKeys();
    } catch {}
  };

  const handleAddUpdate = () => {
    if (!editKey.trim()) return;
    try {
      sessionStorage.setItem(editKey.trim(), editValue);
      setEditKey('');
      setEditValue('');
      refreshKeys();
    } catch {}
  };

  const handleSaveSnapshot = () => {
    try {
      const data: Record<string, string> = {};
      Object.keys(sessionStorage).forEach(k => {
        data[k] = sessionStorage.getItem(k) || '';
      });
      const label = snapshotName.trim() || new Date().toLocaleString();
      const newSnap: Snapshot = { label, data, timestamp: Date.now() };
      saveSnapshots([...snapshots, newSnap]);
      setSnapshotName('');
    } catch {}
  };

  const handleRestore = (snap: Snapshot) => {
    try {
      sessionStorage.clear();
      Object.entries(snap.data).forEach(([k, v]) => sessionStorage.setItem(k, v));
      refreshKeys();
    } catch {}
  };

  const handleClearAll = () => {
    if (!clearConfirm) {
      setClearConfirm(true);
      setTimeout(() => setClearConfirm(false), 3000);
      return;
    }
    try {
      sessionStorage.clear();
      refreshKeys();
      setClearConfirm(false);
    } catch {}
  };

  const toggleExpand = (key: string) => {
    setExpandedKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const filteredKeys = keys.filter(k =>
    filter === '' || k.toLowerCase().includes(filter.toLowerCase())
  );

  const getSnapshotDiff = () => {
    if (selectedSnapshots.length < 2) return null;
    const s1 = snapshots.find(s => s.label === selectedSnapshots[0]);
    const s2 = snapshots.find(s => s.label === selectedSnapshots[1]);
    if (!s1 || !s2) return null;
    const allKeys = new Set([...Object.keys(s1.data), ...Object.keys(s2.data)]);
    const diff: { key: string; before: string; after: string }[] = [];
    allKeys.forEach(k => {
      if (s1.data[k] !== s2.data[k]) diff.push({ key: k, before: s1.data[k], after: s2.data[k] });
    });
    return diff;
  };

  return (
    <div>
      <h3 style={styles.sectionHeader}>📦 STATE INSPECTOR</h3>

      {/* Search */}
      <input
        type="text"
        placeholder="Filter keys..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
        style={{ ...styles.input, width: '100%', marginBottom: 10, boxSizing: 'border-box' }}
      />

      {/* Key Editor */}
      <div style={styles.card}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
          <input
            type="text"
            placeholder="Key name"
            value={editKey}
            onChange={e => setEditKey(e.target.value)}
            style={{ ...styles.input, flex: 1 }}
          />
          <button onClick={handleAddUpdate} style={{ ...styles.button, ...styles.buttonActive }}>
            {keys.includes(editKey.trim()) ? 'Update' : 'Add'}
          </button>
        </div>
        <textarea
          placeholder="Value"
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          style={styles.textarea}
        />
      </div>

      {/* Key List */}
      <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 10 }}>
        {filteredKeys.length === 0 && (
          <div style={{ color: '#666', fontSize: 12, textAlign: 'center', padding: 20 }}>
            {filter ? 'No matching keys' : 'sessionStorage is empty'}
          </div>
        )}
        {filteredKeys.map(key => {
          let value = '';
          try { value = sessionStorage.getItem(key) || ''; } catch {}
          const type = getValueType(value);
          const isExpanded = expandedKeys.has(key);
          const truncated = value.length > 50 ? value.slice(0, 50) + '...' : value;

          return (
            <div key={key} style={{ ...styles.card, marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 11, color: '#007acc', fontFamily: 'Consolas, monospace', flexShrink: 0 }}>
                  {key.length > 20 ? key.slice(0, 20) + '...' : key}
                </span>
                <span style={{ ...styles.badge, background: getTypeBadgeColor(type), color: '#fff', flexShrink: 0 }}>
                  {type}
                </span>
                <div style={{ flex: 1 }} />
                {type !== 'string' && (
                  <button onClick={() => toggleExpand(key)} style={{ ...styles.button, padding: '2px 6px', fontSize: 10 }}>
                    {isExpanded ? 'Collapse' : 'Expand'}
                  </button>
                )}
                <button onClick={() => handleCopy(key, value)} style={{ ...styles.button, padding: '2px 6px', fontSize: 10 }}>
                  {copiedKey === key ? '✓ Copied!' : 'Copy'}
                </button>
                <button onClick={() => handleDelete(key)} style={{ ...styles.button, padding: '2px 6px', fontSize: 10, color: '#e74c3c' }}>
                  🗑️
                </button>
              </div>
              <div style={{ fontSize: 11, color: '#aaa', fontFamily: 'Consolas, monospace', wordBreak: 'break-all' as const }}>
                {isExpanded ? value : truncated}
              </div>
              {isExpanded && type !== 'string' && (
                <pre style={styles.pre}>
                  {(() => {
                    try { return JSON.stringify(JSON.parse(value), null, 2); } catch { return value; }
                  })()}
                </pre>
              )}
            </div>
          );
        })}
      </div>

      {/* Snapshots */}
      <div style={{ ...styles.divider }} />
      <h4 style={{ ...styles.sectionHeader, marginBottom: 8 }}>💾 SNAPSHOTS</h4>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <input
          type="text"
          placeholder="Snapshot name (optional)"
          value={snapshotName}
          onChange={e => setSnapshotName(e.target.value)}
          style={{ ...styles.input, flex: 1 }}
        />
        <button onClick={handleSaveSnapshot} style={{ ...styles.button, ...styles.buttonActive }}>
          Save Snapshot
        </button>
      </div>
      {snapshots.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {snapshots.map((snap, i) => (
            <div key={i} style={{ ...styles.card, marginBottom: 4, padding: '6px 10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: '#888', flex: 1 }}>{snap.label}</span>
                <button onClick={() => handleRestore(snap)} style={{ ...styles.button, padding: '2px 6px', fontSize: 10 }}>
                  Restore
                </button>
                <button
                  onClick={() => {
                    setSelectedSnapshots(prev =>
                      prev.includes(snap.label)
                        ? prev.filter(s => s !== snap.label)
                        : prev.length < 2 ? [...prev, snap.label] : [prev[1], snap.label]
                    );
                  }}
                  style={{
                    ...styles.button,
                    padding: '2px 6px',
                    fontSize: 10,
                    ...(selectedSnapshots.includes(snap.label) ? styles.buttonActive : {}),
                  }}
                >
                  {selectedSnapshots.includes(snap.label) ? '✓ Selected' : 'Select'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compare Mode */}
      {selectedSnapshots.length === 2 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <button
              onClick={() => setCompareMode(!compareMode)}
              style={{ ...styles.button, ...(compareMode ? styles.buttonActive : {}) }}
            >
              {compareMode ? 'Hide Diff' : 'Show Diff'}
            </button>
          </div>
          {compareMode && (() => {
            const diff = getSnapshotDiff();
            if (!diff) return null;
            return (
              <pre style={styles.pre}>
                {diff.length === 0 ? 'No differences found' : diff.map(d => (
                  `Key: ${d.key}\nBefore: ${d.before}\nAfter: ${d.after}\n---`
                ).join('\n'))}
              </pre>
            );
          })()}
        </div>
      )}

      {/* Clear All */}
      <div style={{ ...styles.divider }} />
      <button
        onClick={handleClearAll}
        style={{
          ...styles.button,
          background: clearConfirm ? '#c0392b' : '#333',
          color: clearConfirm ? '#fff' : '#d4d4d4',
          width: '100%',
        }}
      >
        {clearConfirm ? '⚠️ Click again to confirm' : '🗑️ Clear ALL'}
      </button>
    </div>
  );
}

// ============================================================================
// SECTION 2: ERROR INJECTION
// ============================================================================
const ENDPOINTS = [
  { path: '/api/quiz-results', errors: [500, 404, 'Timeout'] },
  { path: '/api/job-match', errors: [500, 404] },
  { path: '/api/auth/token', errors: [401, 403] },
];

function ErrorInjectionSection() {
  const [globalOn, setGlobalOn] = useState(false);
  const [network, setNetwork] = useState('Normal');
  const [activeEndpoints, setActiveEndpoints] = useState<Record<string, string>>({});
  const [uiTrigger, setUiTrigger] = useState<string | null>(null);

  const toggleGlobal = () => {
    const next = !globalOn;
    setGlobalOn(next);
    try {
      if (next) sessionStorage.setItem('knowrole-error-mode', 'global');
      else sessionStorage.removeItem('knowrole-error-mode');
    } catch {}
  };

  const handleNetworkChange = (val: string) => {
    setNetwork(val);
    try {
      if (val === 'Normal') sessionStorage.removeItem('knowrole-network');
      else sessionStorage.setItem('knowrole-network', val);
    } catch {}
  };

  const toggleEndpoint = (path: string, error: string | number) => {
    setActiveEndpoints(prev => {
      const key = `${path}:${error}`;
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = key;
      return next;
    });
    try {
      sessionStorage.setItem('knowrole-endpoint-errors', JSON.stringify(activeEndpoints));
    } catch {}
  };

  const handleUiTrigger = (trigger: string) => {
    setUiTrigger(trigger);
    try {
      sessionStorage.setItem('knowrole-ui-trigger', trigger);
    } catch {}
    setTimeout(() => {
      setUiTrigger(null);
      try { sessionStorage.removeItem('knowrole-ui-trigger'); } catch {}
    }, 2000);
  };

  const corruptStorage = () => {
    try {
      sessionStorage.setItem('__corrupt_test__', '{ bad json');
    } catch {}
  };

  return (
    <div>
      <h3 style={styles.sectionHeader}>⚠️ ERROR INJECTION</h3>

      {/* Global Toggle */}
      <div style={{ marginBottom: 16, textAlign: 'center' }}>
        <button
          onClick={toggleGlobal}
          style={{
            ...styles.button,
            padding: '12px 24px',
            fontSize: 14,
            fontWeight: 700,
            background: globalOn ? '#c0392b' : '#333',
            color: globalOn ? '#fff' : '#d4d4d4',
            boxShadow: globalOn ? '0 0 15px rgba(192, 57, 43, 0.6)' : 'none',
            border: globalOn ? '1px solid #e74c3c' : '1px solid #444',
          }}
        >
          🔴 ERROR INJECTION {globalOn ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Network Condition */}
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ ...styles.sectionHeader, marginBottom: 6 }}>NETWORK CONDITION</h4>
        <select
          value={network}
          onChange={e => handleNetworkChange(e.target.value)}
          style={{ ...styles.input, width: '100%', boxSizing: 'border-box' }}
        >
          <option value="Normal">Normal</option>
          <option value="Slow 3G">Slow 3G</option>
          <option value="Fast 3G">Fast 3G</option>
          <option value="Offline">Offline</option>
        </select>
      </div>

      {/* Per-Endpoint Errors */}
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ ...styles.sectionHeader, marginBottom: 8 }}>ENDPOINT ERRORS</h4>
        {ENDPOINTS.map(ep => (
          <div key={ep.path} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 4, fontFamily: 'Consolas, monospace' }}>
              {ep.path}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
              {ep.errors.map(err => {
                const key = `${ep.path}:${err}`;
                const isActive = !!activeEndpoints[key];
                return (
                  <button
                    key={String(err)}
                    onClick={() => toggleEndpoint(ep.path, err)}
                    style={{
                      ...styles.button,
                      padding: '4px 8px',
                      fontSize: 11,
                      position: 'relative' as const,
                      ...(isActive ? { background: '#c0392b', color: '#fff', border: '1px solid #e74c3c' } : {}),
                    }}
                  >
                    {isActive && <span style={{ position: 'absolute' as const, top: -4, right: -4, fontSize: 8 }}>🔴</span>}
                    {err}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* UI Triggers */}
      <div>
        <h4 style={{ ...styles.sectionHeader, marginBottom: 8 }}>UI TRIGGERS</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {[
            { label: '📛 Show Error Toast', trigger: 'error-toast' },
            { label: '📭 Show Empty Results', trigger: 'empty-results' },
            { label: '⏳ Loading Forever', trigger: 'loading-forever' },
            { label: '💥 Corrupt sessionStorage', trigger: 'corrupt' },
          ].map(item => (
            <button
              key={item.trigger}
              onClick={() => item.trigger === 'corrupt' ? corruptStorage() : handleUiTrigger(item.trigger)}
              style={{
                ...styles.button,
                fontSize: 11,
                ...(uiTrigger === item.trigger ? { background: '#c0392b', color: '#fff' } : {}),
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SECTION 3: VIEWPORT & THEME
// ============================================================================
function ViewportThemeSection() {
  const [customWidth, setCustomWidth] = useState('1280');
  const [customHeight, setCustomHeight] = useState('900');
  const [currentTheme, setCurrentTheme] = useState(() => {
    try { return document.documentElement.getAttribute('data-theme') || 'system'; } catch { return 'system'; }
  });
  const [cssVars, setCssVars] = useState<Record<string, string>>({});

  const applyViewport = (preset: string) => {
    try {
      sessionStorage.setItem('knowrole-viewport', preset);
      // Dispatch event so app can respond
      window.dispatchEvent(new Event('storage'));
    } catch {}
  };

  const applyCustom = () => {
    const w = parseInt(customWidth) || 1280;
    const h = parseInt(customHeight) || 900;
    try {
      sessionStorage.setItem('knowrole-viewport', JSON.stringify({ width: w, height: h }));
      window.dispatchEvent(new Event('storage'));
    } catch {}
  };

  const setTheme = (theme: string) => {
    setCurrentTheme(theme);
    try {
      if (theme === 'system') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
    } catch {}
  };

  const refreshCssVars = useCallback(() => {
    try {
      const vars: Record<string, string> = {};
      const computed = getComputedStyle(document.documentElement);
      // Get all custom properties
      computed.cssText.split(';').forEach(prop => {
        const match = prop.trim().match(/^--([a-zA-Z0-9-]+):\s*(.+)$/);
        if (match) vars[match[1]] = match[2];
      });
      // Fallback: try common vars
      const allProps = Array.from(computed);
      // Can't enumerate all, so just return a few known ones
      setCssVars({
        'background': computed.getPropertyValue('--background') || '#1e1e1e',
        'foreground': computed.getPropertyValue('--foreground') || '#d4d4d4',
        'accent': computed.getPropertyValue('--accent') || '#007acc',
        'border': computed.getPropertyValue('--border') || '#333',
        'card-bg': computed.getPropertyValue('--card-bg') || '#252526',
      });
    } catch {
      setCssVars({ error: 'Unable to read CSS variables' });
    }
  }, []);

  useEffect(() => {
    refreshCssVars();
    const interval = setInterval(refreshCssVars, 2000);
    return () => clearInterval(interval);
  }, [refreshCssVars]);

  return (
    <div>
      <h3 style={styles.sectionHeader}>📱 VIEWPORT & THEME</h3>

      {/* Viewport Presets */}
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ ...styles.sectionHeader, marginBottom: 8 }}>VIEWPORT PRESETS</h4>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { label: '📱 Mobile\n375×667', value: 'mobile' },
            { label: '📱 Tablet\n768×1024', value: 'tablet' },
            { label: '🖥️ Desktop\n1280×900', value: 'desktop' },
          ].map(btn => (
            <button
              key={btn.value}
              onClick={() => applyViewport(btn.value)}
              style={{ ...styles.button, flex: 1, textAlign: 'center' as const, whiteSpace: 'pre-line' as const, lineHeight: 1.3 }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Dimensions */}
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ ...styles.sectionHeader, marginBottom: 8 }}>CUSTOM DIMENSIONS</h4>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input
            type="number"
            placeholder="Width"
            value={customWidth}
            onChange={e => setCustomWidth(e.target.value)}
            style={{ ...styles.input, width: 80 }}
          />
          <span style={{ color: '#888' }}>×</span>
          <input
            type="number"
            placeholder="Height"
            value={customHeight}
            onChange={e => setCustomHeight(e.target.value)}
            style={{ ...styles.input, width: 80 }}
          />
          <button onClick={applyCustom} style={{ ...styles.button, ...styles.buttonActive }}>
            Apply
          </button>
        </div>
      </div>

      {/* Theme Switcher */}
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ ...styles.sectionHeader, marginBottom: 8 }}>THEME</h4>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { label: '🌙 Dark', value: 'dark' },
            { label: '☀️ Light', value: 'light' },
            { label: '⚙️ System', value: 'system' },
          ].map(btn => (
            <button
              key={btn.value}
              onClick={() => setTheme(btn.value)}
              style={{
                ...styles.button,
                flex: 1,
                ...(currentTheme === btn.value ? styles.buttonActive : {}),
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* CSS Variables Inspector */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <h4 style={{ ...styles.sectionHeader, margin: 0 }}>CSS VARIABLES</h4>
          <button onClick={refreshCssVars} style={{ ...styles.button, padding: '2px 8px', fontSize: 10 }}>
            ↻ Refresh
          </button>
        </div>
        <div style={{ maxHeight: 200, overflowY: 'auto' }}>
          {Object.entries(cssVars).map(([key, val]) => (
            <div key={key} style={{ display: 'flex', gap: 8, marginBottom: 4, fontSize: 11 }}>
              <span style={{ color: '#007acc', fontFamily: 'Consolas, monospace', minWidth: 100 }}>--{key}</span>
              <span style={{ color: '#888', fontFamily: 'Consolas, monospace' }}>{val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SECTION 4: RESULTS & SHARING
// ============================================================================
function ResultsSharingSection() {
  const [shareCode] = useState(`fake_${Math.random().toString(36).slice(2, 8)}`);
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [premium, setPremium] = useState(() => {
    try { return sessionStorage.getItem('knowrole-premium') === 'true'; } catch { return false; }
  });

  const shareUrl = `${window.location.origin}/results?shareCode=${shareCode}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const handleLoadCode = () => {
    if (!inputCode.trim()) return;
    try {
      sessionStorage.setItem('knowrole-share-load', inputCode.trim());
      window.dispatchEvent(new Event('storage'));
      // Simulate navigation
      window.history.pushState({}, '', `/results?shareCode=${inputCode.trim()}`);
    } catch {}
  };

  const handleNav = (page: string) => {
    try {
      const params = new URLSearchParams();
      switch (page) {
        case 'p1':
          params.set('phase', '1');
          params.set('view', 'personality');
          break;
        case 'p2':
          params.set('phase', '2');
          params.set('view', 'careers');
          break;
        case 'p3':
          params.set('phase', '3');
          params.set('view', 'growth');
          break;
      }
      sessionStorage.setItem('knowrole-nav', page);
      window.history.pushState({}, '', `?${params.toString()}`);
      window.dispatchEvent(new Event('storage'));
    } catch {}
  };

  const togglePremium = () => {
    const next = !premium;
    setPremium(next);
    try {
      if (next) sessionStorage.setItem('knowrole-premium', 'true');
      else sessionStorage.setItem('knowrole-premium', 'false');
    } catch {}
  };

  return (
    <div>
      <h3 style={{ ...styles.sectionHeader }}>🔗 RESULTS & SHARING</h3>

      {/* Shareable URL */}
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ ...styles.sectionHeader, marginBottom: 8 }}>SHAREABLE LINK</h4>
        <div style={{ ...styles.card, background: '#1a1a1a' }}>
          <code style={{ fontSize: 11, color: '#888', wordBreak: 'break-all' as const, display: 'block', marginBottom: 8 }}>
            {shareUrl}
          </code>
          <button
            onClick={handleCopyLink}
            style={{ ...styles.button, ...styles.buttonActive, width: '100%' }}
          >
            {copied ? '✓ Copied!' : '📋 Copy Link'}
          </button>
        </div>
      </div>

      {/* Load from Code */}
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ ...styles.sectionHeader, marginBottom: 8 }}>LOAD FROM CODE</h4>
        <div style={{ display: 'flex', gap: 6 }}>
          <input
            type="text"
            placeholder="Enter shareCode..."
            value={inputCode}
            onChange={e => setInputCode(e.target.value)}
            style={{ ...styles.input, flex: 1 }}
          />
          <button onClick={handleLoadCode} style={{ ...styles.button, ...styles.buttonActive }}>
            Load
          </button>
        </div>
      </div>

      {/* Quick Jump */}
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ ...styles.sectionHeader, marginBottom: 8 }}>QUICK JUMP</h4>
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
          {[
            { label: '📊 Personality (P1)', page: 'p1' },
            { label: '💼 Careers (P2)', page: 'p2' },
            { label: '📈 Growth (P3)', page: 'p3' },
          ].map(btn => (
            <button
              key={btn.page}
              onClick={() => handleNav(btn.page)}
              style={{ ...styles.button, textAlign: 'left' as const }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Premium Toggle */}
      <div>
        <h4 style={{ ...styles.sectionHeader, marginBottom: 8 }}>PREMIUM</h4>
        <button
          onClick={togglePremium}
          style={{
            ...styles.button,
            width: '100%',
            ...(premium ? { background: '#27ae60', color: '#fff', border: '1px solid #2ecc71' } : {}),
          }}
        >
          {premium ? '🔓 Premium Unlocked' : '🔒 Lock Premium'}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================
export { StateInspectorSection, ErrorInjectionSection, ViewportThemeSection, ResultsSharingSection };
