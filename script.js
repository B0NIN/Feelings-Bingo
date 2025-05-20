const items = document.querySelectorAll('.item');
const cells = document.querySelectorAll('.cell');
const lockButton = document.getElementById('lockButton');
const resetButton = document.getElementById('resetButton');
const board = document.getElementById('board');

let locked = false;
const usedWords = new Set();
let dragSourceCell = null; // 🔄 Track original cell source

// DRAG START
document.addEventListener('dragstart', e => {
    if (locked) return;

    const item = e.target.closest('.item');
    const cell = e.target.closest('.cell');

    if (item && !item.classList.contains('used')) {
        e.dataTransfer.setData('text/plain', JSON.stringify({
            word: item.dataset.word,
            img: item.dataset.img,
            from: 'item'
        }));
    } else if (cell && cell.querySelector('img')) {
        const img = cell.querySelector('img');
        dragSourceCell = cell; // Save source to clear later
        e.dataTransfer.setData('text/plain', JSON.stringify({
            word: img.alt,
            img: img.src,
            from: 'cell'
        }));
    }
});

// DRAG OVER / DROP
cells.forEach(cell => {
    cell.addEventListener('dragover', e => {
        if (locked) return;
        e.preventDefault();
        cell.classList.add('hover');
    });

    cell.addEventListener('dragleave', () => {
        cell.classList.remove('hover');
    });

    cell.addEventListener('drop', e => {
        if (locked) return;
        e.preventDefault();
        cell.classList.remove('hover');

        const data = JSON.parse(e.dataTransfer.getData('text/plain'));
        const { word, img, from } = data;

        // Prevent drop from item bank if already used
        if (usedWords.has(word) && from === 'item') return;

        // Remove current content in destination cell
        const existingImg = cell.querySelector('img');
        if (existingImg) {
            const prevWord = existingImg.alt;
            usedWords.delete(prevWord);
            const prevItem = document.querySelector(`.item[data-word="${prevWord}"]`);
            if (prevItem) prevItem.classList.remove('used');
        }

        // If dragging from item bank, mark as used
        if (from === 'item') {
            usedWords.add(word);
            const item = document.querySelector(`.item[data-word="${word}"]`);
            if (item) item.classList.add('used');
        }

        // If dragging from another cell, clear the original cell
        if (from === 'cell' && dragSourceCell && dragSourceCell !== cell) {
            dragSourceCell.innerHTML = '';
        }

        // Set content
        const staticImg = img.endsWith('.gif') ? img.replace('.gif', '.png') : img;

        cell.innerHTML = `
    <img src="${staticImg}" alt="${word}" draggable="true"><br>
    <button class="remove-btn">✖</button>
`;

        dragSourceCell = null; // Reset

        updateLockButtonVisibility();
    });

    cell.addEventListener('click', () => {
        if (!locked) return;
        cell.classList.toggle('checked');
        updateLockButtonVisibility();
    });
});

// LOCK
lockButton.addEventListener('click', () => {
    // Check if all cells are filled
    const allFilled = Array.from(cells).every(cell => cell.querySelector('img'));
    if (!allFilled) {
        alert('Please fill all cells before finalizing the board.');
        return;
    }

    locked = true;
    lockButton.style.display = 'none';
    cells.forEach(cell => {
        cell.classList.add('locked');
        const btn = cell.querySelector('.remove-btn');
        if (btn) btn.remove();
    });
});

// RESET
resetButton.addEventListener('click', () => {
    locked = false;
    usedWords.clear();
    dragSourceCell = null;
    lockButton.style.display = 'inline-block';
    cells.forEach(cell => {
        cell.innerHTML = '';
        cell.classList.remove('locked', 'checked');
    });
    items.forEach(item => item.classList.remove('used'));

    updateLockButtonVisibility();
});

// REMOVE BUTTON
board.addEventListener('click', e => {
    if (e.target.classList.contains('remove-btn')) {
        const cell = e.target.closest('.cell');
        const img = cell.querySelector('img');
        if (img) {
            const word = img.alt;
            usedWords.delete(word);
            const item = document.querySelector(`.item[data-word="${word}"]`);
            if (item) item.classList.remove('used');
        }
        cell.innerHTML = '';

        updateLockButtonVisibility();
    }
});

function updateLockButtonVisibility() {
    if (locked) {
        lockButton.style.display = 'none'; // Ensure the button stays hidden when locked
        return;
    }

    const allFilled = Array.from(cells).every(cell => cell.querySelector('img'));
    lockButton.style.display = allFilled ? 'inline-block' : 'none';
}

// Call this function whenever the board state changes
cells.forEach(cell => {
    cell.addEventListener('drop', () => {
        updateLockButtonVisibility();
    });

    cell.addEventListener('click', () => {
        updateLockButtonVisibility();
    });
});

resetButton.addEventListener('click', () => {
    updateLockButtonVisibility();
});

// Initial check on page load
updateLockButtonVisibility();
