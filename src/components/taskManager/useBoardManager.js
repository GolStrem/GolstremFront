import { useState, useEffect } from "react";
import TaskApi from "@service/TaskApi";


export default function useBoardManager(workspaceId) {
  const [boards, setBoards] = useState([]);
  const [draggingBoardIndex, setDraggingBoardIndex] = useState(null);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const { data } = await TaskApi.getWorkspaceDetail(workspaceId);

        const boardsArray = (data?.tableau || []).map(b => ({
          id: b.id,
          name: b.name,
          color: b.color,
          image: b.image,
          createdAt: b.createdAt,
          cards: b.card || []
        }));
        setBoards(boardsArray);
      } catch (err) {
        console.error("Erreur lors du chargement des boards :", err);
      }
    };

    fetchBoards();
  }, [workspaceId]);


  const createBoard = async ({ name, color }) => {
    const trimmed = (name || "").trim();

    try {
      const payload = { name: trimmed, color };
      const { data } = await TaskApi.createTableau(workspaceId, payload);

      const [id, board] = Object.entries(data)[0];
      setBoards(prev => [
        ...prev,
        { id, name: board.name, color: board.color, cards: [] }
      ]);
    } catch (err) {
      console.error("Erreur lors de la création d’un board :", err);
    }
  };

  const updateBoard = async (boardId, newTitle) => {
    const trimmed = (newTitle || "").trim();
    if (!trimmed) {
      alert("Le nom ne peut pas être vide !");
      return;
    }
    try {
      await TaskApi.editTableau(workspaceId, boardId, { name: trimmed });
      setBoards(prev =>
        prev.map(board =>
          board.id === boardId ? { ...board, name: trimmed } : board
        )
      );
    } catch (err) {
      console.error("Erreur lors de la mise à jour d’un board :", err);
    }
  };

  const deleteBoard = async boardId => {
    try {
      await TaskApi.deleteTableau(workspaceId, boardId);
      setBoards(prev => prev.filter(board => board.id !== boardId));
    } catch (err) {
      console.error("Erreur lors de la suppression d’un board :", err);
    }
  };

  const dragStartBoard = index => setDraggingBoardIndex(index);

  const dropBoard = async targetIndex => {
    if (draggingBoardIndex === null || draggingBoardIndex === targetIndex) return;

    try {
      const idTableau = boards[draggingBoardIndex].id;

      const payload = {
        oldPos: String(draggingBoardIndex),
        newPos: String(targetIndex),
        idTableau
      };

      await TaskApi.moveTableau(workspaceId, payload);

      setBoards(prevBoards => {
        const newBoards = [...prevBoards];
        const [movedBoard] = newBoards.splice(draggingBoardIndex, 1);
        newBoards.splice(targetIndex, 0, movedBoard);
        return newBoards;
      });
    } catch (err) {
      console.error("Erreur lors du déplacement du tableau :", err);
    }

    setDraggingBoardIndex(null);
  };

  const createOrUpdateCard = async (boardId, cardId, cardData) => {
    const { name, description } = cardData;

    if (!name?.trim()) {
      alert("Le nom est requis.");
      return;
    }
    if (!description?.trim()) {
      alert("La description est requise.");
      return;
    }

    if (cardId) {
      try {
        // 🔍 On trouve la carte actuelle
        const board = boards.find(b => b.id === boardId);
        const currentCard = board?.cards.find(c => c.id === cardId);

        if (!currentCard) {
          console.error("Carte introuvable pour mise à jour");
          return;
        }

        // 🧾 On calcule les champs modifiés
        const updates = {};
        for (const key of Object.keys(cardData)) {
          if (cardData[key] !== currentCard[key]) {
            updates[key] = cardData[key];
          }
        }

        if (Object.keys(updates).length === 0) {
          console.log("Aucun champ modifié");
          return;
        }
        delete updates.boardId
        delete updates.cardId

        await TaskApi.editCard(workspaceId, boardId, cardId, updates);
        setBoards(prev =>
          prev.map(board =>
            board.id === boardId
              ? {
                  ...board,
                  cards: board.cards.map(c =>
                    c.id === cardId ? { ...c, ...updates } : c
                  )
                }
              : board
          )
        );
      } catch (err) {
        console.error("Erreur lors de la mise à jour de la carte :", err);
      }
    } else {
      try {
        const { data } = await TaskApi.createCard(workspaceId, boardId, { ...cardData });
        const [id, card] = Object.entries(data)[0];

        setBoards(prev =>
          prev.map(board =>
            board.id === boardId
              ? {
                  ...board,
                  cards: [...board.cards, { id, ...card }]
                }
              : board
          )
        );
      } catch (err) {
        console.error("Erreur lors de la création de la carte :", err);
      }
    }
  };

  const deleteCard = async (boardId, cardId) => {
    try {
      await TaskApi.deleteCard(workspaceId, boardId, cardId);
      setBoards(prev =>
        prev.map(board =>
          board.id === boardId
            ? { ...board, cards: board.cards.filter(c => c.id !== cardId) }
            : board
        )
      );
    } catch (err) {
      console.error("Erreur lors de la suppression de la carte :", err);
    }
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
