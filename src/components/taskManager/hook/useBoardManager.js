import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { TaskApi, UserInfo } from "@service";

export default function useBoardManager(workspaceId) {
  const { t } = useTranslation("workspace");

  const [boards, setBoards] = useState([]);
  const [draggingBoardIndex, setDraggingBoardIndex] = useState(null);
  const [droit, setDroit] = useState(null);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const { data } = await TaskApi.getWorkspaceDetail(workspaceId);
        const userId = await UserInfo.getId();

        const computedDroit =
          String(data.idOwner) === String(userId)
            ? "owner"
            : data.user.find((user) => String(user.id) === String(userId))?.state || null;

        setDroit(computedDroit);

        data.tableau.forEach((table) => {
          table.card.forEach((card) => {
            card.droit = String(card.idOwner) === String(userId) ? "owner" : computedDroit;
          });
        });

        const boardsArray = (data?.tableau || []).map((b) => ({
          id: b.id,
          name: b.name,
          color: b.color,
          image: b.image,
          createdAt: b.createdAt,
          droit: computedDroit,
          cards: b.card || []
        }));

        setBoards(boardsArray);
      } catch (err) {
        console.error(t("workspace.errorLoadBoards"), err);
      }
    };
    fetchBoards();
  }, [workspaceId, t]);

  const createBoard = async ({ name, color }) => {
    const trimmed = (name || "").trim();
    try {
      const payload = { name: trimmed, color };
      await TaskApi.createTableau(workspaceId, payload);
    } catch (err) {
      console.error(t("workspace.errorCreateBoard"), err);
    }
  };

  const updateBoard = async (boardId, newTitle) => {
    const trimmed = (newTitle || "").trim();
    if (!trimmed) return alert(t("workspace.errorEmptyBoardName"));
    try {
      await TaskApi.editTableau(workspaceId, boardId, { name: trimmed });
    } catch (err) {
      console.error(t("workspace.errorUpdateBoard"), err);
    }
  };

  const deleteBoard = async (boardId) => {
    try {
      await TaskApi.deleteTableau(workspaceId, boardId);
    } catch (err) {
      console.error(t("workspace.errorDeleteBoard"), err);
    }
  };

  const dragStartBoard = (index) => setDraggingBoardIndex(index);

  const dropBoard = async (targetIndex) => {
    if (draggingBoardIndex === null || draggingBoardIndex === targetIndex) return;

    try {
      const idTableau = boards[draggingBoardIndex].id;
      const payload = {
        oldPos: String(draggingBoardIndex),
        newPos: String(targetIndex),
        idTableau
      };
      await TaskApi.moveTableau(workspaceId, payload);
    } catch (err) {
      console.error(t("workspace.errorMoveBoard"), err);
    }

    setDraggingBoardIndex(null);
  };

  return {
    boards,
    setBoards,
    createBoard,
    deleteBoard,
    updateBoard,
    dragStartBoard,
    dropBoard,
    droit
  };
}
