import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Heart, Award, RefreshCw } from 'lucide-react';

const WordSearchGame = () => {
  const allWords = ['SOPA', 'GOZO', 'SALVAR', 'PERDON', 'PANAMA', 'LETRAS', 'AMOR', 'JUGAR', 'SANTIDAD', 'FAMILIA', 'RELOJ', 'PINTAR', 'ESTRELLA', 'BOSQUE',
                  'FELIZ', 'ESPOSA', 'RISA', 'TIEMPO', 'SOL', 'LUNA', 'PAZ', 'CIELO', 'FLOR', 'APOYO', 'AFECTO', 'PESO', 'ARBOL', 'AMISTAD',
				  'BESO', 'ABRAZO', 'BONDAD', 'ELVIS', 'ZAYDA', 'JESUS', 'LEALTAD', 'PACIENCIA', 'VERDAD', 'HONESTO', 'COMER', 'FUERTE', 'PUCHU', 'CESARIN',
				  'ANA', 'BILLY', 'MARIFER', 'PEPE', 'ORLANDO', 'MARLENE', 'PENELOPE', 'LUCY', 'AROMA', 'YOYA', 'ISMAEL', 'NELDA', 'AMANDA', 'KATY', 'YAÑEZ', 
				  'YASUANY', 'ONERYS', 'MIMA', 'ALFREDO', 'POCHITO','EMMA', 'NAIROBI', 'NAOMI',  'JULIO', 'MEMI', 'EUCLIDES', 'TITO', 'TEMPLANZA'
				  ];
  
  const HUES = [
    'rgba(255, 107, 107, 0.7)',
    'rgba(78, 205, 196, 0.7)',
    'rgba(255, 159, 243, 0.7)',
    'rgba(255, 195, 113, 0.7)',
    'rgba(132, 129, 255, 0.7)',
    'rgba(72, 219, 251, 0.7)',
    'rgba(255, 107, 129, 0.7)',
    'rgba(162, 255, 178, 0.7)'
  ];

  const [gridSize, setGridSize] = useState(8);
  const [gridData, setGridData] = useState([]);
  const [wordList, setWordList] = useState([]);
  const [foundWords, setFoundWords] = useState(new Set());
  const [selecting, setSelecting] = useState(false);
  const [selectedCells, setSelectedCells] = useState([]);
  const [dragDirection, setDragDirection] = useState(null);
  const [level, setLevel] = useState('facil');
  const [sound, setSound] = useState('campana');
  const [lines, setLines] = useState([]);
  const [colorIndex, setColorIndex] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  const [particles, setParticles] = useState([]);
  const [wordPositions, setWordPositions] = useState([]);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const gridRef = useRef(null);

  const directions = {
    H: [0, 1], HR: [0, -1], V: [1, 0], VR: [-1, 0],
    D: [1, 1], DR: [-1, -1], DL: [1, -1], DU: [-1, 1]
  };

  // Generate game
  const generateGame = () => {
    setFoundWords(new Set());
    setLines([]);
    setSelectedCells([]);
    setSelecting(false);
    setDragDirection(null);
    setColorIndex(0);
    setCelebrating(false);
    setParticles([]);
    setWordPositions([]);

    let size = 12;
    let words = [];

    if (level === 'facil') {
	  size = 8;
	  words = shuffle(allWords).filter(w => w.length <= 6).slice(0, 8); // ← cambiado de 6 a 8
	} else if (level === 'medio') {
	  size = 10;
	  words = shuffle(allWords).filter(w => w.length <= 8).slice(0, 10);
	} else {
	  size = 12;
	  words = shuffle(allWords).slice(0, 12);
	}

    setGridSize(size);
    setWordList(words);

    let grid = Array.from({ length: size }, () => Array(size).fill(''));
    const positions = [];
    
    // Place words and store their positions
    for (const word of words) {
      let placed = false;
      for (let attempt = 0; attempt < 500 && !placed; attempt++) {
        const dirKeys = Object.keys(directions);
        const dirKey = dirKeys[Math.floor(Math.random() * dirKeys.length)];
        const [dx, dy] = directions[dirKey];
        const row = Math.floor(Math.random() * size);
        const col = Math.floor(Math.random() * size);
        
        if (canPlaceWord(grid, word, row, col, dx, dy, size)) {
          const cells = [];
          for (let i = 0; i < word.length; i++) {
            grid[row + dx * i][col + dy * i] = word[i];
            cells.push({ row: row + dx * i, col: col + dy * i });
          }
          positions.push({ word, cells, direction: [dx, dy] });
          placed = true;
        }
      }
    }

    setWordPositions(positions);

    // Fill empty cells
    const letters = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (!grid[i][j]) {
          grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }

    setGridData(grid);
  };

  const canPlaceWord = (grid, word, row, col, dx, dy, size) => {
    for (let i = 0; i < word.length; i++) {
      const r = row + dx * i;
      const c = col + dy * i;
      if (r < 0 || r >= size || c < 0 || c >= size) return false;
      const cell = grid[r][c];
      if (cell && cell !== word[i]) return false;
    }
    return true;
  };

  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  // NUEVA FUNCIÓN: Buscar si existe una palabra en la dirección propuesta
  const findValidDirection = (startRow, startCol, currentRow, currentCol) => {
    const dx = Math.sign(currentRow - startRow);
    const dy = Math.sign(currentCol - startCol);
    
    if (dx === 0 && dy === 0) return null;
    
    // Verificar si existe alguna palabra no encontrada en esta dirección
    for (const wordPos of wordPositions) {
      if (foundWords.has(wordPos.word)) continue;
      
      const [wdx, wdy] = wordPos.direction;
      
      // Verificar dirección coincidente (normal o inversa)
      const matchesDirection = (dx === wdx && dy === wdy) || (dx === -wdx && dy === -wdy);
      
      if (matchesDirection) {
        // Verificar si la celda inicial está en esta palabra
        const startsInWord = wordPos.cells.some(cell => 
          cell.row === startRow && cell.col === startCol
        );
        
        if (startsInWord) {
          return [dx, dy]; // Dirección válida encontrada
        }
      }
    }
    
    // Si no hay palabra conocida, permitir la dirección de todos modos
    return [dx, dy];
  };

  const buildPath = (startRow, startCol, endRow, endCol, dx, dy) => {
    const path = [];
    let currentRow = startRow;
    let currentCol = startCol;
    
    const stepsRow = dx !== 0 ? Math.abs(endRow - startRow) : 0;
    const stepsCol = dy !== 0 ? Math.abs(endCol - startCol) : 0;
    const maxSteps = Math.max(stepsRow, stepsCol);
    
    for (let step = 0; step <= maxSteps; step++) {
      if (currentRow >= 0 && currentRow < gridSize && 
          currentCol >= 0 && currentCol < gridSize) {
        path.push({ row: currentRow, col: currentCol });
      }
      
      if (currentRow === endRow && currentCol === endCol) break;
      
      const nextRow = currentRow + dx;
      const nextCol = currentCol + dy;
      
      if (dx > 0 && nextRow > endRow) break;
      if (dx < 0 && nextRow < endRow) break;
      if (dy > 0 && nextCol > endCol) break;
      if (dy < 0 && nextCol < endCol) break;
      
      currentRow = nextRow;
      currentCol = nextCol;
      
      if (step > 20) break;
    }
    
    return path;
  };

  // Mouse/Touch handlers
  const handleStart = (e, row, col) => {
    e.preventDefault();
    setSelecting(true);
    setSelectedCells([{ row, col }]);
    setDragDirection(null);
  };

  const handleMove = (e, row, col) => {
    if (!selecting) return;
    
    if (selectedCells.length === 0) {
      setSelectedCells([{ row, col }]);
      return;
    }

    const first = selectedCells[0];
    
    if (selectedCells.length === 1) {
      if (row === first.row && col === first.col) return;
      
      // MEJORA: Usar validación inteligente
      const validDirection = findValidDirection(first.row, first.col, row, col);
      
      if (!validDirection) return;
      
      setDragDirection(validDirection);
      
      const path = buildPath(first.row, first.col, row, col, validDirection[0], validDirection[1]);
      setSelectedCells(path);
      return;
    }

    if (!dragDirection) return;

    const last = selectedCells[selectedCells.length - 1];

    // Check if going backwards
    if (selectedCells.length > 1) {
      const prev = selectedCells[selectedCells.length - 2];
      if (prev.row === row && prev.col === col) {
        setSelectedCells(selectedCells.slice(0, -1));
        return;
      }
    }

    // Calcular dirección desde el origen
    const totalDx = row - first.row;
    const totalDy = col - first.col;
    
    const currentDx = totalDx === 0 ? 0 : Math.sign(totalDx);
    const currentDy = totalDy === 0 ? 0 : Math.sign(totalDy);
    
    // Más tolerante: permitir si mantiene dirección general
    const isCompatible = (
      (dragDirection[0] === 0 || currentDx === 0 || dragDirection[0] === currentDx) &&
      (dragDirection[1] === 0 || currentDy === 0 || dragDirection[1] === currentDy)
    );

    if (!isCompatible) return;

    const newPath = buildPath(first.row, first.col, row, col, dragDirection[0], dragDirection[1]);
    
    if (newPath.length > 0 && newPath.length >= selectedCells.length) {
      setSelectedCells(newPath);
    }
  };

  const handleEnd = () => {
    if (!selecting) return;
    setSelecting(false);

    const selectedWord = selectedCells.map(cell => gridData[cell.row][cell.col]).join('');
    const reversedWord = selectedWord.split('').reverse().join('');

    let matched = null;
    if (wordList.includes(selectedWord)) matched = selectedWord;
    else if (wordList.includes(reversedWord)) matched = reversedWord;

    if (matched && !foundWords.has(matched)) {
      const newFoundWords = new Set(foundWords);
      newFoundWords.add(matched);
      setFoundWords(newFoundWords);

      const color = HUES[colorIndex % HUES.length];
      setColorIndex(colorIndex + 1);

      // ← CAMBIO IMPORTANTE AQUÍ
      setLines(prev => [...prev, {
      cells: [...selectedCells],
      color,
      isFound: true  } // ← agregamos esta propiedad
    
      ]);

  // Opcional: aquí puedes agregar sonido, partículas, etc.


      createParticles(selectedCells[Math.floor(selectedCells.length / 2)]);

      if (newFoundWords.size === wordList.length) {
        setTimeout(() => {
          setCelebrating(true);
          playVictorySound();
        }, 300);
      }
    }

    setSelectedCells([]);
    setDragDirection(null);
  }; 

  const createParticles = (centerCell) => {
    const newParticles = [];
    for (let i = 0; i < 8; i++) {
      newParticles.push({
        id: Math.random(),
        row: centerCell.row,
        col: centerCell.col,
        angle: (Math.PI * 2 * i) / 8,
        speed: 2 + Math.random() * 2
      });
    }
    setParticles([...particles, ...newParticles]);
    setTimeout(() => {
      setParticles(p => p.filter(particle => !newParticles.find(np => np.id === particle.id)));
    }, 800);
  };

  const playVictorySound = () => {
    console.log(`Playing ${sound} sound`);
  };

  const isCellSelected = (row, col) => {
    return selectedCells.some(cell => cell.row === row && cell.col === col);
  };

  // Draw lines on canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext('2d');
    
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    lines.forEach(line => {
      drawLine(ctx, line.cells, line.color);
    });

    if (selecting && selectedCells.length > 1) {
      drawLine(ctx, selectedCells, 'rgba(100, 100, 255, 0.5)');
    }
  }, [lines, selectedCells, selecting, gridData]);

  const drawLine = (ctx, cells, color, isFound = false) => {
    if (cells.length < 2) return;

    const cellElements = cells.map(cell => {
      const td = gridRef.current?.querySelector(`[data-row="${cell.row}"][data-col="${cell.col}"]`);
      return td;
    }).filter(Boolean);

    if (cellElements.length < 2) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = 35;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
	
    // Si la palabra ya está encontrada → línea más transparente y sin sombra fuerte
	if (isFound) {
	   ctx.globalAlpha = 0.3;          // transparencia ~55% visible
	   ctx.shadowBlur = 3.5;              // sombra muy suave
	   ctx.shadowColor = color;
	 } else {
	   ctx.globalAlpha = 0.35;           // selección en curso: opaca
	   ctx.shadowBlur = 10;
	   ctx.shadowColor = color;
	 }	

    ctx.beginPath();
    cellElements.forEach((el, idx) => {
      const rect = el.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      const x = rect.left - containerRect.left + rect.width / 2;
      const y = rect.top - containerRect.top + rect.height / 2;
      
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
	
	// Restauramos alpha para no afectar otros dibujos
    ctx.globalAlpha = 1.0;
	ctx.shadowBlur = 0;
  };

  useEffect(() => {
    generateGame();
  }, [level]);

  const cellSize = 
  level === 'facil'   ? 'w-14 h-14 text-2xl sm:text-3xl font-bold'
: level === 'medio'   ? 'w-12 h-12 text-xl sm:text-2xl font-bold'
:                       'w-10 h-10 text-lg sm:text-xl font-bold';



  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-purple-800 mb-2 flex items-center justify-center gap-2">
            <Heart className="text-pink-500" fill="currentColor" />
            Sopa de Zayda
            <Heart className="text-pink-500" fill="currentColor" />
          </h1>
          <div className="flex items-center justify-center gap-4 text-lg font-semibold text-purple-700">
            <span className="flex items-center gap-2">
              <Award className="text-yellow-500" />
              {foundWords.size} / {wordList.length} palabras
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-wrap gap-3 justify-center">
            {wordList.map(word => (
              <span
                key={word}
                className={`font-semibold text-lg sm:text-lg transition-all duration-300 mx-2 my-1 ${
                  foundWords.has(word)
                    ? 'text-green-600 line-through scale-105'
					: 'text-purple-800'
                }`}
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        <div className="relative mb-6 flex justify-center">
          <div 
            ref={containerRef}
            className="relative inline-block bg-white rounded-2xl shadow-2xl p-2"
            style={{ touchAction: 'none' }}
          >
            <table ref={gridRef} className="border-collapse">
              <tbody>
                {gridData.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {row.map((letter, colIdx) => (
                      <td
						key={`${rowIdx}-${colIdx}`}
						data-row={rowIdx}
						data-col={colIdx}
						className={`${cellSize} select-none cursor-pointer transition-all duration-150 text-center ${
						  isCellSelected(rowIdx, colIdx)
							? 'bg-blue-200 scale-110 shadow-lg text-blue-900 font-black'
							: 'bg-white hover:bg-purple-50 hover:scale-105'
						}`}
						style={{
						  verticalAlign: 'middle',
						  textAlign: 'center'
						}}
						onMouseDown={(e) => handleStart(e, rowIdx, colIdx)}
						onMouseEnter={(e) => handleMove(e, rowIdx, colIdx)}
						onMouseUp={handleEnd}
						onTouchStart={(e) => handleStart(e, rowIdx, colIdx)}
						onTouchMove={(e) => {
						  const touch = e.touches[0];
						  const element = document.elementFromPoint(touch.clientX, touch.clientY);
						  if (element && element.dataset.row) {
							handleMove(e, parseInt(element.dataset.row), parseInt(element.dataset.col));
						  }
						}}
						onTouchEnd={handleEnd}
					  > 
						{letter}
					  </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 pointer-events-none"
              style={{ zIndex: 10 }}
            />
            
            {particles.map(particle => (
              <div
                key={particle.id}
                className="absolute w-3 h-3 bg-yellow-400 rounded-full animate-ping pointer-events-none"
                style={{
                  left: `${(particle.col + 0.5) * (100 / gridSize)}%`,
                  top: `${(particle.row + 0.5) * (100 / gridSize)}%`,
                  zIndex: 20
                }}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-wrap gap-4 items-center justify-center">
            <div className="flex items-center gap-2">
              <label className="font-semibold text-purple-800">Nivel:</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="px-4 py-2 rounded-lg border-2 border-purple-300 bg-purple-50 font-semibold text-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="facil">Fácil</option>
                <option value="medio">Medio</option>
                <option value="dificil">Difícil</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="font-semibold text-purple-800">Sonido:</label>
              <select
                value={sound}
                onChange={(e) => setSound(e.target.value)}
                className="px-4 py-2 rounded-lg border-2 border-purple-300 bg-purple-50 font-semibold text-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="campana">Campanita alegre</option>
                <option value="aplausos">Aplausos suaves</option>
                <option value="melodia">Melodía alegre</option>
                <option value="estrella">Explosión de estrellas</option>
              </select>
            </div>

            <button
              onClick={generateGame}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              <RefreshCw size={20} />
              Siguiente juego
            </button>
          </div>
        </div>

        {celebrating && (
		  <div 
			className="fixed inset-0 flex items-center justify-center z-50 bg-black/40"  // fondo semi-transparente
			onClick={() => {
			  setCelebrating(false);
			  generateGame();  // siguiente juego al clic fuera o en botón
			}}
		  >
			<div 
			  className="bg-white rounded-3xl shadow-2xl p-12 text-center relative pointer-events-auto"
			  onClick={e => e.stopPropagation()}  // evita cerrar al clic dentro
			>
			  <Sparkles className="w-24 h-24 text-yellow-400 mx-auto mb-4" />
			  <h2 className="text-5xl font-bold text-purple-800 mb-4">¡Felicidades Zayda! 🎉</h2>
			  <p className="text-2xl text-pink-600 font-semibold mb-8">
				¡Encontraste todas las palabras!
			  </p>
			  
			  <button
				onClick={() => {
				  setCelebrating(false);
				  generateGame();
				}}
				className="px-10 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
			  >
				Siguiente Juego →
			  </button>
			</div>
		  </div>
		)}
      </div>
    </div>
  );
};

export default WordSearchGame;