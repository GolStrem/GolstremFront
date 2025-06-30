import { useState, useEffect, useCallback } from "react";

const loadBoardsFromStorage = (workspaceId) => {
  const data = localStorage.getItem(`boards_${workspaceId}`);
  return data ? JSON.parse(data) : [];
};

const saveBoardsToStorage = (workspaceId, boards) => {
  localStorage.setItem(`boards_${workspaceId}`, JSON.stringify(boards));
};

export default function useBoardManager(workspaceId) {
  const [boards, setBoards] = useState([]);
  const [draggingBoardIndex, setDraggingBoardIndex] = useState(null);

  useEffect(() => {
    const saved = loadBoardsFromStorage(workspaceId);
    setBoards(
      saved.length > 0
        ? saved
        : [{ id: Date.now(), title: "Nouveau tableau", cards: [] }]
    );
  }, [workspaceId]);

  useEffect(() => {
    saveBoardsToStorage(workspaceId, boards);
    localStorage.setItem("lastWorkspace", workspaceId);
  }, [boards, workspaceId]);

  const createOrUpdateCard = (boardId, cardId, cardData) => {
    const { name, description } = cardData;
    if (typeof name !== "string" || !name.trim()) return alert("Le nom est requis.");
    if (typeof description !== "string" || !description.trim()) return alert("La description est requise.");

    setBoards((prevBoards) =>
      prevBoards.map((board) => {
        if (board.id !== boardId) return board;
        if (cardId) {
          return {
            ...board,
            cards: board.cards.map((c) => (c.id === cardId ? { ...c, ...cardData } : c)),
          };
        } else {
          return {
            ...board,
            cards: [
              ...board.cards,
              {
                ...cardData,
                id: `card-${Date.now()}`,
                createdAt: new Date().toISOString().split("T")[0],
              },
            ],
          };
        }
      })
    );
  };

  const deleteCard = (boardId, cardId) => {
    setBoards((prevBoards) =>
      prevBoards.map((board) =>
        board.id === boardId
          ? { ...board, cards: board.cards.filter((card) => card.id !== cardId) }
          : board
      )
    );
  };

  const updateBoard = (boardId, newTitle) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return alert("Le nom ne peut pas être vide !");
    setBoards((prev) =>
      prev.map((board) =>
        board.id === boardId ? { ...board, title: trimmed } : board
      )
    );
  };

  const deleteBoard = (boardId) => {
    setBoards((prev) => prev.filter((board) => board.id !== boardId));
  };

  const createBoard = (title) => {
    const trimmed = title.trim();
    if (!trimmed) return alert("Le nom du tableau est requis.");
    setBoards((prev) => [...prev, { id: Date.now(), title: trimmed, cards: [] }]);
  };

  const dropCard = (sourceBoardId, targetBoardId, cardId, targetIndex) => {
    if (!sourceBoardId || !targetBoardId || !cardId) return;

    if (sourceBoardId === targetBoardId) {
      setBoards((prevBoards) =>
        prevBoards.map((board) => {
          if (board.id !== sourceBoardId) return board;
          const updatedCards = [...board.cards];
          const cardIndex = updatedCards.findIndex((card) => card.id === cardId);
          if (cardIndex === -1 || cardIndex === targetIndex) return board;
          const [movedCard] = updatedCards.splice(cardIndex, 1);
          updatedCards.splice(targetIndex, 0, movedCard);
          return { ...board, cards: updatedCards };
        })
      );
    } else {
      setBoards((prevBoards) => {
        const draggedCard = prevBoards
          .find((b) => b.id === sourceBoardId)
          ?.cards.find((card) => card.id === cardId);

        return prevBoards.map((board) => {
          if (board.id === sourceBoardId) {
            return {
              ...board,
              cards: board.cards.filter((card) => card.id !== cardId),
            };
          }
          if (board.id === targetBoardId) {
            const updatedCards = [...board.cards];
            if (draggedCard) {
              updatedCards.splice(targetIndex ?? updatedCards.length, 0, draggedCard);
            }
            return { ...board, cards: updatedCards };
          }
          return board;
        });
      });
    }
  };

  const dragStartBoard = (index) => setDraggingBoardIndex(index);

  const dropBoard = (targetIndex) => {
    if (draggingBoardIndex === null || draggingBoardIndex === targetIndex) return;
    setBoards((prevBoards) => {
      const newBoards = [...prevBoards];
      const [movedBoard] = newBoards.splice(draggingBoardIndex, 1);
      newBoards.splice(targetIndex, 0, movedBoard);
      return newBoards;
    });
    setDraggingBoardIndex(null);
  };

  return {
    boards,
    createBoard,
    deleteBoard,
    updateBoard,
    createOrUpdateCard,
    deleteCard,
    dropCard,
    dragStartBoard,
    dropBoard,
  };
}
