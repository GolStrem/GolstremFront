import { TaskApi } from "@service";
import { useTranslation } from "react-i18next";

export default function useCardManager(workspaceId, boards, setBoards) {
  const { t } = useTranslation("workspace");

  const createOrUpdateCard = async (boardId, cardId, cardData) => {
    const { name, description } = cardData;
    if (!name?.trim()) return alert(t("workspace.cardNameRequired"));
    if (!description?.trim()) return alert(t("workspace.cardDescriptionRequired"));

    if (cardId) {
      try {
        const board = boards.find((b) => b.id === boardId);
        const currentCard = board?.cards.find((c) => c.id === cardId);
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
        console.error(t("workspace.errorUpdateCard"), err);
      }
    } else {
      try {
        const { data } = await TaskApi.createCard(workspaceId, boardId, { ...cardData });
        const [id, card] = Object.entries(data)[0];
        // si besoin : mettre à jour localement setBoards ici
      } catch (err) {
        console.error(t("workspace.errorCreateCard"), err);
      }
    }
  };

  const deleteCard = async (boardId, cardId) => {
    try {
      await TaskApi.deleteCard(workspaceId, boardId, cardId);
      // si besoin : mettre à jour localement setBoards ici
    } catch (err) {
      console.error(t("workspace.errorDeleteCard"), err);
    }
  };

  const dropCard = (sourceBoardId, targetBoardId, cardId, targetIndex) => {
    if (!sourceBoardId || !targetBoardId || !cardId) return;
    // logique DnD côté client si nécessaire
  };

  return {
    createOrUpdateCard,
    deleteCard,
    dropCard,
  };
}
