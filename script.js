let notes = JSON.parse(localStorage.getItem('proNotes_v2')) || [];
let editNoteId = null;
let currentFilter = 'All';

// Elements
const notesGrid = document.getElementById('notesGrid');
const noteModal = document.getElementById('noteModal');
const themeToggle = document.getElementById('themeToggle');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    renderNotes();
    setupEventListeners();
});

function setupEventListeners() {
    // Modal controls
    document.getElementById('addNoteBtn').onclick = openModal;
    document.getElementById('mobileAddBtn').onclick = openModal;
    document.querySelector('.close-modal-btn').onclick = closeModal;
    document.getElementById('saveNoteBtn').onclick = saveNote;

    // Search & Filter
    document.getElementById('searchInput').oninput = renderNotes;

    document.querySelectorAll('.filter-chip').forEach(chip => {
         chip.onclick = () => {
              document.querySelector('.filter-chip.active').classList.remove('active');
              chip.classList.add('active');
              currentFilter = chip.dataset.cat;
              renderNotes();
         };
    });

    // Theme Toggle
    themeToggle.onclick = () => {
         const body = document.body;
         const isDark = body.getAttribute('data-theme') === 'dark';
         body.setAttribute('data-theme', isDark ? 'light' : 'dark');
         themeToggle.innerHTML = isDark ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    };
}

function openModal() {
    editNoteId = null;
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteBody').innerHTML = '';
    document.getElementById('noteCategory').value = 'Personal';
    noteModal.style.display = 'block';
}

function closeModal() {
    noteModal.style.display = 'none';
}

function renderNotes() {
    const search = document.getElementById('searchInput').value.toLowerCase();

    const filtered = notes.filter(n => {
        const matchesSearch = n.title.toLowerCase().includes(search) || n.content.toLowerCase().includes(search);
        const matchesCat = currentFilter === 'All' || n.category === currentFilter;
        return matchesSearch && matchesCat;
    }).sort((a, b) => b.isPinned - a.isPinned);

    notesGrid.innerHTML = filtered.map(note => `
      <div class="note-card animate">
        <div style="display:flex; justify-content:space-between; align-items:start">
            <span class="category-tag">${note.category}</span>
            <button onclick="togglePin('${note.id}')" style="background:none; border:none; color:${note.isPinned ? 'var(--accent)' : '#ccc'}; cursor:pointer">
                <i class="fas fa-thumbtack"></i>
            </button>
        </div>
        <h3>${note.title || 'Untitled'}</h3>
        <p>${note.content.replace(/<[^>]*>/g, '').substring(0, 120)}...</p>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto">
            <small style="color:var(--text-light)">${note.date}</small>
            <div class="tool-group">
                <button onclick="editNote('${note.id}')"><i class="fas fa-pen"></i></button>
                <button onclick="deleteNote('${note.id}')"><i class="fas fa-trash"></i></button>
            </div>
        </div>
      </div>
    `).join('');
}

function saveNote() {
    const title = document.getElementById('noteTitle').value;
    const content = document.getElementById('noteBody').innerHTML;
    const category = document.getElementById('noteCategory').value;

    if (!content.trim()) return;

    if (editNoteId) {
        const idx = notes.findIndex(n => n.id === editNoteId);
        notes[idx] = { ...notes[idx], title, content, category };
    } else {
        notes.push({
            id: Date.now().toString(),
            title, content, category,
            isPinned: false,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        });
    }

    localStorage.setItem('proNotes_v2', JSON.stringify(notes));
    closeModal();
    renderNotes();
}

function editNote(id) {
    const note = notes.find(n => n.id === id);
    editNoteId = id;
    document.getElementById('noteTitle').value = note.title;
    document.getElementById('noteBody').innerHTML = note.content;
    document.getElementById('noteCategory').value = note.category;
    noteModal.style.display = 'block';
}

function deleteNote(id) {
    notes = notes.filter(n => n.id !== id);
    localStorage.setItem('proNotes_v2', JSON.stringify(notes));
    renderNotes();
}

function togglePin(id) {
    const idx = notes.findIndex(n => n.id === id);
    notes[idx].isPinned = !notes[idx].isPinned;
    localStorage.setItem('proNotes_v2', JSON.stringify(notes));
    renderNotes();
}

function formatDoc(cmd) {
    document.execCommand(cmd, false, null);
}