import { useState, useEffect } from "react";
import { TaskApi } from "@service";

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
    if (!trimmed) return alert("Le nom ne peut pas être vide !");
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

  return {
    boards,
    setBoards, // <--- expose aussi setBoards pour le hook des cartes
    createBoard,
    deleteBoard,
    updateBoard,
    dragStartBoard,
    dropBoard,
  };
}
