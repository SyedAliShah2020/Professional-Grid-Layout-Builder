let isMouseDown = false;
let startCell = null;
let currentBlock = null;
let blocks = [];
const cellHeight = 50;

function generateGrid() {
  const rows = parseInt(document.getElementById("rows").value);
  const cols = parseInt(document.getElementById("cols").value);
  const grid = document.getElementById("grid");

  grid.innerHTML = ""; // Clear previous grid

  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  grid.style.gridTemplateRows = `repeat(${rows}, ${cellHeight}px)`;

  for (let i = 0; i < rows * cols; i++) {
    const cell = document.createElement("div");
    cell.className = "grid-cell";
    cell.dataset.row = Math.floor(i / cols) + 1;
    cell.dataset.col = (i % cols) + 1;

    cell.addEventListener("mousedown", (e) => startDrag(e, cell));
    cell.addEventListener("mouseenter", (e) => continueDrag(e, cell));
    cell.addEventListener("touchstart", (e) => startDrag(e, cell), { passive: false });
    cell.addEventListener("touchmove", (e) => continueDragTouch(e), { passive: false });

    grid.appendChild(cell);
  }

  document.addEventListener("mouseup", endDrag);
  document.addEventListener("touchend", endDrag);

  clearBlocks();
  updateCode();
}

function startDrag(e, cell) {
  e.preventDefault();
  isMouseDown = true;
  startCell = cell;
  createBlock(cell, cell);
}

function continueDrag(e, cell) {
  if (!isMouseDown || !startCell || !currentBlock) return;
  e.preventDefault();

  const rows = parseInt(document.getElementById("rows").value);
  const cols = parseInt(document.getElementById("cols").value);

  const constrainedRow = Math.max(1, Math.min(rows, parseInt(cell.dataset.row)));
  const constrainedCol = Math.max(1, Math.min(cols, parseInt(cell.dataset.col)));

  let constrainedCell = cell;
  if (constrainedRow !== parseInt(cell.dataset.row) || constrainedCol !== parseInt(cell.dataset.col)) {
    constrainedCell = document.querySelector(`.grid-cell[data-row="${constrainedRow}"][data-col="${constrainedCol}"]`);
    if (!constrainedCell) return;
  }

  updateBlockDimensions(startCell, constrainedCell);
}

function continueDragTouch(e) {
  if (!isMouseDown || !startCell || !currentBlock) return;
  e.preventDefault();
  const touch = e.touches[0];
  const el = document.elementFromPoint(touch.clientX, touch.clientY);
  if (el && el.classList.contains("grid-cell")) {
    continueDrag(e, el);
  }
}

function endDrag() {
  isMouseDown = false;
  startCell = null;
  currentBlock = null;
}

function createBlock(startCell, endCell) {
  const block = document.createElement("div");
  block.className = "block";
  block.dataset.number = blocks.length + 1;

  block.addEventListener("dblclick", (e) => {
    e.stopPropagation();
    block.remove();
    blocks = blocks.filter((b) => b !== block);
    renumberBlocks();
    updateCode();
  });

  if (!updateBlockDimensions(startCell, endCell, block)) {
    return;
  }

  blocks.push(block);
  document.getElementById("grid").appendChild(block);
  currentBlock = block;
  updateCode();
}

function renumberBlocks() {
  blocks.forEach((block, index) => {
    block.dataset.number = index + 1;
    block.textContent = `Block ${index + 1}`;
  });
}

function updateBlockDimensions(startCell, endCell, block = currentBlock) {
  if (!block) return false;

  const rows = parseInt(document.getElementById("rows").value);
  const cols = parseInt(document.getElementById("cols").value);

  const r1 = Math.max(1, Math.min(rows, parseInt(startCell.dataset.row)));
  const c1 = Math.max(1, Math.min(cols, parseInt(startCell.dataset.col)));
  const r2 = Math.max(1, Math.min(rows, parseInt(endCell.dataset.row)));
  const c2 = Math.max(1, Math.min(cols, parseInt(endCell.dataset.col)));

  const rowStart = Math.min(r1, r2);
  const rowEnd = Math.max(r1, r2);
  const colStart = Math.min(c1, c2);
  const colEnd = Math.max(c1, c2);

  const leftPercent = ((colStart - 1) / cols) * 100;
  const widthPercent = ((colEnd - colStart + 1) / cols) * 100;
  const topPercent = ((rowStart - 1) / rows) * 100;
  const heightPercent = ((rowEnd - rowStart + 1) / rows) * 100;

  for (const existingBlock of blocks) {
    if (existingBlock === block) continue;

    const existingLeft = parseFloat(existingBlock.style.left);
    const existingWidth = parseFloat(existingBlock.style.width);
    const existingTop = parseFloat(existingBlock.style.top);
    const existingHeight = parseFloat(existingBlock.style.height);

    if (
      !(
        leftPercent + widthPercent <= existingLeft ||
        leftPercent >= existingLeft + existingWidth ||
        topPercent + heightPercent <= existingTop ||
        topPercent >= existingTop + existingHeight
      )
    ) {
      return false;
    }
  }

  block.style.left = `${leftPercent}%`;
  block.style.width = `${widthPercent}%`;
  block.style.top = `${topPercent}%`;
  block.style.height = `${heightPercent}%`;
  block.textContent = `Block ${block.dataset.number}`;
  return true;
}

function clearBlocks() {
  blocks.forEach((b) => b.remove());
  blocks = [];
  updateCode();
}

function updateCode() {
  const rows = document.getElementById("rows").value;
  const cols = document.getElementById("cols").value;

  let htmlCode = `<div class="grid-container">\n`;
  blocks.forEach((block) => {
    htmlCode += `  <div class="block" style="left: ${block.style.left}; width: ${block.style.width}; top: ${block.style.top}; height: ${block.style.height}">Block ${block.dataset.number}</div>\n`;
  });
  htmlCode += `</div>`;

  let cssCode = `.grid-container {\n`;
  cssCode += `  display: grid;\n`;
  cssCode += `  grid-template-rows: repeat(${rows}, ${cellHeight}px);\n`;
  cssCode += `  grid-template-columns: repeat(${cols}, 1fr);\n`;
  cssCode += `  gap: 5px;\n`;
  cssCode += `  width: 90%;\n`;
  cssCode += `  max-width: 600px;\n`;
  cssCode += `  margin: 20px auto;\n`;
  cssCode += `  position: relative;\n`;
  cssCode += `}\n\n`;
  cssCode += `.block {\n`;
  cssCode += `  background: #ffcccb;\n`;
  cssCode += `  border: 2px solid #ff9999;\n`;
  cssCode += `  font-weight: bold;\n`;
  cssCode += `  display: flex;\n`;
  cssCode += `  align-items: center;\n`;
  cssCode += `  justify-content: center;\n`;
  cssCode += `  position: absolute;\n`;
  cssCode += `  box-sizing: border-box;\n`;
  cssCode += `}\n`;

  document.getElementById("htmlCode").value = htmlCode;
  document.getElementById("cssCode").value = cssCode;
}

document.addEventListener("DOMContentLoaded", () => {
  generateGrid();

  // Add theme toggle event listener here:
  const themeButton = document.getElementById("themeToggle");
  themeButton.addEventListener("click", () => {
    const body = document.body;

    if (body.classList.contains("dark")) {
      body.classList.remove("dark");
      themeButton.textContent = "Light Mode Active";
    } else {
      body.classList.add("dark");
      themeButton.textContent = "Dark Mode Active";
    }
  });
});
