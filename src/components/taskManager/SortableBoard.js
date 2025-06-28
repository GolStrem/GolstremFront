import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import  SortableItem  from "./SortableItem";

const SortableBoard = () => {
  const [cards, setCards] = useState([
    { id: "card-1", text: "🟡 Tâche 1" },
    { id: "card-2", text: "🔵 Tâche 2" },
    { id: "card-3", text: "🟢 Tâche 3" },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = cards.findIndex((c) => c.id === active.id);
      const newIndex = cards.findIndex((c) => c.id === over.id);
      setCards(arrayMove(cards, oldIndex, newIndex));
    }
  };

  return (
    <div className="board-container">
      <h2>🧩 Tableau B&B</h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <SortableItem key={card.id} id={card.id} text={card.text} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default SortableBoard;
