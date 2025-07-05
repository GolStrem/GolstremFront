import { useState, useEffect } from "react";
import { TaskApi } from "@service";

export default function useCardManager(workspaceId) {

    const [boards, setBoards] = useState([]);

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
        const board = boards.find((b) => b.id === boardId);
        const currentCard = board?.cards.find((c) => c.id === cardId);

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
        delete updates.boardId;
        delete updates.cardId;

        await TaskApi.editCard(workspaceId, boardId, cardId, updates);
        setBoards((prev) =>
          prev.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  cards: board.cards.map((c) =>
                    c.id === cardId ? { ...c, ...updates } : c
                  ),
                }
              : board
          )
        );
      } catch (err) {
        console.error("Erreur lors de la mise à jour de la carte :", err);
      }
    } else {
      try {
        const { data } = await TaskApi.createCard(workspaceId, boardId, {
          ...cardData,
        });
        const [id, card] = Object.entries(data)[0];

        setBoards((prev) =>
          prev.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  cards: [...board.cards, { id, ...card }],
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
      setBoards((prev) =>
        prev.map((board) =>
          board.id === boardId
            ? { ...board, cards: board.cards.filter((c) => c.id !== cardId) }
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
          const cardIndex = updatedCards.findIndex(
            (card) => card.id === cardId
          );
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
              updatedCards.splice(
                targetIndex ?? updatedCards.length,
                0,
                draggedCard
              );
            }
            return { ...board, cards: updatedCards };
          }
          return board;
        });
      });
    }
  };


  return{
    createOrUpdateCard,
    deleteCard,
    dropCard
  }
}
