
export default function useSocketWorkspace() {

    const handleUpdateCard = (boards, cardUpdate) => {
        const cardId = Number(cardUpdate.id);
        const boardId = Number(cardUpdate.idTableau || cardUpdate.boardId);

        return boards.map((board) => {
            if (Number(board.id) !== boardId) return board;

            const updatedCards = board.cards.map((card) => {
            if (Number(card.id) !== cardId) return card;

            // Construction sécurisée de la nouvelle carte
            return {
                ...card,
                ...Object.entries(cardUpdate).reduce((acc, [key, value]) => {
                if (value !== undefined && value !== null) {
                    acc[key] = value;
                }
                return acc;
                }, {})
            };
            });

            return {
            ...board,
            cards: updatedCards
            };
        });
    };

    const handleCreateCard = (boards, cardData, droit) => {
        const droitUse = Number(localStorage.getItem("id")) === Number(cardData.idOwner) ? 'owner' : droit;
        const boardId = Number(cardData.idTableau || cardData.boardId);
        const newCard = {
            id: Number(cardData.id),
            name: cardData.name || "Sans nom",
            description: cardData.description || "",
            idOwner: cardData.idOwner || null,
            color: cardData.color || "#ffffff",
            image: cardData.image || "",
            state: cardData.state || 0,
            createdAt: cardData.createdAt || new Date().toISOString(),
            endAt: cardData.endAt || null,
            droit: cardData.droit || droitUse,
        };

        return boards.map((board) => {
            if (board.id !== boardId) return board;

            return {
            ...board,
            cards: [...board.cards, newCard],
            };
        });
    };

    const handleDeleteCard = (boards, cardToDelete) => {
        const cardId = Number(cardToDelete.id);

        return boards.map((board) => {
            const filteredCards = (board.cards || []).filter(
            (card) => Number(card.id) !== cardId
            );

            if (filteredCards.length === board.cards.length) return board;

            return {
            ...board,
            cards: filteredCards,
            };
        });
    };

    const handleMoveCard = (boards, moveData) => {

        const allCards = new Map();
        boards.forEach(board => {
            board.cards.forEach(card => {
            allCards.set(Number(card.id), card);
            });
        });

        const updatedBoards = boards.map((board) => {
            const boardIdStr = String(board.id);
            const moveEntries = moveData[boardIdStr];

            if (!moveEntries) {
            return {
                ...board,
                cards: board.cards.filter(card => {

                return !Object.values(moveData)
                    .flat()
                    .some(moved => Number(moved.id) === Number(card.id));
                }),
            };
        }


        const sortedCards = moveEntries
        .sort((a, b) => a.pos - b.pos)
        .map(entry => allCards.get(Number(entry.id)))
        .filter(Boolean); 

        return {
        ...board,
        cards: sortedCards,
        };
    });

    return updatedBoards;
    };

    const handleMoveTableau = (boards, moveData) => {
        const oldPos = parseInt(moveData.oldPos, 10);
        const newPos = parseInt(moveData.newPos, 10);

        if (oldPos === newPos) return boards;

        const updated = [...boards];
        const [moved] = updated.splice(oldPos, 1);
        updated.splice(newPos, 0, moved);

        return updated;
    };


    const handleCreateBoard = (boards, boardData, droit) => {
        const newBoard = {
            id: Number(boardData.id),
            name: boardData.name || "Sans nom",
            color: boardData.color || "#999999",
            image: boardData.image || null,
            cards: [], 
            droit: droit, 
            createdAt: boardData.createdAt || new Date().toISOString(),
        };

        return [...boards, newBoard];
    };

    const handleUpdateBoard = (boards, boardUpdate) => {
        const boardId = Number(boardUpdate.id);

        return boards.map((board) => {
            if (board.id !== boardId) return board;

            // Mise à jour du tableau avec fallback pour les champs manquants
            return {
            ...{
                id: board.id,
                name: board.name || "Sans nom",
                color: board.color || "#999999",
                image: board.image || null,
                cards: board.cards || [],
                droit: board.droit || "read",
                createdAt: board.createdAt || new Date().toISOString(),
            },
            ...boardUpdate,
            };
        });
    };

    const handleDeleteBoard = (boards, deleteData) => {
        const boardId = Number(deleteData.id);

        return boards.filter((board) => Number(board.id) !== boardId);
    };


    return{ handleUpdateCard, handleCreateCard, handleDeleteCard, handleMoveCard, handleMoveTableau, handleCreateBoard, handleUpdateBoard, handleDeleteBoard};
}


