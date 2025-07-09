/**
 * Déplace une carte dans un autre tableau.
 * @param {Object} params
 * @param {Array} params.boards
 * @param {Function} params.setBoards
 * @param {string} params.workspaceId
 * @param {Object} params.event
 */
export const moveCardToOtherBoard = ({ boards, setBoards, workspaceId, event }) => {
  const { active, over } = event;
  if (!active?.id || !over?.id) return;

  const cardId = active.id;
  const overId = over.id;

  let sourceBoardIndex = null;
  let targetBoardIndex = null;
  let cardToMove = null;

  boards.forEach((board, boardIdx) => {
    const card = board.cards.find(c => c.id === cardId);
    if (card) {
      sourceBoardIndex = boardIdx;
      cardToMove = card;
    }

    if (board.id === overId || board.cards.some(c => c.id === overId)) {
      targetBoardIndex = boardIdx;
    }
  });

  if (!cardToMove || sourceBoardIndex === null || targetBoardIndex === null) return;
  if (sourceBoardIndex === targetBoardIndex) return;

  setBoards(prev => {
    const updated = [...prev];
    updated[sourceBoardIndex].cards = updated[sourceBoardIndex].cards.filter(c => c.id !== cardId);
    updated[targetBoardIndex].cards = [
      ...updated[targetBoardIndex].cards,
      cardToMove
    ];
    return updated;
  });
};


/**
 * Réorganise une carte dans le même tableau.
 * @param {Object} params
 * @param {Array} params.boards
 * @param {Function} params.setBoards
 * @param {Object} params.event
 */
export const reorderCardsInBoard = ({ boards, setBoards, event }) => {
  const { active, over } = event;
  if (!active?.id || !over?.id || active.id === over.id) return;

  const cardId = active.id;
  const overId = over.id;

  let boardIndex = null;
  let sourceIndex = null;
  let targetIndex = null;

  boards.forEach((board, bIdx) => {
    board.cards.forEach((card, cIdx) => {
      if (card.id === cardId) {
        boardIndex = bIdx;
        sourceIndex = cIdx;
      }
    });
  });

  if (boardIndex === null || sourceIndex === null) return;

  const cards = boards[boardIndex].cards;

  targetIndex = cards.findIndex(c => c.id === overId);

  if (targetIndex === -1) {
    targetIndex = cards.length - 1;
  }

  if (sourceIndex === targetIndex) return;

  setBoards(prev => {
    const updated = [...prev];
    const cards = [...updated[boardIndex].cards];
    const [moved] = cards.splice(sourceIndex, 1);
    cards.splice(targetIndex, 0, moved);
    updated[boardIndex].cards = cards;
    return updated;
  });
};
