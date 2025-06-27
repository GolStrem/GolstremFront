const TaskCard = ({ card, index, boardId, handleDrop, setDraggingCardInfo, openModal }) => {
  const handleCardDrop = (e) => {
    e.preventDefault();
    handleDrop(e, index);
  };

  return (
    <div
      className="task-card"
      draggable
      style={{ backgroundColor: card.color || "#ffffff" }}
      onDragStart={(e) => {
        e.dataTransfer.setData("draggingCard", JSON.stringify({ ...card, sourceBoardId: boardId }));
        setDraggingCardInfo({ card, sourceBoardId: boardId, sourceIndex: index });
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleCardDrop}
    >
      <div className="task-header">
        <h4>{card.name}</h4>
        <span className={`task-state state-${card.state}`}>{getStateLabel(card.state)}</span>
      </div>
      <p>{card.description}</p>
      {card.image && <img src={card.image} alt="task" className="task-image" />}
      {card.endAt && <p className="task-deadline">📅 {formatDate(card.endAt)}</p>}

      <div className="task-actions">
        <button className="edit-btn" onClick={() => openModal(boardId, card)}>✏️</button>
      </div>
    </div>
  );
};

const getStateLabel = (state) => {
  switch (state) {
    case 0: return "À faire";
    case 1: return "En cours";
    case 2: return "En attente";
    case 3: return "Fait";
    default: return "Inconnu";
  }
};

const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

export default TaskCard;
