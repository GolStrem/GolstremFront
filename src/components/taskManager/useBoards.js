import { useCallback, useEffect, useState } from "react";

const useBoards = (workspaceId) => {
  const [boards, setBoards] = useState([]);
  const [, setDraggingCardInfo] = useState(null);
  const [draggingBoardIndex, setDraggingBoardIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    boardId: null,
    cardId: null,
    card: null
  });
  const [showBoardModal, setShowBoardModal] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [columns, setColumns] = useState(3);

  const COLUMN_WIDTH = 340;
  const GUTTER = 16;

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem(`boards_${workspaceId}`)) || [{
      id: Date.now(),
      title: "Nouveau tableau",
      cards: []
    }];
    setBoards(saved);
  }, [workspaceId]);

  useEffect(() => {
    localStorage.setItem(`boards_${workspaceId}`, JSON.stringify(boards));
    localStorage.setItem("lastWorkspace", workspaceId);
  }, [boards, workspaceId]);

  const calculateColumns = useCallback(() => {
    const width = window.innerWidth - (sidebarVisible ? 300 : 0);
    const possible = Math.floor(width / (COLUMN_WIDTH + GUTTER));
    setColumns(Math.max(possible, 1));
  }, [sidebarVisible]);

  useEffect(() => {
    calculateColumns();
    window.addEventListener("resize", calculateColumns);
    return () => window.removeEventListener("resize", calculateColumns);
  }, [calculateColumns]);

  const openModal = (boardId, card = null) => {
    setModalData({
      boardId,
      cardId: card?.id || null,
      card: card || null
    });
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleCreateOrUpdateCard = (boardId, cardId, formData) => {
    if (!formData.name?.trim()) return alert("Le nom est requis.");
    if (!formData.description?.trim()) return alert("La description est requise.");

    const newCard = {
      ...formData,
      name: formData.name.trim(),
      description: formData.description.trim(),
    };

    setBoards((prevBoards) =>
      prevBoards.map((board) =>
        board.id === boardId
          ? {
              ...board,
              cards: cardId
                ? board.cards.map((card) =>
                    card.id === cardId ? { ...card, ...newCard } : card
                  )
                : [...board.cards, { id: Date.now(), ...newCard }]
            }
          : board
      )
    );

    closeModal();
  };

  const handleDeleteCard = (boardId, cardId) => {
    setBoards((prev) =>
      prev.map((board) =>
        board.id === boardId ? { ...board, cards: board.cards.filter((c) => c.id !== cardId) } : board
      )
    );
  };

  const handleUpdateBoard = (boardId, newTitle) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return alert("Le nom ne peut pas être vide !");
    setBoards((prev) =>
      prev.map((board) => (board.id === boardId ? { ...board, title: trimmed } : board))
    );
  };

  const handleDeleteBoard = (boardId) => {
    setBoards((prev) => prev.filter((board) => board.id !== boardId));
  };

  const handleCreateBoard = (title) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return alert("Le nom du tableau est requis.");
    const newBoard = { id: Date.now(), title: trimmedTitle, cards: [] };
    setBoards((prev) => [...prev, newBoard]);
  };

  const handleDrop = (sourceId, targetId, cardId, targetIndex) => {
    if (!sourceId || !targetId || !cardId) return;
    if (sourceId === targetId) {
      setBoards((prev) =>
        prev.map((b) => {
          if (b.id !== sourceId) return b;
          const updated = [...b.cards];
          const index = updated.findIndex((c) => c.id === cardId);
          const [moved] = updated.splice(index, 1);
          updated.splice(targetIndex, 0, moved);
          return { ...b, cards: updated };
        })
      );
    } else {
      setBoards((prev) =>
        prev.map((b) => {
          if (b.id === sourceId) return { ...b, cards: b.cards.filter((c) => c.id !== cardId) };
          if (b.id === targetId) {
            const card = boards.find((bb) => bb.id === sourceId)?.cards.find((c) => c.id === cardId);
            const updated = [...b.cards];
            if (card) updated.splice(targetIndex ?? updated.length, 0, card);
            return { ...b, cards: updated };
          }
          return b;
        })
      );
    }
    setDraggingCardInfo(null);
  };

  const onBoardDragStart = (e, index) => setDraggingBoardIndex(index);

  const onBoardDrop = (e, targetIndex) => {
    if (draggingBoardIndex === null || draggingBoardIndex === targetIndex) return;
    setBoards((prev) => {
      const newBoards = [...prev];
      const [moved] = newBoards.splice(draggingBoardIndex, 1);
      newBoards.splice(targetIndex, 0, moved);
      return newBoards;
    });
    setDraggingBoardIndex(null);
  };

  return {
    boards,
    setDraggingCardInfo,
    handleDrop,
    onBoardDragStart,
    onBoardDrop,
    handleUpdateBoard,
    handleDeleteBoard,
    openModal,
    showModal,
    modalData,
    closeModal,
    handleCreateOrUpdateCard,
    handleDeleteCard,
    showBoardModal,
    setShowBoardModal,
    handleCreateBoard,
    columns,
    sidebarVisible,
    setSidebarVisible
  };
};

export default useBoards;
