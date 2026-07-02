import { useEffect, useRef, useState, useCallback } from 'react'
import Editor from '@monaco-editor/react'

const LANG_MAP = {
  js: 'javascript', jsx: 'javascript',
  ts: 'typescript', tsx: 'typescript',
  py: 'python', css: 'css', html: 'html',
  json: 'json', md: 'markdown',
  yml: 'yaml', yaml: 'yaml', sh: 'shell',
}

function getLang(filePath) {
  const ext = filePath?.split('.').pop()?.toLowerCase()
  return LANG_MAP[ext] || 'plaintext'
}

export default function CodeEditor({ agentBase, filePath }) {
  const editorRef = useRef(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [saveState, setSaveState] = useState('idle') // 'idle' | 'saving' | 'saved' | 'error'
  const [isDirty, setIsDirty] = useState(false)

  // ─── Fetch file content when filePath changes ───────────────────────────
  useEffect(() => {
    if (!filePath || !agentBase) return
    setLoading(true)
    setIsDirty(false)
    setSaveState('idle')
    console.log(agentBase,filePath)
    fetch(`${agentBase}/read-files?files=${encodeURIComponent(filePath)}`)
      .then(r => r.json())
      .then(data => setContent(Object.values(data.files?.[0])[0] ?? ''))
      .catch(() => setContent('// Could not load file'))
      .finally(() => setLoading(false))
  }, [filePath, agentBase])

  // ─── Save function ───────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!filePath || !editorRef.current) return
    const currentContent = editorRef.current.getValue()
    setSaveState('saving')

    try {
      const res = await fetch(`${agentBase}/update-files`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: [{ file: filePath, content: currentContent }]
        }),
      })

      if (res.ok) {
        setSaveState('saved')
        setIsDirty(false)
        setTimeout(() => setSaveState('idle'), 2000)
      } else {
        setSaveState('error')
        setTimeout(() => setSaveState('idle'), 3000)
      }
    } catch {
      setSaveState('error')
      setTimeout(() => setSaveState('idle'), 3000)
    }
  }, [filePath, agentBase])

  // ─── Wire Ctrl+S inside Monaco ───────────────────────────────────────────
  function handleEditorMount(editor, monaco) {
    editorRef.current = editor
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
      handleSave
    )
  }

  // Re-register Ctrl+S whenever handleSave changes (new filePath)
  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return
    // addCommand returns a disposable; override by re-adding
    editor.addCommand(
      // monaco is available via the editor's internal _standaloneKeybindingService
      // simplest: just use the raw keybinding code
      2097 | (2048 << 16), // CtrlCmd+S
      handleSave
    )
  }, [handleSave])

  // ─── No file selected ────────────────────────────────────────────────────
  if (!filePath) {
    return (
      <div className="flex items-center justify-center h-full"
        style={{ background: '#0d1117', color: '#3a5068' }}>
        <div className="text-center">
          <div style={{ fontSize: 40, marginBottom: 12 }}>📁</div>
          <p style={{ fontSize: 14 }}>Select a file from the explorer</p>
        </div>
      </div>
    )
  }

  // ─── Save state badge ────────────────────────────────────────────────────
  const badge = {
    idle:   isDirty ? { text: '● Unsaved', color: '#f59e0b' } : null,
    saving: { text: 'Saving…',  color: '#60a5fa' },
    saved:  { text: '✓ Saved',  color: '#34d399' },
    error:  { text: '✗ Failed', color: '#f87171' },
  }[saveState]

  return (
    <div className="flex flex-col h-full" style={{ background: '#0d1117' }}>

      {/* ── Tab / top bar ── */}
      <div className="flex items-center justify-between px-3 shrink-0"
        style={{ height: 36, background: '#070b14', borderBottom: '1px solid #1e2d45' }}>

        {/* File tab */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-t"
          style={{ background: '#0d1424', border: '1px solid #1e2d45', borderBottom: 'none', fontSize: 13, color: '#c9d1d9' }}>
          <span style={{ color: '#60a5fa' }}>◆</span>
          <span>{filePath.split('/').pop()}</span>
          {isDirty && <span style={{ color: '#f59e0b', fontSize: 10 }}>●</span>}
        </div>

        {/* Right side: badge + save button */}
        <div className="flex items-center gap-3">
          {badge && (
            <span style={{ fontSize: 12, color: badge.color }}>{badge.text}</span>
          )}
          <button
            onClick={handleSave}
            disabled={saveState === 'saving'}
            style={{
              padding: '3px 12px',
              fontSize: 12,
              borderRadius: 4,
              background: saveState === 'saving' ? '#1e2d45' : '#1d4ed8',
              color: '#fff',
              border: 'none',
              cursor: saveState === 'saving' ? 'not-allowed' : 'pointer',
              opacity: saveState === 'saving' ? 0.7 : 1,
            }}>
            {saveState === 'saving' ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* ── Breadcrumb ── */}
      <div className="px-4 shrink-0 flex items-center gap-1"
        style={{ height: 26, background: '#070b14', borderBottom: '1px solid #131d2e', fontSize: 11, color: '#3a5068' }}>
        {filePath.split('/').map((part, i, arr) => (
          <span key={i} style={{ color: i === arr.length - 1 ? '#8b9ab0' : '#3a5068' }}>
            {part}{i < arr.length - 1 && <span style={{ margin: '0 4px' }}>/</span>}
          </span>
        ))}
      </div>

      {/* ── Monaco Editor ── */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full"
            style={{ color: '#3a5068', fontSize: 13 }}>
            Loading {filePath.split('/').pop()}…
          </div>
        ) : (
          <Editor
            height="100%"
            language={getLang(filePath)}
            value={content}
            onMount={handleEditorMount}
            onChange={() => setIsDirty(true)}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
              fontLigatures: true,
              minimap: { enabled: false },
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              lineNumbers: 'on',
              renderLineHighlight: 'line',
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              bracketPairColorization: { enabled: true },
              padding: { top: 12 },
            }}
          />
        )}
      </div>
    </div>
  )
}