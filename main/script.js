const items = document.querySelectorAll('.item');
const cells = document.querySelectorAll('.cell');
const lockButton = document.getElementById('lockButton');
const resetButton = document.getElementById('resetButton');
const board = document.getElementById('board');
let locked = false;

items.forEach(item => {
    item.addEventListener('dragstart', e => {
        if (locked) return;
        e.dataTransfer.setData('text/plain', JSON.stringify({
            word: item.dataset.word,
            img: item.dataset.img
        }));
    });
});

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
        cell.innerHTML = `
      <img src="${data.img}" alt="${data.word}" "><br>
      <span>${data.word}</span>
      <button class="remove-btn">✖</button>
    `;
    });

    cell.addEventListener('click', () => {
        if (!locked) return;
        cell.classList.toggle('checked');
    });
});

lockButton.addEventListener('click', () => {
    locked = true;
    lockButton.style.display = 'none';
    cells.forEach(cell => {
        cell.classList.add('locked');
        const btn = cell.querySelector('.remove-btn');
        if (btn) btn.remove();
    });
});

resetButton.addEventListener('click', () => {
    locked = false;
    lockButton.style.display = 'inline-block';
    cells.forEach(cell => {
        cell.innerHTML = '';
        cell.classList.remove('locked', 'checked');
    });
});

// Delegate remove button clicks
board.addEventListener('click', e => {
    if (e.target.classList.contains('remove-btn')) {
        const cell = e.target.closest('.cell');
        cell.innerHTML = '';
    }
});