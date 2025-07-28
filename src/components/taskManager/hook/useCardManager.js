import { TaskApi } from "@service";

export default function useCardManager(workspaceId, boards, setBoards) {

  const createOrUpdateCard = async (boardId, cardId, cardData) => {
    const { name, description } = cardData;
    if (!name?.trim()) return alert("Le nom est requis.");
    if (!description?.trim()) return alert("La description est requise.");

    if (cardId) {
      try {
        const board = boards.find(b => b.id === boardId);
        const currentCard = board?.cards.find(c => c.id === cardId);
        if (!currentCard) return;

        const updates = {};
        for (const key of Object.keys(cardData)) {
          if (cardData[key] !== currentCard[key]) updates[key] = cardData[key];
        }
        delete updates.boardId;
        delete updates.cardId;

        if (Object.keys(updates).length === 0) return;

        await TaskApi.editCard(workspaceId, boardId, cardId, updates);
      } catch (err) {
        console.error("Erreur mise à jour carte :", err);
      }
    } else {
      try {
        const { data } = await TaskApi.createCard(workspaceId, boardId, { ...cardData });
        const [id, card] = Object.entries(data)[0];
      } catch (err) {
        console.error("Erreur création carte :", err);
      }
    }
  };

  const deleteCard = async (boardId, cardId) => {
    try {
      await TaskApi.deleteCard(workspaceId, boardId, cardId);
    } catch (err) {
      console.error("Erreur suppression carte :", err);
    }
  };

  const dropCard = (sourceBoardId, targetBoardId, cardId, targetIndex) => {
    if (!sourceBoardId || !targetBoardId || !cardId) return;
  };

  return {
    createOrUpdateCard,
    deleteCard,
    dropCard,
  };
}
