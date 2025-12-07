import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { notesAPI } from '../services/api';
import { formatSmartDate } from '../utils/dateUtils';
import { useApp } from '../App';

export default function Notebook() {
    const [notes, setNotes] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showPreview, setShowPreview] = useState(true);
    const [loading, setLoading] = useState(true);
    const { triggerRefresh } = useApp();

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        tags: '',
    });

    useEffect(() => {
        loadNotes();
    }, []);

    const loadNotes = async () => {
        try {
            setLoading(true);
            const loadedNotes = await notesAPI.getAll();
            setNotes(loadedNotes);
        } catch (error) {
            console.error('Error loading notes:', error);
            alert('Failed to load notes. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        setSelectedNote(null);
        setIsEditing(true);
        setFormData({ title: '', content: '', tags: '' });
        setShowPreview(false);
    };

    const handleSelectNote = (note) => {
        setSelectedNote(note);
        setFormData({
            title: note.title,
            content: note.content,
            tags: note.tags ? note.tags.join(', ') : '',
        });
        setIsEditing(false);
        setShowPreview(true);
    };

    const handleSave = async () => {
        try {
            const noteData = {
                title: formData.title,
                content: formData.content,
                tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
            };

            if (selectedNote) {
                await notesAPI.update(selectedNote._id, noteData);
            } else {
                const newNote = await notesAPI.create(noteData);
                setSelectedNote(newNote);
            }

            setIsEditing(false);
            setShowPreview(true);
            await loadNotes();
            triggerRefresh();
        } catch (error) {
            console.error('Error saving note:', error);
            alert('Failed to save note. Please try again.');
        }
    };

    const handleDelete = async () => {
        if (selectedNote && window.confirm('Are you sure you want to delete this note?')) {
            try {
                await notesAPI.delete(selectedNote._id);
                setSelectedNote(null);
                setFormData({ title: '', content: '', tags: '' });
                await loadNotes();
                triggerRefresh();
            } catch (error) {
                console.error('Error deleting note:', error);
                alert('Failed to delete note. Please try again.');
            }
        }
    };

    const getFilteredNotes = () => {
        if (!searchQuery) return notes;

        const query = searchQuery.toLowerCase();
        return notes.filter(note =>
            note.title.toLowerCase().includes(query) ||
            note.content.toLowerCase().includes(query) ||
            (note.tags && note.tags.some(tag => tag.toLowerCase().includes(query)))
        );
    };

    const filteredNotes = getFilteredNotes();

    return (
        <div className="fade-in" style={{ display: 'flex', gap: 'var(--spacing-lg)', height: 'calc(100vh - 6rem)' }}>
            {/* Notes List Sidebar */}
            <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                <div className="glass-card" style={{ padding: 'var(--spacing-md)' }}>
                    <input
                        type="text"
                        className="input"
                        placeholder="🔍 Search notes..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ marginBottom: 'var(--spacing-md)' }}
                    />
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleCreateNew}>
                        + New Note
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                    {loading ? (
                        <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                            <div className="text-muted">Loading notes...</div>
                        </div>
                    ) : filteredNotes.length === 0 ? (
                        <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
                            <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>📝</div>
                            <p className="text-sm text-muted">No notes found</p>
                        </div>
                    ) : (
                        filteredNotes.map((note) => (
                            <div
                                key={note._id}
                                className="glass-card"
                                onClick={() => handleSelectNote(note)}
                                style={{
                                    padding: 'var(--spacing-md)',
                                    cursor: 'pointer',
                                    borderLeft: selectedNote?._id === note._id ? '4px solid var(--primary-500)' : '4px solid transparent',
                                    background: selectedNote?._id === note._id ? 'var(--gradient-glass)' : 'var(--glass-bg)',
                                }}
                            >
                                <h4 style={{ margin: '0 0 var(--spacing-xs) 0', fontSize: '0.9375rem' }}>
                                    {note.title || 'Untitled'}
                                </h4>
                                <p className="text-sm text-muted" style={{ margin: '0 0 var(--spacing-xs) 0' }}>
                                    {note.content.substring(0, 60)}...
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted">
                                        {formatSmartDate(note.updatedAt)}
                                    </span>
                                    {note.tags && note.tags.length > 0 && (
                                        <span className="badge badge-primary">{note.tags[0]}</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Note Editor/Viewer */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                {selectedNote || isEditing ? (
                    <>
                        <div className="glass-card" style={{ padding: 'var(--spacing-md)' }}>
                            <div className="flex items-center justify-between">
                                <div className="flex gap-sm">
                                    {!isEditing ? (
                                        <>
                                            <button className="btn btn-sm btn-primary" onClick={() => { setIsEditing(true); setShowPreview(false); }}>
                                                ✏️ Edit
                                            </button>
                                            <button className="btn btn-sm btn-danger" onClick={handleDelete}>
                                                🗑️ Delete
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button className="btn btn-sm btn-success" onClick={handleSave}>
                                                💾 Save
                                            </button>
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                onClick={() => {
                                                    if (selectedNote) {
                                                        handleSelectNote(selectedNote);
                                                    } else {
                                                        setIsEditing(false);
                                                        setFormData({ title: '', content: '', tags: '' });
                                                    }
                                                }}
                                            >
                                                ✕ Cancel
                                            </button>
                                        </>
                                    )}
                                </div>

                                {isEditing && (
                                    <div className="flex gap-sm">
                                        <button
                                            className={`btn btn-sm ${!showPreview ? 'btn-primary' : 'btn-ghost'}`}
                                            onClick={() => setShowPreview(false)}
                                        >
                                            📝 Edit
                                        </button>
                                        <button
                                            className={`btn btn-sm ${showPreview ? 'btn-primary' : 'btn-ghost'}`}
                                            onClick={() => setShowPreview(true)}
                                        >
                                            👁️ Preview
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="glass-card" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                            {isEditing && !showPreview ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', height: '100%' }}>
                                    <div>
                                        <label className="text-sm font-medium" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="Note title..."
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                                            Tags (comma-separated)
                                        </label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={formData.tags}
                                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                            placeholder="learning, javascript, tutorial..."
                                        />
                                    </div>

                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <label className="text-sm font-medium" style={{ display: 'block', marginBottom: 'var(--spacing-sm)' }}>
                                            Content (Markdown)
                                        </label>
                                        <textarea
                                            className="textarea"
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            placeholder="Write your note in markdown format..."
                                            style={{ flex: 1, minHeight: '400px', fontFamily: 'var(--font-mono)', fontSize: '0.9375rem' }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="markdown-content">
                                    <h1>{formData.title || 'Untitled'}</h1>

                                    {formData.tags && (
                                        <div className="flex gap-sm" style={{ marginBottom: 'var(--spacing-lg)' }}>
                                            {formData.tags.split(',').map(t => t.trim()).filter(t => t).map((tag, i) => (
                                                <span key={i} className="badge badge-primary">{tag}</span>
                                            ))}
                                        </div>
                                    )}

                                    {selectedNote && (
                                        <p className="text-sm text-muted" style={{ marginBottom: 'var(--spacing-lg)' }}>
                                            Last updated {formatSmartDate(selectedNote.updatedAt)}
                                        </p>
                                    )}

                                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--spacing-lg)' }}>
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {formData.content || '*No content yet*'}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="glass-card" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                        <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-lg)' }}>📓</div>
                        <h2>Welcome to your Notebook</h2>
                        <p className="text-secondary" style={{ textAlign: 'center', maxWidth: '400px' }}>
                            Select a note from the sidebar or create a new one to start writing.
                            All notes support markdown formatting!
                        </p>
                        <button className="btn btn-primary mt-lg" onClick={handleCreateNew}>
                            + Create Your First Note
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
